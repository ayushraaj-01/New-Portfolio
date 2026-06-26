import { useState, useEffect } from 'react'
import { FiHome, FiUser, FiFolder, FiAward, FiMail } from 'react-icons/fi'

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
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 32 32"
                aria-hidden="true"
                strokeWidth=".7"
                stroke="currentColor"
                fill="currentColor"
                strokeLinecap="round"
                className="lightbulb-svg"
              >
                {/* Bulb outline */}
                <path
                  strokeWidth={0}
                  d="M9.4 9.9c1.8-1.8 4.1-2.7 6.6-2.7 5.1 0 9.3 4.2 9.3 9.3 0 2.3-.8 4.4-2.3 6.1-.7.8-2 2.8-2.5 4.4 0 .2-.2.4-.5.4-.2 0-.4-.2-.4-.5v-.1c.5-1.8 2-3.9 2.7-4.8 1.4-1.5 2.1-3.5 2.1-5.6 0-4.7-3.7-8.5-8.4-8.5-2.3 0-4.4.9-5.9 2.5-1.6 1.6-2.5 3.7-2.5 6 0 2.1.7 4 2.1 5.6.8.9 2.2 2.9 2.7 4.9 0 .2-.1.5-.4.5h-.1c-.2 0-.4-.1-.4-.4-.5-1.7-1.8-3.7-2.5-4.5-1.5-1.7-2.3-3.9-2.3-6.1 0-2.3 1-4.7 2.7-6.5z"
                />
                {/* Cap lines */}
                <path d="M19.8 28.3h-7.6" />
                <path d="M19.8 29.5h-7.6" />
                <path d="M19.8 30.7h-7.6" />
                {/* Filament */}
                <path
                  pathLength={1}
                  fill="none"
                  d="M14.6 27.1c0-3.4 0-6.8-.1-10.2-.2-1-1.1-1.7-2-1.7-1.2-.1-2.3 1-2.2 2.3.1 1 .9 1.9 2.1 2h7.2c1.1-.1 2-1 2.1-2 .1-1.2-1-2.3-2.2-2.3-.9 0-1.7.7-2 1.7 0 3.4 0 6.8-.1 10.2"
                  className="lightbulb-filament"
                />
                {/* Rays */}
                <g className="lightbulb-rays">
                  <path d="M16 6.4V1.3" strokeWidth={1.5} pathLength={1} />
                  <path d="M26.3 15.8h5.1" strokeWidth={1.5} pathLength={1} />
                  <path d="m22.6 9 3.7-3.6" strokeWidth={1.5} pathLength={1} />
                  <path d="M9.4 9 5.7 5.4" strokeWidth={1.5} pathLength={1} />
                  <path d="M5.7 15.8H.6" strokeWidth={1.5} pathLength={1} />
                </g>
              </svg>
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
          <svg
            width="1em"
            height="1em"
            viewBox="0 0 32 32"
            aria-hidden="true"
            strokeWidth=".7"
            stroke="currentColor"
            fill="currentColor"
            strokeLinecap="round"
            className="lightbulb-svg"
          >
            {/* Bulb outline */}
            <path
              strokeWidth={0}
              d="M9.4 9.9c1.8-1.8 4.1-2.7 6.6-2.7 5.1 0 9.3 4.2 9.3 9.3 0 2.3-.8 4.4-2.3 6.1-.7.8-2 2.8-2.5 4.4 0 .2-.2.4-.5.4-.2 0-.4-.2-.4-.5v-.1c.5-1.8 2-3.9 2.7-4.8 1.4-1.5 2.1-3.5 2.1-5.6 0-4.7-3.7-8.5-8.4-8.5-2.3 0-4.4.9-5.9 2.5-1.6 1.6-2.5 3.7-2.5 6 0 2.1.7 4 2.1 5.6.8.9 2.2 2.9 2.7 4.9 0 .2-.1.5-.4.5h-.1c-.2 0-.4-.1-.4-.4-.5-1.7-1.8-3.7-2.5-4.5-1.5-1.7-2.3-3.9-2.3-6.1 0-2.3 1-4.7 2.7-6.5z"
            />
            {/* Cap lines */}
            <path d="M19.8 28.3h-7.6" />
            <path d="M19.8 29.5h-7.6" />
            <path d="M19.8 30.7h-7.6" />
            {/* Filament */}
            <path
              pathLength={1}
              fill="none"
              d="M14.6 27.1c0-3.4 0-6.8-.1-10.2-.2-1-1.1-1.7-2-1.7-1.2-.1-2.3 1-2.2 2.3.1 1 .9 1.9 2.1 2h7.2c1.1-.1 2-1 2.1-2 .1-1.2-1-2.3-2.2-2.3-.9 0-1.7.7-2 1.7 0 3.4 0 6.8-.1 10.2"
              className="lightbulb-filament"
            />
            {/* Rays */}
            <g className="lightbulb-rays">
              <path d="M16 6.4V1.3" strokeWidth={1.5} pathLength={1} />
              <path d="M26.3 15.8h5.1" strokeWidth={1.5} pathLength={1} />
              <path d="m22.6 9 3.7-3.6" strokeWidth={1.5} pathLength={1} />
              <path d="M9.4 9 5.7 5.4" strokeWidth={1.5} pathLength={1} />
              <path d="M5.7 15.8H.6" strokeWidth={1.5} pathLength={1} />
            </g>
          </svg>
        </button>
      </nav>
    </>
  )
}
