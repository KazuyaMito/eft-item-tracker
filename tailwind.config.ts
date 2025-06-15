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
        'eft-primary': '#2D3748',
        'eft-secondary': '#4A5568', 
        'eft-accent': '#E53E3E'
      }
    }
  }
}