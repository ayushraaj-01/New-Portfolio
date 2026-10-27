import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function spotifyDevPlugin() {
  return {
    name: 'spotify-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/spotify', async (req, res) => {
        const env = loadEnv(server.config.mode, process.cwd(), '')
        for (const key in env) {
          process.env[key] = env[key]
        }
        try {
          const { default: handler } = await server.ssrLoadModule('/api/spotify.js')
          await handler(req, res)
        } catch (err) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err.message }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), spotifyDevPlugin()],
  build: {
    rollupOptions: {
      output: {
        // Split long-lived vendor code into stable chunks so only app code
        // changes invalidate the cache between deploys.
        manualChunks(id) {
          if (/node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/.test(id)) {
            return 'motion'
          }
          if (/node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
            return 'react'
          }
          if (id.includes('node_modules/react-icons')) {
            return 'icons'
          }
        },
      },
    },
  },
})
