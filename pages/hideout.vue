<template>
  <div class="space-y-6">
    <div class="bg-dark-card rounded-lg shadow-md p-6">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold text-dark-text">Hideout</h1>
        <div v-if="user" class="text-right">
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
      <div v-if="user" class="flex flex-wrap gap-2 mb-4">
        <button
          @click="setFilter('available')"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            currentFilter === 'available'
              ? 'bg-green-600 text-white'
              : 'bg-dark-surface text-dark-text hover:bg-green-600 hover:text-white'
          ]"
        >
          Available ({{ getTotalFilteredLevels('available') }})
        </button>
        <button
          @click="setFilter('locked')"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            currentFilter === 'locked'
              ? 'bg-red-600 text-white'
              : 'bg-dark-surface text-dark-text hover:bg-red-600 hover:text-white'
          ]"
        >
          Locked ({{ getTotalFilteredLevels('locked') }})
        </button>
        <button
          @click="setFilter('all')"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            currentFilter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-dark-surface text-dark-text hover:bg-blue-600 hover:text-white'
          ]"
        >
          All ({{ getTotalFilteredLevels('all') }})
        </button>
      </div>
    </div>

    <div v-if="!user" class="text-center py-8">
      <p class="text-dark-text-secondary mb-4">Please sign in to track your hideout progress</p>
      <button @click="signInWithGoogle" class="btn btn-primary">
        Sign in with Google
      </button>
    </div>

    <div v-else class="space-y-4">
      <template v-for="station in hideoutStations" :key="station.id">
        <div
          v-if="getFilteredLevels(station).length > 0"
          class="bg-dark-card rounded-lg shadow-md p-6"
        >
        <div class="mb-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-dark-text">{{ station.name }}</h3>
              <p class="text-sm text-dark-text-secondary">Upgrade Station</p>
            </div>
            <div class="text-right">
              <div class="text-sm font-medium" :class="getStationProgressClass(station)">
                {{ getStationCompletedLevels(station) }} / {{ station.levels.length }} levels
              </div>
              <div class="text-xs text-dark-text-secondary">
                {{ getStationProgressPercentage(station) }}% Complete
              </div>
            </div>
          </div>
        </div>
        
        <div class="space-y-4">
          <div
            v-for="level in getFilteredLevels(station)"
            :key="level.level"
            :class="[
              'border rounded-lg p-4',
              getFilteredLevelClasses(station.id, level)
            ]"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-2">
                <h4 class="font-medium text-dark-text">Level {{ level.level }}</h4>
                <button
                  @click="toggleLevelCompletion(station.id, level.level)"
                  :disabled="!isLevelBuildable(station.id, level)"
                  :class="[
                    'w-6 h-6 rounded border-2 flex items-center justify-center transition-colors',
                    isLevelComplete(station.id, level.level)
                      ? 'bg-green-500 border-green-500 text-white'
                      : isLevelBuildable(station.id, level)
                        ? 'border-dark-surface hover:border-green-400'
                        : 'border-gray-600 cursor-not-allowed opacity-50'
                  ]"
                  :title="isLevelComplete(station.id, level.level) ? 'Mark as incomplete' : isLevelBuildable(station.id, level) ? 'Mark as complete' : 'Prerequisites not met'"
                >
                  <svg v-if="isLevelComplete(station.id, level.level)" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
              <div class="text-right">
                <span class="text-sm text-dark-text-secondary">
                  Construction Time: {{ level.constructionTime }}
                </span>
                <div v-if="!isLevelBuildable(station.id, level) && !isLevelComplete(station.id, level.level)" class="text-xs text-red-400 mt-1">
                  Prerequisites not met
                </div>
                <div v-else-if="isLevelComplete(station.id, level.level)" class="text-xs text-green-400 mt-1">
                  Completed
                </div>
                <div v-else-if="isLevelBuildable(station.id, level)" class="text-xs text-blue-400 mt-1">
                  Ready to build
                </div>
              </div>
            </div>
            
            <div class="space-y-3">
              <!-- Station Prerequisites -->
              <div v-if="level.stationLevelRequirements && level.stationLevelRequirements.length > 0">
                <h5 class="text-sm font-medium text-dark-text mb-2">Station Prerequisites:</h5>
                <div class="space-y-2">
                  <div
                    v-for="requirement in level.stationLevelRequirements"
                    :key="requirement.stationId"
                    class="flex items-center justify-between p-2 bg-dark-surface rounded-lg"
                  >
                    <div class="flex items-center space-x-3">
                      <div class="text-sm font-medium text-dark-text">
                        {{ requirement.stationName }} Level {{ requirement.level }}
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-sm" :class="isStationLevelComplete(requirement.stationId, requirement.level) ? 'text-green-600' : 'text-red-600'">
                        {{ isStationLevelComplete(requirement.stationId, requirement.level) ? 'Complete' : 'Incomplete' }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Item Requirements -->
              <div>
                <h5 class="text-sm font-medium text-dark-text mb-2">Item Requirements:</h5>
                <div class="space-y-2">
                  <div
                    v-for="requirement in level.requirements"
                    :key="requirement.id"
                    class="flex items-center justify-between p-3 bg-dark-surface rounded-lg"
                  >
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 bg-dark-surface rounded flex items-center justify-center overflow-hidden">
                        <img 
                          v-if="requirement.itemIconLink"
                          :src="requirement.itemIconLink"
                          :alt="requirement.itemName || getItemName(requirement.itemId)"
                          class="w-full h-full object-cover"
                          @error="$event.target.style.display='none'"
                        />
                        <span v-else class="text-xs text-dark-text-secondary">IMG</span>
                      </div>
                      <div>
                        <p class="font-medium text-dark-text">
                          {{ requirement.itemName || getItemName(requirement.itemId) }}
                        </p>
                        <p class="text-sm text-dark-text-secondary">
                          Found in Raid required
                        </p>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-lg font-semibold" :class="getProgressClass(requirement)">
                        {{ getUserItemCount(requirement.itemId, true) }} / {{ requirement.quantity }}
                      </div>
                      <div class="text-xs text-dark-text-secondary">
                        {{ getProgressPercentage(requirement) }}% Complete
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Skill Requirements -->
              <div v-if="level.skillRequirements && level.skillRequirements.length > 0">
                <h5 class="text-sm font-medium text-dark-text mb-2">Skill Requirements:</h5>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="requirement in level.skillRequirements"
                    :key="requirement.skillId"
                    class="inline-block px-2 py-1 text-xs bg-purple-900 text-purple-200 rounded"
                  >
                    {{ requirement.skillName }} Level {{ requirement.level }}
                  </span>
                </div>
              </div>
              
              <!-- Trader Requirements -->
              <div v-if="level.traderRequirements && level.traderRequirements.length > 0">
                <h5 class="text-sm font-medium text-dark-text mb-2">Trader Requirements:</h5>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="requirement in level.traderRequirements"
                    :key="requirement.traderId"
                    class="inline-block px-2 py-1 text-xs bg-orange-900 text-orange-200 rounded"
                  >
                    {{ requirement.traderName }} Level {{ requirement.level }}
                  </span>
                </div>
              </div>
            </div>
            </div>
        </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { hideoutStations } from '~/data/hideout'
import { getItemById } from '~/data/items'

const { user, signInWithGoogle } = useAuth()
const { getUserItemCollection, saveUserHideoutProgress, getUserHideoutProgress } = useFirestore()

const userItems = ref({})
const hideoutProgress = ref({})
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

const isLevelComplete = (stationId, level) => {
  return hideoutProgress.value[`${stationId}_${level}`] === true
}

const toggleLevelCompletion = async (stationId, level) => {
  if (!user.value) return
  
  // Find the level object to check if it's buildable
  const station = hideoutStations.find(s => s.id === stationId)
  if (!station) return
  
  const levelObj = station.levels.find(l => l.level === level)
  if (!levelObj) return
  
  // Don't allow toggling if level is not buildable (unless already complete)
  if (!isLevelBuildable(stationId, levelObj) && !isLevelComplete(stationId, level)) {
    return
  }
  
  const key = `${stationId}_${level}`
  const newStatus = !hideoutProgress.value[key]
  
  hideoutProgress.value[key] = newStatus
  
  try {
    await saveUserHideoutProgress(user.value.uid, key, newStatus)
  } catch (error) {
    console.error('Failed to save hideout progress:', error)
    hideoutProgress.value[key] = !newStatus
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
  return hideoutProgress.value[`${stationId}_${level}`] === true
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
  }
}, { immediate: true })

useHead({
  title: 'Hideout - EFT Tracker'
})
</script>