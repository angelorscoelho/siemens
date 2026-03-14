<template>
  <div
    class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors"
    :class="bannerClass"
  >
    <span class="w-2 h-2 rounded-full shrink-0" :class="dotClass"></span>
    <span :class="countClass">{{ count }}</span>
    <span class="text-gray-400">{{ label }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true },
  count: { type: Number, required: true },
  label: { type: String, required: true },
})

const bannerClass = computed(() => {
  if (props.status === 'NOK') return 'bg-red-900/30 border-red-800/60'
  if (props.status === 'RISK') return 'bg-yellow-900/30 border-yellow-800/60'
  if (props.status === 'OK') return 'bg-teal-900/30 border-teal-800/60'
  return 'bg-gray-800 border-gray-700'
})

const dotClass = computed(() => {
  if (props.status === 'NOK') return 'bg-red-400 animate-pulse'
  if (props.status === 'RISK') return 'bg-yellow-400 animate-pulse'
  if (props.status === 'OK') return 'bg-teal-400'
  return 'bg-gray-400'
})

const countClass = computed(() => {
  if (props.status === 'NOK') return 'text-red-300 font-bold'
  if (props.status === 'RISK') return 'text-yellow-300 font-bold'
  if (props.status === 'OK') return 'text-teal-300 font-bold'
  return 'text-gray-300'
})
</script>
