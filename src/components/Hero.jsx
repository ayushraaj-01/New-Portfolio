import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { FiArrowRight, FiExternalLink } from 'react-icons/fi'

const roles = ['Developer', 'Builder', 'Problem Solver', 'Creator', 'Innovator']

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

const glyphs = 'QWERTYUIOPASDFGHJKLZXCVBNM0123456789!@#$%^&*()_+{}|:"<>?[]\\;\',./~अबकमयरलशहभतदधनपफबभम'

function TextScramble({ text, delay = 0 }) {
  const [displayText, setDisplayText] = useState(text)
  const [isScrambling, setIsScrambling] = useState(false)

  const scramble = useCallback(() => {
    if (isScrambling) return
    setIsScrambling(true)

    let frame = 0
    const queue = []
    const words = text.split(' ')
    let wordDelayOffset = 0
    
    for (let w = 0; w < words.length; w++) {
      const word = words[w]
      
      for (let i = 0; i < word.length; i++) {
        const from = '_'
        const to = word[i]
        const start = wordDelayOffset + Math.floor(Math.random() * 15)
        const end = start + 30 + Math.floor(Math.random() * 25)
        queue.push({ from, to, start, end, char: '' })
      }
      
      if (w < words.length - 1) {
        queue.push({ from: ' ', to: ' ', start: 0, end: 0, char: ' ' })
      }
      
      wordDelayOffset += 45
    }

    let cancelFrame
    const update = () => {
      let output = ''
      let complete = 0

      for (let i = 0; i < queue.length; i++) {
        let { from, to, start, end, char } = queue[i]
        
        if (to === ' ') {
          output += ' '
          complete++
          continue
        }

        if (frame >= end) {
          complete++
          output += to
        } else if (frame >= start) {
          if (!char || Math.random() < 0.28) {
            char = glyphs[Math.floor(Math.random() * glyphs.length)]
            queue[i].char = char
          }
          output += char
        } else {
          output += from
        }
      }

      setDisplayText(output)

      if (complete === queue.length) {
        setIsScrambling(false)
      } else {
        frame++
        cancelFrame = requestAnimationFrame(update)
      }
    }

    cancelFrame = requestAnimationFrame(update)
    return () => cancelAnimationFrame(cancelFrame)
  }, [text, isScrambling])

  useEffect(() => {
    const timeout = setTimeout(() => {
      scramble()
    }, delay * 1000)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <span onMouseEnter={scramble} style={{ display: 'inline-block' }}>
      {displayText}
    </span>
  )
}

export default function Hero() {
  const typedText = useTypewriter(roles)
  const heroRef = useRef(null)

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
  
  // Performance optimization: clamp blur and set to 'none' when 0 to avoid rasterization penalty
  const contentBlur = useTransform(scrollYProgress, [0, 0.6], [0, 6])
  const filterString = useTransform(contentBlur, (v) => v > 0.1 ? `blur(${v}px)` : 'none')

  const handleScroll = (e, target) => {
    e.preventDefault()
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="hero" id="hero" ref={heroRef}>
      {/* Noise overlay */}
      <div className="hero-noise" />

      {/* Grid overlay */}
      <div className="hero-grid" />

      {/* Animated gradient blobs with parallax */}
      <motion.div className="hero-blob hero-blob-1" style={{ y: blob1Y }} />
      <motion.div className="hero-blob hero-blob-2" style={{ y: blob2Y }} />
      <motion.div className="hero-blob hero-blob-3" style={{ y: blob3Y }} />

      <motion.div
        className="hero-content"
        style={{
          y: contentY,
          opacity: contentOpacity,
          scale: contentScale,
          filter: filterString,
        }}
      >
        <motion.div
          className="hero-badge"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="dot" />
          Available for opportunities
        </motion.div>

        <motion.h1
          className="hero-name"
          initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Hi, I'm{' '}
          <span className="gradient-text">
            <TextScramble text="Ayush Raj" delay={0.6} />
          </span>
        </motion.h1>

        <motion.p
          className="hero-tagline"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          Full-Stack Developer
        </motion.p>

        <motion.div
          className="hero-typewriter"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          I'm a <span className="typed-text">{typedText}</span>
          <span className="cursor" />
        </motion.div>

        <motion.div
          className="hero-buttons"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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
      </motion.div>

      <motion.div
        className="hero-scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        style={{ opacity: contentOpacity }}
      >
        <span>Scroll</span>
        <div className="scroll-line" />
      </motion.div>
    </section>
  )
}
