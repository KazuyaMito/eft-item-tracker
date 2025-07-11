<template>
  <div
    :class="[
      'bg-dark-card rounded-lg shadow-md',
      isMobile ? 'p-4' : 'p-6'
    ]"
  >
    <!-- PC Layout -->
    <div v-if="!isMobile" class="mb-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-dark-surface rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
            <img 
              v-if="station.imageLink"
              :src="station.imageLink"
              :alt="station.name"
              class="w-full h-full object-cover"
              @error="$event.target.style.display='none'"
            />
            <svg v-else class="w-6 h-6 text-dark-text-secondary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-dark-text">{{ station.name }}</h3>
            <p class="text-sm text-dark-text-secondary">Current Level: {{ currentLevel }}</p>
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <div class="text-right">
            <div class="text-sm font-medium" :class="progressClass">
              {{ completedLevels }} / {{ station.levels.length }} levels
            </div>
            <div class="text-xs text-dark-text-secondary">
              {{ progressPercentage }}% Complete
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button
              v-if="canUpgrade"
              @click="$emit('upgrade', station.id, currentLevel + 1)"
              class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Upgrade to Level {{ currentLevel + 1 }}
            </button>
            <button
              v-if="currentLevel > 0"
              @click="$emit('downgrade', station.id, currentLevel - 1)"
              class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
            >
              Downgrade
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Layout -->
    <div v-else class="mb-4">
      <div class="space-y-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-dark-surface rounded flex items-center justify-center overflow-hidden flex-shrink-0">
            <img 
              v-if="station.imageLink"
              :src="station.imageLink"
              :alt="station.name"
              class="w-full h-full object-cover"
              @error="$event.target.style.display='none'"
            />
            <svg v-else class="w-4 h-4 text-dark-text-secondary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-base font-semibold text-dark-text">{{ station.name }}</h3>
            <p class="text-xs text-dark-text-secondary">Current Level: {{ currentLevel }}</p>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm font-medium" :class="progressClass">
              {{ completedLevels }} / {{ station.levels.length }}
            </div>
            <div class="text-xs text-dark-text-secondary">
              {{ progressPercentage }}% Complete
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="canUpgrade"
              @click="$emit('upgrade', station.id, currentLevel + 1)"
              class="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors"
            >
              Upgrade L{{ currentLevel + 1 }}
            </button>
            <button
              v-if="currentLevel > 0"
              @click="$emit('downgrade', station.id, currentLevel - 1)"
              class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
            >
              Down
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="space-y-4">
      <HideoutLevelCard
        v-for="level in filteredLevels"
        :key="level.level"
        :level="level"
        :station="station"
        :current-level="currentLevel"
        :is-mobile="isMobile"
        :is-level-buildable="isLevelBuildable"
        :is-station-level-complete="isStationLevelComplete"
        :get-item-name="getItemName"
        :get-progress-class="getProgressClass"
        :get-progress-percentage="getProgressPercentage"
        :get-user-item-count="getUserItemCount"
      />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  station: {
    type: Object,
    required: true
  },
  currentLevel: {
    type: Number,
    required: true
  },
  completedLevels: {
    type: Number,
    required: true
  },
  progressPercentage: {
    type: Number,
    required: true
  },
  progressClass: {
    type: String,
    required: true
  },
  canUpgrade: {
    type: Boolean,
    required: true
  },
  filteredLevels: {
    type: Array,
    required: true
  },
  isMobile: {
    type: Boolean,
    required: true
  },
  isLevelBuildable: {
    type: Function,
    required: true
  },
  isStationLevelComplete: {
    type: Function,
    required: true
  },
  getItemName: {
    type: Function,
    required: true
  },
  getProgressClass: {
    type: Function,
    required: true
  },
  getProgressPercentage: {
    type: Function,
    required: true
  },
  getUserItemCount: {
    type: Function,
    required: true
  }
})

const emit = defineEmits([
  'upgrade',
  'downgrade'
])
</script>