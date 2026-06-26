import { useEffect, useState, useRef } from 'react'

export default function CursorDot() {
  const catRef = useRef(null)
  const [hovering, setHovering] = useState(false)
  const [clicked, setClicked] = useState(false)
  const [visible, setVisible] = useState(false)
  const [ripples, setRipples] = useState([])

  useEffect(() => {
    // Only show cursor on non-touch devices
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if (isTouch) return

    const pos = { x: 0, y: 0 }

    const onMouseMove = (e) => {
      pos.x = e.clientX
      pos.y = e.clientY
      if (!visible) setVisible(true)

      if (catRef.current) {
        catRef.current.style.left = `${pos.x}px`
        catRef.current.style.top = `${pos.y}px`
      }
    }

    const onMouseOver = (e) => {
      const target = e.target
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.classList.contains('skill-chip') ||
        target.classList.contains('project-card') ||
        target.closest('.skill-chip') ||
        target.closest('.project-card')
      ) {
        setHovering(true)
      } else {
        setHovering(false)
      }
    }

    const onMouseDown = (e) => {
      setClicked(true)
      const newRipple = {
        id: Math.random().toString(36).substring(2, 9),
        x: e.clientX,
        y: e.clientY
      }
      setRipples(prev => [...prev, newRipple])
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id))
      }, 600)
    }

    const onMouseUp = () => {
      setClicked(false)
    }

    const onMouseLeave = () => {
      setVisible(false)
    }

    const onMouseEnter = () => {
      setVisible(true)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseover', onMouseOver)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('mouseenter', onMouseEnter)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseover', onMouseOver)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mouseenter', onMouseEnter)
    }
  }, [visible])

  if (!visible && typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
    return null
  }

  const isOpen = hovering || clicked

  return (
    <>
      <div
        ref={catRef}
        className={`popcat-cursor ${isOpen ? 'open' : 'closed'}`}
        style={{ opacity: visible ? 1 : 0 }}
      >
        <img
          src={isOpen ? '/popcat2.png' : '/popcat1.png'}
          alt="Popcat Cursor"
        />
      </div>
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="pop-ripple"
          style={{
            left: `${ripple.x}px`,
            top: `${ripple.y}px`,
          }}
        />
      ))}
    </>
  )
}

