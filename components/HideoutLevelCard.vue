<template>
  <div
    :class="[
      'border rounded-lg',
      isMobile ? 'p-3' : 'p-4',
      levelClasses
    ]"
  >
    <div :class="[
      'flex items-center justify-between',
      isMobile ? 'mb-2' : 'mb-3'
    ]">
      <div>
        <h4 :class="[
          'font-medium text-dark-text',
          isMobile ? 'text-sm' : ''
        ]">Level {{ level.level }}</h4>
        <span :class="[
          'text-dark-text-secondary',
          isMobile ? 'text-xs' : 'text-sm'
        ]">
          Construction Time: {{ level.constructionTime }}
        </span>
      </div>
      <div class="text-right">
        <div v-if="currentLevel === level.level" :class="[
          'text-green-400 font-medium',
          isMobile ? 'text-xs' : 'text-sm'
        ]">
          Current Level
        </div>
        <div v-else-if="currentLevel > level.level" :class="[
          'text-green-400',
          isMobile ? 'text-xs' : 'text-sm'
        ]">
          Completed
        </div>
        <div v-else-if="currentLevel === level.level - 1 && isLevelBuildable(station.id, level)" :class="[
          'text-blue-400',
          isMobile ? 'text-xs' : 'text-sm'
        ]">
          Ready to build
        </div>
        <div v-else-if="!isLevelBuildable(station.id, level)" :class="[
          'text-red-400',
          isMobile ? 'text-xs' : 'text-sm'
        ]">
          Prerequisites not met
        </div>
      </div>
    </div>
    
    <div class="space-y-3">
      <!-- Station Prerequisites -->
      <div v-if="level.stationLevelRequirements && level.stationLevelRequirements.length > 0">
        <h5 :class="[
          'font-medium text-dark-text mb-2',
          isMobile ? 'text-xs' : 'text-sm'
        ]">Station Prerequisites:</h5>
        <div class="space-y-2">
          <div
            v-for="requirement in level.stationLevelRequirements"
            :key="requirement.stationId"
            class="flex items-center justify-between p-2 bg-dark-surface rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <div class="text-sm font-medium text-dark-text">
                {{ requirement.stationName }} Level {{ requirement.level }}
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm" :class="isStationLevelComplete(requirement.stationId, requirement.level) ? 'text-green-600' : 'text-red-600'">
                {{ isStationLevelComplete(requirement.stationId, requirement.level) ? 'Complete' : 'Incomplete' }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Item Requirements -->
      <div>
        <h5 :class="[
          'font-medium text-dark-text mb-2',
          isMobile ? 'text-xs' : 'text-sm'
        ]">Item Requirements:</h5>
        <div class="space-y-2">
          <div
            v-for="requirement in level.requirements"
            :key="requirement.id"
            :class="[
              'flex items-center justify-between bg-dark-surface rounded-lg',
              isMobile ? 'p-2' : 'p-3'
            ]"
          >
            <div class="flex items-center" :class="isMobile ? 'space-x-2' : 'space-x-3'">
              <div :class="[
                'bg-dark-surface rounded flex items-center justify-center overflow-hidden',
                isMobile ? 'w-8 h-8' : 'w-10 h-10'
              ]">
                <img 
                  v-if="requirement.itemIconLink"
                  :src="requirement.itemIconLink"
                  :alt="requirement.itemName || getItemName(requirement.itemId)"
                  class="w-full h-full object-cover"
                  @error="$event.target.style.display='none'"
                />
                <span v-else class="text-xs text-dark-text-secondary">IMG</span>
              </div>
              <div>
                <p :class="[
                  'font-medium text-dark-text',
                  isMobile ? 'text-sm' : ''
                ]">
                  {{ requirement.itemName || getItemName(requirement.itemId) }}
                </p>
                <p :class="[
                  'text-dark-text-secondary',
                  isMobile ? 'text-xs' : 'text-sm'
                ]">
                  Found in Raid required
                </p>
              </div>
            </div>
            <div class="text-right">
              <div :class="[
                'font-semibold',
                isMobile ? 'text-base' : 'text-lg',
                getProgressClass(requirement)
              ]">
                {{ getUserItemCount(requirement.itemId, true) }} / {{ requirement.quantity }}
              </div>
              <div class="text-xs text-dark-text-secondary">
                {{ getProgressPercentage(requirement) }}%
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Skill Requirements -->
      <div v-if="level.skillRequirements && level.skillRequirements.length > 0">
        <h5 :class="[
          'font-medium text-dark-text mb-2',
          isMobile ? 'text-xs' : 'text-sm'
        ]">Skill Requirements:</h5>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="requirement in level.skillRequirements"
            :key="requirement.skillId"
            class="inline-block px-2 py-1 text-xs bg-purple-900 text-purple-200 rounded"
          >
            {{ requirement.skillName }} Level {{ requirement.level }}
          </span>
        </div>
      </div>
      
      <!-- Trader Requirements -->
      <div v-if="level.traderRequirements && level.traderRequirements.length > 0">
        <h5 :class="[
          'font-medium text-dark-text mb-2',
          isMobile ? 'text-xs' : 'text-sm'
        ]">Trader Requirements:</h5>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="requirement in level.traderRequirements"
            :key="requirement.traderId"
            class="inline-block px-2 py-1 text-xs bg-orange-900 text-orange-200 rounded"
          >
            {{ requirement.traderName }} Level {{ requirement.level }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  level: {
    type: Object,
    required: true
  },
  station: {
    type: Object,
    required: true
  },
  currentLevel: {
    type: Number,
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

const levelClasses = computed(() => {
  const isBuildable = props.isLevelBuildable(props.station.id, props.level)
  const isComplete = props.currentLevel >= props.level.level
  
  if (isComplete) {
    return 'border-green-500 bg-green-900/10'
  } else if (isBuildable) {
    return 'border-blue-500 bg-blue-900/10'
  } else {
    return 'border-red-500 bg-red-900/10 opacity-70'
  }
})
</script>