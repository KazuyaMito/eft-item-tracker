<template>
  <div class="space-y-6">
    <div class="bg-dark-card rounded-lg shadow-md p-6">
      <h1 class="text-2xl font-bold text-dark-text mb-4">Tasks</h1>
      <p class="text-dark-text-secondary mb-6">
        Track your progress on trader tasks and see required items.
      </p>
      
      <!-- Category filters and trader selection -->
      <div class="flex gap-2 mb-4">
        <!-- ALL/TRADERS buttons section -->
        <div class="bg-dark-surface rounded-lg p-2 flex gap-2 flex-shrink-0">
          <button
            @click="selectedCategory = 'all'; selectedTrader = null"
            :class="[
              'flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors',
              selectedCategory === 'all'
                ? 'bg-dark-hover text-white'
                : 'text-dark-text-secondary hover:text-white'
            ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            ALL
          </button>
          <button
            @click="selectedCategory = 'traders'"
            :class="[
              'flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors',
              selectedCategory === 'traders'
                ? 'bg-dark-hover text-white'
                : 'text-dark-text-secondary hover:text-white'
            ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            TRADERS
          </button>
        </div>
        
        <!-- Trader selection area (separate background) -->
        <div class="flex-1 bg-dark-hover rounded-lg p-2 min-w-0 flex items-center justify-center">
          <div v-if="selectedCategory === 'all'" class="text-center">
            <p class="text-sm text-dark-text-secondary uppercase tracking-wider">Showing All Sources</p>
          </div>
          
          <div v-else-if="selectedCategory === 'traders'" class="w-full flex items-center gap-1 min-w-0">
            <button
              class="text-dark-text-secondary hover:text-white p-1 flex-shrink-0 transition-colors"
              @click="scrollTraders('left')"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div ref="traderScroll" class="flex gap-2 flex-nowrap overflow-x-hidden scrollbar-hide flex-1 scroll-smooth min-w-0">
              <button
                v-for="trader in traders"
                :key="trader"
                @click="selectedTrader = selectedTrader === trader ? null : trader"
                :class="[
                  'flex items-center gap-2 px-3 py-1 rounded text-xs font-medium transition-colors flex-shrink-0',
                  selectedTrader === trader
                    ? 'bg-blue-600 text-white'
                    : 'bg-dark-surface text-dark-text-secondary hover:bg-dark-surface'
                ]"
              >
                <div class="w-6 h-6 bg-dark-card rounded-full flex items-center justify-center overflow-hidden">
                  <img 
                    v-if="getTraderImage(trader)"
                    :src="getTraderImage(trader)"
                    :alt="trader"
                    class="w-full h-full object-cover"
                    @error="$event.target.style.display='none'"
                  />
                  <span v-else class="text-[10px] font-bold">{{ trader.substring(0, 2).toUpperCase() }}</span>
                </div>
                <span class="uppercase">{{ trader }}</span>
              </button>
            </div>
            
            <button
              class="text-dark-text-secondary hover:text-white p-1 flex-shrink-0 transition-colors"
              @click="scrollTraders('right')"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Status filters -->
      <div class="flex gap-2 mb-4">
        <button
          @click="selectedFilter = 'available'"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded bg-dark-surface text-sm font-medium transition-colors',
            selectedFilter === 'available'
              ? 'text-white ring-2 ring-blue-500'
              : 'text-dark-text-secondary hover:text-white'
          ]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          AVAILABLE
        </button>
        <button
          @click="selectedFilter = 'locked'"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded bg-dark-surface text-sm font-medium transition-colors',
            selectedFilter === 'locked'
              ? 'text-white ring-2 ring-blue-500'
              : 'text-dark-text-secondary hover:text-white'
          ]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          LOCKED
        </button>
        <button
          @click="selectedFilter = 'completed'"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded bg-dark-surface text-sm font-medium transition-colors',
            selectedFilter === 'completed'
              ? 'text-white ring-2 ring-blue-500'
              : 'text-dark-text-secondary hover:text-white'
          ]"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
          COMPLETED
        </button>
        
        <div class="flex-1"></div>
        
        <button
          @click="showTasksAboveLevel = !showTasksAboveLevel"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded bg-dark-surface text-sm font-medium transition-colors',
            showTasksAboveLevel
              ? 'text-white ring-2 ring-blue-500'
              : 'text-dark-text-secondary hover:text-white'
          ]"
          :title="showTasksAboveLevel ? 'Hide tasks above your level' : 'Show tasks above your level'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
          {{ showTasksAboveLevel ? 'HIDE' : 'SHOW' }} LVL {{ playerLevel }}+
        </button>
        
        <button
          @click="selectedFilter = 'all'"
          :class="[
            'px-4 py-2 rounded bg-dark-surface text-sm font-medium transition-colors',
            selectedFilter === 'all'
              ? 'text-white ring-2 ring-blue-500'
              : 'text-dark-text-secondary hover:text-white'
          ]"
        >
          ALL
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
          <div class="flex-1">
            <div class="flex items-start gap-2">
              <h3 class="text-lg font-semibold text-dark-text">{{ task.name }}</h3>
              <div v-if="task.parallelTaskIds && task.parallelTaskIds.length > 0" class="flex items-center gap-1">
                <div class="group relative">
                  <svg class="w-5 h-5 text-blue-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-dark-surface border border-dark-border rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    <p class="text-sm text-dark-text">Alternative tasks available</p>
                    <div class="text-xs text-dark-text-secondary mt-1">
                      Complete one, others will fail
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p class="text-sm text-dark-text-secondary">
              {{ task.trader }} - 
              <span :class="task.level > playerLevel ? 'text-red-500 font-semibold' : ''">
                Level {{ task.level }}
              </span>
            </p>
            <p class="text-dark-text-secondary mt-2">{{ task.description }}</p>
            <div class="mt-2 flex items-center gap-2">
              <span 
                v-if="taskCompletionStatuses[task.id]?.status === 'completed'"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-900/20 text-green-400 border border-green-800"
              >
                Completed
              </span>
              <span 
                v-else-if="taskCompletionStatuses[task.id]?.status === 'failed'"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-900/20 text-red-400 border border-red-800"
              >
                Failed (Alternative Completed)
              </span>
              <span 
                v-else
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-900/20 text-yellow-400 border border-yellow-800"
              >
                In Progress
              </span>
              
              <!-- Show related parallel tasks -->
              <div v-if="task.parallelTaskIds && task.parallelTaskIds.length > 0 && taskCompletionStatuses[task.id]?.status !== 'completed'" class="flex items-center gap-1 text-xs text-dark-text-secondary">
                <span>Alternatives:</span>
                <span v-for="(parallelId, idx) in task.parallelTaskIds" :key="parallelId" class="flex items-center">
                  <span v-if="idx > 0" class="mx-1">|</span>
                  <span 
                    :class="{
                      'text-green-400': taskCompletionStatuses[parallelId]?.status === 'completed',
                      'text-red-400': taskCompletionStatuses[parallelId]?.status === 'failed'
                    }">
                    {{ getTaskName(parallelId) }}
                  </span>
                </span>
              </div>
            </div>
          </div>
          <div class="ml-4">
            <button
              v-if="!isTaskCompleted(task.id)"
              @click="completeTask(task)"
              :disabled="completingTask === task.id || !canCompleteTask(task)"
              class="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ completingTask === task.id ? 'Completing...' : 'Complete' }}
            </button>
            <button
              v-else
              @click="uncompleteTask(task)"
              :disabled="uncompletingTask === task.id"
              class="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ uncompletingTask === task.id ? 'Uncompleting...' : 'Uncomplete' }}
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
import { doc, getDoc } from 'firebase/firestore'
import { eftTasks, getTasksByTrader } from '~/data/tasks'
import { getItemById } from '~/data/items'

const { user, signInWithGoogle } = useAuth()
const { getUserItemCollection, updateUserItemCollection, saveUserTaskObjectives, getUserTaskObjectives, saveCompletedTask, getCompletedTasks, reduceItemsForTask } = useFirestore()
const { showNonKappaTasks } = useSettings()
const { getTraders } = useTarkovAPI()
const { playerLevel } = usePlayerLevel()
const { $firebase } = useNuxtApp()
const { taskCompletionStatuses, completeTask: completeTaskWithParallel, uncompleteTask: uncompleteTaskWithParallel, getTaskStatusInfo } = useTaskCompletion()

const selectedTrader = ref(null)
const userItems = ref({})
const completedObjectives = ref({})
const hoveredObjective = ref({})
const completedTasks = ref({})
const completingTask = ref(null)
const uncompletingTask = ref(null)
const selectedFilter = ref('all') // 'all', 'available', 'locked', 'completed'
const selectedCategory = ref('all') // 'all', 'traders'
const traderScroll = ref(null)
const traderData = ref([])
const showTasksAboveLevel = ref(false)

const traders = computed(() => {
  const traderOrder = ['prapor', 'therapist', 'fence', 'skier', 'peacekeeper', 'mechanic', 'ragman', 'jaeger', 'ref', 'btrdriver', 'lightkeeper']
  const traderList = [...new Set(eftTasks.map(task => task.trader))]
  
  // Sort traders according to the specified order
  return traderList.sort((a, b) => {
    const aIndex = traderOrder.findIndex(t => t.toLowerCase() === a.toLowerCase())
    const bIndex = traderOrder.findIndex(t => t.toLowerCase() === b.toLowerCase())
    
    // If both are in the order array, sort by their position
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex
    }
    // If only one is in the order array, it comes first
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    // If neither is in the order array, sort alphabetically
    return a.localeCompare(b)
  })
})

const filteredTasks = computed(() => {
  let tasks = eftTasks
  
  // Apply category filter
  if (selectedCategory.value === 'traders' && selectedTrader.value) {
    tasks = getTasksByTrader(selectedTrader.value)
  }
  
  // Apply non-Kappa filter if setting is disabled
  if (!showNonKappaTasks.value) {
    tasks = tasks.filter(task => task.kappaRequired === true)
  }
  
  // Filter by player level if showTasksAboveLevel is false
  if (!showTasksAboveLevel.value) {
    tasks = tasks.filter(task => {
      return task.level <= playerLevel.value
    })
  }
  
  // Filter out tasks with incomplete prerequisites
  tasks = tasks.filter(task => {
    // If task has prerequisites, check if they are all completed
    if (task.prerequisites && task.prerequisites.length > 0) {
      const allPrerequisitesCompleted = task.prerequisites.every(prereqId => isTaskCompleted(prereqId))
      if (!allPrerequisitesCompleted) {
        return false
      }
    }
    return true
  })
  
  // Apply status filter
  if (selectedFilter.value !== 'all') {
    tasks = tasks.filter(task => {
      const completed = isTaskCompleted(task.id)
      const available = isTaskAvailable(task)
      
      switch (selectedFilter.value) {
        case 'completed':
          return completed
        case 'available':
          return !completed && available
        case 'locked':
          return !completed && !available
        default:
          return true
      }
    })
  }
  
  return tasks
})

const getItemName = (itemId) => {
  const item = getItemById(itemId)
  return item ? item.name : itemId
}

const getTaskName = (taskId) => {
  const task = eftTasks.find(t => t.id === taskId)
  return task ? task.name : taskId
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
  return taskCompletionStatuses.value[taskId]?.status === 'completed'
}

const isTaskAvailable = (task) => {
  // If task has no prerequisites, it's available
  if (!task.prerequisites || task.prerequisites.length === 0) {
    return true
  }
  
  // Check if all prerequisite tasks are completed
  return task.prerequisites.every(prereqId => isTaskCompleted(prereqId))
}

const canCompleteTask = (task) => {
  // Check if already completed or failed
  const status = taskCompletionStatuses.value[task.id]?.status
  if (status === 'completed' || status === 'failed') return false
  
  return true
}

const getTraderImage = (traderName) => {
  const trader = traderData.value.find(t => 
    t.name.toLowerCase() === traderName.toLowerCase() ||
    t.normalizedName === traderName.toLowerCase()
  )
  return trader?.imageLink || trader?.image4xLink
}

const loadTraderData = async () => {
  try {
    const traders = await getTraders()
    traderData.value = traders
  } catch (error) {
    console.error('Failed to load trader data:', error)
  }
}

const scrollTraders = (direction) => {
  const container = traderScroll.value
  if (!container) return
  
  const scrollAmount = 200
  if (direction === 'left') {
    container.scrollLeft -= scrollAmount
  } else {
    container.scrollLeft += scrollAmount
  }
}

const completeTask = async (task) => {
  if (!user.value || !canCompleteTask(task)) return
  
  completingTask.value = task.id
  
  try {
    // First, mark all objectives as completed
    if (task.objectives && task.objectives.length > 0) {
      for (let i = 0; i < task.objectives.length; i++) {
        const key = `${task.id}_${i}`
        completedObjectives.value[key] = true
        await saveUserTaskObjectives(user.value.uid, key, true)
      }
    }
    
    // Add required items to user's collection
    if (task.requirements && task.requirements.length > 0) {
      for (const requirement of task.requirements) {
        const itemRef = doc($firebase.db, 'userItems', `${user.value.uid}_${requirement.itemId}`)
        const itemDoc = await getDoc(itemRef)
        
        let currentQuantity = 0
        let currentFIR = 0
        
        if (itemDoc.exists()) {
          const data = itemDoc.data()
          currentQuantity = data.quantity || 0
          currentFIR = data.foundInRaid || 0
        }
        
        // Add the required quantity to the user's collection
        const newQuantity = currentQuantity + requirement.quantity
        const newFIR = requirement.foundInRaid ? currentFIR + requirement.quantity : currentFIR
        
        await updateUserItemCollection(user.value.uid, requirement.itemId, {
          quantity: newQuantity,
          foundInRaid: newFIR
        })
      }
    }
    
    // Use the new composable to complete task (handles parallel tasks)
    await completeTaskWithParallel(task)
    
    // Also save to legacy system for backward compatibility
    await saveCompletedTask(user.value.uid, task.id, true)
    completedTasks.value[task.id] = true
    
    // Reload user items to reflect the changes
    await loadUserItems()
  } catch (error) {
    console.error('Failed to complete task:', error)
    // Reload data in case of partial completion
    await loadUserItems()
    await loadUserTaskObjectives()
    await loadCompletedTasks()
  } finally {
    completingTask.value = null
  }
}

const uncompleteTask = async (task) => {
  if (!user.value || !isTaskCompleted(task.id)) return
  
  uncompletingTask.value = task.id
  
  try {
    // First, remove the items that were added when completing the task
    if (task.requirements && task.requirements.length > 0) {
      for (const requirement of task.requirements) {
        const itemRef = doc($firebase.db, 'userItems', `${user.value.uid}_${requirement.itemId}`)
        const itemDoc = await getDoc(itemRef)
        
        if (itemDoc.exists()) {
          const data = itemDoc.data()
          let currentQuantity = data.quantity || 0
          let currentFIR = data.foundInRaid || 0
          
          // Subtract the required quantity from the user's collection
          const newQuantity = Math.max(0, currentQuantity - requirement.quantity)
          let newFIR = currentFIR
          
          if (requirement.foundInRaid) {
            // Remove from FIR count
            newFIR = Math.max(0, currentFIR - requirement.quantity)
          } else {
            // Remove from regular items first, then FIR if needed
            const regularItems = currentQuantity - currentFIR
            if (regularItems >= requirement.quantity) {
              // Can remove all from regular items
              newFIR = currentFIR
            } else {
              // Need to remove some from FIR items
              const fromFIR = requirement.quantity - regularItems
              newFIR = Math.max(0, currentFIR - fromFIR)
            }
          }
          
          await updateUserItemCollection(user.value.uid, requirement.itemId, {
            quantity: newQuantity,
            foundInRaid: newFIR
          })
        }
      }
    }
    
    // Clear all objectives
    if (task.objectives && task.objectives.length > 0) {
      for (let i = 0; i < task.objectives.length; i++) {
        const key = `${task.id}_${i}`
        completedObjectives.value[key] = false
        await saveUserTaskObjectives(user.value.uid, key, false)
      }
    }
    
    // Use the new composable to uncomplete task
    await uncompleteTaskWithParallel(task.id)
    
    // Also save to legacy system for backward compatibility
    await saveCompletedTask(user.value.uid, task.id, false)
    completedTasks.value[task.id] = false
    
    // Reload user items to reflect the changes
    await loadUserItems()
  } catch (error) {
    console.error('Failed to uncomplete task:', error)
    // Reload data in case of partial completion
    await loadUserItems()
    await loadUserTaskObjectives()
    await loadCompletedTasks()
  } finally {
    uncompletingTask.value = null
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

// Load trader data on mount
onMounted(() => {
  loadTraderData()
})

useHead({
  title: 'Tasks - EFT Tracker'
})
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}
</style>