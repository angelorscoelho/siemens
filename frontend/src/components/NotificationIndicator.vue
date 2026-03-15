<template>
  <transition name="balloon">
    <div v-if="balloon"
      class="fixed top-[60px] right-3 md:right-auto z-50 max-w-[calc(100vw-1.5rem)] md:max-w-[280px] rounded-xl border shadow-2xl backdrop-blur-sm overflow-hidden cursor-pointer"
      :class="balloonClass"
      :style="mdStyle"
      @click="$emit('focus')"
    >
      <div class="flex items-start gap-3 px-4 py-3">
        <div class="shrink-0 mt-0.5">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold leading-tight truncate">{{ balloon.title }}</p>
          <p class="text-xs mt-0.5 leading-relaxed opacity-90">{{ balloon.message }}</p>
          <p class="text-[10px] mt-1 italic opacity-70">Click to focus card</p>
        </div>
        <button
          @click.stop="$emit('dismiss')"
          class="shrink-0 cursor-pointer opacity-60 hover:opacity-100 transition-opacity p-1.5"
          aria-label="Dismiss notification"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
  isMobile: { type: Boolean, default: false },
})

defineEmits(['focus', 'dismiss'])

const balloonClass = computed(() => {
  if (!props.balloon) return ''
  if (props.balloon.status === 'NOK') return 'bg-red-900 border-red-500 hover:bg-red-800 text-red-300 balloon-pulse-nok'
  return 'bg-yellow-900 border-yellow-500 hover:bg-yellow-800 text-yellow-300 balloon-pulse-risk'
})

// On desktop (md+), position shifts left when assistant sidebar is open
// On mobile, the right-3 class handles it (always top-right)
const mdStyle = computed(() => {
  if (props.isMobile) return {}
  return { right: props.assistantOpen ? 'calc(clamp(300px, 25%, 400px) + 1.5rem)' : '1.5rem' }
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
