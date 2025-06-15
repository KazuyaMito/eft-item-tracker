export interface EFTTrader {
  id: string
  name: string
  normalizedName: string
  description?: string
  imageLink?: string
  image4xLink?: string
}

let cachedTraders: any[] = []
let lastFetchTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const eftTraders = reactive<EFTTrader[]>([])

const fetchTraders = async () => {
  const now = Date.now()
  if (cachedTraders.length > 0 && now - lastFetchTime < CACHE_DURATION) {
    return cachedTraders
  }

  try {
    const { getTraders } = useTarkovAPI()
    const traders = await getTraders()
    
    cachedTraders = traders.map((trader: any) => ({
      id: trader.id,
      name: trader.name,
      normalizedName: trader.normalizedName,
      description: trader.description,
      imageLink: trader.imageLink,
      image4xLink: trader.image4xLink
    }))
    
    lastFetchTime = now
    eftTraders.splice(0, eftTraders.length, ...cachedTraders)
    return cachedTraders
  } catch (error) {
    console.error('Failed to fetch traders from Tarkov API:', error)
    return []
  }
}

// Initialize traders on first access
if (typeof window !== 'undefined') {
  fetchTraders()
}

export const getTraderByName = (name: string) => {
  return eftTraders.find(trader => trader.name === name)
}

export const getTraderByNormalizedName = (normalizedName: string) => {
  return eftTraders.find(trader => trader.normalizedName === normalizedName)
}

export const getTraderImageLink = (traderName: string) => {
  const trader = getTraderByName(traderName)
  return trader ? trader.imageLink : null
}