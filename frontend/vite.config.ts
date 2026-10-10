import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import istanbul from 'vite-plugin-istanbul'

export default defineConfig({
  plugins: [
    vue(),
    istanbul({
      include: 'src/**/*.{js,vue,ts,tsx}',
      exclude: ['src/main.ts', 'tests/unit/**', 'node_modules'],
      extension: ['.js', '.vue', '.ts', '.tsx'],
      requireEnv: false,
      forceBuildInstrument: true,
    })
  ],
  build: {
    sourcemap: true,
  },
  server: {
    port: 5173,
    strictPort: true
  },
  test: {
    environment: 'jsdom',
    setupFiles: './tests/unit/setup.js',
    include: ['tests/unit/**/*.test.{js,ts}'],
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
