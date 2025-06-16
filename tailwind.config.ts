import type { Config } from 'tailwindcss'

export default <Config>{
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue", 
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  theme: {
    extend: {
      colors: {
        'eft-primary': '#E2E8F0',
        'eft-secondary': '#CBD5E0', 
        'eft-accent': '#F56565',
        'dark-bg': '#1A202C',
        'dark-card': '#2D3748',
        'dark-surface': '#4A5568',
        'dark-text': '#E2E8F0',
        'dark-text-secondary': '#CBD5E0'
      }
    }
  }
}