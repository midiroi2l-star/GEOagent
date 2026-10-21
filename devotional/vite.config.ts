import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // `npm run dev`로 UI만 띄울 때 API는 `wrangler pages dev`(8788)로 넘김
    proxy: { '/api': 'http://localhost:8788' },
  },
})
