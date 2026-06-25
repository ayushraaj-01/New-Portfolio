import { useState, useEffect } from 'react'
import { FiSun, FiMoon, FiHome, FiUser, FiFolder, FiAward, FiMail } from 'react-icons/fi'

const navItems = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Certificates', href: '#certifications' },
  { label: 'Contact', href: '#contact' },
]

const mobileNavItems = [
  { label: 'Home', href: '#hero', icon: FiHome },
  { label: 'About', href: '#about', icon: FiUser },
  { label: 'Projects', href: '#projects', icon: FiFolder },
  { label: 'Certs', href: '#certifications', icon: FiAward },
  { label: 'Contact', href: '#contact', icon: FiMail },
]

export default function Navbar({ theme, toggleTheme }) {
  const [scrolled, setScrolled] = useState(false)
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
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <a href="#" className="brand-monogram" onClick={e => handleNavClick(e, '#hero')} aria-label="Home">
        ayush<span className="accent">.</span>dev
      </a>

      {/* Desktop top navbar */}
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
          </div>
        </div>
      </nav>

      {/* Mobile bottom icon navbar */}
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {mobileNavItems.map(item => {
          const Icon = item.icon
          const isActive = activeSection === item.href.slice(1) || 
            (item.href === '#hero' && !activeSection)
          return (
            <a
              key={item.href}
              href={item.href}
              className={`mobile-bottom-nav-item ${isActive ? 'active' : ''}`}
              onClick={e => handleNavClick(e, item.href)}
              aria-label={item.label}
            >
              <Icon />
            </a>
          )
        })}
        <button
          className="mobile-bottom-nav-item theme-toggle-mobile"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <FiSun /> : <FiMoon />}
        </button>
      </nav>
    </>
  )
}
