<template>
  <div class="space-y-6">
    <div class="bg-dark-card rounded-lg shadow-md p-6">
      <h1 class="text-2xl font-bold text-dark-text mb-4">Tasks</h1>
      <p class="text-dark-text-secondary mb-6">
        Track your progress on trader tasks and see required items.
      </p>
      
      <div class="mb-4 flex flex-wrap gap-2">
        <button
          v-for="trader in traders"
          :key="trader"
          @click="selectedTrader = selectedTrader === trader ? null : trader"
          :class="[
            'px-3 py-1 rounded-full text-sm font-medium transition-colors',
            selectedTrader === trader
              ? 'bg-blue-600 text-white'
              : 'bg-dark-surface text-dark-text-secondary hover:bg-dark-hover'
          ]"
        >
          {{ trader }}
        </button>
      </div>
    </div>

    <div v-if="!user" class="text-center py-8">
      <p class="text-dark-text-secondary mb-4">Please sign in to track your task progress</p>
      <button @click="signInWithGoogle" class="btn btn-primary">
        Sign in with Google
      </button>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="task in filteredTasks"
        :key="task.id"
        class="bg-dark-card rounded-lg shadow-md p-6"
      >
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold text-dark-text">{{ task.name }}</h3>
            <p class="text-sm text-dark-text-secondary">{{ task.trader }} - Level {{ task.level }}</p>
            <p class="text-dark-text-secondary mt-2">{{ task.description }}</p>
          </div>
          <div class="text-right">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              In Progress
            </span>
          </div>
        </div>
        
        <div class="space-y-3">
          <h4 class="font-medium text-dark-text">Requirements:</h4>
          <div class="space-y-2">
            <div
              v-for="requirement in task.requirements"
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
                    {{ requirement.foundInRaid ? 'Found in Raid' : 'Any condition' }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-semibold" :class="getProgressClass(requirement)">
                  {{ getUserItemCount(requirement.itemId, requirement.foundInRaid) }} / {{ requirement.quantity }}
                </div>
                <div class="text-xs text-dark-text-secondary">
                  {{ getProgressPercentage(requirement) }}% Complete
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-4 pt-4 border-t">
          <h4 class="font-medium text-dark-text mb-2">Rewards:</h4>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="reward in task.rewards"
              :key="reward"
              class="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded"
            >
              {{ reward }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { eftTasks, getTasksByTrader } from '~/data/tasks'
import { getItemById } from '~/data/items'

const { user, signInWithGoogle } = useAuth()
const { getUserItemCollection } = useFirestore()
const { showNonKappaTasks } = useSettings()

const selectedTrader = ref(null)
const userItems = ref({})

const traders = computed(() => {
  const traderList = [...new Set(eftTasks.map(task => task.trader))]
  return traderList.sort()
})

const filteredTasks = computed(() => {
  let tasks = selectedTrader.value ? getTasksByTrader(selectedTrader.value) : eftTasks
  
  // Apply non-Kappa filter if setting is disabled
  if (!showNonKappaTasks.value) {
    tasks = tasks.filter(task => task.kappaRequired === true)
  }
  
  return tasks
})

const getItemName = (itemId) => {
  const item = getItemById(itemId)
  return item ? item.name : itemId
}

const getUserItemCount = (itemId, foundInRaid) => {
  const item = userItems.value[itemId]
  if (!item) return 0
  
  return foundInRaid ? (item.foundInRaid || 0) : (item.quantity || 0)
}

const getProgressClass = (requirement) => {
  const current = getUserItemCount(requirement.itemId, requirement.foundInRaid)
  const needed = requirement.quantity
  
  if (current >= needed) return 'text-green-600'
  if (current > 0) return 'text-yellow-600'
  return 'text-red-600'
}

const getProgressPercentage = (requirement) => {
  const current = getUserItemCount(requirement.itemId, requirement.foundInRaid)
  const needed = requirement.quantity
  
  return Math.min(Math.round((current / needed) * 100), 100)
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

watch(user, (newUser) => {
  if (newUser) {
    loadUserItems()
  } else {
    userItems.value = {}
  }
}, { immediate: true })

useHead({
  title: 'Tasks - EFT Tracker'
})
</script>