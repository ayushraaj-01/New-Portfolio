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
  const [theme, setTheme] = useState('dark')
  const [activeSection, setActiveSection] = useState('hero')

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
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
        <Contact />
      </main>

      <Footer />
    </>
  )
}

export default App
