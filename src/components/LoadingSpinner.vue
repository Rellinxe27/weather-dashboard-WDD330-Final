<script setup>
defineProps({
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  text: {
    type: String,
    default: ''
  }
})

const sizeClasses = {
  small: 'w-4 h-4',
  medium: 'w-8 h-8',
  large: 'w-12 h-12'
}

const iconSizes = {
  small: 'text-sm',
  medium: 'text-2xl',
  large: 'text-4xl'
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3">
    <div 
      class="relative"
      :class="sizeClasses[size]"
    >
      <!-- Outer ring -->
      <div 
        class="absolute inset-0 rounded-full border-2 border-sky-primary/20"
      ></div>
      
      <!-- Spinning element -->
      <div 
        class="absolute inset-0 rounded-full border-2 border-transparent border-t-sky-primary animate-spin"
      ></div>
      
      <!-- Center icon -->
      <div class="absolute inset-0 flex items-center justify-center">
        <i 
          class="fa-solid fa-cloud text-sky-primary/50"
          :class="iconSizes[size]"
        ></i>
      </div>
    </div>
    
    <p v-if="text" class="text-white/60 text-sm">{{ text }}</p>
  </div>
</template>
