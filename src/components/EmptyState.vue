<script setup>
</script>

<template>
  <div class="glass-card p-12 text-center animate-fade-in">
    <!-- Weather Icon -->
    <div class="relative w-32 h-32 mx-auto mb-6">
      <div class="absolute inset-0 bg-sky-primary/10 rounded-full blur-2xl"></div>
      <div class="relative w-full h-full flex items-center justify-center">
        <i class="fa-solid fa-sun text-orange-accent text-6xl animate-spin-slow"></i>
      </div>
    </div>

    <!-- Text -->
    <h2 class="font-display font-bold text-xl text-white mb-2">
      No cities added yet
    </h2>
    <p class="text-white/50 max-w-sm mx-auto">
      Use the search bar above to find and add cities to your weather dashboard.
    </p>

    <!-- Arrow pointing up -->
    <div class="mt-6 text-white/30">
      <i class="fa-solid fa-arrow-up text-2xl animate-bounce"></i>
    </div>
  </div>
</template>
