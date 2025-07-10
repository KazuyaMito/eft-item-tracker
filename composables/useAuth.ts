import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth'

export const useAuth = () => {
  const { $firebase } = useNuxtApp()
  const user = ref(null)
  const loading = ref(true)
  const isGuest = ref(false)

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup($firebase.auth, provider)
      isGuest.value = false
      return result.user
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  const continueAsGuest = () => {
    isGuest.value = true
    user.value = null
    loading.value = false
  }

  const logout = async () => {
    try {
      if (isGuest.value) {
        isGuest.value = false
        user.value = null
        // Clear any local storage for guest data
        if (process.client) {
          localStorage.removeItem('guestUserData')
        }
      } else {
        await signOut($firebase.auth)
      }
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  onMounted(() => {
    onAuthStateChanged($firebase.auth, (authUser) => {
      if (authUser) {
        user.value = authUser
        isGuest.value = false
      } else {
        user.value = null
        // Don't change isGuest state here as it might already be set
      }
      loading.value = false
    })
  })

  return {
    user: readonly(user),
    loading: readonly(loading),
    isGuest: readonly(isGuest),
    signInWithGoogle,
    continueAsGuest,
    logout
  }
}