<template>
  <div class="space-y-3">
    <h4 class="font-medium text-dark-text">Objectives:</h4>
    <div class="space-y-2">
      <div
        v-for="(objective, index) in task.objectives"
        :key="`${task.id}_obj_${index}`"
        class="flex items-center space-x-3 p-3 bg-dark-surface rounded-lg group"
        :class="{ 'cursor-pointer': !isTaskCompleted }"
        @click="!isTaskCompleted && $emit('toggle-objective', index)"
        @mouseenter="!isTaskCompleted && setHover(index, true)"
        @mouseleave="setHover(index, false)"
      >
        <div class="relative w-5 h-5 flex-shrink-0">
          <div
            :class="[
              'w-5 h-5 flex items-center justify-center transition-all cursor-pointer',
              isObjectiveCompleted(index)
                ? 'text-green-500'
                : 'text-gray-400'
            ]"
          >
            <svg
              v-if="isObjectiveCompleted(index) && !isHovered(index)"
              class="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
            <svg
              v-else-if="isObjectiveCompleted(index) && isHovered(index)"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <svg
              v-else-if="!isObjectiveCompleted(index) && !isHovered(index)"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <svg
              v-else
              class="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          </div>
        </div>
        <p 
          :class="[
            'text-sm transition-colors select-none',
            isObjectiveCompleted(index)
              ? 'text-green-500 font-medium'
              : 'text-dark-text'
          ]"
        >
          {{ objective }}
        </p>
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
  completedObjectives: {
    type: Object,
    required: true
  },
  hoveredObjective: {
    type: Object,
    required: true
  },
  isTaskCompleted: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits([
  'toggle-objective'
])

const isObjectiveCompleted = (objectiveIndex) => {
  return props.completedObjectives[`${props.task.id}_${objectiveIndex}`] === true
}

const isHovered = (objectiveIndex) => {
  return props.hoveredObjective[`${props.task.id}_${objectiveIndex}`] === true
}

const setHover = (objectiveIndex, hovered) => {
  props.hoveredObjective[`${props.task.id}_${objectiveIndex}`] = hovered
}
</script>