<template>
  <nav class="bg-white shadow-sm border-b">
    <div class="container mx-auto px-4">
      <div class="flex space-x-8">
        <NuxtLink
          to="/items"
          class="py-4 px-2 border-b-2 font-medium text-sm transition-colors"
          active-class="border-blue-500 text-blue-600"
          inactive-class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
        >
          Items
        </NuxtLink>
        <NuxtLink
          to="/tasks"
          class="py-4 px-2 border-b-2 font-medium text-sm transition-colors"
          active-class="border-blue-500 text-blue-600"
          inactive-class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
        >
          Tasks
        </NuxtLink>
        <NuxtLink
          to="/hideout"
          class="py-4 px-2 border-b-2 font-medium text-sm transition-colors"
          active-class="border-blue-500 text-blue-600"
          inactive-class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
        >
          Hideout
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>