import { describe, it, expect, vi } from 'vitest'
import { filterItemRequirements, filterGroupedItemRequirements } from '~/composables/useItemRequirements'
import type { ItemRequirementSource, GroupedItemRequirement } from '~/composables/useItemRequirements'

// Mock getItemById
vi.mock('~/data/items', () => ({
  getItemById: vi.fn((id: string) => {
    const items: Record<string, any> = {
      'item1': { id: 'item1', name: 'Salewa', iconLink: 'salewa.png' },
      'item2': { id: 'item2', name: 'Bandage', iconLink: 'bandage.png' },
      'item3': { id: 'item3', name: 'Morphine', iconLink: 'morphine.png' }
    }
    return items[id] || null
  })
}))

describe('filterItemRequirements', () => {
  const mockRequirements: ItemRequirementSource[] = [
    {
      itemId: 'item1',
      quantity: 3,
      source: 'task',
      sourceId: 'task1',
      sourceName: 'Shortage',
      traderName: 'Therapist'
    },
    {
      itemId: 'item2',
      quantity: 5,
      source: 'hideout',
      sourceId: 'medstation_1',
      sourceName: 'Medstation Level 1'
    },
    {
      itemId: 'item3',
      quantity: 2,
      source: 'task',
      sourceId: 'task2',
      sourceName: 'Painkiller',
      traderName: 'Therapist'
    }
  ]

  it('should return all requirements when search query is empty', () => {
    const result = filterItemRequirements(mockRequirements, '')
    expect(result).toEqual(mockRequirements)
  })

  it('should filter by item name', () => {
    const result = filterItemRequirements(mockRequirements, 'salewa')
    expect(result).toHaveLength(1)
    expect(result[0].itemId).toBe('item1')
  })

  it('should filter by source name', () => {
    const result = filterItemRequirements(mockRequirements, 'medstation')
    expect(result).toHaveLength(1)
    expect(result[0].itemId).toBe('item2')
  })

  it('should be case insensitive', () => {
    const result = filterItemRequirements(mockRequirements, 'MORPHINE')
    expect(result).toHaveLength(1)
    expect(result[0].itemId).toBe('item3')
  })

  it('should return empty array when no matches found', () => {
    const result = filterItemRequirements(mockRequirements, 'nonexistent')
    expect(result).toHaveLength(0)
  })
})

describe('filterGroupedItemRequirements', () => {
  const mockGroupedRequirements: GroupedItemRequirement[] = [
    {
      itemId: 'item1',
      itemName: 'Salewa',
      itemIconLink: 'salewa.png',
      sources: [
        {
          source: 'task',
          sourceId: 'task1',
          sourceName: 'Shortage',
          quantity: 3,
          traderName: 'Therapist'
        }
      ],
      totalQuantity: 3
    },
    {
      itemId: 'item2',
      itemName: 'Bandage',
      itemIconLink: 'bandage.png',
      sources: [
        {
          source: 'hideout',
          sourceId: 'medstation_1',
          sourceName: 'Medstation Level 1',
          quantity: 5
        }
      ],
      totalQuantity: 5
    }
  ]

  it('should return all grouped requirements when search query is empty', () => {
    const result = filterGroupedItemRequirements(mockGroupedRequirements, '')
    expect(result).toEqual(mockGroupedRequirements)
  })

  it('should filter by item name', () => {
    const result = filterGroupedItemRequirements(mockGroupedRequirements, 'salewa')
    expect(result).toHaveLength(1)
    expect(result[0].itemId).toBe('item1')
  })

  it('should filter by source name', () => {
    const result = filterGroupedItemRequirements(mockGroupedRequirements, 'medstation')
    expect(result).toHaveLength(1)
    expect(result[0].itemId).toBe('item2')
  })

  it('should be case insensitive', () => {
    const result = filterGroupedItemRequirements(mockGroupedRequirements, 'BANDAGE')
    expect(result).toHaveLength(1)
    expect(result[0].itemId).toBe('item2')
  })
})