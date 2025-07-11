<template>
  <div
    :class="[
      'bg-dark-card rounded-lg shadow-md',
      isMobile ? 'p-4' : 'p-6'
    ]"
  >
    <!-- PC Layout -->
    <div v-if="!isMobile" class="flex items-start justify-between mb-4">
      <div class="flex-1">
        <div class="flex items-start gap-2">
          <h3 class="text-lg font-semibold text-dark-text">{{ task.name }}</h3>
          <div v-if="task.parallelTaskIds && task.parallelTaskIds.length > 0" class="flex items-center gap-1">
            <TaskParallelIcon :parallel-tasks="task.parallelTaskIds" />
          </div>
        </div>
        <p class="text-sm text-dark-text-secondary">
          {{ task.trader }} - 
          <span :class="task.level > playerLevel ? 'text-red-500 font-semibold' : ''">
            Level {{ task.level }}
          </span>
        </p>
        <p class="text-dark-text-secondary mt-2">{{ task.description }}</p>
        <TaskStatusBadge :task="task" :task-completion-statuses="taskCompletionStatuses" :get-task-name="getTaskName" />
      </div>
      <div class="ml-4">
        <TaskCompleteButton
          :task="task"
          :is-completed="isTaskCompleted(task.id)"
          :can-complete="canCompleteTask(task)"
          :completing="completingTask === task.id"
          :uncompleting="uncompletingTask === task.id"
          @complete="$emit('complete', task)"
          @uncomplete="$emit('uncomplete', task)"
        />
      </div>
    </div>

    <!-- Mobile Layout -->
    <div v-else class="mb-4">
      <div>
        <div class="flex items-start gap-2 mb-2">
          <h3 class="text-base font-semibold text-dark-text">{{ task.name }}</h3>
          <div v-if="task.parallelTaskIds && task.parallelTaskIds.length > 0" class="flex items-center gap-1">
            <TaskParallelIcon :parallel-tasks="task.parallelTaskIds" :mobile="true" />
          </div>
        </div>
        <p class="text-xs text-dark-text-secondary mb-2">
          {{ task.trader }} - 
          <span :class="task.level > playerLevel ? 'text-red-500 font-semibold' : ''">
            Level {{ task.level }}
          </span>
        </p>
        <p class="text-sm text-dark-text-secondary mb-3">{{ task.description }}</p>
        
        <div class="flex flex-wrap items-center gap-2 mb-3">
          <TaskStatusBadge :task="task" :task-completion-statuses="taskCompletionStatuses" :mobile="true" :get-task-name="getTaskName" />
          <TaskCompleteButton
            :task="task"
            :is-completed="isTaskCompleted(task.id)"
            :can-complete="canCompleteTask(task)"
            :completing="completingTask === task.id"
            :uncompleting="uncompletingTask === task.id"
            :mobile="true"
            @complete="$emit('complete', task)"
            @uncomplete="$emit('uncomplete', task)"
          />
        </div>
        
        <!-- Show related parallel tasks -->
        <div v-if="task.parallelTaskIds && task.parallelTaskIds.length > 0 && taskCompletionStatuses[task.id]?.status !== 'completed'" class="text-xs text-dark-text-secondary">
          <span>Alternatives: </span>
          <span v-for="(parallelId, idx) in task.parallelTaskIds" :key="parallelId" class="inline">
            <span v-if="idx > 0"> | </span>
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
    </div>
    
    <TaskObjectives
      v-if="task.objectives && task.objectives.length > 0"
      :task="task"
      :completed-objectives="completedObjectives"
      :hovered-objective="hoveredObjective"
      :is-task-completed="isTaskCompleted(task.id)"
      @toggle-objective="$emit('toggle-objective', task.id, $event)"
    />
    
    <TaskRequirements
      v-if="task.requirements && task.requirements.length > 0"
      :task="task"
      :requirements="task.requirements"
      :get-item-name="getItemName"
      :get-progress-class="getProgressClass"
      :get-progress-percentage="getProgressPercentage"
      :get-user-item-count="getUserItemCount"
      :mobile="isMobile"
    />
    
    <TaskRewards
      :task="task"
      :mobile="isMobile"
    />
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
  completedObjectives: {
    type: Object,
    required: true
  },
  hoveredObjective: {
    type: Object,
    required: true
  },
  completingTask: {
    type: [String, Number],
    default: null
  },
  uncompletingTask: {
    type: [String, Number],
    default: null
  },
  playerLevel: {
    type: Number,
    required: true
  },
  isMobile: {
    type: Boolean,
    required: true
  },
  isTaskCompleted: {
    type: Function,
    required: true
  },
  canCompleteTask: {
    type: Function,
    required: true
  },
  getTaskName: {
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
  'complete',
  'uncomplete',
  'toggle-objective'
])
</script>