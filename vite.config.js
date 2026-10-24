import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
