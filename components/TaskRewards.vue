<template>
  <div class="mt-4 pt-4 border-t border-dark-border">
    <h4 :class="[
      'font-medium text-dark-text mb-2',
      mobile ? 'text-sm' : ''
    ]">Rewards:</h4>
    <div :class="[
      'flex flex-wrap',
      mobile ? 'gap-1' : 'gap-2'
    ]">
      <span
        v-for="reward in task.rewards"
        :key="reward"
        :class="[
          'inline-block bg-green-900/20 text-green-400 border border-green-800 rounded',
          mobile ? 'px-2 py-0.5 text-xs' : 'px-2 py-1 text-xs'
        ]"
      >
        {{ reward }}
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
  mobile: {
    type: Boolean,
    default: false
  }
})
</script>