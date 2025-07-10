import { tasks } from '~/data/tasks'
import { hideoutStations } from '~/data/hideout'

export const useUserStatistics = () => {
  const { currentUserId } = useCurrentUser()
  const { getUserItemCollection, getUserHideoutProgress, getCompletedTasks } = useFirestore()
  const { getUserTaskStatuses } = useTaskCompletion()
  
  const statistics = ref({
    totalItems: 0,
    totalFIRItems: 0,
    completedTasks: 0,
    totalTasks: 0,
    averageHideoutLevel: 0,
    maxHideoutLevel: 0,
    loading: true
  })

  const calculateStatistics = async () => {
    if (!currentUserId.value) {
      statistics.value.loading = false
      return
    }

    try {
      statistics.value.loading = true

      // Get user items
      const userItems = await getUserItemCollection(currentUserId.value)
      let totalItems = 0
      let totalFIRItems = 0
      
      userItems.forEach(item => {
        totalItems += item.quantity || 0
        totalFIRItems += item.foundInRaid || 0
      })

      // Get completed tasks
      const taskStatuses = await getUserTaskStatuses()
      const completedTasksCount = Object.values(taskStatuses).filter(
        (status: any) => status.status === 'completed'
      ).length
      
      // Get total tasks count
      const totalTasksCount = tasks.length

      // Get hideout progress
      const hideoutProgress = await getUserHideoutProgress(currentUserId.value)
      
      // Calculate average hideout level
      let totalLevels = 0
      let stationCount = 0
      let maxLevel = 0
      
      hideoutStations.forEach(station => {
        const currentLevel = hideoutProgress[station.id] || 0
        totalLevels += currentLevel
        stationCount++
        maxLevel = Math.max(maxLevel, currentLevel)
      })
      
      const averageLevel = stationCount > 0 ? Math.round(totalLevels / stationCount * 10) / 10 : 0

      // Update statistics
      statistics.value = {
        totalItems,
        totalFIRItems,
        completedTasks: completedTasksCount,
        totalTasks: totalTasksCount,
        averageHideoutLevel: averageLevel,
        maxHideoutLevel: maxLevel,
        loading: false
      }
    } catch (error) {
      console.error('Error calculating statistics:', error)
      statistics.value.loading = false
    }
  }

  // Watch for user changes and recalculate
  watch(currentUserId, (newUserId) => {
    if (newUserId) {
      calculateStatistics()
    } else {
      // Reset statistics when no user
      statistics.value = {
        totalItems: 0,
        totalFIRItems: 0,
        completedTasks: 0,
        totalTasks: tasks.length,
        averageHideoutLevel: 0,
        maxHideoutLevel: 0,
        loading: false
      }
    }
  }, { immediate: true })

  // Function to refresh statistics
  const refreshStatistics = () => {
    calculateStatistics()
  }

  return {
    statistics: readonly(statistics),
    refreshStatistics
  }
}