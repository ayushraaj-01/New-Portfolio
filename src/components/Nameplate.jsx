import { useCallback, useEffect, useRef } from 'react'
import { playFall, playLand } from '../services/fallSound'

const TEXT = 'AYUSH RAJ'
const MAX_PARTICLES = 4200
const GRAVITY = 1500
const RESTITUTION = 0.45

// The name is built out of micro letters (a, b, c …) rather than squares.
// Only x-height letters: no ascenders, descenders or dots, so every glyph sits
// on the same baseline and the name reads cleanly instead of looking like a
// ransom note.
const GLYPHS = 'acemnorsuvwxz'

// Hover bulge: letters inside this radius slide outward and swell, so the name
// dents around the cursor like a lens.
const BULGE_RADIUS = 96
const BULGE_STRENGTH = 30

/**
 * Pre-renders every micro letter, in both ink colours, into small offscreen
 * canvases. Tinting a glyph per particle would otherwise need a fillText call
 * per particle per frame; drawImage from this atlas is far cheaper.
 */
function makeGlyphAtlas(cell, dpr, family, colors) {
  const px = Math.max(4, Math.round(cell * dpr))
  const build = (rgb) =>
    GLYPHS.split('').map((char) => {
      const glyph = document.createElement('canvas')
      glyph.width = px
      glyph.height = px
      const g = glyph.getContext('2d')
      g.font = `600 ${Math.round(px * 0.88)}px ${family}`
      g.textAlign = 'center'
      g.textBaseline = 'middle'
      g.fillStyle = `rgb(${rgb})`
      // Nudge down slightly — lowercase letters sit below the optical centre.
      g.fillText(char, px / 2, px * 0.54)
      return glyph
    })

  return { base: build(colors.base), accent: build(colors.accent) }
}

const reduceMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * The nameplate from saiaryan.in, taken further: the name is drawn once to an
 * offscreen canvas, sampled into ~4k particles, and drops in letter by letter.
 * Click it and the letters simply let go and fall to the floor of the band —
 * with a synthesised rustle and thud — then pull themselves back together.
 * All state lives in refs; nothing re-renders per frame.
 */
export default function Nameplate() {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const rafRef = useRef(0)
  const modeRef = useRef('idle')
  const resetTimerRef = useRef(0)
  const resizeTimerRef = useRef(0)
  const colorsRef = useRef({ base: '243, 238, 228', accent: '201, 192, 174' })
  const atlasRef = useRef({ cell: 0, base: null, accent: null })
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 })
  const pointerRef = useRef({ x: 0, y: 0, active: false })
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

    const atlas = atlasRef.current

    // Two passes so the ink colour is resolved twice per frame, not per particle.
    for (const wantAccent of [false, true]) {
      const glyphs = wantAccent ? atlas.accent : atlas.base

      if (glyphs) {
        for (const p of particles) {
          if (p.accent !== wantAccent) continue
          // Bulged letters grow a little, which reads as a lens over the name.
          const size = atlas.cell * p.s
          ctx.globalAlpha = p.alpha
          ctx.drawImage(glyphs[p.gi], p.x - size / 2, p.y - size / 2, size, size)
        }
        continue
      }

      // Fallback (atlas not built yet): plain squares, as before.
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

    if (mode === 'fall') {
      // Entrance: the letters drop in from above the band and each one lands on
      // its own spot in the name. Pure gravity — nothing flies outward.
      let landed = true
      for (const p of particles) {
        if (p.resting) continue
        landed = false
        p.vy += GRAVITY * dt
        p.y += p.vy * dt
        // Drift back over the slot on the way down so the name still reads.
        p.x += (p.homeX - p.x) * Math.min(1, dt * 5)

        if (p.y >= p.homeY) {
          p.y = p.homeY
          p.x = p.homeX
          if (Math.abs(p.vy) > 240) p.vy = -p.vy * 0.18
          else {
            p.vy = 0
            p.resting = true
          }
        }
      }
      draw()

      if (landed) {
        setMode('idle')
        stop()
        return
      }
    } else if (mode === 'drop') {
      // Click: every letter lets go of the name and falls straight to the floor
      // of the band, then the name gathers itself again.
      let resting = true
      for (const p of particles) {
        if (p.resting) continue
        resting = false
        p.vy += GRAVITY * dt
        p.x += p.vx * dt
        p.y += p.vy * dt

        const floor = h - p.size
        if (p.y >= floor) {
          p.y = floor
          p.x = Math.min(Math.max(p.x, p.size / 2), w - p.size / 2)
          if (Math.abs(p.vy) > 90) {
            p.vy = -p.vy * RESTITUTION
          } else {
            p.vy = 0
            p.vx *= 0.7
            if (Math.abs(p.vx) < 8) {
              p.vx = 0
              p.resting = true
            }
          }
        }
      }
      draw()

      if (resting) {
        playLand()
        setMode('return')
      }
    } else if (mode === 'return') {
      // Exponential ease home: snappy, frame-rate independent and overshoot-free,
      // instead of the old spring that took seconds to settle.
      const k = Math.min(1, dt * 11)
      let arrived = true
      for (const p of particles) {
        const dx = p.homeX - p.x
        const dy = p.homeY - p.y
        if (Math.abs(dx) + Math.abs(dy) > 0.5) arrived = false
        p.x += dx * k
        p.y += dy * k
        p.vx = 0
        p.vy = 0
        p.s += (1 - p.s) * k
      }
      draw()
      if (arrived) {
        for (const p of particles) {
          p.x = p.homeX
          p.y = p.homeY
          p.s = 1
        }
        draw()
        setMode('idle')
        stop()
        return
      }
    } else if (mode === 'bulge') {
      const pointer = pointerRef.current
      const k = Math.min(1, dt * 18)
      let settled = true

      for (const p of particles) {
        let tx = p.homeX
        let ty = p.homeY
        let scale = 1

        if (pointer.active) {
          const dx = p.homeX - pointer.x
          const dy = p.homeY - pointer.y
          const dist = Math.hypot(dx, dy)
          if (dist < BULGE_RADIUS && dist > 0.001) {
            const t = 1 - dist / BULGE_RADIUS
            const push = t * t * BULGE_STRENGTH
            tx += (dx / dist) * push
            ty += (dy / dist) * push
            scale = 1 + t * 0.6
          }
        }

        const ddx = tx - p.x
        const ddy = ty - p.y
        if (Math.abs(ddx) + Math.abs(ddy) > 0.35) settled = false
        p.x += ddx * k
        p.y += ddy * k
        p.s += (scale - p.s) * k
      }

      draw()

      if (settled) {
        if (!pointer.active) {
          for (const p of particles) {
            p.x = p.homeX
            p.y = p.homeY
            p.s = 1
          }
          draw()
          setMode('idle')
        }
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
      base: isLight ? '11, 11, 10' : '243, 238, 228',
      accent: isLight ? '96, 90, 80' : '201, 192, 174',
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

    // Micro letters are sized off the sampling grid: large enough to close the
    // gaps, tight enough that neighbouring letters do not muddy each other.
    const cell = Math.max(7, Math.round(step * 1.55))
    atlasRef.current = { cell, ...makeGlyphAtlas(cell, dpr, family, colorsRef.current) }

    // Thin the cloud down to budget without losing the silhouette.
    const stride = Math.max(1, Math.ceil(targets.length / MAX_PARTICLES))
    const particles = []
    for (let i = 0; i < targets.length; i += stride) {
      const t = targets[i]
      particles.push({
        homeX: t.x,
        homeY: t.y,
        // Entrances start above the band and rain down into the name.
        x: animateIn ? t.x + (Math.random() - 0.5) * cell * 2.4 : t.x,
        y: animateIn ? -cell - Math.random() * h * 0.75 : t.y,
        vx: 0,
        vy: animateIn ? 120 + Math.random() * 300 : 0,
        size: Math.max(1.1, step * 0.62),
        // Even ink: a little variance keeps it from looking printed flat.
        alpha: 0.9 + Math.random() * 0.1,
        accent: false,
        gi: (Math.random() * GLYPHS.length) | 0,
        s: 1,
        resting: !animateIn,
      })
    }
    particlesRef.current = particles
    canvas.dataset.particles = String(particles.length)

    setMode(animateIn ? 'fall' : 'idle')
    if (animateIn) {
      playFall()
      start()
    } else {
      draw()
    }
  }, [draw, setMode, start])

  // Let the whole name go: every letter falls to the floor of the band.
  const drop = useCallback(() => {
    if (reduceMotion()) return
    const particles = particlesRef.current
    if (!particles.length) return
    pointerRef.current.active = false

    for (const p of particles) {
      p.s = 1
      p.resting = false
      p.vx = (Math.random() - 0.5) * 70
      // Staggered release speeds read as the letters giving way one by one.
      p.vy = 40 + Math.random() * 380
    }

    setMode('drop')
    playFall()
    start()

    // If it never fully settles, pull it home anyway.
    clearTimeout(resetTimerRef.current)
    resetTimerRef.current = window.setTimeout(() => {
      if (modeRef.current === 'drop') setMode('return')
    }, 2400)
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

  // Hover: whichever part of the name the cursor touches bulges outward around
  // it, then the letters relax back into the name when the pointer leaves.
  const handleHover = (e) => {
    const canvas = canvasRef.current
    if (!canvas || reduceMotion()) return
    if (modeRef.current !== 'idle' && modeRef.current !== 'bulge') return

    const rect = canvas.getBoundingClientRect()
    pointerRef.current.x = e.clientX - rect.left
    pointerRef.current.y = e.clientY - rect.top
    pointerRef.current.active = true

    if (modeRef.current !== 'bulge') setMode('bulge')
    start()
  }

  const handleLeave = () => {
    pointerRef.current.active = false
    if (modeRef.current === 'bulge') start()
  }

  return (
    <section className="nameplate" aria-label="Nameplate">
      <div className="nameplate-inner">
        <span className="section-label nameplate-label">Signature</span>

        <button
          type="button"
          className="nameplate-btn"
          onMouseMove={handleHover}
          onMouseLeave={handleLeave}
          onClick={drop}
          aria-label="Ayush Raj — hover to stir the letters, click to let the name fall"
        >
          <canvas ref={canvasRef} className="nameplate-canvas" aria-hidden="true" />
        </button>

        <span className="nameplate-hint" aria-hidden="true">
          Hover to bulge the letters — click and the name falls, then set itself again
        </span>
      </div>
    </section>
  )
}
