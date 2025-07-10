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
          <div class="text-3xl font-bold text-green-600">0</div>
          <p class="text-sm text-dark-text-secondary">Found in Raid items</p>
        </div>
        
        <div class="bg-dark-card rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-dark-text mb-2">Tasks Progress</h3>
          <div class="text-3xl font-bold text-blue-600">0/100</div>
          <p class="text-sm text-dark-text-secondary">Completed tasks</p>
        </div>
        
        <div class="bg-dark-card rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-dark-text mb-2">Hideout Level</h3>
          <div class="text-3xl font-bold text-purple-600">1</div>
          <p class="text-sm text-dark-text-secondary">Average station level</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-dark-card rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-dark-text mb-4">Next Tasks</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-dark-surface rounded">
              <span class="text-sm">No tasks available</span>
            </div>
          </div>
        </div>
        
        <div class="bg-dark-card rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-dark-text mb-4">Hideout Upgrades</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-dark-surface rounded">
              <span class="text-sm">No upgrades available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { user, loading, signInWithGoogle, continueAsGuest, isGuest } = useAuth()

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