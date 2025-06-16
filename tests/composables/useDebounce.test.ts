import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useDebounce } from '~/composables/useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should initialize with initial value', () => {
    const { debouncedValue } = useDebounce('initial', 300)
    expect(debouncedValue.value).toBe('initial')
  })

  it('should debounce value updates', () => {
    const { debouncedValue, setValue } = useDebounce('initial', 300)
    
    setValue('updated')
    expect(debouncedValue.value).toBe('initial')
    
    vi.advanceTimersByTime(299)
    expect(debouncedValue.value).toBe('initial')
    
    vi.advanceTimersByTime(1)
    expect(debouncedValue.value).toBe('updated')
  })

  it('should cancel previous timeout on rapid updates', () => {
    const { debouncedValue, setValue } = useDebounce('initial', 300)
    
    setValue('first')
    vi.advanceTimersByTime(200)
    setValue('second')
    vi.advanceTimersByTime(200)
    setValue('third')
    
    expect(debouncedValue.value).toBe('initial')
    
    vi.advanceTimersByTime(300)
    expect(debouncedValue.value).toBe('third')
  })

  it('should use custom delay', () => {
    const { debouncedValue, setValue } = useDebounce(0, 500)
    
    setValue(42)
    vi.advanceTimersByTime(499)
    expect(debouncedValue.value).toBe(0)
    
    vi.advanceTimersByTime(1)
    expect(debouncedValue.value).toBe(42)
  })

  it('should work with different data types', () => {
    const { debouncedValue: numValue, setValue: setNum } = useDebounce(0, 100)
    const { debouncedValue: objValue, setValue: setObj } = useDebounce({ count: 0 }, 100)
    
    setNum(42)
    setObj({ count: 10 })
    
    vi.advanceTimersByTime(100)
    
    expect(numValue.value).toBe(42)
    expect(objValue.value).toEqual({ count: 10 })
  })
})