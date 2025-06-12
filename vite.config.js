import { defineConfig } from 'vite'

export default defineConfig({
  root: 'client/src',
  base: './',
  build: {
    outDir: '../../dist',
    emptyOutDir: true
  },
  server: {
    port: 3000
  }
})
