<template>
  <header class="bg-white shadow-md">
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <h1 class="text-2xl font-bold text-eft-primary">EFT Tracker</h1>
          <nav class="hidden md:flex space-x-6">
            <NuxtLink to="/" class="text-gray-600 hover:text-eft-primary transition-colors">
              Dashboard
            </NuxtLink>
            <NuxtLink to="/items" class="text-gray-600 hover:text-eft-primary transition-colors">
              Items
            </NuxtLink>
            <NuxtLink to="/tasks" class="text-gray-600 hover:text-eft-primary transition-colors">
              Tasks
            </NuxtLink>
            <NuxtLink to="/hideout" class="text-gray-600 hover:text-eft-primary transition-colors">
              Hideout
            </NuxtLink>
          </nav>
        </div>
        
        <div class="flex items-center space-x-4">
          <div v-if="!loading">
            <div v-if="user" class="flex items-center space-x-4">
              <img :src="user.photoURL" :alt="user.displayName" class="w-8 h-8 rounded-full">
              <span class="text-sm text-gray-700">{{ user.displayName }}</span>
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
          <div v-else class="text-sm text-gray-500">Loading...</div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
const { user, loading, signInWithGoogle, logout } = useAuth()
</script>