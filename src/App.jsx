import { useState, useEffect, lazy, Suspense } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import CursorDot from './components/CursorDot'
import BackToTop from './components/BackToTop'
import { SectionDivider } from './components/animations'
import CameraLoader from './components/CameraLoader'
import Nameplate from './components/Nameplate'

// Below-the-fold sections are code-split so the first paint only ships the hero.
const About = lazy(() => import('./components/About'))
const Skills = lazy(() => import('./components/Skills'))
const Projects = lazy(() => import('./components/Projects'))
const Certifications = lazy(() => import('./components/Certifications'))
const Contact = lazy(() => import('./components/Contact'))
const Footer = lazy(() => import('./components/Footer'))

function SectionFallback() {
  return <div className="section-fallback" aria-hidden="true" />
}

const sections = ['hero', 'about', 'skills', 'projects', 'certifications', 'contact']

function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('portfolio-theme') || 'light'
    }
    return 'light'
  })
  const [activeSection, setActiveSection] = useState('hero')
  const [showSurprise, setShowSurprise] = useState(false)
  const [loading, setLoading] = useState(true)

  // Prevent scroll during loading phase & restore scroll position after loader
  useEffect(() => {
    if (loading) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
      // Restore scroll position after camera loader completes
      const savedY = sessionStorage.getItem('portfolio_scroll_y')
      if (savedY) {
        const targetY = parseFloat(savedY)
        if (!isNaN(targetY) && targetY > 0) {
          window.scrollTo({ top: targetY, behavior: 'instant' })
        }
      }
    }
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [loading])

  // Single rAF-throttled scroll pipeline: HUD active section + scroll-position save.
  // (Replaces two separate scroll listeners that ran layout reads and storage
  // writes on every scroll event.)
  useEffect(() => {
    let rafId = null
    let lastSave = 0
    let sectionEls = []

    const getSectionEls = () => {
      // Re-scan while lazy-loaded sections are still mounting
      if (sectionEls.length !== sections.length) {
        sectionEls = sections.map((id) => document.getElementById(id)).filter(Boolean)
      }
      return sectionEls
    }

    const processScroll = () => {
      rafId = null
      const scrollY = window.scrollY

      // --- HUD active section ---
      if (scrollY < 120) {
        setActiveSection((prev) => (prev === 'hero' ? prev : 'hero'))
      } else {
        const els = getSectionEls()
        for (let i = els.length - 1; i >= 0; i--) {
          const rect = els[i].getBoundingClientRect()
          // If the top of the section is within 250px of viewport top
          if (rect.top <= 250) {
            const id = els[i].id
            setActiveSection((prev) => (prev === id ? prev : id))
            break
          }
        }
      }

      // --- Persist scroll position for reload restoration (max 1/sec) ---
      const now = performance.now()
      if (scrollY > 0 && now - lastSave > 1000) {
        lastSave = now
        try {
          sessionStorage.setItem('portfolio_scroll_y', scrollY.toString())
        } catch {
          /* storage may be full/blocked */
        }
      }
    }

    const onScroll = () => {
      if (rafId === null) rafId = requestAnimationFrame(processScroll)
    }

    const saveFinal = () => {
      try {
        sessionStorage.setItem('portfolio_scroll_y', window.scrollY.toString())
      } catch {
        /* storage may be full/blocked */
      }
    }

    processScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pagehide', saveFinal)
    document.addEventListener('visibilitychange', saveFinal)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pagehide', saveFinal)
      document.removeEventListener('visibilitychange', saveFinal)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [])

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

  const toggleTheme = (e) => {
    const audio = new Audio('/light-switch.mp3')
    audio.volume = 1.0
    audio.play().catch(err => console.log('Audio playback failed:', err))

    // On mobile/touch devices, skip the heavy View Transition circular animation
    const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches
    const supportsViewTransition = document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!supportsViewTransition || isMobile) {
      setTheme(prev => {
        const next = prev === 'dark' ? 'light' : 'dark'
        localStorage.setItem('portfolio-theme', next)
        return next
      })
      return
    }

    const x = e && e.clientX ? e.clientX : window.innerWidth / 2
    const y = e && e.clientY ? e.clientY : window.innerHeight / 2

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    const transition = document.startViewTransition(() => {
      setTheme(prev => {
        const next = prev === 'dark' ? 'light' : 'dark'
        localStorage.setItem('portfolio-theme', next)
        return next
      })
    })

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`
          ]
        },
        {
          duration: 450,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)'
        }
      )
    })
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Track active section for sidebar HUD indicator handled by the merged
  // rAF-throttled scroll pipeline above.

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  return (
    <>
      {loading && <CameraLoader onComplete={() => setLoading(false)} />}
      <CursorDot />
      <BackToTop />

      {/* Progress bar */}
      <motion.div
        style={{
          scaleX,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'var(--gradient-text)',
          transformOrigin: '0%',
          zIndex: 1001,
        }}
      />

      {/* Desktop Sidebar HUD Progress Tracker */}
      <div
        className="sidebar-hud"
        style={{
          '--hud-progress': String(
            Math.max(0, sections.indexOf(activeSection)) / (sections.length - 1)
          ),
        }}
      >
        <div className="hud-line-bg" />
        <div className="hud-line-fill" />
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
              aria-current={activeSection === section ? 'true' : undefined}
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
        <Suspense fallback={<SectionFallback />}>
          <About />
        </Suspense>

        <SectionDivider />
        <Suspense fallback={<SectionFallback />}>
          <Skills />
        </Suspense>

        <SectionDivider />
        <Suspense fallback={<SectionFallback />}>
          <Projects />
        </Suspense>

        <SectionDivider />
        <Suspense fallback={<SectionFallback />}>
          <Certifications />
        </Suspense>

        <SectionDivider />
        <Suspense fallback={<SectionFallback />}>
          <Contact onTriggerSurprise={() => setShowSurprise(true)} />
        </Suspense>

        <Nameplate />
      </main>

      <Suspense fallback={null}>
        <Footer onTriggerSurprise={() => setShowSurprise(true)} />
      </Suspense>

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
