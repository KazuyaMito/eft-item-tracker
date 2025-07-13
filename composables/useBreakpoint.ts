import { ref, onMounted, onUnmounted, computed, readonly } from 'vue'

export const useBreakpoint = () => {
  const windowWidth = ref(0)
  
  // Tailwindのブレークポイントに基づく判定
  const isMobile = computed(() => windowWidth.value < 640)
  const isTablet = computed(() => windowWidth.value >= 640 && windowWidth.value < 1024)
  const isDesktop = computed(() => windowWidth.value >= 1024)
  
  const updateWidth = () => {
    windowWidth.value = window.innerWidth
  }
  
  onMounted(() => {
    updateWidth()
    window.addEventListener('resize', updateWidth)
  })
  
  onUnmounted(() => {
    window.removeEventListener('resize', updateWidth)
  })
  
  return {
    windowWidth: readonly(windowWidth),
    isMobile: readonly(isMobile),
    isTablet: readonly(isTablet),
    isDesktop: readonly(isDesktop)
  }
}