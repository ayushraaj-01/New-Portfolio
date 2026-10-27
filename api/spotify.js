// Vercel Serverless Function: /api/spotify
// Fetches currently playing or recently played Spotify track securely on the server,
// keeping client secret and refresh token safe.

function toTrack(item) {
  if (!item) return null
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

let tokenCache = { token: null, expiresAt: 0 }

async function getAccessToken(clientId, clientSecret, refreshToken) {
  const now = Date.now()
  if (tokenCache.token && now < tokenCache.expiresAt) {
    return tokenCache.token
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!res.ok) {
    const errorText = await res.text()
    console.error('Spotify token refresh error:', res.status, errorText)
    return null
  }

  const data = await res.json()
  if (!data.access_token) return null

  tokenCache = {
    token: data.access_token,
    expiresAt: now + Math.max(60, (data.expires_in || 3600) - 60) * 1000,
  }
  return tokenCache.token
}

export default async function handler(req, res) {
  // CORS & Cache headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Cache-Control', 'public, s-maxage=5, stale-while-revalidate=10')

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    return res.end()
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID || process.env.VITE_SPOTIFY_CLIENT_ID || ''
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || process.env.VITE_SPOTIFY_CLIENT_SECRET || ''
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN || process.env.VITE_SPOTIFY_REFRESH_TOKEN || ''

  if (!clientId || !clientSecret || !refreshToken) {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    return res.end(
      JSON.stringify({
        error: 'Missing Spotify credentials in environment',
        hint: 'Set SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, and SPOTIFY_REFRESH_TOKEN in Vercel project settings.',
      })
    )
  }

  try {
    const accessToken = await getAccessToken(clientId, clientSecret, refreshToken)
    if (!accessToken) {
      res.statusCode = 502
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({ error: 'Failed to authenticate with Spotify API' }))
    }

    // 1. Check currently playing (tracks and podcast episodes)
    const nowRes = await fetch(
      'https://api.spotify.com/v1/me/player/currently-playing?additional_types=track,episode',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )

    if (nowRes.status === 200) {
      const nowData = await nowRes.json()
      if (nowData && nowData.item) {
        const track = toTrack(nowData.item)
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        return res.end(
          JSON.stringify({
            isLive: Boolean(nowData.is_playing),
            isLastPlayed: !nowData.is_playing,
            track,
          })
        )
      }
    }

    // 2. Fallback to recently played
    const recentRes = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (recentRes.status === 200) {
      const recentData = await recentRes.json()
      const item = recentData.items?.[0]?.track
      if (item) {
        const track = toTrack(item)
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        return res.end(
          JSON.stringify({
            isLive: false,
            isLastPlayed: true,
            track,
          })
        )
      }
    }

    // Neither playing nor recently played found
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    return res.end(JSON.stringify({ isLive: false, isLastPlayed: false, track: null }))
  } catch (err) {
    console.error('Server error in /api/spotify:', err)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    return res.end(JSON.stringify({ error: err.message || 'Internal server error' }))
  }
}
