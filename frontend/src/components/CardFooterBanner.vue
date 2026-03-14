<template>
  <div
    class="mt-2 px-3 py-2 rounded-lg text-xs leading-snug relative flex items-center gap-2 cursor-pointer transition-colors w-full h-10 overflow-hidden"
    :class="bannerClass"
    @click.stop="$emit('click')"
    :title="clickTitle"
  >
    <!-- Icon indicator -->
    <div class="shrink-0">
      <!-- Warning icon for RISK/NOK -->
      <svg v-if="variant === 'alert'" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
      </svg>
      <!-- Checkmark icon for OK -->
      <svg v-else class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    </div>

    <!-- Content — single line with ellipsis, no subtitle/hint -->
    <div class="flex-1 min-w-0 overflow-hidden">
      <p class="font-medium truncate" :class="titleClass">{{ title }}</p>
    </div>

    <!-- Action slot (typically AIActionButton) -->
    <slot name="action"></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'ok' }, // 'alert' | 'ok'
  status: { type: String, default: 'OK' },  // 'OK' | 'RISK' | 'NOK'
  title: { type: String, required: true },
  clickTitle: { type: String, default: 'Click for details' },
})

defineEmits(['click'])

const bannerClass = computed(() => {
  if (props.variant === 'alert') {
    if (props.status === 'NOK') return 'bg-red-900/40 border border-red-700 text-red-300 hover:bg-red-900/60'
    return 'bg-yellow-900/40 border border-yellow-700 text-yellow-300 hover:bg-yellow-900/60'
  }
  return 'bg-teal-900/20 border border-teal-800/40 text-teal-400'
})

const titleClass = computed(() => {
  if (props.variant === 'alert') {
    return props.status === 'NOK' ? 'text-red-300' : 'text-yellow-300'
  }
  return 'text-teal-400'
})
</script>
