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
          :class="[
            'bg-dark-card rounded-lg shadow-md',
            isMobile ? 'p-4' : 'p-6'
          ]"
        >
        <!-- PC Layout -->
        <div v-if="!isMobile" class="mb-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-dark-surface rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                <img 
                  v-if="station.imageLink"
                  :src="station.imageLink"
                  :alt="station.name"
                  class="w-full h-full object-cover"
                  @error="$event.target.style.display='none'"
                />
                <svg v-else class="w-6 h-6 text-dark-text-secondary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-dark-text">{{ station.name }}</h3>
                <p class="text-sm text-dark-text-secondary">Current Level: {{ getStationCurrentLevel(station.id) }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <div class="text-right">
                <div class="text-sm font-medium" :class="getStationProgressClass(station)">
                  {{ getStationCompletedLevels(station) }} / {{ station.levels.length }} levels
                </div>
                <div class="text-xs text-dark-text-secondary">
                  {{ getStationProgressPercentage(station) }}% Complete
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <button
                  v-if="canUpgradeStation(station)"
                  @click="upgradeStation(station.id, getStationCurrentLevel(station.id) + 1)"
                  class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Upgrade to Level {{ getStationCurrentLevel(station.id) + 1 }}
                </button>
                <button
                  v-if="getStationCurrentLevel(station.id) > 0"
                  @click="downgradeStation(station.id, getStationCurrentLevel(station.id) - 1)"
                  class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                >
                  Downgrade
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Layout -->
        <div v-else class="mb-4">
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-dark-surface rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                <img 
                  v-if="station.imageLink"
                  :src="station.imageLink"
                  :alt="station.name"
                  class="w-full h-full object-cover"
                  @error="$event.target.style.display='none'"
                />
                <svg v-else class="w-4 h-4 text-dark-text-secondary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                </svg>
              </div>
              <div>
                <h3 class="text-base font-semibold text-dark-text">{{ station.name }}</h3>
                <p class="text-xs text-dark-text-secondary">Current Level: {{ getStationCurrentLevel(station.id) }}</p>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-medium" :class="getStationProgressClass(station)">
                  {{ getStationCompletedLevels(station) }} / {{ station.levels.length }}
                </div>
                <div class="text-xs text-dark-text-secondary">
                  {{ getStationProgressPercentage(station) }}% Complete
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button
                  v-if="canUpgradeStation(station)"
                  @click="upgradeStation(station.id, getStationCurrentLevel(station.id) + 1)"
                  class="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  Upgrade L{{ getStationCurrentLevel(station.id) + 1 }}
                </button>
                <button
                  v-if="getStationCurrentLevel(station.id) > 0"
                  @click="downgradeStation(station.id, getStationCurrentLevel(station.id) - 1)"
                  class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
                >
                  Down
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="space-y-4">
          <div
            v-for="level in getFilteredLevels(station)"
            :key="level.level"
            :class="[
              'border rounded-lg',
              isMobile ? 'p-3' : 'p-4',
              getFilteredLevelClasses(station.id, level)
            ]"
          >
            <div :class="[
              'flex items-center justify-between',
              isMobile ? 'mb-2' : 'mb-3'
            ]">
              <div>
                <h4 :class="[
                  'font-medium text-dark-text',
                  isMobile ? 'text-sm' : ''
                ]">Level {{ level.level }}</h4>
                <span :class="[
                  'text-dark-text-secondary',
                  isMobile ? 'text-xs' : 'text-sm'
                ]">
                  Construction Time: {{ level.constructionTime }}
                </span>
              </div>
              <div class="text-right">
                <div v-if="getStationCurrentLevel(station.id) === level.level" :class="[
                  'text-green-400 font-medium',
                  isMobile ? 'text-xs' : 'text-sm'
                ]">
                  Current Level
                </div>
                <div v-else-if="getStationCurrentLevel(station.id) > level.level" :class="[
                  'text-green-400',
                  isMobile ? 'text-xs' : 'text-sm'
                ]">
                  Completed
                </div>
                <div v-else-if="getStationCurrentLevel(station.id) === level.level - 1 && isLevelBuildable(station.id, level)" :class="[
                  'text-blue-400',
                  isMobile ? 'text-xs' : 'text-sm'
                ]">
                  Ready to build
                </div>
                <div v-else-if="!isLevelBuildable(station.id, level)" :class="[
                  'text-red-400',
                  isMobile ? 'text-xs' : 'text-sm'
                ]">
                  Prerequisites not met
                </div>
              </div>
            </div>
            
            <div class="space-y-3">
              <!-- Station Prerequisites -->
              <div v-if="level.stationLevelRequirements && level.stationLevelRequirements.length > 0">
                <h5 :class="[
                  'font-medium text-dark-text mb-2',
                  isMobile ? 'text-xs' : 'text-sm'
                ]">Station Prerequisites:</h5>
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
                <h5 :class="[
                  'font-medium text-dark-text mb-2',
                  isMobile ? 'text-xs' : 'text-sm'
                ]">Item Requirements:</h5>
                <div class="space-y-2">
                  <div
                    v-for="requirement in level.requirements"
                    :key="requirement.id"
                    :class="[
                      'flex items-center justify-between bg-dark-surface rounded-lg',
                      isMobile ? 'p-2' : 'p-3'
                    ]"
                  >
                    <div class="flex items-center" :class="isMobile ? 'space-x-2' : 'space-x-3'">
                      <div :class="[
                        'bg-dark-surface rounded flex items-center justify-center overflow-hidden',
                        isMobile ? 'w-8 h-8' : 'w-10 h-10'
                      ]">
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
                        <p :class="[
                          'font-medium text-dark-text',
                          isMobile ? 'text-sm' : ''
                        ]">
                          {{ requirement.itemName || getItemName(requirement.itemId) }}
                        </p>
                        <p :class="[
                          'text-dark-text-secondary',
                          isMobile ? 'text-xs' : 'text-sm'
                        ]">
                          Found in Raid required
                        </p>
                      </div>
                    </div>
                    <div class="text-right">
                      <div :class="[
                        'font-semibold',
                        isMobile ? 'text-base' : 'text-lg',
                        getProgressClass(requirement)
                      ]">
                        {{ getUserItemCount(requirement.itemId, true) }} / {{ requirement.quantity }}
                      </div>
                      <div class="text-xs text-dark-text-secondary">
                        {{ getProgressPercentage(requirement) }}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Skill Requirements -->
              <div v-if="level.skillRequirements && level.skillRequirements.length > 0">
                <h5 :class="[
                  'font-medium text-dark-text mb-2',
                  isMobile ? 'text-xs' : 'text-sm'
                ]">Skill Requirements:</h5>
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
                <h5 :class="[
                  'font-medium text-dark-text mb-2',
                  isMobile ? 'text-xs' : 'text-sm'
                ]">Trader Requirements:</h5>
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
  return 0
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
    if (levels.stash === undefined) {
      const startingLevel = getStationStartingLevel('stash')
      if (startingLevel > 0) {
        levels.stash = startingLevel
        // Save the starting level to Firestore
        await saveUserHideoutProgress(user.value.uid, 'stash', startingLevel)
      }
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

// Watch for game edition changes and update stash level if needed
watch(gameEdition, async (newEdition) => {
  if (!user.value) return
  
  const newStartingLevel = getStationStartingLevel('stash')
  const currentStashLevel = stationLevels.value.stash || 0
  
  // Only update if the new starting level is higher than current level
  if (newStartingLevel > currentStashLevel) {
    stationLevels.value.stash = newStartingLevel
    try {
      await saveUserHideoutProgress(user.value.uid, 'stash', newStartingLevel)
    } catch (error) {
      console.error('Failed to update stash level:', error)
    }
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