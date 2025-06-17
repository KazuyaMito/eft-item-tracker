import { computed, type ComputedRef } from 'vue'
import { eftTasks } from '~/data/tasks'
import { hideoutStations } from '~/data/hideout'
import { getItemById } from '~/data/items'
import type { ItemRequirement, GroupedItemRequirement } from '~/types'

export interface ItemRequirementSource {
  itemId: string
  quantity: number
  source: 'task' | 'hideout'
  sourceId: string
  sourceName: string
  traderName?: string
}

export interface UseItemRequirementsOptions {
  showNonKappaTasks: ComputedRef<boolean> | boolean
  hideoutProgress?: ComputedRef<Record<string, number>> | Record<string, number>
  completedTasks?: ComputedRef<Record<string, boolean>> | Record<string, boolean>
}

export function useItemRequirements(options: UseItemRequirementsOptions) {
  const showNonKappaTasks = computed(() => 
    typeof options.showNonKappaTasks === 'boolean' 
      ? options.showNonKappaTasks 
      : options.showNonKappaTasks.value
  )

  const hideoutProgress = computed(() => {
    const progress = options.hideoutProgress 
      ? (typeof options.hideoutProgress === 'object' && 'value' in options.hideoutProgress 
          ? options.hideoutProgress.value 
          : options.hideoutProgress)
      : {}
    
    // Ensure we have a proper object (not a number)
    return typeof progress === 'object' && progress !== null ? progress : {}
  })

  const completedTasks = computed(() => {
    const tasks = options.completedTasks
      ? (typeof options.completedTasks === 'object' && 'value' in options.completedTasks
          ? options.completedTasks.value
          : options.completedTasks)
      : {}
    
    return typeof tasks === 'object' && tasks !== null ? tasks : {}
  })

  // Extract all item requirements from tasks and hideout
  const baseItemRequirements = computed<ItemRequirementSource[]>(() => {
    const requirements: ItemRequirementSource[] = []
    
    // Filter tasks based on kappa setting
    const filteredTasks = showNonKappaTasks.value 
      ? eftTasks 
      : eftTasks.filter(task => task.kappaRequired === true)
    
    // Add task requirements (exclude completed tasks)
    filteredTasks.forEach(task => {
      // Skip completed tasks
      if (completedTasks.value[task.id]) return
      
      task.requirements.forEach(req => {
        requirements.push({
          itemId: req.itemId,
          quantity: req.quantity,
          source: 'task',
          sourceId: task.id,
          sourceName: task.name,
          traderName: task.trader
        })
      })
    })
    
    // Add hideout requirements (excluding completed levels)
    hideoutStations.forEach(station => {
      const currentLevel = hideoutProgress.value[station.id] || 0
      station.levels.forEach(level => {
        // Only include requirements for levels that are not yet completed
        if (level.level > currentLevel) {
          level.requirements.forEach(req => {
            requirements.push({
              itemId: req.itemId,
              quantity: req.quantity,
              source: 'hideout',
              sourceId: `${station.id}_${level.level}`,
              sourceName: `${station.name} Level ${level.level}`
            })
          })
        }
      })
    })
    
    return requirements
  })

  // Group requirements by item and calculate totals
  const groupItemRequirements = (requirements: ItemRequirementSource[]): GroupedItemRequirement[] => {
    const grouped: Record<string, GroupedItemRequirement> = {}
    
    requirements.forEach(req => {
      if (!grouped[req.itemId]) {
        const item = getItemById(req.itemId)
        grouped[req.itemId] = {
          itemId: req.itemId,
          itemName: item?.name || req.itemId,
          itemIconLink: item?.iconLink || null,
          sources: [],
          totalQuantity: 0
        }
      }
      
      grouped[req.itemId].sources.push({
        source: req.source,
        sourceId: req.sourceId,
        sourceName: req.sourceName,
        quantity: req.quantity,
        traderName: req.traderName
      })
      
      grouped[req.itemId].totalQuantity += req.quantity
    })
    
    return Object.values(grouped).sort((a, b) => 
      a.itemName.localeCompare(b.itemName)
    )
  }

  // Base grouped requirements (expensive operation, cached)
  const baseGroupedItemRequirements = computed(() => 
    groupItemRequirements(baseItemRequirements.value)
  )

  return {
    baseItemRequirements,
    baseGroupedItemRequirements,
    groupItemRequirements
  }
}

// Pure functions for testing
export function filterItemRequirements(
  requirements: ItemRequirementSource[], 
  searchQuery: string
): ItemRequirementSource[] {
  if (!searchQuery) return requirements
  
  const query = searchQuery.toLowerCase()
  return requirements.filter(req => {
    const item = getItemById(req.itemId)
    return item && (
      item.name.toLowerCase().includes(query) ||
      req.sourceName.toLowerCase().includes(query)
    )
  })
}

export function filterGroupedItemRequirements(
  groupedRequirements: GroupedItemRequirement[], 
  searchQuery: string
): GroupedItemRequirement[] {
  if (!searchQuery) return groupedRequirements
  
  const query = searchQuery.toLowerCase()
  return groupedRequirements.filter(req => 
    req.itemName.toLowerCase().includes(query) ||
    req.sources.some(source => 
      source.sourceName.toLowerCase().includes(query)
    )
  )
}