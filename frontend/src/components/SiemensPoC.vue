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
                <h3 class="text-base md:text-xl font-bold text-white mt-1 leading-tight">{{ selectedTurbine.name }} / Unit {{ selectedTurbine.id }}</h3>
                <p class="text-xs md:text-sm text-gray-400 mt-1 leading-snug">{{ selectedTurbine.type }} — {{ selectedTurbine.description }}</p>
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
            Fleet Overview Dashboard — Live Telemetry
            <span class="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span class="text-xs text-gray-500 font-normal">Updates every 2s · Anomaly injection every 15s</span>
          </h2>

          <!-- 3×2 Equipment Card Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-5">
            <EquipmentCard
              v-for="turbine in turbines"
              :key="turbine.id"
              :turbine="turbine"
              @select="openTurbineSession"
            />
          </div>

          <!-- ═══════════════════════════════════════════════════════════════
               ACTIVE DIAGNOSTICS PANEL — Proactive Contextual RAG
          ═══════════════════════════════════════════════════════════════ -->
          <div v-if="activeDiagnostics" class="mt-6 bg-gray-900 border border-amber-700 rounded-xl overflow-hidden shadow-lg">
            <div class="px-5 py-3 bg-amber-900/40 border-b border-amber-700 flex items-center justify-between">
              <h3 class="text-sm font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Active Diagnostics
              </h3>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 text-xs rounded-full font-semibold"
                  :class="activeDiagnostics.ragStatus === 'Live' ? 'bg-teal-900 text-teal-300' : 'bg-gray-700 text-gray-300'">
                  RAG {{ activeDiagnostics.ragStatus }}
                </span>
                <span class="text-xs text-gray-500">{{ activeDiagnostics.timestamp }}</span>
              </div>
            </div>
            <div class="p-5">
              <div class="mb-4">
                <p class="text-sm font-bold text-white">
                  Action Plan for {{ activeDiagnostics.name }} {{ activeDiagnostics.type }} #{{ activeDiagnostics.id }}
                </p>
                <p class="text-xs text-red-400 mt-1 font-medium">
                  {{ activeDiagnostics.failingMetric }} — Critical threshold exceeded
                </p>
              </div>

              <!-- RAG Response (if available from live API) -->
              <div v-if="activeDiagnostics.ragResponse" class="mb-4 bg-gray-800 border border-teal-800 rounded-lg p-3">
                <p class="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Live RAG Response
                </p>
                <p class="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">{{ activeDiagnostics.ragResponse }}</p>
              </div>

              <!-- Action Plan Steps -->
              <div class="space-y-2">
                <div v-for="(step, idx) in activeDiagnostics.actionPlan" :key="idx"
                  class="flex items-start gap-2 text-sm text-gray-300 bg-gray-800 rounded-lg px-3 py-2">
                  <span class="text-amber-500 font-mono font-bold text-xs mt-0.5">▸</span>
                  <span class="leading-snug">{{ step }}</span>
                </div>
              </div>

              <div class="mt-4 flex gap-2">
                <button
                  @click="askAboutTurbine(turbines.find(t => t.id === activeDiagnostics.id))"
                  class="px-4 py-2 text-xs bg-teal-700 hover:bg-teal-600 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Ask AI Assistant
                </button>
                <button
                  @click="activeDiagnostics = null"
                  class="px-4 py-2 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors cursor-pointer">
                  Dismiss
                </button>
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
              <div v-if="msg.role === 'system'" class="flex justify-center">
                <div class="bg-gray-800 border border-teal-700 rounded-lg px-3 py-1.5 text-xs text-teal-400 italic">
                  {{ msg.content }}
                </div>
              </div>
              <div v-else-if="msg.role === 'user'" class="flex justify-end">
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
            <div v-if="msg.role === 'system'" class="flex justify-center">
              <div class="bg-gray-800 border border-teal-700 rounded-lg px-3 py-1.5 text-xs text-teal-400 italic">
                {{ msg.content }}
              </div>
            </div>
            <div v-else-if="msg.role === 'user'" class="flex justify-end">
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
import { metricParams, thresholds, createFleetData, randomWalk, generateActionPlan } from '../fleetStore.js'
import EquipmentCard from './EquipmentCard.vue'

// ── Reactive Turbine Data ─────────────────────────────────────────────────────
const turbines = reactive(createFleetData())
const selectedTurbine = ref(null)
const assistantOpen = ref(true)
const alertBalloon = ref(null)
let updateInterval = null
let anomalyInterval = null
const alertCooldown = {}

// ── Mobile Navigation State ───────────────────────────────────────────────────
const mobileView = ref('fleet') // 'fleet' | 'detail' | 'chat'

// ── Active Diagnostics (Scaled RAG) ───────────────────────────────────────────
const activeDiagnostics = ref(null)

// ── Fleet Status Computed ─────────────────────────────────────────────────────
const criticalCount = computed(() => turbines.filter(t => t.status === 'Critical').length)
const warningCount = computed(() => turbines.filter(t => t.status === 'Warning').length)

// ── Telemetry Simulation for All Assets ───────────────────────────────────────
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

    // Trigger alert balloon and diagnostics for significant state changes
    if (t.status !== prevStatus && (t.status === 'Critical' || (t.status === 'Warning' && prevStatus === 'Operational'))) {
      const cooldownKey = t.id + t.status
      const now = Date.now()
      if (!alertCooldown[cooldownKey] || now - alertCooldown[cooldownKey] > 30000) {
        alertCooldown[cooldownKey] = now
        showAlertBalloon(t)
      }
      // Update Active Diagnostics panel on Critical transitions
      if (t.status === 'Critical') {
        updateDiagnostics(t)
      }
    }
  })
}

// ── Scheduled Anomaly Trigger — every 15 seconds ──────────────────────────────
function triggerRandomAnomaly() {
  const healthyAssets = turbines.filter(t => t.status === 'Operational')
  if (healthyAssets.length === 0) return
  const target = healthyAssets[Math.floor(Math.random() * healthyAssets.length)]
  // Inject a significant vibration spike to trigger Critical state
  target.vibration = thresholds.vibration.critical + 0.5 + Math.random() * 1.5
}

// ── Active Diagnostics Panel (Simulated RAG) ──────────────────────────────────
function updateDiagnostics(turbine) {
  const isVibrationCritical = turbine.vibration > thresholds.vibration.critical
  const failingMetric = isVibrationCritical
    ? `Vibration at ${turbine.vibration.toFixed(1)} mm/s`
    : `Exhaust temp at ${turbine.exhaustTemp.toFixed(0)}°C`

  activeDiagnostics.value = {
    id: turbine.id,
    name: turbine.name,
    type: turbine.type,
    failingMetric,
    timestamp: new Date().toLocaleTimeString(),
    actionPlan: generateActionPlan(turbine),
    ragStatus: 'Complete',
  }

  // Also attempt a real RAG call if API is configured
  performDiagnosticRAG(turbine)
}

async function performDiagnosticRAG(turbine) {
  if (!API_URL) return
  try {
    const query = `Emergency diagnostic for ${turbine.name} ${turbine.type} (Unit ${turbine.id}). Current vibration: ${turbine.vibration.toFixed(3)} mm/s. Exhaust temp: ${turbine.exhaustTemp.toFixed(1)}°C. Hours since overhaul: ${Math.floor(turbine.hoursSinceOverhaul)}. What is the recommended action plan?`
    const res = await fetch(`${API_URL}/ask-assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
    if (res.ok) {
      const data = await res.json()
      if (activeDiagnostics.value && activeDiagnostics.value.id === turbine.id) {
        activeDiagnostics.value.ragResponse = data.answer
        activeDiagnostics.value.ragStatus = 'Live'
      }
    }
  } catch {
    // Silently fall back to mock action plan
  }
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
    title: `${turbine.name} / Unit ${turbine.id} — ${turbine.status}`,
    message: buildBalloonMessage(turbine),
  }
  // Auto-dismiss after 8 seconds
  setTimeout(() => {
    alertBalloon.value = null
  }, 8000)
}

// ── Sparkline Generator (for detail view SVG fallback) ────────────────────────
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
  // Pre-load contextual system prompt
  messages.value.push({
    role: 'system',
    content: `Analyzing specific fault in Asset #${turbine.id} (${turbine.name} ${turbine.type})...`,
  })
  const query = `Analyze the current status of ${turbine.name} ${turbine.type} (Unit ${turbine.id}): vibration is ${turbine.vibration.toFixed(3)} mm/s, exhaust temperature is ${turbine.exhaustTemp.toFixed(1)}°C, and it has ${Math.floor(turbine.hoursSinceOverhaul).toLocaleString()} hours since last overhaul. What maintenance actions should be taken?`
  inputText.value = query
  nextTick(() => sendMessage())
}

function askAboutTurbineMobile(turbine) {
  mobileView.value = 'chat'
  assistantOpen.value = true
  // Pre-load contextual system prompt
  messages.value.push({
    role: 'system',
    content: `Analyzing specific fault in Asset #${turbine.id} (${turbine.name} ${turbine.type})...`,
  })
  const query = `Analyze the current status of ${turbine.name} ${turbine.type} (Unit ${turbine.id}): vibration is ${turbine.vibration.toFixed(3)} mm/s, exhaust temperature is ${turbine.exhaustTemp.toFixed(1)}°C, and it has ${Math.floor(turbine.hoursSinceOverhaul).toLocaleString()} hours since last overhaul. What maintenance actions should be taken?`
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
  anomalyInterval = setInterval(triggerRandomAnomaly, 15000)

  // Initialize diagnostics for any initially critical assets
  const initialCritical = turbines.find(t => t.status === 'Critical')
  if (initialCritical) {
    updateDiagnostics(initialCritical)
  }
})

onUnmounted(() => {
  if (updateInterval) clearInterval(updateInterval)
  if (anomalyInterval) clearInterval(anomalyInterval)
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
