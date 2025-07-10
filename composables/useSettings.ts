export const useSettings = () => {
  const { user } = useAuth()
  const { saveUserSettings, getUserSettings, watchUserSettings } = useFirestore()
  
  const showNonKappaTasks = ref(true)
  const gameEdition = ref('Standard Edition')
  let unsubscribe: (() => void) | null = null

  // Load settings from Firebase
  const loadSettings = async () => {
    if (!user.value) return
    
    try {
      const settings = await getUserSettings(user.value.uid)
      if (settings.showNonKappaTasks !== undefined) {
        showNonKappaTasks.value = settings.showNonKappaTasks
      }
      if (settings.gameEdition !== undefined) {
        gameEdition.value = settings.gameEdition
      }
    } catch (error) {
      console.error('Failed to load user settings:', error)
    }
  }

  // Save settings to Firebase
  const saveShowNonKappaTasks = async (value: boolean) => {
    showNonKappaTasks.value = value
    
    if (!user.value) return
    
    try {
      await saveUserSettings(user.value.uid, {
        showNonKappaTasks: value
      })
    } catch (error) {
      console.error('Failed to save user settings:', error)
    }
  }

  const saveGameEdition = async (value: string) => {
    gameEdition.value = value
    
    if (!user.value) return
    
    try {
      await saveUserSettings(user.value.uid, {
        gameEdition: value
      })
    } catch (error) {
      console.error('Failed to save user settings:', error)
    }
  }


  // Watch for settings changes
  const startWatchingSettings = () => {
    if (!user.value || unsubscribe) return
    
    unsubscribe = watchUserSettings(user.value.uid, (settings) => {
      if (settings.showNonKappaTasks !== undefined) {
        showNonKappaTasks.value = settings.showNonKappaTasks
      }
      if (settings.gameEdition !== undefined) {
        gameEdition.value = settings.gameEdition
      }
    })
  }

  // Stop watching settings
  const stopWatchingSettings = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  // Watch for user changes
  watch(user, (newUser) => {
    stopWatchingSettings()
    
    if (newUser) {
      loadSettings()
      startWatchingSettings()
    } else {
      showNonKappaTasks.value = true
      gameEdition.value = 'Standard Edition'
    }
  }, { immediate: true })

  // Cleanup on unmount
  onUnmounted(() => {
    stopWatchingSettings()
  })

  return {
    showNonKappaTasks: readonly(showNonKappaTasks),
    gameEdition: readonly(gameEdition),
    saveShowNonKappaTasks,
    saveGameEdition
  }
}