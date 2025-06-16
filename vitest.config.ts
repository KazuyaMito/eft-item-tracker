import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts']
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, '.'),
      '~/composables': resolve(__dirname, './composables'),
      '~/types': resolve(__dirname, './types'),
      '~/data': resolve(__dirname, './data'),
    }
  }
})