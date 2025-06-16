import { ref, type Ref } from 'vue'

export function useTraderScroll() {
  const traderScroll = ref<HTMLElement | null>(null)
  
  const scrollTraders = (direction: 'left' | 'right', scrollAmount: number = 200) => {
    const container = traderScroll.value
    if (!container) return
    
    if (direction === 'left') {
      container.scrollLeft -= scrollAmount
    } else {
      container.scrollLeft += scrollAmount
    }
  }
  
  return {
    traderScroll,
    scrollTraders
  }
}