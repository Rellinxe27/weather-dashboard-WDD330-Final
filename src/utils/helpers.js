/**
 * Convert temperature between Celsius and Fahrenheit
 * @param {number} temp - Temperature value
 * @param {string} from - Source unit ('celsius' or 'fahrenheit')
 * @param {string} to - Target unit ('celsius' or 'fahrenheit')
 * @returns {number} Converted temperature
 */
export function convertTemperature(temp, from, to) {
  if (from === to) return temp
  
  if (from === 'celsius' && to === 'fahrenheit') {
    return (temp * 9/5) + 32
  }
  
  if (from === 'fahrenheit' && to === 'celsius') {
    return (temp - 32) * 5/9
  }
  
  return temp
}

/**
 * Format temperature for display
 * @param {number} temp - Temperature value
 * @param {string} unit - 'celsius' or 'fahrenheit'
 * @param {boolean} showUnit - Whether to show the unit symbol
 * @returns {string} Formatted temperature
 */
export function formatTemperature(temp, unit = 'celsius', showUnit = true) {
  const rounded = Math.round(temp)
  const symbol = unit === 'celsius' ? '°C' : '°F'
  return showUnit ? `${rounded}${symbol}` : `${rounded}°`
}

/**
 * Format date for display
 * @param {Date|string|number} date - Date to format
 * @param {string} format - 'full', 'short', 'time', 'day', 'month'
 * @returns {string} Formatted date
 */
export function formatDate(date, format = 'full') {
  const d = new Date(date)
  
  const options = {
    full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
    short: { month: 'short', day: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' },
    day: { weekday: 'short' },
    dayFull: { weekday: 'long' },
    month: { month: 'long' },
    monthShort: { month: 'short' }
  }
  
  return d.toLocaleDateString('en-US', options[format] || options.full)
}

/**
 * Format time for display
 * @param {Date|string|number} date - Date to format
 * @param {boolean} use24Hour - Use 24-hour format
 * @returns {string} Formatted time
 */
export function formatTime(date, use24Hour = false) {
  const d = new Date(date)
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: !use24Hour
  })
}

/**
 * Get relative time (e.g., "2 hours ago")
 * @param {Date|string|number} date - Date to compare
 * @returns {string} Relative time string
 */
export function getRelativeTime(date) {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now - past
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffSecs < 60) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  
  return formatDate(date, 'short')
}

/**
 * Format wind speed with direction
 * @param {number} speed - Wind speed
 * @param {number} deg - Wind direction in degrees
 * @param {string} unit - 'metric' or 'imperial'
 * @returns {string} Formatted wind string
 */
export function formatWind(speed, deg, unit = 'metric') {
  const direction = getWindDirection(deg)
  const speedUnit = unit === 'metric' ? 'km/h' : 'mph'
  const displaySpeed = unit === 'metric' ? Math.round(speed * 3.6) : Math.round(speed)
  return `${displaySpeed} ${speedUnit} ${direction}`
}

/**
 * Get cardinal direction from degrees
 * @param {number} deg - Direction in degrees
 * @returns {string} Cardinal direction
 */
export function getWindDirection(deg) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(deg / 22.5) % 16
  return directions[index]
}

/**
 * Format humidity percentage
 * @param {number} humidity - Humidity value (0-100)
 * @returns {string} Formatted humidity
 */
export function formatHumidity(humidity) {
  return `${Math.round(humidity)}%`
}

/**
 * Format visibility
 * @param {number} visibility - Visibility in meters
 * @param {string} unit - 'metric' or 'imperial'
 * @returns {string} Formatted visibility
 */
export function formatVisibility(visibility, unit = 'metric') {
  if (unit === 'metric') {
    if (visibility >= 1000) {
      return `${(visibility / 1000).toFixed(1)} km`
    }
    return `${visibility} m`
  }
  
  // Convert to miles
  const miles = visibility / 1609.34
  return `${miles.toFixed(1)} mi`
}

/**
 * Format pressure
 * @param {number} pressure - Pressure in hPa
 * @param {string} unit - 'hPa' or 'inHg'
 * @returns {string} Formatted pressure
 */
export function formatPressure(pressure, unit = 'hPa') {
  if (unit === 'inHg') {
    return `${(pressure * 0.02953).toFixed(2)} inHg`
  }
  return `${pressure} hPa`
}

/**
 * Get weather condition description
 * @param {string} condition - Weather condition code
 * @returns {string} Human-readable description
 */
export function getConditionDescription(condition) {
  const descriptions = {
    'Clear': 'Clear skies',
    'Clouds': 'Cloudy',
    'Rain': 'Rainy',
    'Drizzle': 'Light rain',
    'Thunderstorm': 'Thunderstorm',
    'Snow': 'Snowy',
    'Mist': 'Misty',
    'Fog': 'Foggy',
    'Haze': 'Hazy',
    'Dust': 'Dusty',
    'Sand': 'Sandy',
    'Ash': 'Volcanic ash',
    'Squall': 'Squall',
    'Tornado': 'Tornado'
  }
  
  return descriptions[condition] || condition
}

/**
 * Get UV index description and color
 * @param {number} uvi - UV index value
 * @returns {Object} Description and color class
 */
export function getUVIndexInfo(uvi) {
  if (uvi <= 2) return { level: 'Low', color: 'text-success-green', bgColor: 'bg-success-green/20' }
  if (uvi <= 5) return { level: 'Moderate', color: 'text-yellow-400', bgColor: 'bg-yellow-400/20' }
  if (uvi <= 7) return { level: 'High', color: 'text-orange-accent', bgColor: 'bg-orange-accent/20' }
  if (uvi <= 10) return { level: 'Very High', color: 'text-alert-red', bgColor: 'bg-alert-red/20' }
  return { level: 'Extreme', color: 'text-purple-500', bgColor: 'bg-purple-500/20' }
}

/**
 * Get temperature color class based on value
 * @param {number} temp - Temperature in Celsius
 * @returns {string} Tailwind color class
 */
export function getTemperatureColor(temp) {
  if (temp <= 0) return 'temp-cold'
  if (temp <= 10) return 'text-cyan-300'
  if (temp <= 20) return 'text-white'
  if (temp <= 30) return 'text-orange-300'
  return 'temp-hot'
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit time in ms
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Generate unique ID
 * @returns {string} Unique identifier
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Calculate sunrise/sunset times display
 * @param {number} timestamp - Unix timestamp
 * @param {number} timezone - Timezone offset in seconds
 * @returns {string} Formatted time
 */
export function formatSunTime(timestamp, timezone = 0) {
  const date = new Date((timestamp + timezone) * 1000)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC'
  })
}

/**
 * Get day/night status based on current time and sun times
 * @param {number} current - Current timestamp
 * @param {number} sunrise - Sunrise timestamp
 * @param {number} sunset - Sunset timestamp
 * @returns {boolean} True if daytime
 */
export function isDaytime(current, sunrise, sunset) {
  return current >= sunrise && current < sunset
}

/**
 * Process forecast data into daily summaries
 * @param {Array} forecastList - Forecast data list
 * @returns {Array} Daily summaries
 */
export function processForecastData(forecastList) {
  const dailyData = {}
  
  forecastList.forEach(item => {
    const date = new Date(item.dt * 1000).toDateString()
    
    if (!dailyData[date]) {
      dailyData[date] = {
        date: new Date(item.dt * 1000),
        temps: [],
        conditions: [],
        humidity: [],
        wind: [],
        icons: []
      }
    }
    
    dailyData[date].temps.push(item.main.temp)
    dailyData[date].conditions.push(item.weather[0].main)
    dailyData[date].humidity.push(item.main.humidity)
    dailyData[date].wind.push(item.wind.speed)
    dailyData[date].icons.push(item.weather[0].icon)
  })
  
  return Object.values(dailyData).map(day => ({
    date: day.date,
    tempMin: Math.min(...day.temps),
    tempMax: Math.max(...day.temps),
    tempAvg: day.temps.reduce((a, b) => a + b, 0) / day.temps.length,
    condition: getMostFrequent(day.conditions),
    humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
    wind: Math.round(day.wind.reduce((a, b) => a + b, 0) / day.wind.length * 10) / 10,
    icon: getMostFrequent(day.icons)
  })).slice(0, 5)
}

/**
 * Get most frequent item in array
 * @param {Array} arr - Array of items
 * @returns {*} Most frequent item
 */
function getMostFrequent(arr) {
  const counts = {}
  let maxCount = 0
  let maxItem = arr[0]
  
  arr.forEach(item => {
    counts[item] = (counts[item] || 0) + 1
    if (counts[item] > maxCount) {
      maxCount = counts[item]
      maxItem = item
    }
  })
  
  return maxItem
}

/**
 * Get weather icon and color for OpenWeatherMap icon codes
 * @param {string} iconCode - OpenWeatherMap icon code (e.g., '01d', '10n')
 * @returns {Object} Icon class and color class
 */
export function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': { icon: 'fa-sun', color: 'text-yellow-400' },
        '01n': { icon: 'fa-moon', color: 'text-slate-300' },
        '02d': { icon: 'fa-cloud-sun', color: 'text-yellow-300' },
        '02n': { icon: 'fa-cloud-moon', color: 'text-slate-300' },
        '03d': { icon: 'fa-cloud', color: 'text-slate-300' },
        '03n': { icon: 'fa-cloud', color: 'text-slate-300' },
        '04d': { icon: 'fa-cloud', color: 'text-slate-400' },
        '04n': { icon: 'fa-cloud', color: 'text-slate-400' },
        '09d': { icon: 'fa-cloud-showers-heavy', color: 'text-blue-400' },
        '09n': { icon: 'fa-cloud-showers-heavy', color: 'text-blue-400' },
        '10d': { icon: 'fa-cloud-rain', color: 'text-blue-400' },
        '10n': { icon: 'fa-cloud-rain', color: 'text-blue-400' },
        '11d': { icon: 'fa-cloud-bolt', color: 'text-yellow-500' },
        '11n': { icon: 'fa-cloud-bolt', color: 'text-yellow-500' },
        '13d': { icon: 'fa-snowflake', color: 'text-blue-200' },
        '13n': { icon: 'fa-snowflake', color: 'text-blue-200' },
        '50d': { icon: 'fa-smog', color: 'text-slate-400' },
        '50n': { icon: 'fa-smog', color: 'text-slate-400' }
    }

    return iconMap[iconCode] || { icon: 'fa-cloud', color: 'text-slate-300' }
}
