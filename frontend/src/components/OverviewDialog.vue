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
        <div class="relative bg-gray-950 border border-teal-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">

          <!-- Modal Header -->
          <div class="shrink-0 flex items-center gap-3 border-b border-gray-800 px-6 py-4 bg-gray-900">
            <svg class="w-5 h-5 text-teal-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div class="flex-1 min-w-0">
              <h2 class="text-sm font-bold text-white">Fleet General Assessment</h2>
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

          <!-- Scrollable content — two-column layout -->
          <div class="flex-1 overflow-y-auto">
            <div class="flex flex-col lg:flex-row gap-0 h-full">

              <!-- ── LEFT: Equipment Status Summaries ── -->
              <div class="flex-1 min-w-0 px-6 py-5 space-y-4 lg:overflow-y-auto lg:max-h-[calc(90vh-8rem)]">

                <!-- Status summary chips -->
                <div class="flex flex-wrap gap-2">
                  <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-900/30 border border-red-800/60">
                    <span class="w-2.5 h-2.5 bg-red-400 rounded-full shrink-0 animate-pulse"></span>
                    <span class="text-sm font-bold text-red-300">{{ nokCount }}</span>
                    <span class="text-xs text-gray-400">NOK</span>
                  </div>
                  <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-900/30 border border-yellow-800/60">
                    <span class="w-2.5 h-2.5 bg-yellow-400 rounded-full shrink-0 animate-pulse"></span>
                    <span class="text-sm font-bold text-yellow-300">{{ riskCount }}</span>
                    <span class="text-xs text-gray-400">RISK</span>
                  </div>
                  <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-900/30 border border-teal-800/60">
                    <span class="w-2.5 h-2.5 bg-teal-400 rounded-full shrink-0"></span>
                    <span class="text-sm font-bold text-teal-300">{{ okCount }}</span>
                    <span class="text-xs text-gray-400">OK</span>
                  </div>
                  <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700">
                    <span class="text-xs text-gray-400">{{ totalCount }} total</span>
                  </div>
                </div>

                <!-- State changes indicator -->
                <div v-if="stateChanges > 0" class="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-900/20 border border-amber-800/40">
                  <svg class="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span class="text-xs text-amber-300">{{ stateChanges }} state change{{ stateChanges !== 1 ? 's' : '' }} since last overview</span>
                </div>

                <!-- ── NOK Section (always expanded) ── -->
                <div v-if="nokTurbines.length > 0" class="rounded-xl border border-red-800/60 overflow-hidden">
                  <button
                    class="w-full px-4 py-2.5 bg-red-900/30 border-b border-red-800/40 flex items-center gap-2 cursor-pointer hover:bg-red-900/40 transition-colors"
                    @click="nokCollapsed = !nokCollapsed"
                  >
                    <span class="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                    <span class="text-xs font-bold text-red-300 uppercase tracking-wider flex-1 text-left">Critical — Immediate Action Required</span>
                    <span class="text-xs text-red-400 font-mono">{{ nokTurbines.length }} unit{{ nokTurbines.length !== 1 ? 's' : '' }}</span>
                    <svg class="w-4 h-4 text-red-400 transition-transform shrink-0" :class="nokCollapsed ? '-rotate-90' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div v-show="!nokCollapsed" class="divide-y divide-red-900/30">
                    <div v-for="t in nokTurbines" :key="t.id" class="px-4 py-3 bg-gray-950/80 cursor-pointer hover:bg-gray-900 transition-colors" title="Open equipment overview" @click="$emit('open-turbine', t.id, 'NOK')">
                      <div class="flex items-center gap-2 mb-1.5">
                        <span class="text-sm font-bold text-red-300">{{ t.name }}</span>
                        <span class="text-xs text-gray-500 font-mono">{{ t.id }}</span>
                        <span class="text-xs text-gray-600">·</span>
                        <span class="text-xs text-gray-400">{{ t.type }}</span>
                      </div>
                      <p class="text-xs text-red-200/80 leading-relaxed">{{ t.alert || 'Critical condition — parameters exceed safe operating limits.' }}</p>
                      <div class="flex flex-wrap gap-3 mt-2 text-[11px] text-gray-400">
                        <span>Vibration: <strong class="text-red-300">{{ t.vibration?.toFixed(1) }} mm/s</strong></span>
                        <span>Exhaust: <strong class="text-red-300">{{ t.exhaustTemp?.toFixed(0) }}°C</strong></span>
                        <span>Hours: <strong class="text-gray-300">{{ Math.floor(t.hoursSinceOverhaul).toLocaleString() }}h</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- ── RISK Section (expanded by default) ── -->
                <div v-if="riskTurbines.length > 0" class="rounded-xl border border-yellow-800/60 overflow-hidden">
                  <button
                    class="w-full px-4 py-2.5 bg-yellow-900/20 border-b border-yellow-800/40 flex items-center gap-2 cursor-pointer hover:bg-yellow-900/30 transition-colors"
                    @click="riskCollapsed = !riskCollapsed"
                  >
                    <span class="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                    <span class="text-xs font-bold text-yellow-300 uppercase tracking-wider flex-1 text-left">Warning — Monitor Closely</span>
                    <span class="text-xs text-yellow-400 font-mono">{{ riskTurbines.length }} unit{{ riskTurbines.length !== 1 ? 's' : '' }}</span>
                    <svg class="w-4 h-4 text-yellow-400 transition-transform shrink-0" :class="riskCollapsed ? '-rotate-90' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div v-show="!riskCollapsed" class="divide-y divide-yellow-900/20">
                    <div v-for="t in riskTurbines" :key="t.id" class="px-4 py-3 bg-gray-950/80 cursor-pointer hover:bg-gray-900 transition-colors" title="Open equipment overview" @click="$emit('open-turbine', t.id, 'RISK')">
                      <div class="flex items-center gap-2 mb-1.5">
                        <span class="text-sm font-bold text-yellow-300">{{ t.name }}</span>
                        <span class="text-xs text-gray-500 font-mono">{{ t.id }}</span>
                        <span class="text-xs text-gray-600">·</span>
                        <span class="text-xs text-gray-400">{{ t.type }}</span>
                      </div>
                      <p class="text-xs text-yellow-200/80 leading-relaxed">{{ t.alert || 'Elevated readings — schedule preventive review.' }}</p>
                      <div class="flex flex-wrap gap-3 mt-2 text-[11px] text-gray-400">
                        <span>Vibration: <strong :class="t.vibrationAlert ? 'text-yellow-300' : 'text-gray-300'">{{ t.vibration?.toFixed(1) }} mm/s</strong></span>
                        <span>Exhaust: <strong :class="t.tempAlert ? 'text-yellow-300' : 'text-gray-300'">{{ t.exhaustTemp?.toFixed(0) }}°C</strong></span>
                        <span>Hours: <strong class="text-gray-300">{{ Math.floor(t.hoursSinceOverhaul).toLocaleString() }}h</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- ── OK Section (collapsed by default) ── -->
                <div v-if="okTurbines.length > 0" class="rounded-xl border border-teal-800/40 overflow-hidden">
                  <button
                    class="w-full px-4 py-2.5 bg-teal-900/20 border-b border-teal-800/30 flex items-center gap-2 cursor-pointer hover:bg-teal-900/30 transition-colors"
                    @click="okCollapsed = !okCollapsed"
                  >
                    <span class="w-2 h-2 bg-teal-400 rounded-full"></span>
                    <span class="text-xs font-bold text-teal-300 uppercase tracking-wider flex-1 text-left">Operational — Normal</span>
                    <span class="text-xs text-teal-400 font-mono">{{ okTurbines.length }} unit{{ okTurbines.length !== 1 ? 's' : '' }}</span>
                    <svg class="w-4 h-4 text-teal-400 transition-transform shrink-0" :class="okCollapsed ? '-rotate-90' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div v-show="!okCollapsed" class="divide-y divide-teal-900/20">
                    <div v-for="t in okTurbines" :key="t.id" class="px-4 py-2.5 bg-gray-950/80 flex items-center gap-3 cursor-pointer hover:bg-gray-900 transition-colors" title="Open equipment overview" @click="$emit('open-turbine', t.id, 'OK')">
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                          <span class="text-sm font-semibold text-teal-300">{{ t.name }}</span>
                          <span class="text-xs text-gray-500 font-mono">{{ t.id }}</span>
                          <span class="text-xs text-gray-600">·</span>
                          <span class="text-xs text-gray-400">{{ t.type }}</span>
                        </div>
                        <div class="flex flex-wrap gap-3 mt-1 text-[11px] text-gray-500">
                          <span>Vib: {{ t.vibration?.toFixed(1) }} mm/s</span>
                          <span>Exh: {{ t.exhaustTemp?.toFixed(0) }}°C</span>
                          <span>{{ Math.floor(t.hoursSinceOverhaul).toLocaleString() }}h since overhaul</span>
                        </div>
                      </div>
                      <span class="shrink-0 px-2 py-0.5 text-[10px] font-bold rounded-full bg-teal-900/60 text-teal-400 border border-teal-800">OK</span>
                    </div>
                  </div>
                </div>

              </div>

              <!-- ── RIGHT: AI Fleet Assessment ── -->
              <div class="lg:w-[42%] lg:shrink-0 border-t lg:border-t-0 lg:border-l border-gray-800 px-6 py-5 flex flex-col lg:overflow-y-auto lg:max-h-[calc(90vh-8rem)]">
                <h3 class="text-xs font-bold text-teal-400 uppercase tracking-wider mb-3 flex items-center gap-2 shrink-0">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="8" width="18" height="12" rx="2"/><path d="M12 2v4"/><circle cx="12" cy="6" r="1" fill="currentColor" stroke="none"/>
                    <circle cx="9" cy="13" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="13" r="1.2" fill="currentColor" stroke="none"/>
                    <path d="M9 17h6"/>
                  </svg>
                  AI Fleet Assessment
                </h3>
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
                  class="text-sm text-gray-300 leading-relaxed ai-message overview-text flex-1"
                  v-html="renderedSummary">
                </div>
                <div v-else class="text-sm text-gray-500 py-2">Click the refresh button to generate an AI fleet overview.</div>
              </div>

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
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  overview: { type: Object, required: true },
  nokCount: { type: Number, default: 0 },
  riskCount: { type: Number, default: 0 },
  okCount: { type: Number, default: 0 },
  totalCount: { type: Number, default: 0 },
  stateChanges: { type: Number, default: 0 },
  renderedSummary: { type: String, default: '' },
  turbines: { type: Array, default: () => [] },
})

defineEmits(['close', 'refresh', 'open-turbine'])

const modalRef = ref(null)

// Section collapse state — NOK and RISK expanded by default, OK collapsed
const nokCollapsed = ref(false)
const riskCollapsed = ref(false)
const okCollapsed = ref(true)

const nokTurbines = computed(() => props.turbines.filter(t => t.status === 'NOK'))
const riskTurbines = computed(() => props.turbines.filter(t => t.status === 'RISK'))
const okTurbines = computed(() => props.turbines.filter(t => t.status === 'OK'))

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
