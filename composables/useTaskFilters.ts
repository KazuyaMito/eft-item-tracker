import { ref, computed, type Ref, type ComputedRef } from 'vue'
import type { EFTTask } from '~/types'

export interface UseTaskFiltersOptions {
  tasks: Ref<EFTTask[]> | ComputedRef<EFTTask[]>
  completedTasks: Ref<Record<string, boolean>>
  showNonKappaTasks: Ref<boolean> | ComputedRef<boolean>
}

export function useTaskFilters(options: UseTaskFiltersOptions) {
  const selectedTrader = ref<string | null>(null)
  const selectedFilter = ref<'all' | 'available' | 'locked' | 'completed'>('all')
  const selectedCategory = ref<'all' | 'traders'>('all')
  
  const { tasks, completedTasks, showNonKappaTasks } = options
  
  // Check if task is completed
  const isTaskCompleted = (taskId: string): boolean => {
    return completedTasks.value[taskId] === true
  }
  
  // Check if task is available (prerequisites met)
  const isTaskAvailable = (task: EFTTask): boolean => {
    if (!task.prerequisites || task.prerequisites.length === 0) {
      return true
    }
    return task.prerequisites.every(prereqId => isTaskCompleted(prereqId))
  }
  
  // Get unique traders from tasks
  const traders = computed(() => {
    const traderOrder = ['prapor', 'therapist', 'fence', 'skier', 'peacekeeper', 'mechanic', 'ragman', 'jaeger', 'ref', 'btrdriver', 'lightkeeper']
    const taskList = Array.isArray(tasks.value) ? tasks.value : []
    const traderList = [...new Set(taskList.map(task => task.trader))]
    
    return traderList.sort((a, b) => {
      const aIndex = traderOrder.findIndex(t => t.toLowerCase() === a.toLowerCase())
      const bIndex = traderOrder.findIndex(t => t.toLowerCase() === b.toLowerCase())
      
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex
      }
      if (aIndex !== -1) return -1
      if (bIndex !== -1) return 1
      return a.localeCompare(b)
    })
  })
  
  // Filter tasks based on current selections
  const filteredTasks = computed(() => {
    let taskList = Array.isArray(tasks.value) ? tasks.value : []
    
    // Apply trader filter
    if (selectedCategory.value === 'traders' && selectedTrader.value) {
      taskList = taskList.filter(task => 
        task.trader.toLowerCase() === selectedTrader.value?.toLowerCase()
      )
    }
    
    // Apply non-Kappa filter
    if (!showNonKappaTasks.value) {
      taskList = taskList.filter(task => task.kappaRequired === true)
    }
    
    // Apply status filter
    if (selectedFilter.value !== 'all') {
      taskList = taskList.filter(task => {
        const completed = isTaskCompleted(task.id)
        const available = isTaskAvailable(task)
        
        switch (selectedFilter.value) {
          case 'completed':
            return completed
          case 'available':
            return !completed && available
          case 'locked':
            return !completed && !available
          default:
            return true
        }
      })
    }
    
    return taskList
  })
  
  return {
    selectedTrader,
    selectedFilter,
    selectedCategory,
    traders,
    filteredTasks,
    isTaskCompleted,
    isTaskAvailable
  }
}

// Pure functions for filtering
export function filterTasksByTrader(tasks: EFTTask[], trader: string): EFTTask[] {
  return tasks.filter(task => task.trader.toLowerCase() === trader.toLowerCase())
}

export function filterTasksByStatus(
  tasks: EFTTask[], 
  status: 'available' | 'locked' | 'completed',
  completedTasks: Record<string, boolean>
): EFTTask[] {
  return tasks.filter(task => {
    const completed = completedTasks[task.id] === true
    const available = !task.prerequisites || task.prerequisites.length === 0 ||
      task.prerequisites.every(prereqId => completedTasks[prereqId] === true)
    
    switch (status) {
      case 'completed':
        return completed
      case 'available':
        return !completed && available
      case 'locked':
        return !completed && !available
      default:
        return true
    }
  })
}

export function filterKappaTasks(tasks: EFTTask[]): EFTTask[] {
  return tasks.filter(task => task.kappaRequired === true)
}