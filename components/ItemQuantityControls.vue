<template>
  <div v-if="mobile" class="bg-dark-surface rounded-lg p-3">
    <div class="text-center mb-3">
      <span class="text-xs text-dark-text-secondary">Quantity</span>
    </div>
    <div class="flex items-center justify-center space-x-3">
      <button
        @click="$emit('decrement')"
        class="w-8 h-8 rounded-full bg-dark-card hover:bg-dark-hover flex items-center justify-center transition-colors"
        :disabled="currentQuantity <= 0"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
        </svg>
      </button>
      
      <input
        :value="currentQuantity"
        @input="$emit('update', $event.target.value)"
        @blur="$emit('save')"
        type="number"
        min="0"
        :max="totalQuantity"
        class="w-16 px-2 py-1 text-center border border-dark-surface rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-dark-card text-dark-text text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      >
      
      <button
        @click="$emit('increment')"
        :disabled="currentQuantity >= totalQuantity"
        class="w-8 h-8 rounded-full bg-dark-card hover:bg-dark-hover flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
    <div class="text-center mt-2">
      <span 
        :class="[
          'text-xs',
          isCompleted
            ? 'text-green-400 font-semibold'
            : 'text-dark-text-secondary'
        ]"
      >
        {{ currentQuantity }} / {{ totalQuantity }}
      </span>
    </div>
  </div>
  
  <div v-else class="flex items-center space-x-2">
    <span class="text-sm text-dark-text-secondary mr-2">Quantity:</span>
    <button
      @click="$emit('decrement')"
      class="w-8 h-8 rounded-full bg-dark-surface hover:bg-dark-hover flex items-center justify-center transition-colors"
      :disabled="currentQuantity <= 0"
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
      </svg>
    </button>
    
    <input
      :value="currentQuantity"
      @input="$emit('update', $event.target.value)"
      @blur="$emit('save')"
      type="number"
      min="0"
      :max="totalQuantity"
      class="w-16 px-2 py-1 text-center border border-dark-surface rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-dark-surface text-dark-text text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    >
    
    <button
      @click="$emit('increment')"
      :disabled="currentQuantity >= totalQuantity"
      class="w-8 h-8 rounded-full bg-dark-surface hover:bg-dark-hover flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
      </svg>
    </button>
    
    <span 
      :class="[
        'text-sm ml-2',
        isCompleted
          ? 'text-green-400 font-semibold'
          : 'text-dark-text-secondary'
      ]"
    >
      / {{ totalQuantity }}
    </span>
  </div>
</template>

<script setup>
const props = defineProps({
  itemId: {
    type: String,
    required: true
  },
  totalQuantity: {
    type: Number,
    required: true
  },
  currentQuantity: {
    type: Number,
    required: true
  },
  isCompleted: {
    type: Boolean,
    required: true
  },
  mobile: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'increment',
  'decrement',
  'update',
  'save'
])
</script>