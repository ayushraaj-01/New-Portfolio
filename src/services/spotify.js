// Spotify Data Service
// Supports:
// 1. Direct Spotify Web API (via Spotify Developer OAuth Refresh Token — works 24/7 without Discord)
// 2. Lanyard API (Discord→Spotify presence)
// 3. Last-Played localStorage cache

// ─── DISCORD USER ID FOR LIVE SYNC ───
export const DEFAULT_DISCORD_ID = "1461037977420693703"

// ─── OPTIONAL DIRECT SPOTIFY WEB API CREDENTIALS (.env) ───
const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || ""
const SPOTIFY_CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || ""
const SPOTIFY_REFRESH_TOKEN = import.meta.env.VITE_SPOTIFY_REFRESH_TOKEN || ""

const CACHE_KEY = "sp_last_played"
const PREV_KEY = "sp_prev_track"

// How often the live playback is polled while the tab is visible.
export const SPOTIFY_POLL_MS = 2500

/** True when the build has app credentials, so the Spotify Web API can be polled directly. */
export const HAS_SPOTIFY_APP_CREDS = Boolean(
  SPOTIFY_CLIENT_ID && SPOTIFY_CLIENT_SECRET && SPOTIFY_REFRESH_TOKEN
)

// Access tokens live for an hour — reuse one across polls instead of asking for a
// new token every 6 seconds.
let tokenCache = { token: null, expiresAt: 0 }

/** Save a live track to localStorage, keeping the outgoing one as "last listened" */
function cacheLastPlayed(track) {
  try {
    const previous = getLastPlayed()
    if (previous?.trackId && previous.trackId !== track.trackId) {
      localStorage.setItem(PREV_KEY, JSON.stringify(previous))
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(track))
  } catch (_) {}
}

/** The track that was playing before the current one */
export function getPreviousTrack() {
  try {
    const raw = localStorage.getItem(PREV_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (_) {
    return null
  }
}

/** Read last played track from localStorage */
export function getLastPlayed() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (_) {
    return null
  }
}

/**
 * Gets a fresh Spotify API Access Token using OAuth Refresh Token.
 */
async function getSpotifyAccessToken() {
  if (!HAS_SPOTIFY_APP_CREDS) return null

  const now = Date.now()
  if (tokenCache.token && now < tokenCache.expiresAt) return tokenCache.token

  try {
    const basic = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: SPOTIFY_REFRESH_TOKEN,
      }),
    })

    if (!res.ok) return null
    const data = await res.json()
    if (!data.access_token) return null

    tokenCache = {
      token: data.access_token,
      // Renew a minute early so a poll never races the expiry.
      expiresAt: now + Math.max(60, (data.expires_in || 3600) - 60) * 1000,
    }
    return tokenCache.token
  } catch (e) {
    console.warn("Spotify token fetch failed:", e)
    return null
  }
}

/**
 * Normalises a Spotify track (or podcast episode) into the shape the UI expects.
 */
function toTrack(item) {
  const isEpisode = item.type === 'episode'
  return {
    title: item.name,
    artist: isEpisode
      ? item.show?.name || ''
      : item.artists?.map((a) => a.name).join(', ') || '',
    album: isEpisode ? item.show?.name || '' : item.album?.name || '',
    albumArt: (isEpisode ? item.images?.[0]?.url : item.album?.images?.[0]?.url) || null,
    spotifyUrl: item.external_urls?.spotify || null,
    trackId: item.id,
    kind: isEpisode ? 'episode' : 'track',
  }
}

/**
 * Fetches currently playing or recently played track from the serverless endpoint (/api/spotify).
 * Works securely on Vercel as well as the Vite local dev server.
 */
let serverEndpointAvailable = true

async function fetchServerSpotifyAPI() {
  if (!serverEndpointAvailable) return null

  try {
    const res = await fetch('/api/spotify', {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    })

    if (res.status === 404) {
      serverEndpointAvailable = false
      return null
    }

    if (res.ok) {
      const data = await res.json()
      if (data && data.track) {
        cacheLastPlayed(data.track)
        return data
      }
      if (data && data.isLive === false && !data.track) {
        const cached = getLastPlayed()
        return { isLive: false, isLastPlayed: !!cached, track: cached || null }
      }
    }
  } catch (_) {
    // If serverless endpoint fails or network error, silently fall back
  }
  return null
}

/**
 * Fetches currently playing or recently played track directly from Spotify API servers 24/7.
 */
async function fetchDirectSpotifyAPI() {
  try {
    const accessToken = await getSpotifyAccessToken()
    if (!accessToken) return null

    // 1. Query currently playing on Spotify (including podcast episodes)
    const nowRes = await fetch("https://api.spotify.com/v1/me/player/currently-playing?additional_types=track,episode", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (nowRes.status === 200) {
      const nowData = await nowRes.json()
      if (nowData && nowData.item) {
        const track = toTrack(nowData.item)
        cacheLastPlayed(track)
        return {
          isLive: Boolean(nowData.is_playing),
          isLastPlayed: !nowData.is_playing,
          track,
        }
      }
    }

    // 2. Query recently played if not currently active
    const recentRes = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=1", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (recentRes.status === 200) {
      const recentData = await recentRes.json()
      const item = recentData.items?.[0]?.track
      if (item) {
        const track = toTrack(item)
        cacheLastPlayed(track)
        return { isLive: false, isLastPlayed: true, track }
      }
    }
  } catch (e) {
    console.warn("Direct Spotify API fetch error:", e)
  }
  return null
}

/**
 * Fetches current Spotify track via Serverless API, Direct Spotify API, or Lanyard.
 */
export async function fetchSpotifyPresence(discordId = DEFAULT_DISCORD_ID) {
  // 1. Serverless /api/spotify check (most secure, works on Vercel and local Vite dev)
  const serverData = await fetchServerSpotifyAPI()
  if (serverData && serverData.track) return serverData

  // 2. Direct Spotify Web API check (if client-side credentials exist)
  const directData = await fetchDirectSpotifyAPI()
  if (directData && directData.track) return directData

  // 3. Lanyard API Fallback (Discord)
  if (!discordId) {
    const cached = getLastPlayed()
    return { isLive: false, isLastPlayed: !!cached, track: cached || null }
  }

  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${discordId}?t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    })
    if (!res.ok) throw new Error("Lanyard returned " + res.status)
    const json = await res.json()

    if (json.success && json.data?.listening_to_spotify && json.data.spotify) {
      const s = json.data.spotify
      const track = {
        title: s.song,
        artist: s.artist,
        album: s.album,
        albumArt: s.album_art_url,
        spotifyUrl: `https://open.spotify.com/track/${s.track_id}`,
        trackId: s.track_id,
        kind: 'track',
      }
      cacheLastPlayed(track)
      return { isLive: true, isLastPlayed: false, track }
    }

    if (json.success) {
      const cached = getLastPlayed()
      if (cached) {
        return { isLive: false, isLastPlayed: true, track: cached }
      }
    }
  } catch (err) {
    console.warn("Lanyard fetch failed:", err)
    const cached = getLastPlayed()
    if (cached) {
      return { isLive: false, isLastPlayed: true, track: cached }
    }
  }

  return { isLive: false, isLastPlayed: false, track: null }
}

/**
 * Real-time Lanyard WebSocket Subscriber.
 * Connects to wss://api.lanyard.rest/socket for instant live track updates (<100ms).
 */
export function subscribeSpotifyPresence(discordId = DEFAULT_DISCORD_ID, onUpdate) {
  let ws = null
  let heartbeatTimer = null
  let isCleanedUp = false

  const connect = () => {
    if (isCleanedUp) return

    try {
      ws = new WebSocket('wss://api.lanyard.rest/socket')

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          // Opcode 1: Hello message containing heartbeat_interval
          if (data.op === 1) {
            const interval = data.d.heartbeat_interval
            heartbeatTimer = setInterval(() => {
              if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ op: 3 }))
              }
            }, interval)

            // Send opcode 2 (subscribe to discordId)
            ws.send(JSON.stringify({
              op: 2,
              d: { subscribe_to_id: discordId }
            }))
          }

          // Opcode 0: Event message (INIT_STATE or PRESENCE_UPDATE)
          if (data.op === 0 && (data.t === 'INIT_STATE' || data.t === 'PRESENCE_UPDATE')) {
            const d = data.d
            if (d?.listening_to_spotify && d.spotify) {
              const s = d.spotify
              const track = {
                title: s.song,
                artist: s.artist,
                album: s.album,
                albumArt: s.album_art_url,
                spotifyUrl: `https://open.spotify.com/track/${s.track_id}`,
                trackId: s.track_id,
              }
              cacheLastPlayed(track)
              onUpdate({ isLive: true, isLastPlayed: false, track })
            } else {
              const cached = getLastPlayed()
              onUpdate({ isLive: false, isLastPlayed: !!cached, track: cached })
            }
          }
        } catch (err) {
          console.error("Lanyard WS msg error:", err)
        }
      }

      ws.onclose = () => {
        clearInterval(heartbeatTimer)
        if (!isCleanedUp) {
          setTimeout(connect, 3000)
        }
      }

      ws.onerror = (err) => {
        console.warn("Lanyard WS error:", err)
      }
    } catch (e) {
      console.warn("WebSocket init error:", e)
    }
  }

  connect()

  return () => {
    isCleanedUp = true
    clearInterval(heartbeatTimer)
    if (ws) {
      ws.close()
    }
  }
}
