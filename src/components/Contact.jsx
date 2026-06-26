import { useState, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FiMail, FiGithub, FiLinkedin, FiSend } from 'react-icons/fi'
import { FaXTwitter } from 'react-icons/fa6'
import { AnimatedSectionHeader, RevealOnScroll, smoothEase } from './animations'

const fadeInLeft = {
  hidden: { opacity: 0, x: -70, filter: 'blur(10px)' },
  visible: {
    opacity: 1, x: 0, filter: 'blur(0px)',
    transition: { duration: 0.9, ease: smoothEase }
  },
}

const fadeInRight = {
  hidden: { opacity: 0, x: 70, rotateY: -8, filter: 'blur(10px)' },
  visible: {
    opacity: 1, x: 0, rotateY: 0, filter: 'blur(0px)',
    transition: { duration: 0.9, ease: smoothEase }
  },
}

const linkItemVariants = {
  hidden: { opacity: 0, x: -40, filter: 'blur(4px)' },
  visible: (i) => ({
    opacity: 1, x: 0, filter: 'blur(0px)',
    transition: { duration: 0.6, delay: i * 0.12 + 0.3, ease: smoothEase }
  }),
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2, delayChildren: 0.1 } },
}

const desktopContactLinks = [
  { icon: <FiMail />, label: 'ayushr94150@gmail.com', href: 'mailto:ayushr94150@gmail.com' },
]

const mobileContactLinks = [
  { icon: <FiMail />, label: 'ayushr94150@gmail.com', href: 'mailto:ayushr94150@gmail.com' },
]

const mobileSocialLinks = [
  { icon: <FiGithub />, href: 'https://github.com/ayushraaj-01', label: 'GitHub' },
  { icon: <FiLinkedin />, href: 'https://linkedin.com/in/ayush-raj-3849a1335/', label: 'LinkedIn' },
  { icon: <FaXTwitter />, href: 'https://x.com/AyushRa80083799', label: 'X (formerly Twitter)' },
]

export default function Contact({ onTriggerSurprise }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(false)

  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const leftX = useTransform(scrollYProgress, [0, 0.5], [-30, 0])
  const rightX = useTransform(scrollYProgress, [0, 0.5], [30, 0])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(false)
    setSubmitted(false)

    try {
      const response = await fetch("https://formsubmit.co/ajax/ayushr94150@gmail.com", {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          _subject: "New Message from Portfolio Website",
          _captcha: "false"
        })
      })

      if (response.ok) {
        setSubmitted(true)
        setFormData({ name: '', email: '', message: '' })
        setTimeout(() => setSubmitted(false), 5000)
      } else {
        setError(true)
        setTimeout(() => setError(false), 5000)
      }
    } catch (err) {
      setError(true)
      setTimeout(() => setError(false), 5000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" ref={sectionRef} style={{ perspective: '1000px' }}>
      <div className="container">
        <AnimatedSectionHeader label="Contact" title="Let's connect" />

        <motion.div
          className="contact-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={staggerContainer}
        >
          <motion.div className="contact-info" variants={fadeInLeft} style={{ x: leftX }}>
            <RevealOnScroll>
              <h3>Get in touch</h3>
            </RevealOnScroll>
            <RevealOnScroll delay={0.1}>
              <p>
                I'm always open to new opportunities, collaborations, and interesting
                conversations. Whether you have a project in mind or just want to say
                hello — don't hesitate to reach out!
              </p>
            </RevealOnScroll>
            {/* Desktop Contact Links */}
            <div className="contact-links contact-links-desktop">
              {desktopContactLinks.map((link, i) => (
                <motion.a
                  key={i}
                  href={link.href}
                  className="contact-link-item"
                  target="_blank"
                  rel="noopener noreferrer"
                  custom={i}
                  variants={linkItemVariants}
                  whileHover={{ x: 10, scale: 1.02, transition: { duration: 0.25 } }}
                >
                  <div className="icon">{link.icon}</div>
                  <span>{link.label}</span>
                </motion.a>
              ))}
            </div>

            {/* Mobile Contact Links */}
            <div className="contact-links contact-links-mobile">
              {mobileContactLinks.map((link, i) => (
                <motion.a
                  key={i}
                  href={link.href}
                  className="contact-link-item"
                  target="_blank"
                  rel="noopener noreferrer"
                  custom={i}
                  variants={linkItemVariants}
                  whileHover={{ x: 10, scale: 1.02, transition: { duration: 0.25 } }}
                >
                  <div className="icon">{link.icon}</div>
                  <span>{link.label}</span>
                </motion.a>
              ))}

              <div className="contact-socials-row">
                {mobileSocialLinks.map((social, i) => (
                  <span key={i} style={{ display: 'contents' }}>
                    <motion.a
                      href={social.href}
                      className="contact-social-btn"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      custom={i + 1}
                      variants={linkItemVariants}
                      whileHover={{ scale: 1.1, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {social.icon}
                    </motion.a>
                    {i === 0 && (
                      <motion.button
                        type="button"
                        onClick={onTriggerSurprise}
                        className="contact-social-btn"
                        aria-label="Surprise"
                        custom={1.5}
                        variants={linkItemVariants}
                        whileHover={{ scale: 1.1, y: -3 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.25rem',
                          cursor: 'pointer'
                        }}
                      >
                        🪐
                      </motion.button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.form
            className="contact-form glass-card"
            onSubmit={handleSubmit}
            variants={fadeInRight}
            style={{ padding: '32px', x: rightX }}
          >
            <div className="form-group">
              <label htmlFor="contact-name" className="form-label">Name</label>
              <input
                type="text"
                id="contact-name"
                placeholder="e.g. John Doe"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact-email" className="form-label">Email</label>
              <input
                type="email"
                id="contact-email"
                placeholder="e.g. john@example.com"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact-message" className="form-label">Message</label>
              <textarea
                id="contact-message"
                placeholder="Hi Ayush, I'd love to work with you on..."
                required
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
              />
            </div>
            <motion.button
              type="submit"
              className="btn btn-primary btn-submit"
              id="contact-submit"
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
              whileHover={loading ? {} : { scale: 1.04, y: -2 }}
              whileTap={loading ? {} : { scale: 0.96 }}
            >
              {loading ? (
                'Sending...'
              ) : (
                <><FiSend /> Send Message</>
              )}
            </motion.button>
            {submitted && (
              <motion.div
                className="form-success-alert"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                ✓ Thank you! I will get back to you as soon as possible.
              </motion.div>
            )}
          </motion.form>
        </motion.div>
      </div>
    </section>
  )
}
