import { ref, computed } from 'vue'
import { searchCities, getCurrentLocation, reverseGeocode } from '@/utils/weatherApi'
import { getSearchHistory, addToSearchHistory, clearSearchHistory } from '@/utils/storage'
import { debounce } from '@/utils/helpers'

/**
 * Composable for city search functionality
 */
export function useSearch() {
  const query = ref('')
  const results = ref([])
  const loading = ref(false)
  const error = ref(null)
  const showDropdown = ref(false)
  const searchHistory = ref(getSearchHistory())
  const locatingUser = ref(false)

  const hasResults = computed(() => results.value.length > 0)
  const hasQuery = computed(() => query.value.trim().length > 0)
  const hasHistory = computed(() => searchHistory.value.length > 0)

  /**
   * Search for cities matching query
   * @param {string} searchQuery - Search query
   */
  async function search(searchQuery) {
    if (!searchQuery || searchQuery.trim().length < 2) {
      results.value = []
      return
    }

    loading.value = true
    error.value = null

    try {
      const searchResults = await searchCities(searchQuery)
      results.value = searchResults
      showDropdown.value = true
    } catch (err) {
      error.value = err.message || 'Search failed'
      results.value = []
    } finally {
      loading.value = false
    }
  }

  // Debounced search
  const debouncedSearch = debounce(search, 300)

  /**
   * Handle input change
   * @param {string} value - Input value
   */
  function onInput(value) {
    query.value = value
    if (value.trim().length >= 2) {
      debouncedSearch(value)
    } else {
      results.value = []
    }
  }

  /**
   * Select a city from results
   * @param {Object} city - Selected city
   * @returns {Object} Selected city
   */
  function selectCity(city) {
    addToSearchHistory(city)
    searchHistory.value = getSearchHistory()
    query.value = ''
    results.value = []
    showDropdown.value = false
    return city
  }

  /**
   * Get user's current location
   * @returns {Object} City object for current location
   */
  async function useCurrentLocation() {
    locatingUser.value = true
    error.value = null

    try {
      const coords = await getCurrentLocation()
      const locationInfo = await reverseGeocode(coords.lat, coords.lon)

      if (locationInfo) {
        const city = {
          id: `${coords.lat}-${coords.lon}-current`,
          name: locationInfo.name,
          country: locationInfo.country,
          state: locationInfo.state,
          lat: coords.lat,
          lon: coords.lon,
          displayName: locationInfo.state
            ? `${locationInfo.name}, ${locationInfo.state}, ${locationInfo.country}`
            : `${locationInfo.name}, ${locationInfo.country}`,
          isCurrentLocation: true
        }

        addToSearchHistory(city)
        searchHistory.value = getSearchHistory()
        showDropdown.value = false
        return city
      }

      throw new Error('Could not determine location name')
    } catch (err) {
      error.value = err.message || 'Failed to get location'
      throw err
    } finally {
      locatingUser.value = false
    }
  }

  /**
   * Clear search state
   */
  function clearSearch() {
    query.value = ''
    results.value = []
    showDropdown.value = false
    error.value = null
  }

  /**
   * Clear search history
   */
  function clearHistory() {
    clearSearchHistory()
    searchHistory.value = []
  }

  /**
   * Open dropdown
   */
  function openDropdown() {
    showDropdown.value = true
  }

  /**
   * Close dropdown
   */
  function closeDropdown() {
    showDropdown.value = false
  }

  return {
    query,
    results,
    loading,
    error,
    showDropdown,
    searchHistory,
    locatingUser,
    hasResults,
    hasQuery,
    hasHistory,
    onInput,
    search,
    selectCity,
    useCurrentLocation,
    clearSearch,
    clearHistory,
    openDropdown,
    closeDropdown
  }
}
