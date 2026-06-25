import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { AnimatedSectionHeader } from './animations'

const initialNodes = [
  // Core category nodes (White)
  { id: 'Backend Core', label: 'Backend Core', color: '#ffffff', size: 20, isCore: true },
  { id: 'Frontend Core', label: 'Frontend Core', color: '#ffffff', size: 20, isCore: true },
  { id: 'Language Core', label: 'Language Core', color: '#ffffff', size: 20, isCore: true },
  { id: 'Tooling Core', label: 'Tooling Core', color: '#ffffff', size: 20, isCore: true },

  // Backend (connected to Backend Core) -> Green/Emerald
  { id: 'Node.js', label: 'Node.js', color: '#10b981', size: 13 },
  { id: 'Express', label: 'Express', color: '#10b981', size: 13 },
  { id: 'MySQL', label: 'MySQL', color: '#10b981', size: 13 },
  { id: 'MongoDB', label: 'MongoDB', color: '#10b981', size: 13 },
  { id: 'REST APIs', label: 'REST APIs', color: '#10b981', size: 13 },
  { id: 'JWT', label: 'JWT', color: '#10b981', size: 13 },
  { id: 'Socket.io', label: 'Socket.io', color: '#10b981', size: 13 },
  { id: 'Go', label: 'Go', color: '#10b981', size: 13 },

  // Frontend (connected to Frontend Core) -> Blue/Cyan
  { id: 'React', label: 'React', color: '#3b82f6', size: 13 },
  { id: 'Next.js', label: 'Next.js', color: '#3b82f6', size: 13 },
  { id: 'Tailwind CSS', label: 'Tailwind CSS', color: '#3b82f6', size: 13 },
  { id: 'HTML/CSS', label: 'HTML/CSS', color: '#3b82f6', size: 13 },
  { id: 'JavaScript', label: 'JavaScript', color: '#3b82f6', size: 13 },

  // Languages & Algorithms (connected to Language Core) -> Purple
  { id: 'Python', label: 'Python', color: '#8b5cf6', size: 13 },
  { id: 'C', label: 'C', color: '#8b5cf6', size: 13 },
  { id: 'C++', label: 'C++', color: '#8b5cf6', size: 13 },
  { id: 'Java', label: 'Java', color: '#8b5cf6', size: 13 },

  // Tools & DevOps (connected to Tooling Core) -> Pink/Crimson
  { id: 'Git', label: 'Git', color: '#ec4899', size: 13 },
  { id: 'Docker', label: 'Docker', color: '#ec4899', size: 13 },
  { id: 'Vercel', label: 'Vercel', color: '#ec4899', size: 13 },
  { id: 'Postman', label: 'Postman', color: '#ec4899', size: 13 },
  { id: 'npm', label: 'npm', color: '#ec4899', size: 13 },
]

const initialLinks = [
  { source: 'Backend Core', target: 'Node.js' },
  { source: 'Backend Core', target: 'Express' },
  { source: 'Backend Core', target: 'MySQL' },
  { source: 'Backend Core', target: 'MongoDB' },
  { source: 'Backend Core', target: 'REST APIs' },
  { source: 'Backend Core', target: 'JWT' },
  { source: 'Backend Core', target: 'Socket.io' },
  { source: 'Backend Core', target: 'Go' },

  { source: 'Frontend Core', target: 'React' },
  { source: 'Frontend Core', target: 'Next.js' },
  { source: 'Frontend Core', target: 'Tailwind CSS' },
  { source: 'Frontend Core', target: 'HTML/CSS' },
  { source: 'Frontend Core', target: 'JavaScript' },

  { source: 'Language Core', target: 'Python' },
  { source: 'Language Core', target: 'C' },
  { source: 'Language Core', target: 'C++' },
  { source: 'Language Core', target: 'Java' },

  { source: 'Tooling Core', target: 'Git' },
  { source: 'Tooling Core', target: 'Docker' },
  { source: 'Tooling Core', target: 'Vercel' },
  { source: 'Tooling Core', target: 'Postman' },
  { source: 'Tooling Core', target: 'npm' },
  
  // Inter-core connections
  { source: 'Backend Core', target: 'Frontend Core' },
  { source: 'Frontend Core', target: 'Tooling Core' },
  { source: 'Tooling Core', target: 'Language Core' },
  { source: 'Language Core', target: 'Backend Core' },
]

export default function Skills() {
  const ref = useRef(null)
  const containerRef = useRef(null)
  const [nodes, setNodes] = useState([])
  const [draggedNode, setDraggedNode] = useState(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const requestRef = useRef(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const width = 900
  const height = 500
  const centerX = width / 2
  const centerY = height / 2

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [40, -40])

  // Initialize node positions clustered around central parent core nodes
  useEffect(() => {
    const initializedNodes = initialNodes.map((node) => {
      let x, y
      if (node.isCore) {
        if (node.id === 'Backend Core') { x = centerX; y = centerY - 130 }
        else if (node.id === 'Frontend Core') { x = centerX + 200; y = centerY }
        else if (node.id === 'Language Core') { x = centerX - 200; y = centerY }
        else { x = centerX; y = centerY + 130 }
      } else {
        // Find which core this node is linked to
        const link = initialLinks.find(l => l.target === node.id)
        let px = centerX
        let py = centerY
        if (link) {
          if (link.source === 'Backend Core') { px = centerX; py = centerY - 130 }
          else if (link.source === 'Frontend Core') { px = centerX + 200; py = centerY }
          else if (link.source === 'Language Core') { px = centerX - 200; py = centerY }
          else if (link.source === 'Tooling Core') { px = centerX; py = centerY + 130 }
        }
        const angle = Math.random() * Math.PI * 2
        const radius = 60 + Math.random() * 50
        x = px + Math.cos(angle) * radius
        y = py + Math.sin(angle) * radius
      }

      return {
        ...node,
        x,
        y,
        vx: 0,
        vy: 0,
      }
    })
    setNodes(initializedNodes)
  }, [])

  // Physics loop using requestAnimationFrame
  useEffect(() => {
    if (nodes.length === 0) return

    const step = () => {
      setNodes((currentNodes) => {
        const updatedNodes = currentNodes.map(n => ({ ...n }))
        const nodeMap = {}
        updatedNodes.forEach(n => { nodeMap[n.id] = n })

        const k = 0.05 // link tension coefficient
        const repulseStrength = 1500 // node repulsion charge
        const centerPull = 0.002 // center gravity

        // 1. Repulsion force between all nodes
        for (let i = 0; i < updatedNodes.length; i++) {
          const nodeA = updatedNodes[i]
          for (let j = i + 1; j < updatedNodes.length; j++) {
            const nodeB = updatedNodes[j]
            const dx = nodeB.x - nodeA.x
            const dy = nodeB.y - nodeA.y
            const distSq = dx * dx + dy * dy || 1
            const dist = Math.sqrt(distSq)

            const minDistance = nodeA.size + nodeB.size + 95
            if (dist < minDistance) {
              const force = (minDistance - dist) * 0.12
              const fx = (dx / dist) * force
              const fy = (dy / dist) * force

              if (nodeA.id !== draggedNode) {
                nodeA.vx -= fx
                nodeA.vy -= fy
              }
              if (nodeB.id !== draggedNode) {
                nodeB.vx += fx
                nodeB.vy += fy
              }
            } else {
              const force = repulseStrength / distSq
              const fx = (dx / dist) * force
              const fy = (dy / dist) * force

              if (nodeA.id !== draggedNode) {
                nodeA.vx -= fx
                nodeA.vy -= fy
              }
              if (nodeB.id !== draggedNode) {
                nodeB.vx += fx
                nodeB.vy += fy
              }
            }
          }
        }

        // 2. Link tension pulling connected nodes
        initialLinks.forEach((link) => {
          const nodeA = nodeMap[link.source]
          const nodeB = nodeMap[link.target]
          if (!nodeA || !nodeB) return

          const dx = nodeB.x - nodeA.x
          const dy = nodeB.y - nodeA.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1

          const targetDist = nodeA.isCore && nodeB.isCore ? 240 : 130
          const force = (dist - targetDist) * k
          const fx = (dx / dist) * force
          const fy = (dy / dist) * force

          if (nodeA.id !== draggedNode) {
            nodeA.vx += fx
            nodeA.vy += fy
          }
          if (nodeB.id !== draggedNode) {
            nodeB.vx -= fx
            nodeB.vy -= fy
          }
        })

        // 3. Gravity center pull
        updatedNodes.forEach((node) => {
          if (node.id === draggedNode) return
          const dx = centerX - node.x
          const dy = centerY - node.y
          node.vx += dx * centerPull
          node.vy += dy * centerPull
        })

        // 4. Update positions based on accumulated velocities
        updatedNodes.forEach((node) => {
          if (node.id === draggedNode) return

          node.x += node.vx
          node.y += node.vy

          // Friction damping
          node.vx *= 0.76
          node.vy *= 0.76

          // Bound within viewport limits to prevent node & label text clipping
          const padX = isMobile ? 175 : 65
          const padTop = isMobile ? 50 : 40
          const padBottom = isMobile ? 75 : 55
          if (node.x < padX) { node.x = padX; node.vx *= -0.5 }
          if (node.x > width - padX) { node.x = width - padX; node.vx *= -0.5 }
          if (node.y < padTop) { node.y = padTop; node.vy *= -0.5 }
          if (node.y > height - padBottom) { node.y = height - padBottom; node.vy *= -0.5 }
        })

        return updatedNodes
      })

      requestRef.current = requestAnimationFrame(step)
    }

    requestRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(requestRef.current)
  }, [nodes, draggedNode])

  // Drag start handler
  const handleStartDrag = (nodeId, e) => {
    if (e.cancelable) e.preventDefault()
    setDraggedNode(nodeId)
    
    const clientX = (e.touches && e.touches.length > 0) ? e.touches[0].clientX : e.clientX
    const clientY = (e.touches && e.touches.length > 0) ? e.touches[0].clientY : e.clientY

    if (!containerRef.current) return
    const svg = containerRef.current.getBoundingClientRect()
    const scaleX = width / svg.width
    const scaleY = height / svg.height

    const mouseX = (clientX - svg.left) * scaleX
    const mouseY = (clientY - svg.top) * scaleY

    const clickedNode = nodes.find(n => n.id === nodeId)
    if (clickedNode) {
      dragOffset.current = {
        x: mouseX - clickedNode.x,
        y: mouseY - clickedNode.y,
      }
    }
  }

  // Global drag move handler
  const handleDrag = useCallback((e) => {
    if (!draggedNode) return
    if (e.cancelable) e.preventDefault()
    
    const clientX = (e.touches && e.touches.length > 0) ? e.touches[0].clientX : e.clientX
    const clientY = (e.touches && e.touches.length > 0) ? e.touches[0].clientY : e.clientY

    if (!containerRef.current) return
    const svg = containerRef.current.getBoundingClientRect()
    const scaleX = width / svg.width
    const scaleY = height / svg.height

    const mouseX = (clientX - svg.left) * scaleX
    const mouseY = (clientY - svg.top) * scaleY

    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        if (node.id === draggedNode) {
          const padX = isMobile ? 175 : 65
          const padTop = isMobile ? 50 : 40
          const padBottom = isMobile ? 75 : 55
          return {
            ...node,
            x: Math.max(padX, Math.min(width - padX, mouseX - dragOffset.current.x)),
            y: Math.max(padTop, Math.min(height - padBottom, mouseY - dragOffset.current.y)),
            vx: 0,
            vy: 0,
          }
        }
        return node
      })
    )
  }, [draggedNode, width, height])

  // Release drag handler
  const handleEndDrag = useCallback(() => {
    setDraggedNode(null)
  }, [])

  // Setup window-level drag-drop listeners while active
  useEffect(() => {
    if (draggedNode) {
      window.addEventListener('mousemove', handleDrag)
      window.addEventListener('mouseup', handleEndDrag)
      window.addEventListener('touchmove', handleDrag, { passive: false })
      window.addEventListener('touchend', handleEndDrag)
    }

    return () => {
      window.removeEventListener('mousemove', handleDrag)
      window.removeEventListener('mouseup', handleEndDrag)
      window.removeEventListener('touchmove', handleDrag)
      window.removeEventListener('touchend', handleEndDrag)
    }
  }, [draggedNode, handleDrag, handleEndDrag])

  return (
    <section id="skills" ref={ref} style={{ perspective: '1000px' }}>
      <div className="container">
        <AnimatedSectionHeader label="Skills" title="My tech stack" />

        <motion.div className="skills-graph-container" style={{ y }} ref={containerRef}>
          <svg className="skills-graph-svg" viewBox={isMobile ? "140 20 620 460" : "0 0 900 500"}>
            <defs>
              <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Link Connection Lines */}
            {initialLinks.map((link, idx) => {
              const sourceNode = nodes.find(n => n.id === link.source)
              const targetNode = nodes.find(n => n.id === link.target)
              if (!sourceNode || !targetNode) return null

              const isCoreToCore = sourceNode.isCore && targetNode.isCore
              
              // Determine line color and opacity based on connection type
              let lineColor
              if (isCoreToCore) {
                lineColor = "var(--accent)"
              } else {
                // Use the category color of the target tech node
                lineColor = targetNode.color || sourceNode.color
              }

              return (
                <line
                  key={idx}
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={lineColor}
                  strokeOpacity={isCoreToCore ? 0.35 : 0.25}
                  strokeWidth={isCoreToCore ? 2 : 1.2}
                />
              )
            })}

            {/* Interactive Graph Nodes */}
            {nodes.map((node) => (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                style={{ cursor: draggedNode === node.id ? 'grabbing' : 'grab' }}
                onMouseDown={(e) => handleStartDrag(node.id, e)}
                onTouchStart={(e) => handleStartDrag(node.id, e)}
              >
                {/* Glow ring */}
                <circle
                  r={node.size + 4}
                  fill="transparent"
                  stroke={node.isCore ? 'var(--accent)' : node.color}
                  strokeWidth={0.5}
                  opacity={node.isCore ? 0.4 : 0.22}
                  style={{ filter: `drop-shadow(0 0 4px ${node.isCore ? 'var(--accent)' : node.color})` }}
                />
                {/* Core node solid circle */}
                <circle
                  r={node.size}
                  fill={node.isCore ? 'var(--text-primary)' : node.color}
                  stroke={node.isCore ? 'var(--border)' : 'none'}
                  strokeWidth={1}
                />
                {/* Text Label */}
                <text
                  y={node.size + (isMobile ? 17 : 15)}
                  textAnchor="middle"
                  fill={node.isCore ? 'var(--text-primary)' : 'var(--text-secondary)'}
                  fontSize={node.isCore ? (isMobile ? '12px' : '10.5px') : (isMobile ? '11px' : '9.5px')}
                  fontFamily="var(--font-display)"
                  fontWeight={node.isCore ? '700' : '500'}
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
                >
                  {node.label}
                </text>
              </g>
            ))}
          </svg>
          <div className="skills-graph-info">Drag nodes to explore_</div>
        </motion.div>
      </div>
    </section>
  )
}
