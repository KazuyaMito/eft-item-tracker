import type { EFTItem } from '~/types'

let cachedItems: any[] = []
let lastFetchTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const eftItems = reactive<EFTItem[]>([])

const fetchItems = async () => {
  const now = Date.now()
  if (cachedItems.length > 0 && now - lastFetchTime < CACHE_DURATION) {
    return cachedItems
  }

  try {
    const { getItems } = useTarkovAPI()
    const items = await getItems()
    
    cachedItems = items.map((item: any) => ({
      id: item.id,
      name: item.name,
      shortName: item.shortName,
      iconLink: item.iconLink,
      types: item.types || [],
      category: item.category?.name || 'Other',
      subcategory: item.category?.name || 'Other',
      foundInRaid: true,
      fleaMarketSellable: true,
      normalizedName: item.normalizedName,
      avg24hPrice: item.avg24hPrice,
      basePrice: item.basePrice,
      width: item.width,
      height: item.height,
      weight: item.weight,
      sellFor: item.sellFor || []
    }))
    
    lastFetchTime = now
    eftItems.splice(0, eftItems.length, ...cachedItems)
    return cachedItems
  } catch (error) {
    console.error('Failed to fetch items from Tarkov API:', error)
    return []
  }
}

// Initialize items on first access
if (process.client) {
  fetchItems()
}

export const getItemById = (id) => {
  return eftItems.find(item => item.id === id)
}

export const getItemsByCategory = (category) => {
  return eftItems.filter(item => item.category === category)
}

export const searchItems = (query) => {
  const lowercaseQuery = query.toLowerCase()
  return eftItems.filter(item => 
    item.name.toLowerCase().includes(lowercaseQuery) ||
    item.shortName.toLowerCase().includes(lowercaseQuery) ||
    item.types.some(type => type.toLowerCase().includes(lowercaseQuery))
  )
}