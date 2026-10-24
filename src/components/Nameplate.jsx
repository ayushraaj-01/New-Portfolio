import { useCallback, useEffect, useRef } from 'react'

const TEXT = 'AYUSH RAJ'
const MAX_PARTICLES = 4200
const GRAVITY = 1500
const RESTITUTION = 0.45

const reduceMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * The nameplate from saiaryan.in, taken further: the name is drawn once to an
 * offscreen canvas, sampled into ~4k particles, and drawn as a bold name that
 * bursts into its own pieces when you click it — then pulls itself back
 * together. All state lives in refs; nothing re-renders per frame.
 */
export default function Nameplate() {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const rafRef = useRef(0)
  const modeRef = useRef('idle')
  const resetTimerRef = useRef(0)
  const resizeTimerRef = useRef(0)
  const colorsRef = useRef({ base: '247, 243, 234', accent: '251, 191, 36' })
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 })
  const lastRef = useRef(0)

  const setMode = useCallback((mode) => {
    modeRef.current = mode
    const canvas = canvasRef.current
    if (canvas) canvas.dataset.state = mode
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { dpr } = sizeRef.current
    const { base, accent } = colorsRef.current
    const particles = particlesRef.current

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, sizeRef.current.w, sizeRef.current.h)

    // Two passes so fillStyle is set twice per frame instead of per particle.
    for (const wantAccent of [false, true]) {
      ctx.fillStyle = `rgb(${wantAccent ? accent : base})`
      for (const p of particles) {
        if (p.accent !== wantAccent) continue
        ctx.globalAlpha = p.alpha
        ctx.fillRect(p.x, p.y, p.size, p.size)
      }
    }
    ctx.globalAlpha = 1
  }, [])

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    // Clear the id, or the next start() thinks a loop is still running and
    // the name freezes half-assembled (StrictMode double-mounts hit this).
    rafRef.current = 0
  }, [])

  const loopRef = useRef(() => {})
  const tick = useCallback((now) => {
    loopRef.current(now)
  }, [])
  loopRef.current = (now) => {
    const dt = Math.min((now - (lastRef.current || now)) / 1000, 1 / 30)
    lastRef.current = now
    const { w, h } = sizeRef.current
    const particles = particlesRef.current
    const mode = modeRef.current

    if (mode === 'scatter') {
      for (const p of particles) {
        p.vy += GRAVITY * dt
        p.vx *= 0.995
        p.x += p.vx * dt
        p.y += p.vy * dt

        if (p.y > h - p.size) {
          p.y = h - p.size
          p.vy = Math.abs(p.vy) > 60 ? -p.vy * RESTITUTION : 0
          p.vx *= 0.82
        }
        if (p.x < 0) {
          p.x = 0
          p.vx = Math.abs(p.vx) * 0.35
        } else if (p.x > w - p.size) {
          p.x = w - p.size
          p.vx = -Math.abs(p.vx) * 0.35
        }
      }
      draw()

      // Settled on the floor → start pulling itself back together.
      const settling = particles.every(
        (p) => p.y >= h - p.size - 1 && Math.abs(p.vx) < 40 && Math.abs(p.vy) < 90
      )
      if (settling) setMode('return')
    } else if (mode === 'return' || mode === 'assemble') {
      let arrived = true
      for (const p of particles) {
        const dx = p.homeX - p.x
        const dy = p.homeY - p.y
        if (Math.abs(dx) + Math.abs(dy) > 0.7) arrived = false
        p.vx = (p.vx + dx * 90 * dt) * 0.86
        p.vy = (p.vy + dy * 90 * dt) * 0.86
        p.x += p.vx * dt
        p.y += p.vy * dt
      }
      draw()
      if (arrived) {
        for (const p of particles) {
          p.x = p.homeX
          p.y = p.homeY
          p.vx = 0
          p.vy = 0
        }
        draw()
        setMode('idle')
        stop()
        return
      }
    }

    rafRef.current = requestAnimationFrame(tick)
  }

  const start = useCallback(() => {
    if (rafRef.current) return
    lastRef.current = performance.now()
    rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  // Build the particle cloud from the rendered name.
  const build = useCallback((animateIn = true) => {
    const canvas = canvasRef.current
    if (!canvas || !canvas.isConnected) return
    const rect = canvas.getBoundingClientRect()
    const w = Math.max(1, Math.round(rect.width))
    const h = Math.max(1, Math.round(rect.height))
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    sizeRef.current = { w, h, dpr }

    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)

    const isLight = document.documentElement.getAttribute('data-theme') === 'light'
    colorsRef.current = {
      base: isLight ? '28, 26, 46' : '247, 243, 234',
      accent: isLight ? '180, 83, 9' : '251, 191, 36',
    }

    const family =
      getComputedStyle(document.documentElement).getPropertyValue('--font-display').trim() ||
      'sans-serif'

    const off = document.createElement('canvas')
    off.width = w
    off.height = h
    const octx = off.getContext('2d')

    // Fit the bold name to the band, then let the height cap it.
    let fontSize = 240
    octx.font = `800 ${fontSize}px ${family}`
    const measured = octx.measureText(TEXT).width || 1
    fontSize = Math.max(28, Math.floor(fontSize * ((w * 0.92) / measured)))
    fontSize = Math.min(fontSize, Math.floor(h * 0.6))

    octx.clearRect(0, 0, w, h)
    octx.font = `800 ${fontSize}px ${family}`
    octx.textAlign = 'center'
    octx.textBaseline = 'middle'
    octx.fillStyle = '#ffffff'
    octx.fillText(TEXT, w / 2, h / 2)

    const data = octx.getImageData(0, 0, w, h).data
    const step = Math.max(2, Math.round(Math.sqrt((w * h) / (MAX_PARTICLES * 3))))
    const targets = []
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        if (data[(y * w + x) * 4 + 3] > 130) {
          targets.push({ x: x + step / 2, y: y + step / 2 })
        }
      }
    }

    // Thin the cloud down to budget without losing the silhouette.
    const stride = Math.max(1, Math.ceil(targets.length / MAX_PARTICLES))
    const particles = []
    for (let i = 0; i < targets.length; i += stride) {
      const t = targets[i]
      particles.push({
        homeX: t.x,
        homeY: t.y,
        x: animateIn ? Math.random() * w : t.x,
        y: animateIn ? Math.random() * h : t.y,
        vx: 0,
        vy: 0,
        size: Math.max(1.1, step * 0.62),
        alpha: 0.55 + Math.random() * 0.45,
        accent: Math.random() < 0.16,
      })
    }
    particlesRef.current = particles
    canvas.dataset.particles = String(particles.length)

    setMode(animateIn ? 'assemble' : 'idle')
    if (animateIn) start()
    else draw()
  }, [draw, setMode, start])

  // Burst every particle away from a point.
  const burst = useCallback((ox, oy) => {
    if (reduceMotion()) return
    const particles = particlesRef.current
    if (!particles.length) return

    for (const p of particles) {
      const dx = p.x - ox
      const dy = p.y - oy
      const dist = Math.hypot(dx, dy) || 1
      const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.9
      const speed = 380 + Math.random() * 900
      p.vx = Math.cos(angle) * speed + (dx / dist) * 120
      p.vy = Math.sin(angle) * speed - 340 - Math.random() * 260
    }

    setMode('scatter')
    start()

    // If it never fully settles, pull it home anyway.
    clearTimeout(resetTimerRef.current)
    resetTimerRef.current = window.setTimeout(() => {
      if (modeRef.current === 'scatter') setMode('return')
    }, 4000)
  }, [setMode, start])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const boot = () => build(!reduceMotion())
    if (document.fonts?.ready) document.fonts.ready.then(boot)
    else boot()

    const onResize = () => {
      clearTimeout(resizeTimerRef.current)
      resizeTimerRef.current = window.setTimeout(() => build(false), 180)
    }
    window.addEventListener('resize', onResize)

    // Theme swaps change the ink colour; rebuild picks up the new variables.
    const observer = new MutationObserver(() => build(false))
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    return () => {
      window.removeEventListener('resize', onResize)
      clearTimeout(resizeTimerRef.current)
      clearTimeout(resetTimerRef.current)
      observer.disconnect()
      stop()
    }
  }, [build, stop])

  const handlePointer = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    // Keyboard activation reports no coordinates — burst from the centre.
    const isKeyboard = e.detail === 0
    const x = isKeyboard ? rect.width / 2 : e.clientX - rect.left
    const y = isKeyboard ? rect.height / 2 : e.clientY - rect.top
    burst(x, y)
  }

  return (
    <section className="nameplate" aria-label="Nameplate">
      <div className="nameplate-inner">
        <span className="section-label nameplate-label">Signature</span>

        <button
          type="button"
          className="nameplate-btn"
          onClick={handlePointer}
          aria-label="Ayush Raj — click to scatter the name"
        >
          <canvas ref={canvasRef} className="nameplate-canvas" aria-hidden="true" />
        </button>

        <span className="nameplate-hint" aria-hidden="true">
          Click the name — it scatters, then sets itself again
        </span>
      </div>
    </section>
  )
}
