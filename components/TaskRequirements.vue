<template>
  <div class="space-y-3">
    <h4 class="font-medium text-dark-text" :class="mobile ? 'text-sm' : ''">Item Requirements:</h4>
    <div class="space-y-2">
      <div
        v-for="requirement in requirements"
        :key="requirement.id"
        :class="[
          'flex items-center justify-between bg-dark-surface rounded-lg',
          mobile ? 'p-2' : 'p-3'
        ]"
      >
        <div class="flex items-center" :class="mobile ? 'space-x-2' : 'space-x-3'">
          <div :class="[
            'bg-dark-surface rounded flex items-center justify-center overflow-hidden',
            mobile ? 'w-8 h-8' : 'w-10 h-10'
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
              mobile ? 'text-sm' : ''
            ]">
              {{ requirement.itemName || getItemName(requirement.itemId) }}
            </p>
            <p :class="[
              'text-dark-text-secondary',
              mobile ? 'text-xs' : 'text-sm'
            ]">
              {{ requirement.foundInRaid ? 'Found in Raid' : 'Any condition' }}
            </p>
          </div>
        </div>
        <div class="text-right">
          <div :class="[
            'font-semibold',
            mobile ? 'text-base' : 'text-lg',
            getProgressClass(requirement)
          ]">
            {{ getUserItemCount(requirement.itemId, requirement.foundInRaid) }} / {{ requirement.quantity }}
          </div>
          <div class="text-xs text-dark-text-secondary">
            {{ getProgressPercentage(requirement) }}%
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  requirements: {
    type: Array,
    required: true
  },
  mobile: {
    type: Boolean,
    default: false
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
</script>