import type { TaskRequirement } from '~/types'

export interface EFTTask {
  id: string
  name: string
  trader: string
  level: number
  requirements: TaskRequirement[]
  rewards: string[]
  description: string
  kappaRequired?: boolean
  normalizedName?: string
  wikiLink?: string
  objectives?: string[]
  taskRequirements?: any[]
  traderLevelRequirements?: any[]
}

let cachedTasks: any[] = []
let lastFetchTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const eftTasks = reactive<EFTTask[]>([])

const fetchTasks = async () => {
  const now = Date.now()
  if (cachedTasks.length > 0 && now - lastFetchTime < CACHE_DURATION) {
    return cachedTasks
  }

  try {
    const { getTasks } = useTarkovAPI()
    const tasks = await getTasks()
    
    cachedTasks = tasks.map((task: any) => {
      // Extract item requirements from objectives
      const requirements = task.objectives
        ?.filter((obj: any) => obj.type === 'giveItem' && obj.item)
        .map((obj: any, index: number) => ({
          id: `${task.id}_${index}`,
          taskId: task.id,
          itemId: obj.item.id,
          itemName: obj.item.name,
          itemIconLink: obj.item.iconLink,
          quantity: obj.count || 1,
          foundInRaid: obj.foundInRaid || false
        })) || []

      return {
        id: task.id,
        name: task.name,
        trader: task.trader?.name || 'Unknown',
        level: task.minPlayerLevel || 1,
        requirements,
        objectives: task.objectives?.map((obj: any) => obj.description).filter(Boolean) || [],
        rewards: [
          `${task.experience || 0} EXP`,
          ...(task.finishRewards?.traderStanding?.map((standing: any) => 
            `${standing.standing > 0 ? '+' : ''}${standing.standing} ${standing.trader.name} rep`
          ) || [])
        ],
        description: task.objectives?.[0]?.description || task.name,
        kappaRequired: task.kappaRequired === true,
        normalizedName: task.normalizedName,
        wikiLink: task.wikiLink,
        taskRequirements: task.taskRequirements || [],
        traderLevelRequirements: task.traderLevelRequirements || []
      }
    })
    
    lastFetchTime = now
    eftTasks.splice(0, eftTasks.length, ...cachedTasks)
    return cachedTasks
  } catch (error) {
    console.error('Failed to fetch tasks from Tarkov API:', error)
    return []
  }
}

// Initialize tasks on first access
if (typeof window !== 'undefined') {
  fetchTasks()
}

export const getTaskById = (id: string) => {
  return eftTasks.find(task => task.id === id)
}

export const getTasksByTrader = (trader: string) => {
  return eftTasks.filter(task => task.trader === trader)
}

export const getTaskRequirements = (taskId: string) => {
  const task = getTaskById(taskId)
  return task ? task.requirements : []
}