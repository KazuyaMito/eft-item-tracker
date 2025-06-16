import { vi } from 'vitest'

// Mock Vue 3 reactivity APIs
vi.mock('vue', () => ({
  ref: vi.fn((value) => ({ value })),
  reactive: vi.fn((obj) => obj),
  computed: vi.fn((fn) => ({ value: fn() })),
  watch: vi.fn(),
  watchEffect: vi.fn(),
  customRef: vi.fn((factory) => {
    let value
    const track = vi.fn()
    const trigger = vi.fn()
    const { get, set } = factory(track, trigger)
    
    return (initialValue) => {
      value = initialValue
      return {
        get value() {
          track()
          return get ? get() : value
        },
        set value(newValue) {
          value = newValue
          if (set) set(newValue)
          trigger()
        }
      }
    }
  })
}))

// Mock data imports
vi.mock('~/data/tasks', () => ({
  eftTasks: []
}))

vi.mock('~/data/hideout', () => ({
  hideoutStations: []
}))