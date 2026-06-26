import { useState, useEffect } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Certifications from './components/Certifications'
import Contact from './components/Contact'
import Footer from './components/Footer'
import CursorDot from './components/CursorDot'
import { SectionDivider } from './components/animations'

const sections = ['hero', 'about', 'skills', 'projects', 'certifications', 'contact']

function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('portfolio-theme') || 'dark'
    }
    return 'dark'
  })
  const [activeSection, setActiveSection] = useState('hero')
  const [showSurprise, setShowSurprise] = useState(false)

  // Keyboard sequence listener for "rick"
  useEffect(() => {
    let inputSequence = ''
    const targetSequence = 'rick'

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      inputSequence = (inputSequence + e.key.toLowerCase()).slice(-4)
      if (inputSequence === targetSequence) {
        setShowSurprise(true)
        inputSequence = '' // Reset sequence
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('portfolio-theme', next)
      return next
    })
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Track active section for sidebar HUD indicator
  useEffect(() => {
    const handleScrollHUD = () => {
      const scrollY = window.scrollY

      // If we are near the top of the viewport
      if (scrollY < 120) {
        setActiveSection('hero')
        return
      }

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i])
        if (el) {
          const rect = el.getBoundingClientRect()
          // If the top of the section is within 250px of viewport top
          if (rect.top <= 250) {
            setActiveSection(sections[i])
            break
          }
        }
      }
    }
    window.addEventListener('scroll', handleScrollHUD, { passive: true })
    return () => window.removeEventListener('scroll', handleScrollHUD)
  }, [])

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  return (
    <>
      <CursorDot />

      {/* Progress bar */}
      <motion.div
        style={{
          scaleX,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, #00d4ff, #7b2dff, #ff2d7b)',
          transformOrigin: '0%',
          zIndex: 1001,
        }}
      />

      {/* Desktop Sidebar HUD Progress Tracker */}
      <div className="sidebar-hud">
        <div className="hud-line-bg" />
        <div className="hud-dots">
          {sections.map((section) => (
            <a
              key={section}
              href={`#${section}`}
              className={`hud-dot-wrapper ${activeSection === section ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                const el = document.getElementById(section)
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }}
              aria-label={`Scroll to ${section}`}
            >
              <div className="hud-dot" />
              <span className="hud-label">{section}</span>
            </a>
          ))}
        </div>
      </div>

      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <main>
        <Hero />

        {/* Infinite Horizontal Marquee */}
        <div className="marquee-container">
          <div className="marquee-content">
            {Array(4).fill([
              "Build", "Ship", "Scale", "Grow", "Create", "Evolve", "Problem Solve"
            ]).flat().map((word, idx) => (
              <div key={idx} className="marquee-item">
                {word} <span className="dot">•</span>
              </div>
            ))}
          </div>
        </div>

        <SectionDivider />
        <About />

        <SectionDivider />
        <Skills />

        <SectionDivider />
        <Projects />

        <SectionDivider />
        <Certifications />

        <SectionDivider />
        <Contact onTriggerSurprise={() => setShowSurprise(true)} />
      </main>

      <Footer onTriggerSurprise={() => setShowSurprise(true)} />

      {showSurprise && (
        <div className="surprise-modal-overlay" onClick={() => setShowSurprise(false)}>
          <div className="surprise-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="surprise-close-btn" onClick={() => setShowSurprise(false)} aria-label="Close modal">
              &times;
            </button>
            <div className="surprise-header-emoji">🎉</div>
            <h3 className="surprise-modal-title">Secret Easter Egg Unlocked!</h3>
            <p className="surprise-modal-message">
              Congratulations! You found a hidden gem in Ayush's portfolio. Enjoy this legendary tune! 🕺✨
            </p>
            <div className="video-responsive">
              <iframe
                src="https://www.youtube.com/embed/wZMue5I8qn8?autoplay=1&mute=0"
                title="Surprise Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <button className="surprise-ok-btn" onClick={() => setShowSurprise(false)}>
              Close & Keep Grooving
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default App
