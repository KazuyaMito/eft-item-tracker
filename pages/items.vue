<template>
  <div class="space-y-6">
    <div class="bg-dark-card rounded-lg shadow-md p-6">
      <h1 class="text-2xl font-bold text-dark-text mb-4">Item Collection</h1>
      <p class="text-dark-text-secondary mb-6">
        Track your Found in Raid items for tasks and hideout upgrades.
      </p>
      
      <div class="mb-6">
        <input
          v-model="searchQuery"
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
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4 flex-1">
            <div class="w-16 h-16 bg-dark-surface rounded flex items-center justify-center overflow-hidden flex-shrink-0">
              <img 
                v-if="getItemIconLink(groupedItem.itemId)"
                :src="getItemIconLink(groupedItem.itemId)"
                :alt="getItemName(groupedItem.itemId)"
                class="w-full h-full object-cover"
                @error="$event.target.style.display='none'"
              />
              <span v-else class="text-xs text-dark-text-secondary">IMG</span>
            </div>
            
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-dark-text truncate">{{ getItemName(groupedItem.itemId) }}</h3>
              <div class="space-y-1">
                <div
                  v-for="source in groupedItem.sources"
                  :key="source.sourceId"
                  class="flex items-center space-x-2"
                >
                  <div class="flex items-center space-x-2">
                    <div
                      v-if="source.source === 'task'"
                      class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
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
                      class="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 overflow-hidden"
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
                        'text-sm truncate px-2 py-1 text-xs rounded',
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
                class="w-16 px-2 py-1 text-center border border-dark-surface rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-dark-surface text-dark-text"
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { eftItems, searchItems, getItemsByCategory, getItemById } from '~/data/items'
import { eftTasks } from '~/data/tasks'
import { hideoutStations } from '~/data/hideout'

const { user, signInWithGoogle } = useAuth()
const { updateUserItemCollection, getUserItemCollection } = useFirestore()
const { showNonKappaTasks } = useSettings()

const searchQuery = ref('')
const itemQuantities = ref({})
const pendingUpdates = ref({})


const itemRequirements = computed(() => {
  const requirements = []
  
  // Filter tasks based on kappa setting
  const filteredTasks = showNonKappaTasks.value 
    ? eftTasks 
    : eftTasks.filter(task => task.kappaRequired === true)
  
  // Add task requirements
  filteredTasks.forEach(task => {
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
  
  // Add hideout requirements
  hideoutStations.forEach(station => {
    station.levels.forEach(level => {
      level.requirements.forEach(req => {
        requirements.push({
          itemId: req.itemId,
          quantity: req.quantity,
          source: 'hideout',
          sourceId: `${station.id}_${level.level}`,
          sourceName: `${station.name} Level ${level.level}`
        })
      })
    })
  })
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    return requirements.filter(req => {
      const item = getItemById(req.itemId)
      return item && (
        item.name.toLowerCase().includes(query) ||
        req.sourceName.toLowerCase().includes(query)
      )
    })
  }
  
  return requirements
})

const groupedItemRequirements = computed(() => {
  const grouped = {}
  
  itemRequirements.value.forEach(req => {
    if (!grouped[req.itemId]) {
      grouped[req.itemId] = {
        itemId: req.itemId,
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
  
  return Object.values(grouped).sort((a, b) => {
    const itemA = getItemById(a.itemId)
    const itemB = getItemById(b.itemId)
    return (itemA?.name || a.itemId).localeCompare(itemB?.name || b.itemId)
  })
})

const getItemName = (itemId) => {
  const item = getItemById(itemId)
  return item ? item.name : itemId
}

const getItemIconLink = (itemId) => {
  const item = getItemById(itemId)
  return item ? item.iconLink : null
}

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

const getCurrentQuantity = (itemId) => {
  if (pendingUpdates.value[itemId] !== undefined) {
    return pendingUpdates.value[itemId]
  }
  return itemQuantities.value[itemId]?.foundInRaid || 0
}

const updateQuantity = (itemId, value) => {
  const numValue = Math.max(0, parseInt(value) || 0)
  pendingUpdates.value[itemId] = numValue
}

const incrementQuantity = (itemId) => {
  const current = getCurrentQuantity(itemId)
  pendingUpdates.value[itemId] = current + 1
  saveQuantity(itemId)
}

const decrementQuantity = (itemId) => {
  const current = getCurrentQuantity(itemId)
  if (current > 0) {
    pendingUpdates.value[itemId] = current - 1
    saveQuantity(itemId)
  }
}

const saveQuantity = async (itemId) => {
  if (!user.value) return
  
  const newQuantity = pendingUpdates.value[itemId] !== undefined 
    ? pendingUpdates.value[itemId] 
    : getCurrentQuantity(itemId)
  
  if (!itemQuantities.value[itemId]) {
    itemQuantities.value[itemId] = {
      total: newQuantity,
      foundInRaid: newQuantity,
      notes: ''
    }
  } else {
    itemQuantities.value[itemId].foundInRaid = newQuantity
    itemQuantities.value[itemId].total = Math.max(itemQuantities.value[itemId].total, newQuantity)
  }
  
  delete pendingUpdates.value[itemId]
  
  try {
    await updateUserItemCollection(user.value.uid, itemId, {
      quantity: itemQuantities.value[itemId].total,
      foundInRaid: itemQuantities.value[itemId].foundInRaid,
      notes: itemQuantities.value[itemId].notes || ''
    })
  } catch (error) {
    console.error('Failed to update item:', error)
  }
}


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
    
    itemQuantities.value = quantities
  } catch (error) {
    console.error('Failed to load user items:', error)
  }
}

watch(user, (newUser) => {
  if (newUser) {
    loadUserItems()
  } else {
    itemQuantities.value = {}
  }
}, { immediate: true })

useHead({
  title: 'Items - EFT Tracker'
})
</script>