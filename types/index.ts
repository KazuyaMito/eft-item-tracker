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
  itemName?: string
  itemIconLink?: string
}

export interface EFTTask {
  id: string
  name: string
  trader: string
  level: number
  description: string
  objectives?: string[]
  requirements: TaskRequirement[]
  rewards: string[]
  prerequisites?: string[]
  kappaRequired?: boolean
  parallelTaskIds?: string[]
}

export interface HideoutRequirement {
  id: string
  stationId: string
  level: number
  itemId: string
  quantity: number
  itemName?: string
  itemIconLink?: string
}

export interface HideoutLevel {
  level: number
  constructionTime: string
  requirements: HideoutRequirement[]
  stationLevelRequirements?: {
    stationId: string
    stationName: string
    level: number
  }[]
  skillRequirements?: {
    skillId: string
    skillName: string
    level: number
  }[]
  traderRequirements?: {
    traderId: string
    traderName: string
    level: number
  }[]
}

export interface HideoutStation {
  id: string
  name: string
  normalizedName?: string
  imageLink?: string
  levels: HideoutLevel[]
}

export interface ItemRequirement {
  itemId: string
  quantity: number
  foundInRaid?: boolean
}

export interface GroupedItemRequirement {
  itemId: string
  itemName: string
  itemIconLink: string | null
  sources: {
    source: 'task' | 'hideout'
    sourceId: string
    sourceName: string
    quantity: number
    traderName?: string
  }[]
  totalQuantity: number
}