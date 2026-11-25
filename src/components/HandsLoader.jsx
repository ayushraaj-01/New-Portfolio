import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { handsGrid } from '../data/handsGrid'

/**
 * HandsLoader — Michelangelo "The Creation of Adam" in Pure Binary Numbers (0 & 1)
 *
 * Anatomically accurate 1:1 isometric coordinates.
 * Zero deformation: isotropic scaling preserves natural anatomy on all screen sizes.
 *
 * Sequence:
 * 1. Merging Animation (0.0s - 1.6s):
 *    - Binary matrix hands glide inward from opposite edges across a dark grid.
 *    - Snugly-spaced binary numbers (0 & 1) with subtle code flips.
 *    - Electric blue plasma arcs leap between index fingertips.
 *    - Left and right index fingertips merge together at the center.
 *
 * 2. Blue Blast in the Middle (1.6s - 2.5s):
 *    - At the touch point, an intense electric BLUE BLAST erupts in the middle:
 *      * Radiant white-hot central core.
 *      * Multi-layered vibrant royal & electric blue shockwave sphere.
 *      * 8-point radiant blast beams: horizontal flare, vertical beam, and diagonal rays.
 *      * Dual expanding electric blue shockwave rings.
 *      * High-velocity neon blue and white spark embers spraying in 360 degrees.
 *
 * 3. Stardust Dispersal (2.2s - 3.4s):
 *    - The blue blast shockwave ripples through the hands, launching binary digits
 *      into zero-gravity cosmic drift.
 *
 * 4. Hero Section Reveal (3.0s - 3.7s):
 *    - The dark overlay smoothly crossfades out, unveiling the portfolio Hero section.
 */
export default function HandsLoader({ onComplete }) {
  const canvasRef = useRef(null)
  const [isRevealing, setIsRevealing] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const animFrameRef = useRef(null)
  const completedRef = useRef(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const handleComplete = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    setIsDone(true)
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    if (onCompleteRef.current) onCompleteRef.current()
  }, [])

  const handleSkip = useCallback(() => {
    handleComplete()
  }, [handleComplete])

  // Key listener for Escape or Space to skip immediately
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' || e.key === ' ') {
        handleSkip()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleSkip])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = window.innerWidth
    let height = window.innerHeight
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    const setupCanvas = () => {
      width = window.innerWidth
      height = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.resetTransform?.()
      ctx.scale(dpr, dpr)
    }
    setupCanvas()

    const onResize = () => {
      setupCanvas()
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)

    // Synthesize powerful celestial impact sound for the blue blast
    const playBlastSound = () => {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext
        if (!AudioCtx) return
        const actx = new AudioCtx()
        if (actx.state === 'suspended') {
          actx.resume().catch(() => {})
        }
        const now = actx.currentTime

        // Deep sub-bass impact boom
        const subOsc = actx.createOscillator()
        const subGain = actx.createGain()
        subOsc.type = 'sine'
        subOsc.frequency.setValueAtTime(150, now)
        subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.6)
        subGain.gain.setValueAtTime(0.28, now)
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6)
        subOsc.connect(subGain)
        subGain.connect(actx.destination)
        subOsc.start(now)
        subOsc.stop(now + 0.6)

        // Electric shimmer resonance
        const chimeOsc = actx.createOscillator()
        const chimeGain = actx.createGain()
        chimeOsc.type = 'triangle'
        chimeOsc.frequency.setValueAtTime(840, now)
        chimeOsc.frequency.exponentialRampToValueAtTime(2200, now + 0.38)
        chimeGain.gain.setValueAtTime(0.18, now)
        chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8)
        chimeOsc.connect(chimeGain)
        chimeGain.connect(actx.destination)
        chimeOsc.start(now)
        chimeOsc.stop(now + 0.8)
      } catch {
        /* audio policy or unavailable */
      }
    }

    // Dynamic scale: FULL SCREEN on desktop / laptops, COMPACT on mobile phones
    const getScale = () => {
      if (width < 600) {
        // Compact for mobile phones: fits neatly across portrait screen with clean margins
        return Math.min(0.42, Math.max(0.32, (width * 0.38) / 360))
      }
      if (width < 1024) {
        // Tablets
        return Math.min(1.1, Math.max(0.65, (width * 0.44) / 360))
      }
      // Desktop / Laptops: FULL SCREEN!
      // Dynamically scales so the hands span across the entire viewport width and height
      const scaleByWidth = (width * 0.47) / 360
      const scaleByHeight = (height * 0.56) / 190
      return Math.min(scaleByWidth, scaleByHeight)
    }

    // Initialize binary particles from exact handsGrid
    const particles = []
    const leftGrid = handsGrid.left
    const rightGrid = handsGrid.right

    // Left hand binary digits (Adam)
    for (let i = 0; i < leftGrid.length; i++) {
      const [ox, oy, ctype] = leftGrid[i]
      particles.push({
        hand: 'left',
        ox,
        oy,
        ctype,
        char: ctype === 'white' && Math.random() < 0.22 ? '■' : Math.random() > 0.5 ? '1' : '0',
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        dispersed: false,
        alpha: 1.0,
      })
    }

    // Right hand binary digits (God)
    for (let i = 0; i < rightGrid.length; i++) {
      const [ox, oy, ctype] = rightGrid[i]
      particles.push({
        hand: 'right',
        ox,
        oy,
        ctype,
        char: ctype === 'white' && Math.random() < 0.22 ? '■' : Math.random() > 0.5 ? '1' : '0',
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        dispersed: false,
        alpha: 1.0,
      })
    }

    // High-speed explosion spark embers for the blue blast
    const sparks = []
    let sparksGenerated = false

    const createBlueBlastSparks = (cx, cy, isMobile) => {
      const count = isMobile ? 70 : 130
      const colors = ['#ffffff', '#60a5fa', '#3b82f6', '#2563eb', '#93c5fa', '#38bdf8', '#fde047']
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = (Math.random() * 12 + 2.5) * (isMobile ? 0.75 : 1.0)
        sparks.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * (isMobile ? 2.0 : 2.6) + 0.9,
          alpha: 1.0,
          decay: Math.random() * 0.024 + 0.014,
          color: colors[Math.floor(Math.random() * colors.length)],
        })
      }
    }

    let startTime = null
    let blastTriggered = false
    let shockwaveRadius = 0
    let shockwave2Radius = 0
    let revealTriggered = false
    let frameCount = 0

    // Electric plasma arcs between fingertips before touch
    const lightningPoints = []
    const generateLightning = (x1, y1, x2, y2, isMobile) => {
      lightningPoints.length = 0
      lightningPoints.push({ x: x1, y: y1 })
      const segments = 4
      const maxJitter = isMobile ? 10 : 16
      for (let s = 1; s < segments; s++) {
        const t = s / segments
        const lx = x1 + (x2 - x1) * t
        const ly = y1 + (y2 - y1) * t
        const jitter = (Math.random() - 0.5) * maxJitter
        lightningPoints.push({ x: lx, y: ly + jitter })
      }
      lightningPoints.push({ x: x2, y: y2 })
    }

    // Cubic ease-out
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

    const render = (timestamp) => {
      if (completedRef.current) return
      if (!startTime) startTime = timestamp
      const elapsed = (timestamp - startTime) / 1000
      frameCount++

      ctx.clearRect(0, 0, width, height)

      const scale = getScale()
      const isMobile = width < 600
      const cx = width / 2
      const cy = height / 2

      // 1. Background subtle dot matrix grid
      const gridPitch = Math.round(18 * scale)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.038)'
      const startX = (width % gridPitch) / 2
      const startY = (height % gridPitch) / 2
      for (let gx = startX; gx < width; gx += gridPitch) {
        for (let gy = startY; gy < height; gy += gridPitch) {
          ctx.beginPath()
          ctx.arc(gx, gy, isMobile ? 0.65 : 0.75, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Timing:
      // 0.0s - 1.6s: Smooth merging approach
      // 1.6s: Direct tactile fingertip touch -> VIBRANT BLUE BLAST IN MIDDLE!
      // 1.6s - 2.5s: Blue blast blooms, beams radiate, shockwave expands
      // 2.2s - 3.4s: Binary numbers disperse like stardust
      // 3.0s: Reveal hero section
      // 3.7s: Done
      const approachDuration = 1.6
      const approachProgress = Math.min(1.0, elapsed / approachDuration)
      const easedApproach = easeOutCubic(approachProgress)
      const remainingProgress = 1.0 - easedApproach

      // Responsive approach distance from outer margins:
      // On desktop, hands enter from outer margins spanning the full screen
      // On mobile, compact approach distance keeping hands neatly framed
      const maxDistX = isMobile
        ? Math.min(width * 0.38, Math.max(width * 0.26, 110)) * remainingProgress
        : Math.max(width * 0.44, 380) * remainingProgress

      // Gentle vertical reach alignment matching Michelangelo's reach
      const arcScale = isMobile ? 0.6 : 1.0
      const leftArcY = -28 * arcScale * remainingProgress
      const rightArcY = 24 * arcScale * remainingProgress

      // Index fingertips meet precisely at center (cx, cy)
      const touchOverlap = isMobile ? 1.0 : 1.5
      const leftTipX = cx - maxDistX + touchOverlap
      const leftTipY = cy + leftArcY
      const rightTipX = cx + maxDistX - touchOverlap
      const rightTipY = cy + rightArcY

      const isContact = elapsed >= approachDuration

      // Pre-contact electric plasma discharge (1.05s -> 1.6s)
      if (elapsed > 1.05 && !isContact) {
        const sparkProb = (elapsed - 1.05) / 0.55
        if (Math.random() < sparkProb * 0.92) {
          generateLightning(leftTipX, leftTipY, rightTipX, rightTipY, isMobile)
          ctx.strokeStyle = 'rgba(96, 165, 250, 0.95)'
          ctx.lineWidth = isMobile ? 1.4 : 1.8
          ctx.beginPath()
          for (let p = 0; p < lightningPoints.length; p++) {
            if (p === 0) ctx.moveTo(lightningPoints[p].x, lightningPoints[p].y)
            else ctx.lineTo(lightningPoints[p].x, lightningPoints[p].y)
          }
          ctx.stroke()
        }

        // Electric blue aura building up at fingertips
        const auraRad = (elapsed - 1.05) * (isMobile ? 22 : 32)
        const auraGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, auraRad)
        auraGrad.addColorStop(0, 'rgba(255, 255, 255, 0.75)')
        auraGrad.addColorStop(0.35, 'rgba(59, 130, 246, 0.45)')
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.fillStyle = auraGrad
        ctx.beginPath()
        ctx.arc(cx, cy, auraRad, 0, Math.PI * 2)
        ctx.fill()
      }

      // BLUE BLAST INTENSITY IN THE MIDDLE
      let blastIntensity = 0
      let blastTime = 0
      if (isContact) {
        if (!blastTriggered) {
          blastTriggered = true
          playBlastSound()
          createBlueBlastSparks(cx, cy, isMobile)
        }

        blastTime = elapsed - approachDuration
        shockwaveRadius = blastTime * Math.max(width, height) * (isMobile ? 1.6 : 1.45)
        shockwave2Radius = Math.max(0, (blastTime - 0.08) * Math.max(width, height) * (isMobile ? 1.3 : 1.2))

        // Peak instantly at contact, radiate outward with vibrant blue energy
        if (blastTime < 0.14) {
          blastIntensity = blastTime / 0.14
        } else {
          blastIntensity = Math.max(0, 1.0 - (blastTime - 0.14) * 1.55)
        }

        // Trigger portfolio hero reveal at 3.0s
        if (elapsed >= 3.0 && !revealTriggered) {
          revealTriggered = true
          setIsRevealing(true)
        }
      }

      // Cybernetic matrix stream: flip digits periodically
      if (frameCount % 3 === 0) {
        const flipCount = isMobile ? 18 : 30
        for (let k = 0; k < flipCount; k++) {
          const idx = Math.floor(Math.random() * particles.length)
          if (particles[idx].char !== '■') {
            particles[idx].char = particles[idx].char === '1' ? '0' : '1'
          }
        }
      }

      // Font size proportional to isometric scale (snug, tight, crisp digits!)
      const fontSize = Math.max(8, Math.round(7.27 * scale * 1.25))
      ctx.font = `700 ${fontSize}px "JetBrains Mono", "Courier New", monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Color buckets for batched draw calls (locked 60-120fps)
      const whiteBucket = []
      const cyanBucket = []
      const blueBucket = []
      const silverBucket = []

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        if (!p.dispersed) {
          const isLeft = p.hand === 'left'
          const tipX = isLeft ? leftTipX : rightTipX
          const tipY = isLeft ? leftTipY : rightTipY

          // Isometric coordinates: 100% natural anatomy without deformation!
          p.x = tipX + p.ox * scale
          p.y = tipY + p.oy * scale

          // Shockwave dispersal trigger from middle
          if (isContact) {
            const dist = Math.hypot(p.x - cx, p.y - cy)
            if (dist <= shockwaveRadius) {
              p.dispersed = true
              const angle = Math.atan2(p.y - cy, p.x - cx) + (Math.random() - 0.5) * 0.4
              const speed = (Math.random() * 3.0 + 1.2) * (scale / (isMobile ? 0.75 : 1.2))
              p.vx = Math.cos(angle) * speed
              p.vy = Math.sin(angle) * speed
            }
          }
        } else {
          // Zero-g floating cosmic code
          p.x += p.vx
          p.y += p.vy
          p.vx *= 0.975
          p.vy *= 0.975
          p.vy -= 0.012
          p.alpha = Math.max(0, p.alpha - 0.009)
        }

        if (p.alpha <= 0.01) continue

        if (p.ctype === 'white') whiteBucket.push(p)
        else if (p.ctype === 'blue') blueBucket.push(p)
        else if (p.ctype === 'cyan') cyanBucket.push(p)
        else silverBucket.push(p)
      }

      // Batched rendering by color (Zero lag!)
      // 1. Soft Silver digits
      ctx.fillStyle = '#cbd5e1'
      for (let i = 0; i < silverBucket.length; i++) {
        const p = silverBucket[i]
        ctx.globalAlpha = p.alpha * 0.88
        ctx.fillText(p.char, p.x, p.y)
      }

      // 2. Cyan / Ice Blue digits
      ctx.fillStyle = '#38bdf8'
      for (let i = 0; i < cyanBucket.length; i++) {
        const p = cyanBucket[i]
        ctx.globalAlpha = p.alpha * 0.95
        ctx.fillText(p.char, p.x, p.y)
      }

      // 3. Vivid Electric Blue digits
      ctx.fillStyle = '#2563eb'
      for (let i = 0; i < blueBucket.length; i++) {
        const p = blueBucket[i]
        ctx.globalAlpha = p.alpha * 0.92
        ctx.fillText(p.char, p.x, p.y)
      }

      // 4. Pure White Highlights
      ctx.fillStyle = '#ffffff'
      for (let i = 0; i < whiteBucket.length; i++) {
        const p = whiteBucket[i]
        ctx.globalAlpha = p.alpha
        ctx.fillText(p.char, p.x, p.y)
      }

      // Draw spark embers
      for (let s = 0; s < sparks.length; s++) {
        const sp = sparks[s]
        sp.x += sp.vx
        sp.y += sp.vy
        sp.vx *= 0.95
        sp.vy *= 0.95
        sp.alpha = Math.max(0, sp.alpha - sp.decay)

        if (sp.alpha > 0.01) {
          ctx.beginPath()
          ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2)
          ctx.fillStyle = sp.color
          ctx.globalAlpha = sp.alpha
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1.0

      // ==========================================
      // THE BLUE BLAST IN THE MIDDLE (TOUCH MOMENT)
      // ==========================================
      if (isContact && blastIntensity > 0.01) {
        // 1. MASSIVE BLUE BLAST ENERGY SPHERE (Center Middle)
        const blastRad = Math.min(width, height) * (isMobile ? 0.62 : 0.52) * blastIntensity
        const blastGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, blastRad)
        blastGrad.addColorStop(0, `rgba(255, 255, 255, ${Math.min(1.0, blastIntensity * 1.4)})`)
        blastGrad.addColorStop(0.12, `rgba(224, 242, 254, ${blastIntensity * 0.98})`)
        blastGrad.addColorStop(0.30, `rgba(96, 165, 250, ${blastIntensity * 0.85})`)
        blastGrad.addColorStop(0.55, `rgba(37, 99, 235, ${blastIntensity * 0.70})`)
        blastGrad.addColorStop(0.82, `rgba(29, 78, 216, ${blastIntensity * 0.35})`)
        blastGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.fillStyle = blastGrad
        ctx.beginPath()
        ctx.arc(cx, cy, blastRad, 0, Math.PI * 2)
        ctx.fill()

        // 2. CELLULAR BLUE MATRIX CORE (Exact Reference Frame 110)
        const cellPitch = 7.27 * scale
        const coreGridSize = Math.floor((isMobile ? 8 : 12) * blastIntensity)
        if (coreGridSize > 1) {
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1.0, blastIntensity * 1.2)})`
          for (let gr = -coreGridSize; gr <= coreGridSize; gr++) {
            for (let gc = -coreGridSize; gc <= coreGridSize; gc++) {
              if (Math.abs(gr) + Math.abs(gc) <= coreGridSize) {
                const px = cx + gc * cellPitch
                const py = cy + gr * cellPitch
                ctx.fillRect(px - cellPitch * 0.45, py - cellPitch * 0.45, cellPitch * 0.9, cellPitch * 0.9)
              }
            }
          }
        }

        // 3. ANAMORPHIC HORIZONTAL BLUE BLAST BEAM (Across the Middle)
        const hBeamW = width * 1.15 * blastIntensity
        const hBeamH = (isMobile ? 5.5 : 7.5) * blastIntensity
        const hBeamGrad = ctx.createLinearGradient(cx - hBeamW / 2, cy, cx + hBeamW / 2, cy)
        hBeamGrad.addColorStop(0, 'rgba(37, 99, 235, 0)')
        hBeamGrad.addColorStop(0.25, `rgba(59, 130, 246, ${blastIntensity * 0.75})`)
        hBeamGrad.addColorStop(0.5, `rgba(255, 255, 255, ${blastIntensity * 0.98})`)
        hBeamGrad.addColorStop(0.75, `rgba(59, 130, 246, ${blastIntensity * 0.75})`)
        hBeamGrad.addColorStop(1, 'rgba(37, 99, 235, 0)')
        ctx.fillStyle = hBeamGrad
        ctx.fillRect(cx - hBeamW / 2, cy - hBeamH / 2, hBeamW, hBeamH)

        // 4. VERTICAL BLUE BLAST ENERGY PILLAR (Up and Down from Middle)
        const vBeamH = height * 0.85 * blastIntensity
        const vBeamW = (isMobile ? 4.2 : 5.5) * blastIntensity
        const vBeamGrad = ctx.createLinearGradient(cx, cy - vBeamH / 2, cx, cy + vBeamH / 2)
        vBeamGrad.addColorStop(0, 'rgba(37, 99, 235, 0)')
        vBeamGrad.addColorStop(0.3, `rgba(59, 130, 246, ${blastIntensity * 0.7})`)
        vBeamGrad.addColorStop(0.5, `rgba(255, 255, 255, ${blastIntensity * 0.95})`)
        vBeamGrad.addColorStop(0.7, `rgba(59, 130, 246, ${blastIntensity * 0.7})`)
        vBeamGrad.addColorStop(1, 'rgba(37, 99, 235, 0)')
        ctx.fillStyle = vBeamGrad
        ctx.fillRect(cx - vBeamW / 2, cy - vBeamH / 2, vBeamW, vBeamH)

        // 5. 8-POINT RADIANT BLUE STARBURST RAYS (Frame 110 Diagonals)
        const rayLen = Math.min(width, height) * (isMobile ? 0.40 : 0.45) * blastIntensity
        ctx.strokeStyle = `rgba(147, 197, 253, ${blastIntensity * 0.88})`
        ctx.lineWidth = isMobile ? 1.8 : 2.2
        ctx.beginPath()
        // 45-degree diagonal rays
        ctx.moveTo(cx - rayLen * 0.71, cy - rayLen * 0.71)
        ctx.lineTo(cx + rayLen * 0.71, cy + rayLen * 0.71)
        ctx.moveTo(cx - rayLen * 0.71, cy + rayLen * 0.71)
        ctx.lineTo(cx + rayLen * 0.71, cy - rayLen * 0.71)
        ctx.stroke()

        // Corona fringe: subtle golden/yellow accents along rays (exact reference video detail)
        ctx.strokeStyle = `rgba(253, 224, 71, ${blastIntensity * 0.65})`
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.moveTo(cx - rayLen * 0.45, cy - rayLen * 0.45)
        ctx.lineTo(cx + rayLen * 0.45, cy + rayLen * 0.45)
        ctx.moveTo(cx - rayLen * 0.45, cy + rayLen * 0.45)
        ctx.lineTo(cx + rayLen * 0.45, cy - rayLen * 0.45)
        ctx.stroke()

        // 6. EXPANDING ELECTRIC BLUE SHOCKWAVE RINGS
        if (shockwaveRadius > 0 && shockwaveRadius < Math.max(width, height) * 1.15) {
          // Primary outer blue ripple
          ctx.beginPath()
          ctx.arc(cx, cy, shockwaveRadius, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(59, 130, 246, ${blastIntensity * 0.82})`
          ctx.lineWidth = isMobile ? 2.5 : 3.2
          ctx.stroke()

          // Secondary inner cyan ripple
          if (shockwave2Radius > 0) {
            ctx.beginPath()
            ctx.arc(cx, cy, shockwave2Radius, 0, Math.PI * 2)
            ctx.strokeStyle = `rgba(147, 197, 253, ${blastIntensity * 0.65})`
            ctx.lineWidth = isMobile ? 1.6 : 2.0
            ctx.stroke()
          }
        }
      }

      // Check completion (at 3.7s, transition is fully complete)
      if (elapsed >= 3.7) {
        handleComplete()
        return
      }

      animFrameRef.current = requestAnimationFrame(render)
    }

    animFrameRef.current = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
        animFrameRef.current = null
      }
    }
  }, []) // Empty dependencies: runs strictly ONCE on mount, never restarts

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          className="hands-loader-overlay"
          initial={{ opacity: 1 }}
          animate={{ opacity: isRevealing ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1], // Smooth cinematic crossfade into hero
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: '#070408',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            userSelect: 'none',
            touchAction: 'none',
          }}
        >
          {/* Main particle canvas */}
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              display: 'block',
              touchAction: 'none',
            }}
          />

          {/* Touch-Friendly Skip Button */}
          <button
            onClick={handleSkip}
            aria-label="Skip animation"
            style={{
              position: 'absolute',
              top: 'max(16px, env(safe-area-inset-top, 16px))',
              right: 'max(16px, env(safe-area-inset-right, 16px))',
              zIndex: 10,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderRadius: '20px',
              color: 'rgba(255, 255, 255, 0.75)',
              padding: '8px 16px',
              minHeight: '38px',
              minWidth: '72px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'monospace',
              fontSize: '11px',
              letterSpacing: '1px',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              touchAction: 'manipulation',
              transition: 'all 0.2s ease',
              opacity: isRevealing ? 0 : 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ffffff'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.38)'
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)'
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
            }}
          >
            SKIP
          </button>

          {/* Minimalist Futuristic HUD Status */}
          <div
            style={{
              position: 'absolute',
              bottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              pointerEvents: 'none',
              zIndex: 2,
              opacity: isRevealing ? 0 : 1,
              transition: 'opacity 0.25s ease',
              width: '90%',
              maxWidth: '260px',
            }}
          >
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '10px',
                letterSpacing: '2px',
                color: 'rgba(255, 255, 255, 0.45)',
                textTransform: 'uppercase',
                textAlign: 'center',
              }}
            >
              INITIALIZING BINARY SYNAPSE
            </span>
            <div
              style={{
                width: '100px',
                height: '1.5px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '1px',
              }}
            >
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                style={{
                  width: '50%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
                }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
