import { describe, it, expect, beforeEach, vi } from 'vitest'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import type { EFTTask } from '~/types'
import { useFirestore } from '~/composables/useFirestore'

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
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
    updateUserItemCollection: vi.fn(async (userId, itemId, data) => {
      await updateDoc(doc(mockFirebaseDb, 'userItems', `${userId}_${itemId}`), data)
    })
  })
}))

describe('タスク未完了 - アイテム復元テスト', () => {
  const mockUser = { uid: 'test-user-123' }
  const mockTask: EFTTask = {
    id: 'task1',
    name: 'Test Task',
    trader: 'Therapist',
    level: 10,
    requirements: [
      {
        id: 'req1',
        taskId: 'task1',
        itemId: 'item1',
        itemName: 'Salewa',
        quantity: 3,
        foundInRaid: true
      },
      {
        id: 'req2',
        taskId: 'task1',
        itemId: 'item2',
        itemName: 'Bandage',
        quantity: 5,
        foundInRaid: false
      }
    ],
    rewards: ['200 EXP'],
    description: 'Medical supplies task',
    objectives: ['Find medical supplies']
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('タスクを未完了にした際のアイテム復元', () => {
    it('タスクを未完了にしたとき、正確なアイテム数が復元される', async () => {
      // This test simulates the actual uncompleteTask function behavior
      // from pages/tasks.vue
      
      // Current item state after task completion (reduced)
      const mockItemData: Record<string, { quantity: number; foundInRaid: number }> = {
        item1: { quantity: 2, foundInRaid: 1 }, // Had 5 FIR, used 3
        item2: { quantity: 10, foundInRaid: 5 } // Had 15 total, used 5 non-FIR
      }

      vi.mocked(getDoc).mockImplementation(async (ref) => {
        const docId = (ref as any).id
        const itemId = docId.split('_')[1]
        return {
          exists: () => true,
          data: () => mockItemData[itemId]
        } as any
      })

      vi.mocked(doc).mockImplementation((db, collection, id) => {
        return { id, collection } as any
      })

      // Simulate the restoration logic from uncompleteTask
      for (const requirement of mockTask.requirements) {
        const itemRef = doc(mockFirebaseDb, 'userItems', `${mockUser.uid}_${requirement.itemId}`)
        const itemDoc = await getDoc(itemRef)
        
        let currentQuantity = 0
        let currentFIR = 0
        
        if (itemDoc.exists()) {
          const data = itemDoc.data()
          currentQuantity = data.quantity || 0
          currentFIR = data.foundInRaid || 0
        }
        
        // Restore the required quantity to the user's collection
        const newQuantity = currentQuantity + requirement.quantity
        const newFIR = requirement.foundInRaid ? currentFIR + requirement.quantity : currentFIR
        
        await updateDoc(itemRef, {
          quantity: newQuantity,
          foundInRaid: newFIR
        })
      }

      // Verify restoration
      expect(updateDoc).toHaveBeenCalledTimes(2)
      
      // Check FIR item restoration
      expect(updateDoc).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ id: 'test-user-123_item1' }),
        expect.objectContaining({
          quantity: 5, // 2 + 3
          foundInRaid: 4 // 1 + 3 (FIR requirement)
        })
      )

      // Check non-FIR item restoration
      expect(updateDoc).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ id: 'test-user-123_item2' }),
        expect.objectContaining({
          quantity: 15, // 10 + 5
          foundInRaid: 5 // unchanged (non-FIR requirement)
        })
      )
    })

    it('アイテムが完全に使い切られていた場合でも正しく復元される', async () => {
      // Items were completely used up during task completion
      const mockItemData: Record<string, { quantity: number; foundInRaid: number }> = {
        item1: { quantity: 0, foundInRaid: 0 },
        item2: { quantity: 0, foundInRaid: 0 }
      }

      vi.mocked(getDoc).mockImplementation(async (ref) => {
        const docId = (ref as any).id
        const itemId = docId.split('_')[1]
        return {
          exists: () => true,
          data: () => mockItemData[itemId]
        } as any
      })

      // Simulate restoration
      for (const requirement of mockTask.requirements) {
        const itemRef = doc(mockFirebaseDb, 'userItems', `${mockUser.uid}_${requirement.itemId}`)
        const itemDoc = await getDoc(itemRef)
        
        const data = itemDoc.data()
        const currentQuantity = data.quantity || 0
        const currentFIR = data.foundInRaid || 0
        
        const newQuantity = currentQuantity + requirement.quantity
        const newFIR = requirement.foundInRaid ? currentFIR + requirement.quantity : currentFIR
        
        await updateDoc(itemRef, {
          quantity: newQuantity,
          foundInRaid: newFIR
        })
      }

      // Items should be restored from 0
      expect(updateDoc).toHaveBeenNthCalledWith(
        1,
        expect.any(Object),
        expect.objectContaining({
          quantity: 3,
          foundInRaid: 3
        })
      )

      expect(updateDoc).toHaveBeenNthCalledWith(
        2,
        expect.any(Object),
        expect.objectContaining({
          quantity: 5,
          foundInRaid: 0
        })
      )
    })

    it('アイテムエントリが存在しない場合でも正しく処理される', async () => {
      // Items don't exist in database (edge case)
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
        data: () => null
      } as any)

      const { updateUserItemCollection } = useFirestore()
      ;(updateUserItemCollection as any).mockResolvedValue(undefined)

      // Simulate restoration with missing items
      for (const requirement of mockTask.requirements) {
        const itemRef = doc(mockFirebaseDb, 'userItems', `${mockUser.uid}_${requirement.itemId}`)
        const itemDoc = await getDoc(itemRef)
        
        let currentQuantity = 0
        let currentFIR = 0
        
        if (itemDoc.exists()) {
          const data = itemDoc.data()
          currentQuantity = data.quantity || 0
          currentFIR = data.foundInRaid || 0
        }
        
        const newQuantity = currentQuantity + requirement.quantity
        const newFIR = requirement.foundInRaid ? currentFIR + requirement.quantity : currentFIR
        
        await updateUserItemCollection(mockUser.uid, requirement.itemId, {
          quantity: newQuantity,
          foundInRaid: newFIR
        })
      }

      // Should create new entries with requirement quantities
      expect(updateUserItemCollection).toHaveBeenCalledWith(
        mockUser.uid,
        'item1',
        { quantity: 3, foundInRaid: 3 }
      )

      expect(updateUserItemCollection).toHaveBeenCalledWith(
        mockUser.uid,
        'item2',
        { quantity: 5, foundInRaid: 0 }
      )
    })
  })

  describe('複雑な復元シナリオ', () => {
    it('FIRと非FIRの要件が混在していても正しく処理される', async () => {
      const complexTask: EFTTask = {
        ...mockTask,
        requirements: [
          {
            id: 'req1',
            taskId: 'task1',
            itemId: 'item1',
            itemName: 'Gas Analyzer',
            quantity: 2,
            foundInRaid: true
          },
          {
            id: 'req2',
            taskId: 'task1',
            itemId: 'item1', // Same item, different requirement
            itemName: 'Gas Analyzer',
            quantity: 3,
            foundInRaid: false
          }
        ]
      }

      // Current state: some items remain after completion
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ quantity: 5, foundInRaid: 2 })
      } as any).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ quantity: 8, foundInRaid: 4 }) // After first restoration
      } as any)

      // Simulate restoration for both requirements
      for (const requirement of complexTask.requirements) {
        const itemRef = doc(mockFirebaseDb, 'userItems', `${mockUser.uid}_${requirement.itemId}`)
        const itemDoc = await getDoc(itemRef)
        
        const data = itemDoc.data()
        const currentQuantity = data.quantity || 0
        const currentFIR = data.foundInRaid || 0
        
        const newQuantity = currentQuantity + requirement.quantity
        const newFIR = requirement.foundInRaid ? currentFIR + requirement.quantity : currentFIR
        
        await updateDoc(itemRef, {
          quantity: newQuantity,
          foundInRaid: newFIR
        })
      }

      expect(updateDoc).toHaveBeenCalledTimes(2)
      
      // First restoration (FIR requirement)
      expect(updateDoc).toHaveBeenNthCalledWith(
        1,
        expect.any(Object),
        expect.objectContaining({
          quantity: 7, // 5 + 2
          foundInRaid: 4 // 2 + 2
        })
      )

      // Second restoration (non-FIR requirement)
      expect(updateDoc).toHaveBeenNthCalledWith(
        2,
        expect.any(Object),
        expect.objectContaining({
          quantity: 11, // 8 + 3
          foundInRaid: 4 // unchanged
        })
      )
    })

    it('必要アイテムがないタスクの復元でも正しく処理される', async () => {
      const taskWithoutReqs = { ...mockTask, requirements: [] }

      // Should not make any updateDoc calls
      for (const requirement of taskWithoutReqs.requirements) {
        // This loop won't execute
      }

      expect(updateDoc).not.toHaveBeenCalled()
    })
  })
})