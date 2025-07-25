<template>
  <div class="space-y-8">
    <div class="space-y-6">
      <div class="bg-dark-card rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-bold text-dark-text mb-4">
          <span v-if="user">{{ $t('auth.welcome_back', { name: user.displayName }) }}</span>
          <span v-else>{{ $t('auth.welcome') }}</span>
        </h2>
        <p class="text-dark-text-secondary">
          {{ $t('home.track_description') }}
          <span v-if="!user" class="text-yellow-500">
            {{ $t('auth.local_storage_note') }}
          </span>
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-dark-card rounded-lg shadow-md p-6 min-h-[140px] flex flex-col justify-between">
          <h3 class="text-lg font-semibold text-dark-text mb-2">{{ $t('home.items_collected') }}</h3>
          <div v-if="statistics.loading" class="text-3xl font-bold text-green-600">
            <div class="animate-pulse bg-green-600 h-9 w-16 rounded"></div>
          </div>
          <div v-else class="text-3xl font-bold text-green-600">
            {{ statistics.totalFIRItems }}
          </div>
          <p class="text-sm text-dark-text-secondary">{{ $t('home.found_in_raid') }}</p>
          <div v-if="!statistics.loading" class="text-xs text-dark-text-secondary mt-1">
            {{ $t('home.total') }}: {{ statistics.totalItems }}
          </div>
        </div>
        
        <div class="bg-dark-card rounded-lg shadow-md p-6 min-h-[140px] flex flex-col justify-between">
          <h3 class="text-lg font-semibold text-dark-text mb-2">{{ $t('home.tasks_progress') }}</h3>
          <div v-if="statistics.loading" class="text-3xl font-bold text-blue-600">
            <div class="animate-pulse bg-blue-600 h-9 w-20 rounded"></div>
          </div>
          <div v-else class="text-3xl font-bold text-blue-600">
            {{ statistics.completedTasks }}/{{ statistics.totalTasks }}
          </div>
          <p class="text-sm text-dark-text-secondary">{{ $t('home.completed_tasks') }}</p>
          <div v-if="!statistics.loading" class="text-xs text-dark-text-secondary mt-1">
            {{ Math.round((statistics.completedTasks / statistics.totalTasks) * 100) }}% {{ $t('home.complete') }}
          </div>
        </div>
        
        <div class="bg-dark-card rounded-lg shadow-md p-6 min-h-[140px] flex flex-col justify-between">
          <h3 class="text-lg font-semibold text-dark-text mb-2">{{ $t('home.hideout_level') }}</h3>
          <div v-if="statistics.loading" class="text-3xl font-bold text-purple-600">
            <div class="animate-pulse bg-purple-600 h-9 w-12 rounded"></div>
          </div>
          <div v-else class="text-3xl font-bold text-purple-600">
            {{ statistics.averageHideoutLevel }}
          </div>
          <p class="text-sm text-dark-text-secondary">{{ $t('home.average_station_level') }}</p>
          <div v-if="!statistics.loading" class="text-xs text-dark-text-secondary mt-1">
            {{ $t('home.max') }}: {{ statistics.maxHideoutLevel }}
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-dark-card rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-dark-text mb-4">{{ $t('home.next_tasks') }}</h3>
          <div v-if="statistics.loading" class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-dark-surface rounded animate-pulse">
              <span class="text-sm">{{ $t('home.loading') }}</span>
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
                <div class="text-xs text-dark-text-secondary">{{ task.trader }}</div>
              </div>
              <div class="text-xs text-dark-text-secondary">
                {{ $t('home.level') }} {{ task.level }}
              </div>
            </div>
          </div>
          <div v-else class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-dark-surface rounded">
              <span class="text-sm">{{ $t('home.no_available_tasks') }}</span>
            </div>
          </div>
        </div>
        
        <div class="bg-dark-card rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-dark-text mb-4">{{ $t('home.hideout_upgrades') }}</h3>
          <div v-if="statistics.loading" class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-dark-surface rounded animate-pulse">
              <span class="text-sm">{{ $t('home.loading') }}</span>
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
                <div class="text-xs text-dark-text-secondary">{{ $t('home.level') }} {{ upgrade.level }}</div>
              </div>
              <div class="text-xs text-dark-text-secondary">
                {{ upgrade.itemCount }} {{ $t('home.items') }}
              </div>
            </div>
          </div>
          <div v-else class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-dark-surface rounded">
              <span class="text-sm">{{ $t('home.no_available_upgrades') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { eftTasks } from '~/data/tasks'
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
  
  return eftTasks
    .filter(task => {
      // Filter by player level
      if (task.level > playerLevel.value) return false
      // You could add more filtering logic here based on task completion status
      return true
    })
    .sort((a, b) => a.level - b.level)
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