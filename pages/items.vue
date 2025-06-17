<template>
  <div class="space-y-6">
    <div class="bg-dark-card rounded-lg shadow-md p-6">
      <h1 class="text-2xl font-bold text-dark-text mb-4">Item Collection</h1>
      <p class="text-dark-text-secondary mb-6">
        Track your Found in Raid items for tasks and hideout upgrades.
      </p>
      
      <div class="mb-6">
        <input
          :value="searchQuery"
          @input="handleSearchInput"
          type="text"
          placeholder="Search items..."
          class="w-full px-4 py-2 bg-dark-surface border border-dark-surface rounded-lg text-dark-text placeholder-dark-text-secondary focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        >
      </div>
      
    </div>

    <div v-if="!user" class="text-center py-8">
      <p class="text-dark-text-secondary mb-4">Please sign in to track your items</p>
      <button @click="signInWithGoogle" class="btn btn-primary">
        Sign in with Google
      </button>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="groupedItem in groupedItemRequirements"
        :key="groupedItem.itemId"
        class="bg-dark-card rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
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
              <h3 class="font-semibold text-dark-text truncate">{{ groupedItem.itemName }}</h3>
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
                @input="updateQuantity(groupedItem.itemId, $event.target.value)"
                @blur="saveQuantity(groupedItem.itemId)"
                type="number"
                min="0"
                class="w-16 px-2 py-1 text-center border border-dark-surface rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-dark-surface text-dark-text text-sm"
              >
              
              <button
                @click="incrementQuantity(groupedItem.itemId)"
                class="w-8 h-8 rounded-full bg-dark-surface hover:bg-dark-hover flex items-center justify-center transition-colors"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <span class="text-sm text-dark-text-secondary ml-2">/ {{ groupedItem.totalQuantity }}</span>
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
              <h3 class="font-semibold text-dark-text text-sm break-words">{{ groupedItem.itemName }}</h3>
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
                @input="updateQuantity(groupedItem.itemId, $event.target.value)"
                @blur="saveQuantity(groupedItem.itemId)"
                type="number"
                min="0"
                class="w-16 px-2 py-1 text-center border border-dark-surface rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-dark-card text-dark-text text-sm"
              >
              
              <button
                @click="incrementQuantity(groupedItem.itemId)"
                class="w-8 h-8 rounded-full bg-dark-card hover:bg-dark-hover flex items-center justify-center transition-colors"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div class="text-center mt-2">
              <span class="text-xs text-dark-text-secondary">{{ getCurrentQuantity(groupedItem.itemId) }} / {{ groupedItem.totalQuantity }}</span>
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

const { user, signInWithGoogle } = useAuth()
const { updateUserItemCollection, getUserItemCollection, getUserHideoutProgress } = useFirestore()
const { showNonKappaTasks } = useSettings()
const { isMobile } = useBreakpoint()

// Hideout progress for filtering requirements
const hideoutProgress = ref({})

const searchQuery = ref('')
const { debouncedValue: debouncedSearchQuery, setValue: setDebouncedSearch } = useDebounce('', 300)

// Initialize item requirements composable
const { baseGroupedItemRequirements } = useItemRequirements({
  showNonKappaTasks,
  hideoutProgress
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
    if (!user.value) return
    await updateUserItemCollection(user.value.uid, itemId, {
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

// Apply search filter to grouped requirements
const groupedItemRequirements = computed(() => {
  return filterGroupedItemRequirements(
    baseGroupedItemRequirements.value,
    debouncedSearchQuery.value
  )
})

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
  if (!user.value) return
  await saveQuantityInternal(itemId)
}

// Load user items from Firestore
const loadUserItems = async () => {
  if (!user.value) return
  
  try {
    const userItems = await getUserItemCollection(user.value.uid)
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
  if (!user.value) return
  
  try {
    const progress = await getUserHideoutProgress(user.value.uid)
    
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

// Watch for user changes
watch(user, (newUser) => {
  if (newUser) {
    loadUserItems()
    loadHideoutProgress()
  } else {
    clearQuantities()
    hideoutProgress.value = {}
  }
}, { immediate: true })

useHead({
  title: 'Items - EFT Tracker'
})
</script>