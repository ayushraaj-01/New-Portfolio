import { useEffect, useRef, useState } from 'react'

// Rigged humanoid character bundled with the site (no runtime CDN dependency).
// Contains clips: idle, agree, headShake, sad_pose, sneak_pose, walk, run.
const MODEL_URL = '/models/xbot.glb'

// One-shot gestures the character performs (walk/run excluded: they carry root motion)
const GESTURES = ['agree', 'headShake', 'sad_pose', 'sneak_pose']

// Only render on desktop widths; phones/tablets skip the whole three.js download.
const MIN_WIDTH = 1200

export default function HeroModel() {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const [enabled] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= MIN_WIDTH
  )
  const [status, setStatus] = useState('loading') // loading | ready | failed

  useEffect(() => {
    if (!enabled) return undefined

    let disposed = false
    let rafId = 0
    let idleId = null
    let bootStarted = false

    // three objects kept in closure for disposal
    let renderer = null
    let scene = null
    let camera = null
    let mixer = null
    let group = null
    let pmrem = null
    let envTex = null

    const removeListeners = []
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const boot = async () => {
      if (disposed) return
      bootStarted = true
      try {
        const [THREE, { GLTFLoader }] = await Promise.all([
          import('three'),
          import('three/examples/jsm/loaders/GLTFLoader.js'),
        ])
        if (disposed) return

        const canvas = canvasRef.current
        const wrap = wrapRef.current
        if (!canvas || !wrap) return

        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.1

        scene = new THREE.Scene()
        camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60)
        camera.position.set(0, 1.05, 4.7)
        camera.lookAt(0, 1.0, 0)

        // Lighting: soft studio key + warm amber rim so the figure pops in both themes
        const hemi = new THREE.HemisphereLight(0xffffff, 0x555555, 1.0)
        const key = new THREE.DirectionalLight(0xffffff, 2.1)
        key.position.set(3, 5, 4)
        const rim = new THREE.DirectionalLight(0xfbbf24, 2.8)
        rim.position.set(-4, 3.5, -3)
        const fill = new THREE.DirectionalLight(0xfff3d6, 0.55)
        fill.position.set(-2, 1, 3)
        scene.add(hemi, key, rim, fill)

        // Subtle environment reflections for the visor/metal parts (best effort)
        try {
          const { RoomEnvironment } = await import(
            'three/examples/jsm/environments/RoomEnvironment.js'
          )
          if (disposed) return
          pmrem = new THREE.PMREMGenerator(renderer)
          envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
          scene.environment = envTex
        } catch {
          /* reflections are optional */
        }

        // Load the character
        const loader = new GLTFLoader()
        const gltf = await new Promise((resolve, reject) =>
          loader.load(MODEL_URL, resolve, undefined, reject)
        )
        if (disposed) return

        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())
        const scale = 1.9 / (size.y || 1)
        model.scale.setScalar(scale)
        model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale)

        group = new THREE.Group()
        group.add(model)
        scene.add(group)

        // ── Animation state machine: idle base + one-shot gestures ──
        const clipFor = (name) => gltf.animations.find((c) => c.name === name)
        const idleClip = clipFor('idle') || gltf.animations[0]
        if (idleClip) mixer = new THREE.AnimationMixer(model)
        const idleAction = mixer && idleClip ? mixer.clipAction(idleClip) : null
        idleAction?.play()

        let current = null // active one-shot action
        let lastGesture = ''
        let nextActionAt = Infinity

        const onFinished = (e) => {
          if (!e.action || e.action === idleAction) return
          e.action.crossFadeTo(idleAction, 0.45, false)
          if (current === e.action) current = null
          canvas.dataset.action = 'idle'
          nextActionAt = performance.now() + 4000 + Math.random() * 3000
        }

        const playGesture = (name) => {
          if (disposed || reduced || !mixer || !idleAction) return
          const clip = clipFor(name)
          if (!clip || name === lastGesture) return
          const next = mixer.clipAction(clip)
          next.reset()
          next.setLoop(THREE.LoopOnce)
          next.clampWhenFinished = true // hold the pose until we blend back
          next.play()
          if (current && current !== next && current.isRunning()) {
            current.crossFadeTo(next, 0.3, false) // interrupt: go gesture → gesture
          } else {
            idleAction.crossFadeTo(next, 0.3, false)
          }
          current = next
          lastGesture = name
          canvas.dataset.action = name
          nextActionAt = performance.now() + 7000 + Math.random() * 3000
        }

        const pickGesture = () => {
          const pool = GESTURES.filter((g) => clipFor(g) && g !== lastGesture)
          if (!pool.length) return
          playGesture(pool[Math.floor(Math.random() * pool.length)])
        }

        if (mixer) {
          mixer.addEventListener('finished', onFinished)
          removeListeners.push(() => mixer?.removeEventListener('finished', onFinished))
        }

        // Click the character to make it act immediately
        const onCanvasClick = () => pickGesture()
        if (!reduced) {
          canvas.addEventListener('click', onCanvasClick)
          removeListeners.push(() => canvas.removeEventListener('click', onCanvasClick))
        }
        canvas.dataset.action = 'idle'
        nextActionAt = performance.now() + 3500 // first gesture shortly after appearing

        // Sizing
        const resize = () => {
          if (!renderer || !wrap) return
          const w = wrap.clientWidth
          const h = wrap.clientHeight
          if (!w || !h) return
          renderer.setSize(w, h, false)
          camera.aspect = w / h
          camera.updateProjectionMatrix()
        }
        resize()
        const ro = new ResizeObserver(resize)
        ro.observe(wrap)
        removeListeners.push(() => ro.disconnect())

        // Mouse parallax (desktop only, off for reduced motion)
        let targetY = 0
        let targetX = 0
        let curY = 0
        let curX = 0
        const hero = canvas.closest('.hero')
        const onMove = (e) => {
          targetY = (e.clientX / window.innerWidth - 0.5) * 0.55
          targetX = (e.clientY / window.innerHeight - 0.5) * 0.12
        }
        if (hero && !reduced) {
          hero.addEventListener('pointermove', onMove, { passive: true })
          removeListeners.push(() => hero.removeEventListener('pointermove', onMove))
        }

        // Pause rendering while the hero is off-screen or tab hidden
        let inView = true
        const io = new IntersectionObserver(([entry]) => (inView = entry.isIntersecting), {
          threshold: 0.02,
        })
        io.observe(wrap)
        removeListeners.push(() => io.disconnect())

        // Render loop + gesture scheduler
        const onVisChange = () => {
          if (!document.hidden) last = performance.now()
        }
        document.addEventListener('visibilitychange', onVisChange)
        removeListeners.push(() =>
          document.removeEventListener('visibilitychange', onVisChange)
        )

        let last = performance.now()
        const tick = (now) => {
          rafId = requestAnimationFrame(tick)
          if (disposed || document.hidden || !inView || window.innerWidth < MIN_WIDTH) {
            last = now
            return
          }
          const dt = Math.min((now - last) / 1000, 0.05)
          last = now
          if (!reduced) {
            if (mixer) mixer.update(dt)
            // schedule the next autonomous gesture
            if (!current && now >= nextActionAt) pickGesture()
            // mouse parallax
            curY += (targetY - curY) * 0.055
            curX += (targetX - curX) * 0.055
            group.rotation.y = curY
            group.rotation.x = curX * 0.35
          }
          renderer.render(scene, camera)
        }
        rafId = requestAnimationFrame(tick)

        setStatus('ready')
      } catch (err) {
        if (!disposed) {
          console.warn('Hero 3D model failed to load:', err)
          setStatus('failed')
        }
      }
    }

    // Never compete with first paint
    if ('requestIdleCallback' in window) {
      idleId = requestIdleCallback(boot, { timeout: 3000 })
    } else {
      idleId = setTimeout(boot, 1500)
    }

    return () => {
      disposed = true
      if (idleId !== null) {
        if ('cancelIdleCallback' in window && typeof idleId === 'number') {
          cancelIdleCallback(idleId)
        } else {
          clearTimeout(idleId)
        }
      }
      if (!bootStarted) return
      cancelAnimationFrame(rafId)
      removeListeners.forEach((fn) => fn())
      if (mixer) mixer.stopAllAction()
      if (scene) {
        scene.traverse((obj) => {
          obj.geometry?.dispose?.()
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
          mats.forEach((m) => {
            if (!m) return
            m.map?.dispose?.()
            m.dispose?.()
          })
        })
      }
      envTex?.dispose?.()
      pmrem?.dispose?.()
      renderer?.dispose?.()
    }
  }, [enabled])

  if (!enabled || status === 'failed') return null

  return (
    <div
      ref={wrapRef}
      className={`hero-model ${status === 'ready' ? 'active' : ''}`}
      aria-hidden="true"
    >
      <div className="hero-model-placeholder" />
      <canvas ref={canvasRef} title="" />
      <div className="hero-model-shadow" />
    </div>
  )
}
