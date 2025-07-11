<template>
  <div class="flex items-center gap-2">
    <span 
      v-if="taskCompletionStatuses[task.id]?.status === 'completed'"
      :class="[
        'inline-flex items-center rounded-full font-medium bg-green-900/20 text-green-400 border border-green-800',
        mobile ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'
      ]"
    >
      Completed
    </span>
    <span 
      v-else-if="taskCompletionStatuses[task.id]?.status === 'failed'"
      :class="[
        'inline-flex items-center rounded-full font-medium bg-red-900/20 text-red-400 border border-red-800',
        mobile ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'
      ]"
    >
      {{ mobile ? 'Failed' : 'Failed (Alternative Completed)' }}
    </span>
    <span 
      v-else
      :class="[
        'inline-flex items-center rounded-full font-medium bg-yellow-900/20 text-yellow-400 border border-yellow-800',
        mobile ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'
      ]"
    >
      In Progress
    </span>
    
    <!-- Show related parallel tasks -->
    <div v-if="task.parallelTaskIds && task.parallelTaskIds.length > 0 && taskCompletionStatuses[task.id]?.status !== 'completed' && !mobile && getTaskName" class="flex items-center gap-1 text-xs text-dark-text-secondary">
      <span>Alternatives:</span>
      <span v-for="(parallelId, idx) in task.parallelTaskIds" :key="parallelId" class="flex items-center">
        <span v-if="idx > 0" class="mx-1">|</span>
        <span 
          :class="{
            'text-green-400': taskCompletionStatuses[parallelId]?.status === 'completed',
            'text-red-400': taskCompletionStatuses[parallelId]?.status === 'failed'
          }">
          {{ getTaskName(parallelId) }}
        </span>
      </span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  taskCompletionStatuses: {
    type: Object,
    required: true
  },
  mobile: {
    type: Boolean,
    default: false
  },
  getTaskName: {
    type: Function,
    default: (taskId) => taskId
  }
})
</script>