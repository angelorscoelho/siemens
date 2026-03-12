<template>
  <div
    @click="$emit('select', turbine)"
    class="bg-gray-900 border rounded-xl shadow-md cursor-pointer hover:shadow-lg hover:shadow-teal-900/20 transition-all duration-200 group relative overflow-hidden"
    :class="[borderClass, turbine.status === 'Critical' ? 'ring-1 ring-red-700/50' : '']"
  >
    <div class="p-4">
      <!-- Top section: Info + Equipment Photo (absolute top-right) -->
      <div class="flex items-start gap-3">
        <div class="flex-1 min-w-0">
          <p class="text-xs text-gray-500 uppercase tracking-widest font-medium leading-none mb-0.5 truncate">
            {{ turbine.location }}
          </p>
          <h3 class="text-sm font-bold text-white group-hover:text-teal-300 transition-colors leading-snug">
            {{ turbine.name }} / Unit {{ turbine.id }}
          </h3>
          <p class="text-xs text-gray-400 mt-0.5 leading-snug">{{ turbine.type }}</p>
          <span
            class="inline-block mt-1.5 px-2 py-0.5 text-xs font-bold rounded-full"
            :class="badgeClass"
          >
            {{ turbine.status }}
          </span>
        </div>

        <!-- Equipment Photo — top-right, ~25% of card width -->
        <div class="w-1/4 shrink-0">
          <img
            :src="turbine.imageUrl"
            :alt="turbine.name + ' ' + turbine.type"
            class="w-full aspect-square rounded-lg border-2 object-cover"
            :class="photoBorderClass"
            @error="onImageError"
          />
        </div>
      </div>

      <!-- Key Metrics — 2-column compact grid -->
      <div class="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 text-xs">
        <div class="flex justify-between">
          <span class="text-gray-500">Temp</span>
          <span class="font-mono font-semibold" :class="turbine.tempAlert ? 'text-yellow-400' : 'text-gray-200'">
            {{ formatValue(turbine.exhaustTemp, 1) }}°C
          </span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Vibration</span>
          <span class="font-mono font-semibold" :class="turbine.vibrationAlert ? 'text-red-400' : 'text-gray-200'">
            {{ formatValue(turbine.vibration, 2) }} mm/s
          </span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Speed</span>
          <span class="font-mono font-semibold text-gray-200">{{ formatValue(turbine.shaftSpeed, 0) }} RPM</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Power</span>
          <span class="font-mono font-semibold text-gray-200">{{ formatValue(turbine.powerOutput, 1) }} MW</span>
        </div>
        <div class="hidden md:flex justify-between">
          <span class="text-gray-500">Fuel</span>
          <span class="font-mono font-semibold text-gray-200">{{ formatValue(turbine.fuelFlow, 3) }} kg/s</span>
        </div>
        <div class="hidden md:flex justify-between">
          <span class="text-gray-500">Overhaul</span>
          <span class="font-mono font-semibold text-gray-200">{{ Math.floor(turbine.hoursSinceOverhaul).toLocaleString() }} h</span>
        </div>
      </div>

      <!-- Chart.js Mini Sparkline -->
      <div class="mt-3 pt-2 border-t border-gray-800">
        <p class="text-xs text-gray-500 mb-1">Vibration Trend (Last 60s)</p>
        <div class="h-14 md:h-16">
          <canvas ref="chartCanvas"></canvas>
        </div>
      </div>

      <!-- Alert banner -->
      <div
        v-if="turbine.alert"
        class="mt-2 p-2 bg-yellow-900 bg-opacity-40 border border-yellow-700 rounded text-xs text-yellow-300 leading-snug"
      >
        ⚠ {{ turbine.alert }}
      </div>

      <!-- Mobile tap hint -->
      <div class="md:hidden mt-2 text-xs text-gray-600 text-right">Tap for details →</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler } from 'chart.js'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler)

const props = defineProps({
  turbine: { type: Object, required: true },
})

defineEmits(['select'])

// ── Chart.js ──────────────────────────────────────────────────────────────────
const chartCanvas = ref(null)
let chartInstance = null

function getChartColor() {
  if (props.turbine.vibrationAlert) return { border: '#f87171', bg: 'rgba(248, 113, 113, 0.08)' }
  return { border: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.08)' }
}

function createChart() {
  if (!chartCanvas.value) return
  const colors = getChartColor()
  chartInstance = new Chart(chartCanvas.value, {
    type: 'line',
    data: {
      labels: Array(props.turbine.vibrationHistory.length).fill(''),
      datasets: [{
        data: [...props.turbine.vibrationHistory],
        borderColor: colors.border,
        borderWidth: 1.5,
        fill: true,
        backgroundColor: colors.bg,
        pointRadius: 0,
        tension: 0.3,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: { display: false },
        y: { display: false },
      },
      elements: { line: { borderCapStyle: 'round' } },
    },
  })
}

function updateChart() {
  if (!chartInstance) return
  const colors = getChartColor()
  const ds = chartInstance.data.datasets[0]
  ds.data = [...props.turbine.vibrationHistory]
  ds.borderColor = colors.border
  ds.backgroundColor = colors.bg
  chartInstance.data.labels = Array(props.turbine.vibrationHistory.length).fill('')
  chartInstance.update('none')
}

// Watch for vibration changes (triggers on every telemetry update)
watch(() => props.turbine.vibration, () => {
  updateChart()
})

onMounted(() => {
  createChart()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})

// ── Styling Helpers ───────────────────────────────────────────────────────────
const borderClass = computed(() => {
  if (props.turbine.status === 'Critical') return 'border-red-600'
  if (props.turbine.status === 'Warning') return 'border-yellow-600'
  return 'border-teal-700'
})

const badgeClass = computed(() => {
  if (props.turbine.status === 'Critical') return 'bg-red-900 text-red-300'
  if (props.turbine.status === 'Warning') return 'bg-yellow-900 text-yellow-300'
  return 'bg-teal-900 text-teal-300'
})

const photoBorderClass = computed(() => {
  if (props.turbine.status === 'Critical') return 'border-red-600'
  if (props.turbine.status === 'Warning') return 'border-yellow-600'
  return 'border-gray-600'
})

// ── Utilities ─────────────────────────────────────────────────────────────────
function formatValue(value, decimals) {
  if (typeof value !== 'number' || isNaN(value)) return '—'
  return value.toFixed(decimals)
}

function onImageError(e) {
  e.target.src = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="%231e293b" width="200" height="200"/><text fill="%232dd4bf" font-family="monospace" font-size="16" text-anchor="middle" x="100" y="105">' + props.turbine.name + '</text></svg>')}`
}
</script>
