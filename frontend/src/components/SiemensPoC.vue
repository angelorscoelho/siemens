<template>
  <div class="min-h-screen bg-gray-950 text-gray-100 font-sans flex flex-col">

    <!-- ═══════════════════════════════════════════════════════════════
         HEADER — Desktop full / Mobile compact
    ═══════════════════════════════════════════════════════════════ -->
    <header class="bg-gray-900 border-b border-teal-700 shadow-lg shrink-0 z-30">

      <!-- Desktop header -->
      <div class="hidden md:flex max-w-full mx-auto px-6 py-5 items-center gap-4">
        <a href="https://www.angelorscoelho.dev"
           class="flex items-center gap-1.5 text-xs text-gray-400 hover:text-teal-400 transition-colors shrink-0 mr-2"
           title="Back to portfolio">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          angelorscoelho.dev
        </a>
        <div class="flex items-center gap-3">
          <svg class="w-9 h-9 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
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
        <div class="ml-auto flex items-center gap-3">
          <span class="px-3 py-1 text-xs bg-teal-900 text-teal-300 rounded-full border border-teal-700 font-semibold uppercase tracking-wider">
            PoC v2.0
          </span>
          <button @click="toggleAssistant"
            class="px-3 py-1.5 text-xs bg-gray-800 border border-gray-600 rounded-lg text-gray-300 hover:border-teal-600 hover:text-teal-300 transition-colors cursor-pointer flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {{ assistantOpen ? 'Hide' : 'Show' }} Assistant
          </button>
        </div>
      </div>

      <!-- Mobile header — compact with fleet status badges -->
      <div class="md:hidden px-4 py-3 flex items-center gap-3">
        <svg class="w-7 h-7 text-teal-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <div class="flex-1 min-w-0">
          <h1 class="text-sm font-bold text-white leading-tight truncate">GT AI Maintenance</h1>
          <p class="text-xs text-teal-400 leading-tight">Siemens Energy · PoC v2.0</p>
        </div>
        <!-- Live fleet status pills -->
        <div class="flex items-center gap-1.5 shrink-0">
          <span v-if="criticalCount > 0"
            class="flex items-center gap-1 px-2 py-0.5 bg-red-900 text-red-300 text-xs rounded-full font-bold">
            <span class="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></span>
            {{ criticalCount }}
          </span>
          <span v-if="warningCount > 0"
            class="flex items-center gap-1 px-2 py-0.5 bg-yellow-900 text-yellow-300 text-xs rounded-full font-bold">
            <span class="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></span>
            {{ warningCount }}
          </span>
          <span v-if="criticalCount === 0 && warningCount === 0"
            class="flex items-center gap-1 px-2 py-0.5 bg-teal-900 text-teal-300 text-xs rounded-full font-bold">
            <span class="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse"></span>
            All OK
          </span>
        </div>
      </div>
    </header>

    <!-- ═══════════════════════════════════════════════════════════════
         ALERT BALLOON — repositioned for mobile
    ═══════════════════════════════════════════════════════════════ -->
    <transition name="balloon">
      <div v-if="alertBalloon"
        class="fixed top-[4.5rem] right-3 md:top-24 md:right-6 z-50 max-w-[calc(100vw-1.5rem)] md:max-w-sm">
        <div class="bg-red-900 border border-red-500 rounded-xl px-4 py-3 shadow-2xl flex items-start gap-3 animate-pulse-once">
          <svg class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold text-red-300 truncate">{{ alertBalloon.title }}</p>
            <p class="text-xs text-red-400 mt-0.5 leading-relaxed">{{ alertBalloon.message }}</p>
          </div>
          <button @click="alertBalloon = null" class="text-red-500 hover:text-red-300 cursor-pointer shrink-0">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </transition>

    <!-- ═══════════════════════════════════════════════════════════════
         MAIN CONTENT AREA
    ═══════════════════════════════════════════════════════════════ -->
    <div class="flex-1 flex overflow-hidden">

      <!-- ── Fleet / Detail panel ────────────────────────────────── -->
      <!-- Desktop: always visible as flex-1; Mobile: hidden when chat tab is active -->
      <div
        class="flex-1 overflow-y-auto pb-2 md:pb-0"
        :class="[
          'px-4 py-5 md:px-6 md:py-8',
          mobileView === 'chat' ? 'hidden md:block' : 'block'
        ]">

        <!-- ── Detail view ── -->
        <div v-if="selectedTurbine">
          <button
            @click="clearTurbineSelection"
            class="mb-4 flex items-center gap-2 text-sm text-gray-400 hover:text-teal-400 transition-colors cursor-pointer">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Fleet Overview
          </button>

          <div class="bg-gray-900 border rounded-xl p-4 md:p-6 shadow-md" :class="statusBorderClass(selectedTurbine)">
            <!-- Header row -->
            <div class="flex items-start justify-between mb-4 gap-3">
              <div class="min-w-0">
                <p class="text-xs text-gray-400 uppercase tracking-widest font-medium">{{ selectedTurbine.location }}</p>
                <h3 class="text-base md:text-xl font-bold text-white mt-1 leading-tight">{{ selectedTurbine.id }}</h3>
                <p class="text-xs md:text-sm text-gray-400 mt-1 leading-snug">{{ selectedTurbine.description }}</p>
              </div>
              <span class="px-2.5 py-1 text-xs md:text-sm font-semibold rounded-full shrink-0"
                :class="statusBadgeClass(selectedTurbine)">
                {{ selectedTurbine.status }}
              </span>
            </div>

            <!-- Detailed Metrics -->
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
              <div v-for="param in metricParams" :key="param.key"
                class="bg-gray-800 rounded-lg p-3">
                <p class="text-xs text-gray-400 mb-1 leading-tight">{{ param.label }}</p>
                <p class="text-base md:text-lg font-mono font-bold leading-tight"
                  :class="getMetricColorClass(selectedTurbine, param.key)">
                  {{ formatValue(selectedTurbine[param.key], param.decimals) }}
                  <span class="text-xs font-normal text-gray-400">{{ param.unit }}</span>
                </p>
              </div>
            </div>

            <!-- Vibration Sparkline -->
            <div class="bg-gray-800 rounded-lg p-3 mb-5">
              <p class="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">Vibration Trend (Last 60 readings)</p>
              <svg :viewBox="'0 0 300 80'" class="w-full h-16 md:h-20" preserveAspectRatio="none">
                <polyline
                  :points="getSparklinePoints(selectedTurbine.vibrationHistory, 300, 80)"
                  fill="none"
                  :stroke="selectedTurbine.vibrationAlert ? '#f87171' : '#2dd4bf'"
                  stroke-width="1.5"
                  stroke-linejoin="round"
                />
              </svg>
            </div>

            <!-- Maintenance Documentation -->
            <div class="bg-gray-800 border border-gray-600 rounded-xl p-4">
              <h4 class="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Maintenance Documentation &amp; History
              </h4>
              <div class="space-y-3 text-sm text-gray-300">
                <div v-for="doc in selectedTurbine.documentation" :key="doc.title" class="border-l-2 border-teal-700 pl-3">
                  <p class="font-semibold text-white text-xs md:text-sm">{{ doc.title }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">{{ doc.content }}</p>
                </div>
              </div>
            </div>

            <!-- AI Maintenance Suggestion -->
            <div v-if="selectedTurbine.status !== 'Operational'" class="mt-4 bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded-xl p-4">
              <p class="text-xs text-yellow-400 font-semibold mb-2">🤖 AI Maintenance Suggestion</p>
              <p class="text-xs md:text-sm text-yellow-200">{{ selectedTurbine.aiSuggestion }}</p>
              <button @click="askAboutTurbineMobile(selectedTurbine)"
                class="mt-3 px-4 py-2 text-xs bg-teal-700 hover:bg-teal-600 text-white rounded-lg transition-colors cursor-pointer">
                Ask Assistant for Detailed Analysis
              </button>
            </div>
          </div>
        </div>

        <!-- ── Fleet Overview ── -->
        <section v-else>
          <!-- Mobile: compact summary strip -->
          <div class="md:hidden flex gap-2 mb-4 overflow-x-auto pb-1 -mx-4 px-4">
            <div class="flex-none flex items-center gap-1.5 bg-gray-800 rounded-lg px-3 py-2 text-xs">
              <span class="w-2 h-2 bg-gray-400 rounded-full"></span>
              <span class="text-gray-400 font-medium">{{ turbines.length }} Units</span>
            </div>
            <div v-if="criticalCount > 0" class="flex-none flex items-center gap-1.5 bg-red-900/60 border border-red-700 rounded-lg px-3 py-2 text-xs text-red-300 font-semibold">
              <span class="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
              {{ criticalCount }} Critical
            </div>
            <div v-if="warningCount > 0" class="flex-none flex items-center gap-1.5 bg-yellow-900/60 border border-yellow-700 rounded-lg px-3 py-2 text-xs text-yellow-300 font-semibold">
              <span class="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
              {{ warningCount }} Warning
            </div>
            <div class="flex-none flex items-center gap-1.5 bg-teal-900/40 border border-teal-800 rounded-lg px-3 py-2 text-xs text-teal-300 font-semibold">
              <span class="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
              Live · 2s
            </div>
          </div>

          <h2 class="hidden md:flex text-lg font-semibold text-teal-300 mb-4 items-center gap-2">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Fleet Status — Live Telemetry
            <span class="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span class="text-xs text-gray-500 font-normal">Updates every 2s</span>
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-5">
            <div v-for="turbine in turbines" :key="turbine.id"
              @click="openTurbineSession(turbine)"
              class="bg-gray-900 border rounded-xl shadow-md cursor-pointer hover:shadow-lg hover:shadow-teal-900/20 transition-all duration-200 group"
              :class="[statusBorderClass(turbine), turbine.status === 'Critical' ? 'ring-1 ring-red-700/50' : '']">

              <!-- Mobile card layout: horizontal summary + expand -->
              <div class="p-4">
                <!-- Top row: name + badge -->
                <div class="flex items-start justify-between gap-2 mb-2">
                  <div class="min-w-0">
                    <p class="text-xs text-gray-500 uppercase tracking-widest font-medium leading-none mb-0.5 truncate">{{ turbine.location }}</p>
                    <h3 class="text-sm font-bold text-white group-hover:text-teal-300 transition-colors leading-snug">{{ turbine.id }}</h3>
                  </div>
                  <span class="px-2 py-0.5 text-xs font-bold rounded-full shrink-0"
                    :class="statusBadgeClass(turbine)">
                    {{ turbine.status }}
                  </span>
                </div>

                <!-- Mobile: 2-col compact metrics -->
                <div class="grid grid-cols-2 gap-x-4 gap-y-1.5 md:hidden text-xs mb-2">
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
                </div>

                <!-- Desktop: full metric list -->
                <dl class="hidden md:block space-y-2 text-sm mb-0">
                  <div class="flex justify-between">
                    <dt class="text-gray-400">Exhaust Temp</dt>
                    <dd class="font-mono font-semibold" :class="turbine.tempAlert ? 'text-yellow-400' : 'text-gray-100'">
                      {{ formatValue(turbine.exhaustTemp, 1) }}°C
                    </dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-gray-400">Shaft Speed</dt>
                    <dd class="font-mono font-semibold text-gray-100">{{ formatValue(turbine.shaftSpeed, 1) }} RPM</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-gray-400">Vibration</dt>
                    <dd class="font-mono font-semibold" :class="turbine.vibrationAlert ? 'text-red-400' : 'text-gray-100'">
                      {{ formatValue(turbine.vibration, 3) }} mm/s
                    </dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-gray-400">Power Output</dt>
                    <dd class="font-mono font-semibold text-gray-100">{{ formatValue(turbine.powerOutput, 2) }} MW</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-gray-400">Fuel Flow</dt>
                    <dd class="font-mono font-semibold text-gray-100">{{ formatValue(turbine.fuelFlow, 3) }} kg/s</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-gray-400">Hours Since Overhaul</dt>
                    <dd class="font-mono font-semibold text-gray-100">{{ Math.floor(turbine.hoursSinceOverhaul).toLocaleString() }} h</dd>
                  </div>
                </dl>

                <!-- Vibration Sparkline -->
                <div class="mt-2 pt-2 border-t border-gray-800">
                  <p class="text-xs text-gray-500 mb-1">Vibration Trend</p>
                  <svg :viewBox="'0 0 200 40'" class="w-full h-7" preserveAspectRatio="none">
                    <polyline
                      :points="getSparklinePoints(turbine.vibrationHistory, 200, 40)"
                      fill="none"
                      :stroke="turbine.vibrationAlert ? '#f87171' : '#2dd4bf'"
                      stroke-width="1.5"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>

                <!-- Alert banner -->
                <div v-if="turbine.alert" class="mt-2 p-2 bg-yellow-900 bg-opacity-40 border border-yellow-700 rounded text-xs text-yellow-300 leading-snug">
                  ⚠ {{ turbine.alert }}
                </div>

                <!-- Mobile tap hint -->
                <div class="md:hidden mt-2 text-xs text-gray-600 text-right">Tap for details →</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- ── AI Assistant — Desktop sidebar ─────────────────────── -->
      <transition name="slide">
        <div v-if="assistantOpen"
          class="hidden md:flex w-[25%] min-w-[320px] max-w-[420px] border-l border-gray-700 bg-gray-900 flex-col">
          <div class="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
            <h2 class="text-sm font-semibold text-teal-300 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              AI Maintenance Assistant
              <span class="text-xs text-gray-500 font-normal">(RAG)</span>
            </h2>
            <button @click="assistantOpen = false" class="text-gray-500 hover:text-gray-300 cursor-pointer">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <!-- Shared chat body (desktop) -->
          <div ref="chatScrollRef" class="flex-1 overflow-y-auto p-4 space-y-3">
            <div v-if="messages.length === 0" class="h-full flex flex-col items-center justify-center text-center text-gray-500 gap-3 px-2">
              <svg class="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <p class="text-xs">Ask about gas turbine maintenance, fault diagnosis, or inspection procedures.</p>
              <div class="flex flex-col gap-1.5 w-full mt-2">
                <button v-for="sample in sampleQuestions" :key="sample"
                  @click="useQuestion(sample)"
                  class="px-3 py-1.5 text-xs bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:border-teal-600 hover:text-teal-300 transition-colors cursor-pointer text-left">
                  {{ sample }}
                </button>
              </div>
            </div>
            <template v-for="(msg, idx) in messages" :key="idx">
              <div v-if="msg.role === 'user'" class="flex justify-end">
                <div class="max-w-[85%] bg-teal-800 text-white rounded-2xl rounded-tr-sm px-3 py-2 text-xs shadow">
                  {{ msg.content }}
                </div>
              </div>
              <div v-else class="flex justify-start">
                <div class="max-w-[95%] space-y-2">
                  <div v-if="msg.context" class="bg-gray-800 border border-gray-600 rounded-xl p-3">
                    <p class="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Retrieved Context (RAG)
                    </p>
                    <p class="text-xs text-gray-400 leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto">{{ msg.context }}</p>
                  </div>
                  <div class="bg-gray-800 border border-teal-800 rounded-2xl rounded-tl-sm px-3 py-2 text-xs text-gray-100 shadow leading-relaxed">
                    {{ msg.content }}
                  </div>
                </div>
              </div>
            </template>
            <div v-if="loading" class="flex justify-start">
              <div class="bg-gray-800 border border-gray-600 rounded-2xl rounded-tl-sm px-4 py-2 flex items-center gap-2">
                <span class="flex gap-1">
                  <span class="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                  <span class="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                  <span class="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
                </span>
                <span class="text-xs text-gray-400">Querying…</span>
              </div>
            </div>
            <div v-if="error" class="bg-red-900 bg-opacity-40 border border-red-700 rounded-xl px-3 py-2 text-xs text-red-300 flex items-start gap-2">
              <svg class="w-3 h-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ error }}</span>
            </div>
          </div>
          <div class="border-t border-gray-700 p-3">
            <form @submit.prevent="sendMessage" class="flex gap-2">
              <input
                v-model="inputText"
                type="text"
                placeholder="Ask about maintenance…"
                :disabled="loading"
                class="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 disabled:opacity-50 transition-colors"
              />
              <button
                type="submit"
                :disabled="loading || !inputText.trim()"
                class="px-3 py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send
              </button>
            </form>
          </div>
        </div>
      </transition>

      <!-- ── AI Assistant — Mobile full-screen panel ─────────────── -->
      <div v-if="mobileView === 'chat'"
        class="md:hidden flex-1 flex flex-col bg-gray-900">
        <!-- Chat header on mobile -->
        <div class="px-4 py-3 border-b border-gray-700 flex items-center gap-3">
          <svg class="w-5 h-5 text-teal-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <div class="flex-1">
            <h2 class="text-sm font-semibold text-teal-300">AI Maintenance Assistant</h2>
            <p class="text-xs text-gray-500">RAG · OpenAI</p>
          </div>
          <span v-if="messages.length > 0" class="text-xs text-gray-500">{{ messages.length }} msgs</span>
        </div>

        <!-- Messages (mobile) -->
        <div ref="mobileChatScrollRef" class="flex-1 overflow-y-auto p-4 space-y-3">
          <div v-if="messages.length === 0" class="h-full flex flex-col items-center justify-center text-center text-gray-500 gap-3 px-2">
            <svg class="w-12 h-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p class="text-sm font-medium text-gray-400">AI Maintenance Assistant</p>
            <p class="text-xs text-gray-500 max-w-xs">Ask about gas turbine maintenance, fault diagnosis, or inspection procedures.</p>
            <div class="flex flex-col gap-2 w-full mt-3">
              <button v-for="sample in sampleQuestions" :key="sample"
                @click="useQuestion(sample)"
                class="px-4 py-2.5 text-xs bg-gray-800 border border-gray-700 rounded-xl text-gray-300 hover:border-teal-600 hover:text-teal-300 transition-colors cursor-pointer text-left leading-relaxed">
                {{ sample }}
              </button>
            </div>
          </div>

          <template v-for="(msg, idx) in messages" :key="idx">
            <div v-if="msg.role === 'user'" class="flex justify-end">
              <div class="max-w-[80%] bg-teal-800 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm shadow">
                {{ msg.content }}
              </div>
            </div>
            <div v-else class="flex justify-start">
              <div class="max-w-[90%] space-y-2">
                <div v-if="msg.context" class="bg-gray-800 border border-gray-600 rounded-xl p-3">
                  <p class="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Retrieved Context (RAG)
                  </p>
                  <p class="text-xs text-gray-400 leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">{{ msg.context }}</p>
                </div>
                <div class="bg-gray-800 border border-teal-800 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-gray-100 shadow leading-relaxed">
                  {{ msg.content }}
                </div>
              </div>
            </div>
          </template>

          <div v-if="loading" class="flex justify-start">
            <div class="bg-gray-800 border border-gray-600 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
              <span class="flex gap-1">
                <span class="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                <span class="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                <span class="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
              </span>
              <span class="text-sm text-gray-400">Querying AI…</span>
            </div>
          </div>

          <div v-if="error" class="bg-red-900 bg-opacity-40 border border-red-700 rounded-xl px-4 py-3 text-sm text-red-300 flex items-start gap-2">
            <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ error }}</span>
          </div>
        </div>

        <!-- Input (mobile) -->
        <div class="border-t border-gray-700 p-3 pb-safe">
          <form @submit.prevent="sendMessage" class="flex gap-2">
            <input
              v-model="inputText"
              type="text"
              placeholder="Ask about maintenance…"
              :disabled="loading"
              class="flex-1 bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 disabled:opacity-50 transition-colors"
            />
            <button
              type="submit"
              :disabled="loading || !inputText.trim()"
              class="px-4 py-3 bg-teal-600 hover:bg-teal-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>

    </div><!-- end main content -->

    <!-- ═══════════════════════════════════════════════════════════════
         MOBILE BOTTOM NAVIGATION BAR
    ═══════════════════════════════════════════════════════════════ -->
    <nav class="md:hidden shrink-0 bg-gray-900 border-t border-gray-700 flex items-stretch z-30 safe-area-inset-bottom">
      <!-- Fleet tab -->
      <button
        @click="clearTurbineSelection"
        class="relative flex-1 flex flex-col items-center justify-center py-2.5 gap-1 cursor-pointer transition-colors"
        :class="mobileView === 'fleet' ? 'text-teal-400' : 'text-gray-500 hover:text-gray-300'">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span class="text-[10px] font-semibold uppercase tracking-wider">Fleet</span>
        <!-- Alerts badge on fleet tab -->
        <span v-if="(criticalCount + warningCount) > 0 && mobileView !== 'fleet'"
          aria-label="`${criticalCount + warningCount} active alerts`"
          class="absolute top-1.5 right-1/4 translate-x-3 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
          {{ criticalCount + warningCount }}
        </span>
      </button>

      <!-- Detail tab — disabled when no turbine selected -->
      <button
        @click="mobileView = 'detail'"
        :disabled="!selectedTurbine"
        class="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 cursor-pointer transition-colors relative"
        :class="[
          mobileView === 'detail' && selectedTurbine ? 'text-teal-400' : '',
          !selectedTurbine ? 'text-gray-700 cursor-not-allowed' : 'text-gray-500 hover:text-gray-300'
        ]">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-[10px] font-semibold uppercase tracking-wider">Detail</span>
        <!-- Status dot when turbine selected -->
        <span v-if="selectedTurbine"
          :aria-label="`Turbine status: ${selectedTurbine.status}`"
          class="absolute top-1.5 right-1/4 translate-x-1 w-2 h-2 rounded-full"
          :class="selectedTurbine.status === 'Critical' ? 'bg-red-500' : selectedTurbine.status === 'Warning' ? 'bg-yellow-500' : 'bg-teal-500'">
        </span>
      </button>

      <!-- AI Chat tab -->
      <button
        @click="mobileView = 'chat'"
        class="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 cursor-pointer transition-colors relative"
        :class="mobileView === 'chat' ? 'text-teal-400' : 'text-gray-500 hover:text-gray-300'">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span class="text-[10px] font-semibold uppercase tracking-wider">AI Chat</span>
        <!-- Unread badge -->
        <span v-if="messages.length > 0"
          aria-label="AI chat has messages"
          class="absolute top-1.5 right-1/4 translate-x-1 w-2 h-2 bg-teal-400 rounded-full">
        </span>
      </button>
    </nav>

    <!-- ═══════════════════════════════════════════════════════════════
         FOOTER — Desktop only
    ═══════════════════════════════════════════════════════════════ -->
    <footer class="hidden md:block border-t border-gray-800 py-4 text-center text-xs text-gray-600 shrink-0">
      Siemens Energy · Gas Turbine AI Maintenance Assistant · PoC · Built with Vue.js + AWS Lambda + OpenAI ·
      <a href="https://www.angelorscoelho.dev" class="hover:text-teal-500 transition-colors">angelorscoelho.dev</a>
    </footer>

  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, onMounted, onUnmounted } from 'vue'

// ── Metric Parameters Definition ──────────────────────────────────────────────
const metricParams = [
  { key: 'exhaustTemp', label: 'Exhaust Temperature', unit: '°C', decimals: 1 },
  { key: 'shaftSpeed', label: 'Shaft Speed', unit: 'RPM', decimals: 1 },
  { key: 'vibration', label: 'Vibration', unit: 'mm/s', decimals: 3 },
  { key: 'powerOutput', label: 'Power Output', unit: 'MW', decimals: 2 },
  { key: 'fuelFlow', label: 'Fuel Flow', unit: 'kg/s', decimals: 3 },
  { key: 'hoursSinceOverhaul', label: 'Hours Since Overhaul', unit: 'h', decimals: 0 },
]

// ── Thresholds for alerts ─────────────────────────────────────────────────────
const thresholds = {
  exhaustTemp: { warning: 590, critical: 630 },
  vibration: { warning: 4.0, critical: 7.0 },
}

// ── Top 6 Gas Turbines for Energy Generation ──────────────────────────────────
function createTurbineData() {
  return [
    {
      id: 'SGT5-8000H / Unit GT-01',
      description: 'H-class heavy-duty gas turbine — 375 MW combined cycle flagship',
      location: 'Plant Alpha — Berlin, DE',
      status: 'Operational',
      exhaustTemp: 632.4,
      shaftSpeed: 3000.0,
      vibration: 1.245,
      hoursSinceOverhaul: 8420,
      fuelFlow: 14.832,
      powerOutput: 340.25,
      tempAlert: false,
      vibrationAlert: false,
      alert: null,
      vibrationHistory: generateInitialHistory(1.245, 0.15, 60),
      documentation: [
        { title: 'Last Inspection — 2025-12-10', content: 'Hot gas path inspection completed. All combustion liners within tolerance. Next scheduled: 2026-06-10.' },
        { title: 'Bearing Service Log', content: 'Bearing #1-#5 lubrication system checked. Oil quality nominal. Vibration baseline: 1.2 mm/s.' },
        { title: 'Combustion System', content: '16-can combustion system. DLE (Dry Low Emission) burners last replaced at 6,000 hrs. Next replacement at 12,000 hrs.' },
      ],
      aiSuggestion: '',
    },
    {
      id: 'SGT6-5000F / Unit GT-02',
      description: 'F-class heavy-duty gas turbine — 215 MW simple cycle workhorse',
      location: 'Plant Beta — Houston, TX',
      status: 'Warning',
      exhaustTemp: 608.7,
      shaftSpeed: 3600.0,
      vibration: 4.712,
      hoursSinceOverhaul: 23810,
      fuelFlow: 11.438,
      powerOutput: 198.45,
      tempAlert: true,
      vibrationAlert: true,
      alert: 'High vibration detected on bearing #3. Maintenance recommended within 48 h.',
      vibrationHistory: generateInitialHistory(4.712, 0.6, 60),
      documentation: [
        { title: 'Alert — Vibration Exceedance', content: 'Bearing #3 vibration exceeded 4.5 mm/s threshold at 2026-03-10 14:32 UTC. Trending upward over 72 hrs.' },
        { title: 'Maintenance History', content: 'Last major overhaul: 2024-01-15 at 18,000 hrs. Blade row 1 replacement completed. Compressor wash performed monthly.' },
        { title: 'Operational Notes', content: 'Unit operates in peaking duty cycle. Frequent start/stop cycles contribute to increased thermal fatigue on hot gas path components.' },
      ],
      aiSuggestion: 'Bearing #3 vibration is trending above 4.5 mm/s. Schedule vibration analysis and bearing inspection within 48 hours to prevent potential rotor imbalance damage.',
    },
    {
      id: 'SGT-800 / Unit GT-03',
      description: 'Industrial gas turbine — 53 MW high-efficiency mid-range unit',
      location: 'Plant Gamma — Riyadh, SA',
      status: 'Operational',
      exhaustTemp: 545.2,
      shaftSpeed: 6608.0,
      vibration: 0.892,
      hoursSinceOverhaul: 5200,
      fuelFlow: 3.654,
      powerOutput: 48.92,
      tempAlert: false,
      vibrationAlert: false,
      alert: null,
      vibrationHistory: generateInitialHistory(0.892, 0.08, 60),
      documentation: [
        { title: 'Commissioning Date', content: 'Unit commissioned 2025-06-20. Running on natural gas. Dual-fuel capability available.' },
        { title: 'Performance Log', content: 'Heat rate: 9,480 kJ/kWh. Efficiency: 38.0%. All parameters within design envelope.' },
        { title: 'Filter Status', content: 'Inlet air filtration system — Stage 1 & 2 filters replaced 2026-01-15. Differential pressure nominal.' },
      ],
      aiSuggestion: '',
    },
    {
      id: 'SGT-750 / Unit GT-04',
      description: 'Aeroderivative gas turbine — 37 MW fast-start peaker unit',
      location: 'Plant Delta — Rotterdam, NL',
      status: 'Operational',
      exhaustTemp: 468.3,
      shaftSpeed: 6100.0,
      vibration: 1.534,
      hoursSinceOverhaul: 15600,
      fuelFlow: 2.987,
      powerOutput: 35.18,
      tempAlert: false,
      vibrationAlert: false,
      alert: null,
      vibrationHistory: generateInitialHistory(1.534, 0.12, 60),
      documentation: [
        { title: 'Operational Profile', content: 'Peaking duty — averaging 4 starts/day. Total starts: 12,400. Hot section life limit: 25,000 equivalent operating hours.' },
        { title: 'Last Hot Section Inspection', content: '2025-09-01 at 12,000 hrs. Turbine blades within creep limits. Next HSI at 20,000 hrs.' },
        { title: 'Fuel System', content: 'Natural gas fuel. Fuel gas booster compressor serviced 2025-11-15. Fuel nozzles cleaned at last HSI.' },
      ],
      aiSuggestion: '',
    },
    {
      id: 'SGT-400 / Unit GT-05',
      description: 'Industrial gas turbine — 13 MW mechanical drive & power generation',
      location: 'Plant Epsilon — Lagos, NG',
      status: 'Warning',
      exhaustTemp: 594.8,
      shaftSpeed: 9500.0,
      vibration: 3.876,
      hoursSinceOverhaul: 28900,
      fuelFlow: 1.623,
      powerOutput: 12.14,
      tempAlert: true,
      vibrationAlert: false,
      alert: 'Exhaust temperature trending high. Combustion inspection advised within 7 days.',
      vibrationHistory: generateInitialHistory(3.876, 0.35, 60),
      documentation: [
        { title: 'Alert — Exhaust Temp Trend', content: 'Exhaust temperature has increased ~15°C over the last 30 days. Potential combustion liner degradation or fuel nozzle fouling.' },
        { title: 'Overhaul Status', content: 'Unit approaching 30,000 hr major overhaul interval. Last overhaul: 2023-05-20. Recommend scheduling during next planned outage.' },
        { title: 'Environmental', content: 'Operating in high-ambient (45°C) conditions. Inlet cooling system active. Dust ingestion filters on accelerated replacement schedule.' },
      ],
      aiSuggestion: 'Exhaust temperature trending 15°C above baseline over 30 days. Inspect combustion liners and fuel nozzles for fouling or degradation before the next load increase.',
    },
    {
      id: 'SGT-A65 / Unit GT-06',
      description: 'Aeroderivative gas turbine — 67 MW fast-response grid stabilization',
      location: 'Plant Zeta — Yokohama, JP',
      status: 'Critical',
      exhaustTemp: 651.3,
      shaftSpeed: 3600.0,
      vibration: 7.234,
      hoursSinceOverhaul: 31200,
      fuelFlow: 5.412,
      powerOutput: 58.67,
      tempAlert: true,
      vibrationAlert: true,
      alert: 'CRITICAL: Vibration exceeds 7.0 mm/s on bearing #2. Immediate shutdown recommended.',
      vibrationHistory: generateInitialHistory(7.234, 1.0, 60),
      documentation: [
        { title: 'CRITICAL ALERT — Vibration', content: 'Bearing #2 vibration spiked to 7.2 mm/s at 2026-03-11 08:15 UTC. Trip threshold: 8.0 mm/s. Immediate inspection required.' },
        { title: 'Overhaul Overdue', content: 'Unit at 31,200 hours — 1,200 hours past recommended major overhaul interval of 30,000 hours. Deferred due to grid demand constraints.' },
        { title: 'Previous Incidents', content: '2025-08-14: Compressor blade tip rub event. Repaired in-situ. 2025-11-02: Fuel nozzle #4 replaced due to carbon buildup.' },
      ],
      aiSuggestion: 'URGENT: Vibration at 7.2 mm/s on bearing #2 approaching trip threshold. Initiate controlled shutdown and perform emergency bearing inspection to prevent catastrophic rotor damage.',
    },
  ]
}

// ── Helper: Generate initial vibration history ────────────────────────────────
function generateInitialHistory(baseValue, volatility, count) {
  const history = []
  let val = baseValue
  for (let i = 0; i < count; i++) {
    val += (Math.random() - 0.5) * volatility * 0.3
    val = Math.max(0.1, val)
    history.push(val)
  }
  return history
}

// ── Reactive Turbine Data ─────────────────────────────────────────────────────
const turbines = reactive(createTurbineData())
const selectedTurbine = ref(null)
const assistantOpen = ref(true)
const alertBalloon = ref(null)
let updateInterval = null
const alertCooldown = {}

// ── Mobile Navigation State ───────────────────────────────────────────────────
const mobileView = ref('fleet') // 'fleet' | 'detail' | 'chat'

// ── Fleet Status Computed ─────────────────────────────────────────────────────
const criticalCount = computed(() => turbines.filter(t => t.status === 'Critical').length)
const warningCount = computed(() => turbines.filter(t => t.status === 'Warning').length)

// ── Random Walk Simulator (realistic continuity) ──────────────────────────────
function randomWalk(current, step, min, max) {
  const drift = (Math.random() - 0.5) * step
  let newVal = current + drift
  // Mean-reversion tendency
  const mid = (min + max) / 2
  newVal += (mid - current) * 0.001
  return Math.max(min, Math.min(max, newVal))
}

function updateTelemetry() {
  turbines.forEach((t) => {
    if (t.status === 'Offline') return

    // Random walk each parameter with realistic bounds
    t.exhaustTemp = randomWalk(t.exhaustTemp, 1.2, 420, 670)
    t.shaftSpeed = randomWalk(t.shaftSpeed, 5.0, 2800, 10200)
    t.vibration = randomWalk(t.vibration, 0.08, 0.3, 9.0)
    t.fuelFlow = randomWalk(t.fuelFlow, 0.02, 0.8, 16.0)
    t.powerOutput = randomWalk(t.powerOutput, 0.5, 8.0, 380.0)
    t.hoursSinceOverhaul += 0.000556 // ~2 seconds in hours

    // Update vibration history (keep last 60 readings)
    t.vibrationHistory.push(t.vibration)
    if (t.vibrationHistory.length > 60) {
      t.vibrationHistory.shift()
    }

    // Update alert states based on thresholds
    t.tempAlert = t.exhaustTemp > thresholds.exhaustTemp.warning
    t.vibrationAlert = t.vibration > thresholds.vibration.warning

    // Update status based on current readings
    const prevStatus = t.status
    if (t.vibration > thresholds.vibration.critical || t.exhaustTemp > thresholds.exhaustTemp.critical) {
      t.status = 'Critical'
    } else if (t.vibrationAlert || t.tempAlert) {
      t.status = 'Warning'
    } else {
      t.status = 'Operational'
    }

    // Generate dynamic alerts
    if (t.status === 'Critical') {
      const isVibrationCritical = t.vibration > thresholds.vibration.critical
      t.alert = isVibrationCritical
        ? `CRITICAL: Vibration at ${t.vibration.toFixed(1)} mm/s exceeds critical threshold. Immediate action required.`
        : `CRITICAL: Exhaust temp at ${t.exhaustTemp.toFixed(0)}°C exceeds critical threshold. Immediate action required.`
      t.aiSuggestion = isVibrationCritical
        ? `URGENT: Vibration at ${t.vibration.toFixed(1)} mm/s approaching trip threshold. Initiate controlled shutdown and perform emergency bearing inspection.`
        : `URGENT: Exhaust temperature at ${t.exhaustTemp.toFixed(0)}°C exceeds limits. Reduce load immediately and inspect combustion system.`
    } else if (t.status === 'Warning') {
      if (t.vibrationAlert && t.tempAlert) {
        t.alert = `High vibration (${t.vibration.toFixed(1)} mm/s) and elevated exhaust temp (${t.exhaustTemp.toFixed(0)}°C). Maintenance review recommended.`
      } else if (t.vibrationAlert) {
        t.alert = `Vibration at ${t.vibration.toFixed(1)} mm/s exceeds warning threshold. Monitor closely.`
      } else if (t.tempAlert) {
        t.alert = `Exhaust temp at ${t.exhaustTemp.toFixed(0)}°C above normal range. Combustion check advised.`
      }
      t.aiSuggestion = t.vibrationAlert
        ? `Vibration trending at ${t.vibration.toFixed(1)} mm/s. Schedule vibration analysis and bearing inspection within 48 hours.`
        : `Exhaust temperature elevated at ${t.exhaustTemp.toFixed(0)}°C. Inspect combustion liners and fuel nozzles.`
    } else {
      t.alert = null
      t.aiSuggestion = ''
    }

    // Trigger alert balloon for significant state changes
    if (t.status !== prevStatus && (t.status === 'Critical' || (t.status === 'Warning' && prevStatus === 'Operational'))) {
      const cooldownKey = t.id + t.status
      const now = Date.now()
      if (!alertCooldown[cooldownKey] || now - alertCooldown[cooldownKey] > 30000) {
        alertCooldown[cooldownKey] = now
        showAlertBalloon(t)
      }
    }
  })
}

function buildBalloonMessage(turbine) {
  const isCritical = turbine.status === 'Critical'
  if (isCritical) {
    const detail = turbine.vibration > thresholds.vibration.critical
      ? `vibration at ${turbine.vibration.toFixed(1)} mm/s`
      : `exhaust temp at ${turbine.exhaustTemp.toFixed(0)}°C`
    return `Immediate attention required: ${detail}. Click card for details.`
  }
  const detail = turbine.vibrationAlert
    ? `Vibration trending high at ${turbine.vibration.toFixed(1)} mm/s.`
    : `Exhaust temp elevated at ${turbine.exhaustTemp.toFixed(0)}°C.`
  return `${detail} Review recommended.`
}

function showAlertBalloon(turbine) {
  alertBalloon.value = {
    title: `${turbine.id} — ${turbine.status}`,
    message: buildBalloonMessage(turbine),
  }
  // Auto-dismiss after 8 seconds
  setTimeout(() => {
    alertBalloon.value = null
  }, 8000)
}

// ── Sparkline Generator ───────────────────────────────────────────────────────
function getSparklinePoints(history, width, height) {
  if (!history || history.length < 2) return ''
  const min = Math.min(...history)
  const max = Math.max(...history)
  const range = max - min || 1
  const stepX = width / (history.length - 1)

  return history.map((val, i) => {
    const x = i * stepX
    const y = height - ((val - min) / range) * (height * 0.85) - height * 0.075
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
}

// ── Formatting ────────────────────────────────────────────────────────────────
function formatValue(value, decimals) {
  if (typeof value !== 'number' || isNaN(value)) return '—'
  return value.toFixed(decimals)
}

function statusBorderClass(turbine) {
  if (turbine.status === 'Critical') return 'border-red-600'
  if (turbine.status === 'Warning') return 'border-yellow-600'
  return 'border-teal-700'
}

function statusBadgeClass(turbine) {
  if (turbine.status === 'Critical') return 'bg-red-900 text-red-300'
  if (turbine.status === 'Warning') return 'bg-yellow-900 text-yellow-300'
  return 'bg-teal-900 text-teal-300'
}

function getMetricColorClass(turbine, key) {
  if (key === 'exhaustTemp' && turbine.tempAlert) return 'text-yellow-400'
  if (key === 'vibration' && turbine.vibrationAlert) return 'text-red-400'
  return 'text-gray-100'
}

// ── Turbine Session ───────────────────────────────────────────────────────────
function openTurbineSession(turbine) {
  selectedTurbine.value = turbine
  mobileView.value = 'detail'
}

function clearTurbineSelection() {
  selectedTurbine.value = null
  mobileView.value = 'fleet'
}

function askAboutTurbine(turbine) {
  assistantOpen.value = true
  const query = `Analyze the current status of ${turbine.id}: vibration is ${turbine.vibration.toFixed(3)} mm/s, exhaust temperature is ${turbine.exhaustTemp.toFixed(1)}°C, and it has ${Math.floor(turbine.hoursSinceOverhaul).toLocaleString()} hours since last overhaul. What maintenance actions should be taken?`
  inputText.value = query
  nextTick(() => sendMessage())
}

function askAboutTurbineMobile(turbine) {
  mobileView.value = 'chat'
  assistantOpen.value = true
  const query = `Analyze the current status of ${turbine.id}: vibration is ${turbine.vibration.toFixed(3)} mm/s, exhaust temperature is ${turbine.exhaustTemp.toFixed(1)}°C, and it has ${Math.floor(turbine.hoursSinceOverhaul).toLocaleString()} hours since last overhaul. What maintenance actions should be taken?`
  inputText.value = query
  nextTick(() => sendMessage())
}

// ── Chat State ────────────────────────────────────────────────────────────────
const messages = ref([])
const inputText = ref('')
const loading = ref(false)
const error = ref('')
const chatScrollRef = ref(null)
const mobileChatScrollRef = ref(null)

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

function toggleAssistant() {
  assistantOpen.value = !assistantOpen.value
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
  if (mobileChatScrollRef.value) {
    mobileChatScrollRef.value.scrollTop = mobileChatScrollRef.value.scrollHeight
  }
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(() => {
  updateInterval = setInterval(updateTelemetry, 2000)
})

onUnmounted(() => {
  if (updateInterval) clearInterval(updateInterval)
})
</script>

<style scoped>
.balloon-enter-active,
.balloon-leave-active {
  transition: all 0.3s ease;
}
.balloon-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.balloon-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.animate-pulse-once {
  animation: pulse-once 2s ease-in-out;
}

@keyframes pulse-once {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}
</style>
