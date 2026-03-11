<template>
  <div class="min-h-screen bg-gray-950 text-gray-100 font-sans">
    <!-- Header -->
    <header class="bg-gray-900 border-b border-teal-700 shadow-lg">
      <div class="max-w-7xl mx-auto px-6 py-5 flex items-center gap-4">
        <div class="flex items-center gap-3">
          <svg class="w-9 h-9 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-white">
              Siemens Energy — Gas Turbine AI Maintenance Assistant
            </h1>
            <p class="text-sm text-teal-400 font-medium">
              Proof of Concept · Distributed AI Factory · Industrial RAG Pipeline
            </p>
          </div>
        </div>
        <span class="ml-auto px-3 py-1 text-xs bg-teal-900 text-teal-300 rounded-full border border-teal-700 font-semibold uppercase tracking-wider">
          PoC v1.0
        </span>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-8 space-y-10">

      <!-- Fleet Status Section -->
      <section>
        <h2 class="text-lg font-semibold text-teal-300 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Fleet Status — Live Telemetry
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div v-for="turbine in turbines" :key="turbine.id"
            class="bg-gray-900 border rounded-xl p-5 shadow-md"
            :class="turbine.status === 'Operational' ? 'border-teal-700' : turbine.status === 'Warning' ? 'border-yellow-600' : 'border-red-700'">
            <div class="flex items-start justify-between mb-3">
              <div>
                <p class="text-xs text-gray-400 uppercase tracking-widest font-medium">{{ turbine.location }}</p>
                <h3 class="text-base font-bold text-white mt-0.5">{{ turbine.id }}</h3>
              </div>
              <span class="px-2.5 py-1 text-xs font-semibold rounded-full"
                :class="turbine.status === 'Operational' ? 'bg-teal-900 text-teal-300' : turbine.status === 'Warning' ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'">
                {{ turbine.status }}
              </span>
            </div>
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between">
                <dt class="text-gray-400">Exhaust Temp</dt>
                <dd class="font-mono font-semibold" :class="turbine.tempAlert ? 'text-yellow-400' : 'text-gray-100'">
                  {{ turbine.exhaustTemp }}°C
                </dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-400">Shaft Speed</dt>
                <dd class="font-mono font-semibold text-gray-100">{{ turbine.shaftSpeed }} RPM</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-400">Vibration</dt>
                <dd class="font-mono font-semibold" :class="turbine.vibrationAlert ? 'text-red-400' : 'text-gray-100'">
                  {{ turbine.vibration }} mm/s
                </dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-400">Hours Since Overhaul</dt>
                <dd class="font-mono font-semibold text-gray-100">{{ turbine.hoursSinceOverhaul.toLocaleString() }} h</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-400">Fuel Flow</dt>
                <dd class="font-mono font-semibold text-gray-100">{{ turbine.fuelFlow }} kg/s</dd>
              </div>
            </dl>
            <div v-if="turbine.alert" class="mt-3 p-2 bg-yellow-900 bg-opacity-40 border border-yellow-700 rounded text-xs text-yellow-300">
              ⚠ {{ turbine.alert }}
            </div>
          </div>
        </div>
      </section>

      <!-- AI Maintenance Assistant -->
      <section>
        <h2 class="text-lg font-semibold text-teal-300 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          AI Maintenance Assistant
          <span class="text-xs text-gray-500 font-normal ml-1">(RAG Pipeline — powered by OpenAI)</span>
        </h2>

        <!-- Chat Window -->
        <div class="bg-gray-900 border border-gray-700 rounded-xl flex flex-col" style="height: 520px;">
          <!-- Messages -->
          <div ref="chatScrollRef" class="flex-1 overflow-y-auto p-5 space-y-4">
            <!-- Empty state -->
            <div v-if="messages.length === 0" class="h-full flex flex-col items-center justify-center text-center text-gray-500 gap-3">
              <svg class="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <p class="text-sm">Ask the assistant about gas turbine maintenance, fault diagnosis, or inspection procedures.</p>
              <div class="flex flex-wrap gap-2 justify-center mt-2">
                <button v-for="sample in sampleQuestions" :key="sample"
                  @click="useQuestion(sample)"
                  class="px-3 py-1.5 text-xs bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:border-teal-600 hover:text-teal-300 transition-colors cursor-pointer">
                  {{ sample }}
                </button>
              </div>
            </div>

            <!-- Messages list -->
            <template v-for="(msg, idx) in messages" :key="idx">
              <!-- User message -->
              <div v-if="msg.role === 'user'" class="flex justify-end">
                <div class="max-w-lg bg-teal-800 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm shadow">
                  {{ msg.content }}
                </div>
              </div>

              <!-- Assistant message -->
              <div v-else class="flex justify-start">
                <div class="max-w-2xl space-y-3">
                  <!-- Retrieved Context block -->
                  <div v-if="msg.context" class="bg-gray-800 border border-gray-600 rounded-xl p-4">
                    <p class="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Retrieved Context (RAG)
                    </p>
                    <p class="text-xs text-gray-400 leading-relaxed whitespace-pre-wrap">{{ msg.context }}</p>
                  </div>

                  <!-- AI Answer -->
                  <div class="bg-gray-800 border border-teal-800 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-100 shadow leading-relaxed">
                    {{ msg.content }}
                  </div>
                </div>
              </div>
            </template>

            <!-- Loading indicator -->
            <div v-if="loading" class="flex justify-start">
              <div class="bg-gray-800 border border-gray-600 rounded-2xl rounded-tl-sm px-5 py-3 flex items-center gap-2">
                <span class="flex gap-1">
                  <span class="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                  <span class="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                  <span class="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
                </span>
                <span class="text-xs text-gray-400">Querying AI assistant…</span>
              </div>
            </div>

            <!-- Error -->
            <div v-if="error" class="bg-red-900 bg-opacity-40 border border-red-700 rounded-xl px-4 py-3 text-sm text-red-300 flex items-start gap-2">
              <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ error }}</span>
            </div>
          </div>

          <!-- Input -->
          <div class="border-t border-gray-700 p-4">
            <form @submit.prevent="sendMessage" class="flex gap-3">
              <input
                v-model="inputText"
                type="text"
                placeholder="Ask about maintenance procedures, fault codes, inspection intervals…"
                :disabled="loading"
                class="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 disabled:opacity-50 transition-colors"
              />
              <button
                type="submit"
                :disabled="loading || !inputText.trim()"
                class="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>

    <footer class="mt-10 border-t border-gray-800 py-5 text-center text-xs text-gray-600">
      Siemens Energy · Gas Turbine AI Maintenance Assistant · PoC · Built with Vue.js + AWS Lambda + OpenAI
    </footer>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

// ── Mock Fleet Telemetry ──────────────────────────────────────────────────────
const turbines = [
  {
    id: 'SGT-800 / Unit GT-01',
    location: 'Plant Alpha — Berlin, DE',
    status: 'Operational',
    exhaustTemp: 548,
    shaftSpeed: 7654,
    vibration: 1.2,
    hoursSinceOverhaul: 12450,
    fuelFlow: 8.3,
    tempAlert: false,
    vibrationAlert: false,
    alert: null,
  },
  {
    id: 'SGT-700 / Unit GT-02',
    location: 'Plant Beta — Houston, TX',
    status: 'Warning',
    exhaustTemp: 614,
    shaftSpeed: 7590,
    vibration: 4.7,
    hoursSinceOverhaul: 23810,
    fuelFlow: 7.8,
    tempAlert: true,
    vibrationAlert: true,
    alert: 'High vibration detected on bearing #3. Maintenance recommended within 48 h.',
  },
  {
    id: 'SGT-600 / Unit GT-03',
    location: 'Plant Gamma — Riyadh, SA',
    status: 'Offline',
    exhaustTemp: 0,
    shaftSpeed: 0,
    vibration: 0,
    hoursSinceOverhaul: 31200,
    fuelFlow: 0,
    tempAlert: false,
    vibrationAlert: false,
    alert: 'Scheduled overhaul in progress. Est. return: 2026-03-15.',
  },
]

// ── Chat State ────────────────────────────────────────────────────────────────
const messages = ref([])
const inputText = ref('')
const loading = ref(false)
const error = ref('')
const chatScrollRef = ref(null)

const sampleQuestions = [
  'What are the vibration thresholds for bearing fault detection?',
  'How often should combustion liners be inspected?',
  'What causes high exhaust temperature readings?',
  'Describe the hot gas path inspection procedure.',
]

const API_URL = import.meta.env.VITE_API_URL || ''

function useQuestion(q) {
  inputText.value = q
}

async function sendMessage() {
  const query = inputText.value.trim()
  if (!query || loading.value) return

  error.value = ''
  messages.value.push({ role: 'user', content: query })
  inputText.value = ''
  loading.value = true
  await scrollToBottom()

  try {
    if (!API_URL) {
      throw new Error('VITE_API_URL is not configured. Please set it in your .env file.')
    }
    const res = await fetch(`${API_URL}/ask-assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })

    if (!res.ok) {
      const detail = await res.text()
      throw new Error(`API error ${res.status}: ${detail}`)
    }

    const data = await res.json()
    messages.value.push({
      role: 'assistant',
      content: data.answer,
      context: data.context,
    })
  } catch (err) {
    error.value = err.message || 'An unexpected error occurred. Please try again.'
    // Remove the user message on hard error so context isn't lost
  } finally {
    loading.value = false
    await scrollToBottom()
  }
}

async function scrollToBottom() {
  await nextTick()
  if (chatScrollRef.value) {
    chatScrollRef.value.scrollTop = chatScrollRef.value.scrollHeight
  }
}
</script>
