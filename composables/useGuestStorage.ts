export const useGuestStorage = () => {
  const GUEST_USER_ID = 'guest'
  const STORAGE_KEYS = {
    userItems: 'guestUserItems',
    hideoutProgress: 'guestHideoutProgress',
    settings: 'guestSettings',
    taskObjectives: 'guestTaskObjectives',
    completedTasks: 'guestCompletedTasks',
    playerLevel: 'guestPlayerLevel'
  }

  const getStorageData = (key: string) => {
    if (!process.client) return null
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error(`Error getting ${key} from storage:`, error)
      return null
    }
  }

  const setStorageData = (key: string, data: any) => {
    if (!process.client) return
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error(`Error setting ${key} in storage:`, error)
    }
  }

  const removeStorageData = (key: string) => {
    if (!process.client) return
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error)
    }
  }

  const createUserProfile = async (userId: string, userData: any) => {
    // For guest users, we don't need to store profile data
    return Promise.resolve()
  }

  const updateUserItemCollection = async (userId: string, itemId: string, data: any) => {
    const items = getStorageData(STORAGE_KEYS.userItems) || {}
    const itemKey = `${userId}_${itemId}`
    items[itemKey] = {
      userId,
      itemId,
      ...data,
      updatedAt: new Date().toISOString()
    }
    setStorageData(STORAGE_KEYS.userItems, items)
    return Promise.resolve()
  }

  const getUserItemCollection = async (userId: string) => {
    const items = getStorageData(STORAGE_KEYS.userItems) || {}
    const userItems = Object.entries(items)
      .filter(([key]) => key.startsWith(`${userId}_`))
      .map(([key, value]) => ({ id: key, ...value as any }))
    return Promise.resolve(userItems)
  }

  const watchUserItemCollection = (userId: string, callback: (items: any[]) => void) => {
    // For guest mode, we'll just call the callback once with current data
    // In a real implementation, you might want to set up a polling mechanism
    getUserItemCollection(userId).then(callback)
    
    // Return a dummy unsubscribe function
    return () => {}
  }

  const saveUserHideoutProgress = async (userId: string, stationLevelKey: string, completed: boolean) => {
    const progress = getStorageData(STORAGE_KEYS.hideoutProgress) || {}
    progress[stationLevelKey] = completed
    progress.updatedAt = new Date().toISOString()
    setStorageData(STORAGE_KEYS.hideoutProgress, progress)
    return Promise.resolve()
  }

  const getUserHideoutProgress = async (userId: string) => {
    const progress = getStorageData(STORAGE_KEYS.hideoutProgress) || {}
    delete progress.updatedAt
    return Promise.resolve(progress)
  }

  const saveUserSettings = async (userId: string, settings: any) => {
    const currentSettings = getStorageData(STORAGE_KEYS.settings) || {}
    const newSettings = {
      ...currentSettings,
      ...settings,
      updatedAt: new Date().toISOString()
    }
    setStorageData(STORAGE_KEYS.settings, newSettings)
    return Promise.resolve()
  }

  const getUserSettings = async (userId: string) => {
    const settings = getStorageData(STORAGE_KEYS.settings) || {}
    delete settings.updatedAt
    return Promise.resolve(settings)
  }

  const watchUserSettings = (userId: string, callback: (settings: any) => void) => {
    getUserSettings(userId).then(callback)
    return () => {}
  }

  const saveUserTaskObjectives = async (userId: string, objectiveKey: string, completed: boolean) => {
    const objectives = getStorageData(STORAGE_KEYS.taskObjectives) || {}
    objectives[objectiveKey] = completed
    objectives.updatedAt = new Date().toISOString()
    setStorageData(STORAGE_KEYS.taskObjectives, objectives)
    return Promise.resolve()
  }

  const getUserTaskObjectives = async (userId: string) => {
    const objectives = getStorageData(STORAGE_KEYS.taskObjectives) || {}
    delete objectives.updatedAt
    return Promise.resolve(objectives)
  }

  const saveCompletedTask = async (userId: string, taskId: string, completed: boolean) => {
    const tasks = getStorageData(STORAGE_KEYS.completedTasks) || {}
    tasks[taskId] = completed
    tasks.updatedAt = new Date().toISOString()
    setStorageData(STORAGE_KEYS.completedTasks, tasks)
    return Promise.resolve()
  }

  const getCompletedTasks = async (userId: string) => {
    const tasks = getStorageData(STORAGE_KEYS.completedTasks) || {}
    delete tasks.updatedAt
    return Promise.resolve(tasks)
  }

  const reduceItemsForTask = async (userId: string, requirements: any[]) => {
    const items = getStorageData(STORAGE_KEYS.userItems) || {}
    
    for (const requirement of requirements) {
      const itemKey = `${userId}_${requirement.itemId}`
      const item = items[itemKey]
      
      if (item) {
        const currentQuantity = item.quantity || 0
        const currentFIR = item.foundInRaid || 0
        
        let newQuantity = currentQuantity
        let newFIR = currentFIR
        
        if (requirement.foundInRaid) {
          newFIR = Math.max(0, currentFIR - requirement.quantity)
          newQuantity = Math.max(0, currentQuantity - requirement.quantity)
        } else {
          const nonFIRItems = currentQuantity - currentFIR
          if (nonFIRItems >= requirement.quantity) {
            newQuantity = currentQuantity - requirement.quantity
          } else {
            newQuantity = Math.max(0, currentQuantity - requirement.quantity)
            const firItemsUsed = requirement.quantity - nonFIRItems
            newFIR = Math.max(0, currentFIR - firItemsUsed)
          }
        }
        
        items[itemKey] = {
          ...item,
          quantity: newQuantity,
          foundInRaid: newFIR,
          updatedAt: new Date().toISOString()
        }
      }
    }
    
    setStorageData(STORAGE_KEYS.userItems, items)
    return Promise.resolve()
  }

  const reduceItemsForHideout = async (userId: string, requirements: any[]) => {
    const items = getStorageData(STORAGE_KEYS.userItems) || {}
    
    for (const requirement of requirements) {
      const itemKey = `${userId}_${requirement.itemId}`
      const item = items[itemKey]
      
      if (item) {
        const currentQuantity = item.quantity || 0
        const currentFIR = item.foundInRaid || 0
        
        const newFIR = Math.max(0, currentFIR - requirement.quantity)
        const newQuantity = Math.max(0, currentQuantity - requirement.quantity)
        
        items[itemKey] = {
          ...item,
          quantity: newQuantity,
          foundInRaid: newFIR,
          updatedAt: new Date().toISOString()
        }
      }
    }
    
    setStorageData(STORAGE_KEYS.userItems, items)
    return Promise.resolve()
  }

  const savePlayerLevel = async (userId: string, level: number) => {
    setStorageData(STORAGE_KEYS.playerLevel, { level, updatedAt: new Date().toISOString() })
    return Promise.resolve()
  }

  const getPlayerLevel = async (userId: string) => {
    const data = getStorageData(STORAGE_KEYS.playerLevel)
    return Promise.resolve(data?.level || 1)
  }

  const resetAllUserData = async (userId: string) => {
    Object.values(STORAGE_KEYS).forEach(key => {
      removeStorageData(key)
    })
    return Promise.resolve()
  }

  const clearAllGuestData = () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      removeStorageData(key)
    })
  }

  return {
    GUEST_USER_ID,
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
    reduceItemsForTask,
    reduceItemsForHideout,
    savePlayerLevel,
    getPlayerLevel,
    resetAllUserData,
    clearAllGuestData
  }
}