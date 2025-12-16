<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Line, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { processForecastData, formatDate, convertTemperature } from '@/utils/helpers'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

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

const chartType = ref('temperature')

// City colors for chart lines
const cityColors = [
  { border: '#0EA5E9', background: 'rgba(14, 165, 233, 0.1)' },
  { border: '#FF7A00', background: 'rgba(255, 122, 0, 0.1)' },
  { border: '#10B981', background: 'rgba(16, 185, 129, 0.1)' },
  { border: '#8B5CF6', background: 'rgba(139, 92, 246, 0.1)' },
  { border: '#F43F5E', background: 'rgba(244, 63, 94, 0.1)' },
  { border: '#FBBF24', background: 'rgba(251, 191, 36, 0.1)' }
]

// Get forecast data for a city
const getCityForecast = (cityId) => {
  const data = props.weatherData[cityId]
  if (!data?.forecast?.list) return []
  return processForecastData(data.forecast.list)
}

// Temperature chart data
const temperatureChartData = computed(() => {
  const labels = []
  const datasets = []
  
  // Get labels from first city with data
  for (const city of props.cities) {
    const forecast = getCityForecast(city.id)
    if (forecast.length > 0) {
      forecast.forEach(day => {
        const label = formatDate(day.date, 'day')
        if (!labels.includes(label)) {
          labels.push(label)
        }
      })
      break
    }
  }
  
  // Create datasets for each city
  props.cities.forEach((city, index) => {
    const forecast = getCityForecast(city.id)
    const color = cityColors[index % cityColors.length]
    
    if (forecast.length > 0) {
      // Max temperature line
      datasets.push({
        label: `${city.name} (High)`,
        data: forecast.map(day => {
          const temp = day.tempMax
          return props.unit === 'fahrenheit' 
            ? convertTemperature(temp, 'celsius', 'fahrenheit')
            : temp
        }),
        borderColor: color.border,
        backgroundColor: color.background,
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      })
      
      // Min temperature line (dashed)
      datasets.push({
        label: `${city.name} (Low)`,
        data: forecast.map(day => {
          const temp = day.tempMin
          return props.unit === 'fahrenheit' 
            ? convertTemperature(temp, 'celsius', 'fahrenheit')
            : temp
        }),
        borderColor: color.border,
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5
      })
    }
  })
  
  return { labels, datasets }
})

// Humidity chart data
const humidityChartData = computed(() => {
  const labels = []
  const datasets = []
  
  // Get labels
  for (const city of props.cities) {
    const forecast = getCityForecast(city.id)
    if (forecast.length > 0) {
      forecast.forEach(day => {
        const label = formatDate(day.date, 'day')
        if (!labels.includes(label)) {
          labels.push(label)
        }
      })
      break
    }
  }
  
  // Create datasets
  props.cities.forEach((city, index) => {
    const forecast = getCityForecast(city.id)
    const color = cityColors[index % cityColors.length]
    
    if (forecast.length > 0) {
      datasets.push({
        label: city.name,
        data: forecast.map(day => day.humidity),
        backgroundColor: color.border,
        borderColor: color.border,
        borderWidth: 1,
        borderRadius: 4
      })
    }
  })
  
  return { labels, datasets }
})

// Wind chart data
const windChartData = computed(() => {
  const labels = []
  const datasets = []
  
  // Get labels
  for (const city of props.cities) {
    const forecast = getCityForecast(city.id)
    if (forecast.length > 0) {
      forecast.forEach(day => {
        const label = formatDate(day.date, 'day')
        if (!labels.includes(label)) {
          labels.push(label)
        }
      })
      break
    }
  }
  
  // Create datasets
  props.cities.forEach((city, index) => {
    const forecast = getCityForecast(city.id)
    const color = cityColors[index % cityColors.length]
    
    if (forecast.length > 0) {
      datasets.push({
        label: city.name,
        data: forecast.map(day => {
          const speed = day.wind
          return props.unit === 'celsius' 
            ? Math.round(speed * 3.6) 
            : Math.round(speed * 2.237)
        }),
        borderColor: color.border,
        backgroundColor: color.background,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      })
    }
  })
  
  return { labels, datasets }
})

// Chart options
const temperatureChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false
  },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: 'rgba(255, 255, 255, 0.7)',
        font: { family: 'DM Sans' },
        usePointStyle: true,
        padding: 20
      }
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      titleColor: '#fff',
      bodyColor: 'rgba(255, 255, 255, 0.8)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      titleFont: { family: 'DM Sans', weight: 'bold' },
      bodyFont: { family: 'JetBrains Mono' },
      callbacks: {
        label: (context) => {
          const unit = props.unit === 'celsius' ? '°C' : '°F'
          return `${context.dataset.label}: ${Math.round(context.parsed.y)}${unit}`
        }
      }
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { family: 'DM Sans' } }
    },
    y: {
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      ticks: { 
        color: 'rgba(255, 255, 255, 0.5)', 
        font: { family: 'JetBrains Mono' },
        callback: (value) => `${value}°`
      }
    }
  }
}))

const humidityChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: 'rgba(255, 255, 255, 0.7)',
        font: { family: 'DM Sans' },
        usePointStyle: true,
        padding: 20
      }
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      titleColor: '#fff',
      bodyColor: 'rgba(255, 255, 255, 0.8)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (context) => `${context.dataset.label}: ${context.parsed.y}%`
      }
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { family: 'DM Sans' } }
    },
    y: {
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      ticks: { 
        color: 'rgba(255, 255, 255, 0.5)', 
        font: { family: 'JetBrains Mono' },
        callback: (value) => `${value}%`
      },
      min: 0,
      max: 100
    }
  }
}))

const windChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false
  },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: 'rgba(255, 255, 255, 0.7)',
        font: { family: 'DM Sans' },
        usePointStyle: true,
        padding: 20
      }
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      titleColor: '#fff',
      bodyColor: 'rgba(255, 255, 255, 0.8)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (context) => {
          const unit = props.unit === 'celsius' ? 'km/h' : 'mph'
          return `${context.dataset.label}: ${context.parsed.y} ${unit}`
        }
      }
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { family: 'DM Sans' } }
    },
    y: {
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      ticks: { 
        color: 'rgba(255, 255, 255, 0.5)', 
        font: { family: 'JetBrains Mono' }
      },
      min: 0
    }
  }
}))

// Check if we have forecast data
const hasForecastData = computed(() => {
  return props.cities.some(city => getCityForecast(city.id).length > 0)
})
</script>

<template>
  <div class="space-y-6">
    <!-- Chart Type Selection -->
    <div class="glass-card p-4">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <h2 class="font-display font-bold text-2xl text-white">
          <i class="fa-solid fa-chart-line mr-3 text-sky-primary"></i>
          5-Day Forecast
        </h2>
        
        <div class="tab-nav">
          <button
            class="tab-btn"
            :class="{ active: chartType === 'temperature' }"
            @click="chartType = 'temperature'"
          >
            <i class="fa-solid fa-temperature-half mr-2"></i>
            Temperature
          </button>
          <button
            class="tab-btn"
            :class="{ active: chartType === 'humidity' }"
            @click="chartType = 'humidity'"
          >
            <i class="fa-solid fa-droplet mr-2"></i>
            Humidity
          </button>
          <button
            class="tab-btn"
            :class="{ active: chartType === 'wind' }"
            @click="chartType = 'wind'"
          >
            <i class="fa-solid fa-wind mr-2"></i>
            Wind
          </button>
        </div>
      </div>
    </div>

    <!-- Chart Container -->
    <div class="chart-container">
      <div v-if="!hasForecastData" class="text-center py-12">
        <i class="fa-solid fa-chart-line text-4xl text-white/20 mb-4"></i>
        <p class="text-white/50">Loading forecast data...</p>
      </div>
      
      <template v-else>
        <!-- Temperature Chart -->
        <Transition name="fade" mode="out-in">
          <div v-if="chartType === 'temperature'" key="temp" class="h-96">
            <Line
              :data="temperatureChartData"
              :options="temperatureChartOptions"
            />
          </div>
          
          <!-- Humidity Chart -->
          <div v-else-if="chartType === 'humidity'" key="humidity" class="h-96">
            <Bar
              :data="humidityChartData"
              :options="humidityChartOptions"
            />
          </div>
          
          <!-- Wind Chart -->
          <div v-else-if="chartType === 'wind'" key="wind" class="h-96">
            <Line
              :data="windChartData"
              :options="windChartOptions"
            />
          </div>
        </Transition>
      </template>
    </div>

    <!-- City Legend -->
    <div class="glass-card p-4">
      <div class="flex flex-wrap items-center justify-center gap-6">
        <div 
          v-for="(city, index) in cities" 
          :key="city.id"
          class="flex items-center gap-2"
        >
          <span 
            class="w-4 h-4 rounded-full"
            :style="{ backgroundColor: cityColors[index % cityColors.length].border }"
          ></span>
          <span class="text-white/70 text-sm">{{ city.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
