import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion'

/* ─── Shared Easing ─── */
export const smoothEase = [0.16, 1, 0.3, 1]
export const snapEase = [0.77, 0, 0.175, 1]

/* ─── Cinematic Word/Line Mask Reveal ─── */
const wordRevealVariants = {
  hidden: { opacity: 0, y: '120%', rotateX: -30, scale: 0.95 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: {
      duration: 0.9,
      ease: smoothEase,
      delay: i * 0.06,
    },
  }),
}

const labelVariants = {
  hidden: { opacity: 0, y: 15, letterSpacing: '8px' },
  visible: {
    opacity: 1,
    y: 0,
    letterSpacing: '3px',
    transition: { duration: 0.8, ease: smoothEase },
  },
}

export function AnimatedSectionHeader({ label, title }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, margin: '-120px' })
  const words = title.split(' ')

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // Subtle horizontal scroll drift for section label
  const labelX = useTransform(scrollYProgress, [0, 1], [-25, 25])
  const smoothLabelX = useSpring(labelX, { stiffness: 90, damping: 25 })

  return (
    <div className="section-header" ref={ref}>
      <div style={{ overflow: 'hidden', padding: '4px 0' }}>
        <motion.span
          className="section-label"
          style={{ x: smoothLabelX }}
          variants={labelVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {label}
        </motion.span>
      </div>

      <h2 className="section-title" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.25em', overflow: 'hidden', perspective: '800px' }}>
        {words.map((word, i) => (
          <span key={i} style={{ display: 'inline-block', overflow: 'hidden', paddingBottom: '0.12em' }}>
            <motion.span
              custom={i}
              variants={wordRevealVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              style={{ display: 'inline-block', originY: '100%' }}
            >
              {word}
            </motion.span>
          </span>
        ))}
      </h2>

      <div style={{ overflow: 'hidden', width: '100%', display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
        <motion.div
          className="section-line"
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 1.1, ease: smoothEase, delay: 0.2 }}
          style={{ margin: 0 }}
        />
      </div>
    </div>
  )
}

/* ─── Section Divider (animated horizontal line wipe) ─── */
export function SectionDivider() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <div className="section-divider-wrapper" ref={ref}>
      <motion.div
        className="section-divider"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
        transition={{ duration: 1.2, ease: smoothEase }}
      />
      <motion.div
        className="section-divider-dot"
        initial={{ scale: 0, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.5, type: 'spring', stiffness: 300 }}
      />
    </div>
  )
}

/* ─── Parallax Wrapper ─── */
export function ParallaxSection({ children, speed = 0.15, className = '', id = '' }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [speed * 100, -speed * 100])
  const smoothY = useSpring(y, { stiffness: 80, damping: 20 })

  return (
    <section id={id} ref={ref} className={className} style={{ position: 'relative', overflow: 'hidden' }}>
      <motion.div style={{ y: smoothY }}>
        {children}
      </motion.div>
    </section>
  )
}

/* ─── Reveal on Scroll (mask wipe from bottom) ─── */
export function RevealOnScroll({ children, width = '100%', delay = 0 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <div ref={ref} style={{ position: 'relative', width, overflow: 'hidden' }}>
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.8, ease: smoothEase, delay }}
      >
        {children}
      </motion.div>
    </div>
  )
}

/* ─── Magnetic hover effect for cards ─── */
export function MagneticCard({ children, className = '', style = {} }) {
  const ref = useRef(null)

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    ref.current.style.transform = `perspective(800px) rotateY(${x * 0.02}deg) rotateX(${-y * 0.02}deg) translateY(-4px)`
  }

  const handleMouseLeave = () => {
    ref.current.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) translateY(0px)'
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{ ...style, transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)', willChange: 'transform' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}

/* ─── Staggered Grid Animation ─── */
export const staggerGrid = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
}

export const gridItemUp = {
  hidden: { opacity: 0, y: 40, scale: 0.94, filter: 'blur(4px)' },
  visible: {
    opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
    transition: { duration: 0.7, ease: smoothEase },
  },
}

export const gridItemLeft = {
  hidden: { opacity: 0, x: -30, filter: 'blur(4px)' },
  visible: {
    opacity: 1, x: 0, filter: 'blur(0px)',
    transition: { duration: 0.7, ease: smoothEase },
  },
}

export const gridItemRight = {
  hidden: { opacity: 0, x: 30, filter: 'blur(4px)' },
  visible: {
    opacity: 1, x: 0, filter: 'blur(0px)',
    transition: { duration: 0.7, ease: smoothEase },
  },
}

export const scaleReveal = {
  hidden: { opacity: 0, scale: 0.8, filter: 'blur(6px)' },
  visible: {
    opacity: 1, scale: 1, filter: 'blur(0px)',
    transition: { duration: 0.8, ease: smoothEase },
  },
}

export const rotateIn = {
  hidden: { opacity: 0, rotate: -4, y: 30 },
  visible: {
    opacity: 1, rotate: 0, y: 0,
    transition: { duration: 0.7, ease: smoothEase },
  },
}
