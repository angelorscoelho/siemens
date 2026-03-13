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
            <a href="https://www.angelorscoelho.dev/siemens"
               class="text-base font-bold tracking-tight text-white leading-tight hover:text-teal-400 transition-colors">
              Siemens Energy — AI Maintenance Dashboard
            </a>
            <p class="text-xs text-teal-400 leading-tight">PoC · Distributed AI Factory · Industrial RAG</p>
          </div>
        </div>
        <div class="ml-auto flex items-center gap-2">
          <button @click="openArchModal()"
            class="px-3 py-1.5 text-xs font-semibold bg-gray-800 border border-gray-600 rounded-lg text-gray-300 hover:border-teal-600 hover:text-teal-300 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Explore the system architecture">
            See Project Architecture
          </button>
          <button @click="openHowToUse()"
            class="px-2.5 py-1 text-xs bg-gray-800 border border-gray-600 rounded-lg text-gray-300 hover:border-teal-600 hover:text-teal-300 transition-colors cursor-pointer flex items-center gap-1.5"
            title="How to use this tool">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How to Use
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
          <p class="text-xs text-teal-400 leading-tight">Siemens Energy · PoC</p>
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
          <button @click="openArchModal()"
            class="p-1.5 rounded-lg bg-gray-800 border border-gray-600 text-gray-300 hover:border-teal-600 hover:text-teal-300 transition-colors cursor-pointer"
            title="View Architecture">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          </button>
          <button @click="openHowToUse()"
            class="p-1.5 rounded-lg bg-gray-800 border border-gray-600 text-gray-300 hover:border-teal-600 hover:text-teal-300 transition-colors cursor-pointer"
            title="How to use this tool">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- ── Floating "Show AI" button — appears when assistant sidebar is closed ── -->
    <Teleport to="body">
      <transition name="balloon">
        <button
          v-if="!assistantOpen"
          @click="assistantOpen = true"
          class="hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 p-3 bg-teal-700 hover:bg-teal-600 text-white rounded-full shadow-2xl transition-all cursor-pointer z-30 items-center justify-center"
          title="Show AI Maintenance Assistant sidebar"
          aria-label="Show AI Maintenance Assistant sidebar"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="8" width="18" height="12" rx="2"/>
            <path d="M12 2v4"/>
            <circle cx="12" cy="6" r="1" fill="currentColor" stroke="none"/>
            <circle cx="9" cy="13" r="1.2" fill="currentColor" stroke="none"/>
            <circle cx="15" cy="13" r="1.2" fill="currentColor" stroke="none"/>
            <path d="M9 17h6"/>
            <path d="M3 12H1m22 0h-2"/>
          </svg>
        </button>
      </transition>
    </Teleport>

    <!-- ═══════════════════════════════════════════════════════════════
         ALERT BALLOON — clickable, focuses the card
    ═══════════════════════════════════════════════════════════════ -->
    <transition name="balloon">
      <div v-if="alertBalloon"
        class="fixed top-[3.5rem] z-50 max-w-[calc(100vw-1.5rem)] md:max-w-sm"
        :style="{ right: assistantOpen ? 'calc(clamp(300px, 25%, 400px) + 1.5rem)' : '1.5rem' }">
        <div
          class="rounded-xl px-4 py-3 shadow-2xl flex items-start gap-3 cursor-pointer transition-colors animate-pulse-once"
          :class="alertBalloon.status === 'NOK'
            ? 'bg-red-900 border border-red-500 hover:bg-red-800'
            : 'bg-yellow-900 border border-yellow-500 hover:bg-yellow-800'"
          @click="focusAlertCard"
          :title="'Click to focus ' + (alertBalloon.turbineName || 'unit')"
        >
          <svg class="w-5 h-5 flex-shrink-0 mt-0.5"
            :class="alertBalloon.status === 'NOK' ? 'text-red-400' : 'text-yellow-400'"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold truncate"
              :class="alertBalloon.status === 'NOK' ? 'text-red-300' : 'text-yellow-300'">{{ alertBalloon.title }}</p>
            <p class="text-xs mt-0.5 leading-relaxed"
              :class="alertBalloon.status === 'NOK' ? 'text-red-400' : 'text-yellow-400'">{{ alertBalloon.message }}</p>
            <p class="text-[10px] mt-1 italic"
              :class="alertBalloon.status === 'NOK' ? 'text-red-500' : 'text-yellow-500'">Click to focus card</p>
          </div>
          <button @click.stop="alertBalloon = null" class="cursor-pointer shrink-0"
            :class="alertBalloon.status === 'NOK' ? 'text-red-500 hover:text-red-300' : 'text-yellow-500 hover:text-yellow-300'">
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

            <!-- AI Maintenance Suggestion -->
            <div v-if="selectedTurbine.status !== 'OK'" class="mt-4 bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded-xl p-4">
              <p class="text-xs text-yellow-400 font-semibold mb-2">🤖 AI Maintenance Suggestion</p>
              <p class="text-xs md:text-sm text-yellow-200">{{ selectedTurbine.aiSuggestion }}</p>
              <button @click="askAboutTurbineMobile(selectedTurbine)"
                class="mt-3 px-4 py-2 text-xs bg-teal-700 hover:bg-teal-600 text-white rounded-lg transition-colors cursor-pointer">
                Ask Assistant for Detailed Analysis
              </button>
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
              @ask-assistant="openTurbineWithAssistant"
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
              <span class="text-xs text-gray-500 font-normal">(Real RAG · S3 + Gemini)</span>
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
                <div class="max-w-[85%] bg-teal-800 text-white rounded-2xl rounded-tr-sm px-3 py-2 text-xs shadow whitespace-pre-wrap">
                  {{ msg.content }}
                </div>
              </div>
              <div v-else class="flex justify-start">
                <div class="max-w-[95%] space-y-1">
                  <div class="bg-gray-800 border border-teal-800 rounded-2xl rounded-tl-sm px-3 py-2 text-xs text-gray-100 shadow leading-relaxed ai-message" v-html="renderMarkdown(msg.content)">
                  </div>
                  <!-- RAG source chips — clickable and consultable -->
                  <div v-if="msg.context" class="flex flex-wrap gap-1.5 px-1">
                    <!-- Equipment Manual chip: opens the equipment manual URL -->
                    <a
                      v-if="msg.manualUrl"
                      :href="msg.manualUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="flex items-center gap-1 px-2 py-0.5 bg-gray-800 border border-teal-700 rounded-full text-[10px] text-teal-400 hover:bg-teal-900/50 hover:border-teal-500 transition-colors cursor-pointer"
                      title="Open Equipment Manual (RAG source) ↗">
                      <svg class="w-3 h-3 text-teal-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Equipment Manual ↗
                    </a>
                    <span v-else
                      class="flex items-center gap-1 px-2 py-0.5 bg-gray-800 border border-gray-700 rounded-full text-[10px] text-gray-400"
                      title="Retrieved from equipment manual via RAG">
                      <svg class="w-3 h-3 text-teal-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Equipment Manual
                    </span>
                    <!-- Maintenance History chip: opens the maintenance history modal -->
                    <button
                      v-if="msg.turbineId"
                      @click="openHistoryModalById(msg.turbineId)"
                      class="flex items-center gap-1 px-2 py-0.5 bg-gray-800 border border-teal-700 rounded-full text-[10px] text-teal-400 hover:bg-teal-900/50 hover:border-teal-500 transition-colors cursor-pointer"
                      title="View Maintenance History (RAG source)">
                      <svg class="w-3 h-3 text-teal-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Maintenance History
                    </button>
                    <span v-else
                      class="flex items-center gap-1 px-2 py-0.5 bg-gray-800 border border-gray-700 rounded-full text-[10px] text-gray-400"
                      title="Retrieved from maintenance history via RAG">
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
                <span class="text-xs text-gray-400">{{ loadingMessage }}</span>
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
            <p class="text-xs text-gray-500">Real RAG</p>
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
              <div class="max-w-[80%] bg-teal-800 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm shadow whitespace-pre-wrap">
                {{ msg.content }}
              </div>
            </div>
            <div v-else class="flex justify-start">
              <div class="max-w-[90%] space-y-1">
                <div class="bg-gray-800 border border-teal-800 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-gray-100 shadow leading-relaxed ai-message" v-html="renderMarkdown(msg.content)">
                </div>
                <!-- RAG source chips — clickable and consultable -->
                <div v-if="msg.context" class="flex flex-wrap gap-1.5 px-1">
                  <!-- Equipment Manual chip: opens the equipment manual URL -->
                  <a
                    v-if="msg.manualUrl"
                    :href="msg.manualUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-1 px-2 py-0.5 bg-gray-800 border border-teal-700 rounded-full text-[10px] text-teal-400 hover:bg-teal-900/50 hover:border-teal-500 transition-colors cursor-pointer"
                    title="Open Equipment Manual (RAG source) ↗">
                    <svg class="w-3 h-3 text-teal-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Equipment Manual ↗
                  </a>
                  <span v-else
                    class="flex items-center gap-1 px-2 py-0.5 bg-gray-800 border border-gray-700 rounded-full text-[10px] text-gray-400"
                    title="Retrieved from equipment manual via RAG">
                    <svg class="w-3 h-3 text-teal-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Equipment Manual
                  </span>
                  <!-- Maintenance History chip: opens the maintenance history modal -->
                  <button
                    v-if="msg.turbineId"
                    @click="openHistoryModalById(msg.turbineId)"
                    class="flex items-center gap-1 px-2 py-0.5 bg-gray-800 border border-teal-700 rounded-full text-[10px] text-teal-400 hover:bg-teal-900/50 hover:border-teal-500 transition-colors cursor-pointer"
                    title="View Maintenance History (RAG source)">
                    <svg class="w-3 h-3 text-teal-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Maintenance History
                  </button>
                  <span v-else
                    class="flex items-center gap-1 px-2 py-0.5 bg-gray-800 border border-gray-700 rounded-full text-[10px] text-gray-400"
                    title="Retrieved from maintenance history via RAG">
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
              <span class="text-sm text-gray-400">{{ loadingMessage }}</span>
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
        @click="setMobileChat()"
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
      Siemens Energy · Gas Turbine AI Maintenance Assistant · PoC · Vue.js + AWS Lambda + Gemini 2.5 Pro ·
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

    <!-- ═══════════════════════════════════════════════════════════════
         HOW TO USE MODAL
    ═══════════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <transition name="arch-fade">
        <div v-if="howToUseOpen"
          ref="howToUseModalRef"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          @click.self="closeHowToUse()"
          @keydown.esc="closeHowToUse()"
          tabindex="-1"
        >
          <div class="relative bg-gray-950 border border-teal-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col overflow-hidden">

            <!-- Modal Header -->
            <div class="shrink-0 flex items-center gap-3 border-b border-gray-800 px-6 py-4 bg-gray-900">
              <svg class="w-5 h-5 text-teal-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="flex-1 min-w-0">
                <h2 class="text-sm font-bold text-white">How to Use This Tool</h2>
                <p class="text-xs text-gray-400">Siemens Energy · AI Maintenance Dashboard · User Guide</p>
              </div>
              <button
                @click="closeHowToUse()"
                class="text-gray-500 hover:text-gray-200 transition-colors cursor-pointer p-1 rounded-lg hover:bg-gray-800"
                aria-label="Close guide"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Scrollable content -->
            <div class="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-sm text-gray-300 leading-relaxed">

              <!-- Introduction -->
              <section>
                <h3 class="text-base font-bold text-teal-300 mb-3 flex items-center gap-2">
                  <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Overview
                </h3>
                <p class="mb-3">
                  The <span class="text-teal-400 font-semibold">Siemens Energy AI Maintenance Dashboard</span> is a proof-of-concept tool designed to help maintenance engineers and plant operators monitor industrial gas turbine fleets in real time. The dashboard presents live telemetry data—such as vibration levels, exhaust temperatures, power output, and efficiency—across all fleet assets, highlights anomalies instantly, and provides AI-driven root-cause analysis and actionable maintenance plans.
                </p>
                <p class="mb-3">
                  Under the hood, the AI assistant uses <span class="text-teal-400 font-semibold">Retrieval-Augmented Generation (RAG)</span> to ground its answers in real documentation. When you ask a question, the system embeds your query using <span class="text-teal-400 font-semibold">Google text-embedding-004</span>, retrieves the most relevant excerpts from the equipment manuals and maintenance history stored in Amazon S3, and then passes that context to <span class="text-teal-400 font-semibold">Gemini 2.0 Flash</span> for a structured, evidence-based response. This means the AI doesn't hallucinate generic advice—it references the actual Siemens SGT-series maintenance documentation and your fleet's historical records.
                </p>
              </section>

              <!-- Reading the Dashboard -->
              <section>
                <h3 class="text-base font-bold text-teal-300 mb-3 flex items-center gap-2">
                  <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Reading the Dashboard &amp; Reports
                </h3>
                <p class="mb-3">
                  The fleet overview displays one card per equipment unit. Each card shows real-time metrics, a sparkline chart of the most critical parameter, and a status badge:
                </p>
                <div class="space-y-2 pl-2 mb-3">
                  <div class="flex items-center gap-2">
                    <span class="inline-block px-2 py-0.5 text-xs font-bold rounded-full bg-teal-900 text-teal-300 border border-teal-600">OK</span>
                    <span class="text-gray-400">— All parameters within normal operating range.</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="inline-block px-2 py-0.5 text-xs font-bold rounded-full bg-yellow-900 text-yellow-300 border border-yellow-600">RISK</span>
                    <span class="text-gray-400">— One or more parameters exceed warning thresholds. Monitor closely.</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="inline-block px-2 py-0.5 text-xs font-bold rounded-full bg-red-900 text-red-300 border border-red-600">NOK</span>
                    <span class="text-gray-400">— Critical threshold exceeded. Immediate action may be required.</span>
                  </div>
                </div>
                <p class="mb-3">
                  Click any metric row on a card to change which parameter the chart displays. Click the equipment name to open the <span class="text-white font-semibold">full detail view</span>, which shows expanded charts, all metrics with min/max ranges, and maintenance documentation. Use the filter chips above the fleet to show only units with a specific status.
                </p>
              </section>

              <!-- Card Icons -->
              <section>
                <h3 class="text-base font-bold text-teal-300 mb-3 flex items-center gap-2">
                  <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  Card Actions &amp; Icons
                </h3>
                <p class="mb-3">Each equipment card provides quick-action icons in the header area:</p>
                <div class="space-y-3 pl-2">
                  <div class="flex items-start gap-3">
                    <span class="shrink-0 mt-0.5 p-1.5 rounded-md bg-gray-800 text-gray-400">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </span>
                    <div>
                      <p class="text-white font-semibold text-xs">Equipment Manual</p>
                      <p class="text-gray-400 text-xs">Opens the official Siemens manufacturer manual (PDF) for this specific turbine model in a new tab. Use this to consult OEM specifications, inspection intervals, and component part numbers.</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <span class="shrink-0 mt-0.5 p-1.5 rounded-md bg-gray-800 text-gray-400">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                    <div>
                      <p class="text-white font-semibold text-xs">Maintenance History</p>
                      <p class="text-gray-400 text-xs">Opens a modal with the complete maintenance log for this unit—past inspections, repairs, part replacements, and dates. The AI assistant also uses this history as context when generating recommendations.</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <span class="shrink-0 mt-0.5 p-1.5 rounded-md bg-gray-800 text-gray-400">
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="8" width="18" height="12" rx="2"/>
                        <path d="M12 2v4"/>
                        <circle cx="12" cy="6" r="1" fill="currentColor" stroke="none"/>
                        <circle cx="9" cy="13" r="1.2" fill="currentColor" stroke="none"/>
                        <circle cx="15" cy="13" r="1.2" fill="currentColor" stroke="none"/>
                        <path d="M9 17h6"/>
                        <path d="M3 12H1m22 0h-2"/>
                      </svg>
                    </span>
                    <div>
                      <p class="text-white font-semibold text-xs">Ask AI Assistant (Alert Robot Icon)</p>
                      <p class="text-gray-400 text-xs">Appears on cards with <span class="text-yellow-300 font-bold">RISK</span> or <span class="text-red-300 font-bold">NOK</span> status. Clicking the robot icon instantly sends the anomaly context to the AI assistant for analysis—no typing needed. Also available in the detail view as a dedicated button.</p>
                    </div>
                  </div>
                </div>
              </section>

              <!-- AI Trigger Methods -->
              <section>
                <h3 class="text-base font-bold text-teal-300 mb-3 flex items-center gap-2">
                  <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="8" width="18" height="12" rx="2"/>
                    <path d="M12 2v4"/>
                    <circle cx="12" cy="6" r="1" fill="currentColor" stroke="none"/>
                    <circle cx="9" cy="13" r="1.2" fill="currentColor" stroke="none"/>
                    <circle cx="15" cy="13" r="1.2" fill="currentColor" stroke="none"/>
                    <path d="M9 17h6"/>
                    <path d="M3 12H1m22 0h-2"/>
                  </svg>
                  Two Ways to Trigger the AI Assistant
                </h3>
                <div class="space-y-3">
                  <div class="flex items-start gap-3 p-3 rounded-lg bg-gray-900 border border-gray-800">
                    <span class="shrink-0 mt-1 flex items-center justify-center w-6 h-6 rounded-full bg-teal-900 text-teal-300 text-xs font-bold">1</span>
                    <div>
                      <p class="text-white font-semibold text-xs mb-1">Chat Panel (Right Sidebar)</p>
                      <p class="text-gray-400 text-xs">Open the AI assistant panel using the robot icon button that floats on the right edge of the screen. Type any question about turbine maintenance, anomaly diagnosis, or operating procedures. The AI will retrieve relevant documentation and provide a structured answer.</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3 p-3 rounded-lg bg-gray-900 border border-gray-800">
                    <span class="shrink-0 mt-1 flex items-center justify-center w-6 h-6 rounded-full bg-teal-900 text-teal-300 text-xs font-bold">2</span>
                    <div>
                      <p class="text-white font-semibold text-xs mb-1">One-click AI Analysis from Alert Banner or Detail View</p>
                      <p class="text-gray-400 text-xs">When an equipment card shows a <span class="inline-block px-1 py-0 text-[10px] font-bold rounded bg-yellow-900 text-yellow-300 border border-yellow-700">RISK</span> or <span class="inline-block px-1 py-0 text-[10px] font-bold rounded bg-red-900 text-red-300 border border-red-700">NOK</span> banner, click the <svg class="w-3.5 h-3.5 inline text-gray-300 align-middle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M12 2v4"/><circle cx="12" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="9" cy="13" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="13" r="1.2" fill="currentColor" stroke="none"/><path d="M9 17h6"/><path d="M3 12H1m22 0h-2"/></svg> robot icon to instantly send the anomaly details to the AI. The same robot icon is also available in the full detail view as a "Request AI Assistant Analysis" button, which sends all current readings, anomalies, and equipment model for a comprehensive diagnosis and action plan.</p>
                    </div>
                  </div>
                </div>
              </section>

              <!-- RAG Explanation -->
              <section>
                <h3 class="text-base font-bold text-teal-300 mb-3 flex items-center gap-2">
                  <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  How the AI Works (RAG Pipeline)
                </h3>
                <p class="mb-3">
                  The AI assistant follows a <span class="text-teal-400 font-semibold">Retrieval-Augmented Generation (RAG)</span> pipeline to ensure every answer is grounded in real Siemens documentation:
                </p>
                <ol class="space-y-2 list-decimal list-inside">
                  <li class="text-gray-400"><span class="text-gray-300">Your question is embedded</span> into a 768-dimensional vector using Google text-embedding-004.</li>
                  <li class="text-gray-400"><span class="text-gray-300">Cosine similarity search</span> compares that vector against pre-computed chunks from the Siemens SGT-series manuals and maintenance records stored in Amazon S3.</li>
                  <li class="text-gray-400"><span class="text-gray-300">Top-3 most relevant excerpts</span> are selected and injected into a structured prompt.</li>
                  <li class="text-gray-400"><span class="text-gray-300">Gemini 2.0 Flash</span> generates the final answer, citing the source documents. This ensures accurate, traceable recommendations instead of generic advice.</li>
                </ol>
              </section>

              <!-- Example Workflow -->
              <section>
                <h3 class="text-base font-bold text-teal-300 mb-3 flex items-center gap-2">
                  <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Example Workflow
                </h3>
                <div class="space-y-3">
                  <div class="flex items-start gap-3">
                    <span class="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-red-900 text-red-300 text-xs font-bold border border-red-700">1</span>
                    <div>
                      <p class="text-white font-semibold text-xs">Spot the anomaly</p>
                      <p class="text-gray-400 text-xs">You notice <span class="text-red-300 font-bold">GT-03</span> shows a <span class="inline-block px-1 py-0 text-[10px] font-bold rounded bg-red-900 text-red-300 border border-red-700">NOK</span> badge — vibration has spiked to 12.1 mm/s (limit: 11.0).</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <span class="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-yellow-900 text-yellow-300 text-xs font-bold border border-yellow-700">2</span>
                    <div>
                      <p class="text-white font-semibold text-xs">Consult the manual</p>
                      <p class="text-gray-400 text-xs">Click the
                        <svg class="w-2.5 h-2.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        manual icon on the GT-03 card to review the OEM vibration limits and inspection checklist. Then check the
                        <svg class="w-2.5 h-2.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        maintenance history for recent service records.</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <span class="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-teal-900 text-teal-300 text-xs font-bold border border-teal-700">3</span>
                    <div>
                      <p class="text-white font-semibold text-xs">Request AI analysis</p>
                      <p class="text-gray-400 text-xs">Click the <svg class="w-3 h-3 inline text-red-300 align-middle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M12 2v4"/><circle cx="12" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="9" cy="13" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="13" r="1.2" fill="currentColor" stroke="none"/><path d="M9 17h6"/><path d="M3 12H1m22 0h-2"/></svg> robot icon on the NOK banner — the AI instantly receives the anomaly data, searches the Siemens manuals, and returns a root-cause analysis with recommended actions.</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <span class="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-900 text-indigo-300 text-xs font-bold border border-indigo-700">4</span>
                    <div>
                      <p class="text-white font-semibold text-xs">Review and act</p>
                      <p class="text-gray-400 text-xs">The AI response includes a structured action plan (e.g., "inspect coupling alignment, check bearing lubrication, schedule balancing") with references to the specific manual sections. Follow the plan or ask follow-up questions in the chat.</p>
                    </div>
                  </div>
                </div>
              </section>

            </div>

            <!-- Footer -->
            <div class="shrink-0 border-t border-gray-800 px-6 py-3 bg-gray-900 flex items-center justify-between gap-3">
              <p class="text-[11px] text-gray-500">
                Need more help? Ask the AI assistant any question about maintenance procedures.
              </p>
              <button
                @click="closeHowToUse()"
                class="px-4 py-1.5 text-xs font-semibold bg-teal-700 hover:bg-teal-600 text-white rounded-lg transition-colors cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- ═══════════════════════════════════════════════════════════════
         ARCHITECTURE DIAGRAM MODAL
    ═══════════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <transition name="arch-fade">
        <div v-if="archOpen"
          ref="archModalRef"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          @click.self="closeArchModal()"
          @keydown.esc="closeArchModal()"
          tabindex="-1"
        >
          <div class="relative bg-gray-950 border border-teal-800 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col overflow-hidden">

            <!-- Modal Header -->
            <div class="flex items-center gap-3 px-6 py-4 border-b border-gray-800 bg-gray-900 shrink-0">
              <svg class="w-5 h-5 text-teal-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              <div class="flex-1 min-w-0">
                <h2 class="text-sm font-bold text-white">System Architecture</h2>
                <p class="text-xs text-gray-400">Siemens Energy · AI Maintenance Dashboard · PoC</p>
              </div>
              <button
                @click="closeArchModal()"
                class="text-gray-500 hover:text-gray-200 transition-colors cursor-pointer p-1 rounded-lg hover:bg-gray-800"
                aria-label="Close architecture diagram"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Scrollable content -->
            <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              <!-- Architecture description -->
              <!-- Architecture description -->
              <p class="text-sm text-gray-300 leading-relaxed">
                This proof-of-concept is a full-stack cloud-native application. The <span class="text-teal-400 font-semibold">Vue 3 + Vite</span> single-page application is deployed on <span class="text-teal-400 font-semibold">Vercel</span> and served directly to users from the global CDN edge. Queries are sent over HTTPS directly to <span class="text-teal-400 font-semibold">Amazon API Gateway</span>, which invokes the <span class="text-teal-400 font-semibold">AWS Lambda</span> ask_assistant function. The Lambda executes a real <span class="text-teal-400 font-semibold">Retrieval-Augmented Generation (RAG)</span> pipeline: it embeds the user query using Google <span class="text-teal-400 font-semibold">text-embedding-004</span>, downloads pre-computed chunk vectors from <span class="text-teal-400 font-semibold">Amazon S3</span> (cached in <span class="text-teal-400 font-semibold">/tmp</span> across warm invocations), performs pure-Python cosine similarity to retrieve the top-3 most relevant manual excerpts, then passes the grounded context to <span class="text-teal-400 font-semibold">gemini-2.0-flash</span> for the final answer. No VPC or proxy layer is required — the Lambda calls the Gemini REST API directly via stdlib urllib. Infrastructure is defined as code with <span class="text-teal-400 font-semibold">AWS SAM / CloudFormation</span>.
              </p>

              <!-- Architecture SVG Diagram -->
              <div class="w-full overflow-x-auto">
                <svg viewBox="0 0 1020 570" xmlns="http://www.w3.org/2000/svg"
                  class="w-full min-w-[720px] rounded-xl border border-gray-800 bg-gray-900"
                  font-family="ui-monospace, monospace" font-size="12"
                  role="img" aria-labelledby="arch-svg-title">
                  <title id="arch-svg-title">System architecture: User browser loads Vue 3 SPA from Vercel CDN. Browser calls AWS API Gateway (REST API) directly via HTTPS. API Gateway invokes Lambda ask_assistant which runs a RAG pipeline: embeds query with text-embedding-004, retrieves top-3 chunk vectors from S3 via cosine similarity (/tmp cached), calls gemini-2.0-flash for the grounded answer. API Gateway also invokes Lambda maintenance_history. Infrastructure deployed via AWS SAM / CloudFormation. GitHub Actions provides CI/CD.</title>

                  <!-- Arrow marker definitions -->
                  <defs>
                    <marker id="arr-teal" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                      <path d="M0,0 L0,7 L7,3.5 z" fill="#0d9488"/>
                    </marker>
                    <marker id="arr-amber" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                      <path d="M0,0 L0,7 L7,3.5 z" fill="#f59e0b"/>
                    </marker>
                    <marker id="arr-indigo" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                      <path d="M0,0 L0,7 L7,3.5 z" fill="#818cf8"/>
                    </marker>
                    <marker id="arr-green" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                      <path d="M0,0 L0,7 L7,3.5 z" fill="#22c55e"/>
                    </marker>
                    <marker id="arr-gray" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                      <path d="M0,0 L0,7 L7,3.5 z" fill="#6b7280"/>
                    </marker>
                  </defs>

                  <!-- ═══ USER ZONE ═══ -->
                  <rect x="10" y="10" width="1000" height="90" rx="12" fill="#0f172a" stroke="#334155" stroke-width="1"/>
                  <text x="510" y="20" text-anchor="middle" fill="#64748b" font-size="11" font-weight="bold">USER</text>
                  <rect x="390" y="26" width="240" height="64" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.4"/>
                  <rect x="404" y="36" width="32" height="22" rx="3" fill="none" stroke="#94a3b8" stroke-width="1.3"/>
                  <line x1="404" y1="42" x2="436" y2="42" stroke="#94a3b8" stroke-width="1.3"/>
                  <circle cx="408" cy="39" r="2" fill="#ef4444"/>
                  <circle cx="414" cy="39" r="2" fill="#f59e0b"/>
                  <circle cx="420" cy="39" r="2" fill="#22c55e"/>
                  <text x="444" y="49" fill="#e2e8f0" font-size="12" font-weight="bold">Browser</text>
                  <text x="444" y="63" fill="#94a3b8" font-size="9">Vue 3 · Vite · Tailwind · Chart.js</text>
                  <text x="444" y="76" fill="#94a3b8" font-size="9">Single-page application (SPA)</text>

                  <!-- ═══ VERCEL ZONE ═══ -->
                  <rect x="10" y="120" width="244" height="210" rx="12" fill="#0f172a" stroke="#0d9488" stroke-width="1.2" stroke-dasharray="5,3"/>
                  <text x="132" y="138" text-anchor="middle" fill="#0d9488" font-size="11" font-weight="bold">VERCEL (Frontend)</text>
                  <!-- Vercel CDN -->
                  <rect x="22" y="150" width="220" height="56" rx="8" fill="#1e293b" stroke="#0d9488" stroke-width="1.4"/>
                  <polygon points="38,182 52,162 66,182" fill="none" stroke="#e2e8f0" stroke-width="1.5" stroke-linejoin="round"/>
                  <text x="76" y="170" fill="#e2e8f0" font-size="11" font-weight="bold">Vercel CDN</text>
                  <text x="76" y="183" fill="#94a3b8" font-size="9">Static SPA · Global edge</text>
                  <text x="76" y="195" fill="#94a3b8" font-size="9">angelorscoelho.dev</text>
                  <!-- GitHub Actions -->
                  <rect x="22" y="222" width="220" height="56" rx="8" fill="#1e293b" stroke="#6b7280" stroke-width="1.4"/>
                  <circle cx="44" cy="250" r="11" fill="none" stroke="#e2e8f0" stroke-width="1.5"/>
                  <circle cx="44" cy="247" r="4.5" fill="#e2e8f0"/>
                  <path d="M35,260 Q44,254 53,260" fill="#e2e8f0"/>
                  <text x="64" y="244" fill="#e2e8f0" font-size="11" font-weight="bold">GitHub Actions</text>
                  <text x="64" y="257" fill="#94a3b8" font-size="9">CI/CD · build.yml</text>
                  <text x="64" y="269" fill="#94a3b8" font-size="9">deploy triggers · workflows</text>

                  <!-- ═══ AWS CLOUD ZONE ═══ -->
                  <rect x="270" y="120" width="472" height="295" rx="12" fill="#0f172a" stroke="#f59e0b" stroke-width="1.2" stroke-dasharray="5,3"/>
                  <text x="506" y="138" text-anchor="middle" fill="#f59e0b" font-size="11" font-weight="bold">AWS CLOUD (us-east-1)</text>
                  <!-- API Gateway -->
                  <rect x="286" y="150" width="440" height="50" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="1.4"/>
                  <rect x="300" y="160" width="26" height="20" rx="3" fill="#8b5cf6"/>
                  <polyline points="308,166 304,170 308,174" fill="none" stroke="white" stroke-width="1.2" stroke-linejoin="round"/>
                  <polyline points="320,166 324,170 320,174" fill="none" stroke="white" stroke-width="1.2" stroke-linejoin="round"/>
                  <line x1="308" y1="170" x2="320" y2="170" stroke="white" stroke-width="1.2"/>
                  <text x="336" y="170" fill="#e2e8f0" font-size="11" font-weight="bold">Amazon API Gateway</text>
                  <text x="336" y="183" fill="#94a3b8" font-size="9">HTTP API · CORS · prod · POST /ask-assistant · GET /maintenance-history</text>
                  <!-- Lambda maintenance_history (left) -->
                  <rect x="286" y="235" width="210" height="72" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="1.4"/>
                  <rect x="300" y="246" width="22" height="22" rx="3" fill="#f59e0b"/>
                  <text x="311" y="262" text-anchor="middle" fill="#1e293b" font-size="13" font-weight="bold">λ</text>
                  <text x="330" y="256" fill="#e2e8f0" font-size="10" font-weight="bold">maintenance_history</text>
                  <text x="330" y="270" fill="#94a3b8" font-size="9">Python 3.11</text>
                  <text x="330" y="282" fill="#94a3b8" font-size="9">GET /maintenance-history</text>
                  <text x="330" y="294" fill="#64748b" font-size="8">Records per equipment ID</text>
                  <!-- Lambda ask_assistant (right) -->
                  <rect x="516" y="235" width="210" height="72" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="1.4"/>
                  <rect x="530" y="246" width="22" height="22" rx="3" fill="#f59e0b"/>
                  <text x="541" y="262" text-anchor="middle" fill="#1e293b" font-size="13" font-weight="bold">λ</text>
                  <text x="560" y="256" fill="#e2e8f0" font-size="10" font-weight="bold">ask_assistant</text>
                  <text x="560" y="270" fill="#94a3b8" font-size="9">Python 3.11 · RAG pipeline</text>
                  <text x="560" y="282" fill="#94a3b8" font-size="9">Gemini embed + LLM</text>
                  <text x="560" y="294" fill="#64748b" font-size="8">cosine sim · /tmp cache</text>
                  <!-- Amazon S3 (below ask_assistant, right side) -->
                  <rect x="516" y="342" width="210" height="60" rx="8" fill="#1e293b" stroke="#22c55e" stroke-width="1.4"/>
                  <rect x="530" y="352" width="24" height="20" rx="2" fill="#22c55e"/>
                  <ellipse cx="542" cy="352" rx="12" ry="4" fill="#16a34a"/>
                  <ellipse cx="542" cy="372" rx="12" ry="4" fill="#16a34a"/>
                  <text x="564" y="366" fill="#e2e8f0" font-size="10" font-weight="bold">Amazon S3</text>
                  <text x="564" y="379" fill="#94a3b8" font-size="9">Knowledge Base · 768-dim vectors</text>
                  <text x="564" y="391" fill="#94a3b8" font-size="9">Pure-Python cosine similarity</text>

                  <!-- ═══ GOOGLE ZONE ═══ -->
                  <rect x="760" y="120" width="250" height="210" rx="12" fill="#0f172a" stroke="#818cf8" stroke-width="1.2" stroke-dasharray="5,3"/>
                  <text x="885" y="138" text-anchor="middle" fill="#818cf8" font-size="11" font-weight="bold">GOOGLE (External)</text>
                  <!-- Gemini API box -->
                  <rect x="774" y="152" width="222" height="155" rx="8" fill="#1e293b" stroke="#818cf8" stroke-width="1.4"/>
                  <circle cx="794" cy="180" r="11" fill="none" stroke="#818cf8" stroke-width="1.5"/>
                  <line x1="794" y1="169" x2="794" y2="191" stroke="#818cf8" stroke-width="1.5"/>
                  <line x1="783" y1="180" x2="805" y2="180" stroke="#818cf8" stroke-width="1.5"/>
                  <text x="814" y="176" fill="#e2e8f0" font-size="11" font-weight="bold">Gemini API</text>
                  <text x="814" y="190" fill="#94a3b8" font-size="9">googleapis.com</text>
                  <line x1="782" y1="202" x2="988" y2="202" stroke="#334155" stroke-width="0.5"/>
                  <text x="790" y="220" fill="#94a3b8" font-size="10">text-embedding-004</text>
                  <text x="790" y="234" fill="#64748b" font-size="9">768-dim · ingest + query embed</text>
                  <text x="790" y="256" fill="#94a3b8" font-size="10">gemini-2.0-flash</text>
                  <text x="790" y="270" fill="#64748b" font-size="9">LLM · grounded RAG answers</text>
                  <text x="790" y="290" fill="#64748b" font-size="8">GEMINI_API_KEY (env var)</text>

                  <!-- ═══ AWS SAM / CloudFormation (centered below AWS boundary) ═══ -->
                  <rect x="416" y="425" width="180" height="30" rx="6" fill="#1a2332" stroke="#f59e0b" stroke-width="1"/>
                  <text x="506" y="444" text-anchor="middle" fill="#f59e0b" font-size="10" font-weight="bold">AWS SAM / CloudFormation</text>

                  <!-- ═══ ARROWS ═══ -->
                  <!-- Browser → Vercel CDN: route left along edge then down to triangle icon -->
                  <path d="M390,65 L8,65 L8,172 L38,172" fill="none" stroke="#0d9488" stroke-width="1.8" marker-end="url(#arr-teal)"/>
                  <text x="199" y="60" text-anchor="middle" fill="#64748b" font-size="9">HTTPS (serve SPA)</text>
                  <!-- Browser → API Gateway: route to left part of API GW -->
                  <path d="M390,90 L310,90 L310,150" fill="none" stroke="#f59e0b" stroke-width="1.8" stroke-dasharray="5,3" marker-end="url(#arr-amber)"/>
                  <text x="347" y="86" fill="#64748b" font-size="9">REST API</text>
                  <!-- API GW → Lambda maintenance_history (left, dashed) -->
                  <line x1="391" y1="200" x2="391" y2="235" stroke="#f59e0b" stroke-width="1.8" stroke-dasharray="5,3" marker-end="url(#arr-amber)"/>
                  <text x="299" y="220" fill="#64748b" font-size="8">invoke</text>
                  <!-- API GW → Lambda ask_assistant (right, solid) -->
                  <line x1="621" y1="200" x2="621" y2="235" stroke="#f59e0b" stroke-width="1.8" marker-end="url(#arr-amber)"/>
                  <text x="629" y="220" fill="#64748b" font-size="8">invoke</text>
                  <!-- Lambda ask_assistant → S3 (straight down, right side) -->
                  <line x1="621" y1="307" x2="621" y2="342" stroke="#22c55e" stroke-width="1.8" stroke-dasharray="5,3" marker-end="url(#arr-green)"/>
                  <text x="629" y="328" fill="#64748b" font-size="8">GetObject</text>
                  <!-- Lambda ask_assistant → Gemini API (straight right) -->
                  <path d="M726,271 L774,271" fill="none" stroke="#818cf8" stroke-width="1.8" marker-end="url(#arr-indigo)"/>
                  <text x="750" y="266" text-anchor="middle" fill="#64748b" font-size="9">HTTPS</text>
                  <!-- GitHub Actions → SAM (down then right to centered SAM) -->
                  <path d="M132,278 L132,440 L416,440" fill="none" stroke="#6b7280" stroke-width="1.3" stroke-dasharray="5,3" marker-end="url(#arr-gray)"/>
                  <text x="140" y="370" fill="#64748b" font-size="9">deploys</text>
                  <!-- AWS SAM → AWS CLOUD boundary (IaC setup, upward) -->
                  <line x1="506" y1="425" x2="506" y2="415" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arr-amber)"/>
                  <text x="514" y="422" fill="#64748b" font-size="8">IaC setup</text>

                  <!-- ═══ LEGEND (horizontally centred) ═══ -->
                  <rect x="130" y="470" width="760" height="80" rx="10" fill="#111827" stroke="#1e293b" stroke-width="1"/>
                  <text x="510" y="488" text-anchor="middle" fill="#94a3b8" font-size="11" font-weight="bold">LEGEND</text>
                  <line x1="150" y1="510" x2="175" y2="510" stroke="#0d9488" stroke-width="2"/>
                  <polygon points="175,506 175,514 183,510" fill="#0d9488"/>
                  <text x="190" y="514" fill="#94a3b8" font-size="10">Vercel HTTPS (SPA)</text>
                  <line x1="320" y1="510" x2="345" y2="510" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5,3"/>
                  <polygon points="345,506 345,514 353,510" fill="#f59e0b"/>
                  <text x="360" y="514" fill="#94a3b8" font-size="10">AWS REST / invoke</text>
                  <line x1="520" y1="510" x2="545" y2="510" stroke="#818cf8" stroke-width="2"/>
                  <polygon points="545,506 545,514 553,510" fill="#818cf8"/>
                  <text x="560" y="514" fill="#94a3b8" font-size="10">Gemini API (HTTPS)</text>
                  <line x1="710" y1="510" x2="735" y2="510" stroke="#22c55e" stroke-width="2" stroke-dasharray="5,3"/>
                  <polygon points="735,506 735,514 743,510" fill="#22c55e"/>
                  <text x="750" y="514" fill="#94a3b8" font-size="10">S3 RAG retrieval</text>
                  <line x1="150" y1="536" x2="175" y2="536" stroke="#6b7280" stroke-width="2" stroke-dasharray="5,3"/>
                  <polygon points="175,532 175,540 183,536" fill="#6b7280"/>
                  <text x="190" y="540" fill="#94a3b8" font-size="10">CI/CD deploy trigger</text>
                  <rect x="320" y="530" width="14" height="14" rx="2" fill="none" stroke="#f59e0b" stroke-width="1.2"/>
                  <text x="340" y="540" fill="#94a3b8" font-size="10">AWS cloud boundary</text>
                  <rect x="520" y="530" width="14" height="14" rx="2" fill="none" stroke="#0d9488" stroke-width="1.2" stroke-dasharray="3,2"/>
                  <text x="540" y="540" fill="#94a3b8" font-size="10">Vercel cloud boundary</text>
                  <rect x="710" y="530" width="14" height="14" rx="2" fill="none" stroke="#818cf8" stroke-width="1.2" stroke-dasharray="3,2"/>
                  <text x="730" y="540" fill="#94a3b8" font-size="10">Google (external API)</text>
                </svg>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="shrink-0 border-t border-gray-800 px-6 py-3 bg-gray-900 flex items-center justify-between gap-4">
              <p class="text-[11px] text-gray-500 leading-relaxed">
                Want to check out the code?
              </p>
              <a
                href="https://github.com/angelorscoelho/siemens"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-teal-600 text-gray-300 hover:text-teal-300 rounded-lg transition-colors"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.929.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                Visit the GitHub repository — it's public!
              </a>
            </div>
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
import { marked } from 'marked'
import DOMPurify from 'dompurify'

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

// ── Architecture Modal ────────────────────────────────────────────────────────
const archOpen = ref(false)
const archModalRef = ref(null)
watch(archOpen, async (val) => {
  if (val) {
    await nextTick()
    archModalRef.value?.focus()
  }
})

// ── How to Use Modal ──────────────────────────────────────────────────────────
const howToUseOpen = ref(false)
const howToUseModalRef = ref(null)
watch(howToUseOpen, async (val) => {
  if (val) {
    await nextTick()
    howToUseModalRef.value?.focus()
  }
})

// ── URL Hash Navigation ───────────────────────────────────────────────────────
function pushHash(hash) {
  const url = hash ? location.pathname + hash : location.pathname
  history.pushState({}, '', url)
}

function applyHash() {
  const hash = location.hash
  if (hash === '#architecture') {
    archOpen.value = true
  } else if (hash === '#how-to-use') {
    howToUseOpen.value = true
  } else if (hash === '#helper') {
    assistantOpen.value = true
    mobileView.value = 'chat'
  } else if (hash.startsWith('#equipment=')) {
    const rest = hash.replace('#equipment=', '')
    const slashIdx = rest.indexOf('/')
    const rawId = slashIdx >= 0 ? rest.slice(0, slashIdx) : rest
    const subview = slashIdx >= 0 ? rest.slice(slashIdx + 1) : ''
    const turbine = turbines.find(t => t.id === rawId)
    archOpen.value = false
    if (turbine) {
      mobileView.value = 'detail'
      if (subview === 'history') {
        selectedTurbine.value = turbine
        openHistoryModal(turbine, false)
      } else if (subview.startsWith('param=')) {
        const paramKey = subview.slice(6)
        historyModalTurbine.value = null
        historyModalData.value = []
        if (selectedTurbine.value === turbine) {
          // Same turbine — watch won't fire; set metric directly
          detailMetricKey.value = paramKey
        } else {
          pendingMetricKey = paramKey
          selectedTurbine.value = turbine
        }
      } else {
        historyModalTurbine.value = null
        historyModalData.value = []
        if (selectedTurbine.value !== turbine) {
          selectedTurbine.value = turbine
        }
      }
    } else {
      selectedTurbine.value = null
      mobileView.value = 'fleet'
    }
  } else {
    archOpen.value = false
    howToUseOpen.value = false
    if (selectedTurbine.value) {
      destroyDetailChart()
      selectedTurbine.value = null
    }
    historyModalTurbine.value = null
    historyModalData.value = []
    mobileView.value = 'fleet'
  }
}

function openArchModal() {
  archOpen.value = true
  pushHash('#architecture')
}

function closeArchModal() {
  archOpen.value = false
  pushHash('')
}

function openHowToUse() {
  howToUseOpen.value = true
  pushHash('#how-to-use')
}

function closeHowToUse() {
  howToUseOpen.value = false
  pushHash('')
}

function setMobileChat() {
  mobileView.value = 'chat'
  pushHash('#helper')
}

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
  if (selectedTurbine.value) {
    const paramStr = detailMetricKey.value ? `/param=${detailMetricKey.value}` : ''
    pushHash(`#equipment=${selectedTurbine.value.id}${paramStr}`)
  }
}

// Plain `let` is intentional: this is set synchronously just before
// `selectedTurbine.value = turbine` triggers the watch, so it must not be
// reactive (a ref would risk being seen in a different microtask tick).
let pendingMetricKey = null

// Reset detail metric selection when switching turbines and manage chart
watch(selectedTurbine, async (newVal) => {
  detailMetricKey.value = pendingMetricKey
  pendingMetricKey = null
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

  // Randomly choose which parameter becomes the anomaly (50/50 split)
  if (Math.random() < 0.5) {
    target.vibration = thresholds.vibration.critical + 0.5 + Math.random() * 1.5
  } else {
    target.exhaustTemp = thresholds.exhaustTemp.critical + 5 + Math.random() * 20
  }
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
    status: turbine.status,
  }
  setTimeout(() => {
    alertBalloon.value = null
  }, 8000)
}

function focusAlertCard() {
  if (!alertBalloon.value?.turbineId) return
  const turbineId = alertBalloon.value.turbineId
  const turbine = turbines.find(t => t.id === turbineId)
  alertBalloon.value = null

  // If filters are active and the turbine would be hidden, clear status filters
  if (anyFilterActive.value && turbine && !statusFilters[turbine.status]) {
    clearFilters()
  }

  // Clear any previous focus, then set the new one
  focusedCardId.value = null
  nextTick(() => {
    focusedCardId.value = turbineId
    // Reset after animation (4 glow pulses × 2s each + 0.8s vibrate)
    setTimeout(() => {
      focusedCardId.value = null
    }, 8800)
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
function openTurbineSession(turbine, metricKey = null) {
  pendingMetricKey = metricKey
  selectedTurbine.value = turbine
  mobileView.value = 'detail'
  const paramStr = metricKey ? `/param=${metricKey}` : ''
  pushHash(`#equipment=${turbine.id}${paramStr}`)
}

function clearTurbineSelection() {
  selectedTurbine.value = null
  mobileView.value = 'fleet'
  pushHash('')
}

function askAboutTurbine(turbine) {
  assistantOpen.value = true
  chatContextTurbine.value = turbine
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
  pushHash('#helper')
  chatContextTurbine.value = turbine
  messages.value.push({
    role: 'system',
    content: `Analyzing specific fault in Asset #${turbine.id} (${turbine.name} ${turbine.type})...`,
  })
  const query = `Analyze the current status of ${turbine.name} ${turbine.type} (Unit ${turbine.id}): vibration is ${turbine.vibration.toFixed(3)} mm/s, exhaust temperature is ${turbine.exhaustTemp.toFixed(1)}°C, and it has ${Math.floor(turbine.hoursSinceOverhaul).toLocaleString()} hours since last overhaul. What maintenance actions should be taken?`
  inputText.value = query
  nextTick(() => sendMessage())
}

function openTurbineWithAssistant(turbine) {
  openTurbineSession(turbine)
  askAboutTurbine(turbine)
}

// ── Maintenance History Modal ─────────────────────────────────────────────────
async function openHistoryModal(turbine, pushToHistory = true) {
  historyModalTurbine.value = turbine
  historyModalData.value = []
  historyModalLoading.value = true

  if (pushToHistory) {
    pushHash(`#equipment=${turbine.id}/history`)
  }

  // Try to fetch from API; fall back to local store data on any error
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
    console.warn('[maintenance-history] API fetch failed, using local data:', err?.message)
  }

  // Local fallback (always available)
  historyModalData.value = getMaintenanceHistory(turbine.id)
  historyModalLoading.value = false
}

function closeHistoryModal() {
  historyModalTurbine.value = null
  historyModalData.value = []
  if (selectedTurbine.value) {
    const paramStr = detailMetricKey.value ? `/param=${detailMetricKey.value}` : ''
    pushHash(`#equipment=${selectedTurbine.value.id}${paramStr}`)
  } else {
    pushHash('')
  }
}

function investigateWithAssistant(turbine, record) {
  // Open AI assistant and pre-fill with a rich query about this maintenance record
  assistantOpen.value = true
  chatContextTurbine.value = turbine
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
// Track the turbine currently being discussed so RAG chips can be clickable
const chatContextTurbine = ref(null)

// ── Rotating loading messages ─────────────────────────────────────────────────
const LOADING_MESSAGES = [
  'Fetching user manual…',
  'Reasoning over problem root cause…',
  'Forming a structured plan…',
  'Reviewing maintenance history…',
  'Cross-referencing technical data…',
  'Synthesizing recommendations…',
]
const loadingMessage = ref(LOADING_MESSAGES[0])
let loadingMsgInterval = null

// ── Markdown renderer ─────────────────────────────────────────────────────────
marked.setOptions({ breaks: true })
function renderMarkdown(text) {
  return DOMPurify.sanitize(marked.parse(text || ''))
}

const sampleQuestions = [
  'What are the vibration thresholds for bearing fault detection?',
  'How often should combustion liners be inspected?',
  'What causes high exhaust temperature readings?',
  'Describe the hot gas path inspection procedure.',
]

const API_URL = '/api'

function useQuestion(q) {
  inputText.value = q
  nextTick(() => sendMessage())
}

function toggleAssistant() {
  assistantOpen.value = !assistantOpen.value
}

function openHistoryModalById(turbineId) {
  const turbine = turbines.find(t => t.id === turbineId)
  if (turbine) openHistoryModal(turbine)
}

async function sendMessage() {
  const query = inputText.value.trim()
  if (!query || loading.value) return

  error.value = ''
  messages.value.push({ role: 'user', content: query })
  inputText.value = ''
  loading.value = true
  loadingMessage.value = LOADING_MESSAGES[0]
  let shuffledQueue = []
  loadingMsgInterval = setInterval(() => {
    if (shuffledQueue.length === 0) {
      shuffledQueue = [...Array(LOADING_MESSAGES.length).keys()]
      for (let i = shuffledQueue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffledQueue[i], shuffledQueue[j]] = [shuffledQueue[j], shuffledQueue[i]]
      }
      if (LOADING_MESSAGES[shuffledQueue[0]] === loadingMessage.value && shuffledQueue.length > 1) {
        ;[shuffledQueue[0], shuffledQueue[shuffledQueue.length - 1]] = [shuffledQueue[shuffledQueue.length - 1], shuffledQueue[0]]
      }
    }
    loadingMessage.value = LOADING_MESSAGES[shuffledQueue.shift()]
  }, 3500)
  await scrollToBottom()

  // Build turbine context payload if we have a current turbine in focus
  const ctxTurbine = chatContextTurbine.value
  const turbineContextPayload = ctxTurbine ? {
    id: ctxTurbine.id,
    name: ctxTurbine.name,
    type: ctxTurbine.type,
    location: ctxTurbine.location,
    manualUrl: ctxTurbine.manualUrl,
    maintenanceHistory: Array.isArray(ctxTurbine.maintenanceHistory)
      ? ctxTurbine.maintenanceHistory.slice(0, 6)
      : [],
  } : undefined

  try {
    const res = await fetch(`${API_URL}/ask-assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, turbineContext: turbineContextPayload }),
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
      turbineId: ctxTurbine?.id,
      manualUrl: ctxTurbine?.manualUrl,
    })
  } catch (err) {
    error.value = err.message || 'An unexpected error occurred. Please try again.'
  } finally {
    loading.value = false
    clearInterval(loadingMsgInterval)
    loadingMessage.value = LOADING_MESSAGES[0]
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

  // Restore view from URL hash (sharable links)
  if (location.hash) applyHash()

  // Sync view when the user navigates with browser back/forward
  window.addEventListener('popstate', applyHash)
})

onUnmounted(() => {
  if (updateInterval) clearInterval(updateInterval)
  if (anomalyInterval) clearInterval(anomalyInterval)
  if (loadingMsgInterval) clearInterval(loadingMsgInterval)
  destroyDetailChart()
  window.removeEventListener('popstate', applyHash)
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

.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}

@keyframes pulse-slow {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(20, 184, 166, 0); }
  50% { opacity: 0.9; box-shadow: 0 0 12px 2px rgba(20, 184, 166, 0.3); }
}

@media (prefers-reduced-motion: reduce) {
  .animate-pulse-slow {
    animation: none;
  }
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

.arch-fade-enter-active,
.arch-fade-leave-active {
  transition: opacity 0.25s ease;
}
.arch-fade-enter-from,
.arch-fade-leave-to {
  opacity: 0;
}

/* ── AI message markdown styles ───────────────────────────────────────────── */
.ai-message :deep(h1),
.ai-message :deep(h2),
.ai-message :deep(h3),
.ai-message :deep(h4) {
  font-weight: 700;
  color: #5eead4; /* teal-300 */
  margin-top: 0.75em;
  margin-bottom: 0.35em;
  line-height: 1.3;
}
.ai-message :deep(h1) { font-size: 1em; }
.ai-message :deep(h2) { font-size: 0.95em; }
.ai-message :deep(h3) { font-size: 0.9em; }
.ai-message :deep(h4) { font-size: 0.85em; }

.ai-message :deep(p) {
  margin-bottom: 0.5em;
}
.ai-message :deep(p:last-child) {
  margin-bottom: 0;
}

.ai-message :deep(ul),
.ai-message :deep(ol) {
  padding-left: 1.25em;
  margin-bottom: 0.5em;
}
.ai-message :deep(ul) { list-style-type: disc; }
.ai-message :deep(ol) { list-style-type: decimal; }

.ai-message :deep(li) {
  margin-bottom: 0.25em;
  line-height: 1.5;
}

.ai-message :deep(strong) {
  font-weight: 700;
  color: #f1f5f9; /* slate-100 */
}

.ai-message :deep(em) {
  font-style: italic;
  color: #94a3b8; /* slate-400 */
}

.ai-message :deep(code) {
  background: rgba(20, 184, 166, 0.15);
  color: #5eead4;
  border-radius: 0.25rem;
  padding: 0.05em 0.3em;
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 0.875em;
}

.ai-message :deep(pre) {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #374151;
  border-radius: 0.5rem;
  padding: 0.75em 1em;
  overflow-x: auto;
  margin-bottom: 0.5em;
}
.ai-message :deep(pre code) {
  background: none;
  padding: 0;
  color: #e2e8f0;
}

.ai-message :deep(hr) {
  border: none;
  border-top: 1px solid #374151;
  margin: 0.75em 0;
}

.ai-message :deep(blockquote) {
  border-left: 3px solid #14b8a6;
  padding-left: 0.75em;
  color: #94a3b8;
  margin: 0.5em 0;
}

.ai-message :deep(a) {
  color: #5eead4;
  text-decoration: underline;
}

/* First child should have no top margin */
.ai-message :deep(> *:first-child) {
  margin-top: 0;
}
</style>
