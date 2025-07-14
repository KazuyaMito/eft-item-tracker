<template>
  <div class="bg-dark-card rounded-lg shadow-md p-6">
    <h1 class="text-2xl font-bold text-dark-text mb-4">{{ $t('tasks.title') }}</h1>
    <p class="text-dark-text-secondary mb-6">
      {{ $t('tasks.description') }}
    </p>
    
    <!-- Category filters and trader selection -->
    <div class="flex flex-col md:flex-row gap-2 mb-4">
      <!-- ALL/TRADERS buttons section -->
      <div class="bg-dark-surface rounded-lg p-2 flex gap-2 justify-center md:justify-start">
        <button
          @click="$emit('category-change', 'all')"
          :class="[
            'flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 rounded text-xs md:text-sm font-medium transition-colors',
            selectedCategory === 'all'
              ? 'bg-dark-hover text-white'
              : 'text-dark-text-secondary hover:text-white'
          ]"
        >
          <svg class="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          ALL
        </button>
        <button
          @click="$emit('category-change', 'traders')"
          :class="[
            'flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 rounded text-xs md:text-sm font-medium transition-colors',
            selectedCategory === 'traders'
              ? 'bg-dark-hover text-white'
              : 'text-dark-text-secondary hover:text-white'
          ]"
        >
          <svg class="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 715.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          TRADERS
        </button>
      </div>
      
      <!-- Trader selection area -->
      <div class="flex-1 bg-dark-hover rounded-lg p-2 min-w-0 flex items-center justify-center">
        <div v-if="selectedCategory === 'all'" class="text-center">
          <p class="text-xs md:text-sm text-dark-text-secondary uppercase tracking-wider">Showing All Sources</p>
        </div>
        
        <div v-else-if="selectedCategory === 'traders'" class="w-full flex items-center gap-1 min-w-0">
          <TraderScroll
            :traders="traders"
            :selected-trader="selectedTrader"
            :get-trader-image="getTraderImage"
            @trader-select="$emit('trader-select', $event)"
          />
        </div>
      </div>
    </div>
    
    <!-- Status filters -->
    <div class="flex flex-wrap gap-2 mb-4">
      <button
        @click="$emit('filter-change', 'available')"
        :class="[
          'flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded bg-dark-surface text-xs md:text-sm font-medium transition-colors',
          selectedFilter === 'available'
            ? 'text-white ring-2 ring-blue-500'
            : 'text-dark-text-secondary hover:text-white'
        ]"
      >
        <svg class="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="mobile-short-text">
          <span class="mobile-long">AVAILABLE</span>
          <span class="mobile-short">AVAIL</span>
        </span>
      </button>
      <button
        @click="$emit('filter-change', 'locked')"
        :class="[
          'flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded bg-dark-surface text-xs md:text-sm font-medium transition-colors',
          selectedFilter === 'locked'
            ? 'text-white ring-2 ring-blue-500'
            : 'text-dark-text-secondary hover:text-white'
        ]"
      >
        <svg class="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        LOCKED
      </button>
      <button
        @click="$emit('filter-change', 'completed')"
        :class="[
          'flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded bg-dark-surface text-xs md:text-sm font-medium transition-colors',
          selectedFilter === 'completed'
            ? 'text-white ring-2 ring-blue-500'
            : 'text-dark-text-secondary hover:text-white'
        ]"
      >
        <svg class="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
        </svg>
        <span class="mobile-short-text">
          <span class="mobile-long">COMPLETED</span>
          <span class="mobile-short">DONE</span>
        </span>
      </button>
      <button
        @click="$emit('filter-change', 'all')"
        :class="[
          'px-2 md:px-4 py-2 rounded bg-dark-surface text-xs md:text-sm font-medium transition-colors',
          selectedFilter === 'all'
            ? 'text-white ring-2 ring-blue-500'
            : 'text-dark-text-secondary hover:text-white'
        ]"
      >
        ALL
      </button>
      
      <div class="w-full md:w-auto md:flex-1"></div>
      
      <button
        @click="$emit('toggle-tasks-above-level')"
        :class="[
          'flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded bg-dark-surface text-xs md:text-sm font-medium transition-colors whitespace-nowrap',
          showTasksAboveLevel
            ? 'text-white ring-2 ring-blue-500'
            : 'text-dark-text-secondary hover:text-white'
        ]"
        :title="showTasksAboveLevel ? 'Hide tasks above your level' : 'Show tasks above your level'"
      >
        <svg class="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
        <span class="mobile-short-text">
          <span class="mobile-long">{{ showTasksAboveLevel ? 'HIDE' : 'SHOW' }} LVL {{ playerLevel }}+</span>
          <span class="mobile-short">L{{ playerLevel }}+</span>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  selectedCategory: {
    type: String,
    required: true
  },
  selectedTrader: {
    type: String,
    default: null
  },
  selectedFilter: {
    type: String,
    required: true
  },
  showTasksAboveLevel: {
    type: Boolean,
    required: true
  },
  playerLevel: {
    type: Number,
    required: true
  },
  traders: {
    type: Array,
    required: true
  },
  getTraderImage: {
    type: Function,
    required: true
  }
})

const emit = defineEmits([
  'category-change',
  'trader-select',
  'filter-change',
  'toggle-tasks-above-level'
])
</script>