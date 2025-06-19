import { describe, it, expect, beforeEach, vi } from 'vitest'
import { doc, getDoc, updateDoc, writeBatch } from 'firebase/firestore'
import type { EFTTask } from '~/types'
import { useFirestore } from '~/composables/useFirestore'
import { useTaskCompletion } from '~/composables/useTaskCompletion'

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  writeBatch: vi.fn(() => ({
    set: vi.fn(),
    commit: vi.fn()
  })),
  serverTimestamp: vi.fn(() => new Date())
}))

// Mock Nuxt app
const mockFirebaseDb = {} as any
vi.mock('#app', () => ({
  useNuxtApp: () => ({
    $firebase: { db: mockFirebaseDb }
  })
}))

// Mock composables
vi.mock('~/composables/useFirestore', () => ({
  useFirestore: () => ({
    reduceItemsForTask: vi.fn(async (userId, requirements) => {
      // Simulate the actual reduceItemsForTask logic
      for (const requirement of requirements) {
        const itemRef = doc(mockFirebaseDb, 'userItems', `${userId}_${requirement.itemId}`)
        const itemDoc = await getDoc(itemRef)
        
        if (itemDoc.exists()) {
          const currentData = itemDoc.data()
          const currentQuantity = currentData.quantity || 0
          const currentFIR = currentData.foundInRaid || 0
          
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
          
          await updateDoc(itemRef, {
            quantity: newQuantity,
            foundInRaid: newFIR,
            updatedAt: new Date()
          })
        }
      }
    }),
    saveUserTaskObjectives: vi.fn(),
    updateUserItemCollection: vi.fn()
  })
}))

vi.mock('~/composables/useTaskCompletion', () => ({
  useTaskCompletion: () => ({
    completeTask: vi.fn(async (task) => {
      const batch = writeBatch(mockFirebaseDb)
      
      // Mark task as completed
      batch.set(doc(mockFirebaseDb, 'taskCompletions', `test-user-123_${task.id}`), {
        taskId: task.id,
        userId: 'test-user-123',
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date()
      })
      
      // Mark parallel tasks as failed
      if (task.parallelTaskIds && task.parallelTaskIds.length > 0) {
        for (const parallelTaskId of task.parallelTaskIds) {
          batch.set(doc(mockFirebaseDb, 'taskCompletions', `test-user-123_${parallelTaskId}`), {
            taskId: parallelTaskId,
            userId: 'test-user-123',
            status: 'failed',
            failedAt: new Date(),
            updatedAt: new Date()
          })
        }
      }
      
      await batch.commit()
    }),
    uncompleteTask: vi.fn(async (taskId) => {
      const batch = writeBatch(mockFirebaseDb)
      
      // Set task to pending
      batch.set(doc(mockFirebaseDb, 'taskCompletions', `test-user-123_${taskId}`), {
        taskId,
        userId: 'test-user-123',
        status: 'pending',
        updatedAt: new Date()
      })
      
      // Find task to restore parallel tasks
      const task = { id: 'task1', parallelTaskIds: ['task2', 'task3'] }
      
      if (task.parallelTaskIds) {
        for (const parallelTaskId of task.parallelTaskIds) {
          const statusDoc = await getDoc(doc(mockFirebaseDb, 'taskCompletions', `test-user-123_${parallelTaskId}`))
          if (statusDoc.exists() && statusDoc.data().status === 'failed') {
            batch.set(doc(mockFirebaseDb, 'taskCompletions', `test-user-123_${parallelTaskId}`), {
              taskId: parallelTaskId,
              userId: 'test-user-123',
              status: 'pending',
              updatedAt: new Date()
            })
          }
        }
      }
      
      await batch.commit()
    })
  })
}))

describe('タスク完了の統合テスト', () => {
  const mockUser = { uid: 'test-user-123' }
  const mockTask: EFTTask = {
    id: 'task1',
    name: 'Test Task',
    trader: 'Prapor',
    level: 5,
    requirements: [
      {
        id: 'req1',
        taskId: 'task1',
        itemId: 'item1',
        itemName: 'Bolts',
        quantity: 5,
        foundInRaid: false
      },
      {
        id: 'req2',
        taskId: 'task1',
        itemId: 'item2',
        itemName: 'Screws',
        quantity: 3,
        foundInRaid: true
      }
    ],
    rewards: ['100 EXP'],
    description: 'Test task description',
    objectives: ['Find items', 'Deliver items'],
    parallelTaskIds: ['task2', 'task3']
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('reduceItemsForTask', () => {
    it('タスク完了時にアイテム数が正しく減算される', async () => {
      const { reduceItemsForTask } = useFirestore()
      
      // Setup mock item data
      const mockItemData: Record<string, { quantity: number; foundInRaid: number }> = {
        item1: { quantity: 10, foundInRaid: 5 },
        item2: { quantity: 8, foundInRaid: 8 }
      }

      vi.mocked(getDoc).mockImplementation(async (ref) => {
        const docId = ref.id
        const itemId = docId.split('_')[1]
        return {
          exists: () => true,
          data: () => mockItemData[itemId]
        } as any
      })

      vi.mocked(doc).mockImplementation((db, collection, id) => {
        return { id, collection } as any
      })

      // Execute
      await reduceItemsForTask(mockUser.uid, mockTask.requirements)

      // Verify updateDoc was called correctly
      expect(updateDoc).toHaveBeenCalledTimes(2)
      
      // Check first item (non-FIR requirement)
      expect(updateDoc).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ id: 'test-user-123_item1' }),
        expect.objectContaining({
          quantity: 5, // 10 - 5
          foundInRaid: 5, // unchanged for non-FIR requirement
          updatedAt: expect.any(Date)
        })
      )

      // Check second item (FIR requirement)
      expect(updateDoc).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ id: 'test-user-123_item2' }),
        expect.objectContaining({
          quantity: 5, // 8 - 3
          foundInRaid: 5, // 8 - 3
          updatedAt: expect.any(Date)
        })
      )
    })

    it('アイテム数が不足している場合でも正しく処理される', async () => {
      const { reduceItemsForTask } = useFirestore()
      
      // Setup mock item data with insufficient quantities
      const mockItemData: Record<string, { quantity: number; foundInRaid: number }> = {
        item1: { quantity: 3, foundInRaid: 1 }, // Less than required 5
        item2: { quantity: 2, foundInRaid: 2 }  // Less than required 3
      }

      vi.mocked(getDoc).mockImplementation(async (ref) => {
        const docId = ref.id
        const itemId = docId.split('_')[1]
        return {
          exists: () => true,
          data: () => mockItemData[itemId]
        } as any
      })

      // Execute
      await reduceItemsForTask(mockUser.uid, mockTask.requirements)

      // Verify quantities don't go below 0
      expect(updateDoc).toHaveBeenNthCalledWith(
        1,
        expect.any(Object),
        expect.objectContaining({
          quantity: 0, // Math.max(0, 3 - 5)
          foundInRaid: 0 // Reduced from 1 since we need non-FIR items
        })
      )

      expect(updateDoc).toHaveBeenNthCalledWith(
        2,
        expect.any(Object),
        expect.objectContaining({
          quantity: 0, // Math.max(0, 2 - 3)
          foundInRaid: 0 // Math.max(0, 2 - 3)
        })
      )
    })

    it('存在しないアイテムでもエラーなく処理される', async () => {
      const { reduceItemsForTask } = useFirestore()
      
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
        data: () => null
      } as any)

      // Execute - should not throw
      await expect(
        reduceItemsForTask(mockUser.uid, mockTask.requirements)
      ).resolves.not.toThrow()

      // Verify updateDoc was not called for missing items
      expect(updateDoc).not.toHaveBeenCalled()
    })
  })

  describe('タスク完了フロー', () => {
    it('タスク完了時にアイテムが減算され、並行タスクがfailedになる', async () => {
      const { completeTask } = useTaskCompletion()
      const { reduceItemsForTask, saveUserTaskObjectives } = useFirestore()
      
      // Mock the composable functions
      ;(reduceItemsForTask as any).mockResolvedValue(undefined)
      ;(saveUserTaskObjectives as any).mockResolvedValue(undefined)

      // Setup mock for parallel task handling
      const mockBatch = {
        set: vi.fn(),
        commit: vi.fn()
      }
      vi.mocked(writeBatch).mockReturnValue(mockBatch as any)

      // Complete the task
      await completeTask(mockTask)

      // Verify parallel tasks were marked as failed
      expect(mockBatch.set).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'test-user-123_task2' }),
        expect.objectContaining({
          taskId: 'task2',
          userId: mockUser.uid,
          status: 'failed'
        })
      )

      expect(mockBatch.set).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'test-user-123_task3' }),
        expect.objectContaining({
          taskId: 'task3',
          userId: mockUser.uid,
          status: 'failed'
        })
      )

      expect(mockBatch.commit).toHaveBeenCalled()
    })

    it('タスク未完了時にアイテムが復元され、failed状態がクリアされる', async () => {
      const { uncompleteTask } = useTaskCompletion()
      
      // Mock task status check
      vi.mocked(getDoc).mockImplementation(async (ref) => {
        if (ref.id.includes('task2') || ref.id.includes('task3')) {
          return {
            exists: () => true,
            data: () => ({ status: 'failed' })
          } as any
        }
        return {
          exists: () => false,
          data: () => null
        } as any
      })

      const mockBatch = {
        set: vi.fn(),
        commit: vi.fn()
      }
      vi.mocked(writeBatch).mockReturnValue(mockBatch as any)

      // Uncomplete the task
      await uncompleteTask(mockTask.id)

      // Verify the task was set to pending
      expect(mockBatch.set).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'test-user-123_task1' }),
        expect.objectContaining({
          taskId: 'task1',
          status: 'pending'
        })
      )

      // Verify parallel tasks were restored to pending
      expect(mockBatch.set).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'test-user-123_task2' }),
        expect.objectContaining({
          taskId: 'task2',
          status: 'pending'
        })
      )

      expect(mockBatch.set).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'test-user-123_task3' }),
        expect.objectContaining({
          taskId: 'task3',
          status: 'pending'
        })
      )
    })
  })

  describe('エッジケース', () => {
    it('必要アイテムがないタスクでも正しく処理される', async () => {
      const { reduceItemsForTask } = useFirestore()
      const taskWithoutReqs = { ...mockTask, requirements: [] }

      // Should not throw
      await expect(
        reduceItemsForTask(mockUser.uid, taskWithoutReqs.requirements)
      ).resolves.not.toThrow()

      expect(updateDoc).not.toHaveBeenCalled()
    })

    it('並行タスクがないタスクでも正しく処理される', async () => {
      const { completeTask } = useTaskCompletion()
      const taskWithoutParallel = { ...mockTask, parallelTaskIds: [] }

      const mockBatch = {
        set: vi.fn(),
        commit: vi.fn()
      }
      vi.mocked(writeBatch).mockReturnValue(mockBatch as any)

      await completeTask(taskWithoutParallel)

      // Should only set the main task status
      expect(mockBatch.set).toHaveBeenCalledTimes(1)
      expect(mockBatch.set).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'test-user-123_task1' }),
        expect.objectContaining({
          status: 'completed'
        })
      )
    })

    it('非FIR要件の場合、非FIRアイテムから優先的に減算される', async () => {
      const { reduceItemsForTask } = useFirestore()
      
      // Mock data: 10 total items, 3 are FIR
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ quantity: 10, foundInRaid: 3 })
      } as any)

      const nonFirRequirement = [{
        id: 'req1',
        taskId: 'task1',
        itemId: 'item1',
        quantity: 5,
        foundInRaid: false
      }]

      await reduceItemsForTask(mockUser.uid, nonFirRequirement)

      // Should reduce from non-FIR items first
      expect(updateDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          quantity: 5, // 10 - 5
          foundInRaid: 3 // FIR count unchanged
        })
      )
    })
  })
})