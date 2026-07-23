import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Easing for cinematic animations
const smoothEase = [0.16, 1, 0.3, 1]
const zoomEase = [0.76, 0, 0.24, 1]

export default function CameraLoader({ onComplete }) {
  const [phase, setPhase] = useState('closed') // closed -> opening -> zooming -> complete

  useEffect(() => {
    // Stage 1: Closed on mount, wait 400ms then open the aperture blades
    const openTimeout = setTimeout(() => {
      setPhase('opening')
    }, 450)

    // Stage 2: Aperture is open, wait 1000ms more then trigger the zoom transition
    const zoomTimeout = setTimeout(() => {
      setPhase('zooming')
    }, 1600)

    // Stage 3: Zoom is complete, call onComplete to unmount loader
    const completeTimeout = setTimeout(() => {
      setPhase('complete')
      if (onComplete) onComplete()
    }, 2450)

    return () => {
      clearTimeout(openTimeout)
      clearTimeout(zoomTimeout)
      clearTimeout(completeTimeout)
    }
  }, [onComplete])

  // 8 aperture blades array
  const blades = Array.from({ length: 8 })
  const pivotRadius = 155 // Radius from center (300,300) to each blade pivot point

  return (
    <AnimatePresence>
      {phase !== 'complete' && (
        <motion.div
          className="camera-loader-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          animate={phase === 'zooming' ? { scale: 6, opacity: 0 } : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.85, ease: zoomEase }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: '#050505',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          {/* Subtle grid backdrop */}
          <div className="loader-grid-bg" />

          {/* Outer Lens Housing and Details */}
          <div className="lens-container">
            <svg
              viewBox="0 0 600 600"
              className="lens-svg"
              style={{
                width: '90vmin',
                height: '90vmin',
                maxWidth: '620px',
                maxHeight: '620px',
                filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.8))',
              }}
            >
              <defs>
                {/* Metallic gradient for blades */}
                <linearGradient id="blade-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2c2c2e" />
                  <stop offset="40%" stopColor="#1e1e20" />
                  <stop offset="70%" stopColor="#121213" />
                  <stop offset="100%" stopColor="#080809" />
                </linearGradient>

                {/* Golden metallic gradient for accents */}
                <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#dfba73" />
                  <stop offset="50%" stopColor="#c5a059" />
                  <stop offset="100%" stopColor="#917032" />
                </linearGradient>

                {/* Dark metal lens body gradient */}
                <radialGradient id="lens-body" cx="50%" cy="50%" r="50%">
                  <stop offset="70%" stopColor="#151518" />
                  <stop offset="90%" stopColor="#0f0f11" />
                  <stop offset="100%" stopColor="#08080a" />
                </radialGradient>

                {/* Glass reflection glow */}
                <radialGradient id="glass-glow" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="rgba(204, 255, 0, 0.18)" />
                  <stop offset="35%" stopColor="rgba(245, 239, 230, 0.08)" />
                  <stop offset="70%" stopColor="rgba(204, 255, 0, 0.02)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                </radialGradient>

                {/* Drop shadow for overlapping blades */}
                <filter id="blade-shadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="-3" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.85" />
                </filter>

                {/* Circle path for circular text specs */}
                <path
                  id="specs-text-path"
                  d="M 300, 300 m -215, 0 a 215,215 0 1,1 430,0 a 215,215 0 1,1 -430,0"
                />
              </defs>

              {/* 1. Outer Metal Lens Barrel */}
              <circle cx="300" cy="300" r="290" fill="url(#lens-body)" stroke="#222" strokeWidth="4" />
              <circle cx="300" cy="300" r="280" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

              {/* Outer grip ridges */}
              <circle cx="300" cy="300" r="275" fill="none" stroke="#111" strokeWidth="8" strokeDasharray="3 3" />

              {/* 2. Lens Specs Ring with Text Path */}
              <circle cx="300" cy="300" r="260" fill="#0d0d10" stroke="#1c1c20" strokeWidth="3" />

              {/* Technical markings and specs */}
              <text fill="#888" fontSize="10.5" fontFamily="monospace" letterSpacing="1.8">
                <textPath href="#specs-text-path" startOffset="0%">
                  AYUSH RAAJ • PORTFOLIO LENS 50mm f/1.4 • NANO USM II • Ø 82mm • MADE IN CREATIVE SPACE
                </textPath>
              </text>

              {/* 3. Focal rings and indicators */}
              <circle cx="300" cy="300" r="228" fill="none" stroke="#222" strokeWidth="2" />

              {/* Ticks ring */}
              <circle
                cx="300"
                cy="300"
                r="220"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="6"
                strokeDasharray="2 12"
              />

              {/* Gold Accent Ring */}
              <circle cx="300" cy="300" r="195" fill="none" stroke="url(#gold-gradient)" strokeWidth="2" />
              <circle cx="300" cy="300" r="190" fill="#070708" stroke="#18181b" strokeWidth="3" />

              {/* F-stop numbers ring */}
              <g transform="translate(300, 300)" fontFamily="'Space Grotesk', sans-serif" fontSize="8" fill="#555" fontWeight="bold">
                <text x="0" y="-176" textAnchor="middle">1.4</text>
                <text x="124" y="-124" textAnchor="middle">2.0</text>
                <text x="176" y="0" textAnchor="middle">2.8</text>
                <text x="124" y="124" textAnchor="middle">4.0</text>
                <text x="0" y="176" textAnchor="middle">5.6</text>
                <text x="-124" y="124" textAnchor="middle">8.0</text>
                <text x="-176" y="0" textAnchor="middle">11</text>
                <text x="-124" y="-124" textAnchor="middle">16</text>
              </g>

              {/* Inner lens rim */}
              <circle cx="300" cy="300" r="168" fill="none" stroke="#1c1c1e" strokeWidth="5" />

              {/* 4. Aperture Blades Chamber */}
              <g id="blades-chamber">
                {blades.map((_, i) => {
                  const angleRad = (i * 45 * Math.PI) / 180
                  const xp = 300 + pivotRadius * Math.cos(angleRad)
                  const yp = 300 + pivotRadius * Math.sin(angleRad)

                  return (
                    <g
                      key={i}
                      transform={`translate(${xp}, ${yp}) rotate(${i * 45})`}
                    >
                      {/* Pivot joint screw */}
                      <circle cx="0" cy="0" r="2.5" fill="url(#gold-gradient)" opacity="0.8" />

                      <motion.path
                        className="aperture-blade"
                        // Advanced organic curved blade shape relative to local pivot (0,0)
                        d="M 0,0 C 20,40 12,85 -8,105 C -65,125 -145,115 -195,72 C -220,52 -185,0 -160,-22 C -100,-42 -40,-32 0,0 Z"
                        fill="url(#blade-gradient)"
                        stroke="rgba(0,0,0,0.6)"
                        strokeWidth="1.5"
                        filter="url(#blade-shadow)"
                        style={{ originX: 0, originY: 0 }}
                        initial={{ rotate: 14 }}
                        animate={phase === 'closed' ? { rotate: 14 } : { rotate: -42 }}
                        transition={{ duration: 1.15, ease: smoothEase }}
                      />
                    </g>
                  )
                })}
              </g>

              {/* 5. Glass Reflection Coating Glow Overlay */}
              <circle cx="300" cy="300" r="162" fill="url(#glass-glow)" pointerEvents="none" />

              {/* Outer lens reflections (subtle glass arc highlights) */}
              <path
                d="M 180,180 A 170,170 0 0,1 420,180"
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1.5"
                strokeLinecap="round"
                pointerEvents="none"
              />
              <path
                d="M 220,420 A 170,170 0 0,1 380,420"
                fill="none"
                stroke="rgba(204, 255, 0, 0.08)"
                strokeWidth="1.5"
                strokeLinecap="round"
                pointerEvents="none"
              />

              {/* Animate lens glare diagonal swipe */}
              <motion.polygon
                points="-100,500 200,-100 280,-100 -20,500"
                fill="rgba(255, 255, 255, 0.03)"
                initial={{ x: -200, y: -200 }}
                animate={{ x: 600, y: 600 }}
                transition={{ duration: 1.8, ease: smoothEase, delay: 0.2 }}
                pointerEvents="none"
                style={{
                  clipPath: 'circle(162px at 300px 300px)',
                }}
              />
            </svg>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
