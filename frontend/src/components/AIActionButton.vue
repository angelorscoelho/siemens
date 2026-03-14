<template>
  <button
    @click.stop="$emit('click')"
    class="bot-icon-btn shrink-0 p-1.5 rounded-md transition-all duration-200 cursor-pointer"
    :class="buttonClass"
    :title="title"
    :aria-label="title"
  >
    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="8" width="18" height="12" rx="2"/>
      <path d="M12 2v4"/>
      <circle cx="12" cy="6" r="1" fill="currentColor" stroke="none"/>
      <circle cx="9" cy="13" r="1.2" fill="currentColor" stroke="none"/>
      <circle cx="15" cy="13" r="1.2" fill="currentColor" stroke="none"/>
      <path d="M9 17h6"/>
      <path d="M3 12H1m22 0h-2"/>
    </svg>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, default: 'OK' },
  title: { type: String, default: 'Ask AI Assistant' },
})

defineEmits(['click'])

const buttonClass = computed(() => {
  if (props.status === 'NOK') return 'bg-red-900/60 text-red-300 hover:bg-red-700/80 hover:text-red-100 nok-glow'
  if (props.status === 'RISK') return 'bg-yellow-900/60 text-yellow-300 hover:bg-yellow-700/80 hover:text-yellow-100 risk-glow'
  return 'bg-teal-900/40 text-teal-400 hover:bg-teal-800/60 hover:text-teal-200 ok-glow'
})
</script>

<style scoped>
.bot-icon-btn {
  box-shadow: 0 0 0 0 transparent;
}
.bot-icon-btn.nok-glow:hover {
  box-shadow: 0 0 8px 2px rgba(239, 68, 68, 0.55), 0 0 16px 2px rgba(239, 68, 68, 0.25);
}
.bot-icon-btn.risk-glow:hover {
  box-shadow: 0 0 8px 2px rgba(234, 179, 8, 0.55), 0 0 16px 2px rgba(234, 179, 8, 0.25);
}
.bot-icon-btn.ok-glow:hover {
  box-shadow: 0 0 8px 2px rgba(45, 212, 191, 0.55), 0 0 16px 2px rgba(45, 212, 191, 0.25);
}
</style>
