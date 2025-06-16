import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore'
export const useFirestore = () => {
  const { $firebase } = useNuxtApp()

  const createUserProfile = async (userId, userData) => {
    try {
      const userRef = doc($firebase.db, 'users', userId)
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error creating user profile:', error)
      throw error
    }
  }

  const updateUserItemCollection = async (userId, itemId, data) => {
    try {
      const collectionRef = doc($firebase.db, 'userItems', `${userId}_${itemId}`)
      await setDoc(collectionRef, {
        userId,
        itemId,
        ...data,
        updatedAt: serverTimestamp()
      }, { merge: true })
    } catch (error) {
      console.error('Error updating item collection:', error)
      throw error
    }
  }

  const getUserItemCollection = async (userId) => {
    try {
      const q = query(
        collection($firebase.db, 'userItems'),
        where('userId', '==', userId)
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error getting user item collection:', error)
      throw error
    }
  }

  const watchUserItemCollection = (userId, callback) => {
    const q = query(
      collection($firebase.db, 'userItems'),
      where('userId', '==', userId)
    )
    
    return onSnapshot(q, (querySnapshot) => {
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      callback(items)
    })
  }

  const saveUserHideoutProgress = async (userId, stationLevelKey, completed) => {
    try {
      const progressRef = doc($firebase.db, 'userHideoutProgress', userId)
      await setDoc(progressRef, {
        [stationLevelKey]: completed,
        updatedAt: serverTimestamp()
      }, { merge: true })
    } catch (error) {
      console.error('Error saving hideout progress:', error)
      throw error
    }
  }

  const getUserHideoutProgress = async (userId) => {
    try {
      const progressRef = doc($firebase.db, 'userHideoutProgress', userId)
      const docSnap = await getDoc(progressRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        delete data.updatedAt
        return data
      }
      return {}
    } catch (error) {
      console.error('Error getting hideout progress:', error)
      throw error
    }
  }

  const saveUserSettings = async (userId, settings) => {
    try {
      const settingsRef = doc($firebase.db, 'userSettings', userId)
      await setDoc(settingsRef, {
        ...settings,
        updatedAt: serverTimestamp()
      }, { merge: true })
    } catch (error) {
      console.error('Error saving user settings:', error)
      throw error
    }
  }

  const getUserSettings = async (userId) => {
    try {
      const settingsRef = doc($firebase.db, 'userSettings', userId)
      const docSnap = await getDoc(settingsRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        delete data.updatedAt
        return data
      }
      return {}
    } catch (error) {
      console.error('Error getting user settings:', error)
      throw error
    }
  }

  const watchUserSettings = (userId, callback) => {
    const settingsRef = doc($firebase.db, 'userSettings', userId)
    
    return onSnapshot(settingsRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        delete data.updatedAt
        callback(data)
      } else {
        callback({})
      }
    })
  }

  const saveUserTaskObjectives = async (userId, objectiveKey, completed) => {
    try {
      const objectivesRef = doc($firebase.db, 'userTaskObjectives', userId)
      await setDoc(objectivesRef, {
        [objectiveKey]: completed,
        updatedAt: serverTimestamp()
      }, { merge: true })
    } catch (error) {
      console.error('Error saving task objective:', error)
      throw error
    }
  }

  const getUserTaskObjectives = async (userId) => {
    try {
      const objectivesRef = doc($firebase.db, 'userTaskObjectives', userId)
      const docSnap = await getDoc(objectivesRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        delete data.updatedAt
        return data
      }
      return {}
    } catch (error) {
      console.error('Error getting task objectives:', error)
      throw error
    }
  }

  const saveCompletedTask = async (userId, taskId, completed) => {
    try {
      const tasksRef = doc($firebase.db, 'userCompletedTasks', userId)
      await setDoc(tasksRef, {
        [taskId]: completed,
        updatedAt: serverTimestamp()
      }, { merge: true })
    } catch (error) {
      console.error('Error saving completed task:', error)
      throw error
    }
  }

  const getCompletedTasks = async (userId) => {
    try {
      const tasksRef = doc($firebase.db, 'userCompletedTasks', userId)
      const docSnap = await getDoc(tasksRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        delete data.updatedAt
        return data
      }
      return {}
    } catch (error) {
      console.error('Error getting completed tasks:', error)
      throw error
    }
  }

  const reduceItemsForTask = async (userId, requirements) => {
    try {
      // Process each requirement and reduce the quantities
      for (const requirement of requirements) {
        const itemRef = doc($firebase.db, 'userItems', `${userId}_${requirement.itemId}`)
        const itemDoc = await getDoc(itemRef)
        
        if (itemDoc.exists()) {
          const currentData = itemDoc.data()
          const currentQuantity = currentData.quantity || 0
          const currentFIR = currentData.foundInRaid || 0
          
          let newQuantity = currentQuantity
          let newFIR = currentFIR
          
          if (requirement.foundInRaid) {
            // Reduce FIR items
            newFIR = Math.max(0, currentFIR - requirement.quantity)
            // Also reduce from total quantity
            newQuantity = Math.max(0, currentQuantity - requirement.quantity)
          } else {
            // Reduce any items (prioritize non-FIR)
            const nonFIRItems = currentQuantity - currentFIR
            if (nonFIRItems >= requirement.quantity) {
              // Have enough non-FIR items
              newQuantity = currentQuantity - requirement.quantity
            } else {
              // Need to use some FIR items too
              newQuantity = Math.max(0, currentQuantity - requirement.quantity)
              const firItemsUsed = requirement.quantity - nonFIRItems
              newFIR = Math.max(0, currentFIR - firItemsUsed)
            }
          }
          
          await updateDoc(itemRef, {
            quantity: newQuantity,
            foundInRaid: newFIR,
            updatedAt: serverTimestamp()
          })
        }
      }
    } catch (error) {
      console.error('Error reducing items for task:', error)
      throw error
    }
  }

  return {
    createUserProfile,
    updateUserItemCollection,
    getUserItemCollection,
    watchUserItemCollection,
    saveUserHideoutProgress,
    getUserHideoutProgress,
    saveUserSettings,
    getUserSettings,
    watchUserSettings,
    saveUserTaskObjectives,
    getUserTaskObjectives,
    saveCompletedTask,
    getCompletedTasks,
    reduceItemsForTask
  }
}