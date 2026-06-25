import { FiGithub, FiLinkedin } from 'react-icons/fi'
import { FaXTwitter } from 'react-icons/fa6'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <p>
            Built by <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Ayush Raj</span> © {year}
          </p>
          <div className="footer-socials">
            <a
              href="https://github.com/ayushraaj-01"
              className="footer-social-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <FiGithub />
            </a>
            <a
              href="https://linkedin.com/in/ayush-raj-3849a1335/"
              className="footer-social-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <FiLinkedin />
            </a>
            <a
              href="https://x.com/AyushRa80083799"
              className="footer-social-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (formerly Twitter)"
            >
              <FaXTwitter />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
