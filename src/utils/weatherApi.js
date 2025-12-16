// Weather API Configuration
const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const VISUAL_CROSSING_API_KEY = import.meta.env.VITE_VISUAL_CROSSING_API_KEY

const OPENWEATHER_BASE_URL = import.meta.env.VITE_OPENWEATHER_BASE_URL
const VISUAL_CROSSING_BASE_URL = import.meta.env.VITE_VISUAL_CROSSING_BASE_URL


/**
 * Fetch current weather data from OpenWeatherMap
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} units - 'metric' or 'imperial'
 */
export async function getCurrentWeather(lat, lon, units = 'metric') {
  try {
    const response = await fetch(
      `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${OPENWEATHER_API_KEY}`
    )
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching current weather:', error)
    throw error
  }
}

/**
 * Fetch 5-day forecast from OpenWeatherMap
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} units - 'metric' or 'imperial'
 */
export async function getForecast(lat, lon, units = 'metric') {
  try {
    const response = await fetch(
      `${OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${OPENWEATHER_API_KEY}`
    )
    
    if (!response.ok) {
      throw new Error(`Forecast API error: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching forecast:', error)
    throw error
  }
}

/**
 * Search cities by name from OpenWeatherMap Geocoding API
 * @param {string} query - City name to search
 * @param {number} limit - Maximum number of results
 */
export async function searchCities(query, limit = 5) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=${limit}&appid=${OPENWEATHER_API_KEY}`
    )
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Format results with unique identifiers
    return data.map((city, index) => ({
      id: `${city.lat}-${city.lon}-${index}`,
      name: city.name,
      country: city.country,
      state: city.state || '',
      lat: city.lat,
      lon: city.lon,
      displayName: city.state 
        ? `${city.name}, ${city.state}, ${city.country}`
        : `${city.name}, ${city.country}`
    }))
  } catch (error) {
    console.error('Error searching cities:', error)
    throw error
  }
}

/**
 * Get weather alerts for a location
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 */
export async function getWeatherAlerts(lat, lon) {
  try {
    const response = await fetch(
      `${OPENWEATHER_BASE_URL}/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily&appid=${OPENWEATHER_API_KEY}`
    )
    
    if (!response.ok) {
      throw new Error(`Alerts API error: ${response.status}`)
    }
    
    const data = await response.json()
    return data.alerts || []
  } catch (error) {
    console.error('Error fetching weather alerts:', error)
    return []
  }
}

/**
 * Fetch historical weather data from Visual Crossing
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 */
export async function getHistoricalWeather(lat, lon, startDate, endDate) {
  try {
    const response = await fetch(
      `${VISUAL_CROSSING_BASE_URL}/timeline/${lat},${lon}/${startDate}/${endDate}?unitGroup=metric&key=${VISUAL_CROSSING_API_KEY}&contentType=json`
    )
    
    if (!response.ok) {
      throw new Error(`Historical API error: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching historical weather:', error)
    throw error
  }
}

/**
 * Get monthly averages for a location (Visual Crossing)
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 */
export async function getMonthlyAverages(lat, lon) {
  try {
    // Get past year of data for monthly averages
    const endDate = new Date()
    const startDate = new Date()
    startDate.setFullYear(startDate.getFullYear() - 1)
    
    const formatDate = (date) => date.toISOString().split('T')[0]
    
    const response = await fetch(
      `${VISUAL_CROSSING_BASE_URL}/timeline/${lat},${lon}/${formatDate(startDate)}/${formatDate(endDate)}?unitGroup=metric&include=days&key=${VISUAL_CROSSING_API_KEY}&contentType=json`
    )
    
    if (!response.ok) {
      throw new Error(`Monthly averages API error: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching monthly averages:', error)
    throw error
  }
}

/**
 * Reverse geocode coordinates to get city name
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 */
export async function reverseGeocode(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OPENWEATHER_API_KEY}`
    )
    
    if (!response.ok) {
      throw new Error(`Reverse geocoding API error: ${response.status}`)
    }
    
    const data = await response.json()
    if (data.length > 0) {
      return {
        name: data[0].name,
        country: data[0].country,
        state: data[0].state || ''
      }
    }
    return null
  } catch (error) {
    console.error('Error reverse geocoding:', error)
    throw error
  }
}

/**
 * Get the user's current location
 * @returns {Promise<{lat: number, lon: number}>}
 */
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'))
      return
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        })
      },
      (error) => {
        let message = 'Unable to retrieve your location'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission denied'
            break
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable'
            break
          case error.TIMEOUT:
            message = 'Location request timed out'
            break
        }
        reject(new Error(message))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  })
}

// Weather icon mapping for OpenWeatherMap icons
export const weatherIconMap = {
  '01d': { icon: 'fa-sun', color: 'text-orange-accent' },
  '01n': { icon: 'fa-moon', color: 'text-cool-blue' },
  '02d': { icon: 'fa-cloud-sun', color: 'text-orange-accent' },
  '02n': { icon: 'fa-cloud-moon', color: 'text-cool-blue' },
  '03d': { icon: 'fa-cloud', color: 'text-gray-300' },
  '03n': { icon: 'fa-cloud', color: 'text-gray-400' },
  '04d': { icon: 'fa-clouds', color: 'text-gray-400' },
  '04n': { icon: 'fa-clouds', color: 'text-gray-500' },
  '09d': { icon: 'fa-cloud-showers-heavy', color: 'text-cool-blue' },
  '09n': { icon: 'fa-cloud-showers-heavy', color: 'text-cool-blue' },
  '10d': { icon: 'fa-cloud-sun-rain', color: 'text-cool-blue' },
  '10n': { icon: 'fa-cloud-moon-rain', color: 'text-cool-blue' },
  '11d': { icon: 'fa-cloud-bolt', color: 'text-yellow-400' },
  '11n': { icon: 'fa-cloud-bolt', color: 'text-yellow-400' },
  '13d': { icon: 'fa-snowflake', color: 'text-cyan-300' },
  '13n': { icon: 'fa-snowflake', color: 'text-cyan-300' },
  '50d': { icon: 'fa-smog', color: 'text-gray-400' },
  '50n': { icon: 'fa-smog', color: 'text-gray-500' }
}

/**
 * Get Font Awesome icon class for weather condition
 * @param {string} iconCode - OpenWeatherMap icon code
 */
export function getWeatherIcon(iconCode) {
  return weatherIconMap[iconCode] || { icon: 'fa-cloud', color: 'text-gray-300' }
}
