import { ref, computed, type Ref, type ComputedRef } from 'vue'
import type { HideoutStation, HideoutLevel } from '~/types'

export interface UseHideoutProgressOptions {
  stations: Ref<HideoutStation[]> | ComputedRef<HideoutStation[]>
  userItems: Ref<Record<string, { quantity: number; foundInRaid: number }>>
  onUpgrade?: (stationId: string, level: number) => Promise<void>
  onDowngrade?: (stationId: string, level: number) => Promise<void>
}

export function useHideoutProgress(options: UseHideoutProgressOptions) {
  const { stations, userItems, onUpgrade, onDowngrade } = options
  const stationLevels = ref<Record<string, number>>({})
  const currentFilter = ref<'all' | 'available' | 'locked'>('available')
  
  // Get current level for a station
  const getStationCurrentLevel = (stationId: string): number => {
    return stationLevels.value[stationId] || 0
  }
  
  // Check if a level is complete
  const isLevelComplete = (stationId: string, level: number): boolean => {
    return getStationCurrentLevel(stationId) >= level
  }
  
  // Check if station level requirement is met
  const isStationLevelComplete = (stationId: string, level: number): boolean => {
    return getStationCurrentLevel(stationId) >= level
  }
  
  // Check if all station requirements are met
  const areStationRequirementsMet = (stationLevelRequirements: any[]): boolean => {
    if (!stationLevelRequirements || stationLevelRequirements.length === 0) {
      return true
    }
    
    const stationList = Array.isArray(stations.value) ? stations.value : []
    if (stationList.length === 0) {
      return false
    }
    
    return stationLevelRequirements.every(req => 
      isStationLevelComplete(req.stationId, req.level)
    )
  }
  
  // Check if a level is buildable
  const isLevelBuildable = (stationId: string, level: HideoutLevel): boolean => {
    // Check if previous level is complete (except for level 1)
    if (level.level > 1) {
      const previousLevelComplete = isLevelComplete(stationId, level.level - 1)
      if (!previousLevelComplete) {
        return false
      }
    }
    
    // Check station level requirements
    return areStationRequirementsMet(level.stationLevelRequirements || [])
  }
  
  // Check if station can be upgraded
  const canUpgradeStation = (station: HideoutStation): boolean => {
    const currentLevel = getStationCurrentLevel(station.id)
    const nextLevel = currentLevel + 1
    
    // Check if next level exists
    const nextLevelObj = station.levels.find(l => l.level === nextLevel)
    if (!nextLevelObj) return false
    
    // Check if next level is buildable
    return isLevelBuildable(station.id, nextLevelObj)
  }
  
  // Get item count from user inventory
  const getUserItemCount = (itemId: string, foundInRaid: boolean): number => {
    const item = userItems.value[itemId]
    if (!item) return 0
    
    return foundInRaid ? (item.foundInRaid || 0) : (item.quantity || 0)
  }
  
  // Get progress percentage for a requirement
  const getProgressPercentage = (requirement: { itemId: string; quantity: number }): number => {
    const current = getUserItemCount(requirement.itemId, true)
    const needed = requirement.quantity
    
    return Math.min(Math.round((current / needed) * 100), 100)
  }
  
  // Get progress class for styling
  const getProgressClass = (requirement: { itemId: string; quantity: number }): string => {
    const current = getUserItemCount(requirement.itemId, true)
    const needed = requirement.quantity
    
    if (current >= needed) return 'text-green-600'
    if (current > 0) return 'text-yellow-600'
    return 'text-red-600'
  }
  
  // Station progress calculations
  const getStationCompletedLevels = (station: HideoutStation): number => {
    return station.levels.filter(level => isLevelComplete(station.id, level.level)).length
  }
  
  const getStationProgressPercentage = (station: HideoutStation): number => {
    const completed = getStationCompletedLevels(station)
    return Math.round((completed / station.levels.length) * 100)
  }
  
  const getStationProgressClass = (station: HideoutStation): string => {
    const percentage = getStationProgressPercentage(station)
    if (percentage === 100) return 'text-green-600'
    if (percentage > 0) return 'text-yellow-600'
    return 'text-red-600'
  }
  
  // Overall progress calculations
  const getTotalLevels = computed(() => {
    const stationList = Array.isArray(stations.value) ? stations.value : []
    return stationList.reduce((total, station) => total + station.levels.length, 0)
  })
  
  const getOverallCompletedLevels = computed(() => {
    const stationList = Array.isArray(stations.value) ? stations.value : []
    return stationList.reduce((total, station) => total + getStationCompletedLevels(station), 0)
  })
  
  const getOverallProgressPercentage = computed(() => {
    const total = getTotalLevels.value
    const completed = getOverallCompletedLevels.value
    return total > 0 ? Math.round((completed / total) * 100) : 0
  })
  
  const getOverallProgressClass = computed(() => {
    const percentage = getOverallProgressPercentage.value
    if (percentage === 100) return 'text-green-600'
    if (percentage > 0) return 'text-yellow-600'
    return 'text-red-600'
  })
  
  // Filter functions
  const shouldShowLevelForFilter = (stationId: string, level: HideoutLevel, filter: string): boolean => {
    const stationList = Array.isArray(stations.value) ? stations.value : []
    if (stationList.length === 0) {
      return false
    }
    
    const isComplete = isLevelComplete(stationId, level.level)
    const isBuildable = isLevelBuildable(stationId, level)
    
    if (filter === 'all') {
      return true
    } else if (filter === 'available') {
      return !isComplete && isBuildable
    } else if (filter === 'locked') {
      return !isBuildable && !isComplete
    }
    
    return false
  }
  
  const getFilteredLevels = (station: HideoutStation): HideoutLevel[] => {
    const stationList = Array.isArray(stations.value) ? stations.value : []
    if (stationList.length === 0) {
      return []
    }
    
    return station.levels.filter(level => 
      shouldShowLevelForFilter(station.id, level, currentFilter.value)
    )
  }
  
  const getTotalFilteredLevels = (filter: string): number => {
    const stationList = Array.isArray(stations.value) ? stations.value : []
    if (stationList.length === 0) {
      return 0
    }
    
    let count = 0
    
    stationList.forEach(station => {
      station.levels.forEach(level => {
        if (shouldShowLevelForFilter(station.id, level, filter)) {
          count++
        }
      })
    })
    
    return count
  }
  
  const getFilteredLevelClasses = (stationId: string, level: HideoutLevel): string => {
    const isBuildable = isLevelBuildable(stationId, level)
    const isComplete = isLevelComplete(stationId, level.level)
    
    if (isComplete) {
      return 'border-green-500 bg-green-900/10'
    } else if (isBuildable) {
      return 'border-blue-500 bg-blue-900/10'
    } else {
      return 'border-red-500 bg-red-900/10 opacity-70'
    }
  }
  
  // Upgrade/downgrade functions
  const upgradeStation = async (stationId: string, newLevel: number) => {
    const stationList = Array.isArray(stations.value) ? stations.value : []
    const station = stationList.find(s => s.id === stationId)
    if (!station) return
    
    const levelObj = station.levels.find(l => l.level === newLevel)
    if (!levelObj || !isLevelBuildable(stationId, levelObj)) return
    
    stationLevels.value[stationId] = newLevel
    
    if (onUpgrade) {
      try {
        await onUpgrade(stationId, newLevel)
      } catch (error) {
        console.error('Failed to save hideout progress:', error)
        stationLevels.value[stationId] = newLevel - 1
        throw error
      }
    }
  }
  
  const downgradeStation = async (stationId: string, newLevel: number) => {
    stationLevels.value[stationId] = newLevel
    
    if (onDowngrade) {
      try {
        await onDowngrade(stationId, newLevel)
      } catch (error) {
        console.error('Failed to save hideout progress:', error)
        stationLevels.value[stationId] = newLevel + 1
        throw error
      }
    }
  }
  
  // Load station levels
  const loadStationLevels = (levels: Record<string, number>) => {
    stationLevels.value = levels
  }
  
  const setFilter = (filter: 'all' | 'available' | 'locked') => {
    currentFilter.value = filter
  }
  
  return {
    stationLevels: stationLevels as Readonly<Ref<Record<string, number>>>,
    currentFilter: currentFilter as Readonly<Ref<string>>,
    getStationCurrentLevel,
    isLevelComplete,
    isStationLevelComplete,
    areStationRequirementsMet,
    isLevelBuildable,
    canUpgradeStation,
    getUserItemCount,
    getProgressPercentage,
    getProgressClass,
    getStationCompletedLevels,
    getStationProgressPercentage,
    getStationProgressClass,
    getTotalLevels,
    getOverallCompletedLevels,
    getOverallProgressPercentage,
    getOverallProgressClass,
    shouldShowLevelForFilter,
    getFilteredLevels,
    getTotalFilteredLevels,
    getFilteredLevelClasses,
    upgradeStation,
    downgradeStation,
    loadStationLevels,
    setFilter
  }
}