<template>
  <transition name="balloon">
    <div v-if="balloon"
      class="fixed z-50 w-80 max-w-[calc(100vw-2rem)] rounded-xl border shadow-2xl backdrop-blur-sm overflow-hidden cursor-pointer"
      :class="[balloonClass, positionClass]"
      @click="$emit('focus')"
    >
      <div class="flex items-start gap-2 p-3">
        <div class="shrink-0 mt-0.5">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-bold leading-tight truncate">{{ balloon.title }}</p>
          <p class="text-xs mt-0.5 leading-snug opacity-80">{{ balloon.message }}</p>
        </div>
        <button
          @click.stop="$emit('dismiss')"
          class="shrink-0 p-0.5 rounded hover:bg-white/10 transition-colors"
          aria-label="Dismiss notification"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  balloon: { type: Object, default: null },
  assistantOpen: { type: Boolean, default: false },
})

defineEmits(['focus', 'dismiss'])

const balloonClass = computed(() => {
  if (!props.balloon) return ''
  if (props.balloon.status === 'NOK') return 'bg-red-950/95 border-red-700 text-red-200 balloon-pulse-nok'
  return 'bg-yellow-950/95 border-yellow-700 text-yellow-200 balloon-pulse-risk'
})

const positionClass = computed(() => {
  return props.assistantOpen ? 'top-16 left-4' : 'top-16 right-4'
})
</script>

<style scoped>
.balloon-enter-active,
.balloon-leave-active {
  transition: all 0.3s ease;
}
.balloon-enter-from { opacity: 0; transform: translateY(-12px) scale(0.95); }
.balloon-leave-to { opacity: 0; transform: translateY(-12px) scale(0.95); }

@keyframes balloon-pulse-nok {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
  50% { box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.3), 0 0 16px 4px rgba(239, 68, 68, 0.15); }
}
@keyframes balloon-pulse-risk {
  0%, 100% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0); }
  50% { box-shadow: 0 0 0 4px rgba(234, 179, 8, 0.3), 0 0 16px 4px rgba(234, 179, 8, 0.15); }
}
.balloon-pulse-nok { animation: balloon-pulse-nok 2s ease-in-out infinite; }
.balloon-pulse-risk { animation: balloon-pulse-risk 2s ease-in-out infinite; }
</style>
