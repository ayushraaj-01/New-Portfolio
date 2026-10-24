import { useState, useEffect, useRef } from 'react'
import {
  motion, useScroll, useTransform, useMotionValue, useSpring, useMotionTemplate,
} from 'framer-motion'
import { FiArrowRight, FiExternalLink } from 'react-icons/fi'
import SpotifyNowPlaying from './SpotifyNowPlaying'

const roles = ['Developer', 'Builder', 'Problem Solver', 'Creator', 'Innovator']

const heroWords = [
  { text: 'Hi,' },
  { text: "I'm" },
  { text: 'Ayush', accent: true },
  { text: 'Raj', accent: true },
]

/* Cinematic word-by-word mask reveal for the headline */
const heroWordVariants = {
  hidden: { y: '115%', rotateX: -55, opacity: 0 },
  visible: (i) => ({
    y: '0%',
    rotateX: 0,
    opacity: 1,
    transition: {
      duration: 0.75,
      delay: 0.3 + i * 0.11,
      ease: [0.22, 1, 0.36, 1],
      opacity: { duration: 0.5, delay: 0.3 + i * 0.11 },
    },
  }),
}

function useTypewriter(words, typingSpeed = 100, deletingSpeed = 60, pauseTime = 2000) {
  const [text, setText] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentWord = words[wordIndex]

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setText(currentWord.slice(0, text.length + 1))
        if (text === currentWord) {
          setTimeout(() => setIsDeleting(true), pauseTime)
          return
        }
      } else {
        setText(currentWord.slice(0, text.length - 1))
        if (text === '') {
          setIsDeleting(false)
          setWordIndex((wordIndex + 1) % words.length)
        }
      }
    }, isDeleting ? deletingSpeed : typingSpeed)

    return () => clearTimeout(timeout)
  }, [text, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseTime])

  return text
}



export default function Hero() {
  const typedText = useTypewriter(roles)
  const heroRef = useRef(null)
  const particlesCanvasRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  // Parallax: content floats up, blobs move at different speeds
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -120])
  const blob1Y = useTransform(scrollYProgress, [0, 1], [0, -200])
  const blob2Y = useTransform(scrollYProgress, [0, 1], [0, -150])
  const blob3Y = useTransform(scrollYProgress, [0, 1], [0, -100])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const contentScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.9])

  // Medium-intensity pointer motion: content sways gently, spotlight follows cursor,
  // particle layer drifts on its own parallax depth
  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const spotX = useSpring(pointerX, { stiffness: 60, damping: 20, mass: 0.5 })
  const spotY = useSpring(pointerY, { stiffness: 60, damping: 20, mass: 0.5 })
  const contentX = useTransform(pointerX, [-1, 1], [-8, 8])
  const particlesY = useTransform(scrollYProgress, [0, 1], [0, -60])

  const spotlightBg = useMotionTemplate
    `radial-gradient(560px circle at ${spotX}px ${spotY}px, rgba(var(--accent-rgb), 0.16), transparent 65%)`

  const handlePointerMove = (e) => {
    if (prefersReducedMotion || !heroRef.current) return
    const rect = heroRef.current.getBoundingClientRect()
    pointerX.set(((e.clientX - rect.left) / rect.width) * 2 - 1)
    pointerY.set(((e.clientY - rect.top) / rect.height) * 2 - 1)
    spotX.set(e.clientX - rect.left)
    spotY.set(e.clientY - rect.top)
  }

  const isSafariOrIOS = typeof window !== 'undefined' &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) || /^((?!chrome|android).)*safari/i.test(navigator.userAgent))

  const contentBlur = useTransform(scrollYProgress, [0, 0.6], [0, 6])
  const filterString = useTransform(contentBlur, (v) => {
    if (isSafariOrIOS) return 'none'
    return v > 0.1 ? `blur(${v}px)` : 'none'
  })

  const handleScroll = (e, target) => {
    e.preventDefault()
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
  }

  // Interactive Particle Constellation Effect
  useEffect(() => {
    const canvas = particlesCanvasRef.current
    if (!canvas) return
    // Respect reduced-motion: skip the particle animation entirely
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let running = false

    let width = canvas.width = canvas.parentElement.clientWidth
    let height = canvas.height = canvas.parentElement.clientHeight

    const particles = []
    const numParticles = Math.min(80, Math.floor((width * height) / 15000))
    const connectionDistance = 110
    const mouse = { x: null, y: null, radius: 150 }

    // Colors matching theme
    const getAccentColor = () => {
      const theme = document.documentElement.getAttribute('data-theme')
      return theme === 'light' ? 'rgba(180, 83, 9, ' : 'rgba(251, 191, 36, '
    }

    class Particle {
      constructor() {
        this.x = Math.random() * width
        this.y = Math.random() * height
        this.vx = (Math.random() - 0.5) * 0.6
        this.vy = (Math.random() - 0.5) * 0.6
        this.radius = Math.random() * 2 + 1
      }

      update() {
        this.x += this.vx
        this.y += this.vy

        // Bounce walls
        if (this.x < 0 || this.x > width) this.vx *= -1
        if (this.y < 0 || this.y > height) this.vy *= -1

        // Mouse attraction/push
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x
          const dy = mouse.y - this.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius
            this.x -= dx * force * 0.03
            this.y -= dy * force * 0.03
          }
        }
      }

      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = getAccentColor() + '0.5)'
        ctx.fill()
      }
    }

    // Initialize particles
    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle())
    }

    // Listeners
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }

    const handleMouseLeave = () => {
      mouse.x = null
      mouse.y = null
    }

    window.addEventListener('mousemove', handleMouseMove)
    canvas.parentElement.addEventListener('mouseleave', handleMouseLeave)

    const handleResize = () => {
      width = canvas.width = canvas.parentElement.clientWidth
      height = canvas.height = canvas.parentElement.clientHeight
    }
    window.addEventListener('resize', handleResize)

    // Loop
    const draw = () => {
      if (!running) return
      ctx.clearRect(0, 0, width, height)

      // Update and draw particles
      particles.forEach(p => {
        p.update()
        p.draw()
      })

      // Draw lines
      const colorPrefix = getAccentColor()
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i]
          const p2 = particles[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.15
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = colorPrefix + `${alpha})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw)
    }

    const start = () => {
      if (running) return
      running = true
      animationFrameId = requestAnimationFrame(draw)
    }

    const stop = () => {
      running = false
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }

    // Only animate while the hero is on-screen
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 }
    )
    io.observe(canvas.parentElement)

    return () => {
      stop()
      io.disconnect()
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      canvas.parentElement.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <section className="hero" id="hero" ref={heroRef} onMouseMove={handlePointerMove}>
      {/* Noise overlay */}
      <div className="hero-noise" />

      {/* Grid overlay */}
      <div className="hero-grid" />

      {/* Cursor-following spotlight glow */}
      <motion.div className="hero-spotlight" style={{ background: spotlightBg }} aria-hidden="true" />

      {/* Interactive floating particles canvas */}
      <motion.canvas ref={particlesCanvasRef} className="hero-particles-canvas" style={{ y: particlesY }} />

      {/* Animated gradient blobs with parallax */}
      <motion.div className="hero-blob hero-blob-1" style={{ y: blob1Y }} />
      <motion.div className="hero-blob hero-blob-2" style={{ y: blob2Y }} />
      <motion.div className="hero-blob hero-blob-3" style={{ y: blob3Y }} />



      <motion.div
        className="hero-content"
        style={{
          y: contentY,
          x: contentX,
          opacity: contentOpacity,
          scale: contentScale,
          filter: filterString,
        }}
      >
        <motion.div
          className="hero-badge"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="dot" />
          Available for opportunities
        </motion.div>

        {/* Word-by-word cinematic reveal; name words carry a slow maroon shimmer */}
        <motion.h1
          className="hero-name"
          aria-label="Hi, I'm Ayush Raj"
          initial="hidden"
          animate="visible"
        >
          {heroWords.map((word, i) => (
            <span key={word.text} className="hero-word-mask" aria-hidden="true">
              <motion.span
                className={`hero-word${word.accent ? ' gradient-text' : ''}`}
                data-word={word.text}
                custom={i}
                variants={heroWordVariants}
              >
                {word.text}
              </motion.span>
            </span>
          ))}
        </motion.h1>

        <motion.p
          className="hero-tagline"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          Full-Stack Developer
        </motion.p>

        <motion.div
          className="hero-typewriter"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          I'm a <span className="typed-text">{typedText}</span>
          <span className="cursor" />
        </motion.div>

        <motion.div
          className="hero-buttons"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.a
            href="#projects"
            className="btn btn-primary"
            onClick={e => handleScroll(e, '#projects')}
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.97 }}
          >
            View Projects <FiArrowRight />
          </motion.a>
          <motion.a
            href="https://drive.google.com/file/d/1cHMetAEPy6CmXu-4olhC-7XlvYuDFGCv/view?usp=sharing"
            className="btn btn-secondary"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.97 }}
          >
            <FiExternalLink /> Resume
          </motion.a>
        </motion.div>

        {/* Spotify Now Playing — equalizer card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.35, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginTop: '32px' }}
        >
          <SpotifyNowPlaying />
        </motion.div>
      </motion.div>

      <motion.div
        className="hero-scroll-indicator"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.55, duration: 0.6 }}
        style={{ opacity: contentOpacity }}
      >
        <div className="scroll-indicator-cool">
          <div className="mouse-outline">
            <div className="mouse-wheel" />
          </div>
          <div className="scroll-track" />
        </div>
      </motion.div>
    </section>
  )
}
