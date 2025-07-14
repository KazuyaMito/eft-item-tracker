<template>
  <div class="space-y-1">
    <div
      v-for="source in sources"
      :key="source.sourceId"
      class="flex items-center space-x-2"
    >
      <div class="flex items-center space-x-2">
        <div
          v-if="source.source === 'task'"
          :class="[
            'rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden',
            mobile ? 'w-4 h-4' : 'w-4 h-4 md:w-5 md:h-5'
          ]"
          :title="source.traderName"
        >
          <img
            :src="getTraderImage(source.traderName)"
            :alt="source.traderName"
            class="w-full h-full object-cover"
            @error="$event.target.style.display='none'; $event.target.nextElementSibling.style.display='flex'"
          >
          <div
            class="w-full h-full bg-dark-surface rounded-full items-center justify-center text-xs text-dark-text-secondary hidden"
          >
            {{ getTraderInitial(source.traderName) }}
          </div>
        </div>
        <div
          v-else-if="source.source === 'hideout'"
          :class="[
            'rounded flex items-center justify-center flex-shrink-0 overflow-hidden',
            mobile ? 'w-4 h-4' : 'w-4 h-4 md:w-5 md:h-5'
          ]"
          :title="getHideoutStationName(source.sourceId)"
        >
          <img
            :src="getHideoutImage(source.sourceId)"
            :alt="getHideoutStationName(source.sourceId)"
            class="w-full h-full object-cover"
            @error="$event.target.style.display='none'; $event.target.nextElementSibling.style.display='flex'"
          >
          <div
            class="w-full h-full bg-amber-800 rounded items-center justify-center text-xs text-amber-200 hidden"
          >
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
            </svg>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <p
            :class="[
              'truncate rounded',
              mobile ? 'text-xs px-2 py-1' : 'text-xs md:text-sm px-1 md:px-2 py-1',
              source.source === 'task' 
                ? 'bg-blue-900 text-blue-200' 
                : 'bg-green-900 text-green-200'
            ]"
          >
            {{ source.sourceName }}
          </p>
          
          <!-- Wiki Link Button for Tasks -->
          <button
            v-if="source.source === 'task' && getTaskWikiLink(source.sourceId)"
            @click="openWikiLink(getTaskWikiLink(source.sourceId))"
            :class="[
              'flex items-center justify-center rounded hover:bg-blue-700 transition-colors',
              mobile ? 'w-6 h-6' : 'w-7 h-7'
            ]"
            title="View on Wiki"
          >
            <svg 
              :class="[
                'text-blue-200 hover:text-white',
                mobile ? 'w-3 h-3' : 'w-4 h-4'
              ]" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { hideoutStations } from '~/data/hideout'
import { eftTasks } from '~/data/tasks'

const props = defineProps({
  sources: {
    type: Array,
    required: true
  },
  mobile: {
    type: Boolean,
    default: false
  }
})

const getTraderImage = (traderName) => {
  if (!traderName) return ''
  const { getTraderImageLink } = useTraders()
  return getTraderImageLink(traderName) || ''
}

const getTraderInitial = (traderName) => {
  if (!traderName) return '?'
  return traderName.charAt(0).toUpperCase()
}

const getHideoutImage = (sourceId) => {
  if (!sourceId) return ''
  const stationId = sourceId.split('_')[0]
  
  // Get image from API
  const station = hideoutStations.find(s => s.normalizedName === stationId)
  return station ? station.imageLink || '' : ''
}

const getHideoutStationName = (sourceId) => {
  if (!sourceId) return 'Hideout'
  const stationId = sourceId.split('_')[0]
  const station = hideoutStations.find(s => s.id === stationId)
  return station ? station.name : 'Hideout'
}

const getTaskWikiLink = (sourceId) => {
  if (!sourceId) return null
  const taskId = sourceId.split('_')[0]
  const task = eftTasks.find(t => t.id === taskId)
  return task ? task.wikiLink : null
}

const openWikiLink = (wikiLink) => {
  if (wikiLink) {
    window.open(wikiLink, '_blank', 'noopener,noreferrer')
  }
}
</script>