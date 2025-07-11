<template>
  <div
    :class="[
      'rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300',
      isCompleted
        ? 'bg-green-900/20 border-2 border-green-600/50 shadow-green-600/20'
        : 'bg-dark-card'
    ]"
  >
    <!-- PC Layout -->
    <div v-if="!isMobile" class="flex items-center justify-between">
      <div class="flex items-center space-x-4 flex-1">
        <div class="w-16 h-16 bg-dark-surface rounded flex items-center justify-center overflow-hidden flex-shrink-0">
          <img 
            v-if="groupedItem.itemIconLink"
            :src="groupedItem.itemIconLink"
            :alt="groupedItem.itemName"
            class="w-full h-full object-cover"
            @error="$event.target.style.display='none'"
          />
          <span v-else class="text-xs text-dark-text-secondary">IMG</span>
        </div>
        
        <div class="flex-1 min-w-0">
          <h3 
            :class="[
              'font-semibold truncate flex items-center gap-2',
              isCompleted
                ? 'text-green-400'
                : 'text-dark-text'
            ]"
          >
            {{ groupedItem.itemName }}
            <svg 
              v-if="isCompleted"
              class="w-4 h-4 text-green-400 flex-shrink-0" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </h3>
          <ItemSources :sources="groupedItem.sources" />
        </div>
        
        <ItemQuantityControls
          :item-id="groupedItem.itemId"
          :total-quantity="groupedItem.totalQuantity"
          :current-quantity="getCurrentQuantity(groupedItem.itemId)"
          :is-completed="isCompleted"
          @increment="incrementQuantity(groupedItem.itemId, groupedItem.totalQuantity)"
          @decrement="decrementQuantity(groupedItem.itemId)"
          @update="updateQuantity(groupedItem.itemId, $event, groupedItem.totalQuantity)"
          @save="saveQuantity(groupedItem.itemId)"
        />
      </div>
    </div>

    <!-- Mobile Layout -->
    <div v-else class="flex flex-col space-y-4">
      <!-- アイテム情報セクション -->
      <div class="flex items-center space-x-3">
        <div class="w-12 h-12 bg-dark-surface rounded flex items-center justify-center overflow-hidden flex-shrink-0">
          <img 
            v-if="groupedItem.itemIconLink"
            :src="groupedItem.itemIconLink"
            :alt="groupedItem.itemName"
            class="w-full h-full object-cover"
            @error="$event.target.style.display='none'"
          />
          <span v-else class="text-xs text-dark-text-secondary">IMG</span>
        </div>
        <div class="flex-1 min-w-0">
          <h3 
            :class="[
              'font-semibold text-sm break-words flex items-center gap-2',
              isCompleted
                ? 'text-green-400'
                : 'text-dark-text'
            ]"
          >
            {{ groupedItem.itemName }}
            <svg 
              v-if="isCompleted"
              class="w-3 h-3 text-green-400 flex-shrink-0" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </h3>
        </div>
      </div>

      <!-- ソース情報セクション -->
      <ItemSources :sources="groupedItem.sources" :mobile="true" />

      <!-- コントロールセクション -->
      <ItemQuantityControls
        :item-id="groupedItem.itemId"
        :total-quantity="groupedItem.totalQuantity"
        :current-quantity="getCurrentQuantity(groupedItem.itemId)"
        :is-completed="isCompleted"
        :mobile="true"
        @increment="incrementQuantity(groupedItem.itemId, groupedItem.totalQuantity)"
        @decrement="decrementQuantity(groupedItem.itemId)"
        @update="updateQuantity(groupedItem.itemId, $event, groupedItem.totalQuantity)"
        @save="saveQuantity(groupedItem.itemId)"
      />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  groupedItem: {
    type: Object,
    required: true
  },
  isMobile: {
    type: Boolean,
    required: true
  },
  getCurrentQuantity: {
    type: Function,
    required: true
  },
  updateQuantity: {
    type: Function,
    required: true
  },
  incrementQuantity: {
    type: Function,
    required: true
  },
  decrementQuantity: {
    type: Function,
    required: true
  },
  saveQuantity: {
    type: Function,
    required: true
  }
})

const isCompleted = computed(() => {
  const current = props.getCurrentQuantity(props.groupedItem.itemId)
  return current >= props.groupedItem.totalQuantity
})
</script>