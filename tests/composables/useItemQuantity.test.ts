import { describe, it, expect } from 'vitest'
import { 
  calculateNewQuantity, 
  parseQuantityInput, 
  createItemQuantity 
} from '~/composables/useItemQuantity'

describe('calculateNewQuantity', () => {
  it('should add positive change to current quantity', () => {
    expect(calculateNewQuantity(5, 3)).toBe(8)
  })

  it('should subtract negative change from current quantity', () => {
    expect(calculateNewQuantity(5, -2)).toBe(3)
  })

  it('should not go below minimum value', () => {
    expect(calculateNewQuantity(2, -5)).toBe(0)
    expect(calculateNewQuantity(2, -5, 1)).toBe(1)
  })

  it('should respect custom minimum value', () => {
    expect(calculateNewQuantity(10, -8, 5)).toBe(5)
  })
})

describe('parseQuantityInput', () => {
  it('should parse valid number string', () => {
    expect(parseQuantityInput('42')).toBe(42)
  })

  it('should parse number input', () => {
    expect(parseQuantityInput(42)).toBe(42)
  })

  it('should return 0 for invalid input', () => {
    expect(parseQuantityInput('abc')).toBe(0)
    expect(parseQuantityInput('')).toBe(0)
  })

  it('should return 0 for negative numbers', () => {
    expect(parseQuantityInput('-5')).toBe(0)
    expect(parseQuantityInput(-5)).toBe(0)
  })

  it('should parse decimal numbers as integers', () => {
    expect(parseQuantityInput('3.7')).toBe(3)
    expect(parseQuantityInput(3.7)).toBe(3)
  })
})

describe('createItemQuantity', () => {
  it('should create item quantity with default values', () => {
    const result = createItemQuantity(5)
    expect(result).toEqual({
      foundInRaid: 5,
      total: 5,
      notes: ''
    })
  })

  it('should use provided total value', () => {
    const result = createItemQuantity(3, 10)
    expect(result).toEqual({
      foundInRaid: 3,
      total: 10,
      notes: ''
    })
  })

  it('should ensure total is at least foundInRaid', () => {
    const result = createItemQuantity(10, 5)
    expect(result).toEqual({
      foundInRaid: 10,
      total: 10,
      notes: ''
    })
  })

  it('should include notes when provided', () => {
    const result = createItemQuantity(5, 10, 'Test note')
    expect(result).toEqual({
      foundInRaid: 5,
      total: 10,
      notes: 'Test note'
    })
  })
})