<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold text-gray-900">Hideout</h1>
        <div v-if="user" class="text-right">
          <div class="text-lg font-semibold" :class="getOverallProgressClass()">
            {{ getOverallCompletedLevels() }} / {{ getTotalLevels() }} levels
          </div>
          <div class="text-sm text-gray-500">
            {{ getOverallProgressPercentage() }}% Complete
          </div>
        </div>
      </div>
      <p class="text-gray-600 mb-6">
        Track your hideout upgrade progress and required items.
      </p>
    </div>

    <div v-if="!user" class="text-center py-8">
      <p class="text-gray-500 mb-4">Please sign in to track your hideout progress</p>
      <button @click="signInWithGoogle" class="btn btn-primary">
        Sign in with Google
      </button>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="station in hideoutStations"
        :key="station.id"
        class="bg-white rounded-lg shadow-md p-6"
      >
        <div class="mb-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ station.name }}</h3>
              <p class="text-sm text-gray-500">Upgrade Station</p>
            </div>
            <div class="text-right">
              <div class="text-sm font-medium" :class="getStationProgressClass(station)">
                {{ getStationCompletedLevels(station) }} / {{ station.levels.length }} levels
              </div>
              <div class="text-xs text-gray-500">
                {{ getStationProgressPercentage(station) }}% Complete
              </div>
            </div>
          </div>
        </div>
        
        <div class="space-y-4">
          <div
            v-for="level in station.levels"
            :key="level.level"
            class="border border-gray-200 rounded-lg p-4"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-2">
                <h4 class="font-medium text-gray-900">Level {{ level.level }}</h4>
                <button
                  @click="toggleLevelCompletion(station.id, level.level)"
                  :class="[
                    'w-6 h-6 rounded border-2 flex items-center justify-center transition-colors',
                    isLevelComplete(station.id, level.level)
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-green-400'
                  ]"
                  :title="isLevelComplete(station.id, level.level) ? 'Mark as incomplete' : 'Mark as complete'"
                >
                  <svg v-if="isLevelComplete(station.id, level.level)" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
              <span class="text-sm text-gray-500">
                Construction Time: {{ level.constructionTime }}
              </span>
            </div>
            
            <div class="space-y-3">
              <div>
                <h5 class="text-sm font-medium text-gray-700 mb-2">Requirements:</h5>
                <div class="space-y-2">
                  <div
                    v-for="requirement in level.requirements"
                    :key="requirement.id"
                    class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                        <img 
                          v-if="requirement.itemIconLink"
                          :src="requirement.itemIconLink"
                          :alt="requirement.itemName || getItemName(requirement.itemId)"
                          class="w-full h-full object-cover"
                          @error="$event.target.style.display='none'"
                        />
                        <span v-else class="text-xs text-gray-500">IMG</span>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">
                          {{ requirement.itemName || getItemName(requirement.itemId) }}
                        </p>
                        <p class="text-sm text-gray-500">
                          Found in Raid required
                        </p>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-lg font-semibold" :class="getProgressClass(requirement)">
                        {{ getUserItemCount(requirement.itemId, true) }} / {{ requirement.quantity }}
                      </div>
                      <div class="text-xs text-gray-500">
                        {{ getProgressPercentage(requirement) }}% Complete
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 class="text-sm font-medium text-gray-700 mb-2">Benefits:</h5>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="benefit in level.benefits"
                    :key="benefit"
                    class="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                  >
                    {{ benefit }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="user" class="bg-white rounded-lg shadow-md p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">All Required Items Summary</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="(total, itemId) in requiredItemsSummary"
          :key="itemId"
          class="p-3 bg-gray-50 rounded-lg"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                <img 
                  v-if="getItemIconLink(itemId)"
                  :src="getItemIconLink(itemId)"
                  :alt="getItemName(itemId)"
                  class="w-full h-full object-cover"
                  @error="$event.target.style.display='none'"
                />
                <span v-else class="text-xs text-gray-500">IMG</span>
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ getItemName(itemId) }}</p>
                <p class="text-sm text-gray-500">Total needed</p>
              </div>
            </div>
            <div class="text-right">
              <div class="text-lg font-semibold" :class="getUserItemCount(itemId, true) >= total ? 'text-green-600' : 'text-red-600'">
                {{ getUserItemCount(itemId, true) }} / {{ total }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { hideoutStations, getAllHideoutRequirements } from '~/data/hideout'
import { getItemById } from '~/data/items'

const { user, signInWithGoogle } = useAuth()
const { getUserItemCollection, saveUserHideoutProgress, getUserHideoutProgress } = useFirestore()

const userItems = ref({})
const hideoutProgress = ref({})

const requiredItemsSummary = computed(() => {
  const summary = {}
  const allRequirements = getAllHideoutRequirements()
  
  allRequirements.forEach(req => {
    if (!summary[req.itemId]) {
      summary[req.itemId] = 0
    }
    summary[req.itemId] += req.quantity
  })
  
  return summary
})

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