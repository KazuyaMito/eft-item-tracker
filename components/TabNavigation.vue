<template>
  <nav class="bg-dark-card shadow-sm border-b border-dark-surface">
    <div class="container mx-auto px-4">
      <div class="flex space-x-8">
        <NuxtLink
          to="/items"
          class="py-4 px-2 border-b-2 font-medium text-sm transition-colors"
          active-class="border-blue-400 text-blue-400"
          inactive-class="border-transparent text-dark-text-secondary hover:text-dark-text hover:border-dark-surface"
        >
          Items
        </NuxtLink>
        <NuxtLink
          to="/tasks"
          class="py-4 px-2 border-b-2 font-medium text-sm transition-colors"
          active-class="border-blue-400 text-blue-400"
          inactive-class="border-transparent text-dark-text-secondary hover:text-dark-text hover:border-dark-surface"
        >
          Tasks
        </NuxtLink>
        <NuxtLink
          to="/hideout"
          class="py-4 px-2 border-b-2 font-medium text-sm transition-colors"
          active-class="border-blue-400 text-blue-400"
          inactive-class="border-transparent text-dark-text-secondary hover:text-dark-text hover:border-dark-surface"
        >
          Hideout
        </NuxtLink>
        <NuxtLink
          to="/settings"
          class="py-4 px-2 border-b-2 font-medium text-sm transition-colors"
          active-class="border-blue-400 text-blue-400"
          inactive-class="border-transparent text-dark-text-secondary hover:text-dark-text hover:border-dark-surface"
        >
          Settings
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>