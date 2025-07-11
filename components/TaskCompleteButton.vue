<template>
  <button
    v-if="!isCompleted"
    @click="$emit('complete')"
    :disabled="completing || !canComplete"
    :class="[
      'bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
      mobile ? 'ml-auto px-3 py-1 text-xs' : 'px-4 py-2'
    ]"
  >
    {{ completing ? 'Completing...' : 'Complete' }}
  </button>
  <button
    v-else
    @click="$emit('uncomplete')"
    :disabled="uncompleting"
    :class="[
      'bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
      mobile ? 'ml-auto px-3 py-1 text-xs' : 'px-4 py-2'
    ]"
  >
    {{ uncompleting ? 'Uncompleting...' : 'Uncomplete' }}
  </button>
</template>

<script setup>
const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  isCompleted: {
    type: Boolean,
    required: true
  },
  canComplete: {
    type: Boolean,
    required: true
  },
  completing: {
    type: Boolean,
    default: false
  },
  uncompleting: {
    type: Boolean,
    default: false
  },
  mobile: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'complete',
  'uncomplete'
])
</script>