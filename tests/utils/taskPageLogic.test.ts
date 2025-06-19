import { describe, it, expect } from 'vitest'
import type { EFTTask } from '~/types'
import {
  filterTasks,
  isTaskAvailable,
  calculateItemProgress,
  canCompleteTask,
  sortTraders,
  type TaskFilters,
  type TaskCompletionState
} from '~/utils/taskPageLogic'

// Create mock tasks
const createMockTask = (overrides: Partial<EFTTask> = {}): EFTTask => ({
  id: 'task1',
  name: 'Test Task',
  trader: 'Prapor',
  level: 10,
  description: 'Test description',
  requirements: [],
  rewards: ['100 XP'],
  kappaRequired: true,
  ...overrides
})

describe('Task Filtering Logic', () => {
  describe('filterTasks - "all" filter', () => {
    it('should show ALL tasks when filter is "all" (including locked by level and prerequisites)', () => {
      const tasks: EFTTask[] = [
        createMockTask({ id: 'task1', level: 5 }),
        createMockTask({ id: 'task2', level: 10, prerequisites: ['task1'] }),
        createMockTask({ id: 'task3', level: 15, prerequisites: ['task1', 'task2'] }),
        createMockTask({ id: 'task4', level: 8 }),
        createMockTask({ id: 'task5', level: 8, parallelTaskIds: ['task4'] })
      ]

      const taskStatuses: TaskCompletionState = {
        task1: { status: 'completed' },
        task2: { status: 'pending' }, // Not completed
        task3: { status: 'pending' },
        task4: { status: 'pending' },
        task5: { status: 'failed' }
      }

      const filters: TaskFilters = {
        selectedCategory: 'all',
        selectedTrader: null,
        selectedFilter: 'all',
        showNonKappaTasks: true,
        showTasksAboveLevel: true,
        playerLevel: 5
      }

      const result = filterTasks(tasks, filters, taskStatuses)
      
      // According to spec: "all" should show everything
      // Current implementation incorrectly filters out tasks with incomplete prerequisites
      expect(result).toHaveLength(5) // Should show all 5 tasks
      expect(result.map(t => t.id)).toContain('task3') // Should include task3 even though task2 is not completed
    })

    it('should respect showTasksAboveLevel flag even in "all" filter', () => {
      const tasks: EFTTask[] = [
        createMockTask({ id: 'task1', level: 5 }),
        createMockTask({ id: 'task2', level: 10 }),
        createMockTask({ id: 'task3', level: 15 }),
        createMockTask({ id: 'task4', level: 3 })
      ]

      const filters: TaskFilters = {
        selectedCategory: 'all',
        selectedTrader: null,
        selectedFilter: 'all',
        showNonKappaTasks: true,
        showTasksAboveLevel: false,
        playerLevel: 5
      }

      const result = filterTasks(tasks, filters, {})
      
      // Should filter by level when showTasksAboveLevel is false
      expect(result.every(t => t.level <= 5)).toBe(true)
      expect(result).toHaveLength(2)
      expect(result.map(t => t.id)).toEqual(['task1', 'task4'])
    })
  })

  describe('filterTasks - "locked" filter', () => {
    it('should show ONLY tasks locked by player level', () => {
      const tasks: EFTTask[] = [
        createMockTask({ id: 'task1', level: 5 }),
        createMockTask({ id: 'task2', level: 10 }),
        createMockTask({ id: 'task3', level: 15 }),
        createMockTask({ id: 'task4', level: 8 })
      ]

      const filters: TaskFilters = {
        selectedCategory: 'all',
        selectedTrader: null,
        selectedFilter: 'locked',
        showNonKappaTasks: true,
        showTasksAboveLevel: true,
        playerLevel: 8
      }

      const result = filterTasks(tasks, filters, {})
      
      // According to spec: "locked" should show only level-locked tasks
      // Current implementation incorrectly shows tasks with incomplete prerequisites
      expect(result.every(t => t.level > 8)).toBe(true) // All results should be above player level
      expect(result.map(t => t.id)).toContain('task2') // task2 (level 10) should be shown
      expect(result.map(t => t.id)).toContain('task3') // task3 (level 15) should be shown
      expect(result.map(t => t.id)).not.toContain('task1') // task1 (level 5) should NOT be shown
      expect(result.map(t => t.id)).not.toContain('task4') // task4 (level 8) should NOT be shown
    })

    it('should show level-locked tasks regardless of prerequisite status', () => {
      const tasks: EFTTask[] = [
        createMockTask({ id: 'task1', level: 5 }),
        createMockTask({ id: 'task2', level: 10, prerequisites: ['task1'] }),
        createMockTask({ id: 'task3', level: 15, prerequisites: ['task1', 'task2'] }),
        createMockTask({ id: 'task4', level: 8 })
      ]

      const taskStatuses: TaskCompletionState = {
        task1: { status: 'pending' }, // task1 not completed
        task2: { status: 'pending' },
        task3: { status: 'pending' },
        task4: { status: 'pending' }
      }

      const filters: TaskFilters = {
        selectedCategory: 'all',
        selectedTrader: null,
        selectedFilter: 'locked',
        showNonKappaTasks: true,
        showTasksAboveLevel: true,
        playerLevel: 7
      }

      const result = filterTasks(tasks, filters, taskStatuses)
      
      // task2 (level 10) and task3 (level 15) should show because they're level-locked
      // even though task2 has incomplete prerequisites
      expect(result.map(t => t.id)).toContain('task2')
      expect(result.map(t => t.id)).toContain('task3')
      expect(result.map(t => t.id)).toContain('task4') // task4 (level 8) is also above level 7
      expect(result.map(t => t.id)).not.toContain('task1') // task1 (level 5) is below level 7
    })
  })

  it('should filter tasks by trader when trader is selected', () => {
    const tasks: EFTTask[] = [
      createMockTask({ id: 'task1', trader: 'Prapor' }),
      createMockTask({ id: 'task2', trader: 'Therapist' }),
      createMockTask({ id: 'task3', trader: 'Prapor' }),
      createMockTask({ id: 'task4', trader: 'Mechanic' })
    ]

    const filters: TaskFilters = {
      selectedCategory: 'traders',
      selectedTrader: 'Prapor',
      selectedFilter: 'all',
      showNonKappaTasks: true,
      showTasksAboveLevel: true,
      playerLevel: 20
    }

    const result = filterTasks(tasks, filters, {})
    expect(result).toHaveLength(2)
    expect(result.map(t => t.id)).toEqual(['task1', 'task3'])
  })

  it('should filter tasks by status (available, locked, completed)', () => {
    const tasks: EFTTask[] = [
      createMockTask({ id: 'task1', level: 5 }), // Available (no prerequisites)
      createMockTask({ id: 'task2', level: 25, prerequisites: ['task1'] }), // Locked by level
      createMockTask({ id: 'task3', level: 10 }), // Completed
      createMockTask({ id: 'task4', level: 15, prerequisites: ['task3'] }) // Available (prerequisite met)
    ]

    const taskStatuses: TaskCompletionState = {
      task3: { status: 'completed' }
    }

    const baseFilters: TaskFilters = {
      selectedCategory: 'all',
      selectedTrader: null,
      selectedFilter: 'all',
      showNonKappaTasks: true,
      showTasksAboveLevel: true,
      playerLevel: 20
    }

    // Test available filter
    const availableResult = filterTasks(
      tasks,
      { ...baseFilters, selectedFilter: 'available' },
      taskStatuses
    )
    expect(availableResult.map(t => t.id)).toEqual(['task1', 'task4'])

    // Test locked filter
    const lockedResult = filterTasks(
      tasks,
      { ...baseFilters, selectedFilter: 'locked' },
      taskStatuses
    )
    expect(lockedResult.map(t => t.id)).toEqual(['task2'])

    // Test completed filter
    const completedResult = filterTasks(
      tasks,
      { ...baseFilters, selectedFilter: 'completed' },
      taskStatuses
    )
    expect(completedResult.map(t => t.id)).toEqual(['task3'])
  })

  it('should filter tasks by player level when showTasksAboveLevel is false', () => {
    const tasks: EFTTask[] = [
      createMockTask({ id: 'task1', level: 10 }),
      createMockTask({ id: 'task2', level: 20 }),
      createMockTask({ id: 'task3', level: 25 }),
      createMockTask({ id: 'task4', level: 15 })
    ]

    const filters: TaskFilters = {
      selectedCategory: 'all',
      selectedTrader: null,
      selectedFilter: 'all',
      showNonKappaTasks: true,
      showTasksAboveLevel: false,
      playerLevel: 20
    }

    const result = filterTasks(tasks, filters, {})
    expect(result).toHaveLength(3)
    expect(result.map(t => t.id)).toEqual(['task1', 'task2', 'task4'])
  })

  it('should show only Kappa-required tasks when showNonKappaTasks is false', () => {
    const tasks: EFTTask[] = [
      createMockTask({ id: 'task1', kappaRequired: true }),
      createMockTask({ id: 'task2', kappaRequired: false }),
      createMockTask({ id: 'task3', kappaRequired: true }),
      createMockTask({ id: 'task4', kappaRequired: false })
    ]

    const filters: TaskFilters = {
      selectedCategory: 'all',
      selectedTrader: null,
      selectedFilter: 'all',
      showNonKappaTasks: false,
      showTasksAboveLevel: true,
      playerLevel: 20
    }

    const result = filterTasks(tasks, filters, {})
    expect(result).toHaveLength(2)
    expect(result.map(t => t.id)).toEqual(['task1', 'task3'])
  })

  it('should only hide tasks with incomplete prerequisites when NOT showing "all"', () => {
    const tasks: EFTTask[] = [
      createMockTask({ id: 'task1' }),
      createMockTask({ id: 'task2', prerequisites: ['task1'] }),
      createMockTask({ id: 'task3', prerequisites: ['task1', 'task2'] }),
      createMockTask({ id: 'task4', prerequisites: ['task2'] })
    ]

    const taskStatuses: TaskCompletionState = {
      task1: { status: 'completed' },
      task2: { status: 'completed' }
    }

    const filters: TaskFilters = {
      selectedCategory: 'all',
      selectedTrader: null,
      selectedFilter: 'available', // NOT "all"
      showNonKappaTasks: true,
      showTasksAboveLevel: true,
      playerLevel: 20
    }

    const result = filterTasks(tasks, filters, taskStatuses)
    expect(result).toHaveLength(2) // task3 and task4 are available (prerequisites met, not completed)
    
    // Now test with incomplete prerequisites
    const incompleteStatuses: TaskCompletionState = {
      task1: { status: 'completed' }
      // task2 is not completed
    }
    
    const incompleteResult = filterTasks(tasks, filters, incompleteStatuses)
    expect(incompleteResult.map(t => t.id)).toEqual(['task2']) // Only task2 is available
  })

  it('should not show failed tasks in available filter', () => {
    const tasks: EFTTask[] = [
      createMockTask({ id: 'task1' }),
      createMockTask({ id: 'task2', parallelTaskIds: ['task3'] }),
      createMockTask({ id: 'task3', parallelTaskIds: ['task2'] })
    ]

    const taskStatuses: TaskCompletionState = {
      task2: { status: 'failed' },
      task3: { status: 'completed' }
    }

    const filters: TaskFilters = {
      selectedCategory: 'all',
      selectedTrader: null,
      selectedFilter: 'available',
      showNonKappaTasks: true,
      showTasksAboveLevel: true,
      playerLevel: 20
    }

    const result = filterTasks(tasks, filters, taskStatuses)
    expect(result.map(t => t.id)).toEqual(['task1']) // Only task1 is available
  })
})

describe('Task Completion', () => {
  it('should determine if a task can be completed', () => {
    const task = createMockTask({ id: 'task1' })
    
    // Can complete if not completed or failed
    expect(canCompleteTask(task, {})).toBe(true)
    
    // Cannot complete if already completed
    expect(canCompleteTask(task, { task1: { status: 'completed' } })).toBe(false)
    
    // Cannot complete if failed
    expect(canCompleteTask(task, { task1: { status: 'failed' } })).toBe(false)
  })

  it('should check task availability based on prerequisites', () => {
    const taskNoPrereqs = createMockTask({ id: 'task1' })
    const taskWithPrereqs = createMockTask({ 
      id: 'task2', 
      prerequisites: ['task1'] 
    })
    const taskMultiplePrereqs = createMockTask({ 
      id: 'task3', 
      prerequisites: ['task1', 'task2'] 
    })

    // Task with no prerequisites is always available
    expect(isTaskAvailable(taskNoPrereqs, {})).toBe(true)

    // Task with unmet prerequisites is not available
    expect(isTaskAvailable(taskWithPrereqs, {})).toBe(false)
    expect(isTaskAvailable(taskWithPrereqs, { task1: { status: 'pending' } })).toBe(false)

    // Task with met prerequisites is available
    expect(isTaskAvailable(taskWithPrereqs, { task1: { status: 'completed' } })).toBe(true)

    // Task with multiple prerequisites needs all to be met
    expect(isTaskAvailable(taskMultiplePrereqs, { 
      task1: { status: 'completed' } 
    })).toBe(false)
    
    expect(isTaskAvailable(taskMultiplePrereqs, { 
      task1: { status: 'completed' },
      task2: { status: 'completed' }
    })).toBe(true)
  })
})

describe('Item Requirements', () => {
  it('should calculate correct progress for item requirements', () => {
    const userItems = {
      'item1': { quantity: 5, foundInRaid: 3 },
      'item2': { quantity: 10, foundInRaid: 7 },
      'item3': { quantity: 0, foundInRaid: 0 }
    }

    // Test regular item requirement
    const regularReq = { itemId: 'item1', quantity: 10, foundInRaid: false }
    const regularProgress = calculateItemProgress(regularReq, userItems)
    expect(regularProgress.current).toBe(5)
    expect(regularProgress.needed).toBe(10)
    expect(regularProgress.percentage).toBe(50)
    expect(regularProgress.progressClass).toBe('text-yellow-600')

    // Test completed requirement
    const completedReq = { itemId: 'item2', quantity: 10, foundInRaid: false }
    const completedProgress = calculateItemProgress(completedReq, userItems)
    expect(completedProgress.current).toBe(10)
    expect(completedProgress.percentage).toBe(100)
    expect(completedProgress.progressClass).toBe('text-green-600')

    // Test missing item
    const missingReq = { itemId: 'item4', quantity: 5, foundInRaid: false }
    const missingProgress = calculateItemProgress(missingReq, userItems)
    expect(missingProgress.current).toBe(0)
    expect(missingProgress.percentage).toBe(0)
    expect(missingProgress.progressClass).toBe('text-red-600')
  })

  it('should distinguish between Found in Raid and regular items', () => {
    const userItems = {
      'item1': { quantity: 10, foundInRaid: 3 }
    }

    // Test FIR requirement
    const firReq = { itemId: 'item1', quantity: 5, foundInRaid: true }
    const firProgress = calculateItemProgress(firReq, userItems)
    expect(firProgress.current).toBe(3) // Only FIR items count

    // Test regular requirement
    const regularReq = { itemId: 'item1', quantity: 5, foundInRaid: false }
    const regularProgress = calculateItemProgress(regularReq, userItems)
    expect(regularProgress.current).toBe(10) // All items count
  })

  it('should cap percentage at 100', () => {
    const userItems = {
      'item1': { quantity: 20, foundInRaid: 15 }
    }

    const requirement = { itemId: 'item1', quantity: 10, foundInRaid: false }
    const progress = calculateItemProgress(requirement, userItems)
    expect(progress.current).toBe(20)
    expect(progress.needed).toBe(10)
    expect(progress.percentage).toBe(100) // Capped at 100, not 200
  })
})

describe('Trader Sorting', () => {
  it('should sort traders in predefined order', () => {
    const traders = ['Mechanic', 'Prapor', 'Jaeger', 'Therapist', 'Unknown']
    const sorted = sortTraders(traders)
    
    // Should be sorted according to predefined order
    expect(sorted).toEqual(['Prapor', 'Therapist', 'Mechanic', 'Jaeger', 'Unknown'])
  })

  it('should handle case-insensitive trader sorting', () => {
    const traders = ['MECHANIC', 'prapor', 'JaEgEr']
    const sorted = sortTraders(traders)
    
    expect(sorted[0].toLowerCase()).toBe('prapor')
    expect(sorted[1].toLowerCase()).toBe('mechanic')
    expect(sorted[2].toLowerCase()).toBe('jaeger')
  })
})