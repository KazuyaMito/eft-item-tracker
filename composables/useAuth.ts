import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth'

export const useAuth = () => {
  const { $firebase } = useNuxtApp()
  const user = ref(null)
  const loading = ref(true)

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup($firebase.auth, provider)
      return result.user
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut($firebase.auth)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  onMounted(() => {
    onAuthStateChanged($firebase.auth, (authUser) => {
      user.value = authUser
      loading.value = false
    })
  })

  return {
    user: readonly(user),
    loading: readonly(loading),
    signInWithGoogle,
    logout
  }
}