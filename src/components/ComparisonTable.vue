<script setup>
import { computed } from 'vue'
import { formatTemperature, formatHumidity, getWeatherIcon } from '@/utils/helpers'

const props = defineProps({
  cities: {
    type: Array,
    required: true
  },
  weatherData: {
    type: Object,
    required: true
  },
  unit: {
    type: String,
    default: 'celsius'
  }
})

// Metrics to compare
const metrics = [
  { 
    key: 'temperature', 
    label: 'Temperature', 
    icon: 'fa-temperature-half',
    getValue: (data, unit) => {
      if (!data?.weather?.main?.temp) return '--'
      const temp = data.weather.main.temp
      return formatTemperature(temp, unit)
    },
    getColor: (data) => {
      if (!data?.weather?.main?.temp) return ''
      const temp = data.weather.main.temp
      if (temp <= 10) return 'text-cool-blue'
      if (temp >= 30) return 'text-orange-accent'
      return 'text-white'
    },
    highlight: 'max'
  },
  { 
    key: 'feels_like', 
    label: 'Feels Like', 
    icon: 'fa-user-large',
    getValue: (data, unit) => {
      if (!data?.weather?.main?.feels_like) return '--'
      const temp = data.weather.main.feels_like
      return formatTemperature(temp, unit)
    },
    getColor: () => 'text-white'
  },
  { 
    key: 'humidity', 
    label: 'Humidity', 
    icon: 'fa-droplet',
    getValue: (data) => {
      if (!data?.weather?.main?.humidity) return '--'
      return formatHumidity(data.weather.main.humidity)
    },
    getColor: (data) => {
      if (!data?.weather?.main?.humidity) return ''
      const humidity = data.weather.main.humidity
      if (humidity >= 80) return 'text-sky-primary'
      if (humidity <= 30) return 'text-orange-accent'
      return 'text-white'
    },
    highlight: 'max'
  },
  { 
    key: 'wind', 
    label: 'Wind Speed', 
    icon: 'fa-wind',
    getValue: (data, unit) => {
      if (!data?.weather?.wind?.speed) return '--'
      const speed = data.weather.wind.speed
      const displaySpeed = unit === 'celsius' ? Math.round(speed * 3.6) : Math.round(speed * 2.237)
      const unitLabel = unit === 'celsius' ? 'km/h' : 'mph'
      return `${displaySpeed} ${unitLabel}`
    },
    getColor: (data) => {
      if (!data?.weather?.wind?.speed) return ''
      const speed = data.weather.wind.speed * 3.6
      if (speed >= 40) return 'text-alert-red'
      if (speed >= 20) return 'text-orange-accent'
      return 'text-white'
    },
    highlight: 'max'
  },
  { 
    key: 'pressure', 
    label: 'Pressure', 
    icon: 'fa-gauge',
    getValue: (data) => {
      if (!data?.weather?.main?.pressure) return '--'
      return `${data.weather.main.pressure} hPa`
    },
    getColor: () => 'text-white'
  },
  { 
    key: 'visibility', 
    label: 'Visibility', 
    icon: 'fa-eye',
    getValue: (data, unit) => {
      if (!data?.weather?.visibility) return '--'
      const vis = data.weather.visibility
      if (unit === 'celsius') {
        return `${(vis / 1000).toFixed(1)} km`
      }
      return `${(vis / 1609.34).toFixed(1)} mi`
    },
    getColor: (data) => {
      if (!data?.weather?.visibility) return ''
      const vis = data.weather.visibility
      if (vis >= 10000) return 'text-success-green'
      if (vis <= 1000) return 'text-alert-red'
      return 'text-white'
    },
    highlight: 'max'
  },
  { 
    key: 'condition', 
    label: 'Condition', 
    icon: 'fa-cloud',
    getValue: (data) => {
      if (!data?.weather?.weather?.[0]?.description) return '--'
      return data.weather.weather[0].description
    },
    getColor: () => 'text-white capitalize'
  }
]

// Get city data
const getCityData = (cityId) => {
  return props.weatherData[cityId] || null
}

// Check if a value should be highlighted as best/worst
const isHighlighted = computed(() => {
  const highlights = {}
  
  metrics.forEach(metric => {
    if (!metric.highlight) return
    
    let values = props.cities.map(city => {
      const data = getCityData(city.id)
      if (!data?.weather) return null
      
      switch (metric.key) {
        case 'temperature':
          return data.weather.main.temp
        case 'humidity':
          return data.weather.main.humidity
        case 'wind':
          return data.weather.wind.speed
        case 'visibility':
          return data.weather.visibility
        default:
          return null
      }
    })
    
    values = values.filter(v => v !== null)
    if (values.length === 0) return
    
    const maxVal = Math.max(...values)
    const minVal = Math.min(...values)
    
    props.cities.forEach(city => {
      const data = getCityData(city.id)
      if (!data?.weather) return
      
      let val
      switch (metric.key) {
        case 'temperature':
          val = data.weather.main.temp
          break
        case 'humidity':
          val = data.weather.main.humidity
          break
        case 'wind':
          val = data.weather.wind.speed
          break
        case 'visibility':
          val = data.weather.visibility
          break
        default:
          return
      }
      
      const key = `${city.id}-${metric.key}`
      if (val === maxVal && metric.highlight === 'max') {
        highlights[key] = 'max'
      } else if (val === minVal && metric.highlight === 'min') {
        highlights[key] = 'min'
      }
    })
  })
  
  return highlights
})
</script>

<template>
  <div class="glass-card overflow-hidden">
    <!-- Header -->
    <div class="p-6 border-b border-white/5">
      <h2 class="font-display font-bold text-2xl text-white">
        <i class="fa-solid fa-table-columns mr-3 text-sky-primary"></i>
        City Comparison
      </h2>
      <p class="text-white/50 mt-1">Side-by-side weather metrics comparison</p>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="comparison-table">
        <thead>
          <tr>
            <th class="w-40">Metric</th>
            <th 
              v-for="city in cities" 
              :key="city.id"
              class="min-w-32"
            >
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-sky-primary/20 flex items-center justify-center">
                  <i 
                    v-if="getCityData(city.id)?.weather"
                    :class="['fa-solid', getWeatherIcon(getCityData(city.id).weather.weather[0].icon).icon, getWeatherIcon(getCityData(city.id).weather.weather[0].icon).color]"
                    class="text-sm"
                  ></i>
                  <i v-else class="fa-solid fa-city text-sky-primary text-sm"></i>
                </div>
                <div>
                  <span class="text-white font-medium normal-case">{{ city.name }}</span>
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="metric in metrics" :key="metric.key">
            <td>
              <div class="flex items-center gap-3">
                <i :class="['fa-solid', metric.icon, 'text-white/40']"></i>
                <span class="text-white/80">{{ metric.label }}</span>
              </div>
            </td>
            <td 
              v-for="city in cities" 
              :key="city.id"
              class="font-mono"
            >
              <div class="flex items-center gap-2">
                <span :class="[
                  metric.getColor(getCityData(city.id)),
                  {
                    'font-bold': isHighlighted[`${city.id}-${metric.key}`]
                  }
                ]">
                  {{ metric.getValue(getCityData(city.id), unit) }}
                </span>
                <span 
                  v-if="isHighlighted[`${city.id}-${metric.key}`] === 'max'"
                  class="badge-info text-xs px-2 py-0.5"
                >
                  Highest
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Legend -->
    <div class="p-4 bg-white/[0.02] border-t border-white/5">
      <div class="flex items-center justify-center gap-6 text-sm">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-sky-primary"></span>
          <span class="text-white/50">Highest value highlighted</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-orange-accent"></span>
          <span class="text-white/50">Hot/High values</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-cool-blue"></span>
          <span class="text-white/50">Cold/Low values</span>
        </div>
      </div>
    </div>
  </div>
</template>
