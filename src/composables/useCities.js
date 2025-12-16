import { ref, computed } from 'vue'
import { 
  getSavedCities, 
  addCity as addCityToStorage, 
  removeCity as removeCityFromStorage,
  updateCityOrder 
} from '@/utils/storage'

/**
 * Composable for managing saved cities
 */
export function useCities() {
  const cities = ref(getSavedCities())
  const selectedCities = ref([])
  const loading = ref(false)

  const cityCount = computed(() => cities.value.length)
  const hasCities = computed(() => cities.value.length > 0)
  const maxCities = 6

  const canAddMore = computed(() => cities.value.length < maxCities)

  /**
   * Add a city to the dashboard
   * @param {Object} city - City object
   * @returns {boolean} Success status
   */
  function addCity(city) {
    if (!canAddMore.value) {
      return false
    }

    // Check if already exists
    const exists = cities.value.some(
      c => c.lat === city.lat && c.lon === city.lon
    )

    if (exists) {
      return false
    }

    const newCity = {
      ...city,
      id: `${city.lat}-${city.lon}-${Date.now()}`,
      addedAt: new Date().toISOString()
    }

    cities.value.push(newCity)
    addCityToStorage(newCity)
    return true
  }

  /**
   * Remove a city from the dashboard
   * @param {string} cityId - City ID to remove
   */
  function removeCity(cityId) {
    cities.value = cities.value.filter(city => city.id !== cityId)
    removeCityFromStorage(cityId)
    
    // Also remove from selection
    selectedCities.value = selectedCities.value.filter(id => id !== cityId)
  }

  /**
   * Reorder cities (for drag-and-drop)
   * @param {Array} newOrder - New order of cities
   */
  function reorderCities(newOrder) {
    cities.value = newOrder
    updateCityOrder(newOrder)
  }

  /**
   * Move a city to a new position
   * @param {number} fromIndex - Original index
   * @param {number} toIndex - New index
   */
  function moveCity(fromIndex, toIndex) {
    const citiesArray = [...cities.value]
    const [movedCity] = citiesArray.splice(fromIndex, 1)
    citiesArray.splice(toIndex, 0, movedCity)
    reorderCities(citiesArray)
  }

  /**
   * Toggle city selection for comparison
   * @param {string} cityId - City ID to toggle
   */
  function toggleCitySelection(cityId) {
    const index = selectedCities.value.indexOf(cityId)
    if (index === -1) {
      selectedCities.value.push(cityId)
    } else {
      selectedCities.value.splice(index, 1)
    }
  }

  /**
   * Select all cities for comparison
   */
  function selectAllCities() {
    selectedCities.value = cities.value.map(city => city.id)
  }

  /**
   * Clear city selection
   */
  function clearSelection() {
    selectedCities.value = []
  }

  /**
   * Check if a city is selected
   * @param {string} cityId - City ID to check
   * @returns {boolean} Selection status
   */
  function isCitySelected(cityId) {
    return selectedCities.value.includes(cityId)
  }

  /**
   * Get selected city objects
   * @returns {Array} Array of selected city objects
   */
  function getSelectedCityObjects() {
    return cities.value.filter(city => selectedCities.value.includes(city.id))
  }

  /**
   * Reload cities from storage
   */
  function reloadCities() {
    cities.value = getSavedCities()
  }

  /**
   * Get city by ID
   * @param {string} cityId - City ID
   * @returns {Object|undefined} City object
   */
  function getCityById(cityId) {
    return cities.value.find(city => city.id === cityId)
  }

  return {
    cities,
    selectedCities,
    loading,
    cityCount,
    hasCities,
    canAddMore,
    maxCities,
    addCity,
    removeCity,
    reorderCities,
    moveCity,
    toggleCitySelection,
    selectAllCities,
    clearSelection,
    isCitySelected,
    getSelectedCityObjects,
    reloadCities,
    getCityById
  }
}
