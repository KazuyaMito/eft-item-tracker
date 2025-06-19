import { doc, setDoc, getDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore'
import type { EFTTask } from '~/types'
import { eftTasks } from '~/data/tasks'

export interface TaskCompletionStatus {
  taskId: string
  userId: string
  status: 'pending' | 'completed' | 'failed'
  completedAt?: Date
  failedAt?: Date
  updatedAt: Date
}

export const useTaskCompletion = () => {
  const { $firebase } = useNuxtApp()
  const { user } = useAuth()
  
  const taskCompletionStatuses = ref<Record<string, TaskCompletionStatus>>({})
  
  const getTaskStatus = async (taskId: string): Promise<TaskCompletionStatus | null> => {
    if (!user.value) return null
    
    try {
      const docRef = doc($firebase.db, 'taskCompletions', `${user.value.uid}_${taskId}`)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return docSnap.data() as TaskCompletionStatus
      }
      return null
    } catch (error) {
      console.error('Error getting task status:', error)
      return null
    }
  }
  
  const getUserTaskStatuses = async (): Promise<Record<string, TaskCompletionStatus>> => {
    if (!user.value) return {}
    
    try {
      const q = query(
        collection($firebase.db, 'taskCompletions'),
        where('userId', '==', user.value.uid)
      )
      const querySnapshot = await getDocs(q)
      
      const statuses: Record<string, TaskCompletionStatus> = {}
      querySnapshot.forEach((doc) => {
        const data = doc.data() as TaskCompletionStatus
        statuses[data.taskId] = data
      })
      
      taskCompletionStatuses.value = statuses
      return statuses
    } catch (error) {
      console.error('Error getting user task statuses:', error)
      return {}
    }
  }
  
  const completeTask = async (task: EFTTask) => {
    if (!user.value) return
    
    const batch = writeBatch($firebase.db)
    const now = new Date()
    
    // Mark this task as completed
    const taskDocRef = doc($firebase.db, 'taskCompletions', `${user.value.uid}_${task.id}`)
    batch.set(taskDocRef, {
      taskId: task.id,
      userId: user.value.uid,
      status: 'completed',
      completedAt: now,
      updatedAt: now
    } as TaskCompletionStatus)
    
    // Mark parallel tasks as failed if they exist
    if (task.parallelTaskIds && task.parallelTaskIds.length > 0) {
      for (const parallelTaskId of task.parallelTaskIds) {
        const parallelDocRef = doc($firebase.db, 'taskCompletions', `${user.value.uid}_${parallelTaskId}`)
        
        // Only mark as failed if not already completed
        const existingStatus = await getTaskStatus(parallelTaskId)
        if (!existingStatus || existingStatus.status !== 'completed') {
          batch.set(parallelDocRef, {
            taskId: parallelTaskId,
            userId: user.value.uid,
            status: 'failed',
            failedAt: now,
            updatedAt: now
          } as TaskCompletionStatus)
        }
      }
    }
    
    try {
      await batch.commit()
      // Refresh the local cache
      await getUserTaskStatuses()
    } catch (error) {
      console.error('Error completing task:', error)
    }
  }
  
  const uncompleteTask = async (taskId: string) => {
    if (!user.value) return
    
    const batch = writeBatch($firebase.db)
    const now = new Date()
    
    try {
      // Set the uncompleted task back to pending
      const taskDocRef = doc($firebase.db, 'taskCompletions', `${user.value.uid}_${taskId}`)
      batch.set(taskDocRef, {
        taskId,
        userId: user.value.uid,
        status: 'pending',
        updatedAt: now
      } as TaskCompletionStatus)
      
      // Find the task to get its parallel tasks
      const task = eftTasks.find(t => t.id === taskId)
      
      // Restore parallel tasks that were marked as 'failed' back to 'pending'
      if (task && task.parallelTaskIds && task.parallelTaskIds.length > 0) {
        for (const parallelTaskId of task.parallelTaskIds) {
          const parallelDocRef = doc($firebase.db, 'taskCompletions', `${user.value.uid}_${parallelTaskId}`)
          
          // Only restore tasks that are currently failed
          const existingStatus = await getTaskStatus(parallelTaskId)
          if (existingStatus && existingStatus.status === 'failed') {
            batch.set(parallelDocRef, {
              taskId: parallelTaskId,
              userId: user.value.uid,
              status: 'pending',
              updatedAt: now
            } as TaskCompletionStatus)
          }
        }
      }
      
      await batch.commit()
      
      // Refresh the local cache
      await getUserTaskStatuses()
    } catch (error) {
      console.error('Error uncompleting task:', error)
    }
  }
  
  const getTaskStatusInfo = (taskId: string) => {
    return computed(() => taskCompletionStatuses.value[taskId] || null)
  }
  
  // Load task statuses when user is authenticated
  watch(user, async (newUser) => {
    if (newUser) {
      await getUserTaskStatuses()
    } else {
      taskCompletionStatuses.value = {}
    }
  }, { immediate: true })
  
  return {
    taskCompletionStatuses: readonly(taskCompletionStatuses),
    getTaskStatus,
    getUserTaskStatuses,
    completeTask,
    uncompleteTask,
    getTaskStatusInfo
  }
}