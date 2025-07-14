<template>
  <nav class="bg-dark-card shadow-sm border-b border-dark-surface">
    <div class="container mx-auto px-4">
      <div class="flex space-x-8 overflow-x-auto scrollbar-hide">
        <NuxtLink
          to="/items"
          class="py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap"
          active-class="border-blue-400 text-blue-400"
          inactive-class="border-transparent text-dark-text-secondary hover:text-dark-text hover:border-dark-surface"
        >
          {{ $t('navigation.items') }}
        </NuxtLink>
        <NuxtLink
          to="/tasks"
          class="py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap"
          active-class="border-blue-400 text-blue-400"
          inactive-class="border-transparent text-dark-text-secondary hover:text-dark-text hover:border-dark-surface"
        >
          {{ $t('navigation.tasks') }}
        </NuxtLink>
        <NuxtLink
          to="/hideout"
          class="py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap"
          active-class="border-blue-400 text-blue-400"
          inactive-class="border-transparent text-dark-text-secondary hover:text-dark-text hover:border-dark-surface"
        >
          {{ $t('navigation.hideout') }}
        </NuxtLink>
        <NuxtLink
          to="/settings"
          class="py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap"
          active-class="border-blue-400 text-blue-400"
          inactive-class="border-transparent text-dark-text-secondary hover:text-dark-text hover:border-dark-surface"
        >
          {{ $t('navigation.settings') }}
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>


<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>