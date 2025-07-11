<template>
  <div class="w-full flex items-center gap-1 min-w-0">
    <button
      class="text-dark-text-secondary hover:text-white p-1 flex-shrink-0 transition-colors"
      @click="scrollTraders('left')"
    >
      <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    
    <div ref="traderScroll" class="flex gap-1 md:gap-2 flex-nowrap overflow-x-hidden scrollbar-hide flex-1 scroll-smooth min-w-0">
      <button
        v-for="trader in traders"
        :key="trader"
        @click="$emit('trader-select', selectedTrader === trader ? null : trader)"
        :class="[
          'flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 rounded text-xs font-medium transition-colors flex-shrink-0',
          selectedTrader === trader
            ? 'bg-blue-600 text-white'
            : 'bg-dark-surface text-dark-text-secondary hover:bg-dark-surface'
        ]"
      >
        <div class="w-5 h-5 md:w-6 md:h-6 bg-dark-card rounded-full flex items-center justify-center overflow-hidden">
          <img 
            v-if="getTraderImage(trader)"
            :src="getTraderImage(trader)"
            :alt="trader"
            class="w-full h-full object-cover"
            @error="$event.target.style.display='none'"
          />
          <span v-else class="text-[8px] md:text-[10px] font-bold">{{ trader.substring(0, 2).toUpperCase() }}</span>
        </div>
        <span class="uppercase mobile-short-text">
          <span class="mobile-long">{{ trader }}</span>
          <span class="mobile-short">{{ trader.substring(0, 3).toUpperCase() }}</span>
        </span>
      </button>
    </div>
    
    <button
      class="text-dark-text-secondary hover:text-white p-1 flex-shrink-0 transition-colors"
      @click="scrollTraders('right')"
    >
      <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  traders: {
    type: Array,
    required: true
  },
  selectedTrader: {
    type: String,
    default: null
  },
  getTraderImage: {
    type: Function,
    required: true
  }
})

const emit = defineEmits([
  'trader-select'
])

const traderScroll = ref(null)

const scrollTraders = (direction) => {
  const container = traderScroll.value
  if (!container) return
  
  const scrollAmount = 200
  if (direction === 'left') {
    container.scrollLeft -= scrollAmount
  } else {
    container.scrollLeft += scrollAmount
  }
}
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}
</style>