import { useEffect, useState, useRef } from 'react'

export default function CursorDot() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const [hovering, setHovering] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Only show cursor on non-touch devices
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if (isTouch) return

    const pos = { x: 0, y: 0 }
    const ring = { x: 0, y: 0 }

    const onMouseMove = (e) => {
      pos.x = e.clientX
      pos.y = e.clientY
      if (!visible) setVisible(true)

      if (dotRef.current) {
        dotRef.current.style.left = `${pos.x - 4}px`
        dotRef.current.style.top = `${pos.y - 4}px`
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
        target.classList.contains('project-card')
      ) {
        setHovering(true)
      } else {
        setHovering(false)
      }
    }

    const onMouseLeave = () => {
      setVisible(false)
    }

    let animFrame
    const animate = () => {
      ring.x += (pos.x - ring.x) * 0.15
      ring.y += (pos.y - ring.y) * 0.15
      if (ringRef.current) {
        ringRef.current.style.left = `${ring.x - 18}px`
        ringRef.current.style.top = `${ring.y - 18}px`
      }
      animFrame = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseover', onMouseOver)
    document.addEventListener('mouseleave', onMouseLeave)
    animFrame = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseover', onMouseOver)
      document.removeEventListener('mouseleave', onMouseLeave)
      cancelAnimationFrame(animFrame)
    }
  }, [visible])

  if (!visible && typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
    return null
  }

  return (
    <>
      <div
        ref={dotRef}
        className={`cursor-dot ${hovering ? 'hovering' : ''}`}
        style={{ opacity: visible ? 1 : 0 }}
      />
      <div
        ref={ringRef}
        className={`cursor-ring ${hovering ? 'hovering' : ''}`}
        style={{ opacity: visible ? 1 : 0 }}
      />
    </>
  )
}
