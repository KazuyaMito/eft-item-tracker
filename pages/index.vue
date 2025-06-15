<template>
  <div class="space-y-8">
    <div v-if="!user && !loading" class="text-center py-16">
      <h2 class="text-3xl font-bold text-gray-900 mb-4">
        Welcome to EFT Item Tracker
      </h2>
      <p class="text-xl text-gray-600 mb-8">
        Track your Escape from Tarkov item collection for tasks and hideout upgrades
      </p>
      <button @click="signInWithGoogle" class="btn btn-primary text-lg px-8 py-3">
        Get Started with Google
      </button>
    </div>

    <div v-else-if="user" class="space-y-6">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          Welcome back, {{ user.displayName }}!
        </h2>
        <p class="text-gray-600">
          Track your item collection progress for tasks and hideout upgrades.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Items Collected</h3>
          <div class="text-3xl font-bold text-green-600">0</div>
          <p class="text-sm text-gray-500">Found in Raid items</p>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Tasks Progress</h3>
          <div class="text-3xl font-bold text-blue-600">0/100</div>
          <p class="text-sm text-gray-500">Completed tasks</p>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Hideout Level</h3>
          <div class="text-3xl font-bold text-purple-600">1</div>
          <p class="text-sm text-gray-500">Average station level</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Next Tasks</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span class="text-sm">No tasks available</span>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Hideout Upgrades</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span class="text-sm">No upgrades available</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-16">
      <div class="text-lg text-gray-500">Loading...</div>
    </div>
  </div>
</template>

<script setup>
const { user, loading, signInWithGoogle } = useAuth()
</script>