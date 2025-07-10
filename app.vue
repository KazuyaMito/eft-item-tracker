<template>
  <div id="app" class="min-h-screen bg-dark-bg text-dark-text flex flex-col">
    <NuxtRouteAnnouncer />
    <Header />
    <TabNavigation />
    <main class="container mx-auto py-8 flex-1 min-h-[calc(100vh-240px)]">
      <NuxtPage />
    </main>
    <Footer />
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
