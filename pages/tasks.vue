<template>
  <div class="space-y-6">
    <div class="bg-dark-card rounded-lg shadow-md p-6">
      <h1 class="text-2xl font-bold text-dark-text mb-4">Tasks</h1>
      <p class="text-dark-text-secondary mb-6">
        Track your progress on trader tasks and see required items.
      </p>
      
      <!-- Category filters and trader selection -->
      <div class="flex flex-col md:flex-row gap-2 mb-4">
        <!-- ALL/TRADERS buttons section -->
        <div class="bg-dark-surface rounded-lg p-2 flex gap-2 justify-center md:justify-start">
          <button
            @click="selectedCategory = 'all'; selectedTrader = null"
            :class="[
              'flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 rounded text-xs md:text-sm font-medium transition-colors',
              selectedCategory === 'all'
                ? 'bg-dark-hover text-white'
                : 'text-dark-text-secondary hover:text-white'
            ]"
          >
            <svg class="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            ALL
          </button>
          <button
            @click="selectedCategory = 'traders'"
            :class="[
              'flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 rounded text-xs md:text-sm font-medium transition-colors',
              selectedCategory === 'traders'
                ? 'bg-dark-hover text-white'
                : 'text-dark-text-secondary hover:text-white'
            ]"
          >
            <svg class="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 715.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            TRADERS
          </button>
        </div>
        
        <!-- Trader selection area (separate background) -->
        <div class="flex-1 bg-dark-hover rounded-lg p-2 min-w-0 flex items-center justify-center">
          <div v-if="selectedCategory === 'all'" class="text-center">
            <p class="text-xs md:text-sm text-dark-text-secondary uppercase tracking-wider">Showing All Sources</p>
          </div>
          
          <div v-else-if="selectedCategory === 'traders'" class="w-full flex items-center gap-1 min-w-0">
            <button
              class="text-dark-text-secondary hover:text-white p-1 flex-shrink-0 transition-colors"
              @click="scrollTraders('left')"
            >
              <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div ref="traderScroll" class="flex gap-1 md:gap-2 flex-nowrap overflow-x-hidden scrollbar-hide flex-1 scroll-smooth min-w-0">
              <button
                v-for="trader in traders"
                :key="trader"
                @click="selectedTrader = selectedTrader === trader ? null : trader"
                :class="[
                  'flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 rounded text-xs font-medium transition-colors flex-shrink-0',
                  selectedTrader === trader
                    ? 'bg-blue-600 text-white'
                    : 'bg-dark-surface text-dark-text-secondary hover:bg-dark-surface'
                ]"
              >
                <div class="w-5 h-5 md:w-6 md:h-6 bg-dark-card rounded-full flex items-center justify-center overflow-hidden">
                  <img 
                    v-if="getTraderImage(trader)"
                    :src="getTraderImage(trader)"
                    :alt="trader"
                    class="w-full h-full object-cover"
                    @error="$event.target.style.display='none'"
                  />
                  <span v-else class="text-[8px] md:text-[10px] font-bold">{{ trader.substring(0, 2).toUpperCase() }}</span>
                </div>
                <span class="uppercase mobile-short-text">
                  <span class="mobile-long">{{ trader }}</span>
                  <span class="mobile-short">{{ trader.substring(0, 3).toUpperCase() }}</span>
                </span>
              </button>
            </div>
            
            <button
              class="text-dark-text-secondary hover:text-white p-1 flex-shrink-0 transition-colors"
              @click="scrollTraders('right')"
            >
              <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Status filters -->
      <div class="flex flex-wrap gap-2 mb-4">
        <button
          @click="selectedFilter = 'available'"
          :class="[
            'flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded bg-dark-surface text-xs md:text-sm font-medium transition-colors',
            selectedFilter === 'available'
              ? 'text-white ring-2 ring-blue-500'
              : 'text-dark-text-secondary hover:text-white'
          ]"
        >
          <svg class="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="mobile-short-text">
            <span class="mobile-long">AVAILABLE</span>
            <span class="mobile-short">AVAIL</span>
          </span>
        </button>
        <button
          @click="selectedFilter = 'locked'"
          :class="[
            'flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded bg-dark-surface text-xs md:text-sm font-medium transition-colors',
            selectedFilter === 'locked'
              ? 'text-white ring-2 ring-blue-500'
              : 'text-dark-text-secondary hover:text-white'
          ]"
        >
          <svg class="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          LOCKED
        </button>
        <button
          @click="selectedFilter = 'completed'"
          :class="[
            'flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded bg-dark-surface text-xs md:text-sm font-medium transition-colors',
            selectedFilter === 'completed'
              ? 'text-white ring-2 ring-blue-500'
              : 'text-dark-text-secondary hover:text-white'
          ]"
        >
          <svg class="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
          <span class="mobile-short-text">
            <span class="mobile-long">COMPLETED</span>
            <span class="mobile-short">DONE</span>
          </span>
        </button>
        <button
          @click="selectedFilter = 'all'"
          :class="[
            'px-2 md:px-4 py-2 rounded bg-dark-surface text-xs md:text-sm font-medium transition-colors',
            selectedFilter === 'all'
              ? 'text-white ring-2 ring-blue-500'
              : 'text-dark-text-secondary hover:text-white'
          ]"
        >
          ALL
        </button>
        
        <div class="w-full md:w-auto md:flex-1"></div>
        
        <button
          @click="showTasksAboveLevel = !showTasksAboveLevel"
          :class="[
            'flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded bg-dark-surface text-xs md:text-sm font-medium transition-colors whitespace-nowrap',
            showTasksAboveLevel
              ? 'text-white ring-2 ring-blue-500'
              : 'text-dark-text-secondary hover:text-white'
          ]"
          :title="showTasksAboveLevel ? 'Hide tasks above your level' : 'Show tasks above your level'"
        >
          <svg class="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
          <span class="mobile-short-text">
            <span class="mobile-long">{{ showTasksAboveLevel ? 'HIDE' : 'SHOW' }} LVL {{ playerLevel }}+</span>
            <span class="mobile-short">L{{ playerLevel }}+</span>
          </span>
        </button>
      </div>
    </div>

    <div class="space-y-4">
      <div
        v-for="task in filteredTasks"
        :key="task.id"
        :class="[
          'bg-dark-card rounded-lg shadow-md',
          isMobile ? 'p-4' : 'p-6'
        ]"
      >
        <!-- PC Layout -->
        <div v-if="!isMobile" class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <div class="flex items-start gap-2">
              <h3 class="text-lg font-semibold text-dark-text">{{ task.name }}</h3>
              <div v-if="task.parallelTaskIds && task.parallelTaskIds.length > 0" class="flex items-center gap-1">
                <div class="group relative">
                  <svg class="w-5 h-5 text-blue-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-dark-surface border border-dark-border rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    <p class="text-sm text-dark-text">Alternative tasks available</p>
                    <div class="text-xs text-dark-text-secondary mt-1">
                      Complete one, others will fail
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p class="text-sm text-dark-text-secondary">
              {{ task.trader }} - 
              <span :class="task.level > playerLevel ? 'text-red-500 font-semibold' : ''">
                Level {{ task.level }}
              </span>
            </p>
            <p class="text-dark-text-secondary mt-2">{{ task.description }}</p>
            <div class="mt-2 flex items-center gap-2">
              <span 
                v-if="taskCompletionStatuses[task.id]?.status === 'completed'"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-900/20 text-green-400 border border-green-800"
              >
                Completed
              </span>
              <span 
                v-else-if="taskCompletionStatuses[task.id]?.status === 'failed'"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-900/20 text-red-400 border border-red-800"
              >
                Failed (Alternative Completed)
              </span>
              <span 
                v-else
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-900/20 text-yellow-400 border border-yellow-800"
              >
                In Progress
              </span>
              
              <!-- Show related parallel tasks -->
              <div v-if="task.parallelTaskIds && task.parallelTaskIds.length > 0 && taskCompletionStatuses[task.id]?.status !== 'completed'" class="flex items-center gap-1 text-xs text-dark-text-secondary">
                <span>Alternatives:</span>
                <span v-for="(parallelId, idx) in task.parallelTaskIds" :key="parallelId" class="flex items-center">
                  <span v-if="idx > 0" class="mx-1">|</span>
                  <span 
                    :class="{
                      'text-green-400': taskCompletionStatuses[parallelId]?.status === 'completed',
                      'text-red-400': taskCompletionStatuses[parallelId]?.status === 'failed'
                    }">
                    {{ getTaskName(parallelId) }}
                  </span>
                </span>
              </div>
            </div>
          </div>
          <div class="ml-4">
            <button
              v-if="!isTaskCompleted(task.id)"
              @click="completeTask(task)"
              :disabled="completingTask === task.id || !canCompleteTask(task)"
              class="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ completingTask === task.id ? 'Completing...' : 'Complete' }}
            </button>
            <button
              v-else
              @click="uncompleteTask(task)"
              :disabled="uncompletingTask === task.id"
              class="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ uncompletingTask === task.id ? 'Uncompleting...' : 'Uncomplete' }}
            </button>
          </div>
        </div>

        <!-- Mobile Layout -->
        <div v-else class="mb-4">
          <div>
            <div class="flex items-start gap-2 mb-2">
              <h3 class="text-base font-semibold text-dark-text">{{ task.name }}</h3>
              <div v-if="task.parallelTaskIds && task.parallelTaskIds.length > 0" class="flex items-center gap-1">
                <div class="group relative">
                  <svg class="w-4 h-4 text-blue-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
              </div>
            </div>
            <p class="text-xs text-dark-text-secondary mb-2">
              {{ task.trader }} - 
              <span :class="task.level > playerLevel ? 'text-red-500 font-semibold' : ''">
                Level {{ task.level }}
              </span>
            </p>
            <p class="text-sm text-dark-text-secondary mb-3">{{ task.description }}</p>
            
            <div class="flex flex-wrap items-center gap-2 mb-3">
              <span 
                v-if="taskCompletionStatuses[task.id]?.status === 'completed'"
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/20 text-green-400 border border-green-800"
              >
                Completed
              </span>
              <span 
                v-else-if="taskCompletionStatuses[task.id]?.status === 'failed'"
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-900/20 text-red-400 border border-red-800"
              >
                Failed
              </span>
              <span 
                v-else
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-900/20 text-yellow-400 border border-yellow-800"
              >
                In Progress
              </span>
              
              <!-- Show action button inline on mobile -->
              <button
                v-if="!isTaskCompleted(task.id)"
                @click="completeTask(task)"
                :disabled="completingTask === task.id || !canCompleteTask(task)"
                class="ml-auto px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ completingTask === task.id ? 'Completing...' : 'Complete' }}
              </button>
              <button
                v-else
                @click="uncompleteTask(task)"
                :disabled="uncompletingTask === task.id"
                class="ml-auto px-3 py-1 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ uncompletingTask === task.id ? 'Uncompleting...' : 'Uncomplete' }}
              </button>
            </div>
            
            <!-- Show related parallel tasks -->
            <div v-if="task.parallelTaskIds && task.parallelTaskIds.length > 0 && taskCompletionStatuses[task.id]?.status !== 'completed'" class="text-xs text-dark-text-secondary">
              <span>Alternatives: </span>
              <span v-for="(parallelId, idx) in task.parallelTaskIds" :key="parallelId" class="inline">
                <span v-if="idx > 0"> | </span>
                <span 
                  :class="{
                    'text-green-400': taskCompletionStatuses[parallelId]?.status === 'completed',
                    'text-red-400': taskCompletionStatuses[parallelId]?.status === 'failed'
                  }">
                  {{ getTaskName(parallelId) }}
                </span>
              </span>
            </div>
          </div>
        </div>
        
        <div v-if="task.objectives && task.objectives.length > 0" class="space-y-3">
          <h4 class="font-medium text-dark-text">Objectives:</h4>
          <div class="space-y-2">
            <div
              v-for="(objective, index) in task.objectives"
              :key="`${task.id}_obj_${index}`"
              class="flex items-center space-x-3 p-3 bg-dark-surface rounded-lg group"
              :class="{ 'cursor-pointer': !isTaskCompleted(task.id) }"
              @click="!isTaskCompleted(task.id) && toggleObjective(task.id, index)"
              @mouseenter="!isTaskCompleted(task.id) && (hoveredObjective[`${task.id}_${index}`] = true)"
              @mouseleave="hoveredObjective[`${task.id}_${index}`] = false"
            >
              <div class="relative w-5 h-5 flex-shrink-0">
                <div
                  :class="[
                    'w-5 h-5 flex items-center justify-center transition-all cursor-pointer',
                    isObjectiveCompleted(task.id, index)
                      ? 'text-green-500'
                      : 'text-gray-400'
                  ]"
                >
                  <svg
                    v-if="isObjectiveCompleted(task.id, index) && !hoveredObjective[`${task.id}_${index}`]"
                    class="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                  <svg
                    v-else-if="isObjectiveCompleted(task.id, index) && hoveredObjective[`${task.id}_${index}`]"
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <svg
                    v-else-if="!isObjectiveCompleted(task.id, index) && !hoveredObjective[`${task.id}_${index}`]"
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <svg
                    v-else
                    class="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </div>
              </div>
              <p 
                :class="[
                  'text-sm transition-colors select-none',
                  isObjectiveCompleted(task.id, index)
                    ? 'text-green-500 font-medium'
                    : 'text-dark-text'
                ]"
              >
                {{ objective }}
              </p>
            </div>
          </div>
        </div>
        
        <div v-if="task.requirements && task.requirements.length > 0" class="space-y-3">
          <h4 class="font-medium text-dark-text" :class="isMobile ? 'text-sm' : ''">Item Requirements:</h4>
          <div class="space-y-2">
            <div
              v-for="requirement in task.requirements"
              :key="requirement.id"
              :class="[
                'flex items-center justify-between bg-dark-surface rounded-lg',
                isMobile ? 'p-2' : 'p-3'
              ]"
            >
              <div class="flex items-center" :class="isMobile ? 'space-x-2' : 'space-x-3'">
                <div :class="[
                  'bg-dark-surface rounded flex items-center justify-center overflow-hidden',
                  isMobile ? 'w-8 h-8' : 'w-10 h-10'
                ]">
                  <img 
                    v-if="requirement.itemIconLink"
                    :src="requirement.itemIconLink"
                    :alt="requirement.itemName || getItemName(requirement.itemId)"
                    class="w-full h-full object-cover"
                    @error="$event.target.style.display='none'"
                  />
                  <span v-else class="text-xs text-dark-text-secondary">IMG</span>
                </div>
                <div>
                  <p :class="[
                    'font-medium text-dark-text',
                    isMobile ? 'text-sm' : ''
                  ]">
                    {{ requirement.itemName || getItemName(requirement.itemId) }}
                  </p>
                  <p :class="[
                    'text-dark-text-secondary',
                    isMobile ? 'text-xs' : 'text-sm'
                  ]">
                    {{ requirement.foundInRaid ? 'Found in Raid' : 'Any condition' }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <div :class="[
                  'font-semibold',
                  isMobile ? 'text-base' : 'text-lg',
                  getProgressClass(requirement)
                ]">
                  {{ getUserItemCount(requirement.itemId, requirement.foundInRaid) }} / {{ requirement.quantity }}
                </div>
                <div class="text-xs text-dark-text-secondary">
                  {{ getProgressPercentage(requirement) }}%
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-4 pt-4 border-t border-dark-border">
          <h4 :class="[
            'font-medium text-dark-text mb-2',
            isMobile ? 'text-sm' : ''
          ]">Rewards:</h4>
          <div :class="[
            'flex flex-wrap',
            isMobile ? 'gap-1' : 'gap-2'
          ]">
            <span
              v-for="reward in task.rewards"
              :key="reward"
              :class="[
                'inline-block bg-green-900/20 text-green-400 border border-green-800 rounded',
                isMobile ? 'px-2 py-0.5 text-xs' : 'px-2 py-1 text-xs'
              ]"
            >
              {{ reward }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { doc, getDoc } from 'firebase/firestore'
import { eftTasks, getTasksByTrader } from '~/data/tasks'
import { getItemById } from '~/data/items'
import { 
  filterTasks, 
  isTaskAvailable as checkTaskAvailable, 
  calculateItemProgress, 
  canCompleteTask as checkCanCompleteTask,
  sortTraders 
} from '~/utils/taskPageLogic'

const { user, signInWithGoogle } = useAuth()
const { currentUserId, isLoggedIn } = useCurrentUser()
const { getUserItemCollection, updateUserItemCollection, saveUserTaskObjectives, getUserTaskObjectives, saveCompletedTask, getCompletedTasks, reduceItemsForTask } = useFirestore()
const { showNonKappaTasks } = useSettings()
const { getTraders } = useTarkovAPI()
const { playerLevel } = usePlayerLevel()
const { $firebase } = useNuxtApp()
const { taskCompletionStatuses, completeTask: completeTaskWithParallel, uncompleteTask: uncompleteTaskWithParallel, getTaskStatusInfo } = useTaskCompletion()
const { isMobile } = useBreakpoint()

const selectedTrader = ref(null)
const userItems = ref({})
const completedObjectives = ref({})
const hoveredObjective = ref({})
const completedTasks = ref({})
const completingTask = ref(null)
const uncompletingTask = ref(null)
const selectedFilter = ref('available') // 'all', 'available', 'locked', 'completed'
const selectedCategory = ref('all') // 'all', 'traders'
const traderScroll = ref(null)
const traderData = ref([])
const showTasksAboveLevel = ref(false)

const traders = computed(() => {
  const traderList = [...new Set(eftTasks.map(task => task.trader))]
  return sortTraders(traderList)
})

const filteredTasks = computed(() => {
  const filters = {
    selectedCategory: selectedCategory.value,
    selectedTrader: selectedTrader.value,
    selectedFilter: selectedFilter.value,
    showNonKappaTasks: showNonKappaTasks.value,
    showTasksAboveLevel: showTasksAboveLevel.value,
    playerLevel: playerLevel.value
  }
  
  return filterTasks(eftTasks, filters, taskCompletionStatuses.value)
})

const getItemName = (itemId) => {
  const item = getItemById(itemId)
  return item ? item.name : itemId
}

const getTaskName = (taskId) => {
  const task = eftTasks.find(t => t.id === taskId)
  return task ? task.name : taskId
}

const getUserItemCount = (itemId, foundInRaid) => {
  const progress = calculateItemProgress(
    { itemId, quantity: 1, foundInRaid },
    userItems.value
  )
  return progress.current
}

const getProgressClass = (requirement) => {
  const progress = calculateItemProgress(requirement, userItems.value)
  return progress.progressClass
}

const getProgressPercentage = (requirement) => {
  const progress = calculateItemProgress(requirement, userItems.value)
  return progress.percentage
}

const loadUserItems = async () => {
  if (!user.value) return
  
  try {
    const items = await getUserItemCollection(user.value.uid)
    const itemsMap = {}
    
    items.forEach(item => {
      itemsMap[item.itemId] = {
        quantity: item.quantity || 0,
        foundInRaid: item.foundInRaid || 0
      }
    })
    
    userItems.value = itemsMap
  } catch (error) {
    console.error('Failed to load user items:', error)
  }
}

const loadUserTaskObjectives = async () => {
  if (!user.value) return
  
  try {
    const objectives = await getUserTaskObjectives(user.value.uid)
    completedObjectives.value = objectives || {}
  } catch (error) {
    console.error('Failed to load task objectives:', error)
  }
}

const loadCompletedTasks = async () => {
  if (!user.value) return
  
  try {
    const tasks = await getCompletedTasks(user.value.uid)
    completedTasks.value = tasks || {}
  } catch (error) {
    console.error('Failed to load completed tasks:', error)
  }
}

const isObjectiveCompleted = (taskId, objectiveIndex) => {
  return completedObjectives.value[`${taskId}_${objectiveIndex}`] === true
}

const toggleObjective = async (taskId, objectiveIndex) => {
  if (!user.value) return
  
  const key = `${taskId}_${objectiveIndex}`
  const newValue = !completedObjectives.value[key]
  
  completedObjectives.value[key] = newValue
  
  try {
    await saveUserTaskObjectives(user.value.uid, key, newValue)
  } catch (error) {
    console.error('Failed to save objective status:', error)
    completedObjectives.value[key] = !newValue
  }
}

const isTaskCompleted = (taskId) => {
  return taskCompletionStatuses.value[taskId]?.status === 'completed'
}

const isTaskAvailable = (task) => {
  return checkTaskAvailable(task, taskCompletionStatuses.value)
}

const canCompleteTask = (task) => {
  return checkCanCompleteTask(task, taskCompletionStatuses.value)
}

const getTraderImage = (traderName) => {
  const trader = traderData.value.find(t => 
    t.name.toLowerCase() === traderName.toLowerCase() ||
    t.normalizedName === traderName.toLowerCase()
  )
  return trader?.imageLink || trader?.image4xLink
}

const loadTraderData = async () => {
  try {
    const traders = await getTraders()
    traderData.value = traders
  } catch (error) {
    console.error('Failed to load trader data:', error)
  }
}

const scrollTraders = (direction) => {
  const container = traderScroll.value
  if (!container) return
  
  const scrollAmount = 200
  if (direction === 'left') {
    container.scrollLeft -= scrollAmount
  } else {
    container.scrollLeft += scrollAmount
  }
}

const completeTask = async (task) => {
  if (!user.value || !canCompleteTask(task)) return
  
  completingTask.value = task.id
  
  try {
    // First, mark all objectives as completed
    if (task.objectives && task.objectives.length > 0) {
      for (let i = 0; i < task.objectives.length; i++) {
        const key = `${task.id}_${i}`
        completedObjectives.value[key] = true
        await saveUserTaskObjectives(user.value.uid, key, true)
      }
    }
    
    // Reduce required items from user's collection
    if (task.requirements && task.requirements.length > 0) {
      await reduceItemsForTask(user.value.uid, task.requirements)
    }
    
    // Use the new composable to complete task (handles parallel tasks)
    await completeTaskWithParallel(task)
    
    // Also save to legacy system for backward compatibility
    await saveCompletedTask(user.value.uid, task.id, true)
    completedTasks.value[task.id] = true
    
    // Reload user items to reflect the changes
    await loadUserItems()
  } catch (error) {
    console.error('Failed to complete task:', error)
    // Reload data in case of partial completion
    await loadUserItems()
    await loadUserTaskObjectives()
    await loadCompletedTasks()
  } finally {
    completingTask.value = null
  }
}

const uncompleteTask = async (task) => {
  if (!user.value || !isTaskCompleted(task.id)) return
  
  uncompletingTask.value = task.id
  
  try {
    // Restore the items that were reduced when completing the task
    if (task.requirements && task.requirements.length > 0) {
      for (const requirement of task.requirements) {
        const itemRef = doc($firebase.db, 'userItems', `${user.value.uid}_${requirement.itemId}`)
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
        
        await updateUserItemCollection(user.value.uid, requirement.itemId, {
          quantity: newQuantity,
          foundInRaid: newFIR
        })
      }
    }
    
    // Clear all objectives
    if (task.objectives && task.objectives.length > 0) {
      for (let i = 0; i < task.objectives.length; i++) {
        const key = `${task.id}_${i}`
        completedObjectives.value[key] = false
        await saveUserTaskObjectives(user.value.uid, key, false)
      }
    }
    
    // Use the new composable to uncomplete task
    await uncompleteTaskWithParallel(task.id)
    
    // Also save to legacy system for backward compatibility
    await saveCompletedTask(user.value.uid, task.id, false)
    completedTasks.value[task.id] = false
    
    // Reload user items to reflect the changes
    await loadUserItems()
  } catch (error) {
    console.error('Failed to uncomplete task:', error)
    // Reload data in case of partial completion
    await loadUserItems()
    await loadUserTaskObjectives()
    await loadCompletedTasks()
  } finally {
    uncompletingTask.value = null
  }
}

watch(user, (newUser) => {
  if (newUser) {
    loadUserItems()
    loadUserTaskObjectives()
    loadCompletedTasks()
  } else {
    userItems.value = {}
    completedObjectives.value = {}
    completedTasks.value = {}
  }
}, { immediate: true })

// Load trader data on mount
onMounted(() => {
  loadTraderData()
})

// SEO Meta tags
useSeoMeta({
  title: 'EFT Tasks & Quest Tracker - Escape from Tarkov Quest Progress',
  description: 'Complete quest tracker for Escape from Tarkov. Track trader tasks, monitor objectives, manage quest items, and view task prerequisites. Filter by trader, availability, and completion status.',
  ogTitle: 'EFT Tasks & Quest Tracker - Complete Your Tarkov Quests',
  ogDescription: 'Track all Escape from Tarkov quests and tasks. Monitor objectives, manage required items, and track your progress with all traders including Prapor, Therapist, Skier, and more.',
  keywords: 'EFT tasks, Escape from Tarkov quests, Tarkov quest tracker, trader tasks, Prapor tasks, Therapist quests, Skier tasks, Peacekeeper quests, Mechanic tasks, Ragman quests, Jaeger tasks, quest objectives'
})
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}
</style>