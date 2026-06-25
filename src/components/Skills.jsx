import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FiLayout, FiServer, FiTool, FiCode } from 'react-icons/fi'
import { AnimatedSectionHeader, MagneticCard, smoothEase } from './animations'

const cardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.85, rotateY: -10, filter: 'blur(10px)' },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1, rotateY: 0, filter: 'blur(0px)',
    transition: {
      duration: 0.8,
      delay: i * 0.18,
      ease: smoothEase,
    }
  }),
}

const chipVariants = {
  hidden: { opacity: 0, scale: 0, x: -8 },
  visible: {
    opacity: 1, scale: 1, x: 0,
    transition: { type: 'spring', stiffness: 400, damping: 20 }
  },
}

const categories = [
  {
    title: 'Languages',
    icon: <FiCode />,
    skills: ['C', 'C++', 'Java', 'JavaScript', 'Python'],
  },
  {
    title: 'Frontend',
    icon: <FiLayout />,
    skills: ['React', 'Next.js', 'Tailwind CSS', 'HTML/CSS'],
  },
  {
    title: 'Backend',
    icon: <FiServer />,
    skills: ['Node.js', 'Express', 'MySQL', 'MongoDB', 'REST APIs', 'JWT', 'Socket.io'],
  },
  {
    title: 'Tools & DevOps',
    icon: <FiTool />,
    skills: ['Git', 'Docker', 'Vercel', 'Postman', 'Render', 'npm'],
  },
]

export default function Skills() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [40, -40])

  return (
    <section id="skills" ref={ref} style={{ perspective: '1000px' }}>
      <div className="container">
        <AnimatedSectionHeader label="Skills" title="My tech stack" />

        <motion.div className="skills-grid" style={{ y }}>
          {categories.map((cat, i) => (
            <MagneticCard key={cat.title} className="glass-card skill-category">
              <motion.div
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                variants={cardVariants}
              >
                <motion.div
                  className="skill-category-icon"
                  initial={{ rotate: -30, scale: 0, opacity: 0 }}
                  whileInView={{ rotate: 0, scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18, delay: i * 0.18 + 0.2 }}
                >
                  {cat.icon}
                </motion.div>
                <h3>{cat.title}</h3>
                <motion.div
                  className="skill-chips"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={{ visible: { transition: { staggerChildren: 0.05, delayChildren: i * 0.18 + 0.35 } } }}
                >
                  {cat.skills.map(skill => (
                    <motion.span key={skill} className="skill-chip" variants={chipVariants}>
                      {skill}
                    </motion.span>
                  ))}
                </motion.div>
              </motion.div>
            </MagneticCard>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
