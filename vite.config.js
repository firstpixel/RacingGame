import { defineConfig } from 'vite'

export default defineConfig({
  root: 'client/src',
  build: {
    outDir: '../../dist'
  },
  base: './',
  build: {
    outDir: '../../dist',
    emptyOutDir: true
  },
  server: {
    port: 3000
  }
})
