import { reactive } from 'vue'
import type { HideoutRequirement } from '~/types'

export interface HideoutStation {
  id: string
  name: string
  levels: HideoutLevel[]
  normalizedName?: string
  imageLink?: string
}

export interface HideoutLevel {
  level: number
  requirements: HideoutRequirement[]
  stationLevelRequirements: StationLevelRequirement[]
  skillRequirements: SkillRequirement[]
  traderRequirements: TraderRequirement[]
  constructionTime: string
  description?: string
  crafts?: any[]
}

export interface StationLevelRequirement {
  stationId: string
  stationName: string
  level: number
}

export interface SkillRequirement {
  skillId: string
  skillName: string
  level: number
}

export interface TraderRequirement {
  traderId: string
  traderName: string
  level: number
}

let cachedStations: any[] = []
let lastFetchTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const hideoutStations = reactive<HideoutStation[]>([])

const fetchHideout = async () => {
  const now = Date.now()
  if (cachedStations.length > 0 && now - lastFetchTime < CACHE_DURATION) {
    return cachedStations
  }

  try {
    const { getHideout } = useTarkovAPI()
    const stations = await getHideout()
    
    // Create a map of API ID to normalizedName for station requirements
    const idToNormalizedMap = new Map()
    stations.forEach((station: any) => {
      idToNormalizedMap.set(station.id, station.normalizedName || station.id)
    })
    
    cachedStations = stations.map((station: any) => ({
      id: station.normalizedName || station.id,
      name: station.name,
      normalizedName: station.normalizedName,
      imageLink: station.imageLink,
      levels: station.levels?.map((level: any) => ({
        level: level.level,
        constructionTime: level.constructionTime || '0 minutes',
        description: level.description,
        requirements: level.itemRequirements?.map((req: any, index: number) => ({
          id: `${station.normalizedName || station.id}_${level.level}_${index}`,
          stationId: station.normalizedName || station.id,
          level: level.level,
          itemId: req.item.id,
          itemName: req.item.name,
          itemIconLink: req.item.iconLink,
          quantity: req.count || 1
        })) || [],
        stationLevelRequirements: level.stationLevelRequirements?.map((req: any) => ({
          stationId: idToNormalizedMap.get(req.station.id) || req.station.id,
          stationName: req.station.name,
          level: req.level
        })) || [],
        skillRequirements: level.skillRequirements?.map((req: any) => ({
          skillId: req.skill.id,
          skillName: req.skill.name,
          level: req.level
        })) || [],
        traderRequirements: level.traderRequirements?.map((req: any) => ({
          traderId: req.trader.id,
          traderName: req.trader.name,
          level: req.level
        })) || [],
        crafts: level.crafts || []
      })) || []
    }))
    
    lastFetchTime = now
    hideoutStations.splice(0, hideoutStations.length, ...cachedStations)
    return cachedStations
  } catch (error) {
    console.error('Failed to fetch hideout data from Tarkov API:', error)
    return []
  }
}

// Initialize hideout on first access
if (typeof window !== 'undefined') {
  fetchHideout()
}

// Ensure data is available for SSR and client-side
export const ensureHideoutData = async () => {
  if (hideoutStations.length === 0) {
    await fetchHideout()
  }
  return hideoutStations
}

export const getStationById = (id: string) => {
  return hideoutStations.find(station => station.id === id)
}

export const getStationRequirements = (stationId: string, level: number) => {
  const station = getStationById(stationId)
  if (!station) return []
  
  const stationLevel = station.levels.find(l => l.level === level)
  return stationLevel ? stationLevel.requirements : []
}

export const getAllHideoutRequirements = () => {
  const requirements = []
  
  hideoutStations.forEach(station => {
    station.levels.forEach(level => {
      requirements.push(...level.requirements)
    })
  })
  
  return requirements
}

export const getHideoutStationByNormalizedName = (normalizedName: string) => {
  return hideoutStations.find(station => station.normalizedName === normalizedName)
}

export const getHideoutStationImageLink = (normalizedName: string) => {
  const station = getHideoutStationByNormalizedName(normalizedName)
  return station ? station.imageLink : null
}