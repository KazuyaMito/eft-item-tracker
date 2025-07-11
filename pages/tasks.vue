<template>
  <div class="space-y-6">
    <TaskFilters
      :selected-category="selectedCategory"
      :selected-trader="selectedTrader"
      :selected-filter="selectedFilter"
      :show-tasks-above-level="showTasksAboveLevel"
      :player-level="playerLevel"
      :traders="traders"
      :get-trader-image="getTraderImage"
      @category-change="handleCategoryChange"
      @trader-select="selectedTrader = $event"
      @filter-change="selectedFilter = $event"
      @toggle-tasks-above-level="showTasksAboveLevel = !showTasksAboveLevel"
    />

    <div class="space-y-4">
      <TaskCard
        v-for="task in filteredTasks"
        :key="task.id"
        :task="task"
        :task-completion-statuses="taskCompletionStatuses"
        :completed-objectives="completedObjectives"
        :hovered-objective="hoveredObjective"
        :completing-task="completingTask"
        :uncompleting-task="uncompletingTask"
        :player-level="playerLevel"
        :is-mobile="isMobile"
        :is-task-completed="isTaskCompleted"
        :can-complete-task="canCompleteTask"
        :get-task-name="getTaskName"
        :get-item-name="getItemName"
        :get-progress-class="getProgressClass"
        :get-progress-percentage="getProgressPercentage"
        :get-user-item-count="getUserItemCount"
        @complete="completeTask"
        @uncomplete="uncompleteTask"
        @toggle-objective="toggleObjective"
      />
    </div>
  </div>
</template>

<script setup>
import { doc, getDoc } from 'firebase/firestore'
import { eftTasks, getTasksByTrader } from '~/data/tasks'
import { getItemById } from '~/data/items'
import { 
  filterTasks, 
  isTaskAvailable as checkTaskAvailable, 
  calculateItemProgress, 
  canCompleteTask as checkCanCompleteTask,
  sortTraders 
} from '~/utils/taskPageLogic'

const { user, signInWithGoogle } = useAuth()
const { currentUserId, isLoggedIn } = useCurrentUser()
const { getUserItemCollection, updateUserItemCollection, saveUserTaskObjectives, getUserTaskObjectives, saveCompletedTask, getCompletedTasks, reduceItemsForTask } = useFirestore()
const { showNonKappaTasks } = useSettings()
const { getTraders } = useTarkovAPI()
const { playerLevel } = usePlayerLevel()
const { $firebase } = useNuxtApp()
const { taskCompletionStatuses, completeTask: completeTaskWithParallel, uncompleteTask: uncompleteTaskWithParallel, getTaskStatusInfo } = useTaskCompletion()
const { isMobile } = useBreakpoint()

const selectedTrader = ref(null)
const userItems = ref({})
const completedObjectives = ref({})
const hoveredObjective = ref({})
const completedTasks = ref({})
const completingTask = ref(null)
const uncompletingTask = ref(null)
const selectedFilter = ref('available') // 'all', 'available', 'locked', 'completed'
const selectedCategory = ref('all') // 'all', 'traders'
const traderScroll = ref(null)
const traderData = ref([])
const showTasksAboveLevel = ref(false)

const traders = computed(() => {
  const traderList = [...new Set(eftTasks.map(task => task.trader))]
  return sortTraders(traderList)
})

const filteredTasks = computed(() => {
  const filters = {
    selectedCategory: selectedCategory.value,
    selectedTrader: selectedTrader.value,
    selectedFilter: selectedFilter.value,
    showNonKappaTasks: showNonKappaTasks.value,
    showTasksAboveLevel: showTasksAboveLevel.value,
    playerLevel: playerLevel.value
  }
  
  return filterTasks(eftTasks, filters, taskCompletionStatuses.value)
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
  const progress = calculateItemProgress(
    { itemId, quantity: 1, foundInRaid },
    userItems.value
  )
  return progress.current
}

const getProgressClass = (requirement) => {
  const progress = calculateItemProgress(requirement, userItems.value)
  return progress.progressClass
}

const getProgressPercentage = (requirement) => {
  const progress = calculateItemProgress(requirement, userItems.value)
  return progress.percentage
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
  return checkTaskAvailable(task, taskCompletionStatuses.value)
}

const canCompleteTask = (task) => {
  return checkCanCompleteTask(task, taskCompletionStatuses.value)
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

const handleCategoryChange = (category) => {
  selectedCategory.value = category
  if (category === 'all') {
    selectedTrader.value = null
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
    
    // Reduce required items from user's collection
    if (task.requirements && task.requirements.length > 0) {
      await reduceItemsForTask(user.value.uid, task.requirements)
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
    // Restore the items that were reduced when completing the task
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
        
        // Restore the required quantity to the user's collection
        const newQuantity = currentQuantity + requirement.quantity
        const newFIR = requirement.foundInRaid ? currentFIR + requirement.quantity : currentFIR
        
        await updateUserItemCollection(user.value.uid, requirement.itemId, {
          quantity: newQuantity,
          foundInRaid: newFIR
        })
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

// SEO Meta tags
useSeoMeta({
  title: 'EFT Tasks & Quest Tracker - Escape from Tarkov Quest Progress',
  description: 'Complete quest tracker for Escape from Tarkov. Track trader tasks, monitor objectives, manage quest items, and view task prerequisites. Filter by trader, availability, and completion status.',
  ogTitle: 'EFT Tasks & Quest Tracker - Complete Your Tarkov Quests',
  ogDescription: 'Track all Escape from Tarkov quests and tasks. Monitor objectives, manage required items, and track your progress with all traders including Prapor, Therapist, Skier, and more.',
  keywords: 'EFT tasks, Escape from Tarkov quests, Tarkov quest tracker, trader tasks, Prapor tasks, Therapist quests, Skier tasks, Peacekeeper quests, Mechanic tasks, Ragman quests, Jaeger tasks, quest objectives'
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