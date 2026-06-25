import { useState, useEffect } from 'react'
import { FiSun, FiMoon } from 'react-icons/fi'

const navItems = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Certificates', href: '#certifications' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar({ theme, toggleTheme }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50)

      const sections = navItems.map(item => item.href.slice(1))
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i])
        if (el && el.getBoundingClientRect().top <= 200) {
          setActiveSection(sections[i])
          break
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavClick = (e, href) => {
    e.preventDefault()
    setMobileOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <a href="#" className="brand-monogram" onClick={e => handleNavClick(e, '#hero')} aria-label="Home">
        ayush<span className="accent">.</span>dev
      </a>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
        <div className="navbar-inner">
          <a href="#" className="nav-logo" onClick={e => handleNavClick(e, '#hero')} aria-label="Home">
            <div className="nav-logo-badge">
              <img src="/fcb_bw.svg" alt="FC Barcelona" className="fcb-logo" />
            </div>
          </a>

          <ul className="nav-links">
            {navItems.map(item => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={activeSection === item.href.slice(1) ? 'active' : ''}
                  onClick={e => handleNavClick(e, item.href)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="nav-right">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              id="theme-toggle"
            >
              {theme === 'dark' ? <FiSun /> : <FiMoon />}
            </button>
            <button
              className={`mobile-toggle ${mobileOpen ? 'open' : ''}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              id="mobile-menu-toggle"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`}>
        {navItems.map(item => (
          <a
            key={item.href}
            href={item.href}
            onClick={e => handleNavClick(e, item.href)}
          >
            {item.label}
          </a>
        ))}
      </div>
    </>
  )
}
