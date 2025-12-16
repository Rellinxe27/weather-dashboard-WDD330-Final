<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  alert: {
    type: Object,
    required: true
  }
})

const isExpanded = ref(false)

const alertIcon = computed(() => {
  const event = props.alert.event?.toLowerCase() || ''
  
  if (event.includes('storm') || event.includes('thunder')) return 'fa-cloud-bolt'
  if (event.includes('rain') || event.includes('flood')) return 'fa-cloud-showers-heavy'
  if (event.includes('snow') || event.includes('winter')) return 'fa-snowflake'
  if (event.includes('wind')) return 'fa-wind'
  if (event.includes('heat') || event.includes('hot')) return 'fa-temperature-high'
  if (event.includes('cold') || event.includes('freeze')) return 'fa-temperature-low'
  if (event.includes('fog')) return 'fa-smog'
  
  return 'fa-triangle-exclamation'
})

const formattedTime = computed(() => {
  if (!props.alert.start || !props.alert.end) return ''
  
  const start = new Date(props.alert.start * 1000)
  const end = new Date(props.alert.end * 1000)
  
  const formatOptions = {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  
  return `${start.toLocaleDateString('en-US', formatOptions)} - ${end.toLocaleDateString('en-US', formatOptions)}`
})
</script>

<template>
  <div class="alert-banner animate-slide-up">
    <div class="flex items-start gap-4 flex-1">
      <!-- Icon -->
      <div class="w-10 h-10 rounded-lg bg-alert-red/20 flex items-center justify-center flex-shrink-0">
        <i :class="['fa-solid', alertIcon, 'text-alert-red']"></i>
      </div>
      
      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <h4 class="font-display font-semibold text-alert-red">
            {{ alert.event }}
          </h4>
          <span v-if="alert.cityName" class="badge-alert text-xs">
            {{ alert.cityName }}
          </span>
        </div>
        
        <p v-if="formattedTime" class="text-white/50 text-sm mt-1">
          <i class="fa-regular fa-clock mr-1"></i>
          {{ formattedTime }}
        </p>
        
        <!-- Expandable Description -->
        <div v-if="alert.description" class="mt-2">
          <p 
            class="text-white/70 text-sm"
            :class="{ 'line-clamp-2': !isExpanded }"
          >
            {{ alert.description }}
          </p>
          <button 
            v-if="alert.description.length > 150"
            class="text-sky-primary text-sm mt-1 hover:underline"
            @click="isExpanded = !isExpanded"
          >
            {{ isExpanded ? 'Show less' : 'Read more' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Sender Info -->
    <div v-if="alert.sender_name" class="text-white/40 text-xs mt-2 pt-2 border-t border-white/10">
      Source: {{ alert.sender_name }}
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
