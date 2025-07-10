export const useCurrentUser = () => {
  const { user, isGuest } = useAuth()
  const { GUEST_USER_ID } = useGuestStorage()
  
  const currentUserId = computed(() => {
    if (user.value?.uid) {
      return user.value.uid
    }
    if (isGuest.value) {
      return GUEST_USER_ID
    }
    return null
  })
  
  const isLoggedIn = computed(() => {
    return user.value?.uid || isGuest.value
  })
  
  return {
    currentUserId,
    isLoggedIn,
    user,
    isGuest
  }
}