/**
 * Sound for the signature nameplate: a short airy rustle as the letters let go,
 * and a soft thud when they land. Everything is synthesised with Web Audio, so
 * there is no asset to load and the effect can retrigger on every click.
 */

let ctx = null
let noise = null

// Browsers only allow audio after a gesture. The entrance drop runs before one,
// so it stays silent until the visitor first taps, clicks or types.
let unlocked = false

if (typeof window !== 'undefined') {
  const unlock = () => {
    unlocked = true
  }
  window.addEventListener('pointerdown', unlock, { capture: true, once: true })
  window.addEventListener('keydown', unlock, { capture: true, once: true })
}

function audio() {
  if (typeof window === 'undefined') return null
  const Ctx = window.AudioContext || window.webkitAudioContext
  if (!Ctx) return null
  if (!ctx) ctx = new Ctx()
  return ctx
}

function noiseBuffer(c) {
  if (noise) return noise
  const frames = Math.floor(c.sampleRate)
  noise = c.createBuffer(1, frames, c.sampleRate)
  const data = noise.getChannelData(0)
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1
  return noise
}

// A fresh context starts suspended; play the voices once it is allowed to run.
function whenReady(play) {
  const c = audio()
  if (!c) return
  if (c.state === 'running') play(c)
  else if (c.state === 'suspended') c.resume().then(() => play(c)).catch(() => {})
}

/** Airy fall: band-passed noise sweeping down as the letters drop. */
export function playFall() {
  if (!unlocked) return
  whenReady((c) => {
    const t = c.currentTime

    const src = c.createBufferSource()
    src.buffer = noiseBuffer(c)

    const band = c.createBiquadFilter()
    band.type = 'bandpass'
    band.Q.value = 0.8
    band.frequency.setValueAtTime(2800, t)
    band.frequency.exponentialRampToValueAtTime(260, t + 0.8)

    const gain = c.createGain()
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.06, t + 0.16)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.85)

    src.connect(band).connect(gain).connect(c.destination)
    src.start(t)
    src.stop(t + 0.9)
  })
}

/** Soft thud for the moment the letters settle. */
export function playLand() {
  if (!unlocked) return
  whenReady((c) => {
    const t = c.currentTime

    const osc = c.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(160, t)
    osc.frequency.exponentialRampToValueAtTime(56, t + 0.22)

    const gain = c.createGain()
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.1, t + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3)

    osc.connect(gain).connect(c.destination)
    osc.start(t)
    osc.stop(t + 0.32)
  })
}
