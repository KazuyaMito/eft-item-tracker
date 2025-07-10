<template>
  <div class="space-y-6">
    <div class="bg-dark-card rounded-lg shadow-md p-6">
      <h1 class="text-2xl font-bold text-dark-text mb-4">Item Collection</h1>
      <p class="text-dark-text-secondary mb-6">
        Track your Found in Raid items for tasks and hideout upgrades.
      </p>
      
      <div class="mb-6 space-y-4">
        <input
          :value="searchQuery"
          @input="handleSearchInput"
          type="text"
          placeholder="Search items..."
          class="w-full px-4 py-2 bg-dark-surface border border-dark-surface rounded-lg text-dark-text placeholder-dark-text-secondary focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        >
        
        <div class="flex flex-wrap gap-4">
          <label class="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              :checked="showTasks"
              @change="toggleTasks"
              class="w-4 h-4 text-blue-600 bg-dark-surface border-dark-border rounded focus:ring-blue-500 focus:ring-2"
            >
            <span class="text-sm text-dark-text flex items-center space-x-1">
              <div class="w-4 h-4 bg-blue-900 rounded flex items-center justify-center">
                <svg class="w-3 h-3 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span>Tasks</span>
            </span>
          </label>
          
          <label class="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              :checked="showHideout"
              @change="toggleHideout"
              class="w-4 h-4 text-green-600 bg-dark-surface border-dark-border rounded focus:ring-green-500 focus:ring-2"
            >
            <span class="text-sm text-dark-text flex items-center space-x-1">
              <div class="w-4 h-4 bg-green-900 rounded flex items-center justify-center">
                <svg class="w-3 h-3 text-green-200" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                </svg>
              </div>
              <span>Hideout</span>
            </span>
          </label>
        </div>
      </div>
      
    </div>

    <div class="space-y-4">
      <div
        v-for="groupedItem in groupedItemRequirements"
        :key="groupedItem.itemId"
        :class="[
          'rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300',
          isItemCompleted(groupedItem.itemId, groupedItem.totalQuantity)
            ? 'bg-green-900/20 border-2 border-green-600/50 shadow-green-600/20'
            : 'bg-dark-card'
        ]"
      >
        <!-- PC Layout -->
        <div v-if="!isMobile" class="flex items-center justify-between">
          <div class="flex items-center space-x-4 flex-1">
            <div class="w-16 h-16 bg-dark-surface rounded flex items-center justify-center overflow-hidden flex-shrink-0">
              <img 
                v-if="groupedItem.itemIconLink"
                :src="groupedItem.itemIconLink"
                :alt="groupedItem.itemName"
                class="w-full h-full object-cover"
                @error="$event.target.style.display='none'"
              />
              <span v-else class="text-xs text-dark-text-secondary">IMG</span>
            </div>
            
            <div class="flex-1 min-w-0">
              <h3 
                :class="[
                  'font-semibold truncate flex items-center gap-2',
                  isItemCompleted(groupedItem.itemId, groupedItem.totalQuantity)
                    ? 'text-green-400'
                    : 'text-dark-text'
                ]"
              >
                {{ groupedItem.itemName }}
                <svg 
                  v-if="isItemCompleted(groupedItem.itemId, groupedItem.totalQuantity)"
                  class="w-4 h-4 text-green-400 flex-shrink-0" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </h3>
              <div class="space-y-1">
                <div
                  v-for="source in groupedItem.sources"
                  :key="source.sourceId"
                  class="flex items-center space-x-2"
                >
                  <div class="flex items-center space-x-2">
                    <div
                      v-if="source.source === 'task'"
                      class="w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                      :title="source.traderName"
                    >
                      <img
                        :src="getTraderImage(source.traderName)"
                        :alt="source.traderName"
                        class="w-full h-full object-cover"
                        @error="$event.target.style.display='none'; $event.target.nextElementSibling.style.display='flex'"
                      >
                      <div
                        class="w-full h-full bg-dark-surface rounded-full items-center justify-center text-xs text-dark-text-secondary hidden"
                      >
                        {{ getTraderInitial(source.traderName) }}
                      </div>
                    </div>
                    <div
                      v-else-if="source.source === 'hideout'"
                      class="w-4 h-4 md:w-5 md:h-5 rounded flex items-center justify-center flex-shrink-0 overflow-hidden"
                      :title="getHideoutStationName(source.sourceId)"
                    >
                      <img
                        :src="getHideoutImage(source.sourceId)"
                        :alt="getHideoutStationName(source.sourceId)"
                        class="w-full h-full object-cover"
                        @error="$event.target.style.display='none'; $event.target.nextElementSibling.style.display='flex'"
                      >
                      <div
                        class="w-full h-full bg-amber-800 rounded items-center justify-center text-xs text-amber-200 hidden"
                      >
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                        </svg>
                      </div>
                    </div>
                    <p
                      :class="[
                        'text-xs md:text-sm truncate px-1 md:px-2 py-1 rounded',
                        source.source === 'task' 
                          ? 'bg-blue-900 text-blue-200' 
                          : 'bg-green-900 text-green-200'
                      ]"
                    >
                      {{ source.sourceName }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <span class="text-sm text-dark-text-secondary mr-2">Found in Raid:</span>
              <button
                @click="decrementQuantity(groupedItem.itemId)"
                class="w-8 h-8 rounded-full bg-dark-surface hover:bg-dark-hover flex items-center justify-center transition-colors"
                :disabled="getCurrentQuantity(groupedItem.itemId) <= 0"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <input
                :value="getCurrentQuantity(groupedItem.itemId)"
                @input="updateQuantity(groupedItem.itemId, $event.target.value, groupedItem.totalQuantity)"
                @blur="saveQuantity(groupedItem.itemId)"
                type="number"
                min="0"
                :max="groupedItem.totalQuantity"
                class="w-16 px-2 py-1 text-center border border-dark-surface rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-dark-surface text-dark-text text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              >
              
              <button
                @click="incrementQuantity(groupedItem.itemId, groupedItem.totalQuantity)"
                :disabled="getCurrentQuantity(groupedItem.itemId) >= groupedItem.totalQuantity"
                class="w-8 h-8 rounded-full bg-dark-surface hover:bg-dark-hover flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <span 
                :class="[
                  'text-sm ml-2',
                  isItemCompleted(groupedItem.itemId, groupedItem.totalQuantity)
                    ? 'text-green-400 font-semibold'
                    : 'text-dark-text-secondary'
                ]"
              >
                / {{ groupedItem.totalQuantity }}
              </span>
            </div>
          </div>
        </div>

        <!-- Mobile Layout -->
        <div v-else class="flex flex-col space-y-4">
          <!-- アイテム情報セクション -->
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-dark-surface rounded flex items-center justify-center overflow-hidden flex-shrink-0">
              <img 
                v-if="groupedItem.itemIconLink"
                :src="groupedItem.itemIconLink"
                :alt="groupedItem.itemName"
                class="w-full h-full object-cover"
                @error="$event.target.style.display='none'"
              />
              <span v-else class="text-xs text-dark-text-secondary">IMG</span>
            </div>
            <div class="flex-1 min-w-0">
              <h3 
                :class="[
                  'font-semibold text-sm break-words flex items-center gap-2',
                  isItemCompleted(groupedItem.itemId, groupedItem.totalQuantity)
                    ? 'text-green-400'
                    : 'text-dark-text'
                ]"
              >
                {{ groupedItem.itemName }}
                <svg 
                  v-if="isItemCompleted(groupedItem.itemId, groupedItem.totalQuantity)"
                  class="w-3 h-3 text-green-400 flex-shrink-0" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </h3>
            </div>
          </div>

          <!-- ソース情報セクション -->
          <div class="space-y-2">
            <div
              v-for="source in groupedItem.sources"
              :key="source.sourceId"
              class="flex items-center space-x-2"
            >
              <div class="flex items-center space-x-2">
                <div
                  v-if="source.source === 'task'"
                  class="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                  :title="source.traderName"
                >
                  <img
                    :src="getTraderImage(source.traderName)"
                    :alt="source.traderName"
                    class="w-full h-full object-cover"
                    @error="$event.target.style.display='none'; $event.target.nextElementSibling.style.display='flex'"
                  >
                  <div
                    class="w-full h-full bg-dark-surface rounded-full items-center justify-center text-xs text-dark-text-secondary hidden"
                  >
                    {{ getTraderInitial(source.traderName) }}
                  </div>
                </div>
                <div
                  v-else-if="source.source === 'hideout'"
                  class="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 overflow-hidden"
                  :title="getHideoutStationName(source.sourceId)"
                >
                  <img
                    :src="getHideoutImage(source.sourceId)"
                    :alt="getHideoutStationName(source.sourceId)"
                    class="w-full h-full object-cover"
                    @error="$event.target.style.display='none'; $event.target.nextElementSibling.style.display='flex'"
                  >
                  <div
                    class="w-full h-full bg-amber-800 rounded items-center justify-center text-xs text-amber-200 hidden"
                  >
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                    </svg>
                  </div>
                </div>
                <p
                  :class="[
                    'text-xs truncate px-2 py-1 rounded',
                    source.source === 'task' 
                      ? 'bg-blue-900 text-blue-200' 
                      : 'bg-green-900 text-green-200'
                  ]"
                >
                  {{ source.sourceName }}
                </p>
              </div>
            </div>
          </div>

          <!-- コントロールセクション -->
          <div class="bg-dark-surface rounded-lg p-3">
            <div class="text-center mb-3">
              <span class="text-xs text-dark-text-secondary">Found in Raid</span>
            </div>
            <div class="flex items-center justify-center space-x-3">
              <button
                @click="decrementQuantity(groupedItem.itemId)"
                class="w-8 h-8 rounded-full bg-dark-card hover:bg-dark-hover flex items-center justify-center transition-colors"
                :disabled="getCurrentQuantity(groupedItem.itemId) <= 0"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <input
                :value="getCurrentQuantity(groupedItem.itemId)"
                @input="updateQuantity(groupedItem.itemId, $event.target.value, groupedItem.totalQuantity)"
                @blur="saveQuantity(groupedItem.itemId)"
                type="number"
                min="0"
                :max="groupedItem.totalQuantity"
                class="w-16 px-2 py-1 text-center border border-dark-surface rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-dark-card text-dark-text text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              >
              
              <button
                @click="incrementQuantity(groupedItem.itemId, groupedItem.totalQuantity)"
                :disabled="getCurrentQuantity(groupedItem.itemId) >= groupedItem.totalQuantity"
                class="w-8 h-8 rounded-full bg-dark-card hover:bg-dark-hover flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div class="text-center mt-2">
              <span 
                :class="[
                  'text-xs',
                  isItemCompleted(groupedItem.itemId, groupedItem.totalQuantity)
                    ? 'text-green-400 font-semibold'
                    : 'text-dark-text-secondary'
                ]"
              >
                {{ getCurrentQuantity(groupedItem.itemId) }} / {{ groupedItem.totalQuantity }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useItemRequirements, filterGroupedItemRequirements } from '~/composables/useItemRequirements'
import { useItemQuantity } from '~/composables/useItemQuantity'
import { useDebounce } from '~/composables/useDebounce'
import { hideoutStations } from '~/data/hideout'

const { user, signInWithGoogle, continueAsGuest, isGuest } = useAuth()
const { updateUserItemCollection, getUserItemCollection, getUserHideoutProgress } = useFirestore()
const { currentUserId, isLoggedIn } = useCurrentUser()
const { getUserTaskStatuses } = useTaskCompletion()
const { showNonKappaTasks } = useSettings()
const { isMobile } = useBreakpoint()

// Progress for filtering requirements
const hideoutProgress = ref({})
const completedTasks = ref({})

const searchQuery = ref('')
const { debouncedValue: debouncedSearchQuery, setValue: setDebouncedSearch } = useDebounce('', 300)

// Filter states
const showTasks = ref(true)
const showHideout = ref(true)

// Initialize item requirements composable
const { baseGroupedItemRequirements } = useItemRequirements({
  showNonKappaTasks,
  hideoutProgress,
  completedTasks
})

// Initialize item quantity composable
const {
  itemQuantities,
  getCurrentQuantity,
  updateQuantity,
  incrementQuantity,
  decrementQuantity,
  saveQuantity: saveQuantityInternal,
  loadQuantities,
  clearQuantities
} = useItemQuantity({
  onUpdate: async (itemId, quantity) => {
    if (!currentUserId.value) return
    await updateUserItemCollection(currentUserId.value, itemId, {
      quantity: quantity.total,
      foundInRaid: quantity.foundInRaid,
      notes: quantity.notes || ''
    })
  }
})

// Handle search input with debouncing
const handleSearchInput = (event) => {
  const value = event.target.value
  searchQuery.value = value
  setDebouncedSearch(value)
}

// Apply search and filter to grouped requirements
const groupedItemRequirements = computed(() => {
  let filtered = baseGroupedItemRequirements.value
  
  // Filter by source type (tasks/hideout)
  if (!showTasks.value || !showHideout.value) {
    filtered = filtered.map(item => {
      const filteredSources = item.sources.filter(source => {
        if (source.source === 'task' && !showTasks.value) return false
        if (source.source === 'hideout' && !showHideout.value) return false
        return true
      })
      
      // Recalculate totalQuantity based on filtered sources
      const newTotalQuantity = filteredSources.reduce((total, source) => total + source.quantity, 0)
      
      return {
        ...item,
        sources: filteredSources,
        totalQuantity: newTotalQuantity
      }
    }).filter(item => item.sources.length > 0)
  }
  
  // Apply search filter
  return filterGroupedItemRequirements(
    filtered,
    debouncedSearchQuery.value
  )
})

// Toggle functions for checkboxes
const toggleTasks = () => {
  showTasks.value = !showTasks.value
}

const toggleHideout = () => {
  showHideout.value = !showHideout.value
}

// Check if an item has the required quantity
const isItemCompleted = (itemId, requiredQuantity) => {
  const current = getCurrentQuantity(itemId)
  return current >= requiredQuantity
}

// Helper functions for display
const getTraderInitial = (traderName) => {
  if (!traderName) return '?'
  return traderName.charAt(0).toUpperCase()
}

const getTraderImage = (traderName) => {
  if (!traderName) return ''
  const { getTraderImageLink } = useTraders()
  return getTraderImageLink(traderName) || ''
}

const getHideoutImage = (sourceId) => {
  if (!sourceId) return ''
  const stationId = sourceId.split('_')[0]
  
  // Get image from API
  const station = hideoutStations.find(s => s.normalizedName === stationId)
  return station ? station.imageLink || '' : ''
}

const getHideoutStationName = (sourceId) => {
  if (!sourceId) return 'Hideout'
  const stationId = sourceId.split('_')[0]
  const station = hideoutStations.find(s => s.id === stationId)
  return station ? station.name : 'Hideout'
}

// Wrapper for saveQuantity to ensure user is authenticated
const saveQuantity = async (itemId) => {
  if (!currentUserId.value) return
  await saveQuantityInternal(itemId)
}

// Load user items from Firestore
const loadUserItems = async () => {
  if (!currentUserId.value) return
  
  try {
    const userItems = await getUserItemCollection(currentUserId.value)
    const quantities = {}
    
    userItems.forEach(item => {
      quantities[item.itemId] = {
        total: item.quantity || 0,
        foundInRaid: item.foundInRaid || 0,
        notes: item.notes || ''
      }
    })
    
    loadQuantities(quantities)
  } catch (error) {
    console.error('Failed to load user items:', error)
  }
}

// Load hideout progress from Firestore
const loadHideoutProgress = async () => {
  if (!currentUserId.value) return
  
  try {
    const progress = await getUserHideoutProgress(currentUserId.value)
    
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
    
    hideoutProgress.value = levels
  } catch (error) {
    console.error('Failed to load hideout progress:', error)
  }
}

// Load completed tasks from Firestore
const loadCompletedTasks = async () => {
  if (!currentUserId.value) return
  
  try {
    const taskStatuses = await getUserTaskStatuses()
    // Convert task statuses to simple completed boolean map
    const tasks = {}
    Object.entries(taskStatuses).forEach(([taskId, status]) => {
      tasks[taskId] = status.status === 'completed'
    })
    completedTasks.value = tasks
  } catch (error) {
    console.error('Failed to load completed tasks:', error)
  }
}

// Watch for user changes
watch(currentUserId, (newUserId) => {
  if (newUserId) {
    loadUserItems()
    loadHideoutProgress()
    loadCompletedTasks()
  } else {
    clearQuantities()
    hideoutProgress.value = {}
    completedTasks.value = {}
  }
}, { immediate: true })

// SEO Meta tags
useSeoMeta({
  title: 'EFT Items Collection Tracker - Found in Raid Items Management',
  description: 'Track and manage your Escape from Tarkov Found in Raid (FIR) items collection. Monitor item requirements for tasks and hideout upgrades. Search, filter, and track your EFT inventory progress.',
  ogTitle: 'EFT Items Collection Tracker - Found in Raid Items Management',
  ogDescription: 'Efficiently track Found in Raid items for Escape from Tarkov tasks and hideout upgrades. Complete item collection tracker with real-time progress updates.',
  keywords: 'EFT items, Escape from Tarkov items, Found in Raid, FIR tracker, EFT inventory, Tarkov item tracker, quest items, hideout items'
})
</script>