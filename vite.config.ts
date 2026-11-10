import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/weather-app/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
    },
  },
  server: {
    port: 4200,
  },
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      // Console table for local runs, plus a plain-text copy CI puts in the job summary.
      reporter: ['text', ['text', { file: 'coverage.txt', maxCols: 200 }]],
      include: ['src/**/*.{ts,vue}'],
    },
  },
})
