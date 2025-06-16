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
          <div class="text-right space-y-2">
            <span 
              v-if="isTaskCompleted(task.id)"
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-900/20 text-green-400 border border-green-800"
            >
              Completed
            </span>
            <span 
              v-else
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-900/20 text-yellow-400 border border-yellow-800"
            >
              In Progress
            </span>
            <button
              v-if="!isTaskCompleted(task.id) && canCompleteTask(task)"
              @click="completeTask(task)"
              :disabled="completingTask === task.id"
              class="block ml-auto px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ completingTask === task.id ? 'Completing...' : 'Complete Task' }}
            </button>
          </div>
        </div>
        
        <div v-if="task.objectives && task.objectives.length > 0" class="space-y-3">
          <h4 class="font-medium text-dark-text">Objectives:</h4>
          <div class="space-y-2">
            <div
              v-for="(objective, index) in task.objectives"
              :key="`${task.id}_obj_${index}`"
              class="flex items-center space-x-3 p-3 bg-dark-surface rounded-lg group"
              :class="{ 'cursor-pointer': !isTaskCompleted(task.id) }"
              @click="!isTaskCompleted(task.id) && toggleObjective(task.id, index)"
              @mouseenter="!isTaskCompleted(task.id) && (hoveredObjective[`${task.id}_${index}`] = true)"
              @mouseleave="hoveredObjective[`${task.id}_${index}`] = false"
            >
              <div class="relative w-5 h-5 flex-shrink-0">
                <div
                  :class="[
                    'w-5 h-5 flex items-center justify-center transition-all cursor-pointer',
                    isObjectiveCompleted(task.id, index)
                      ? 'text-green-500'
                      : 'text-gray-400'
                  ]"
                >
                  <svg
                    v-if="isObjectiveCompleted(task.id, index) && !hoveredObjective[`${task.id}_${index}`]"
                    class="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                  <svg
                    v-else-if="isObjectiveCompleted(task.id, index) && hoveredObjective[`${task.id}_${index}`]"
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <svg
                    v-else-if="!isObjectiveCompleted(task.id, index) && !hoveredObjective[`${task.id}_${index}`]"
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <svg
                    v-else
                    class="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </div>
              </div>
              <p 
                :class="[
                  'text-sm transition-colors select-none',
                  isObjectiveCompleted(task.id, index)
                    ? 'text-green-500 font-medium'
                    : 'text-dark-text'
                ]"
              >
                {{ objective }}
              </p>
            </div>
          </div>
        </div>
        
        <div v-if="task.requirements && task.requirements.length > 0" class="space-y-3">
          <h4 class="font-medium text-dark-text">Item Requirements:</h4>
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
        
        <div class="mt-4 pt-4 border-t border-dark-border">
          <h4 class="font-medium text-dark-text mb-2">Rewards:</h4>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="reward in task.rewards"
              :key="reward"
              class="inline-block px-2 py-1 text-xs bg-green-900/20 text-green-400 border border-green-800 rounded"
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
const { getUserItemCollection, saveUserTaskObjectives, getUserTaskObjectives, saveCompletedTask, getCompletedTasks, reduceItemsForTask } = useFirestore()
const { showNonKappaTasks } = useSettings()

const selectedTrader = ref(null)
const userItems = ref({})
const completedObjectives = ref({})
const hoveredObjective = ref({})
const completedTasks = ref({})
const completingTask = ref(null)

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

const loadUserTaskObjectives = async () => {
  if (!user.value) return
  
  try {
    const objectives = await getUserTaskObjectives(user.value.uid)
    completedObjectives.value = objectives || {}
  } catch (error) {
    console.error('Failed to load task objectives:', error)
  }
}

const loadCompletedTasks = async () => {
  if (!user.value) return
  
  try {
    const tasks = await getCompletedTasks(user.value.uid)
    completedTasks.value = tasks || {}
  } catch (error) {
    console.error('Failed to load completed tasks:', error)
  }
}

const isObjectiveCompleted = (taskId, objectiveIndex) => {
  return completedObjectives.value[`${taskId}_${objectiveIndex}`] === true
}

const toggleObjective = async (taskId, objectiveIndex) => {
  if (!user.value) return
  
  const key = `${taskId}_${objectiveIndex}`
  const newValue = !completedObjectives.value[key]
  
  completedObjectives.value[key] = newValue
  
  try {
    await saveUserTaskObjectives(user.value.uid, key, newValue)
  } catch (error) {
    console.error('Failed to save objective status:', error)
    completedObjectives.value[key] = !newValue
  }
}

const isTaskCompleted = (taskId) => {
  return completedTasks.value[taskId] === true
}

const canCompleteTask = (task) => {
  // Check if already completed
  if (isTaskCompleted(task.id)) return false
  
  // Check if all objectives are completed
  if (task.objectives && task.objectives.length > 0) {
    const allObjectivesCompleted = task.objectives.every((_, index) => 
      isObjectiveCompleted(task.id, index)
    )
    if (!allObjectivesCompleted) return false
  }
  
  // Check if user has all required items
  if (task.requirements && task.requirements.length > 0) {
    const hasAllItems = task.requirements.every(req => {
      const userCount = getUserItemCount(req.itemId, req.foundInRaid)
      return userCount >= req.quantity
    })
    if (!hasAllItems) return false
  }
  
  return true
}

const completeTask = async (task) => {
  if (!user.value || !canCompleteTask(task)) return
  
  completingTask.value = task.id
  
  try {
    // First, reduce the items from inventory
    if (task.requirements && task.requirements.length > 0) {
      await reduceItemsForTask(user.value.uid, task.requirements)
    }
    
    // Then mark the task as completed
    await saveCompletedTask(user.value.uid, task.id, true)
    completedTasks.value[task.id] = true
    
    // Reload user items to reflect the changes
    await loadUserItems()
  } catch (error) {
    console.error('Failed to complete task:', error)
    // Reload data in case of partial completion
    await loadUserItems()
    await loadCompletedTasks()
  } finally {
    completingTask.value = null
  }
}

watch(user, (newUser) => {
  if (newUser) {
    loadUserItems()
    loadUserTaskObjectives()
    loadCompletedTasks()
  } else {
    userItems.value = {}
    completedObjectives.value = {}
    completedTasks.value = {}
  }
}, { immediate: true })

useHead({
  title: 'Tasks - EFT Tracker'
})
</script>