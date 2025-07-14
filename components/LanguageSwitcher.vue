<template>
  <div class="relative">
    <button
      @click="toggleDropdown"
      @dblclick="toggleDebug"
      class="flex items-center space-x-2 bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-eft-primary focus:border-transparent hover:bg-dark-hover transition-colors"
    >
      <span 
        class="fi" 
        :class="getFlagClass(currentLocaleData?.flag)"
      ></span>
      <span class="hidden sm:inline">{{ currentLocaleData?.name }}</span>
      <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': isDropdownOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    
    <!-- Dropdown -->
    <div v-if="isDropdownOpen" class="absolute top-full left-0 mt-1 bg-dark-surface border border-dark-border rounded-lg shadow-lg z-50 min-w-[60px]">
      <button
        v-for="localeOption in availableLocales"
        :key="localeOption.code"
        @click="selectLocale(localeOption.code)"
        class="w-full flex items-center justify-center px-3 py-2 text-sm text-dark-text hover:bg-dark-hover first:rounded-t-lg last:rounded-b-lg"
        :class="{ 'bg-dark-hover': localeOption.code === currentLocale }"
      >
        <span 
          class="fi" 
          :class="getFlagClass(localeOption.flag)"
        ></span>
      </button>
    </div>
    
    <!-- Debug info -->
    <div v-if="showDebug" class="absolute top-full left-0 mt-1 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-50">
      <div>Current locale: {{ locale }}</div>
      <div>Test translation: {{ $t('navigation.home') }}</div>
      <div>Available locales: {{ availableLocales.map(l => l.code).join(', ') }}</div>
    </div>
  </div>
</template>

<script setup>
const { locale, locales, setLocale } = useI18n()

const currentLocale = ref(locale.value)
const availableLocales = locales.value
const showDebug = ref(false)
const isDropdownOpen = ref(false)

// Computed property to get current locale data
const currentLocaleData = computed(() => {
  return availableLocales.find(l => l.code === currentLocale.value)
})

// Get flag class for flag-icons
const getFlagClass = (flag) => {
  const flagMap = {
    'US': 'fi-us',
    'JP': 'fi-jp'
  }
  return flagMap[flag] || ''
}

// Toggle dropdown
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

// Toggle debug info on double click
const toggleDebug = () => {
  showDebug.value = !showDebug.value
}

// Select locale
const selectLocale = async (localeCode) => {
  if (localeCode === locale.value) {
    isDropdownOpen.value = false
    return
  }
  
  try {
    console.log('Switching to locale:', localeCode)
    
    // Change locale without navigation
    await setLocale(localeCode)
    
    // Save locale preference to cookie for persistence
    if (process.client) {
      const expires = new Date()
      expires.setFullYear(expires.getFullYear() + 1)
      document.cookie = `i18n_redirected=${localeCode}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`
    }
    
    isDropdownOpen.value = false
  } catch (error) {
    console.error('Error switching locale:', error)
  }
}

// Close dropdown when clicking outside
const closeDropdown = (event) => {
  if (!event.target.closest('.relative')) {
    isDropdownOpen.value = false
  }
}

// Watch for locale changes from other sources
watch(locale, (newLocale) => {
  currentLocale.value = newLocale
})

// Add click outside listener
onMounted(() => {
  if (process.client) {
    document.addEventListener('click', closeDropdown)
  }
})

onUnmounted(() => {
  if (process.client) {
    document.removeEventListener('click', closeDropdown)
  }
})
</script>

<style scoped>
.relative {
  position: relative;
}

.rotate-180 {
  transform: rotate(180deg);
}

/* Flag icon styles - Standard flag ratio is 3:2 */
.fi {
  width: 1.5rem;
  height: 1rem;
  border-radius: 0.125rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  display: inline-block;
  background-size: cover;
  background-position: center;
}

.fi:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
}
</style>