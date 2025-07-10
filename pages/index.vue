<template>
  <div class="space-y-8">
    <div class="space-y-6">
      <div class="bg-dark-card rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-bold text-dark-text mb-4">
          <span v-if="user">Welcome back, {{ user.displayName }}!</span>
          <span v-else>Welcome to EFT Item Tracker!</span>
        </h2>
        <p class="text-dark-text-secondary">
          Track your item collection progress for tasks and hideout upgrades.
          <span v-if="!user" class="text-yellow-500">
            (Data stored locally - Sign in to sync across devices)
          </span>
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-dark-card rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-dark-text mb-2">Items Collected</h3>
          <div v-if="statistics.loading" class="text-3xl font-bold text-green-600">
            <div class="animate-pulse">...</div>
          </div>
          <div v-else class="text-3xl font-bold text-green-600">
            {{ statistics.totalFIRItems }}
          </div>
          <p class="text-sm text-dark-text-secondary">Found in Raid items</p>
          <div v-if="!statistics.loading" class="text-xs text-dark-text-secondary mt-1">
            Total: {{ statistics.totalItems }}
          </div>
        </div>
        
        <div class="bg-dark-card rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-dark-text mb-2">Tasks Progress</h3>
          <div v-if="statistics.loading" class="text-3xl font-bold text-blue-600">
            <div class="animate-pulse">...</div>
          </div>
          <div v-else class="text-3xl font-bold text-blue-600">
            {{ statistics.completedTasks }}/{{ statistics.totalTasks }}
          </div>
          <p class="text-sm text-dark-text-secondary">Completed tasks</p>
          <div v-if="!statistics.loading" class="text-xs text-dark-text-secondary mt-1">
            {{ Math.round((statistics.completedTasks / statistics.totalTasks) * 100) }}% complete
          </div>
        </div>
        
        <div class="bg-dark-card rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-dark-text mb-2">Hideout Level</h3>
          <div v-if="statistics.loading" class="text-3xl font-bold text-purple-600">
            <div class="animate-pulse">...</div>
          </div>
          <div v-else class="text-3xl font-bold text-purple-600">
            {{ statistics.averageHideoutLevel }}
          </div>
          <p class="text-sm text-dark-text-secondary">Average station level</p>
          <div v-if="!statistics.loading" class="text-xs text-dark-text-secondary mt-1">
            Max: {{ statistics.maxHideoutLevel }}
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-dark-card rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-dark-text mb-4">Next Tasks</h3>
          <div v-if="statistics.loading" class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-dark-surface rounded animate-pulse">
              <span class="text-sm">Loading...</span>
            </div>
          </div>
          <div v-else-if="nextTasks.length > 0" class="space-y-3">
            <div 
              v-for="task in nextTasks.slice(0, 3)" 
              :key="task.id"
              class="flex items-center justify-between p-3 bg-dark-surface rounded"
            >
              <div class="flex-1">
                <span class="text-sm font-medium text-dark-text">{{ task.name }}</span>
                <div class="text-xs text-dark-text-secondary">{{ task.traderName }}</div>
              </div>
              <div class="text-xs text-dark-text-secondary">
                Level {{ task.minLevel }}
              </div>
            </div>
          </div>
          <div v-else class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-dark-surface rounded">
              <span class="text-sm">No available tasks</span>
            </div>
          </div>
        </div>
        
        <div class="bg-dark-card rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-dark-text mb-4">Hideout Upgrades</h3>
          <div v-if="statistics.loading" class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-dark-surface rounded animate-pulse">
              <span class="text-sm">Loading...</span>
            </div>
          </div>
          <div v-else-if="nextUpgrades.length > 0" class="space-y-3">
            <div 
              v-for="upgrade in nextUpgrades.slice(0, 3)" 
              :key="`${upgrade.stationId}_${upgrade.level}`"
              class="flex items-center justify-between p-3 bg-dark-surface rounded"
            >
              <div class="flex-1">
                <span class="text-sm font-medium text-dark-text">{{ upgrade.stationName }}</span>
                <div class="text-xs text-dark-text-secondary">Level {{ upgrade.level }}</div>
              </div>
              <div class="text-xs text-dark-text-secondary">
                {{ upgrade.itemCount }} items
              </div>
            </div>
          </div>
          <div v-else class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-dark-surface rounded">
              <span class="text-sm">No available upgrades</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { tasks } from '~/data/tasks'
import { hideoutStations } from '~/data/hideout'

const { user, loading, signInWithGoogle, continueAsGuest, isGuest } = useAuth()
const { statistics } = useUserStatistics()
const { getUserTaskStatuses } = useTaskCompletion()
const { getUserHideoutProgress } = useFirestore()
const { playerLevel } = usePlayerLevel()
const { currentUserId } = useCurrentUser()

// Calculate next available tasks
const nextTasks = computed(() => {
  if (statistics.value.loading || !currentUserId.value) return []
  
  return tasks
    .filter(task => {
      // Filter by player level
      if (task.minLevel > playerLevel.value) return false
      // You could add more filtering logic here based on task completion status
      return true
    })
    .sort((a, b) => a.minLevel - b.minLevel)
    .slice(0, 5)
})

// Calculate next available hideout upgrades
const nextUpgrades = computed(() => {
  if (statistics.value.loading || !currentUserId.value) return []
  
  const upgrades = []
  hideoutStations.forEach(station => {
    station.levels.forEach(level => {
      // Simple logic - you could enhance this with current progress checking
      if (level.level <= 3) { // Show only first few levels as examples
        upgrades.push({
          stationId: station.id,
          stationName: station.name,
          level: level.level,
          itemCount: level.itemRequirements?.length || 0
        })
      }
    })
  })
  
  return upgrades
    .sort((a, b) => a.level - b.level)
    .slice(0, 5)
})

// SEO Meta tags
useSeoMeta({
  title: 'EFT Item Tracker - Track Your Escape from Tarkov Progress',
  description: 'Track your Escape from Tarkov item collection, task completion, and hideout upgrades. Manage Found in Raid items, complete quests, and monitor your progress with our free EFT tracker tool.',
  ogTitle: 'EFT Item Tracker - Track Your Escape from Tarkov Progress',
  ogDescription: 'Track your Escape from Tarkov item collection, task completion, and hideout upgrades. Free tool for managing FIR items and quest progress.',
  ogImage: '/og-image.png',
  twitterCard: 'summary_large_image'
})
</script>