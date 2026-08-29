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

/** Save a live track to localStorage so we can show it when offline */
function cacheLastPlayed(track) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(track))
  } catch (_) {}
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
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) return null

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
    return data.access_token
  } catch (e) {
    console.warn("Spotify token fetch failed:", e)
    return null
  }
}

/**
 * Fetches currently playing or recently played track directly from Spotify API servers 24/7.
 */
async function fetchDirectSpotifyAPI() {
  try {
    const accessToken = await getSpotifyAccessToken()
    if (!accessToken) return null

    // 1. Query currently playing on Spotify
    const nowRes = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (nowRes.status === 200) {
      const nowData = await nowRes.json()
      if (nowData.is_playing && nowData.item) {
        const item = nowData.item
        const track = {
          title: item.name,
          artist: item.artists.map((a) => a.name).join(", "),
          album: item.album.name,
          albumArt: item.album.images[0]?.url,
          spotifyUrl: item.external_urls.spotify,
          trackId: item.id,
        }
        cacheLastPlayed(track)
        return { isLive: true, isLastPlayed: false, track }
      }
    }

    // 2. Query recently played if not currently active
    const recentRes = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=1", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (recentRes.status === 200) {
      const recentData = await recentRes.json()
      const item = recentData.items[0]?.track
      if (item) {
        const track = {
          title: item.name,
          artist: item.artists.map((a) => a.name).join(", "),
          album: item.album.name,
          albumArt: item.album.images[0]?.url,
          spotifyUrl: item.external_urls.spotify,
          trackId: item.id,
        }
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
 * Fetches current Spotify track via Direct Spotify API or Lanyard.
 */
export async function fetchSpotifyPresence(discordId = DEFAULT_DISCORD_ID) {
  // 1. Direct Spotify Web API check (24/7 without Discord)
  const directData = await fetchDirectSpotifyAPI()
  if (directData) return directData

  // 2. Lanyard API Fallback
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
