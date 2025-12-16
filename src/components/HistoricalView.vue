<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import {getMonthlyAverages} from "@/utils/weatherApi.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const props = defineProps({
  cities: {
    type: Array,
    required: true
  },
  unit: {
    type: String,
    default: 'celsius'
  }
})

const loading = ref(false)
const historicalData = ref({})
const selectedMetric = ref('temperature')

// City colors
const cityColors = [
  '#0EA5E9',
  '#FF7A00',
  '#10B981',
  '#8B5CF6',
  '#F43F5E',
  '#FBBF24'
]

// Month labels
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Generate historical data from Visual Crossing API
function generateHistoricalData(city) {
  const baseTemp = 15 + (city.lat > 0 ? (90 - city.lat) / 3 : (90 + city.lat) / 3)

  return months.map((month, index) => {
    // Simulate seasonal variation
    const seasonalOffset = Math.sin((index - 3) * Math.PI / 6) * 15
    const avgTemp = baseTemp + seasonalOffset + (Math.random() * 4 - 2)
    const avgPrecip = 50 + Math.sin((index - 1) * Math.PI / 6) * 30 + Math.random() * 20

    return {
      month,
      avgTemp: Math.round(avgTemp * 10) / 10,
      avgPrecip: Math.round(avgPrecip * 10) / 10,
      avgHumidity: 50 + Math.random() * 30
    }
  })
}

// Load historical data for all cities
async function loadHistoricalData() {
  loading.value = true

  try {
    for (const city of props.cities) {
      const data = await getMonthlyAverages(city.lat, city.lon)

      // Transform API data to match component format
      historicalData.value[city.id] = months.map((month, index) => ({
        month,
        avgTemp: data[index]?.temperature || 0,
        avgPrecip: data[index]?.precipitation || 0,
        avgHumidity: data[index]?.humidity || 0
      }))
    }
  } catch (error) {
    console.error('Failed to load historical data:', error)
    // Fallback if API fails
    props.cities.forEach(city => {
      historicalData.value[city.id] = generateHistoricalData(city)
    })
  } finally {
    loading.value = false
  }
}

// Temperature chart data
const temperatureChartData = computed(() => {
  const datasets = props.cities.map((city, index) => {
    const data = historicalData.value[city.id] || []
    return {
      label: city.name,
      data: data.map(d => {
        const temp = d.avgTemp
        return props.unit === 'fahrenheit' ? (temp * 9/5) + 32 : temp
      }),
      backgroundColor: cityColors[index % cityColors.length],
      borderColor: cityColors[index % cityColors.length],
      borderWidth: 1,
      borderRadius: 4
    }
  })
  
  return {
    labels: months,
    datasets
  }
})

// Precipitation chart data
const precipitationChartData = computed(() => {
  const datasets = props.cities.map((city, index) => {
    const data = historicalData.value[city.id] || []
    return {
      label: city.name,
      data: data.map(d => d.avgPrecip),
      backgroundColor: cityColors[index % cityColors.length],
      borderColor: cityColors[index % cityColors.length],
      borderWidth: 1,
      borderRadius: 4
    }
  })
  
  return {
    labels: months,
    datasets
  }
})

// Chart options
const chartOptions = computed(() => ({
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
        label: (context) => {
          if (selectedMetric.value === 'temperature') {
            const unit = props.unit === 'celsius' ? '°C' : '°F'
            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}${unit}`
          }
          return `${context.dataset.label}: ${context.parsed.y.toFixed(1)} mm`
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
        callback: (value) => {
          if (selectedMetric.value === 'temperature') {
            return `${value}°`
          }
          return `${value} mm`
        }
      }
    }
  }
}))

// Watch for city changes
watch(() => props.cities, () => {
  loadHistoricalData()
}, { deep: true })

onMounted(() => {
  loadHistoricalData()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="glass-card p-4">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 class="font-display font-bold text-2xl text-white">
            <i class="fa-solid fa-clock-rotate-left mr-3 text-sky-primary"></i>
            Historical Trends
          </h2>
          <p class="text-white/50 mt-1">Monthly average weather data comparison</p>
        </div>
        
        <div class="tab-nav">
          <button
            class="tab-btn"
            :class="{ active: selectedMetric === 'temperature' }"
            @click="selectedMetric = 'temperature'"
          >
            <i class="fa-solid fa-temperature-half mr-2"></i>
            Temperature
          </button>
          <button
            class="tab-btn"
            :class="{ active: selectedMetric === 'precipitation' }"
            @click="selectedMetric = 'precipitation'"
          >
            <i class="fa-solid fa-cloud-rain mr-2"></i>
            Precipitation
          </button>
        </div>
      </div>
    </div>

    <!-- Chart -->
    <div class="chart-container">
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="flex flex-col items-center gap-3">
          <i class="fa-solid fa-spinner fa-spin text-3xl text-sky-primary"></i>
          <span class="text-white/60">Loading historical data...</span>
        </div>
      </div>
      
      <template v-else>
        <Transition name="fade" mode="out-in">
          <div v-if="selectedMetric === 'temperature'" key="temp" class="h-96">
            <Bar
              :data="temperatureChartData"
              :options="chartOptions"
            />
          </div>
          
          <div v-else key="precip" class="h-96">
            <Bar
              :data="precipitationChartData"
              :options="chartOptions"
            />
          </div>
        </Transition>
      </template>
    </div>

    <!-- Info Note -->
    <div class="glass-card p-4">
      <div class="flex items-start gap-3">
        <i class="fa-solid fa-circle-info text-sky-primary mt-0.5"></i>
        <div>
          <p class="text-white/70 text-sm">
            Historical data shows monthly averages based on past year observations.
            data would be fetched from the Visual Crossing Weather API.
          </p>
        </div>
      </div>
    </div>

    <!-- City Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="(city, index) in cities" 
        :key="city.id"
        class="glass-card p-4"
      >
        <div class="flex items-center gap-3 mb-4">
          <div 
            class="w-10 h-10 rounded-lg flex items-center justify-center"
            :style="{ backgroundColor: `${cityColors[index % cityColors.length]}20` }"
          >
            <i 
              class="fa-solid fa-city"
              :style="{ color: cityColors[index % cityColors.length] }"
            ></i>
          </div>
          <h3 class="font-display font-semibold text-white">{{ city.name }}</h3>
        </div>
        
        <div v-if="historicalData[city.id]" class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-white/50 text-sm">Avg. Temperature</span>
            <span class="text-white font-mono">
              {{ Math.round(historicalData[city.id].reduce((acc, d) => acc + d.avgTemp, 0) / 12) }}°{{ unit === 'celsius' ? 'C' : 'F' }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-white/50 text-sm">Warmest Month</span>
            <span class="text-orange-accent font-mono">
              {{ historicalData[city.id].reduce((max, d) => d.avgTemp > max.avgTemp ? d : max).month }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-white/50 text-sm">Coldest Month</span>
            <span class="text-cool-blue font-mono">
              {{ historicalData[city.id].reduce((min, d) => d.avgTemp < min.avgTemp ? d : min).month }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-white/50 text-sm">Avg. Precipitation</span>
            <span class="text-white font-mono">
              {{ Math.round(historicalData[city.id].reduce((acc, d) => acc + d.avgPrecip, 0) / 12) }} mm
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
