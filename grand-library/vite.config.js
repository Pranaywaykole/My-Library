import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    /*
      outDir is where the built files go.
      dist is the default and what most platforms expect.
    */
    outDir: 'dist',
  },
})