<template>
  <div class="space-y-8">
    <div class="bg-dark-card rounded-lg shadow-md p-6">
      <h1 class="text-3xl font-bold text-dark-text mb-6">Settings</h1>
      
      <div class="space-y-6">
        <!-- Game Edition Section -->
        <div class="border-b border-dark-surface pb-6">
          <h2 class="text-xl font-semibold text-dark-text mb-4">Game Edition</h2>
          
          <div class="flex items-center justify-between">
            <div>
              <label class="text-dark-text font-medium">Escape from Tarkov Edition</label>
              <p class="text-sm text-dark-text-secondary mt-1">
                Your game edition affects hideout stash starting level
              </p>
            </div>
            
            <div class="w-64">
              <select 
                :value="gameEdition"
                @change="handleGameEditionChange"
                class="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-dark-text focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Standard Edition">Standard Edition</option>
                <option value="Left Behind Edition">Left Behind Edition</option>
                <option value="Prepare for Escape Edition">Prepare for Escape Edition</option>
                <option value="Edge of Darkness Edition">Edge of Darkness Edition</option>
                <option value="The Unheard Edition">The Unheard Edition</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Quest Filters Section -->
        <div class="border-b border-dark-surface pb-6">
          <h2 class="text-xl font-semibold text-dark-text mb-4">Quest Filters</h2>
          
          <div class="flex items-center justify-between">
            <div>
              <label class="text-dark-text font-medium">Show non-Kappa tasks</label>
              <p class="text-sm text-dark-text-secondary mt-1">
                Display tasks that are not required for the Kappa container
              </p>
            </div>
            
            <button 
              @click="toggleShowNonKappaTasks"
              :class="[
                'flex items-center justify-center w-12 h-12 rounded-lg transition-colors duration-200',
                showNonKappaTasks ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
              ]"
            >
              <svg 
                v-if="showNonKappaTasks"
                class="w-6 h-6 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg 
                v-else
                class="w-6 h-6 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { showNonKappaTasks, gameEdition, saveShowNonKappaTasks, saveGameEdition } = useSettings()

const toggleShowNonKappaTasks = () => {
  saveShowNonKappaTasks(!showNonKappaTasks.value)
}

const handleGameEditionChange = (event) => {
  saveGameEdition(event.target.value)
}

// SEO Meta tags
useSeoMeta({
  title: 'Settings - EFT Item Tracker Configuration',
  description: 'Configure your Escape from Tarkov tracker settings. Set your game edition for accurate stash level tracking and customize quest filters including Kappa container requirements.',
  ogTitle: 'Settings - EFT Item Tracker Configuration',
  ogDescription: 'Customize your EFT tracker experience with game edition settings and quest filter preferences.',
  robots: 'noindex, nofollow' // Settings pages typically shouldn't be indexed
})
</script>