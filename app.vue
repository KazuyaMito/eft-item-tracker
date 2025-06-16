<template>
  <div id="app" class="min-h-screen bg-dark-bg text-dark-text">
    <NuxtRouteAnnouncer />
    <Header />
    <TabNavigation />
    <main class="container mx-auto py-8">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup>
useHead({
  title: 'EFT Item Tracker',
  meta: [
    { name: 'description', content: 'Track your Escape from Tarkov item collection for tasks and hideout upgrades' }
  ]
})
</script>
