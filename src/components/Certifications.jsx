import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FiAward } from 'react-icons/fi'
import { AnimatedSectionHeader, MagneticCard, smoothEase } from './animations'

const certCardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.8, rotateZ: -3 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1, rotateZ: 0,
    transition: {
      type: 'spring',
      stiffness: 140,
      damping: 16,
      delay: i * 0.1,
    }
  }),
}

const iconSpin = {
  hidden: { opacity: 0, rotate: -120, scale: 0 },
  visible: (i) => ({
    opacity: 1, rotate: 0, scale: 1,
    transition: {
      type: 'spring',
      stiffness: 250,
      damping: 14,
      delay: i * 0.1 + 0.2,
    }
  }),
}

const certifications = [
  { name: 'AWS Cloud Practitioner', issuer: 'Amazon Web Services', year: '2024' },
  { name: 'Meta Front-End Developer', issuer: 'Meta (Coursera)', year: '2023' },
  { name: 'Node.js Application Developer', issuer: 'OpenJS Foundation', year: '2023' },
  { name: 'Docker Certified Associate', issuer: 'Docker, Inc.', year: '2024' },
  { name: 'Google UX Design', issuer: 'Google (Coursera)', year: '2022' },
  { name: 'MongoDB Associate Developer', issuer: 'MongoDB University', year: '2023' },
]

export default function Certifications() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const gridY = useTransform(scrollYProgress, [0, 1], [30, -30])

  return (
    <section id="certifications" ref={ref}>
      <div className="container">
        <AnimatedSectionHeader label="Certificates" title="Certificates & Achievements" />

        <motion.div className="certs-grid" style={{ y: gridY }}>
          {certifications.map((cert, i) => (
            <MagneticCard key={i} className="glass-card cert-card">
              <motion.div
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={certCardVariants}
              >
                <motion.div
                  className="cert-icon"
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={iconSpin}
                >
                  <FiAward />
                </motion.div>
                <h4>{cert.name}</h4>
                <div className="cert-issuer">{cert.issuer}</div>
                <div className="cert-year">{cert.year}</div>
              </motion.div>
            </MagneticCard>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
