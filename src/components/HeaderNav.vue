<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSearch } from '@/composables/useSearch'

const props = defineProps({
  temperatureUnit: {
    type: String,
    default: 'celsius'
  },
  canAddMore: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['toggle-unit', 'add-city', 'use-location'])

const searchContainer = ref(null)

const {
  query,
  results,
  loading,
  showDropdown,
  searchHistory,
  locatingUser,
  hasResults,
  hasQuery,
  hasHistory,
  onInput,
  selectCity,
  useCurrentLocation,
  openDropdown,
  closeDropdown
} = useSearch()

const isCelsius = computed(() => props.temperatureUnit === 'celsius')

function handleSelect(city) {
  const selectedCity = selectCity(city)
  emit('add-city', selectedCity)
}

async function handleUseLocation() {
  try {
    const city = await useCurrentLocation()
    emit('add-city', city)
  } catch (error) {
    console.error('Location error:', error)
  }
}

function handleFocus() {
  if (hasHistory.value && !hasQuery.value) {
    openDropdown()
  }
}

function handleClickOutside(event) {
  if (searchContainer.value && !searchContainer.value.contains(event.target)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <header class="sticky top-0 z-50 backdrop-blur-xl bg-dark-navy/80 border-b border-white/5">
    <div class="container mx-auto px-4">
      <div class="flex items-center gap-4 h-16">
        <!-- Logo -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-primary to-cool-blue flex items-center justify-center">
            <i class="fa-solid fa-cloud-sun text-white text-sm"></i>
          </div>
          <h1 class="font-display font-bold text-lg text-white hidden sm:block">Weather Dashboard</h1>
        </div>

        <!-- Search Bar - Inline -->
        <div 
          ref="searchContainer"
          class="flex-1 max-w-md relative"
        >
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i v-if="loading" class="fa-solid fa-spinner fa-spin text-sky-primary text-sm"></i>
              <i v-else class="fa-solid fa-magnifying-glass text-white/40 text-sm"></i>
            </div>
            
            <input
              type="text"
              :value="query"
              :disabled="!canAddMore"
              class="w-full pl-9 pr-3 py-2 rounded-lg text-sm text-white placeholder-white/40 transition-all duration-300 bg-white/5 border border-white/10 focus:bg-white/10 focus:border-sky-primary/50 focus:outline-none"
              placeholder="Search..."
              @input="onInput($event.target.value)"
              @focus="handleFocus"
            />
          </div>

          <!-- Dropdown -->
          <Transition name="fade">
            <div 
              v-if="showDropdown && (hasResults || hasHistory)"
              class="absolute top-full left-0 right-0 mt-2 py-2 rounded-xl z-50 max-h-64 overflow-y-auto bg-slate-800/98 border border-white/10 backdrop-blur-xl shadow-xl"
            >
              <!-- Search Results -->
              <template v-if="hasResults">
                <div class="px-3 py-1.5 text-xs text-white/40 uppercase tracking-wider">
                  Results
                </div>
                <button
                  v-for="city in results"
                  :key="city.id"
                  class="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-sky-primary/10 transition-colors"
                  @click="handleSelect(city)"
                >
                  <i class="fa-solid fa-city text-sky-primary text-xs"></i>
                  <div>
                    <p class="text-white text-sm">{{ city.name }}</p>
                    <p class="text-white/50 text-xs">
                      {{ city.state ? `${city.state}, ` : '' }}{{ city.country }}
                    </p>
                  </div>
                </button>
              </template>

              <!-- Search History -->
              <template v-else-if="hasHistory && !hasQuery">
                <div class="px-3 py-1.5 text-xs text-white/40 uppercase tracking-wider">
                  Recent
                </div>
                <button
                  v-for="city in searchHistory.slice(0, 5)"
                  :key="city.id"
                  class="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-sky-primary/10 transition-colors"
                  @click="handleSelect(city)"
                >
                  <i class="fa-solid fa-clock-rotate-left text-white/40 text-xs"></i>
                  <div>
                    <p class="text-white text-sm">{{ city.name }}</p>
                    <p class="text-white/50 text-xs">{{ city.country }}</p>
                  </div>
                </button>
              </template>
            </div>
          </Transition>
        </div>

        <!-- Temperature Unit Toggle -->
        <div class="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          <button 
            class="px-3 py-1.5 rounded-md text-sm font-medium transition-all"
            :class="isCelsius ? 'bg-sky-primary text-white' : 'text-white/50 hover:text-white'"
            @click="$emit('toggle-unit')"
          >
            °C
          </button>
          <button 
            class="px-3 py-1.5 rounded-md text-sm font-medium transition-all"
            :class="!isCelsius ? 'bg-orange-accent text-white' : 'text-white/50 hover:text-white'"
            @click="$emit('toggle-unit')"
          >
            °F
          </button>
        </div>

        <!-- Location Button -->
        <button
          :disabled="locatingUser || !canAddMore"
          class="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/10"
          title="Use my location"
          @click="handleUseLocation"
        >
          <i v-if="locatingUser" class="fa-solid fa-spinner fa-spin text-white/60 text-sm"></i>
          <i v-else class="fa-solid fa-location-crosshairs text-white/60 text-sm"></i>
        </button>

        <!-- Add City Button [+] -->
        <button
          :disabled="!canAddMore"
          class="w-9 h-9 rounded-lg flex items-center justify-center transition-all font-bold text-lg"
          :class="canAddMore 
            ? 'bg-sky-primary hover:bg-sky-primary/80 text-white' 
            : 'bg-white/5 text-white/30 cursor-not-allowed'"
          title="Add city"
        >
          +
        </button>
      </div>
    </div>
  </header>
</template>
