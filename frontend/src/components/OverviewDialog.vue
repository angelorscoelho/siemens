<template>
  <Teleport to="body">
    <transition name="overview-fade">
      <div v-if="open"
        ref="modalRef"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        @click.self="$emit('close')"
        @keydown.esc="$emit('close')"
        tabindex="-1"
      >
        <div class="relative bg-gray-950 border border-teal-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">

          <!-- Modal Header -->
          <div class="shrink-0 flex items-center gap-3 border-b border-gray-800 px-6 py-4 bg-gray-900">
            <svg class="w-5 h-5 text-teal-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div class="flex-1 min-w-0">
              <h2 class="text-sm font-bold text-white">Fleet General Overview</h2>
              <p class="text-xs text-gray-400">Siemens Energy · AI Maintenance Dashboard</p>
            </div>
            <div class="flex items-center gap-2">
              <span v-if="overview.timestamp" class="text-[10px] text-gray-500">{{ overview.timestamp }}</span>
              <button
                @click="$emit('refresh')"
                :disabled="overview.loading"
                class="p-1.5 rounded-md text-gray-400 hover:text-teal-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Refresh overview"
              >
                <svg class="w-4 h-4" :class="overview.loading ? 'animate-spin' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                @click="$emit('close')"
                class="text-gray-500 hover:text-gray-200 transition-colors cursor-pointer p-1 rounded-lg hover:bg-gray-800"
                aria-label="Close overview"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Scrollable content -->
          <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            <!-- Status summary chips — NOK → RISK → OK order -->
            <div class="flex flex-wrap gap-3">
              <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-900/30 border border-red-800/60">
                <span class="w-2.5 h-2.5 bg-red-400 rounded-full shrink-0 animate-pulse"></span>
                <span class="text-sm font-bold text-red-300">{{ nokCount }}</span>
                <span class="text-sm text-gray-400">NOK</span>
              </div>
              <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-900/30 border border-yellow-800/60">
                <span class="w-2.5 h-2.5 bg-yellow-400 rounded-full shrink-0 animate-pulse"></span>
                <span class="text-sm font-bold text-yellow-300">{{ riskCount }}</span>
                <span class="text-sm text-gray-400">RISK</span>
              </div>
              <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-900/30 border border-teal-800/60">
                <span class="w-2.5 h-2.5 bg-teal-400 rounded-full shrink-0"></span>
                <span class="text-sm font-bold text-teal-300">{{ okCount }}</span>
                <span class="text-sm text-gray-400">OK</span>
              </div>
              <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700">
                <span class="text-sm text-gray-400">{{ totalCount }} total</span>
              </div>
            </div>

            <!-- State changes indicator -->
            <div v-if="stateChanges > 0" class="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-900/20 border border-amber-800/40">
              <svg class="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span class="text-xs text-amber-300">{{ stateChanges }} state change{{ stateChanges !== 1 ? 's' : '' }} since last overview</span>
            </div>

            <!-- AI summary -->
            <div class="bg-gray-900/60 rounded-xl border border-gray-800 p-5">
              <div v-if="overview.loading" class="flex items-center gap-3 text-gray-400 py-4">
                <span class="flex gap-1.5">
                  <span class="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style="animation-delay:0ms"></span>
                  <span class="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style="animation-delay:150ms"></span>
                  <span class="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style="animation-delay:300ms"></span>
                </span>
                <span class="text-sm">Generating fleet overview…</span>
              </div>
              <div v-else-if="overview.error" class="text-sm text-red-400 py-2">{{ overview.error }}</div>
              <div v-else-if="overview.aiSummary"
                class="text-sm text-gray-300 leading-relaxed ai-message overview-text"
                v-html="renderedSummary">
              </div>
              <div v-else class="text-sm text-gray-500 py-2">Click the refresh button to generate an AI fleet overview.</div>
            </div>
          </div>

          <!-- Footer -->
          <div class="shrink-0 border-t border-gray-800 px-6 py-3 bg-gray-900 flex items-center justify-end">
            <button
              @click="$emit('close')"
              class="px-4 py-1.5 text-xs font-semibold bg-gray-800 border border-gray-600 rounded-lg text-gray-300 hover:border-teal-600 hover:text-teal-300 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  overview: { type: Object, required: true },
  nokCount: { type: Number, default: 0 },
  riskCount: { type: Number, default: 0 },
  okCount: { type: Number, default: 0 },
  totalCount: { type: Number, default: 0 },
  stateChanges: { type: Number, default: 0 },
  renderedSummary: { type: String, default: '' },
})

defineEmits(['close', 'refresh'])

const modalRef = ref(null)

watch(() => props.open, async (val) => {
  if (val) {
    await nextTick()
    modalRef.value?.focus()
  }
})
</script>

<style scoped>
.overview-fade-enter-active,
.overview-fade-leave-active {
  transition: opacity 0.2s ease;
}
.overview-fade-enter-from,
.overview-fade-leave-to {
  opacity: 0;
}

/* Improved typography for overview text */
.overview-text :deep(p) {
  margin-bottom: 0.75rem;
  line-height: 1.7;
}
.overview-text :deep(ul),
.overview-text :deep(ol) {
  margin-bottom: 0.75rem;
  padding-left: 1.25rem;
}
.overview-text :deep(li) {
  margin-bottom: 0.35rem;
  line-height: 1.6;
}
.overview-text :deep(strong) {
  color: #e2e8f0;
}
.overview-text :deep(h1),
.overview-text :deep(h2),
.overview-text :deep(h3) {
  color: #2dd4bf;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
}
</style>
