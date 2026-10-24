import { useState, useEffect } from 'react'
import { fetchSpotifyPresence, subscribeSpotifyPresence, getLastPlayed, DEFAULT_DISCORD_ID } from '../services/spotify'

export default function SpotifyNowPlaying() {
  const [data, setData] = useState(() => {
    // Seed from localStorage immediately so there's no blank flash
    const cached = getLastPlayed()
    return cached ? { track: cached } : null
  })
  const [loading, setLoading] = useState(true)
  const [embedTheme, setEmbedTheme] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark' ? 1 : 0
  )

  // Real-time WebSocket sync + 6s cache-busting REST fallback.
  // Starts when the browser is idle so it never competes with first paint.
  useEffect(() => {
    let mounted = true
    let unsubscribe = null
    let iv = null
    let idleId = null

    const load = async () => {
      const res = await fetchSpotifyPresence(DEFAULT_DISCORD_ID)
      if (mounted && res?.track) {
        setData(res)
        setLoading(false)
      } else if (mounted && !res?.track) {
        setLoading(false)
      }
    }

    const start = () => {
      if (!mounted) return
      load()

      // Subscribe to Lanyard WebSocket for instant <100ms live track updates
      unsubscribe = subscribeSpotifyPresence(DEFAULT_DISCORD_ID, (newData) => {
        if (mounted && newData?.track) {
          setData(newData)
          setLoading(false)
        }
      })

      // Fallback polling every 6s — paused while the tab is hidden
      iv = setInterval(() => {
        if (!document.hidden) load()
      }, 6000)
    }

    if ('requestIdleCallback' in window) {
      idleId = requestIdleCallback(start, { timeout: 2500 })
    } else {
      idleId = setTimeout(start, 1200)
    }

    return () => {
      mounted = false
      if (idleId !== null) {
        if ('cancelIdleCallback' in window && typeof idleId === 'number') cancelIdleCallback(idleId)
        else clearTimeout(idleId)
      }
      if (unsubscribe) unsubscribe()
      if (iv) clearInterval(iv)
    }
  }, [])

  // Keep the embed in sync with the site theme (light = Spotify light, dark = Spotify dark)
  useEffect(() => {
    const html = document.documentElement
    const observer = new MutationObserver(() => {
      setEmbedTheme(html.getAttribute('data-theme') === 'dark' ? 1 : 0)
    })
    observer.observe(html, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  const track = data?.track

  // While loading AND no cached track to show, display skeleton
  if (loading && !track) {
    return (
      <div className="spotify-pill loading">
        <div className="sp-eq-mini active">
          <span /><span /><span />
        </div>
        <span className="sp-loading-text">Connecting to Spotify…</span>
      </div>
    )
  }

  // No track at all
  if (!track?.trackId) return null

  return (
    <div className="spotify-now-playing-wrapper">
      <div className="spotify-embed-frame">
        <iframe
          className="spotify-embed"
          title="Spotify player — now playing"
          src={`https://open.spotify.com/embed/track/${track.trackId}?utm_source=generator&theme=${embedTheme}`}
          width="100%"
          height="152"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </div>
    </div>
  )
}
