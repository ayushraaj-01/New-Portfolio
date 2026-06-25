import { useRef, useCallback, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { FiGithub, FiExternalLink } from 'react-icons/fi'
import { AnimatedSectionHeader } from './animations'

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
  const targetRef = useRef(null)
  const [maxTranslate, setMaxTranslate] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(0)

  useEffect(() => {
    const handleResize = () => {
      const vw = window.innerWidth
      setViewportHeight(window.innerHeight)

      const isSmallMobile = vw <= 600
      const isMobile = vw <= 968
      const cardWidth = isSmallMobile ? 290 : (isMobile ? 320 : 420)
      const gap = isSmallMobile ? 16 : (isMobile ? 20 : 32)
      const padding = isSmallMobile ? 40 : (isMobile ? 80 : 160)
      const numCards = projects.length
      
      const trackWidth = numCards * cardWidth + (numCards - 1) * gap + padding
      setMaxTranslate(Math.max(0, trackWidth - vw))
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Trackpad horizontal swipe → vertical scroll mapper (desktop only)
  useEffect(() => {
    const element = targetRef.current
    if (!element) return

    const handleWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault()
        window.scrollBy({ top: e.deltaX, behavior: 'auto' })
      }
    }

    element.addEventListener('wheel', handleWheel, { passive: false })
    return () => element.removeEventListener('wheel', handleWheel)
  }, [])

  const { scrollYProgress } = useScroll({
    target: targetRef,
  })

  // Map vertical scroll progress to horizontal pixel translation
  const x = useTransform(scrollYProgress, [0.05, 0.95], [0, -maxTranslate])
  const smoothX = useSpring(x, { stiffness: 150, damping: 28, restDelta: 0.5 })

  // Mouse-follow glow on project cards
  const handleMouseMove = useCallback((e) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const mx = ((e.clientX - rect.left) / rect.width) * 100
    const my = ((e.clientY - rect.top) / rect.height) * 100
    card.style.setProperty('--mouse-x', `${mx}%`)
    card.style.setProperty('--mouse-y', `${my}%`)
  }, [])

  return (
    <section 
      ref={targetRef} 
      className="projects-sticky-section" 
      id="projects"
      style={{ height: `${viewportHeight + maxTranslate}px` }}
    >
      <div className="projects-sticky-wrapper">
        <div className="projects-header-container">
          <AnimatedSectionHeader label="Projects" title="My projects" />
        </div>

        <motion.div 
          className="projects-horizontal-track" 
          style={{ x: smoothX }}
        >

          {/* Project Items */}
          {projects.map((project, i) => (
            <motion.div
              key={project.number}
              className="project-card"
              onMouseMove={handleMouseMove}
              whileHover={{
                y: -10,
                scale: 1.02,
                transition: { duration: 0.35, ease: 'easeOut' }
              }}
            >
              <div className="project-card-inner">
                <div className="project-number">
                  PROJECT {project.number}
                </div>
                <div>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                </div>
                <div>
                  <div className="project-tags">
                    {project.tags.map(tag => (
                      <span key={tag} className="project-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
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

