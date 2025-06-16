import { describe, it, expect } from 'vitest'
import { filterTasksByTrader, filterTasksByStatus, filterKappaTasks } from '~/composables/useTaskFilters'
import type { EFTTask } from '~/types'

describe('filterTasksByTrader', () => {
  const mockTasks: EFTTask[] = [
    {
      id: 'task1',
      name: 'Task 1',
      trader: 'Prapor',
      level: 1,
      description: 'Test task 1',
      requirements: [],
      rewards: []
    },
    {
      id: 'task2',
      name: 'Task 2',
      trader: 'Therapist',
      level: 1,
      description: 'Test task 2',
      requirements: [],
      rewards: []
    },
    {
      id: 'task3',
      name: 'Task 3',
      trader: 'Prapor',
      level: 2,
      description: 'Test task 3',
      requirements: [],
      rewards: []
    }
  ]
  
  it('should filter tasks by trader name', () => {
    const result = filterTasksByTrader(mockTasks, 'Prapor')
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('task1')
    expect(result[1].id).toBe('task3')
  })
  
  it('should be case insensitive', () => {
    const result = filterTasksByTrader(mockTasks, 'THERAPIST')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('task2')
  })
  
  it('should return empty array for non-existent trader', () => {
    const result = filterTasksByTrader(mockTasks, 'NonExistent')
    expect(result).toHaveLength(0)
  })
})

describe('filterTasksByStatus', () => {
  const mockTasks: EFTTask[] = [
    {
      id: 'task1',
      name: 'Available Task',
      trader: 'Prapor',
      level: 1,
      description: 'No prerequisites',
      requirements: [],
      rewards: []
    },
    {
      id: 'task2',
      name: 'Locked Task',
      trader: 'Therapist',
      level: 1,
      description: 'Has prerequisites',
      prerequisites: ['task1'],
      requirements: [],
      rewards: []
    },
    {
      id: 'task3',
      name: 'Another Available',
      trader: 'Prapor',
      level: 2,
      description: 'Prerequisites met',
      prerequisites: ['task1'],
      requirements: [],
      rewards: []
    }
  ]
  
  const completedTasks = {
    'task1': true,
    'task2': false,
    'task3': false
  }
  
  it('should filter available tasks', () => {
    const result = filterTasksByStatus(mockTasks, 'available', completedTasks)
    // task2 and task3 are both not completed
    // task2 is available because task1 is completed
    // task3 is available because task1 is completed
    expect(result).toHaveLength(2)
    expect(result.map(t => t.id)).toContain('task2')
    expect(result.map(t => t.id)).toContain('task3')
  })
  
  it('should filter locked tasks', () => {
    // With task1 completed, no tasks should be locked
    const lockedScenario = {
      'task1': false,  // Not completed
      'task2': false,
      'task3': false
    }
    const result = filterTasksByStatus(mockTasks, 'locked', lockedScenario)
    expect(result).toHaveLength(2)
    // task2 and task3 are locked because task1 is not completed
    expect(result.map(t => t.id)).toContain('task2')
    expect(result.map(t => t.id)).toContain('task3')
  })
  
  it('should filter completed tasks', () => {
    const result = filterTasksByStatus(mockTasks, 'completed', completedTasks)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('task1')
  })
})

describe('filterKappaTasks', () => {
  const mockTasks: EFTTask[] = [
    {
      id: 'task1',
      name: 'Kappa Task',
      trader: 'Prapor',
      level: 1,
      description: 'Required for kappa',
      kappaRequired: true,
      requirements: [],
      rewards: []
    },
    {
      id: 'task2',
      name: 'Non-Kappa Task',
      trader: 'Therapist',
      level: 1,
      description: 'Not required for kappa',
      kappaRequired: false,
      requirements: [],
      rewards: []
    },
    {
      id: 'task3',
      name: 'Another Kappa Task',
      trader: 'Prapor',
      level: 2,
      description: 'Also required for kappa',
      kappaRequired: true,
      requirements: [],
      rewards: []
    }
  ]
  
  it('should filter only kappa required tasks', () => {
    const result = filterKappaTasks(mockTasks)
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('task1')
    expect(result[1].id).toBe('task3')
  })
  
  it('should return empty array if no kappa tasks', () => {
    const nonKappaTasks = mockTasks.map(t => ({ ...t, kappaRequired: false }))
    const result = filterKappaTasks(nonKappaTasks)
    expect(result).toHaveLength(0)
  })
})