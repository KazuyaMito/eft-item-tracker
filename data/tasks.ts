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
  prerequisites?: string[]
  parallelTaskIds?: string[]
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
    
    // First pass: create basic task objects
    const basicTasks = tasks.map((task: any) => {
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

      // Extract parallel task IDs from failConditions
      const parallelTaskIds = task.failConditions
        ?.filter((condition: any) => 
          condition.__typename === 'TaskObjectiveTaskStatus' && 
          condition.status?.includes('complete')
        )
        .map((condition: any) => condition.task?.id)
        .filter(Boolean) || []

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
        traderLevelRequirements: task.traderLevelRequirements || [],
        rawPrerequisites: task.taskRequirements?.map((req: any) => req.task?.id).filter(Boolean) || [],
        parallelTaskIds
      }
    })

    // Second pass: fix prerequisites for parallel tasks
    // First, build a map of all parallel task groups to find shared prerequisites
    const parallelTaskGroups = new Map<string, Set<string>>()
    
    // Group all parallel tasks together
    basicTasks.forEach((task: any) => {
      if (task.parallelTaskIds && task.parallelTaskIds.length > 0) {
        // Create a group with current task and all its parallel tasks
        const group = new Set([task.id, ...task.parallelTaskIds])
        const groupKey = Array.from(group).sort().join(',')
        parallelTaskGroups.set(groupKey, group)
      }
    })
    
    // Third pass: build prerequisite correction map for parallel tasks
    const taskPrerequisiteMap = new Map<string, string[]>()
    
    parallelTaskGroups.forEach((group) => {
      const groupTasks = basicTasks.filter((task: any) => group.has(task.id))
      
      // Collect all non-circular prerequisites from all tasks in the group
      const realPrerequisites = new Set<string>()
      
      groupTasks.forEach(task => {
        if (task.rawPrerequisites && task.rawPrerequisites.length > 0) {
          task.rawPrerequisites.forEach((prereqId: string) => {
            // Only include prerequisites that are NOT in the same parallel group
            if (!group.has(prereqId)) {
              realPrerequisites.add(prereqId)
            }
          })
        }
      })
      
      // Set the same prerequisites for all tasks in the group
      const sharedPrereqs = Array.from(realPrerequisites)
      group.forEach(taskId => {
        taskPrerequisiteMap.set(taskId, sharedPrereqs)
      })
    })

    // Final pass: apply corrected prerequisites
    cachedTasks = basicTasks.map((task: any) => {
      const correctedPrerequisites = taskPrerequisiteMap.get(task.id) || task.rawPrerequisites

      // Return the final task with corrected prerequisites
      const { rawPrerequisites, ...finalTask } = task
      return {
        ...finalTask,
        prerequisites: correctedPrerequisites
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