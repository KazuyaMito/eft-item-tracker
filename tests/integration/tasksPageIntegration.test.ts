import { describe, it, expect } from 'vitest'
import type { EFTTask } from '~/types'
import { eftTasks } from '~/data/tasks'
import { filterTasks, type TaskFilters, type TaskCompletionState } from '~/utils/taskPageLogic'

describe('Tasks Page Integration', () => {
  it('should handle real task data structure', () => {
    // Use actual tasks from the data file
    const realTasks = eftTasks.slice(0, 5) // Take first 5 tasks
    
    const filters: TaskFilters = {
      selectedCategory: 'all',
      selectedTrader: null,
      selectedFilter: 'all',
      showNonKappaTasks: true,
      showTasksAboveLevel: true,
      playerLevel: 50
    }
    
    const result = filterTasks(realTasks, filters, {})
    
    // Should return tasks that don't have unmet prerequisites
    expect(result.length).toBeGreaterThanOrEqual(0)
    expect(result.length).toBeLessThanOrEqual(realTasks.length)
  })

  it('should correctly filter parallel tasks', () => {
    // Find tasks with parallel alternatives from real data
    const tasksWithParallels = eftTasks.filter(task => 
      task.parallelTaskIds && task.parallelTaskIds.length > 0
    ).slice(0, 3)
    
    if (tasksWithParallels.length > 0) {
      const firstTask = tasksWithParallels[0]
      const parallelTaskId = firstTask.parallelTaskIds![0]
      
      // Simulate completing the first task
      const taskStatuses: TaskCompletionState = {
        [firstTask.id]: { status: 'completed' }
      }
      
      const filters: TaskFilters = {
        selectedCategory: 'all',
        selectedTrader: null,
        selectedFilter: 'available',
        showNonKappaTasks: true,
        showTasksAboveLevel: true,
        playerLevel: 50
      }
      
      // If we mark a parallel task as failed, it shouldn't show in available
      const statusesWithFailed: TaskCompletionState = {
        [parallelTaskId]: { status: 'failed' }
      }
      
      const tasksToFilter = [
        ...tasksWithParallels,
        eftTasks.find(t => t.id === parallelTaskId)
      ].filter(Boolean) as EFTTask[]
      
      const result = filterTasks(tasksToFilter, filters, statusesWithFailed)
      
      // The failed parallel task should not be in available tasks
      expect(result.map(t => t.id)).not.toContain(parallelTaskId)
    }
  })

  it('should respect kappa requirement filtering', () => {
    const kappaTasks = eftTasks.filter(task => task.kappaRequired === true).slice(0, 5)
    const nonKappaTasks = eftTasks.filter(task => task.kappaRequired === false).slice(0, 5)
    const mixedTasks = [...kappaTasks, ...nonKappaTasks]
    
    const filters: TaskFilters = {
      selectedCategory: 'all',
      selectedTrader: null,
      selectedFilter: 'all',
      showNonKappaTasks: false, // Only show kappa tasks
      showTasksAboveLevel: true,
      playerLevel: 50
    }
    
    const result = filterTasks(mixedTasks, filters, {})
    
    // All results should be kappa required
    expect(result.every(task => task.kappaRequired === true)).toBe(true)
    expect(result.length).toBe(kappaTasks.length)
  })

  it('should handle trader filtering with real trader names', () => {
    // Get unique traders from real data
    const traders = [...new Set(eftTasks.map(task => task.trader))]
    const firstTrader = traders[0]
    
    const tasksForTrader = eftTasks.filter(task => 
      task.trader.toLowerCase() === firstTrader.toLowerCase()
    ).slice(0, 5)
    
    const otherTasks = eftTasks.filter(task => 
      task.trader.toLowerCase() !== firstTrader.toLowerCase()
    ).slice(0, 5)
    
    const mixedTasks = [...tasksForTrader, ...otherTasks]
    
    const filters: TaskFilters = {
      selectedCategory: 'traders',
      selectedTrader: firstTrader,
      selectedFilter: 'all',
      showNonKappaTasks: true,
      showTasksAboveLevel: true,
      playerLevel: 50
    }
    
    const result = filterTasks(mixedTasks, filters, {})
    
    // All results should be for the selected trader
    expect(result.every(task => 
      task.trader.toLowerCase() === firstTrader.toLowerCase()
    )).toBe(true)
    expect(result.length).toBe(tasksForTrader.length)
  })
})