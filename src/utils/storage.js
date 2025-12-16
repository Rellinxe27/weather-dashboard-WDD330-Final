// LocalStorage keys
const STORAGE_KEYS = {
  CITIES: 'weather_dashboard_cities',
  PREFERENCES: 'weather_dashboard_preferences',
  LAYOUT: 'weather_dashboard_layout',
  SEARCH_HISTORY: 'weather_dashboard_search_history'
}

// Default preferences
const DEFAULT_PREFERENCES = {
  temperatureUnit: 'celsius', // 'celsius' or 'fahrenheit'
  theme: 'dark',
  autoRefresh: true,
  refreshInterval: 300000, // 5 minutes
  showAlerts: true
}

/**
 * Get saved cities from localStorage
 * @returns {Array} Array of saved city objects
 */
export function getSavedCities() {
  try {
    const cities = localStorage.getItem(STORAGE_KEYS.CITIES)
    return cities ? JSON.parse(cities) : []
  } catch (error) {
    console.error('Error reading cities from localStorage:', error)
    return []
  }
}

/**
 * Save cities to localStorage
 * @param {Array} cities - Array of city objects
 */
export function saveCities(cities) {
  try {
    localStorage.setItem(STORAGE_KEYS.CITIES, JSON.stringify(cities))
  } catch (error) {
    console.error('Error saving cities to localStorage:', error)
  }
}

/**
 * Add a city to saved cities
 * @param {Object} city - City object with name, lat, lon, etc.
 * @returns {Array} Updated cities array
 */
export function addCity(city) {
  const cities = getSavedCities()
  
  // Check if city already exists
  const exists = cities.some(
    c => c.lat === city.lat && c.lon === city.lon
  )
  
  if (!exists) {
    const newCity = {
      ...city,
      id: `${city.lat}-${city.lon}-${Date.now()}`,
      addedAt: new Date().toISOString()
    }
    cities.push(newCity)
    saveCities(cities)
  }
  
  return getSavedCities()
}

/**
 * Remove a city from saved cities
 * @param {string} cityId - City ID to remove
 * @returns {Array} Updated cities array
 */
export function removeCity(cityId) {
  const cities = getSavedCities()
  const filteredCities = cities.filter(city => city.id !== cityId)
  saveCities(filteredCities)
  return filteredCities
}

/**
 * Update city order in localStorage
 * @param {Array} cities - Reordered cities array
 */
export function updateCityOrder(cities) {
  saveCities(cities)
}

/**
 * Get user preferences from localStorage
 * @returns {Object} User preferences
 */
export function getPreferences() {
  try {
    const prefs = localStorage.getItem(STORAGE_KEYS.PREFERENCES)
    return prefs ? { ...DEFAULT_PREFERENCES, ...JSON.parse(prefs) } : DEFAULT_PREFERENCES
  } catch (error) {
    console.error('Error reading preferences from localStorage:', error)
    return DEFAULT_PREFERENCES
  }
}

/**
 * Save user preferences to localStorage
 * @param {Object} preferences - Preferences object
 */
export function savePreferences(preferences) {
  try {
    const currentPrefs = getPreferences()
    const updatedPrefs = { ...currentPrefs, ...preferences }
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updatedPrefs))
  } catch (error) {
    console.error('Error saving preferences to localStorage:', error)
  }
}

/**
 * Get dashboard layout configuration
 * @returns {Object} Layout configuration
 */
export function getLayoutConfig() {
  try {
    const layout = localStorage.getItem(STORAGE_KEYS.LAYOUT)
    return layout ? JSON.parse(layout) : { columns: 3, cardSize: 'medium' }
  } catch (error) {
    console.error('Error reading layout from localStorage:', error)
    return { columns: 3, cardSize: 'medium' }
  }
}

/**
 * Save dashboard layout configuration
 * @param {Object} layout - Layout configuration object
 */
export function saveLayoutConfig(layout) {
  try {
    localStorage.setItem(STORAGE_KEYS.LAYOUT, JSON.stringify(layout))
  } catch (error) {
    console.error('Error saving layout to localStorage:', error)
  }
}

/**
 * Get search history
 * @returns {Array} Recent search queries
 */
export function getSearchHistory() {
  try {
    const history = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY)
    return history ? JSON.parse(history) : []
  } catch (error) {
    console.error('Error reading search history from localStorage:', error)
    return []
  }
}

/**
 * Add to search history
 * @param {Object} city - City object from search
 */
export function addToSearchHistory(city) {
  try {
    let history = getSearchHistory()
    
    // Remove if already exists
    history = history.filter(
      item => !(item.lat === city.lat && item.lon === city.lon)
    )
    
    // Add to beginning
    history.unshift({
      ...city,
      searchedAt: new Date().toISOString()
    })
    
    // Keep only last 10 searches
    history = history.slice(0, 10)
    
    localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(history))
  } catch (error) {
    console.error('Error saving search history:', error)
  }
}

/**
 * Clear search history
 */
export function clearSearchHistory() {
  try {
    localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY)
  } catch (error) {
    console.error('Error clearing search history:', error)
  }
}

/**
 * Clear all dashboard data
 */
export function clearAllData() {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  } catch (error) {
    console.error('Error clearing all data:', error)
  }
}

/**
 * Export dashboard data for backup
 * @returns {Object} All dashboard data
 */
export function exportData() {
  return {
    cities: getSavedCities(),
    preferences: getPreferences(),
    layout: getLayoutConfig(),
    searchHistory: getSearchHistory(),
    exportedAt: new Date().toISOString()
  }
}

/**
 * Import dashboard data from backup
 * @param {Object} data - Exported data object
 */
export function importData(data) {
  try {
    if (data.cities) saveCities(data.cities)
    if (data.preferences) savePreferences(data.preferences)
    if (data.layout) saveLayoutConfig(data.layout)
    if (data.searchHistory) {
      localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(data.searchHistory))
    }
  } catch (error) {
    console.error('Error importing data:', error)
  }
}
