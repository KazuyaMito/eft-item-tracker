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
  benefits: string[]
  constructionTime: string
  description?: string
  crafts?: any[]
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
        benefits: level.crafts?.length ? 
          [`Can craft ${level.crafts.length} items`] : 
          [level.description || 'Station functionality'],
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