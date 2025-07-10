export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  
  // Dynamic import for better code splitting
  const [
    { initializeApp },
    { getAuth },
    { getFirestore }
  ] = await Promise.all([
    import('firebase/app'),
    import('firebase/auth'),
    import('firebase/firestore')
  ])
  
  const firebaseConfig = {
    apiKey: config.public.firebaseApiKey as string,
    authDomain: config.public.firebaseAuthDomain as string,
    projectId: config.public.firebaseProjectId as string,
    storageBucket: config.public.firebaseStorageBucket as string,
    messagingSenderId: config.public.firebaseMessagingSenderId as string,
    appId: config.public.firebaseAppId as string
  }

  const app = initializeApp(firebaseConfig)
  const auth = getAuth(app)
  const db = getFirestore(app)

  return {
    provide: {
      firebase: {
        auth,
        db
      }
    }
  }
})