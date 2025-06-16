<template>
  <header class="bg-dark-card shadow-lg border-b border-dark-surface">
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <NuxtLink to="/" class="group">
            <h1 class="text-2xl font-bold text-eft-primary group-hover:text-eft-secondary transition-colors cursor-pointer">
              EFT Item Tracker
            </h1>
          </NuxtLink>
          <nav class="hidden md:flex space-x-6">
            <NuxtLink to="/" class="text-dark-text-secondary hover:text-eft-primary transition-colors">
              Dashboard
            </NuxtLink>
            <NuxtLink to="/items" class="text-dark-text-secondary hover:text-eft-primary transition-colors">
              Items
            </NuxtLink>
            <NuxtLink to="/tasks" class="text-dark-text-secondary hover:text-eft-primary transition-colors">
              Tasks
            </NuxtLink>
            <NuxtLink to="/hideout" class="text-dark-text-secondary hover:text-eft-primary transition-colors">
              Hideout
            </NuxtLink>
          </nav>
        </div>
        
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2 bg-dark-surface rounded-lg px-3 py-2">
            <span class="text-sm text-dark-text-secondary">Level</span>
            <img 
              :src="getLevelBadgeUrl(playerLevel)" 
              :alt="`Level ${playerLevel}`"
              class="w-8 h-8"
              @error="handleBadgeError"
            >
            <button 
              @click="decrementLevel" 
              :disabled="playerLevel <= 1"
              class="text-dark-text-secondary hover:text-eft-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
              </svg>
            </button>
            <input 
              type="number" 
              :value="playerLevel" 
              @input="handleLevelInput"
              min="1"
              max="79"
              class="w-12 text-center bg-transparent text-dark-text font-semibold border-b border-dark-border focus:border-eft-primary outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            >
            <button 
              @click="incrementLevel" 
              :disabled="playerLevel >= 79"
              class="text-dark-text-secondary hover:text-eft-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          
          <div v-if="!loading">
            <div v-if="user" class="flex items-center space-x-4">
              <img :src="user.photoURL" :alt="user.displayName" class="w-8 h-8 rounded-full">
              <span class="text-sm text-dark-text">{{ user.displayName }}</span>
              <button 
                @click="logout" 
                class="btn btn-secondary text-sm"
              >
                Logout
              </button>
            </div>
            <button 
              v-else 
              @click="signInWithGoogle" 
              class="btn btn-primary"
            >
              Sign in with Google
            </button>
          </div>
          <div v-else class="text-sm text-dark-text-secondary">Loading...</div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { user, loading, signInWithGoogle, logout } = useAuth()
const { playerLevel, setPlayerLevel, incrementLevel, decrementLevel, getLevelBadgeUrl } = usePlayerLevel()

const handleLevelInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = parseInt(target.value, 10)
  if (!isNaN(value)) {
    setPlayerLevel(value)
  }
}

const handleBadgeError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"%3E%3Crect width="40" height="40" fill="%23333"%2F%3E%3Ctext x="20" y="25" text-anchor="middle" fill="%23999" font-size="16"%3E%3F%3C%2Ftext%3E%3C%2Fsvg%3E'
}
</script>