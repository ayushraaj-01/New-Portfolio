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

const contactLinks = [
  { icon: <FiMail />, label: 'ayushr94150@gmail.com', href: 'mailto:ayushr94150@gmail.com' },
  { icon: <FiGithub />, label: 'ayushraaj-01', href: 'https://github.com/ayushraaj-01' },
  { icon: <FiLinkedin />, label: 'ayush-raj-3849a1335', href: 'https://linkedin.com/in/ayush-raj-3849a1335/' },
  { icon: <FaXTwitter />, label: '@AyushRa80083799', href: 'https://x.com/AyushRa80083799' },
]

export default function Contact() {
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
            <div className="contact-links">
              {contactLinks.map((link, i) => (
                <motion.a
                  key={i}
                  href={link.href}
                  className="contact-link-item"
                  target="_blank"
                  rel="noopener noreferrer"
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={linkItemVariants}
                  whileHover={{ x: 10, scale: 1.02, transition: { duration: 0.25 } }}
                >
                  <div className="icon">{link.icon}</div>
                  <span>{link.label}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.form
            className="contact-form glass-card"
            onSubmit={handleSubmit}
            variants={fadeInRight}
            style={{ padding: '32px', x: rightX }}
          >
            <div className="form-group">
              <input
                type="text"
                id="contact-name"
                placeholder="Your name"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                id="contact-email"
                placeholder="Your email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <textarea
                id="contact-message"
                placeholder="Your message"
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
              ) : submitted ? (
                '✓ Message Sent!'
              ) : error ? (
                '❌ Failed to send'
              ) : (
                <><FiSend /> Send Message</>
              )}
            </motion.button>
          </motion.form>
        </motion.div>
      </div>
    </section>
  )
}
