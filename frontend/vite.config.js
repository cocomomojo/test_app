import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    strictPort: true
  },
  build: {
    // Enable source maps for coverage in CI/E2E testing
    sourcemap: process.env.ENABLE_COVERAGE === 'true',
    // Don't minify when collecting coverage for better debugging
    minify: process.env.ENABLE_COVERAGE === 'true' ? false : 'esbuild'
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    include: ['src/test/**/*.test.{js,ts}'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
    server: {
      deps: {
        inline: ['vuetify']
      }
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,vue}'],
      exclude: ['src/main.js']
    }
  }
})
