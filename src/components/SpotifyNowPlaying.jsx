import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiExternalLink } from 'react-icons/fi'
import { fetchSpotifyPresence, subscribeSpotifyPresence, getLastPlayed, DEFAULT_DISCORD_ID } from '../services/spotify'

export default function SpotifyNowPlaying() {
  const [data, setData] = useState(() => {
    // Seed from localStorage immediately so there's no blank flash
    const cached = getLastPlayed()
    return cached ? { isLive: false, isLastPlayed: true, track: cached } : null
  })
  const [loading, setLoading] = useState(true)

  // Real-time WebSocket sync + 6s cache-busting REST fallback
  useEffect(() => {
    let mounted = true

    const load = async () => {
      const res = await fetchSpotifyPresence(DEFAULT_DISCORD_ID)
      if (mounted) {
        setData(res)
        setLoading(false)
      }
    }
    load()

    // Subscribe to Lanyard WebSocket for instant <100ms live song updates
    const unsubscribe = subscribeSpotifyPresence(DEFAULT_DISCORD_ID, (newData) => {
      if (mounted) {
        setData(newData)
        setLoading(false)
      }
    })

    // Fallback polling every 6s
    const iv = setInterval(load, 6000)

    return () => {
      mounted = false
      unsubscribe()
      clearInterval(iv)
    }
  }, [])

  const track = data?.track
  const isLive = data?.isLive
  const isLastPlayed = data?.isLastPlayed

  // While loading AND no cached track to show, display skeleton
  if (loading && !track) {
    return (
      <div className="spotify-pill loading">
        <div className="sp-eq-mini">
          <span /><span /><span />
        </div>
        <span className="sp-loading-text">Connecting to Spotify…</span>
      </div>
    )
  }

  // No track at all
  if (!track) return null

  return (
    <div className="spotify-now-playing-wrapper">
      <motion.a
        href={track.spotifyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`spotify-pill ${isLive ? 'live' : ''} ${isLastPlayed ? 'last-played' : ''}`}
        whileHover={{ scale: 1.025, y: -2 }}
        whileTap={{ scale: 0.97 }}
        title="Open on Spotify"
      >
        {/* Album art with vinyl ring effect */}
        <div className={`sp-thumb ${isLive ? 'spinning' : ''}`}>
          <img
            src={track.albumArt}
            alt={track.album || 'Album'}
            draggable={false}
          />
          {isLive && <span className="sp-live-dot" />}
        </div>

        {/* Track info */}
        <div className="sp-track-info">
          <div className="sp-track-row">
            {isLive && (
              <div className="sp-eq-mini active" title="Playing Live on Spotify">
                <span /><span /><span />
              </div>
            )}
            <span className="sp-title">{track.title}</span>
            <span className="sp-sep">•</span>
            <span className="sp-artist">{track.artist}</span>
          </div>
        </div>

        {/* Open in Spotify Icon */}
        <div className="sp-open-link">
          <FiExternalLink />
        </div>
      </motion.a>
    </div>
  )
}
