export const usePlayerLevel = () => {
  const { user } = useAuth()
  const { savePlayerLevel, getPlayerLevel, createUserProfile } = useFirestore()
  
  const playerLevel = useState<number>('playerLevel', () => 1)
  const loading = useState<boolean>('playerLevelLoading', () => true)

  // Load player level from Firestore when user changes
  watchEffect(async () => {
    if (user.value?.uid) {
      loading.value = true
      try {
        const level = await getPlayerLevel(user.value.uid)
        // If getPlayerLevel returns 1 and the user document doesn't exist,
        // we need to create the user profile
        if (level === 1) {
          // Check if this is a new user by trying to get the user document
          const { $firebase } = useNuxtApp()
          const { doc, getDoc } = await import('firebase/firestore')
          const userRef = doc($firebase.db, 'users', user.value.uid)
          const userDoc = await getDoc(userRef)
          
          if (!userDoc.exists()) {
            // Create user profile for new users
            await createUserProfile(user.value.uid, {
              email: user.value.email,
              displayName: user.value.displayName,
              photoURL: user.value.photoURL
            })
          }
        }
        playerLevel.value = level
      } catch (error) {
        console.error('Failed to load player level:', error)
        playerLevel.value = 1
      } finally {
        loading.value = false
      }
    } else {
      playerLevel.value = 1
      loading.value = false
    }
  })

  const setPlayerLevel = async (level: number) => {
    const clampedLevel = Math.max(1, Math.min(79, level))
    playerLevel.value = clampedLevel
    
    if (user.value?.uid) {
      try {
        await savePlayerLevel(user.value.uid, clampedLevel)
      } catch (error) {
        console.error('Failed to save player level:', error)
      }
    }
  }

  const incrementLevel = () => {
    setPlayerLevel(playerLevel.value + 1)
  }

  const decrementLevel = () => {
    setPlayerLevel(playerLevel.value - 1)
  }

  const getLevelBadgeUrl = (level: number) => {
    // Badge images are grouped in ranges of 5 levels
    const badgeGroup = Math.ceil(level / 5)
    return `https://assets.tarkov.dev/player-level-group-${badgeGroup}.png`
  }

  return {
    playerLevel: readonly(playerLevel),
    loading: readonly(loading),
    setPlayerLevel,
    incrementLevel,
    decrementLevel,
    getLevelBadgeUrl
  }
}