import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Les chemins relatifs permettent au même build de fonctionner localement
  // et sous https://moha84100.github.io/revpilot/.
  base: './',
  plugins: [react()],
  server: {
    port: 4173,
    host: '127.0.0.1',
    proxy: { '/api': 'http://127.0.0.1:4174' },
  },
  preview: { port: 4173, host: '127.0.0.1' },
})
