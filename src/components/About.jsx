import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion'
import { AnimatedSectionHeader, ParallaxSection, MagneticCard, RevealOnScroll, smoothEase } from './animations'
import { FiMapPin, FiBriefcase } from 'react-icons/fi'
import { LuGraduationCap } from 'react-icons/lu'

const fadeInLeft = {
  hidden: { opacity: 0, x: -80, filter: 'blur(10px)' },
  visible: {
    opacity: 1, x: 0, filter: 'blur(0px)',
    transition: { duration: 0.9, ease: smoothEase }
  },
}

const fadeInRight = {
  hidden: { opacity: 0, x: 80, filter: 'blur(10px)' },
  visible: {
    opacity: 1, x: 0, filter: 'blur(0px)',
    transition: { duration: 0.9, ease: smoothEase }
  },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.25, delayChildren: 0.1 } },
}

const statPop = {
  hidden: { opacity: 0, scale: 0, y: 30 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring', stiffness: 200, damping: 12 }
  },
}

export default function About() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], [60, -60])
  const textY = useTransform(scrollYProgress, [0, 1], [30, -30])
  const imageRotate = useTransform(scrollYProgress, [0, 0.5, 1], [-3, 0, 3])
  const smoothImageY = useSpring(imageY, { stiffness: 60, damping: 20 })
  const smoothTextY = useSpring(textY, { stiffness: 60, damping: 20 })

  return (
    <section id="about" ref={sectionRef} style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Inspired Background Vertical Scrolling Text */}
      <div className="sidebar-bg-text-container left">
        <div className="sidebar-bg-text">
          .JS • .JSX • .TS • .TSX • .HTML • .CSS • .MERN • .REACT • .NODE • .JS • .JSX • .TS • .TSX • .HTML • .CSS • .MERN • .REACT • .NODE
        </div>
      </div>
      <div className="sidebar-bg-text-container right">
        <div className="sidebar-bg-text">
          .GO • .PY • .CPP • .DSA • .CYBER • .SOLIDITY • .DOCKER • .GIT • .VITE • .GO • .PY • .CPP • .DSA • .CYBER • .SOLIDITY • .DOCKER • .GIT • .VITE
        </div>
      </div>

      <div className="container">
        <AnimatedSectionHeader label="About" title="Get to know me" />

        <motion.div
          className="about-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={staggerContainer}
        >
          <motion.div className="about-image-wrapper" variants={fadeInLeft}>
            <div className="about-image-glow" />
            <motion.img
              src="/profile.jpg"
              alt="Ayush Raj — Full-Stack Developer"
              className="about-image"
              loading="lazy"
              style={{ y: smoothImageY, rotate: imageRotate }}
            />
          </motion.div>

          <motion.div className="about-text" variants={fadeInRight} style={{ y: smoothTextY }}>
            <RevealOnScroll>
              <div className="about-meta">
                <span className="meta-item">
                  <FiMapPin className="meta-icon" /> New Delhi, India
                </span>
                <span className="meta-dot">•</span>
                <span className="meta-item">
                  <LuGraduationCap className="meta-icon" /> ABES Engineering College — B.Tech CSE (AI & ML)
                </span>
                <span className="meta-dot">•</span>
                <span className="meta-item">
                  <FiBriefcase className="meta-icon" /> Open to opportunities
                </span>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.05}>
              <h3 className="about-headline">
                Building real projects, <span className="gradient-text">evolving every day</span>
              </h3>
            </RevealOnScroll>
            
            <RevealOnScroll delay={0.1}>
              <p>
                I'm Ayush Raj, a third-year B.Tech CSE student at ABES Engineering College and a passionate full-stack developer. I specialize in the MERN stack to build responsive, user-centric web applications, while also exploring Go, Cybersecurity, and Blockchain.
              </p>
            </RevealOnScroll>
            <RevealOnScroll delay={0.2}>
              <p>
                Believing in learning by building, I constantly challenge myself through personal projects, open-source contributions, and solving DSA problems. Beyond coding, I've served as a PR & Outreach Coordinator, organizing community events and fostering developer growth.
              </p>
            </RevealOnScroll>
            <RevealOnScroll delay={0.3}>
              <p>
                Driven by curiosity, I'm always seeking opportunities to collaborate, build impactful technology, and grow both as an engineer and as a person.
              </p>
            </RevealOnScroll>

            <motion.div
              className="about-stats"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{ visible: { transition: { staggerChildren: 0.15, delayChildren: 0.5 } } }}
            >
              <motion.div className="stat-item" variants={statPop}>
                <div className="stat-number">30+</div>
                <div className="stat-label">GitHub Repos</div>
              </motion.div>
              <motion.div className="stat-item" variants={statPop}>
                <div className="stat-number">5+</div>
                <div className="stat-label">Projects Built</div>
              </motion.div>
              <motion.div className="stat-item" variants={statPop}>
                <div className="stat-number">9+</div>
                <div className="stat-label">Certifications</div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
