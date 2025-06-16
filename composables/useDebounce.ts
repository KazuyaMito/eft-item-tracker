import { ref, type Ref, customRef } from 'vue'

export function useDebounce<T>(initialValue: T, delay: number = 300) {
  const debouncedValue = ref<T>(initialValue)
  let timeout: NodeJS.Timeout | null = null

  const setValue = (newValue: T) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)
  }

  const clearDebounceTimeout = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }

  return {
    debouncedValue: debouncedValue as Readonly<Ref<T>>,
    setValue,
    clearTimeout: clearDebounceTimeout
  }
}

export function useDebouncedRef<T>(initialValue: T, delay: number = 300) {
  let timeout: NodeJS.Timeout | null = null
  let currentValue = initialValue

  return customRef<T>((track, trigger) => {
    return {
      get() {
        track()
        return currentValue
      },
      set(newValue: T) {
        currentValue = newValue
        if (timeout) {
          clearTimeout(timeout)
        }
        timeout = setTimeout(() => {
          trigger()
        }, delay)
      }
    }
  })
}