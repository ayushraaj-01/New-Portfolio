import { useState, useEffect } from 'react'
import { motion, useScroll, useSpring, useMotionValueEvent } from 'framer-motion'

export default function BackToTop() {
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })
  const [visible, setVisible] = useState(false)
  const [pct, setPct] = useState(0)

  // rAF-throttled visibility + percent updates.
  // Hides while the footer (which has its own "Back to top" pill) is on screen
  // so there is never a duplicate option at the end of the page.
  useEffect(() => {
    let rafId = null
    let footerEl = null
    const update = () => {
      rafId = null
      if (!footerEl || !footerEl.isConnected) footerEl = document.querySelector('.footer')
      const footerOnScreen = footerEl
        ? footerEl.getBoundingClientRect().top < window.innerHeight - 40
        : false
      setVisible(window.scrollY > 480 && !footerOnScreen)
    }
    const onScroll = () => {
      if (rafId === null) rafId = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [])

  useMotionValueEvent(progress, 'change', (v) => {
    const next = Math.round(Math.min(Math.max(v, 0), 1) * 100)
    setPct((prev) => (prev === next ? prev : next))
  })

  const scrollToTop = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <button
      type="button"
      className={`back-to-top${visible ? ' visible' : ''}`}
      onClick={scrollToTop}
      aria-label={visible ? `Back to top — ${pct}% scrolled` : 'Back to top'}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      title="Back to top"
    >
      <svg className="btt-ring" viewBox="0 0 48 48" aria-hidden="true">
        <circle className="btt-ring-bg" cx="24" cy="24" r="20" />
        <motion.circle
          className="btt-ring-fill"
          cx="24"
          cy="24"
          r="20"
          style={{ pathLength: progress }}
        />
      </svg>
      <svg className="btt-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
      <span className="btt-pct" aria-hidden="true">{pct}%</span>
    </button>
  )
}
