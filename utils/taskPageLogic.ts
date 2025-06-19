import type { EFTTask } from '~/types'

export interface TaskFilters {
  selectedCategory: 'all' | 'traders'
  selectedTrader: string | null
  selectedFilter: 'all' | 'available' | 'locked' | 'completed'
  showNonKappaTasks: boolean
  showTasksAboveLevel: boolean
  playerLevel: number
}

export interface TaskCompletionState {
  [taskId: string]: {
    status: 'pending' | 'completed' | 'failed'
  }
}

// Filter tasks based on all criteria
export function filterTasks(
  tasks: EFTTask[],
  filters: TaskFilters,
  taskCompletionStatuses: TaskCompletionState
): EFTTask[] {
  let filteredTasks = [...tasks]

  // Apply category filter
  if (filters.selectedCategory === 'traders' && filters.selectedTrader) {
    filteredTasks = filteredTasks.filter(
      task => task.trader.toLowerCase() === filters.selectedTrader!.toLowerCase()
    )
  }

  // Apply non-Kappa filter
  if (!filters.showNonKappaTasks) {
    filteredTasks = filteredTasks.filter(task => task.kappaRequired === true)
  }

  // Filter by player level
  if (!filters.showTasksAboveLevel) {
    filteredTasks = filteredTasks.filter(task => task.level <= filters.playerLevel)
  }

  // Apply status filter
  if (filters.selectedFilter !== 'all') {
    filteredTasks = filteredTasks.filter(task => {
      const status = taskCompletionStatuses[task.id]?.status
      const completed = status === 'completed'
      const failed = status === 'failed'
      const available = isTaskAvailable(task, taskCompletionStatuses)

      switch (filters.selectedFilter) {
        case 'completed':
          return completed
        case 'available':
          return !completed && !failed && available
        case 'locked':
          // According to spec: "locked" shows ONLY tasks locked by player level
          return !completed && task.level > filters.playerLevel
        default:
          return true
      }
    })
  }
  // When filter is 'all', show everything without filtering by prerequisites

  return filteredTasks
}

// Check if task is available (prerequisites met)
export function isTaskAvailable(
  task: EFTTask,
  taskCompletionStatuses: TaskCompletionState
): boolean {
  if (!task.prerequisites || task.prerequisites.length === 0) {
    return true
  }

  return task.prerequisites.every(
    prereqId => taskCompletionStatuses[prereqId]?.status === 'completed'
  )
}

// Calculate item progress
export function calculateItemProgress(
  requirement: { itemId: string; quantity: number; foundInRaid?: boolean },
  userItems: Record<string, { quantity: number; foundInRaid: number }>
): {
  current: number
  needed: number
  percentage: number
  progressClass: string
} {
  const item = userItems[requirement.itemId]
  if (!item) {
    return {
      current: 0,
      needed: requirement.quantity,
      percentage: 0,
      progressClass: 'text-red-600'
    }
  }

  const current = requirement.foundInRaid ? item.foundInRaid : item.quantity
  const needed = requirement.quantity
  const percentage = Math.min(Math.round((current / needed) * 100), 100)

  let progressClass = 'text-red-600'
  if (current >= needed) progressClass = 'text-green-600'
  else if (current > 0) progressClass = 'text-yellow-600'

  return { current, needed, percentage, progressClass }
}

// Check if can complete task
export function canCompleteTask(
  task: EFTTask,
  taskCompletionStatuses: TaskCompletionState
): boolean {
  const status = taskCompletionStatuses[task.id]?.status
  return status !== 'completed' && status !== 'failed'
}

// Get trader order for sorting
export function getTraderOrder(): string[] {
  return [
    'prapor',
    'therapist',
    'fence',
    'skier',
    'peacekeeper',
    'mechanic',
    'ragman',
    'jaeger',
    'ref',
    'btrdriver',
    'lightkeeper'
  ]
}

// Sort traders by predefined order
export function sortTraders(traders: string[]): string[] {
  const order = getTraderOrder()
  return traders.sort((a, b) => {
    const aIndex = order.findIndex(t => t.toLowerCase() === a.toLowerCase())
    const bIndex = order.findIndex(t => t.toLowerCase() === b.toLowerCase())

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex
    }
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    return a.localeCompare(b)
  })
}