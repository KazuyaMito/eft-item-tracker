import { ref, type Ref } from 'vue'
import type { TaskRequirement } from '~/types'

export interface TaskObjectives {
  [key: string]: boolean
}

export interface UserItems {
  [itemId: string]: {
    quantity: number
    foundInRaid: number
  }
}

export interface UseTaskProgressOptions {
  onObjectiveToggle?: (taskId: string, objectiveIndex: number, completed: boolean) => Promise<void>
  onTaskComplete?: (taskId: string) => Promise<void>
  onTaskUncomplete?: (taskId: string) => Promise<void>
}

export function useTaskProgress(options: UseTaskProgressOptions = {}) {
  const completedObjectives = ref<TaskObjectives>({})
  const completedTasks = ref<Record<string, boolean>>({})
  const userItems = ref<UserItems>({})
  const hoveredObjective = ref<Record<string, boolean>>({})
  const completingTask = ref<string | null>(null)
  const uncompletingTask = ref<string | null>(null)
  
  // Check if objective is completed
  const isObjectiveCompleted = (taskId: string, objectiveIndex: number): boolean => {
    return completedObjectives.value[`${taskId}_${objectiveIndex}`] === true
  }
  
  // Toggle objective completion status
  const toggleObjective = async (taskId: string, objectiveIndex: number) => {
    const key = `${taskId}_${objectiveIndex}`
    const newValue = !completedObjectives.value[key]
    
    completedObjectives.value[key] = newValue
    
    if (options.onObjectiveToggle) {
      try {
        await options.onObjectiveToggle(taskId, objectiveIndex, newValue)
      } catch (error) {
        console.error('Failed to save objective status:', error)
        completedObjectives.value[key] = !newValue
        throw error
      }
    }
  }
  
  // Get user item count
  const getUserItemCount = (itemId: string, foundInRaid: boolean): number => {
    const item = userItems.value[itemId]
    if (!item) return 0
    
    return foundInRaid ? (item.foundInRaid || 0) : (item.quantity || 0)
  }
  
  // Get progress percentage for a requirement
  const getProgressPercentage = (requirement: TaskRequirement): number => {
    const current = getUserItemCount(requirement.itemId, requirement.foundInRaid)
    const needed = requirement.quantity
    
    return Math.min(Math.round((current / needed) * 100), 100)
  }
  
  // Get progress class for styling
  const getProgressClass = (requirement: TaskRequirement): string => {
    const current = getUserItemCount(requirement.itemId, requirement.foundInRaid)
    const needed = requirement.quantity
    
    if (current >= needed) return 'text-green-600'
    if (current > 0) return 'text-yellow-600'
    return 'text-red-600'
  }
  
  // Check if task can be completed
  const canCompleteTask = (taskId: string): boolean => {
    return !completedTasks.value[taskId]
  }
  
  // Complete a task
  const completeTask = async (taskId: string) => {
    if (!canCompleteTask(taskId)) return
    
    completingTask.value = taskId
    
    try {
      if (options.onTaskComplete) {
        await options.onTaskComplete(taskId)
      }
      completedTasks.value[taskId] = true
    } catch (error) {
      console.error('Failed to complete task:', error)
      throw error
    } finally {
      completingTask.value = null
    }
  }
  
  // Uncomplete a task
  const uncompleteTask = async (taskId: string) => {
    if (!completedTasks.value[taskId]) return
    
    uncompletingTask.value = taskId
    
    try {
      if (options.onTaskUncomplete) {
        await options.onTaskUncomplete(taskId)
      }
      completedTasks.value[taskId] = false
    } catch (error) {
      console.error('Failed to uncomplete task:', error)
      throw error
    } finally {
      uncompletingTask.value = null
    }
  }
  
  // Load data methods
  const loadCompletedObjectives = (objectives: TaskObjectives) => {
    completedObjectives.value = objectives
  }
  
  const loadCompletedTasks = (tasks: Record<string, boolean>) => {
    completedTasks.value = tasks
  }
  
  const loadUserItems = (items: UserItems) => {
    userItems.value = items
  }
  
  return {
    completedObjectives: completedObjectives as Readonly<Ref<TaskObjectives>>,
    completedTasks: completedTasks as Readonly<Ref<Record<string, boolean>>>,
    userItems: userItems as Readonly<Ref<UserItems>>,
    hoveredObjective,
    completingTask: completingTask as Readonly<Ref<string | null>>,
    uncompletingTask: uncompletingTask as Readonly<Ref<string | null>>,
    isObjectiveCompleted,
    toggleObjective,
    getUserItemCount,
    getProgressPercentage,
    getProgressClass,
    canCompleteTask,
    completeTask,
    uncompleteTask,
    loadCompletedObjectives,
    loadCompletedTasks,
    loadUserItems
  }
}

// Pure functions for testing
export function calculateProgress(current: number, needed: number): number {
  return Math.min(Math.round((current / needed) * 100), 100)
}

export function determineProgressClass(current: number, needed: number): string {
  if (current >= needed) return 'text-green-600'
  if (current > 0) return 'text-yellow-600'
  return 'text-red-600'
}