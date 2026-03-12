<template>
  <div class="h-screen bg-gray-950 text-gray-100 font-sans flex flex-col overflow-hidden">

    <!-- ═══════════════════════════════════════════════════════════════
         HEADER — Compact
    ═══════════════════════════════════════════════════════════════ -->
    <header class="bg-gray-900 border-b border-teal-700 shadow-lg shrink-0 z-30">

      <!-- Desktop header — compact -->
      <div class="hidden md:flex max-w-full mx-auto px-4 py-2.5 items-center gap-3">
        <a href="https://www.angelorscoelho.dev"
           class="flex items-center gap-1 text-xs text-gray-400 hover:text-teal-400 transition-colors shrink-0"
           title="Back to portfolio">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          angelorscoelho.dev
        </a>
        <div class="flex items-center gap-2">
          <svg class="w-6 h-6 text-teal-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <div>
            <h1 class="text-base font-bold tracking-tight text-white leading-tight">
              Siemens Energy — AI Maintenance Dashboard
            </h1>
            <p class="text-xs text-teal-400 leading-tight">PoC · Distributed AI Factory · Industrial RAG</p>
          </div>
        </div>
        <div class="ml-auto flex items-center gap-2">
          <span class="px-2 py-0.5 text-xs bg-teal-900 text-teal-300 rounded-full border border-teal-700 font-semibold uppercase tracking-wider">
            v2.0
          </span>
          <button @click="toggleAssistant"
            class="px-2.5 py-1 text-xs bg-gray-800 border border-gray-600 rounded-lg text-gray-300 hover:border-teal-600 hover:text-teal-300 transition-colors cursor-pointer flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {{ assistantOpen ? 'Hide' : 'Show' }} Assistant
          </button>
        </div>
      </div>

      <!-- Mobile header -->
      <div class="md:hidden px-4 py-2.5 flex items-center gap-3">
        <svg class="w-6 h-6 text-teal-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <div class="flex-1 min-w-0">
          <h1 class="text-sm font-bold text-white leading-tight truncate">GT AI Maintenance</h1>
          <p class="text-xs text-teal-400 leading-tight">Siemens Energy · PoC v2.0</p>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <span v-if="criticalCount > 0"
            class="flex items-center gap-1 px-1.5 py-0.5 bg-red-900 text-red-300 text-xs rounded-full font-bold">
            <span class="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></span>
            {{ criticalCount }}
          </span>
          <span v-if="warningCount > 0"
            class="flex items-center gap-1 px-1.5 py-0.5 bg-yellow-900 text-yellow-300 text-xs rounded-full font-bold">
            <span class="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></span>
            {{ warningCount }}
          </span>
          <span v-if="criticalCount === 0 && warningCount === 0"
            class="flex items-center gap-1 px-1.5 py-0.5 bg-teal-900 text-teal-300 text-xs rounded-full font-bold">
            <span class="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse"></span>
            OK
          </span>
        </div>
      </div>
    </header>

    <!-- ═══════════════════════════════════════════════════════════════
         ALERT BALLOON — clickable, focuses the card
    ═══════════════════════════════════════════════════════════════ -->
    <transition name="balloon">
      <div v-if="alertBalloon"
        class="fixed top-[3.5rem] right-3 md:top-16 md:right-6 z-50 max-w-[calc(100vw-1.5rem)] md:max-w-sm">
        <div
          class="bg-red-900 border border-red-500 rounded-xl px-4 py-3 shadow-2xl flex items-start gap-3 cursor-pointer hover:bg-red-800 transition-colors animate-pulse-once"
          @click="focusAlertCard"
          :title="'Click to focus ' + (alertBalloon.turbineName || 'unit')"
        >
          <svg class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold text-red-300 truncate">{{ alertBalloon.title }}</p>
            <p class="text-xs text-red-400 mt-0.5 leading-relaxed">{{ alertBalloon.message }}</p>
            <p class="text-[10px] text-red-500 mt-1 italic">Click to focus card</p>
          </div>
          <button @click.stop="alertBalloon = null" class="text-red-500 hover:text-red-300 cursor-pointer shrink-0">
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

      <!-- ── Fleet / Detail panel ── -->
      <div
        class="flex-1 overflow-y-auto pb-2 md:pb-0"
        :class="[
          'px-4 py-4 md:px-6 md:py-6',
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
            <!-- Header row: Image | Name+Location | Manual | History | Status -->
            <div class="flex items-start gap-3 mb-4">
              <!-- Equipment Image -->
              <img
                :src="detailDisplayImageSrc"
                :alt="selectedTurbine.name"
                class="w-14 h-14 rounded-xl border-2 object-cover shrink-0 hidden md:block"
                :class="statusBorderClass(selectedTurbine)"
                @error="onDetailImageError"
              />
              <div class="flex-1 min-w-0">
                <p class="text-xs text-gray-400 uppercase tracking-widest font-medium">{{ selectedTurbine.location }}</p>
                <h3 class="text-base md:text-xl font-bold text-white mt-1 leading-tight">{{ selectedTurbine.name }} / Unit {{ selectedTurbine.id }}</h3>
                <p class="text-xs md:text-sm text-gray-400 mt-1 leading-snug">{{ selectedTurbine.type }} — {{ selectedTurbine.description }}</p>
              </div>
              <!-- Manual link icon -->
              <a
                v-if="selectedTurbine.manualUrl"
                :href="selectedTurbine.manualUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="shrink-0 mt-0.5 p-1.5 rounded-lg bg-gray-800 hover:bg-teal-900/60 text-gray-500 hover:text-teal-400 transition-colors"
                title="Equipment Manual"
                :aria-label="`Open the ${selectedTurbine.name} equipment manual`"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </a>
              <!-- Maintenance History icon -->
              <button
                @click="openHistoryModal(selectedTurbine)"
                class="shrink-0 mt-0.5 p-1.5 rounded-lg bg-gray-800 hover:bg-teal-900/60 text-gray-500 hover:text-teal-400 transition-colors"
                title="View Maintenance History"
                :aria-label="`View maintenance history for ${selectedTurbine.name}`"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <!-- Status Badge -->
              <span class="px-2.5 py-1 text-xs md:text-sm font-semibold rounded-full shrink-0 mt-0.5"
                :class="statusBadgeClass(selectedTurbine)">
                {{ selectedTurbine.status }}
              </span>
            </div>

            <!-- Detailed Metrics (clickable to change trend chart) -->
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
              <div v-for="param in metricParams" :key="param.key"
                @click="selectDetailMetric(param.key)"
                @keydown.enter.prevent="selectDetailMetric(param.key)"
                @keydown.space.prevent="selectDetailMetric(param.key)"
                tabindex="0"
                role="button"
                :aria-pressed="detailActiveMetricKey === param.key"
                :aria-label="`Show ${param.label} trend`"
                class="rounded-lg p-3 cursor-pointer transition-all"
                :class="[
                  detailActiveMetricKey === param.key
                    ? 'bg-gray-700 ring-2 ' + (selectedTurbine.status === 'NOK' ? 'ring-red-600' : selectedTurbine.status === 'RISK' ? 'ring-yellow-600' : 'ring-teal-600')
                    : 'bg-gray-800 hover:bg-gray-700/70'
                ]"
                :title="`Show ${param.label} trend`"
              >
                <p class="text-xs text-gray-400 mb-1 leading-tight flex items-center gap-1">
                  {{ param.label }}
                  <span v-if="detailActiveMetricKey === param.key" class="text-teal-400 text-[9px] font-bold uppercase tracking-wide">● shown</span>
                </p>
                <p class="text-base md:text-lg font-mono font-bold leading-tight"
                  :class="getMetricColorClass(selectedTurbine, param.key)">
                  {{ formatValue(selectedTurbine[param.key], param.decimals) }}
                  <span class="text-xs font-normal text-gray-400">{{ param.unit }}</span>
                </p>
                <div class="flex items-center justify-between mt-1.5 text-[10px] text-gray-500">
                  <span title="Minimum over last 60 readings">↓ {{ getParamMin(param) }}</span>
                  <span title="Maximum over last 60 readings">↑ {{ getParamMax(param) }}</span>
                </div>
              </div>
            </div>

            <!-- Dynamic Metric Sparkline (drill-in) -->
            <div class="bg-gray-800 rounded-lg p-3 mb-5">
              <div class="flex items-center justify-between mb-2">
                <p class="text-xs font-semibold uppercase tracking-wider" :style="{ color: detailSparklineColor }">
                  {{ detailActiveParam.label }} Trend
                  <span class="text-gray-500 font-normal normal-case tracking-normal ml-1">(last 60 readings)</span>
                </p>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] text-gray-600">
                    ↓{{ detailActiveParam && selectedTurbine.metricHistory?.[detailActiveMetricKey]?.length
                      ? Math.min(...(selectedTurbine.metricHistory[detailActiveMetricKey])).toFixed(detailActiveParam.decimals)
                      : '—' }}
                    · ↑{{ detailActiveParam && selectedTurbine.metricHistory?.[detailActiveMetricKey]?.length
                      ? Math.max(...(selectedTurbine.metricHistory[detailActiveMetricKey])).toFixed(detailActiveParam.decimals)
                      : '—' }}
                    {{ detailActiveParam.unit }}
                  </span>
                  <button v-if="detailMetricKey"
                    @click="detailMetricKey = null"
                    class="text-[10px] text-teal-400 hover:text-teal-300 cursor-pointer transition-colors">
                    Auto
                  </button>
                </div>
              </div>
              <div class="h-40 md:h-52 relative">
                <canvas ref="detailChartCanvas"></canvas>
              </div>
              <p class="text-[10px] text-gray-600 text-center mt-1">Click any metric above to change chart ↑</p>
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
            <div v-if="selectedTurbine.status !== 'OK'" class="mt-4 bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded-xl p-4">
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
              {{ criticalCount }} NOK
            </div>
            <div v-if="warningCount > 0" class="flex-none flex items-center gap-1.5 bg-yellow-900/60 border border-yellow-700 rounded-lg px-3 py-2 text-xs text-yellow-300 font-semibold">
              <span class="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
              {{ warningCount }} RISK
            </div>
            <div class="flex-none flex items-center gap-1.5 bg-teal-900/40 border border-teal-800 rounded-lg px-3 py-2 text-xs text-teal-300 font-semibold">
              <span class="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
              Live · 2s
            </div>
          </div>

          <!-- Desktop fleet header with status filter chips -->
          <div class="hidden md:flex text-lg font-semibold text-teal-300 mb-4 items-center gap-2 flex-wrap">
            <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Fleet Overview
            <span class="ml-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span class="text-xs text-gray-500 font-normal">{{ filteredTurbines.length }}/{{ turbines.length }} units · live 2s</span>

            <!-- Status Filter Chips -->
            <div class="ml-auto flex items-center gap-2">
              <span class="text-xs text-gray-500 font-normal">Filter:</span>
              <button
                @click="toggleFilter('OK')"
                class="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full border transition-all cursor-pointer"
                :class="statusFilters.OK
                  ? 'bg-teal-900 text-teal-300 border-teal-600'
                  : 'bg-gray-800 text-gray-500 border-gray-700 hover:border-teal-700 hover:text-teal-400'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="statusFilters.OK ? 'bg-teal-400' : 'bg-gray-600'"></span>
                OK
              </button>
              <button
                @click="toggleFilter('RISK')"
                class="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full border transition-all cursor-pointer"
                :class="statusFilters.RISK
                  ? 'bg-yellow-900 text-yellow-300 border-yellow-600'
                  : 'bg-gray-800 text-gray-500 border-gray-700 hover:border-yellow-700 hover:text-yellow-400'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="statusFilters.RISK ? 'bg-yellow-400 animate-pulse' : 'bg-gray-600'"></span>
                RISK
              </button>
              <button
                @click="toggleFilter('NOK')"
                class="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full border transition-all cursor-pointer"
                :class="statusFilters.NOK
                  ? 'bg-red-900 text-red-300 border-red-600'
                  : 'bg-gray-800 text-gray-500 border-gray-700 hover:border-red-700 hover:text-red-400'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="statusFilters.NOK ? 'bg-red-400 animate-pulse' : 'bg-gray-600'"></span>
                NOK
              </button>
            </div>
          </div>

          <!-- Equipment Card Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
            <EquipmentCard
              v-for="turbine in filteredTurbines"
              :key="turbine.id"
              :turbine="turbine"
              :focused="focusedCardId === turbine.id"
              @select="openTurbineSession"
              @show-history="openHistoryModal"
            />
          </div>

          <!-- Empty state when filter shows nothing -->
          <div v-if="filteredTurbines.length === 0" class="text-center text-gray-500 py-16">
            <svg class="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p class="text-sm">No units match the selected filters.</p>
            <button @click="clearFilters" class="mt-2 text-xs text-teal-400 hover:underline cursor-pointer">Clear filters</button>
          </div>

          <!-- ═══════════════════════════════════════════════════════════════
               ACTIVE DIAGNOSTICS PANEL
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

      <!-- ── AI Assistant — Desktop sidebar ── -->
      <transition name="slide">
        <div v-if="assistantOpen"
          class="hidden md:flex w-[25%] min-w-[300px] max-w-[400px] border-l border-gray-700 bg-gray-900 flex-col">
          <div class="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
            <h2 class="text-sm font-semibold text-teal-300 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              AI Maintenance Assistant
              <span class="text-xs text-gray-500 font-normal">(Gemini RAG)</span>
            </h2>
            <button @click="assistantOpen = false" class="text-gray-500 hover:text-gray-300 cursor-pointer">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
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
                <div class="max-w-[95%] space-y-1">
                  <div class="bg-gray-800 border border-teal-800 rounded-2xl rounded-tl-sm px-3 py-2 text-xs text-gray-100 shadow leading-relaxed">
                    {{ msg.content }}
                  </div>
                  <!-- RAG source chips — shown when context was retrieved -->
                  <div v-if="msg.context" class="flex flex-wrap gap-1.5 px-1">
                    <span class="flex items-center gap-1 px-2 py-0.5 bg-gray-800 border border-gray-700 rounded-full text-[10px] text-gray-400" title="Retrieved from equipment manual via RAG">
                      <svg class="w-3 h-3 text-teal-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Equipment Manual
                    </span>
                    <span class="flex items-center gap-1 px-2 py-0.5 bg-gray-800 border border-gray-700 rounded-full text-[10px] text-gray-400" title="Retrieved from maintenance history via RAG">
                      <svg class="w-3 h-3 text-teal-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Maintenance History
                    </span>
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

      <!-- ── AI Assistant — Mobile full-screen panel ── -->
      <div v-if="mobileView === 'chat'"
        class="md:hidden flex-1 flex flex-col bg-gray-900">
        <div class="px-4 py-3 border-b border-gray-700 flex items-center gap-3">
          <svg class="w-5 h-5 text-teal-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <div class="flex-1">
            <h2 class="text-sm font-semibold text-teal-300">AI Maintenance Assistant</h2>
            <p class="text-xs text-gray-500">Gemini RAG</p>
          </div>
          <span v-if="messages.length > 0" class="text-xs text-gray-500">{{ messages.length }} msgs</span>
        </div>

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
              <div class="max-w-[90%] space-y-1">
                <div class="bg-gray-800 border border-teal-800 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-gray-100 shadow leading-relaxed">
                  {{ msg.content }}
                </div>
                <!-- RAG source chips — shown when context was retrieved -->
                <div v-if="msg.context" class="flex flex-wrap gap-1.5 px-1">
                  <span class="flex items-center gap-1 px-2 py-0.5 bg-gray-800 border border-gray-700 rounded-full text-[10px] text-gray-400" title="Retrieved from equipment manual via RAG">
                    <svg class="w-3 h-3 text-teal-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Equipment Manual
                  </span>
                  <span class="flex items-center gap-1 px-2 py-0.5 bg-gray-800 border border-gray-700 rounded-full text-[10px] text-gray-400" title="Retrieved from maintenance history via RAG">
                    <svg class="w-3 h-3 text-teal-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Maintenance History
                  </span>
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
      <button
        @click="clearTurbineSelection"
        class="relative flex-1 flex flex-col items-center justify-center py-2.5 gap-1 cursor-pointer transition-colors"
        :class="mobileView === 'fleet' ? 'text-teal-400' : 'text-gray-500 hover:text-gray-300'">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span class="text-[10px] font-semibold uppercase tracking-wider">Fleet</span>
        <span v-if="(criticalCount + warningCount) > 0 && mobileView !== 'fleet'"
          class="absolute top-1.5 right-1/4 translate-x-3 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
          {{ criticalCount + warningCount }}
        </span>
      </button>

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
        <span v-if="selectedTurbine"
          class="absolute top-1.5 right-1/4 translate-x-1 w-2 h-2 rounded-full"
          :class="selectedTurbine.status === 'NOK' ? 'bg-red-500' : selectedTurbine.status === 'RISK' ? 'bg-yellow-500' : 'bg-teal-500'">
        </span>
      </button>

      <button
        @click="mobileView = 'chat'"
        class="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 cursor-pointer transition-colors relative"
        :class="mobileView === 'chat' ? 'text-teal-400' : 'text-gray-500 hover:text-gray-300'">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span class="text-[10px] font-semibold uppercase tracking-wider">AI Chat</span>
        <span v-if="messages.length > 0"
          class="absolute top-1.5 right-1/4 translate-x-1 w-2 h-2 bg-teal-400 rounded-full">
        </span>
      </button>
    </nav>

    <!-- FOOTER -->
    <footer class="hidden md:block border-t border-gray-800 py-3 text-center text-xs text-gray-600 shrink-0">
      Siemens Energy · Gas Turbine AI Maintenance Assistant · PoC · Vue.js + AWS Lambda + Google Gemini ·
      <a href="https://www.angelorscoelho.dev" class="hover:text-teal-500 transition-colors">angelorscoelho.dev</a>
    </footer>

    <!-- ═══════════════════════════════════════════════════════════════
         MAINTENANCE HISTORY MODAL
         Scoped to the left content panel — never covers the AI assistant.
    ═══════════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <transition name="history-slide">
        <div v-if="historyModalTurbine"
          class="fixed z-40 bg-gray-950 border-r border-gray-800 flex flex-col overflow-hidden shadow-2xl"
          :style="historyModalStyle"
        >
          <!-- Modal Header -->
          <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-700 bg-gray-900 shrink-0">
            <svg class="w-5 h-5 text-teal-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="flex-1 min-w-0">
              <h2 class="text-sm font-bold text-white truncate">
                Maintenance History — {{ historyModalTurbine.name }} / Unit {{ historyModalTurbine.id }}
              </h2>
              <p class="text-xs text-gray-400 truncate">{{ historyModalTurbine.location }}</p>
            </div>
            <span class="px-2 py-0.5 text-xs font-bold rounded-full shrink-0"
              :class="statusBadgeClass(historyModalTurbine)">
              {{ historyModalTurbine.status }}
            </span>
            <button
              @click="closeHistoryModal"
              class="text-gray-500 hover:text-gray-200 transition-colors cursor-pointer shrink-0 p-1"
              aria-label="Close maintenance history"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Loading state -->
          <div v-if="historyModalLoading" class="flex-1 flex items-center justify-center">
            <div class="flex flex-col items-center gap-3 text-gray-500">
              <span class="flex gap-1.5">
                <span class="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                <span class="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                <span class="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
              </span>
              <p class="text-xs">Loading maintenance history…</p>
            </div>
          </div>

          <!-- Empty state -->
          <div v-else-if="historyModalData.length === 0" class="flex-1 flex items-center justify-center text-gray-500 text-sm px-8 text-center">
            <div>
              <svg class="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p>No maintenance history available for this unit.</p>
            </div>
          </div>

          <!-- Timeline -->
          <div v-else class="flex-1 overflow-y-auto px-4 py-4 space-y-0">
            <div v-for="(record, idx) in historyModalData" :key="record.orderNumber || idx"
              class="relative flex gap-4 pb-6 last:pb-0">

              <!-- Timeline vertical line -->
              <div class="flex flex-col items-center shrink-0" style="width: 2.5rem;">
                <!-- Dot -->
                <div class="w-3 h-3 rounded-full mt-1 shrink-0 ring-2 ring-gray-950 z-10"
                  :class="record.result === 'COMPLETED' ? 'bg-teal-400' : record.result === 'COMPLETED_WITH_FINDINGS' ? 'bg-yellow-400' : 'bg-red-400'">
                </div>
                <!-- Line below (not for last) -->
                <div v-if="idx < historyModalData.length - 1" class="w-px flex-1 bg-gray-700 mt-1"></div>
              </div>

              <!-- Timestamp label (left of content) -->
              <div class="shrink-0 text-right" style="width: 7rem;">
                <p class="text-[10px] text-gray-500 font-mono leading-tight">
                  {{ record.timestamp ? record.timestamp.slice(0, 10) : '' }}
                </p>
                <p class="text-[10px] text-gray-600 font-mono leading-tight">
                  {{ record.timestamp ? record.timestamp.slice(11, 16) : '' }} UTC
                </p>
                <p v-if="record.hoursAtService !== undefined" class="text-[10px] text-gray-600 mt-0.5 leading-tight">
                  {{ record.hoursAtService?.toLocaleString() }} h
                </p>
              </div>

              <!-- Content card -->
              <div class="flex-1 min-w-0 bg-gray-900 border rounded-xl p-3 relative"
                :class="record.result === 'COMPLETED' ? 'border-gray-700' : record.result === 'COMPLETED_WITH_FINDINGS' ? 'border-yellow-800' : 'border-red-800'">

                <!-- Top row: type + result badge + Investigate button -->
                <div class="flex items-start justify-between gap-2 mb-2">
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-bold text-white leading-snug">{{ record.type }}</p>
                    <p class="text-[10px] text-gray-500 mt-0.5">{{ record.orderNumber }}</p>
                  </div>
                  <div class="flex items-center gap-1.5 shrink-0">
                    <span class="px-1.5 py-0.5 text-[10px] font-bold rounded-full whitespace-nowrap"
                      :class="record.result === 'COMPLETED' ? 'bg-teal-900 text-teal-300' : record.result === 'COMPLETED_WITH_FINDINGS' ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'">
                      {{ record.result === 'COMPLETED_WITH_FINDINGS' ? 'FINDINGS' : record.result }}
                    </span>
                    <!-- Investigate with Assistant button -->
                    <button
                      @click="investigateWithAssistant(historyModalTurbine, record)"
                      class="px-2 py-0.5 text-[10px] font-semibold bg-teal-800 hover:bg-teal-700 text-teal-200 rounded-md transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1"
                      title="Investigate this maintenance record with the AI assistant"
                    >
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Investigate
                    </button>
                  </div>
                </div>

                <!-- Technician -->
                <p class="text-[10px] text-gray-500 mb-1.5">
                  <span class="text-gray-600">Technician:</span> {{ record.technician }}
                  <span class="ml-2 text-gray-600">Duration:</span> {{ record.durationHours }}h
                </p>

                <!-- Description -->
                <p class="text-xs text-gray-300 leading-relaxed mb-1.5">{{ record.description }}</p>

                <!-- Findings (if different from description) -->
                <div v-if="record.findings" class="bg-gray-800 rounded-lg px-2.5 py-1.5 mb-1.5">
                  <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Findings</p>
                  <p class="text-xs text-gray-300 leading-relaxed">{{ record.findings }}</p>
                </div>

                <!-- Parts replaced -->
                <div v-if="record.partsReplaced && record.partsReplaced.length" class="flex flex-wrap gap-1 mt-1.5">
                  <span class="text-[10px] text-gray-500 self-center">Parts:</span>
                  <span v-for="part in record.partsReplaced" :key="part"
                    class="px-1.5 py-0.5 text-[10px] bg-gray-800 text-gray-400 rounded-md">
                    {{ part }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="shrink-0 border-t border-gray-700 px-4 py-2 bg-gray-900 flex items-center justify-between">
            <p class="text-[10px] text-gray-600">
              {{ historyModalData.length }} maintenance record{{ historyModalData.length !== 1 ? 's' : '' }} · {{ historyModalTurbine.name }}
            </p>
            <button
              @click="closeHistoryModal"
              class="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  Chart,
  LineController, LineElement, PointElement,
  LinearScale, CategoryScale, Filler, Tooltip,
} from 'chart.js'
import {
  metricParams, thresholds, createFleetData, randomWalk,
  generateActionPlan, historyMetricKeys, getMostCriticalMetricKey, getMaintenanceHistory,
} from '../fleetStore.js'
import EquipmentCard from './EquipmentCard.vue'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip)

// ── Reactive Turbine Data ─────────────────────────────────────────────────────
const turbines = reactive(createFleetData())
const selectedTurbine = ref(null)
const assistantOpen = ref(true)
const alertBalloon = ref(null)
const focusedCardId = ref(null)
let updateInterval = null
let anomalyInterval = null

// ── Maintenance History Modal ─────────────────────────────────────────────────
const historyModalTurbine = ref(null)
const historyModalLoading = ref(false)
const historyModalData = ref([])
const alertCooldown = {}

// ── Mobile Navigation State ───────────────────────────────────────────────────
const mobileView = ref('fleet')

// ── Active Diagnostics (Simulated RAG) ───────────────────────────────────────
const activeDiagnostics = ref(null)

// ── Status Filters ────────────────────────────────────────────────────────────
const statusFilters = reactive({ OK: false, RISK: false, NOK: false })
const anyFilterActive = computed(() => statusFilters.OK || statusFilters.RISK || statusFilters.NOK)
const filteredTurbines = computed(() => {
  if (!anyFilterActive.value) return turbines
  return turbines.filter(t => statusFilters[t.status])
})

function toggleFilter(status) {
  statusFilters[status] = !statusFilters[status]
}

function clearFilters() {
  statusFilters.OK = false
  statusFilters.RISK = false
  statusFilters.NOK = false
}

// ── Detail view image fallback ───────────────────────────────────────────────
const detailImageHasError = ref(false)
watch(selectedTurbine, (newVal) => { if (newVal) detailImageHasError.value = false })
const detailDisplayImageSrc = computed(() => {
  const t = selectedTurbine.value
  if (!t) return ''
  if (detailImageHasError.value) {
    const color = t.status === 'NOK' ? '#f87171' : t.status === 'RISK' ? '#fbbf24' : '#2dd4bf'
    return `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="#1e293b" width="200" height="200"/><text fill="${color}" font-family="monospace" font-size="16" text-anchor="middle" x="100" y="105">${t.name}</text></svg>`
    )}`
  }
  return t.imageUrl
})
function onDetailImageError() {
  detailImageHasError.value = true
}

// ── Fleet Status Computed ─────────────────────────────────────────────────────
const criticalCount = computed(() => turbines.filter(t => t.status === 'NOK').length)
const warningCount = computed(() => turbines.filter(t => t.status === 'RISK').length)

// ── Detail View Metric Drill-In ───────────────────────────────────────────────
const detailMetricKey = ref(null)

const detailActiveMetricKey = computed(() => {
  if (detailMetricKey.value) return detailMetricKey.value
  return selectedTurbine.value ? getMostCriticalMetricKey(selectedTurbine.value) : 'exhaustTemp'
})

const detailActiveParam = computed(() => {
  return metricParams.find(p => p.key === detailActiveMetricKey.value) || metricParams[0]
})

const detailSparklineColor = computed(() => {
  if (!selectedTurbine.value) return '#2dd4bf'
  if (selectedTurbine.value.status === 'NOK') return '#f87171'
  const key = detailActiveMetricKey.value
  if (key === 'vibration' && selectedTurbine.value.vibrationAlert) return '#fbbf24'
  if (key === 'exhaustTemp' && selectedTurbine.value.tempAlert) return '#fbbf24'
  return '#2dd4bf'
})

function selectDetailMetric(key) {
  detailMetricKey.value = (detailMetricKey.value === key) ? null : key
}

// Reset detail metric selection when switching turbines and manage chart
watch(selectedTurbine, async (newVal) => {
  detailMetricKey.value = null
  destroyDetailChart()
  if (newVal) {
    await nextTick()
    createDetailChart()
  }
})

// ── Maintenance History Modal Style ───────────────────────────────────────────
// Positions the modal within the left content panel so it never overlaps
// the right-side AI assistant sidebar.
const historyModalStyle = computed(() => ({
  top: '0',
  bottom: '0',
  left: '0',
  // When the AI assistant is open on desktop it takes clamp(300px, 25%, 400px)
  right: assistantOpen.value ? 'clamp(300px, 25%, 400px)' : '0',
}))

// ── Telemetry Simulation ──────────────────────────────────────────────────────
function updateTelemetry() {
  turbines.forEach((t) => {
    if (t.status === 'Offline') return

    t.exhaustTemp = randomWalk(t.exhaustTemp, 1.2, 420, 670)
    // Each turbine has different shaft speed range; use a wide but realistic bound
    t.shaftSpeed = randomWalk(t.shaftSpeed, 5.0, 2800, 20000)
    t.vibration = randomWalk(t.vibration, 0.08, 0.3, 9.0)
    t.fuelFlow = randomWalk(t.fuelFlow, 0.02, 0.05, 16.0)
    t.powerOutput = randomWalk(t.powerOutput, 0.5, 1.0, 1500.0)
    t.hoursSinceOverhaul += 0.000556

    // Update all metric histories
    historyMetricKeys.forEach(key => {
      if (!t.metricHistory) t.metricHistory = {}
      if (!t.metricHistory[key]) t.metricHistory[key] = []
      t.metricHistory[key].push(t[key])
      if (t.metricHistory[key].length > 60) t.metricHistory[key].shift()
    })

    t.tempAlert = t.exhaustTemp > thresholds.exhaustTemp.warning
    t.vibrationAlert = t.vibration > thresholds.vibration.warning

    const prevStatus = t.status
    if (t.vibration > thresholds.vibration.critical || t.exhaustTemp > thresholds.exhaustTemp.critical) {
      t.status = 'NOK'
    } else if (t.vibrationAlert || t.tempAlert) {
      t.status = 'RISK'
    } else {
      t.status = 'OK'
    }

    // Generate dynamic alerts
    if (t.status === 'NOK') {
      const isVibrationCritical = t.vibration > thresholds.vibration.critical
      t.alert = isVibrationCritical
        ? `CRITICAL: Vibration at ${t.vibration.toFixed(1)} mm/s exceeds critical threshold. Immediate action required.`
        : `CRITICAL: Exhaust temp at ${t.exhaustTemp.toFixed(0)}°C exceeds critical threshold. Immediate action required.`
      t.aiSuggestion = isVibrationCritical
        ? `URGENT: Vibration at ${t.vibration.toFixed(1)} mm/s approaching trip threshold. Initiate controlled shutdown and perform emergency bearing inspection.`
        : `URGENT: Exhaust temperature at ${t.exhaustTemp.toFixed(0)}°C exceeds limits. Reduce load immediately and inspect combustion system.`
    } else if (t.status === 'RISK') {
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

    // Trigger alert balloon on status escalation
    if (t.status !== prevStatus && (t.status === 'NOK' || (t.status === 'RISK' && prevStatus === 'OK'))) {
      const cooldownKey = t.id + t.status
      const now = Date.now()
      if (!alertCooldown[cooldownKey] || now - alertCooldown[cooldownKey] > 30000) {
        alertCooldown[cooldownKey] = now
        showAlertBalloon(t)
      }
      if (t.status === 'NOK') {
        updateDiagnostics(t)
      }
    }
  })

  // Enforce max 30% NOK and 30% RISK to keep dashboard realistic
  enforceStatusDistribution()
}

// ── Status Distribution Cap (max 30% NOK, max 30% RISK) ──────────────────────
function enforceStatusDistribution() {
  const total = turbines.length
  const maxNOK = Math.floor(total * 0.3)
  const maxRISK = Math.floor(total * 0.3)

  // Get NOK turbines sorted by how far above critical threshold they are (least critical first)
  const nokTurbines = turbines
    .filter(t => t.status === 'NOK')
    .sort((a, b) => {
      const critA = Math.max(
        (a.vibration - thresholds.vibration.critical) / thresholds.vibration.critical,
        (a.exhaustTemp - thresholds.exhaustTemp.critical) / thresholds.exhaustTemp.critical,
      )
      const critB = Math.max(
        (b.vibration - thresholds.vibration.critical) / thresholds.vibration.critical,
        (b.exhaustTemp - thresholds.exhaustTemp.critical) / thresholds.exhaustTemp.critical,
      )
      return critA - critB
    })

  // Downgrade excess NOK to RISK
  if (nokTurbines.length > maxNOK) {
    nokTurbines.slice(0, nokTurbines.length - maxNOK).forEach(t => {
      t.status = 'RISK'
      // Clamp values just below the critical threshold so they stay RISK
      if (t.vibration > thresholds.vibration.critical) {
        t.vibration = thresholds.vibration.critical - 0.1 - Math.random() * 0.2
      }
      if (t.exhaustTemp > thresholds.exhaustTemp.critical) {
        t.exhaustTemp = thresholds.exhaustTemp.critical - 1 - Math.random() * 2
      }
    })
  }

  // Get RISK turbines sorted by criticality (least critical first)
  const riskTurbines = turbines
    .filter(t => t.status === 'RISK')
    .sort((a, b) => {
      const critA = Math.max(
        (a.vibration - thresholds.vibration.warning) / thresholds.vibration.warning,
        (a.exhaustTemp - thresholds.exhaustTemp.warning) / thresholds.exhaustTemp.warning,
      )
      const critB = Math.max(
        (b.vibration - thresholds.vibration.warning) / thresholds.vibration.warning,
        (b.exhaustTemp - thresholds.exhaustTemp.warning) / thresholds.exhaustTemp.warning,
      )
      return critA - critB
    })

  // Downgrade excess RISK to OK
  if (riskTurbines.length > maxRISK) {
    riskTurbines.slice(0, riskTurbines.length - maxRISK).forEach(t => {
      t.status = 'OK'
      t.tempAlert = false
      t.vibrationAlert = false
      t.alert = null
      t.aiSuggestion = ''
      // Clamp values below warning thresholds
      if (t.vibration > thresholds.vibration.warning) {
        t.vibration = thresholds.vibration.warning - 0.1 - Math.random() * 0.3
      }
      if (t.exhaustTemp > thresholds.exhaustTemp.warning) {
        t.exhaustTemp = thresholds.exhaustTemp.warning - 1 - Math.random() * 5
      }
    })
  }
}

// ── Anomaly Trigger ────────────────────────────────────────────────────────────
function triggerRandomAnomaly() {
  const total = turbines.length
  const maxNOK = Math.floor(total * 0.3)
  const currentNOK = turbines.filter(t => t.status === 'NOK').length
  if (currentNOK >= maxNOK) return

  const healthyAssets = turbines.filter(t => t.status === 'OK')
  if (healthyAssets.length === 0) return
  const target = healthyAssets[Math.floor(Math.random() * healthyAssets.length)]
  target.vibration = thresholds.vibration.critical + 0.5 + Math.random() * 1.5
}

// ── Active Diagnostics ────────────────────────────────────────────────────────
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

// ── Alert Balloon ─────────────────────────────────────────────────────────────
function buildBalloonMessage(turbine) {
  const isCritical = turbine.status === 'NOK'
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
    turbineId: turbine.id,
    turbineName: `${turbine.name} / Unit ${turbine.id}`,
    title: `${turbine.name} / Unit ${turbine.id} — ${turbine.status}`,
    message: buildBalloonMessage(turbine),
  }
  setTimeout(() => {
    alertBalloon.value = null
  }, 8000)
}

function focusAlertCard() {
  if (!alertBalloon.value?.turbineId) return
  const turbineId = alertBalloon.value.turbineId
  alertBalloon.value = null

  // Clear any previous focus, then set the new one
  focusedCardId.value = null
  nextTick(() => {
    focusedCardId.value = turbineId
    // Reset after animation
    setTimeout(() => {
      focusedCardId.value = null
    }, 4000)
  })

  // If we're in detail view, go back to fleet first
  if (selectedTurbine.value) {
    clearTurbineSelection()
  }
}

// ── Sparkline SVG ─────────────────────────────────────────────────────────────
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
  if (turbine.status === 'NOK') return 'border-red-600'
  if (turbine.status === 'RISK') return 'border-yellow-600'
  return 'border-teal-700'
}

function statusBadgeClass(turbine) {
  if (turbine.status === 'NOK') return 'bg-red-900 text-red-300'
  if (turbine.status === 'RISK') return 'bg-yellow-900 text-yellow-300'
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
  messages.value.push({
    role: 'system',
    content: `Analyzing specific fault in Asset #${turbine.id} (${turbine.name} ${turbine.type})...`,
  })
  const query = `Analyze the current status of ${turbine.name} ${turbine.type} (Unit ${turbine.id}): vibration is ${turbine.vibration.toFixed(3)} mm/s, exhaust temperature is ${turbine.exhaustTemp.toFixed(1)}°C, and it has ${Math.floor(turbine.hoursSinceOverhaul).toLocaleString()} hours since last overhaul. What maintenance actions should be taken?`
  inputText.value = query
  nextTick(() => sendMessage())
}

// ── Maintenance History Modal ─────────────────────────────────────────────────
async function openHistoryModal(turbine) {
  historyModalTurbine.value = turbine
  historyModalData.value = []
  historyModalLoading.value = true

  // Try to fetch from API; fall back to local store data
  if (API_URL) {
    try {
      const res = await fetch(`${API_URL}/maintenance-history?equipment_id=${encodeURIComponent(turbine.id)}`)
      if (res.ok) {
        const data = await res.json()
        historyModalData.value = data.records || []
        historyModalLoading.value = false
        return
      }
    } catch (err) {
      // Network or parse error — silently fall through to local data below.
      // This is expected when VITE_API_URL is set but the Lambda is unreachable
      // (e.g. during local development without AWS).
      console.warn('[maintenance-history] API fetch failed, using local data:', err?.message)
    }
  }

  // Local fallback (always available)
  historyModalData.value = getMaintenanceHistory(turbine.id)
  historyModalLoading.value = false
}

function closeHistoryModal() {
  historyModalTurbine.value = null
  historyModalData.value = []
}

function investigateWithAssistant(turbine, record) {
  // Open AI assistant and pre-fill with a rich query about this maintenance record
  assistantOpen.value = true
  const partsStr = record.partsReplaced && record.partsReplaced.length
    ? `Parts replaced: ${record.partsReplaced.join(', ')}. `
    : ''
  const query =
    `Investigate the following maintenance event for ${turbine.name} ${turbine.type} (Unit ${turbine.id}, ${turbine.location}):\n` +
    `Work Order: ${record.orderNumber} | Date: ${record.timestamp?.slice(0, 10)} | Type: ${record.type}\n` +
    `Description: ${record.description}\n` +
    `Findings: ${record.findings}\n` +
    `${partsStr}Duration: ${record.durationHours}h | Result: ${record.result} | Service Hours: ${record.hoursAtService?.toLocaleString()}h\n\n` +
    `Please provide: 1) An overview of this maintenance event and why it was performed. ` +
    `2) What do the findings indicate about the equipment's health and wear patterns? ` +
    `3) What are the most common root causes for this type of maintenance? ` +
    `4) What engineering or operational actions should be taken to prevent recurrence or optimize maintenance intervals?`

  messages.value.push({
    role: 'system',
    content: `Investigating maintenance record ${record.orderNumber} for ${turbine.name} / Unit ${turbine.id}…`,
  })
  inputText.value = query
  nextTick(() => sendMessage())
}

// ── Detail View Chart ─────────────────────────────────────────────────────────
const detailChartCanvas = ref(null)
let detailChartInstance = null

function getDetailTimeLabels(count, intervalSec = 2) {
  const now = Date.now()
  return Array.from({ length: count }, (_, i) => {
    const agoMs = (count - 1 - i) * intervalSec * 1000
    const ts = new Date(now - agoMs)
    return ts.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  })
}

function getDetailChartColors() {
  const border = detailSparklineColor.value
  const bg = border === '#f87171' ? 'rgba(248,113,113,0.10)'
    : border === '#fbbf24' ? 'rgba(251,191,36,0.10)'
    : 'rgba(45,212,191,0.08)'
  return { border, bg }
}

function createDetailChart() {
  if (!detailChartCanvas.value || !selectedTurbine.value) return
  const param = detailActiveParam.value
  const history = selectedTurbine.value.metricHistory?.[detailActiveMetricKey.value] || []
  const labels = getDetailTimeLabels(history.length)
  const colors = getDetailChartColors()

  detailChartInstance = new Chart(detailChartCanvas.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data: [...history],
        borderColor: colors.border,
        borderWidth: 2,
        fill: true,
        backgroundColor: colors.bg,
        pointRadius: 0,
        pointHoverRadius: 5,
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
          bodyFont: { size: 12, weight: 'bold' },
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
            maxTicksLimit: 6,
            color: '#6b7280',
            font: { size: 10 },
            maxRotation: 0,
          },
          grid: { color: 'rgba(75,85,99,0.08)' },
          title: {
            display: true,
            text: 'Time',
            color: '#6b7280',
            font: { size: 11 },
          },
        },
        y: {
          display: true,
          position: 'left',
          ticks: {
            maxTicksLimit: 5,
            color: '#6b7280',
            font: { size: 10 },
          },
          grid: { color: 'rgba(75,85,99,0.15)' },
          title: {
            display: true,
            text: `${param.label} (${param.unit})`,
            color: '#6b7280',
            font: { size: 11 },
          },
        },
      },
      elements: { line: { borderCapStyle: 'round' } },
      interaction: { mode: 'index', intersect: false },
    },
  })
}

function updateDetailChart() {
  if (!detailChartInstance || !selectedTurbine.value) return
  const param = detailActiveParam.value
  const history = selectedTurbine.value.metricHistory?.[detailActiveMetricKey.value] || []
  const labels = getDetailTimeLabels(history.length)
  const colors = getDetailChartColors()

  const ds = detailChartInstance.data.datasets[0]
  ds.data = [...history]
  ds.borderColor = colors.border
  ds.backgroundColor = colors.bg
  detailChartInstance.data.labels = labels

  detailChartInstance.options.plugins.tooltip.bodyColor = colors.border
  detailChartInstance.options.plugins.tooltip.borderColor = colors.border
  detailChartInstance.options.plugins.tooltip.callbacks.label = (item) =>
    ` ${item.formattedValue} ${param.unit}`
  detailChartInstance.options.scales.y.title.text = `${param.label} (${param.unit})`

  // 'none' disables per-update animation to prevent visual jitter during live 2s telemetry polling
  detailChartInstance.update('none')
}

function destroyDetailChart() {
  if (detailChartInstance) {
    detailChartInstance.destroy()
    detailChartInstance = null
  }
}

// Computed for reactive telemetry watching
const detailActiveHistory = computed(() =>
  selectedTurbine.value?.metricHistory?.[detailActiveMetricKey.value] || []
)

watch(detailActiveHistory, () => { updateDetailChart() })
watch(detailActiveMetricKey, () => { updateDetailChart() })

// ── Metric Min/Max Helpers (full view cards) ──────────────────────────────────
function getParamMin(param) {
  const history = selectedTurbine.value?.metricHistory?.[param.key]
  if (!history?.length) return '—'
  return Math.min(...history).toFixed(param.decimals)
}

function getParamMax(param) {
  const history = selectedTurbine.value?.metricHistory?.[param.key]
  if (!history?.length) return '—'
  return Math.max(...history).toFixed(param.decimals)
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
  if (chatScrollRef.value) chatScrollRef.value.scrollTop = chatScrollRef.value.scrollHeight
  if (mobileChatScrollRef.value) mobileChatScrollRef.value.scrollTop = mobileChatScrollRef.value.scrollHeight
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(() => {
  updateInterval = setInterval(updateTelemetry, 2000)
  anomalyInterval = setInterval(triggerRandomAnomaly, 15000)

  const initialCritical = turbines.find(t => t.status === 'NOK')
  if (initialCritical) updateDiagnostics(initialCritical)
})

onUnmounted(() => {
  if (updateInterval) clearInterval(updateInterval)
  if (anomalyInterval) clearInterval(anomalyInterval)
  destroyDetailChart()
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

.history-slide-enter-active,
.history-slide-leave-active {
  transition: all 0.3s ease;
}
.history-slide-enter-from {
  opacity: 0;
  transform: translateY(-12px);
}
.history-slide-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>
