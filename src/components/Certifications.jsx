import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FiAward, FiExternalLink } from 'react-icons/fi'
import { AnimatedSectionHeader, MagneticCard } from './animations'

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
  { 
    name: 'InnoVault IIC DTU', 
    issuer: 'Delhi Technological University (DTU)', 
    year: '2026',
    link: 'https://unstop.com/certificate-preview/6882c0c7-9be2-4016-8f57-b5351e6fbe47' 
  },
  { 
    name: 'The Verdict MLNC', 
    issuer: 'Motilal Nehru College, University of Delhi', 
    year: '2025',
    link: 'https://unstop.com/certificate-preview/d0a2c611-242e-451c-ac7d-337cebf7de7d' 
  },
  { 
    name: 'Daksh Sparkfest', 
    issuer: 'GL Bajaj Institute of Technology & Management', 
    year: '2025',
    link: 'https://unstop.com/certificate-preview/b99deb65-3927-48b1-b5ce-e1578be6552f' 
  },
  { 
    name: 'Hack4Health Hackathon', 
    issuer: 'Indraprastha Institute of Information Technology, Delhi', 
    year: '2025',
    link: 'https://unstop.com/certificate-preview/a9601f7c-f97a-4fea-ad93-3069fd322813' 
  },
  { 
    name: 'CodeMatrix: Genesis Hackathon', 
    issuer: 'GDG DR AITD, Kanpur', 
    year: '2025',
    link: 'https://unstop.com/certificate-preview/92b2ec32-4bd3-44e6-886a-f79835a2e4a7' 
  },
  { 
    name: 'Protex: Hack-2-Win Hackathon', 
    issuer: 'Protege, IGDTUW', 
    year: '2024',
    link: 'https://unstop.com/user/certificates' 
  },
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
              <a
                href={cert.link}
                target="_blank"
                rel="noopener noreferrer"
                className="cert-card-link"
              >
                <FiExternalLink className="cert-card-arrow" />
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
              </a>
            </MagneticCard>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
