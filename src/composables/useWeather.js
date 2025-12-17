import { ref, computed } from 'vue'
import { getCurrentWeather, getForecast, getWeatherAlerts } from '@/utils/weatherApi'
import { getPreferences } from '@/utils/storage'
import { convertTemperature, processForecastData } from '@/utils/helpers'

/**
 * Composable for managing weather data for a city
 * @param {Object} city - City object with lat, lon, name
 */
export function useWeather(city) {
  const weather = ref(null)
  const forecast = ref(null)
  const alerts = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lastUpdated = ref(null)

  const preferences = getPreferences()
  const unit = ref(preferences.temperatureUnit)

  // Computed values for display
  const currentTemp = computed(() => {
    if (!weather.value) return null
    const temp = weather.value.main.temp
    return unit.value === 'fahrenheit' 
      ? convertTemperature(temp, 'celsius', 'fahrenheit')
      : temp
  })

  const feelsLike = computed(() => {
    if (!weather.value) return null
    const temp = weather.value.main.feels_like
    return unit.value === 'fahrenheit'
      ? convertTemperature(temp, 'celsius', 'fahrenheit')
      : temp
  })

  const tempHigh = computed(() => {
    if (!weather.value) return null
    const temp = weather.value.main.temp_max
    return unit.value === 'fahrenheit'
      ? convertTemperature(temp, 'celsius', 'fahrenheit')
      : temp
  })

  const tempLow = computed(() => {
    if (!weather.value) return null
    const temp = weather.value.main.temp_min
    return unit.value === 'fahrenheit'
      ? convertTemperature(temp, 'celsius', 'fahrenheit')
      : temp
  })

  const dailyForecast = computed(() => {
    if (!forecast.value?.list) return []
    const processed = processForecastData(forecast.value.list)
    
    if (unit.value === 'fahrenheit') {
      return processed.map(day => ({
        ...day,
        tempMin: convertTemperature(day.tempMin, 'celsius', 'fahrenheit'),
        tempMax: convertTemperature(day.tempMax, 'celsius', 'fahrenheit'),
        tempAvg: convertTemperature(day.tempAvg, 'celsius', 'fahrenheit')
      }))
    }
    
    return processed
  })

  const hasAlerts = computed(() => alerts.value.length > 0)

  /**
   * Fetch all weather data for the city
   */
  async function fetchWeatherData() {
    if (!city?.lat || !city?.lon) return

    loading.value = true
    error.value = null

    try {
      // Fetch current weather
      const weatherData = await getCurrentWeather(city.lat, city.lon, 'metric')
      weather.value = weatherData

      // Fetch forecast
      const forecastData = await getForecast(city.lat, city.lon, 'metric')
      forecast.value = forecastData

      // Fetch alerts
      try {
        const alertsData = await getWeatherAlerts(city.lat, city.lon)
        alerts.value = alertsData
      } catch (e) {
        // Alerts might fail for free API tier
        alerts.value = []
      }

      lastUpdated.value = new Date()
    } catch (err) {
      error.value = err.message || 'Failed to fetch weather data'
      console.error('Weather fetch error:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Update temperature unit
   * @param {string} newUnit - 'celsius' or 'fahrenheit'
   */
  function setUnit(newUnit) {
    unit.value = newUnit
  }

  /**
   * Refresh weather data
   */
  async function refresh() {
    await fetchWeatherData()
  }

  // Initial fetch
  if (city?.lat && city?.lon) {
    fetchWeatherData()
  }

  return {
    weather,
    forecast,
    alerts,
    loading,
    error,
    lastUpdated,
    unit,
    currentTemp,
    feelsLike,
    tempHigh,
    tempLow,
    dailyForecast,
    hasAlerts,
    fetchWeatherData,
    setUnit,
    refresh
  }
}
