<template>
  <div class="group relative">
    <svg :class="['text-blue-400 cursor-help', mobile ? 'w-4 h-4' : 'w-5 h-5']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
    <div v-if="!mobile" class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-dark-surface border border-dark-border rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
      <p class="text-sm text-dark-text">Alternative tasks available</p>
      <div class="text-xs text-dark-text-secondary mt-1">
        Complete one, others will fail
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  parallelTasks: {
    type: Array,
    required: true
  },
  mobile: {
    type: Boolean,
    default: false
  }
})
</script>