<script setup>
import { ref, computed, provide, onMounted } from 'vue'
import { getPreferences, savePreferences } from '@/utils/storage'
import { useCities } from '@/composables/useCities'

// Components
import HeaderNav from '@/components/HeaderNav.vue'
import WeatherCard from '@/components/WeatherCard.vue'
import ComparisonTable from '@/components/ComparisonTable.vue'
import ForecastChart from '@/components/ForecastChart.vue'
import HistoricalView from '@/components/HistoricalView.vue'
import AlertBanner from '@/components/AlertBanner.vue'
import EmptyState from '@/components/EmptyState.vue'

// State
const activeView = ref('dashboard')
const preferences = ref(getPreferences())
const weatherData = ref({})
const isExporting = ref(false)

// Cities composable
const { 
  cities, 
  selectedCities,
  hasCities, 
  canAddMore,
  addCity, 
  removeCity, 
  reorderCities,
  selectAllCities,
  clearSelection,
  getSelectedCityObjects
} = useCities()

// Computed
const temperatureUnit = computed(() => preferences.value.temperatureUnit)
const selectedCityObjects = computed(() => getSelectedCityObjects())

const allAlerts = computed(() => {
  return Object.values(weatherData.value)
    .filter(data => data?.alerts?.length > 0)
    .flatMap(data => data.alerts.map(alert => ({
      ...alert,
      cityName: data.cityName
    })))
})

// Provide preferences to child components
provide('preferences', preferences)
provide('temperatureUnit', temperatureUnit)

// Methods
function toggleTemperatureUnit() {
  preferences.value.temperatureUnit = 
    preferences.value.temperatureUnit === 'celsius' ? 'fahrenheit' : 'celsius'
  savePreferences(preferences.value)
}

function handleAddCity(city) {
  addCity(city)
}

function handleRemoveCity(cityId) {
  removeCity(cityId)
  delete weatherData.value[cityId]
}

function handleWeatherUpdate(cityId, data) {
  weatherData.value[cityId] = data
}

function handleReorder(newOrder) {
  reorderCities(newOrder)
}

function setActiveView(view) {
  activeView.value = view
}

function goBackToDashboard() {
  activeView.value = 'dashboard'
}

// Export functionality
async function exportDashboard() {
  isExporting.value = true
  
  try {
    const { toPng } = await import('html-to-image')
    const element = document.getElementById('dashboard-content')
    
    if (element) {
      const dataUrl = await toPng(element, {
        backgroundColor: '#0f172a',
        quality: 1
      })
      
      const link = document.createElement('a')
      link.download = `weather-dashboard-${new Date().toISOString().split('T')[0]}.png`
      link.href = dataUrl
      link.click()
    }
  } catch (error) {
    console.error('Export failed:', error)
  } finally {
    isExporting.value = false
  }
}

// Lifecycle
onMounted(() => {
  preferences.value = getPreferences()
})
</script>

<template>
  <div class="min-h-screen font-body flex flex-col">
    <!-- Decorative elements -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-sky-primary/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-cool-blue/10 rounded-full blur-3xl"></div>
    </div>

    <!-- Header with inline search -->
    <HeaderNav 
      :temperature-unit="temperatureUnit"
      :can-add-more="canAddMore"
      @toggle-unit="toggleTemperatureUnit"
      @add-city="handleAddCity"
    />

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6 relative z-10 flex-1">
      <!-- Alerts Banner -->
      <TransitionGroup name="slide-up">
        <AlertBanner 
          v-for="alert in allAlerts" 
          :key="alert.event + alert.cityName"
          :alert="alert"
          class="mb-4"
        />
      </TransitionGroup>

      <!-- Max cities warning -->
      <p v-if="!canAddMore" class="text-orange-accent/80 text-sm mb-4 text-center">
        <i class="fa-solid fa-circle-info mr-1"></i>
        Maximum of 6 cities reached. Remove a city to add more.
      </p>

      <!-- Dashboard Content -->
      <div id="dashboard-content">
        <!-- Dashboard View (Default) -->
        <Transition name="fade" mode="out-in">
          <div v-if="activeView === 'dashboard'" key="dashboard">
            <EmptyState v-if="!hasCities" />
            
            <!-- City Cards Grid -->
            <TransitionGroup 
              v-else 
              name="list"
              tag="div" 
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <WeatherCard
                v-for="city in cities"
                :key="city.id"
                :city="city"
                :unit="temperatureUnit"
                @remove="handleRemoveCity"
                @weather-update="handleWeatherUpdate"
              />
            </TransitionGroup>

            <!-- Bottom Navigation Buttons (as per wireframe) -->
            <div v-if="hasCities" class="flex flex-wrap items-center justify-center gap-4 mt-8 pt-6 border-t border-white/10">
              <button 
                class="px-6 py-3 rounded-xl font-display font-medium text-white transition-all bg-white/5 border border-white/20 hover:bg-white/10 hover:border-white/30"
                @click="setActiveView('compare')"
              >
                <i class="fa-solid fa-table-columns mr-2"></i>
                Compare Cities
              </button>
              <button 
                class="px-6 py-3 rounded-xl font-display font-medium text-white transition-all bg-white/5 border border-white/20 hover:bg-white/10 hover:border-white/30"
                @click="setActiveView('forecast')"
              >
                <i class="fa-solid fa-chart-line mr-2"></i>
                View Forecast
              </button>
              <button 
                class="px-6 py-3 rounded-xl font-display font-medium text-white transition-all bg-white/5 border border-white/20 hover:bg-white/10 hover:border-white/30"
                @click="setActiveView('history')"
              >
                <i class="fa-solid fa-clock-rotate-left mr-2"></i>
                History
              </button>

            </div>
          </div>
        </Transition>

        <!-- Comparison View -->
        <Transition name="fade" mode="out-in">
          <div v-if="activeView === 'compare'" key="compare">
            <!-- Back Button -->
            <button 
              class="mb-4 px-4 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
              @click="goBackToDashboard"
            >
              <i class="fa-solid fa-arrow-left"></i>
              Back to Dashboard
            </button>
            
            <ComparisonTable 
              :cities="cities"
              :weather-data="weatherData"
              :unit="temperatureUnit"
            />
          </div>
        </Transition>

        <!-- Forecast View -->
        <Transition name="fade" mode="out-in">
          <div v-if="activeView === 'forecast'" key="forecast">
            <!-- Back Button -->
            <button 
              class="mb-4 px-4 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
              @click="goBackToDashboard"
            >
              <i class="fa-solid fa-arrow-left"></i>
              Back to Dashboard
            </button>
            
            <ForecastChart 
              :cities="cities"
              :weather-data="weatherData"
              :unit="temperatureUnit"
            />
          </div>
        </Transition>

        <!-- Historical View -->
        <Transition name="fade" mode="out-in">
          <div v-if="activeView === 'history'" key="history">
            <!-- Back Button -->
            <button 
              class="mb-4 px-4 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
              @click="goBackToDashboard"
            >
              <i class="fa-solid fa-arrow-left"></i>
              Back to Dashboard
            </button>
            
            <HistoricalView 
              :cities="cities"
              :unit="temperatureUnit"
            />
          </div>
        </Transition>
      </div>
    </main>

    <!-- Footer -->
    <footer class="py-6 text-center text-white/40 text-sm relative z-10">
      <p>Weather Dashboard &copy; {{ new Date().getFullYear() }} | Rellinxe Koffy Boni</p>
      <p class="mt-1 text-xs">Data provided by OpenWeatherMap & Visual Crossing</p>
    </footer>
  </div>
</template>
