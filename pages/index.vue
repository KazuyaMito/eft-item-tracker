<template>
  <div class="space-y-8">
    <div v-if="!user && !loading && !isGuest" class="text-center py-16">
      <h2 class="text-3xl font-bold text-dark-text mb-4">
        Welcome to EFT Item Tracker
      </h2>
      <p class="text-xl text-dark-text-secondary mb-8">
        Track your Escape from Tarkov item collection for tasks and hideout upgrades
      </p>
      <div class="space-y-4">
        <button @click="signInWithGoogle" class="btn btn-primary text-lg px-8 py-3 block mx-auto">
          Sign in with Google
        </button>
        <button @click="continueAsGuest" class="btn btn-secondary text-lg px-8 py-3 block mx-auto">
          Continue as Guest
        </button>
        <p class="text-sm text-dark-text-secondary max-w-md mx-auto">
          Guest mode allows you to use all features locally. Your data won't be saved to the cloud.
        </p>
      </div>
    </div>

    <div v-else-if="user || isGuest" class="space-y-6">
      <div class="bg-dark-card rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-bold text-dark-text mb-4">
          <span v-if="user">Welcome back, {{ user.displayName }}!</span>
          <span v-else>Welcome to EFT Item Tracker!</span>
        </h2>
        <p class="text-dark-text-secondary">
          Track your item collection progress for tasks and hideout upgrades.
          <span v-if="isGuest" class="text-yellow-500">
            (Guest mode - data stored locally)
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

    <div v-else class="text-center py-16">
      <div class="text-lg text-dark-text-secondary">Loading...</div>
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