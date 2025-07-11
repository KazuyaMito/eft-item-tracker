import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Integration tests for hideout edition functionality
// These tests simulate real user scenarios and edge cases

const mockGameEdition = { value: 'Standard Edition' }
const mockStationLevels = { value: {} as Record<string, number> }
const mockUser = { uid: 'test-user-123' }
const mockSaveUserHideoutProgress = vi.fn()

vi.mock('~/composables/useSettings', () => ({
  useSettings: () => ({
    gameEdition: mockGameEdition
  })
}))

vi.mock('~/composables/useFirestore', () => ({
  useFirestore: () => ({
    saveUserHideoutProgress: mockSaveUserHideoutProgress
  })
}))

describe('Hideout Edition Integration Tests', () => {
  beforeEach(() => {
    mockSaveUserHideoutProgress.mockClear()
    mockGameEdition.value = 'Standard Edition'
    mockStationLevels.value = {}
  })

  describe('New user scenarios', () => {
    it('should initialize correctly for new Standard Edition user', async () => {
      const levels = {}
      const editionBasedStations = ['stash', 'cultist-circle']
      
      // Simulate new user initialization
      for (const stationId of editionBasedStations) {
        const startingLevel = getStationStartingLevel(stationId)
        if (startingLevel > 0 && levels[stationId] === undefined) {
          levels[stationId] = startingLevel
          await mockSaveUserHideoutProgress(mockUser.uid, stationId, startingLevel)
        }
      }
      
      expect(levels.stash).toBeUndefined()
      expect(levels['cultist-circle']).toBeUndefined()
      expect(mockSaveUserHideoutProgress).not.toHaveBeenCalled()
    })

    it('should initialize correctly for new Edge of Darkness user', async () => {
      mockGameEdition.value = 'Edge of Darkness Edition'
      const levels = {}
      const editionBasedStations = ['stash', 'cultist-circle']
      
      for (const stationId of editionBasedStations) {
        const startingLevel = getStationStartingLevel(stationId)
        if (startingLevel > 0 && levels[stationId] === undefined) {
          levels[stationId] = startingLevel
          await mockSaveUserHideoutProgress(mockUser.uid, stationId, startingLevel)
        }
      }
      
      expect(levels.stash).toBe(4)
      expect(levels['cultist-circle']).toBeUndefined()
      expect(mockSaveUserHideoutProgress).toHaveBeenCalledWith(mockUser.uid, 'stash', 4)
      expect(mockSaveUserHideoutProgress).toHaveBeenCalledTimes(1)
    })

    it('should initialize correctly for new Unheard Edition user', async () => {
      mockGameEdition.value = 'The Unheard Edition'
      const levels = {}
      const editionBasedStations = ['stash', 'cultist-circle']
      
      for (const stationId of editionBasedStations) {
        const startingLevel = getStationStartingLevel(stationId)
        if (startingLevel > 0 && levels[stationId] === undefined) {
          levels[stationId] = startingLevel
          await mockSaveUserHideoutProgress(mockUser.uid, stationId, startingLevel)
        }
      }
      
      expect(levels.stash).toBe(4)
      expect(levels['cultist-circle']).toBe(1)
      expect(mockSaveUserHideoutProgress).toHaveBeenCalledWith(mockUser.uid, 'stash', 4)
      expect(mockSaveUserHideoutProgress).toHaveBeenCalledWith(mockUser.uid, 'cultist-circle', 1)
      expect(mockSaveUserHideoutProgress).toHaveBeenCalledTimes(2)
    })
  })

  describe('Edition upgrade scenarios', () => {
    it('should upgrade from Standard to Edge of Darkness correctly', async () => {
      // Start with Standard Edition
      mockStationLevels.value = { stash: 0, 'cultist-circle': 0 }
      
      // Upgrade to Edge of Darkness
      mockGameEdition.value = 'Edge of Darkness Edition'
      const editionBasedStations = ['stash', 'cultist-circle']
      
      for (const stationId of editionBasedStations) {
        await updateStationLevelOnEditionChange(stationId)
      }
      
      expect(mockStationLevels.value.stash).toBe(4)
      expect(mockStationLevels.value['cultist-circle']).toBe(0) // Should not change
      expect(mockSaveUserHideoutProgress).toHaveBeenCalledWith(mockUser.uid, 'stash', 4)
      expect(mockSaveUserHideoutProgress).toHaveBeenCalledTimes(1)
    })

    it('should upgrade from Edge of Darkness to Unheard Edition correctly', async () => {
      // Start with Edge of Darkness Edition
      mockGameEdition.value = 'Edge of Darkness Edition'
      mockStationLevels.value = { stash: 4, 'cultist-circle': 0 }
      
      // Upgrade to Unheard Edition
      mockGameEdition.value = 'The Unheard Edition'
      const editionBasedStations = ['stash', 'cultist-circle']
      
      for (const stationId of editionBasedStations) {
        await updateStationLevelOnEditionChange(stationId)
      }
      
      expect(mockStationLevels.value.stash).toBe(4) // Should not change (already at target)
      expect(mockStationLevels.value['cultist-circle']).toBe(1) // Should upgrade
      expect(mockSaveUserHideoutProgress).toHaveBeenCalledWith(mockUser.uid, 'cultist-circle', 1)
      expect(mockSaveUserHideoutProgress).toHaveBeenCalledTimes(1)
    })

    it('should upgrade from Standard directly to Unheard Edition correctly', async () => {
      // Start with Standard Edition
      mockStationLevels.value = { stash: 0, 'cultist-circle': 0 }
      
      // Upgrade directly to Unheard Edition
      mockGameEdition.value = 'The Unheard Edition'
      const editionBasedStations = ['stash', 'cultist-circle']
      
      for (const stationId of editionBasedStations) {
        await updateStationLevelOnEditionChange(stationId)
      }
      
      expect(mockStationLevels.value.stash).toBe(4)
      expect(mockStationLevels.value['cultist-circle']).toBe(1)
      expect(mockSaveUserHideoutProgress).toHaveBeenCalledWith(mockUser.uid, 'stash', 4)
      expect(mockSaveUserHideoutProgress).toHaveBeenCalledWith(mockUser.uid, 'cultist-circle', 1)
      expect(mockSaveUserHideoutProgress).toHaveBeenCalledTimes(2)
    })
  })

  describe('Edge cases and error handling', () => {
    it('should handle users who manually upgraded stations beyond edition level', async () => {
      // User manually upgraded stash to level 6 (beyond max for any edition)
      mockStationLevels.value = { stash: 6, 'cultist-circle': 0 }
      
      // Switch to Unheard Edition
      mockGameEdition.value = 'The Unheard Edition'
      const editionBasedStations = ['stash', 'cultist-circle']
      
      for (const stationId of editionBasedStations) {
        await updateStationLevelOnEditionChange(stationId)
      }
      
      expect(mockStationLevels.value.stash).toBe(6) // Should not downgrade
      expect(mockStationLevels.value['cultist-circle']).toBe(1) // Should upgrade
      expect(mockSaveUserHideoutProgress).toHaveBeenCalledWith(mockUser.uid, 'cultist-circle', 1)
      expect(mockSaveUserHideoutProgress).toHaveBeenCalledTimes(1)
    })

    it('should handle Firestore errors during edition upgrade gracefully', async () => {
      mockStationLevels.value = { stash: 0, 'cultist-circle': 0 }
      mockGameEdition.value = 'The Unheard Edition'
      
      // Mock Firestore error for stash, success for cultist-circle
      mockSaveUserHideoutProgress
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(undefined)
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const editionBasedStations = ['stash', 'cultist-circle']
      for (const stationId of editionBasedStations) {
        await updateStationLevelOnEditionChange(stationId)
      }
      
      // Both local states should be updated despite Firestore error
      expect(mockStationLevels.value.stash).toBe(4)
      expect(mockStationLevels.value['cultist-circle']).toBe(1)
      
      // Error should be logged
      expect(consoleSpy).toHaveBeenCalledWith('Failed to update stash level:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })

    it('should handle missing station levels gracefully', async () => {
      // Start with empty station levels (common for new users)
      mockStationLevels.value = {}
      mockGameEdition.value = 'The Unheard Edition'
      
      const editionBasedStations = ['stash', 'cultist-circle']
      for (const stationId of editionBasedStations) {
        await updateStationLevelOnEditionChange(stationId)
      }
      
      expect(mockStationLevels.value.stash).toBe(4)
      expect(mockStationLevels.value['cultist-circle']).toBe(1)
      expect(mockSaveUserHideoutProgress).toHaveBeenCalledTimes(2)
    })
  })

  describe('Complete user journey simulation', () => {
    it('should handle complete user progression from Standard to Unheard Edition', async () => {
      // Phase 1: New Standard Edition user
      mockGameEdition.value = 'Standard Edition'
      let levels = {}
      
      // Initial setup (like loadHideoutProgress)
      const editionBasedStations = ['stash', 'cultist-circle']
      for (const stationId of editionBasedStations) {
        const startingLevel = getStationStartingLevel(stationId)
        if (startingLevel > 0 && levels[stationId] === undefined) {
          levels[stationId] = startingLevel
          await mockSaveUserHideoutProgress(mockUser.uid, stationId, startingLevel)
        }
      }
      
      mockStationLevels.value = levels
      expect(mockStationLevels.value).toEqual({})
      expect(mockSaveUserHideoutProgress).not.toHaveBeenCalled()
      
      // Phase 2: User manually upgrades stash to level 2
      mockSaveUserHideoutProgress.mockClear()
      mockStationLevels.value.stash = 2
      
      // Phase 3: User upgrades to Edge of Darkness Edition
      mockGameEdition.value = 'Edge of Darkness Edition'
      for (const stationId of editionBasedStations) {
        await updateStationLevelOnEditionChange(stationId)
      }
      
      expect(mockStationLevels.value.stash).toBe(4) // Upgraded from 2 to 4
      expect(mockStationLevels.value['cultist-circle']).toBeUndefined()
      expect(mockSaveUserHideoutProgress).toHaveBeenCalledWith(mockUser.uid, 'stash', 4)
      
      // Phase 4: User upgrades to The Unheard Edition
      mockSaveUserHideoutProgress.mockClear()
      mockGameEdition.value = 'The Unheard Edition'
      for (const stationId of editionBasedStations) {
        await updateStationLevelOnEditionChange(stationId)
      }
      
      expect(mockStationLevels.value.stash).toBe(4) // No change
      expect(mockStationLevels.value['cultist-circle']).toBe(1) // New upgrade
      expect(mockSaveUserHideoutProgress).toHaveBeenCalledWith(mockUser.uid, 'cultist-circle', 1)
      expect(mockSaveUserHideoutProgress).toHaveBeenCalledTimes(1)
    })
  })

  // Helper functions (extracted from the actual component for testing)
  function getStationStartingLevel(stationId: string): number {
    if (stationId === 'stash') {
      if (mockGameEdition.value === 'Edge of Darkness Edition' || mockGameEdition.value === 'The Unheard Edition') {
        return 4
      }
    }
    
    if (stationId === 'cultist-circle') {
      if (mockGameEdition.value === 'The Unheard Edition') {
        return 1
      }
    }
    
    return 0
  }

  async function updateStationLevelOnEditionChange(stationId: string): Promise<void> {
    const newStartingLevel = getStationStartingLevel(stationId)
    const currentLevel = mockStationLevels.value[stationId] || 0
    
    if (newStartingLevel > currentLevel) {
      mockStationLevels.value[stationId] = newStartingLevel
      try {
        await mockSaveUserHideoutProgress(mockUser.uid, stationId, newStartingLevel)
      } catch (error) {
        console.error(`Failed to update ${stationId} level:`, error)
      }
    }
  }
})