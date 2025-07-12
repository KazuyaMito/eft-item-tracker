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
        
        <div class="flex items-center space-x-2 md:space-x-4">
          <div class="flex items-center space-x-1 md:space-x-2 bg-dark-surface rounded-lg px-2 md:px-3 py-1 md:py-2">
            <span class="text-sm text-dark-text-secondary hidden sm:inline">Level</span>
            <NuxtImg 
              :src="getLevelBadgeUrl(playerLevel)" 
              :alt="`Level ${playerLevel}`"
              class="w-6 h-6 md:w-8 md:h-8"
              width="32"
              height="32"
              loading="lazy"
              @error="handleBadgeError"
            />
            <button 
              @click="decrementLevel" 
              :disabled="playerLevel <= 1"
              class="p-1 text-dark-text-secondary hover:text-eft-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
              </svg>
            </button>
            <input 
              type="number" 
              :value="playerLevel" 
              @input="handleLevelInput"
              min="1"
              max="79"
              class="w-8 md:w-12 text-center bg-transparent text-dark-text font-semibold border-b border-dark-border focus:border-eft-primary outline-none text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            >
            <button 
              @click="incrementLevel" 
              :disabled="playerLevel >= 79"
              class="p-1 text-dark-text-secondary hover:text-eft-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          
          <div v-if="!loading">
            <div v-if="user" class="flex items-center space-x-2 md:space-x-4">
              <NuxtImg :src="user.photoURL" :alt="user.displayName" class="w-6 h-6 md:w-8 md:h-8 rounded-full" width="32" height="32" loading="lazy" />
              <span class="text-sm text-dark-text hidden sm:inline">{{ user.displayName }}</span>
              <button 
                @click="logout" 
                class="btn btn-secondary text-xs md:text-sm px-2 md:px-4 py-1 md:py-2 flex items-center gap-1 md:gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span class="hidden sm:inline">Logout</span>
              </button>
            </div>
            <div v-else-if="isGuest" class="flex items-center space-x-2 md:space-x-4">
              <div class="w-6 h-6 md:w-8 md:h-8 rounded-full bg-dark-surface flex items-center justify-center">
                <svg class="w-4 h-4 text-dark-text-secondary" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
              </div>
              <span class="text-sm text-dark-text hidden sm:inline">Guest</span>
              <button 
                @click="logout" 
                class="btn btn-secondary text-xs md:text-sm px-2 md:px-4 py-1 md:py-2 flex items-center gap-1 md:gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span class="hidden sm:inline">Exit Guest</span>
              </button>
            </div>
            <div v-else class="flex items-center space-x-1 md:space-x-2">
              <button 
                @click="signInWithGoogle" 
                class="btn btn-primary text-xs md:text-sm px-2 md:px-4 py-1 md:py-2 flex items-center gap-1 md:gap-2"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span class="hidden sm:inline">Sign in with Google</span>
                <span class="sm:hidden">Sign in</span>
              </button>
              <button 
                @click="continueAsGuest" 
                class="btn btn-secondary text-xs md:text-sm px-2 md:px-4 py-1 md:py-2 flex items-center gap-1 md:gap-2"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
                <span class="hidden sm:inline">Continue as Guest</span>
                <span class="sm:hidden">Guest</span>
              </button>
            </div>
          </div>
          <div v-else class="text-sm text-dark-text-secondary">Loading...</div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { user, loading, signInWithGoogle, logout, isGuest, continueAsGuest } = useAuth()
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