<template>
  <div
    class="bg-gray-900 border rounded-xl shadow-md transition-all duration-200 group relative overflow-hidden"
    :class="[borderClass, focusedClass]"
    @click="onCardClick"
    ref="cardRef"
  >
    <div class="p-4">
      <!-- ── Card Header: Img | Name+Location | Manual | History | Status ── -->
      <div class="flex items-start gap-2 mb-3">

        <!-- Equipment Image (first item, clickable → drill-in) -->
        <div
          class="shrink-0 cursor-pointer"
          tabindex="0"
          role="button"
          :aria-label="`Open detail view for ${turbine.name}`"
          @click.stop="$emit('select', turbine, activeMetricKey)"
          @keydown.enter.prevent="$emit('select', turbine, activeMetricKey)"
          @keydown.space.prevent="$emit('select', turbine, activeMetricKey)"
        >
          <img
            :src="displayImageSrc"
            :alt="turbine.name + ' ' + turbine.type"
            class="w-10 h-10 rounded-lg border-2 object-cover"
            :class="photoBorderClass"
            @error="onImageError"
          />
        </div>

        <!-- Name + Location (clickable → drill-in) -->
        <div class="flex-1 min-w-0 cursor-pointer" @click.stop="$emit('select', turbine, activeMetricKey)">
          <p class="text-xs text-gray-500 uppercase tracking-widest font-medium leading-none mb-0.5 truncate">
            {{ turbine.location }}
          </p>
          <h3 class="text-sm font-bold text-white group-hover:text-teal-300 transition-colors leading-snug truncate">
            {{ turbine.name }} / Unit {{ turbine.id }}
          </h3>
          <p class="text-xs text-gray-400 mt-0.5 leading-snug truncate">{{ turbine.type }}</p>
        </div>

        <!-- Manual Icon (links to manufacturer manual) -->
        <a
          :href="turbine.manualUrl"
          target="_blank"
          rel="noopener noreferrer"
          @click.stop
          class="shrink-0 mt-0.5 p-1 rounded-md bg-gray-800 hover:bg-teal-900/60 text-gray-500 hover:text-teal-400 transition-colors"
          :title="`Open the ${turbine.name} equipment manual`"
          :aria-label="`Open the ${turbine.name} equipment manual`"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </a>

        <!-- Maintenance History Icon (opens history modal) -->
        <button
          @click.stop="$emit('show-history', turbine)"
          class="shrink-0 mt-0.5 p-1 rounded-md bg-gray-800 hover:bg-teal-900/60 text-gray-500 hover:text-teal-400 transition-colors"
          :title="`View maintenance history for ${turbine.name}`"
          :aria-label="`View maintenance history for ${turbine.name}`"
        >
          <!-- Anticlockwise clock / history icon -->
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <!-- Status Badge -->
        <span
          class="inline-block mt-0.5 px-2 py-0.5 text-xs font-bold rounded-full shrink-0 whitespace-nowrap"
          :class="badgeClass"
        >
          {{ turbine.status }}
        </span>
      </div>

      <!-- ── Metric Rows (individually clickable → changes graph) ── -->
      <div class="space-y-0.5">
        <div
          v-for="param in metricParams"
          :key="param.key"
          @click.stop="selectMetric(param.key)"
          class="flex items-center justify-between px-2 py-1 rounded-lg cursor-pointer transition-all"
          :class="[
            activeMetricKey === param.key
              ? 'bg-gray-700 ring-1 ' + activeRingClass
              : 'hover:bg-gray-800/60'
          ]"
          :title="`Show ${param.label} trend`"
        >
          <span class="text-xs text-gray-400">{{ param.label }}</span>
          <span
            class="text-xs font-mono font-semibold"
            :class="getMetricColorClass(param.key)"
          >
            {{ formatValue(turbine[param.key], param.decimals) }}
            <span class="text-gray-500 font-normal">{{ param.unit }}</span>
          </span>
        </div>
      </div>

      <!-- ── Chart Area ── -->
      <div class="mt-3 pt-2 border-t border-gray-800">
        <!-- Chart Header: label + min/max -->
        <div class="flex items-center justify-between mb-1 gap-2">
          <p class="text-xs font-medium" :class="activeMetricColorClass">
            {{ activeParam.label }} Trend
          </p>
          <span class="text-[10px] text-gray-600 shrink-0">
            ↓{{ chartMin }} · ↑{{ chartMax }} {{ activeParam.unit }}
          </span>
        </div>
        <div class="h-16 md:h-20 relative cursor-pointer" @click.stop="$emit('select', turbine, activeMetricKey)" title="Click to open full detail view">
          <canvas ref="chartCanvas"></canvas>
        </div>
      </div>

      <!-- ── Alert Banner (RISK/NOK) ── -->
      <div
        v-if="turbine.alert"
        class="mt-2 p-2 rounded text-xs leading-snug relative flex items-start gap-1 cursor-pointer group/alert"
        :class="turbine.status === 'NOK'
          ? 'bg-red-900/40 border border-red-700 text-red-300 hover:bg-red-900/60'
          : 'bg-yellow-900/40 border border-yellow-700 text-yellow-300 hover:bg-yellow-900/60'"
        @click.stop="$emit('select', turbine, activeMetricKey)"
        :title="'Click to open full detail view'"
      >
        <span class="flex-1">⚠ {{ turbine.alert }}</span>
        <!-- Bot / AI assistant button (problem-solving mode) -->
        <button
          @click.stop="$emit('ask-assistant', turbine)"
          class="bot-icon-btn shrink-0 ml-1 p-1 rounded-md transition-all duration-200 cursor-pointer"
          :class="turbine.status === 'NOK'
            ? 'bg-red-900/60 text-red-300 hover:bg-red-700/80 hover:text-red-100 nok-glow'
            : 'bg-yellow-900/60 text-yellow-300 hover:bg-yellow-700/80 hover:text-yellow-100 risk-glow'"
          title="Ask Assistant for Detailed Analysis"
          aria-label="Ask Assistant for Detailed Analysis"
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
      </div>

      <!-- ── OK card insight (status = OK) ── -->
      <div v-if="turbine.status === 'OK'" class="mt-2 space-y-1">
        <div class="flex items-start gap-1.5 px-2 py-1.5 rounded-lg bg-teal-900/20 border border-teal-800/40">
          <svg class="w-3 h-3 text-teal-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div class="flex-1 min-w-0">
            <p class="text-[10px] text-teal-400 font-medium leading-snug">{{ okInsight.stableStr }}</p>
            <p class="text-[10px] text-gray-400 leading-snug mt-0.5">{{ okInsight.positive }}</p>
            <p class="text-[10px] text-gray-500 leading-snug mt-0.5 italic">Watch: {{ okInsight.commonIssue }}</p>
          </div>
          <!-- Bot icon: overview mode -->
          <button
            @click.stop="$emit('ask-overview', turbine)"
            class="bot-icon-btn shrink-0 p-1 rounded-md bg-teal-900/40 text-teal-400 hover:bg-teal-800/60 hover:text-teal-200 ok-glow transition-all duration-200 cursor-pointer"
            title="Ask Assistant for Equipment Overview"
            aria-label="Ask Assistant for Equipment Overview"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="8" width="18" height="12" rx="2"/>
              <path d="M12 2v4"/>
              <circle cx="12" cy="6" r="1" fill="currentColor" stroke="none"/>
              <circle cx="9" cy="13" r="1.2" fill="currentColor" stroke="none"/>
              <circle cx="15" cy="13" r="1.2" fill="currentColor" stroke="none"/>
              <path d="M9 17h6"/>
              <path d="M3 12H1m22 0h-2"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile tap hint -->
      <div class="md:hidden mt-1 text-xs text-gray-600 text-right">Tap name for details →</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import {
  Chart,
  LineController, LineElement, PointElement,
  LinearScale, CategoryScale, Filler, Tooltip,
} from 'chart.js'
import { metricParams, getMostCriticalMetricKey, historyMetricKeys, makeFallbackSvg, getOkCardInsight } from '../fleetStore.js'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip)

const props = defineProps({
  turbine: { type: Object, required: true },
  focused: { type: Boolean, default: false },
})

defineEmits(['select', 'show-history', 'ask-assistant', 'ask-overview'])

// ── Equipment image with reactive fallback ────────────────────────────────────
const imageHasError = ref(false)
watch(() => props.turbine.imageUrl, () => { imageHasError.value = false })
const displayImageSrc = computed(() => {
  if (imageHasError.value) {
    const color = props.turbine.status === 'NOK' ? '#f87171'
      : props.turbine.status === 'RISK' ? '#fbbf24' : '#2dd4bf'
    return makeFallbackSvg(props.turbine.name, props.turbine.type, color)
  }
  return props.turbine.imageUrl
})

// ── OK card insight data ──────────────────────────────────────────────────────
const okInsight = computed(() => getOkCardInsight(props.turbine))

// ── Focus / Glow / Vibrate animation ─────────────────────────────────────────
const cardRef = ref(null)
const isFocused = ref(false)
let focusTimeout = null

watch(() => props.focused, (val) => {
  if (val) {
    isFocused.value = true
    if (focusTimeout) clearTimeout(focusTimeout)
    focusTimeout = setTimeout(() => { isFocused.value = false }, 13500)
    // Scroll into view
    if (cardRef.value) {
      cardRef.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }
})

onUnmounted(() => {
  if (focusTimeout) clearTimeout(focusTimeout)
})

const focusedClass = computed(() => {
  if (!isFocused.value) return ''
  if (props.turbine.status === 'NOK') return 'card-focus-nok'
  if (props.turbine.status === 'RISK') return 'card-focus-risk'
  return 'card-focus-ok'
})

// ── Metric Selection ──────────────────────────────────────────────────────────
const selectedMetricKey = ref(null) // null = auto (most critical)

const activeMetricKey = computed(() => {
  return selectedMetricKey.value || getMostCriticalMetricKey(props.turbine)
})

const activeParam = computed(() => {
  return metricParams.find(p => p.key === activeMetricKey.value) || metricParams[0]
})

function selectMetric(key) {
  selectedMetricKey.value = (selectedMetricKey.value === key) ? null : key
  updateChart()
}

function onCardClick() {
  // Clicking non-metric part → no action from card itself; emit is on name div
}

// ── Chart.js ──────────────────────────────────────────────────────────────────
const chartCanvas = ref(null)
let chartInstance = null

function getChartColors() {
  const key = activeMetricKey.value
  const isAlert =
    (key === 'vibration' && props.turbine.vibrationAlert) ||
    (key === 'exhaustTemp' && props.turbine.tempAlert)
  if (props.turbine.status === 'NOK') return { border: '#f87171', bg: 'rgba(248,113,113,0.10)' }
  if (isAlert) return { border: '#fbbf24', bg: 'rgba(251,191,36,0.10)' }
  return { border: '#2dd4bf', bg: 'rgba(45,212,191,0.08)' }
}

function getTimeLabels(count, intervalSec = 2) {
  const now = Date.now()
  return Array.from({ length: count }, (_, i) => {
    const agoMs = (count - 1 - i) * intervalSec * 1000
    const ts = new Date(now - agoMs)
    return ts.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  })
}

function getActiveHistory() {
  const key = activeMetricKey.value
  if (historyMetricKeys.includes(key) && props.turbine.metricHistory) {
    return props.turbine.metricHistory[key] || []
  }
  return []
}

function createChart() {
  if (!chartCanvas.value) return
  const history = getActiveHistory()
  const colors = getChartColors()
  const param = activeParam.value
  const labels = getTimeLabels(history.length)

  chartInstance = new Chart(chartCanvas.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data: [...history],
        borderColor: colors.border,
        borderWidth: 1.5,
        fill: true,
        backgroundColor: colors.bg,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.3,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(15,23,42,0.92)',
          titleColor: '#94a3b8',
          bodyColor: colors.border,
          borderColor: colors.border,
          borderWidth: 1,
          titleFont: { size: 10 },
          bodyFont: { size: 11, weight: 'bold' },
          callbacks: {
            title: (items) => items[0]?.label || '',
            label: (item) => ` ${item.formattedValue} ${param.unit}`,
          },
          padding: 8,
          cornerRadius: 6,
        },
      },
      scales: {
        x: {
          display: true,
          ticks: {
            maxTicksLimit: 5,
            color: '#4b5563',
            font: { size: 9 },
            maxRotation: 0,
          },
          grid: { display: false },
        },
        y: {
          display: true,
          position: 'left',
          ticks: {
            maxTicksLimit: 4,
            color: '#4b5563',
            font: { size: 9 },
          },
          grid: { color: 'rgba(75,85,99,0.1)' },
          title: {
            display: true,
            text: param.unit,
            color: '#4b5563',
            font: { size: 9 },
          },
        },
      },
      elements: { line: { borderCapStyle: 'round' } },
      interaction: { mode: 'index', intersect: false },
    },
  })
}

function updateChart() {
  if (!chartInstance) return
  const history = getActiveHistory()
  const colors = getChartColors()
  const param = activeParam.value
  const labels = getTimeLabels(history.length)

  const ds = chartInstance.data.datasets[0]
  ds.data = [...history]
  ds.borderColor = colors.border
  ds.backgroundColor = colors.bg
  chartInstance.data.labels = labels

  // Update tooltip callback for new param unit
  chartInstance.options.plugins.tooltip.bodyColor = colors.border
  chartInstance.options.plugins.tooltip.borderColor = colors.border
  chartInstance.options.plugins.tooltip.callbacks.label = (item) =>
    ` ${item.formattedValue} ${param.unit}`
  chartInstance.options.scales.y.title.text = param.unit

  chartInstance.update('none')
}

// Chart min/max for display
const chartMin = computed(() => {
  const history = getActiveHistory()
  if (!history.length) return '—'
  const min = Math.min(...history)
  return min.toFixed(activeParam.value.decimals)
})

const chartMax = computed(() => {
  const history = getActiveHistory()
  if (!history.length) return '—'
  const max = Math.max(...history)
  return max.toFixed(activeParam.value.decimals)
})

// Watch for telemetry changes
watch(
  [() => props.turbine.exhaustTemp, () => props.turbine.vibration,
   () => props.turbine.shaftSpeed, () => props.turbine.powerOutput,
   () => props.turbine.fuelFlow],
  () => { updateChart() },
)

onMounted(() => { createChart() })

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})

// ── Styling Helpers ───────────────────────────────────────────────────────────
const borderClass = computed(() => {
  if (props.turbine.status === 'NOK') return 'border-red-600'
  if (props.turbine.status === 'RISK') return 'border-yellow-600'
  return 'border-teal-700'
})

const badgeClass = computed(() => {
  if (props.turbine.status === 'NOK') return 'bg-red-900 text-red-300'
  if (props.turbine.status === 'RISK') return 'bg-yellow-900 text-yellow-300'
  return 'bg-teal-900 text-teal-300'
})

const photoBorderClass = computed(() => {
  if (props.turbine.status === 'NOK') return 'border-red-600'
  if (props.turbine.status === 'RISK') return 'border-yellow-600'
  return 'border-gray-600'
})

const activeRingClass = computed(() => {
  if (props.turbine.status === 'NOK') return 'ring-red-700'
  if (props.turbine.status === 'RISK') return 'ring-yellow-700'
  return 'ring-teal-700'
})

const activeMetricColorClass = computed(() => {
  const key = activeMetricKey.value
  if (key === 'vibration' && props.turbine.vibrationAlert) return 'text-red-400'
  if (key === 'exhaustTemp' && props.turbine.tempAlert) return 'text-yellow-400'
  return 'text-gray-400'
})

// ── Utilities ─────────────────────────────────────────────────────────────────
function getMetricColorClass(key) {
  if (key === 'exhaustTemp' && props.turbine.tempAlert) return 'text-yellow-400'
  if (key === 'vibration' && props.turbine.vibrationAlert) return 'text-red-400'
  return 'text-gray-200'
}

function formatValue(value, decimals) {
  if (typeof value !== 'number' || isNaN(value)) return '—'
  return value.toFixed(decimals)
}

function onImageError() {
  imageHasError.value = true
}
</script>

<style scoped>
/* ── Focus animations ── */
@keyframes card-glow-nok {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
  40% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0.35), 0 0 20px 4px rgba(239, 68, 68, 0.2); }
}
@keyframes card-glow-risk {
  0%, 100% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0); }
  40% { box-shadow: 0 0 0 6px rgba(234, 179, 8, 0.35), 0 0 20px 4px rgba(234, 179, 8, 0.2); }
}
@keyframes card-glow-ok {
  0%, 100% { box-shadow: 0 0 0 0 rgba(45, 212, 191, 0); }
  40% { box-shadow: 0 0 0 6px rgba(45, 212, 191, 0.35), 0 0 20px 4px rgba(45, 212, 191, 0.2); }
}
@keyframes card-vibrate {
  0%, 100% { transform: translateX(0); }
  10%       { transform: translateX(-4px) rotate(-0.5deg); }
  20%       { transform: translateX(4px) rotate(0.5deg); }
  30%       { transform: translateX(-4px) rotate(-0.5deg); }
  40%       { transform: translateX(4px) rotate(0.5deg); }
  50%       { transform: translateX(-2px); }
  60%       { transform: translateX(2px); }
  70%       { transform: translateX(-1px); }
  80%       { transform: translateX(1px); }
  90%       { transform: translateX(0); }
}

.card-focus-nok {
  animation: card-vibrate 1s ease-in-out, card-glow-nok 2.5s ease-in-out 5;
}
.card-focus-risk {
  animation: card-vibrate 1s ease-in-out, card-glow-risk 2.5s ease-in-out 5;
}
.card-focus-ok {
  animation: card-vibrate 1s ease-in-out, card-glow-ok 2.5s ease-in-out 5;
}

/* ── Bot icon button hover glow ── */
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
