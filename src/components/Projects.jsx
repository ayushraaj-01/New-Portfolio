import { useRef, useCallback } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FiGithub, FiExternalLink } from 'react-icons/fi'
import { AnimatedSectionHeader, smoothEase } from './animations'

const cardVariants = {
  hidden: (i) => ({
    opacity: 0,
    y: 80,
    rotateX: 12,
    scale: 0.88,
    filter: 'blur(8px)',
  }),
  visible: (i) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.9,
      delay: i * 0.15,
      ease: smoothEase,
    }
  }),
}

const tagVariants = {
  hidden: { opacity: 0, scale: 0.5, y: 8 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring', stiffness: 350, damping: 20 }
  },
}

const projects = [
  {
    number: '01',
    title: 'Real-Time Chat App',
    description: 'A responsive real-time chat application featuring instant message delivery, user authentication, and group channel creation.',
    expandedInfo: 'Designed and built with Socket.io for bidirectional communication, Node.js/Express for backend logic, and MySQL for persistent chat and user records.',
    tags: ['React', 'Node.js', 'Socket.io', 'MySQL', 'JWT'],
    github: 'https://github.com/ayushraaj-01/realtime-chat-app',
  },
  {
    number: '02',
    title: 'URL Shortener',
    description: 'A lightweight and fast URL shortening service featuring click analytics tracking, custom alias support, and redirection statistics.',
    expandedInfo: 'Developed with Node.js and Express for URL redirection logic, MongoDB/Mongoose for analytics storage, and a React frontend for the dashboard interface.',
    tags: ['React', 'Node.js', 'Express', 'MongoDB'],
    github: 'https://github.com/ayushraaj-01/URL-shortner',
  },
  {
    number: '03',
    title: 'AuraBlog',
    description: 'A modern blogging platform featuring user authentication, rich text editing, posts categorization, and a dynamic commenting system.',
    expandedInfo: 'Built with React for a seamless responsive frontend interface, Node.js/Express for building backend REST APIs, JWT for secure sessions, and MySQL for content storage.',
    tags: ['React', 'Node.js', 'Express', 'MySQL', 'JWT'],
    github: 'https://github.com/ayushraaj-01/AuraBlog',
  },
  {
    number: '04',
    title: 'Event Booking Platform',
    description: 'A robust event booking and management system featuring real-time seat reservation, secure checkout, and QR ticket delivery.',
    expandedInfo: 'Created with React for a dynamic seat map interface, Node.js/Express for ticket booking logic, Socket.io for handling temporary seat holds, and MySQL for transaction logs.',
    tags: ['React', 'Node.js', 'Socket.io', 'MySQL', 'JWT'],
    github: 'https://github.com/ayushraaj-01/Event-Booking-Platform',
  },
  {
    number: '05',
    title: 'Netflix Clone',
    description: 'A feature-rich replica of Netflix with profile selection, interactive video/trailer trailers playback, and dynamic search features.',
    expandedInfo: 'Built with React for UI components, Tailwind CSS for layout styling, Firebase for authentication, and TMDB API for streaming content metadata.',
    tags: ['React', 'Firebase', 'Tailwind CSS', 'TMDB API'],
    github: 'https://github.com/ayushraaj-01/netflix-clone-anti/tree/main/OneDrive/Desktop/clone',
  },
]

export default function Projects() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const gridY = useTransform(scrollYProgress, [0, 1], [50, -50])

  // Mouse-follow glow on project cards
  const handleMouseMove = useCallback((e) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    card.style.setProperty('--mouse-x', `${x}%`)
    card.style.setProperty('--mouse-y', `${y}%`)
  }, [])

  return (
    <section id="projects" ref={sectionRef} style={{ perspective: '1200px' }}>
      <div className="container">
        <AnimatedSectionHeader label="Projects" title="Featured work" />

        <motion.div className="projects-grid" style={{ y: gridY }}>
          {projects.map((project, i) => (
            <motion.div
              key={project.number}
              className="glass-card project-card"
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={cardVariants}
              onMouseMove={handleMouseMove}
              whileHover={{
                y: -10,
                scale: 1.02,
                rotateX: -2,
                transition: { duration: 0.35, ease: 'easeOut' }
              }}
            >
              <div className="project-card-inner">
                <motion.div
                  className="project-number"
                  initial={{ opacity: 0, x: -30, filter: 'blur(4px)' }}
                  whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 + 0.3, duration: 0.6, ease: smoothEase }}
                >
                  PROJECT {project.number}
                </motion.div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <motion.div
                  className="project-tags"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={{ visible: { transition: { staggerChildren: 0.06, delayChildren: i * 0.15 + 0.4 } } }}
                >
                  {project.tags.map(tag => (
                    <motion.span key={tag} className="project-tag" variants={tagVariants}>
                      {tag}
                    </motion.span>
                  ))}
                </motion.div>
                <div className="project-links">
                  <motion.a
                    href={project.github}
                    className="project-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${project.title} GitHub`}
                    whileHover={{ x: 4, color: '#00d4ff' }}
                  >
                    <FiGithub /> Code
                  </motion.a>
                  {project.demo && (
                    <motion.a
                      href={project.demo}
                      className="project-link"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${project.title} live demo`}
                      whileHover={{ x: 4, color: '#00d4ff' }}
                    >
                      <FiExternalLink /> Live Demo
                    </motion.a>
                  )}
                </div>
              </div>
              <div className="project-expand">
                <p>{project.expandedInfo}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
