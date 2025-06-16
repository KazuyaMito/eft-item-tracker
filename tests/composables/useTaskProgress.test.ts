import { describe, it, expect } from 'vitest'
import { calculateProgress, determineProgressClass } from '~/composables/useTaskProgress'

describe('calculateProgress', () => {
  it('should calculate progress percentage correctly', () => {
    expect(calculateProgress(5, 10)).toBe(50)
    expect(calculateProgress(3, 4)).toBe(75)
    expect(calculateProgress(10, 10)).toBe(100)
  })
  
  it('should cap progress at 100%', () => {
    expect(calculateProgress(15, 10)).toBe(100)
    expect(calculateProgress(20, 5)).toBe(100)
  })
  
  it('should handle zero needed', () => {
    expect(calculateProgress(5, 0)).toBe(100)
  })
  
  it('should handle zero current', () => {
    expect(calculateProgress(0, 10)).toBe(0)
  })
})

describe('determineProgressClass', () => {
  it('should return green class when complete', () => {
    expect(determineProgressClass(10, 10)).toBe('text-green-600')
    expect(determineProgressClass(15, 10)).toBe('text-green-600')
  })
  
  it('should return yellow class when partially complete', () => {
    expect(determineProgressClass(5, 10)).toBe('text-yellow-600')
    expect(determineProgressClass(1, 10)).toBe('text-yellow-600')
  })
  
  it('should return red class when no progress', () => {
    expect(determineProgressClass(0, 10)).toBe('text-red-600')
  })
})