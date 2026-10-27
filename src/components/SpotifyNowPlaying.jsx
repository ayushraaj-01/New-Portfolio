import { useState, useEffect } from 'react'
import { FiClock } from 'react-icons/fi'
import {
  fetchSpotifyPresence,
  subscribeSpotifyPresence,
  getLastPlayed,
  getPreviousTrack,
  DEFAULT_DISCORD_ID,
  SPOTIFY_POLL_MS,
} from '../services/spotify'

function Equalizer() {
  return (
    <span className="sp-eq-mini active" aria-hidden="true">
      <span /><span /><span />
    </span>
  )
}

export default function SpotifyNowPlaying() {
  const [data, setData] = useState(() => {
    // Seed from localStorage immediately so there's no blank flash
    const cached = getLastPlayed()
    return cached ? { isLive: false, isLastPlayed: true, track: cached } : null
  })
  const [previous, setPrevious] = useState(() => getPreviousTrack())
  // null = follow the live state; 'last' pins the previously played track.
  const [view, setView] = useState(null)
  const [loading, setLoading] = useState(true)
  const [embedTheme, setEmbedTheme] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark' ? 1 : 0
  )

  // Immediate first load, then a fast poll (paused while the tab is hidden) plus
  // a refresh the moment the tab regains focus.
  useEffect(() => {
    let mounted = true
    let unsubscribe = null
    let iv = null

    const apply = (res) => {
      if (!mounted || !res?.track) return
      setData(res)
      setPrevious(getPreviousTrack())
      setLoading(false)
    }

    const load = async () => {
      const res = await fetchSpotifyPresence(DEFAULT_DISCORD_ID)
      if (!mounted) return
      if (res?.track) apply(res)
      setLoading(false)
    }

    load()

    // Lanyard WebSocket for instant live track updates.
    // When playback is live, Lanyard's "not listening" pushes are ignored
    // so an offline Discord status does not wipe out active playback.
    unsubscribe = subscribeSpotifyPresence(DEFAULT_DISCORD_ID, (next) => {
      if (!next?.track) return
      setData((current) => {
        if (current?.isLive && !next.isLive) {
          return current
        }
        setPrevious(getPreviousTrack())
        setLoading(false)
        return next
      })
    })

    iv = setInterval(() => {
      if (!document.hidden) load()
    }, SPOTIFY_POLL_MS)

    const onWake = () => {
      if (!document.hidden) load()
    }
    document.addEventListener('visibilitychange', onWake)
    window.addEventListener('focus', onWake)

    return () => {
      mounted = false
      if (unsubscribe) unsubscribe()
      if (iv) clearInterval(iv)
      document.removeEventListener('visibilitychange', onWake)
      window.removeEventListener('focus', onWake)
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

  const liveTrack = data?.isLive ? data.track : null
  const lastTrack = data?.isLive ? previous : data?.track
  const canSwitch = Boolean(
    liveTrack && lastTrack && lastTrack.trackId && lastTrack.trackId !== liveTrack.trackId
  )
  const showLast = view === 'last' && canSwitch
  const track = showLast ? lastTrack : data?.track
  const showingLive = Boolean(data?.isLive && !showLast && track)

  // While loading AND no cached track to show, display skeleton
  if (loading && !track) {
    return (
      <div className="spotify-pill loading">
        <Equalizer />
        <span className="sp-loading-text">Connecting to Spotify…</span>
      </div>
    )
  }

  // No track at all
  if (!track?.trackId) return null

  return (
    <div className="spotify-now-playing-wrapper">
      <div className="spotify-card-head">
        {canSwitch ? (
          <div className="spotify-switch" role="tablist" aria-label="Spotify track">
            <button
              type="button"
              role="tab"
              aria-selected={!showLast}
              className={`spotify-tab${showLast ? '' : ' active'}`}
              onClick={() => setView('now')}
            >
              <Equalizer />
              Now playing
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={showLast}
              className={`spotify-tab${showLast ? ' active' : ''}`}
              onClick={() => setView('last')}
            >
              <FiClock aria-hidden="true" />
              Last listened
            </button>
          </div>
        ) : (
          <span className={`spotify-status${data?.isLive ? ' live' : ''}`}>
            {data?.isLive ? (
              <>
                <Equalizer />
                Now playing
              </>
            ) : (
              <>
                <FiClock aria-hidden="true" />
                Last listened
              </>
            )}
          </span>
        )}
      </div>

      <div className="spotify-embed-frame">
        <iframe
          className="spotify-embed"
          title={showingLive ? 'Spotify player — now playing' : 'Spotify player — last listened'}
          src={`https://open.spotify.com/embed/${track.kind === 'episode' ? 'episode' : 'track'}/${track.trackId}?utm_source=generator&theme=${embedTheme}`}
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
