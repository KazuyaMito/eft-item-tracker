<template>
  <div class="space-y-6">
    <div class="bg-dark-card rounded-lg shadow-md p-6">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold text-dark-text">Hideout</h1>
        <div class="text-right">
          <div class="text-lg font-semibold" :class="getOverallProgressClass()">
            {{ getOverallCompletedLevels() }} / {{ getTotalLevels() }} levels
          </div>
          <div class="text-sm text-dark-text-secondary">
            {{ getOverallProgressPercentage() }}% Complete
          </div>
        </div>
      </div>
      <p class="text-dark-text-secondary mb-4">
        Track your hideout upgrade progress and required items.
      </p>
      
      <!-- Filter Buttons -->
      <div class="flex flex-wrap gap-2 mb-4">
        <button
          @click="setFilter('available')"
          :class="[
            'flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded bg-dark-surface text-xs md:text-sm font-medium transition-colors',
            currentFilter === 'available'
              ? 'text-white ring-2 ring-blue-500'
              : 'text-dark-text-secondary hover:text-white'
          ]"
        >
          <svg class="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="mobile-short-text">
            <span class="mobile-long">AVAILABLE ({{ getTotalFilteredLevels('available') }})</span>
            <span class="mobile-short">AVAIL</span>
          </span>
        </button>
        <button
          @click="setFilter('locked')"
          :class="[
            'flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded bg-dark-surface text-xs md:text-sm font-medium transition-colors',
            currentFilter === 'locked'
              ? 'text-white ring-2 ring-blue-500'
              : 'text-dark-text-secondary hover:text-white'
          ]"
        >
          <svg class="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span class="mobile-short-text">
            <span class="mobile-long">LOCKED ({{ getTotalFilteredLevels('locked') }})</span>
            <span class="mobile-short">LOCK</span>
          </span>
        </button>
        <button
          @click="setFilter('all')"
          :class="[
            'px-2 md:px-4 py-2 rounded bg-dark-surface text-xs md:text-sm font-medium transition-colors',
            currentFilter === 'all'
              ? 'text-white ring-2 ring-blue-500'
              : 'text-dark-text-secondary hover:text-white'
          ]"
        >
          ALL ({{ getTotalFilteredLevels('all') }})
        </button>
      </div>
    </div>

    <div class="space-y-4">
      <template v-for="station in hideoutStations" :key="station.id">
        <HideoutStationCard
          v-if="getFilteredLevels(station).length > 0"
          :station="station"
          :current-level="getStationCurrentLevel(station.id)"
          :completed-levels="getStationCompletedLevels(station)"
          :progress-percentage="getStationProgressPercentage(station)"
          :progress-class="getStationProgressClass(station)"
          :can-upgrade="canUpgradeStation(station)"
          :filtered-levels="getFilteredLevels(station)"
          :is-mobile="isMobile"
          :is-level-buildable="isLevelBuildable"
          :is-station-level-complete="isStationLevelComplete"
          :get-item-name="getItemName"
          :get-progress-class="getProgressClass"
          :get-progress-percentage="getProgressPercentage"
          :get-user-item-count="getUserItemCount"
          @upgrade="upgradeStation"
          @downgrade="downgradeStation"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import { hideoutStations } from '~/data/hideout'
import { getItemById } from '~/data/items'

const { user, signInWithGoogle } = useAuth()
const { currentUserId, isLoggedIn } = useCurrentUser()
const { getUserItemCollection, saveUserHideoutProgress, getUserHideoutProgress, reduceItemsForHideout } = useFirestore()
const { gameEdition } = useSettings()
const { isMobile } = useBreakpoint()

const userItems = ref({})
const hideoutProgress = ref({})
const stationLevels = ref({}) // Store current level for each station
const currentFilter = ref('available')

const getItemName = (itemId) => {
  const item = getItemById(itemId)
  return item ? item.name : itemId
}

const getItemIconLink = (itemId) => {
  const item = getItemById(itemId)
  return item ? item.iconLink : null
}

const getUserItemCount = (itemId, foundInRaid) => {
  const item = userItems.value[itemId]
  if (!item) return 0
  
  return foundInRaid ? (item.foundInRaid || 0) : (item.quantity || 0)
}

const getProgressClass = (requirement) => {
  const current = getUserItemCount(requirement.itemId, true)
  const needed = requirement.quantity
  
  if (current >= needed) return 'text-green-600'
  if (current > 0) return 'text-yellow-600'
  return 'text-red-600'
}

const getProgressPercentage = (requirement) => {
  const current = getUserItemCount(requirement.itemId, true)
  const needed = requirement.quantity
  
  return Math.min(Math.round((current / needed) * 100), 100)
}

const getStationStartingLevel = (stationId) => {
  // Stash starting level based on game edition
  if (stationId === 'stash') {
    if (gameEdition.value === 'Edge of Darkness Edition' || gameEdition.value === 'The Unheard Edition') {
      return 4
    }
  }
  
  // Cultist Circle starting level based on game edition
  if (stationId === 'cultist-circle') {
    if (gameEdition.value === 'The Unheard Edition') {
      return 1
    }
  }
  
  return 0
}

const updateStationLevelForEdition = async (stationId, levels) => {
  const startingLevel = getStationStartingLevel(stationId)
  if (startingLevel > 0 && levels[stationId] === undefined) {
    levels[stationId] = startingLevel
    // Save the starting level to Firestore
    await saveUserHideoutProgress(user.value.uid, stationId, startingLevel)
  }
}

const updateStationLevelOnEditionChange = async (stationId) => {
  const newStartingLevel = getStationStartingLevel(stationId)
  const currentLevel = stationLevels.value[stationId] || 0
  
  // Only update if the new starting level is higher than current level
  if (newStartingLevel > currentLevel) {
    stationLevels.value[stationId] = newStartingLevel
    try {
      await saveUserHideoutProgress(user.value.uid, stationId, newStartingLevel)
    } catch (error) {
      console.error(`Failed to update ${stationId} level:`, error)
    }
  }
}

const getStationCurrentLevel = (stationId) => {
  const currentLevel = stationLevels.value[stationId]
  if (currentLevel !== undefined) {
    return currentLevel
  }
  // Return starting level based on game edition if not set
  return getStationStartingLevel(stationId)
}

const isLevelComplete = (stationId, level) => {
  return getStationCurrentLevel(stationId) >= level
}

const upgradeStation = async (stationId, newLevel) => {
  if (!user.value) return
  
  const station = hideoutStations.find(s => s.id === stationId)
  if (!station) return
  
  const levelObj = station.levels.find(l => l.level === newLevel)
  if (!levelObj || !isLevelBuildable(stationId, levelObj)) return
  
  try {
    // First reduce the required items from user's inventory
    if (levelObj.requirements && levelObj.requirements.length > 0) {
      await reduceItemsForHideout(user.value.uid, levelObj.requirements)
    }
    
    // Then save the hideout progress
    await saveUserHideoutProgress(user.value.uid, stationId, newLevel)
    
    // Update local state
    stationLevels.value[stationId] = newLevel
    
    // Reload user items to reflect the changes
    await loadUserItems()
  } catch (error) {
    console.error('Failed to upgrade station:', error)
    // Don't update the state if there was an error
  }
}

const downgradeStation = async (stationId, newLevel) => {
  if (!user.value) return
  
  stationLevels.value[stationId] = newLevel
  
  try {
    await saveUserHideoutProgress(user.value.uid, stationId, newLevel)
  } catch (error) {
    console.error('Failed to save hideout progress:', error)
    stationLevels.value[stationId] = newLevel + 1
  }
}

const getStationCompletedLevels = (station) => {
  return station.levels.filter(level => isLevelComplete(station.id, level.level)).length
}

const getStationProgressPercentage = (station) => {
  const completed = getStationCompletedLevels(station)
  return Math.round((completed / station.levels.length) * 100)
}

const getStationProgressClass = (station) => {
  const percentage = getStationProgressPercentage(station)
  if (percentage === 100) return 'text-green-600'
  if (percentage > 0) return 'text-yellow-600'
  return 'text-red-600'
}

const getTotalLevels = () => {
  return hideoutStations.reduce((total, station) => total + station.levels.length, 0)
}

const getOverallCompletedLevels = () => {
  return hideoutStations.reduce((total, station) => total + getStationCompletedLevels(station), 0)
}

const getOverallProgressPercentage = () => {
  const total = getTotalLevels()
  const completed = getOverallCompletedLevels()
  return total > 0 ? Math.round((completed / total) * 100) : 0
}

const getOverallProgressClass = () => {
  const percentage = getOverallProgressPercentage()
  if (percentage === 100) return 'text-green-600'
  if (percentage > 0) return 'text-yellow-600'
  return 'text-red-600'
}

// Check if a station level is complete
const isStationLevelComplete = (stationId, level) => {
  return getStationCurrentLevel(stationId) >= level
}

// Check if all station level requirements are met
const areStationRequirementsMet = (stationLevelRequirements) => {
  // If no requirements, it's buildable
  if (!stationLevelRequirements || stationLevelRequirements.length === 0) {
    return true
  }
  
  // Ensure hideout data is loaded before checking requirements
  if (hideoutStations.length === 0) {
    return false // Not ready to determine, treat as not buildable
  }
  
  return stationLevelRequirements.every(req => {
    return isStationLevelComplete(req.stationId, req.level)
  })
}

// Check if a level is buildable (prerequisites met)
const isLevelBuildable = (stationId, level) => {
  // Check if previous level is complete (except for level 1)
  if (level.level > 1) {
    const previousLevelComplete = isLevelComplete(stationId, level.level - 1)
    if (!previousLevelComplete) {
      return false
    }
  }
  
  // Check station level requirements
  return areStationRequirementsMet(level.stationLevelRequirements)
}

// Check if station can be upgraded
const canUpgradeStation = (station) => {
  const currentLevel = getStationCurrentLevel(station.id)
  const nextLevel = currentLevel + 1
  
  // Check if next level exists
  const nextLevelObj = station.levels.find(l => l.level === nextLevel)
  if (!nextLevelObj) return false
  
  // Check if next level is buildable
  return isLevelBuildable(station.id, nextLevelObj)
}

// Filter management
const setFilter = (filter) => {
  currentFilter.value = filter
}

// Get filtered levels based on current filter
const getFilteredLevels = (station) => {
  // Ensure data is loaded before filtering
  if (hideoutStations.length === 0) {
    return []
  }
  
  const levels = []
  
  for (const level of station.levels) {
    const isComplete = isLevelComplete(station.id, level.level)
    const isBuildable = isLevelBuildable(station.id, level)
    
    // Apply filter logic
    if (currentFilter.value === 'all') {
      levels.push(level)
    } else if (currentFilter.value === 'available') {
      // Show only if not completed AND immediately buildable
      if (!isComplete && isBuildable) {
        levels.push(level)
      }
    } else if (currentFilter.value === 'locked') {
      // Show if not buildable and not complete
      if (!isBuildable && !isComplete) {
        levels.push(level)
      }
    }
  }
  
  return levels
}

// Check if a level should be shown for a specific filter
const shouldShowLevelForFilter = (stationId, level, filter) => {
  if (hideoutStations.length === 0) {
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

// Get total count for each filter type
const getTotalFilteredLevels = (filter) => {
  if (hideoutStations.length === 0) {
    return 0
  }
  
  let count = 0
  
  hideoutStations.forEach(station => {
    station.levels.forEach(level => {
      if (shouldShowLevelForFilter(station.id, level, filter)) {
        count++
      }
    })
  })
  
  return count
}

// Get CSS classes for filtered levels based on their state
const getFilteredLevelClasses = (stationId, level) => {
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

const loadUserItems = async () => {
  if (!user.value) return
  
  try {
    const items = await getUserItemCollection(user.value.uid)
    const itemsMap = {}
    
    items.forEach(item => {
      itemsMap[item.itemId] = {
        quantity: item.quantity || 0,
        foundInRaid: item.foundInRaid || 0
      }
    })
    
    userItems.value = itemsMap
  } catch (error) {
    console.error('Failed to load user items:', error)
  }
}

const loadHideoutProgress = async () => {
  if (!user.value) return
  
  try {
    const progress = await getUserHideoutProgress(user.value.uid)
    hideoutProgress.value = progress || {}
    
    // Convert old boolean format to new level format
    const levels = {}
    Object.keys(progress || {}).forEach(key => {
      if (key.includes('_')) {
        // Old format: stationId_level -> boolean
        const [stationId, level] = key.split('_')
        if (progress[key] === true) {
          levels[stationId] = Math.max(levels[stationId] || 0, parseInt(level))
        }
      } else {
        // New format: stationId -> currentLevel
        levels[key] = progress[key]
      }
    })
    
    // Set starting levels based on game edition
    const editionBasedStations = ['stash', 'cultist-circle']
    for (const stationId of editionBasedStations) {
      await updateStationLevelForEdition(stationId, levels)
    }
    
    stationLevels.value = levels
  } catch (error) {
    console.error('Failed to load hideout progress:', error)
  }
}

watch(user, (newUser) => {
  if (newUser) {
    loadUserItems()
    loadHideoutProgress()
  } else {
    userItems.value = {}
    hideoutProgress.value = {}
    stationLevels.value = {}
  }
}, { immediate: true })

// Watch for game edition changes and update station levels if needed
watch(gameEdition, async (newEdition) => {
  if (!user.value) return
  
  // Update all edition-based stations
  const editionBasedStations = ['stash', 'cultist-circle']
  for (const stationId of editionBasedStations) {
    await updateStationLevelOnEditionChange(stationId)
  }
})

// SEO Meta tags
useSeoMeta({
  title: 'EFT Hideout Tracker - Escape from Tarkov Hideout Upgrade Progress',
  description: 'Track your Escape from Tarkov hideout upgrade progress. Monitor station levels, required items, and prerequisites for all hideout modules including Workbench, Medstation, Nutrition Unit, and more.',
  ogTitle: 'EFT Hideout Tracker - Complete Hideout Upgrade Management',
  ogDescription: 'Comprehensive hideout tracker for Escape from Tarkov. Track all station upgrades, monitor item requirements, and manage your hideout progression efficiently.',
  keywords: 'EFT hideout, Escape from Tarkov hideout, hideout tracker, hideout upgrades, workbench upgrade, medstation upgrade, bitcoin farm, scav case, intelligence center, nutrition unit, water collector, generator, heating, vents, security, illumination, stash upgrade'
})
</script>