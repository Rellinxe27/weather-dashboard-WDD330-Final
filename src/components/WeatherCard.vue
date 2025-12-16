<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useWeather } from '@/composables/useWeather'
import { formatTemperature, formatHumidity, formatWind, formatDate, getRelativeTime, getWeatherIcon, getTemperatureColor } from '@/utils/helpers'

const props = defineProps({
  city: {
    type: Object,
    required: true
  },
  unit: {
    type: String,
    default: 'celsius'
  }
})

const emit = defineEmits(['remove', 'weather-update'])

const {
  weather,
  forecast,
  alerts,
  loading,
  error,
  lastUpdated,
  currentTemp,
  feelsLike,
  tempHigh,
  tempLow,
  dailyForecast,
  hasAlerts,
  fetchWeatherData,
  setUnit,
  refresh
} = useWeather(props.city)

const isExpanded = ref(false)
const refreshInterval = ref(null)

// Watch for unit changes
watch(() => props.unit, (newUnit) => {
  setUnit(newUnit)
})

// Emit weather data to parent
watch([weather, alerts], () => {
  if (weather.value) {
    emit('weather-update', props.city.id, {
      weather: weather.value,
      forecast: forecast.value,
      alerts: alerts.value,
      cityName: props.city.name
    })
  }
}, { deep: true })

// Computed values
const weatherIcon = computed(() => {
  if (!weather.value) return { icon: 'fa-cloud', color: 'text-gray-300' }
  return getWeatherIcon(weather.value.weather[0].icon)
})

const condition = computed(() => {
  if (!weather.value) return ''
  // Capitalize first letter
  const desc = weather.value.weather[0].main
  return desc.charAt(0).toUpperCase() + desc.slice(1)
})

const humidity = computed(() => {
  if (!weather.value) return ''
  return formatHumidity(weather.value.main.humidity)
})

const wind = computed(() => {
  if (!weather.value) return ''
  return formatWind(
    weather.value.wind.speed,
    weather.value.wind.deg,
    props.unit === 'celsius' ? 'metric' : 'imperial'
  )
})

const tempColorClass = computed(() => {
  if (!currentTemp.value) return ''
  const tempC = props.unit === 'fahrenheit' 
    ? (currentTemp.value - 32) * 5/9 
    : currentTemp.value
  return getTemperatureColor(tempC)
})

const displayTemp = computed(() => {
  if (currentTemp.value === null) return '--'
  return `${Math.round(currentTemp.value)}°C`
})

const displayHigh = computed(() => {
  if (tempHigh.value === null) return '--'
  return `H:${Math.round(tempHigh.value)}`
})

const displayLow = computed(() => {
  if (tempLow.value === null) return '--'
  return `L:${Math.round(tempLow.value)}`
})

// Methods
function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

function handleRefresh() {
  refresh()
}

function handleRemove() {
  emit('remove', props.city.id)
}

// Auto-refresh every 5 minutes
onMounted(() => {
  refreshInterval.value = setInterval(() => {
    refresh()
  }, 300000)
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})
</script>

<template>
  <div class="glass-card-hover p-5 relative group">
    <!-- Loading Overlay -->
    <div 
      v-if="loading" 
      class="absolute inset-0 bg-dark-navy/50 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10"
    >
      <i class="fa-solid fa-spinner fa-spin text-2xl text-sky-primary"></i>
    </div>

    <!-- Alert Badge (Yellow dot as in wireframe) -->
    <div 
      v-if="hasAlerts" 
      class="absolute top-3 right-3 w-3 h-3 bg-yellow-400 rounded-full"
      title="Weather alert"
    ></div>

    <!-- Remove Button (appears on hover) -->
    <button 
      class="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/10 hover:bg-alert-red/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
      :class="{ 'right-8': hasAlerts }"
      title="Remove city"
      @click="handleRemove"
    >
      <i class="fa-solid fa-xmark text-white/60 hover:text-alert-red text-xs"></i>
    </button>

    <!-- City Name -->
    <h3 class="font-display font-semibold text-lg text-white mb-4">
      {{ city.name }}
    </h3>

    <!-- Error State -->
    <div v-if="error" class="text-center py-6">
      <i class="fa-solid fa-cloud-exclamation text-3xl text-alert-red mb-2"></i>
      <p class="text-white/60 text-sm">{{ error }}</p>
      <button 
        class="mt-2 text-sky-primary text-sm hover:underline"
        @click="handleRefresh"
      >
        Retry
      </button>
    </div>

    <!-- Weather Content -->
    <template v-else-if="weather">
      <!-- Large Temperature -->
      <p 
        class="font-mono text-5xl font-light mb-4"
        :class="tempColorClass"
      >
        {{ displayTemp }}
      </p>

      <!-- Weather Icon & Condition -->
      <div class="flex items-center gap-3 mb-4">
        <div class="weather-icon-container w-10 h-10">
          <i 
            :class="['fa-solid', weatherIcon.icon, weatherIcon.color]"
            class="text-3xl"
          ></i>
        </div>
        <span class="text-white/80 text-lg">{{ condition }}</span>
      </div>

      <!-- High / Low -->
      <div class="flex items-center gap-4 text-sm text-white/60">
        <span>{{ displayHigh }}</span>
        <span>{{ displayLow }}</span>
      </div>

      <!-- Expandable Details (click to show more) -->
      <button 
        class="w-full mt-4 pt-3 border-t border-white/5 text-white/40 hover:text-white/60 text-xs transition-colors flex items-center justify-center gap-1"
        @click="toggleExpand"
      >
        <span>{{ isExpanded ? 'Less' : 'More' }}</span>
        <i 
          class="fa-solid fa-chevron-down transition-transform text-[10px]"
          :class="{ 'rotate-180': isExpanded }"
        ></i>
      </button>

      <!-- Expanded Content -->
      <Transition name="slide-up">
        <div v-if="isExpanded" class="mt-3 pt-3 border-t border-white/5 space-y-3">
          <!-- Stats Grid -->
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p class="text-white/40 text-xs">Humidity</p>
              <p class="text-white">{{ humidity }}</p>
            </div>
            <div>
              <p class="text-white/40 text-xs">Wind</p>
              <p class="text-white">{{ wind }}</p>
            </div>
            <div>
              <p class="text-white/40 text-xs">Pressure</p>
              <p class="text-white">{{ weather.main.pressure }} hPa</p>
            </div>
            <div>
              <p class="text-white/40 text-xs">Visibility</p>
              <p class="text-white">{{ (weather.visibility / 1000).toFixed(1) }} km</p>
            </div>
          </div>

          <!-- Mini 5-Day Forecast -->
          <div class="pt-3 border-t border-white/5">
            <p class="text-white/40 text-xs mb-2">5-Day Forecast</p>
            <div class="grid grid-cols-5 gap-1">
              <div 
                v-for="day in dailyForecast"
                :key="day.date"
                class="text-center"
              >
                <p class="text-white/40 text-[10px] mb-1">
                  {{ formatDate(day.date, 'day') }}
                </p>
                <i 
                  :class="['fa-solid', getWeatherIcon(day.icon).icon, getWeatherIcon(day.icon).color]"
                  class="text-sm mb-1"
                ></i>
                <p class="text-white font-mono text-xs">
                  {{ Math.round(day.tempMax) }}°
                </p>
                <p class="text-white/40 font-mono text-[10px]">
                  {{ Math.round(day.tempMin) }}°
                </p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </template>
  </div>
</template>
