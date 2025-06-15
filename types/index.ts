import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'

export interface FirebaseService {
  auth: Auth
  db: Firestore
}

export interface EFTItem {
  id: string
  name: string
  shortName: string
  iconLink: string
  types: string[]
  category: string
  subcategory?: string
  foundInRaid: boolean
  fleaMarketSellable: boolean
}

export interface UserItemCollection {
  userId: string
  itemId: string
  quantity: number
  foundInRaid: number
  notes?: string
  updatedAt: Date
}

export interface TaskRequirement {
  id: string
  taskId: string
  itemId: string
  quantity: number
  foundInRaid: boolean
}

export interface HideoutRequirement {
  id: string
  stationId: string
  level: number
  itemId: string
  quantity: number
}