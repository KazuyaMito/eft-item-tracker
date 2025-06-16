import { ref, type Ref } from 'vue'

export interface ItemQuantity {
  total: number
  foundInRaid: number
  notes: string
}

export interface UseItemQuantityOptions {
  onUpdate?: (itemId: string, quantity: ItemQuantity) => Promise<void>
}

export function useItemQuantity(options: UseItemQuantityOptions = {}) {
  const itemQuantities = ref<Record<string, ItemQuantity>>({})
  const pendingUpdates = ref<Record<string, number>>({})

  const getCurrentQuantity = (itemId: string): number => {
    if (pendingUpdates.value[itemId] !== undefined) {
      return pendingUpdates.value[itemId]
    }
    return itemQuantities.value[itemId]?.foundInRaid || 0
  }

  const updateQuantity = (itemId: string, value: string | number) => {
    const numValue = Math.max(0, parseInt(value.toString()) || 0)
    pendingUpdates.value[itemId] = numValue
  }

  const incrementQuantity = async (itemId: string) => {
    const current = getCurrentQuantity(itemId)
    pendingUpdates.value[itemId] = current + 1
    await saveQuantity(itemId)
  }

  const decrementQuantity = async (itemId: string) => {
    const current = getCurrentQuantity(itemId)
    if (current > 0) {
      pendingUpdates.value[itemId] = current - 1
      await saveQuantity(itemId)
    }
  }

  const saveQuantity = async (itemId: string) => {
    const newQuantity = pendingUpdates.value[itemId] !== undefined 
      ? pendingUpdates.value[itemId] 
      : getCurrentQuantity(itemId)
    
    if (!itemQuantities.value[itemId]) {
      itemQuantities.value[itemId] = {
        total: newQuantity,
        foundInRaid: newQuantity,
        notes: ''
      }
    } else {
      itemQuantities.value[itemId].foundInRaid = newQuantity
      itemQuantities.value[itemId].total = Math.max(
        itemQuantities.value[itemId].total, 
        newQuantity
      )
    }
    
    delete pendingUpdates.value[itemId]
    
    if (options.onUpdate) {
      try {
        await options.onUpdate(itemId, itemQuantities.value[itemId])
      } catch (error) {
        console.error('Failed to update item:', error)
        // Re-add to pending updates on failure
        pendingUpdates.value[itemId] = newQuantity
        throw error
      }
    }
  }

  const loadQuantities = (quantities: Record<string, ItemQuantity>) => {
    itemQuantities.value = quantities
    pendingUpdates.value = {}
  }

  const clearQuantities = () => {
    itemQuantities.value = {}
    pendingUpdates.value = {}
  }

  return {
    itemQuantities: itemQuantities as Readonly<Ref<Record<string, ItemQuantity>>>,
    pendingUpdates: pendingUpdates as Readonly<Ref<Record<string, number>>>,
    getCurrentQuantity,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    saveQuantity,
    loadQuantities,
    clearQuantities
  }
}

// Pure functions for testing
export function calculateNewQuantity(
  current: number, 
  change: number, 
  min: number = 0
): number {
  return Math.max(min, current + change)
}

export function parseQuantityInput(value: string | number): number {
  return Math.max(0, parseInt(value.toString()) || 0)
}

export function createItemQuantity(
  foundInRaid: number, 
  total?: number, 
  notes: string = ''
): ItemQuantity {
  return {
    foundInRaid,
    total: Math.max(total ?? foundInRaid, foundInRaid),
    notes
  }
}