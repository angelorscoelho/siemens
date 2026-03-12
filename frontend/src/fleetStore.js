// ══════════════════════════════════════════════════════════════════════════════
// Fleet Data Store — Centralized asset library for the Fleet Overview Dashboard
// ══════════════════════════════════════════════════════════════════════════════

// ── Metric Parameters Definition ──────────────────────────────────────────────
export const metricParams = [
  { key: 'exhaustTemp', label: 'Exhaust Temperature', unit: '°C', decimals: 1 },
  { key: 'shaftSpeed', label: 'Shaft Speed', unit: 'RPM', decimals: 1 },
  { key: 'vibration', label: 'Vibration', unit: 'mm/s', decimals: 3 },
  { key: 'powerOutput', label: 'Power Output', unit: 'MW', decimals: 2 },
  { key: 'fuelFlow', label: 'Fuel Flow', unit: 'kg/s', decimals: 3 },
  { key: 'hoursSinceOverhaul', label: 'Hours Since Overhaul', unit: 'h', decimals: 0 },
]

// Metrics to track in history (all except hoursSinceOverhaul which is cumulative)
export const historyMetricKeys = ['exhaustTemp', 'shaftSpeed', 'vibration', 'powerOutput', 'fuelFlow']

// ── Thresholds for alerts ─────────────────────────────────────────────────────
export const thresholds = {
  exhaustTemp: { warning: 590, critical: 630 },
  vibration: { warning: 4.0, critical: 7.0 },
}

// ── Helper: Generate metric history values ────────────────────────────────────
export function generateInitialHistory(baseValue, volatility, count) {
  const history = []
  let val = baseValue
  for (let i = 0; i < count; i++) {
    val += (Math.random() - 0.5) * volatility * 0.3
    val = Math.max(0.1, val)
    history.push(val)
  }
  return history
}

// ── Generate metric history for all tracked params ─────────────────────────────
function generateAllHistories(baseline, count = 60) {
  return {
    exhaustTemp: generateInitialHistory(baseline.exhaustTemp, 8, count),
    shaftSpeed: generateInitialHistory(baseline.shaftSpeed, 30, count),
    vibration: generateInitialHistory(baseline.vibration, 0.15, count),
    powerOutput: generateInitialHistory(baseline.powerOutput, 2, count),
    fuelFlow: generateInitialHistory(baseline.fuelFlow, 0.1, count),
  }
}

// ── Random Walk Simulator (realistic continuity) ──────────────────────────────
export function randomWalk(current, step, min, max) {
  const drift = (Math.random() - 0.5) * step
  let newVal = current + drift
  const mid = (min + max) / 2
  newVal += (mid - current) * 0.001
  return Math.max(min, Math.min(max, newVal))
}

// ── Equipment image: use downloaded real photo, fall back to inline SVG ────────
// Slot numbers match the catalogue in scripts/fetch-images.mjs (1-indexed).
// The browser will try the downloaded image first; EquipmentCard.vue handles
// load errors by showing the inline SVG fallback.
const IMAGE_SLOTS = [
  '/images/turbine-01.jpg',
  '/images/turbine-02.jpg',
  '/images/turbine-03.jpg',
  '/images/turbine-04.jpg',
  '/images/turbine-05.jpg',
  '/images/turbine-06.jpg',
  '/images/turbine-07.jpg',
  '/images/turbine-08.jpg',
  '/images/turbine-09.jpg',
  '/images/turbine-10.jpg',
  '/images/turbine-11.jpg',
  '/images/turbine-12.jpg',
  '/images/turbine-13.jpg',
  '/images/turbine-14.jpg',
  '/images/turbine-15.jpg',
  '/images/turbine-16.jpg',
  '/images/turbine-17.jpg',
  '/images/turbine-18.jpg',
]

function makeEquipmentImage(name, color, slotIndex) {
  // Prefer the real photo downloaded at build time; onError in EquipmentCard falls back to SVG
  if (slotIndex >= 0 && slotIndex < IMAGE_SLOTS.length) {
    return IMAGE_SLOTS[slotIndex]
  }
  return makeSvgImage(name, color)
}

// ── Inline SVG fallback (used when photo is unavailable) ─────────────────────
function makeSvgImage(name, color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <rect fill="#0f172a" width="200" height="200" rx="8"/>
    <rect x="40" y="30" width="120" height="100" rx="6" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.5"/>
    <circle cx="100" cy="75" r="30" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.4"/>
    <line x1="70" y1="75" x2="130" y2="75" stroke="${color}" stroke-width="1" opacity="0.3"/>
    <line x1="100" y1="45" x2="100" y2="105" stroke="${color}" stroke-width="1" opacity="0.3"/>
    <path d="M85 65 L100 50 L115 65" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.6"/>
    <path d="M85 85 L100 100 L115 85" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.6"/>
    <text fill="${color}" font-family="system-ui,sans-serif" font-size="14" font-weight="bold" text-anchor="middle" x="100" y="155">${name}</text>
    <text fill="#64748b" font-family="system-ui,sans-serif" font-size="10" text-anchor="middle" x="100" y="175">SIEMENS ENERGY</text>
  </svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

// ── Determine most critical metric key for a turbine ──────────────────────────
export function getMostCriticalMetricKey(turbine) {
  if (turbine.vibration > thresholds.vibration.critical) return 'vibration'
  if (turbine.exhaustTemp > thresholds.exhaustTemp.critical) return 'exhaustTemp'
  if (turbine.vibration > thresholds.vibration.warning) return 'vibration'
  if (turbine.exhaustTemp > thresholds.exhaustTemp.warning) return 'exhaustTemp'
  return 'exhaustTemp'
}

// ── Fleet Data — 18 Distinct Real-World Assets ────────────────────────────────
export function createFleetData() {
  return [
    // ── 1. SGT5-8000H ─────────────────────────────────────────────────────────
    {
      id: 'GT-01',
      name: 'SGT5-8000H',
      type: 'H-class Heavy-Duty Gas Turbine',
      description: '375 MW combined cycle flagship',
      location: 'Plant Alpha — Berlin, DE',
      imageUrl: makeEquipmentImage('SGT5-8000H', '#2dd4bf', 0),
      manualUrl: 'https://www.siemens-energy.com/global/en/home/products-services/product/sgt5-8000h.html',
      status: 'OK',
      currentStatus: 'OK',
      telemetryBaseline: { exhaustTemp: 560, vibration: 1.2, shaftSpeed: 3000, powerOutput: 340, fuelFlow: 14.8 },
      exhaustTemp: 545.2,
      shaftSpeed: 3000.0,
      vibration: 1.245,
      hoursSinceOverhaul: 8420,
      fuelFlow: 14.832,
      powerOutput: 340.25,
      tempAlert: false,
      vibrationAlert: false,
      alert: null,
      metricHistory: generateAllHistories({ exhaustTemp: 545, shaftSpeed: 3000, vibration: 1.2, powerOutput: 340, fuelFlow: 14.8 }),
      documentation: [
        { title: 'Last Inspection — 2025-12-10', content: 'Hot gas path inspection completed. All combustion liners within tolerance. Next scheduled: 2026-06-10.' },
        { title: 'Bearing Service Log', content: 'Bearing #1-#5 lubrication system checked. Oil quality nominal. Vibration baseline: 1.2 mm/s.' },
        { title: 'Combustion System', content: '16-can combustion system. DLE (Dry Low Emission) burners last replaced at 6,000 hrs. Next replacement at 12,000 hrs.' },
      ],
      aiSuggestion: '',
    },
    // ── 2. SST-400 ────────────────────────────────────────────────────────────
    {
      id: 'ST-01',
      name: 'SST-400',
      type: 'Industrial Steam Turbine',
      description: '65 MW mechanical drive & power generation steam turbine',
      location: 'Plant Beta — Houston, TX',
      imageUrl: makeEquipmentImage('SST-400', '#fbbf24', 1),
      manualUrl: 'https://www.siemens-energy.com/global/en/home/products-services/product/steam-turbines/sst-400.html',
      status: 'RISK',
      currentStatus: 'RISK',
      telemetryBaseline: { exhaustTemp: 520, vibration: 2.0, shaftSpeed: 3600, powerOutput: 198, fuelFlow: 11.4 },
      exhaustTemp: 608.7,
      shaftSpeed: 3600.0,
      vibration: 4.712,
      hoursSinceOverhaul: 23810,
      fuelFlow: 11.438,
      powerOutput: 198.45,
      tempAlert: true,
      vibrationAlert: true,
      alert: 'High vibration detected on bearing #3. Maintenance recommended within 48 h.',
      metricHistory: generateAllHistories({ exhaustTemp: 608, shaftSpeed: 3600, vibration: 4.7, powerOutput: 198, fuelFlow: 11.4 }),
      documentation: [
        { title: 'Alert — Vibration Exceedance', content: 'Bearing #3 vibration exceeded 4.5 mm/s threshold at 2026-03-10 14:32 UTC. Trending upward over 72 hrs.' },
        { title: 'Maintenance History', content: 'Last major overhaul: 2024-01-15 at 18,000 hrs. Blade row 1 replacement completed. Compressor wash performed monthly.' },
        { title: 'Operational Notes', content: 'Unit operates in peaking duty cycle. Frequent start/stop cycles contribute to increased thermal fatigue on hot gas path components.' },
      ],
      aiSuggestion: 'Bearing #3 vibration is trending above 4.5 mm/s. Schedule vibration analysis and bearing inspection within 48 hours to prevent potential rotor imbalance damage.',
    },
    // ── 3. SGT-800 ────────────────────────────────────────────────────────────
    {
      id: 'GT-02',
      name: 'SGT-800',
      type: 'Industrial Gas Turbine',
      description: '53 MW high-efficiency mid-range unit',
      location: 'Plant Gamma — Riyadh, SA',
      imageUrl: makeEquipmentImage('SGT-800', '#2dd4bf', 2),
      manualUrl: 'https://www.siemens-energy.com/global/en/home/products-services/product/sgt-800.html',
      status: 'OK',
      currentStatus: 'OK',
      telemetryBaseline: { exhaustTemp: 540, vibration: 0.9, shaftSpeed: 6608, powerOutput: 48, fuelFlow: 3.6 },
      exhaustTemp: 545.2,
      shaftSpeed: 6608.0,
      vibration: 0.892,
      hoursSinceOverhaul: 5200,
      fuelFlow: 3.654,
      powerOutput: 48.92,
      tempAlert: false,
      vibrationAlert: false,
      alert: null,
      metricHistory: generateAllHistories({ exhaustTemp: 545, shaftSpeed: 6608, vibration: 0.9, powerOutput: 48, fuelFlow: 3.6 }),
      documentation: [
        { title: 'Commissioning Date', content: 'Unit commissioned 2025-06-20. Running on natural gas. Dual-fuel capability available.' },
        { title: 'Performance Log', content: 'Heat rate: 9,480 kJ/kWh. Efficiency: 38.0%. All parameters within design envelope.' },
        { title: 'Filter Status', content: 'Inlet air filtration system — Stage 1 & 2 filters replaced 2026-01-15. Differential pressure nominal.' },
      ],
      aiSuggestion: '',
    },
    // ── 4. SST-600 ────────────────────────────────────────────────────────────
    {
      id: 'ST-02',
      name: 'SST-600',
      type: 'Industrial Steam Turbine',
      description: '150 MW extraction/condensing steam turbine',
      location: 'Plant Delta — Rotterdam, NL',
      imageUrl: makeEquipmentImage('SST-600', '#2dd4bf', 3),
      manualUrl: 'https://www.siemens-energy.com/global/en/home/products-services/product/steam-turbines/sst-600.html',
      status: 'OK',
      currentStatus: 'OK',
      telemetryBaseline: { exhaustTemp: 460, vibration: 1.5, shaftSpeed: 6100, powerOutput: 35, fuelFlow: 2.9 },
      exhaustTemp: 468.3,
      shaftSpeed: 6100.0,
      vibration: 1.534,
      hoursSinceOverhaul: 15600,
      fuelFlow: 2.987,
      powerOutput: 35.18,
      tempAlert: false,
      vibrationAlert: false,
      alert: null,
      metricHistory: generateAllHistories({ exhaustTemp: 468, shaftSpeed: 6100, vibration: 1.5, powerOutput: 35, fuelFlow: 2.9 }),
      documentation: [
        { title: 'Operational Profile', content: 'Baseload continuous duty — high availability operation. Steam extraction for process heat and power co-generation. Annual planned outage for inspection.' },
        { title: 'Last Hot Section Inspection', content: '2025-09-01 at 12,000 hrs. Turbine blades within creep limits. Next HSI at 20,000 hrs.' },
        { title: 'Steam System', content: 'Main steam pressure: 140 bar. Reheat steam: 40 bar. Extraction for process heat at 10 bar.' },
      ],
      aiSuggestion: '',
    },
    // ── 5. SGT-750 ────────────────────────────────────────────────────────────
    {
      id: 'GT-03',
      name: 'SGT-750',
      type: 'Aeroderivative Gas Turbine',
      description: '37 MW fast-start peaker unit',
      location: 'Plant Epsilon — Lagos, NG',
      imageUrl: makeEquipmentImage('SGT-750', '#fbbf24', 4),
      manualUrl: 'https://www.siemens-energy.com/global/en/home/products-services/product/sgt-750.html',
      status: 'RISK',
      currentStatus: 'RISK',
      telemetryBaseline: { exhaustTemp: 530, vibration: 1.8, shaftSpeed: 9500, powerOutput: 12, fuelFlow: 1.6 },
      exhaustTemp: 594.8,
      shaftSpeed: 9500.0,
      vibration: 3.876,
      hoursSinceOverhaul: 28900,
      fuelFlow: 1.623,
      powerOutput: 12.14,
      tempAlert: true,
      vibrationAlert: false,
      alert: 'Exhaust temperature trending high. Combustion inspection advised within 7 days.',
      metricHistory: generateAllHistories({ exhaustTemp: 594, shaftSpeed: 9500, vibration: 3.8, powerOutput: 12, fuelFlow: 1.6 }),
      documentation: [
        { title: 'Alert — Exhaust Temp Trend', content: 'Exhaust temperature has increased ~15°C over the last 30 days. Potential combustion liner degradation or fuel nozzle fouling.' },
        { title: 'Overhaul Status', content: 'Unit approaching 30,000 hr major overhaul interval. Last overhaul: 2023-05-20. Recommend scheduling during next planned outage.' },
        { title: 'Environmental', content: 'Operating in high-ambient (45°C) conditions. Inlet cooling system active. Dust ingestion filters on accelerated replacement schedule.' },
      ],
      aiSuggestion: 'Exhaust temperature trending 15°C above baseline over 30 days. Inspect combustion liners and fuel nozzles for fouling or degradation before the next load increase.',
    },
    // ── 6. SGT-A65 ───────────────────────────────────────────────────────────
    {
      id: 'GT-04',
      name: 'SGT-A65',
      type: 'Aeroderivative Gas Turbine',
      description: '67 MW fast-response grid stabilization',
      location: 'Plant Zeta — Yokohama, JP',
      imageUrl: makeEquipmentImage('SGT-A65', '#f87171', 5),
      manualUrl: 'https://www.siemens-energy.com/global/en/home/products-services/product/sgt-a65.html',
      status: 'NOK',
      currentStatus: 'NOK',
      telemetryBaseline: { exhaustTemp: 550, vibration: 1.5, shaftSpeed: 3600, powerOutput: 58, fuelFlow: 5.4 },
      exhaustTemp: 651.3,
      shaftSpeed: 3600.0,
      vibration: 7.234,
      hoursSinceOverhaul: 31200,
      fuelFlow: 5.412,
      powerOutput: 58.67,
      tempAlert: true,
      vibrationAlert: true,
      alert: 'CRITICAL: Vibration exceeds 7.0 mm/s on bearing #2. Immediate shutdown recommended.',
      metricHistory: generateAllHistories({ exhaustTemp: 651, shaftSpeed: 3600, vibration: 7.2, powerOutput: 58, fuelFlow: 5.4 }),
      documentation: [
        { title: 'CRITICAL ALERT — Vibration', content: 'Bearing #2 vibration spiked to 7.2 mm/s at 2026-03-11 08:15 UTC. Trip threshold: 8.0 mm/s. Immediate inspection required.' },
        { title: 'Overhaul Overdue', content: 'Unit at 31,200 hours — 1,200 hours past recommended major overhaul interval of 30,000 hours. Deferred due to grid demand constraints.' },
        { title: 'Previous Incidents', content: '2025-08-14: Compressor blade tip rub event. Repaired in-situ. 2025-11-02: Fuel nozzle #4 replaced due to carbon buildup.' },
      ],
      aiSuggestion: 'URGENT: Vibration at 7.2 mm/s on bearing #2 approaching trip threshold. Initiate controlled shutdown and perform emergency bearing inspection to prevent catastrophic rotor damage.',
    },
    // ── 7. SGT5-4000F ─────────────────────────────────────────────────────────
    {
      id: 'GT-05',
      name: 'SGT5-4000F',
      type: 'F-class Heavy-Duty Gas Turbine',
      description: '292 MW advanced F-class gas turbine',
      location: 'Plant Eta — Madrid, ES',
      imageUrl: makeEquipmentImage('SGT5-4000F', '#2dd4bf', 6),
      manualUrl: 'https://www.siemens-energy.com/global/en/home/products-services/product/sgt5-4000f.html',
      status: 'OK',
      currentStatus: 'OK',
      telemetryBaseline: { exhaustTemp: 545, vibration: 1.1, shaftSpeed: 3000, powerOutput: 288, fuelFlow: 12.1 },
      exhaustTemp: 542.7,
      shaftSpeed: 3000.0,
      vibration: 1.124,
      hoursSinceOverhaul: 6850,
      fuelFlow: 12.087,
      powerOutput: 287.6,
      tempAlert: false,
      vibrationAlert: false,
      alert: null,
      metricHistory: generateAllHistories({ exhaustTemp: 542, shaftSpeed: 3000, vibration: 1.1, powerOutput: 288, fuelFlow: 12.1 }),
      documentation: [
        { title: 'Performance Data', content: 'Electrical efficiency: 39.8%. Heat rate: 9,045 kJ/kWh. Operating at 98.6% rated load. All KPIs within design envelope.' },
        { title: 'Maintenance Schedule', content: 'Combustion inspection due at 8,000 hrs (1,150 hrs remaining). Hot gas path inspection at 16,000 hrs.' },
        { title: 'Emissions', content: 'NOx: 25 ppm (within 42 ppm limit). CO: 8 ppm. DLE combustion system fully operational.' },
      ],
      aiSuggestion: '',
    },
    // ── 8. SGT6-5000F ─────────────────────────────────────────────────────────
    {
      id: 'GT-06',
      name: 'SGT6-5000F',
      type: 'F-class Gas Turbine (60 Hz)',
      description: '232 MW 60 Hz grid-connected gas turbine',
      location: 'Plant Theta — Chicago, IL',
      imageUrl: makeEquipmentImage('SGT6-5000F', '#fbbf24', 7),
      manualUrl: 'https://www.siemens-energy.com/global/en/home/products-services/product/sgt6-5000f.html',
      status: 'RISK',
      currentStatus: 'RISK',
      telemetryBaseline: { exhaustTemp: 538, vibration: 2.2, shaftSpeed: 3600, powerOutput: 228, fuelFlow: 9.8 },
      exhaustTemp: 603.1,
      shaftSpeed: 3600.0,
      vibration: 4.018,
      hoursSinceOverhaul: 19200,
      fuelFlow: 9.734,
      powerOutput: 225.3,
      tempAlert: true,
      vibrationAlert: true,
      alert: 'Elevated exhaust temperature (603°C) and vibration trending up. Inspection within 72 h advised.',
      metricHistory: generateAllHistories({ exhaustTemp: 603, shaftSpeed: 3600, vibration: 4.0, powerOutput: 225, fuelFlow: 9.7 }),
      documentation: [
        { title: 'Alert Summary', content: 'Exhaust temperature 23°C above warning threshold. Vibration on bearing #4 trending: 2.8→4.0 mm/s over 14 days.' },
        { title: 'Maintenance Record', content: 'Last combustion inspection: 2025-06-18 at 16,800 hrs. Fuel nozzles cleaned, liners in good condition.' },
        { title: 'Grid Obligations', content: 'Unit provides 200 MW firm capacity to MISO grid. Any derating requires 48 h advance notice to grid operator.' },
      ],
      aiSuggestion: 'Both exhaust temperature and vibration are elevated simultaneously. Initiate scheduled outage for combustion and bearing inspection. Do not defer beyond 72 hours.',
    },
    // ── 9. SGT-700 ────────────────────────────────────────────────────────────
    {
      id: 'GT-07',
      name: 'SGT-700',
      type: 'Industrial Gas Turbine',
      description: '32.8 MW mechanical drive and power generation',
      location: 'Plant Iota — Abu Dhabi, AE',
      imageUrl: makeEquipmentImage('SGT-700', '#2dd4bf', 8),
      manualUrl: 'https://www.siemens-energy.com/global/en/home/products-services/product/sgt-700.html',
      status: 'OK',
      currentStatus: 'OK',
      telemetryBaseline: { exhaustTemp: 524, vibration: 1.0, shaftSpeed: 7700, powerOutput: 31, fuelFlow: 2.2 },
      exhaustTemp: 522.4,
      shaftSpeed: 7700.0,
      vibration: 0.983,
      hoursSinceOverhaul: 11200,
      fuelFlow: 2.198,
      powerOutput: 31.05,
      tempAlert: false,
      vibrationAlert: false,
      alert: null,
      metricHistory: generateAllHistories({ exhaustTemp: 522, shaftSpeed: 7700, vibration: 1.0, powerOutput: 31, fuelFlow: 2.2 }),
      documentation: [
        { title: 'Operational Profile', content: 'Driving a natural gas pipeline compressor. Continuous baseload duty at 95% rated speed. Fuel: pipeline quality gas.' },
        { title: 'Last Inspection', content: '2025-08-12 at 8,000 hrs. All hot gas path components within tolerance. Blades show minimal wear.' },
        { title: 'Lube Oil System', content: 'Oil analysis: viscosity 31.4 cSt (ISO VG 32 spec: 28.8–35.2). No contamination detected. Next change at 12,000 hrs.' },
      ],
      aiSuggestion: '',
    },
    // ── 10. SGT-600 ───────────────────────────────────────────────────────────
    {
      id: 'GT-08',
      name: 'SGT-600',
      type: 'Industrial Gas Turbine',
      description: '24.8 MW twin-shaft industrial gas turbine',
      location: 'Plant Kappa — Kuala Lumpur, MY',
      imageUrl: makeEquipmentImage('SGT-600', '#2dd4bf', 9),
      manualUrl: 'https://www.siemens-energy.com/global/en/home/products-services/product/sgt-600.html',
      status: 'OK',
      currentStatus: 'OK',
      telemetryBaseline: { exhaustTemp: 516, vibration: 1.3, shaftSpeed: 8500, powerOutput: 24, fuelFlow: 1.7 },
      exhaustTemp: 514.8,
      shaftSpeed: 8500.0,
      vibration: 1.287,
      hoursSinceOverhaul: 7800,
      fuelFlow: 1.698,
      powerOutput: 24.31,
      tempAlert: false,
      vibrationAlert: false,
      alert: null,
      metricHistory: generateAllHistories({ exhaustTemp: 514, shaftSpeed: 8500, vibration: 1.3, powerOutput: 24, fuelFlow: 1.7 }),
      documentation: [
        { title: 'Application', content: 'Power generation for industrial complex. Operates in combined heat and power (CHP) mode. Steam recovered for process use.' },
        { title: 'Air Filtration', content: 'High-humidity tropical environment. Coalescing pre-filter + HEPA installed. Differential pressure nominal at 18 mbar.' },
        { title: 'Compressor Washes', content: 'Online water wash performed weekly. Last offline wash: 2025-12-01. Compressor efficiency: 88.3% (design: 88.0%).' },
      ],
      aiSuggestion: '',
    },
    // ── 11. SGT-400 ───────────────────────────────────────────────────────────
    {
      id: 'GT-09',
      name: 'SGT-400',
      type: 'Industrial Gas Turbine',
      description: '13.4 MW compact industrial gas turbine',
      location: 'Plant Lambda — Oslo, NO',
      imageUrl: makeEquipmentImage('SGT-400', '#2dd4bf', 10),
      manualUrl: 'https://www.siemens-energy.com/global/en/home/products-services/product/sgt-400.html',
      status: 'OK',
      currentStatus: 'OK',
      telemetryBaseline: { exhaustTemp: 505, vibration: 0.8, shaftSpeed: 14700, powerOutput: 13, fuelFlow: 0.92 },
      exhaustTemp: 504.1,
      shaftSpeed: 14700.0,
      vibration: 0.814,
      hoursSinceOverhaul: 3400,
      fuelFlow: 0.921,
      powerOutput: 13.08,
      tempAlert: false,
      vibrationAlert: false,
      alert: null,
      metricHistory: generateAllHistories({ exhaustTemp: 504, shaftSpeed: 14700, vibration: 0.8, powerOutput: 13, fuelFlow: 0.92 }),
      documentation: [
        { title: 'Application', content: 'Offshore platform power generation. Classified for hazardous area (Zone 2). Dual-fuel capable: natural gas + diesel backup.' },
        { title: 'Recent Service', content: 'Combustion inspection completed 2025-11-20 at 2,800 hrs. All fuel nozzles cleaned. Cross-fire tubes replaced.' },
        { title: 'Environmental', content: 'Operating in salt-laden marine environment. Inlet filtration: two-stage separator + HEPA. Corrosion protection active.' },
      ],
      aiSuggestion: '',
    },
    // ── 12. SST-800 ───────────────────────────────────────────────────────────
    {
      id: 'ST-03',
      name: 'SST-800',
      type: 'Industrial Steam Turbine',
      description: '250 MW high-pressure steam turbine',
      location: 'Plant Mu — Singapore, SG',
      imageUrl: makeEquipmentImage('SST-800', '#2dd4bf', 11),
      manualUrl: 'https://www.siemens-energy.com/global/en/home/products-services/product/steam-turbines/sst-800.html',
      status: 'OK',
      currentStatus: 'OK',
      telemetryBaseline: { exhaustTemp: 480, vibration: 1.6, shaftSpeed: 3000, powerOutput: 245, fuelFlow: 8.9 },
      exhaustTemp: 478.5,
      shaftSpeed: 3000.0,
      vibration: 1.612,
      hoursSinceOverhaul: 12400,
      fuelFlow: 8.876,
      powerOutput: 245.8,
      tempAlert: false,
      vibrationAlert: false,
      alert: null,
      metricHistory: generateAllHistories({ exhaustTemp: 478, shaftSpeed: 3000, vibration: 1.6, powerOutput: 245, fuelFlow: 8.9 }),
      documentation: [
        { title: 'Plant Configuration', content: 'Part of a 750 MW combined cycle plant. HP turbine inlet: 165 bar / 565°C. Reheated steam: 40 bar / 565°C.' },
        { title: 'Blade Inspection', content: 'Last blade inspection at 10,000 hrs (2025-07-30). Stage 1-3 blades within creep limits. Erosion shields intact.' },
        { title: 'Steam Quality', content: 'Cation conductivity: 0.08 μS/cm (limit: 0.15 μS/cm). Sodium: <2 ppb. Chemistry fully within IAPWS guidelines.' },
      ],
      aiSuggestion: '',
    },
    // ── 13. SST-300 ───────────────────────────────────────────────────────────
    {
      id: 'ST-04',
      name: 'SST-300',
      type: 'Industrial Steam Turbine',
      description: '50 MW backpressure steam turbine for CHP',
      location: 'Plant Nu — Mumbai, IN',
      imageUrl: makeEquipmentImage('SST-300', '#fbbf24', 12),
      manualUrl: 'https://www.siemens-energy.com/global/en/home/products-services/product/steam-turbines/sst-300.html',
      status: 'RISK',
      currentStatus: 'RISK',
      telemetryBaseline: { exhaustTemp: 430, vibration: 3.1, shaftSpeed: 5500, powerOutput: 47, fuelFlow: 3.8 },
      exhaustTemp: 596.4,
      shaftSpeed: 5500.0,
      vibration: 3.142,
      hoursSinceOverhaul: 22500,
      fuelFlow: 3.812,
      powerOutput: 47.23,
      tempAlert: true,
      vibrationAlert: false,
      alert: 'Steam inlet temperature elevated at 596°C. Review boiler controls and steam quality.',
      metricHistory: generateAllHistories({ exhaustTemp: 596, shaftSpeed: 5500, vibration: 3.1, powerOutput: 47, fuelFlow: 3.8 }),
      documentation: [
        { title: 'Alert — Steam Temperature', content: 'Steam inlet temperature 16°C above normal operating range. Boiler superheat control valve position deviation detected.' },
        { title: 'Last Service', content: 'Overhaul completed 2023-09-10 at 18,000 hrs. All blades replaced. Seals and bearings renewed.' },
        { title: 'Process Integration', content: 'Backpressure steam (10 bar) supplies refinery process heat. Any trip would impact production output.' },
      ],
      aiSuggestion: 'Steam inlet temperature elevated. Verify boiler superheat control valve and check steam quality parameters. Monitor for further increase.',
    },
    // ── 14. SGen-1000A ────────────────────────────────────────────────────────
    {
      id: 'GEN-01',
      name: 'SGen-1000A',
      type: 'Hydrogen-Cooled Synchronous Generator',
      description: '1,500 MVA air/hydrogen cooled generator',
      location: 'Plant Xi — São Paulo, BR',
      imageUrl: makeEquipmentImage('SGen-1000A', '#2dd4bf', 13),
      manualUrl: 'https://www.siemens-energy.com/global/en/home/products-services/product/generators/sgen-1000a.html',
      status: 'OK',
      currentStatus: 'OK',
      telemetryBaseline: { exhaustTemp: 75, vibration: 0.6, shaftSpeed: 3600, powerOutput: 1420, fuelFlow: 0.1 },
      exhaustTemp: 74.3,
      shaftSpeed: 3600.0,
      vibration: 0.612,
      hoursSinceOverhaul: 18600,
      fuelFlow: 0.09,
      powerOutput: 1418.5,
      tempAlert: false,
      vibrationAlert: false,
      alert: null,
      metricHistory: generateAllHistories({ exhaustTemp: 74, shaftSpeed: 3600, vibration: 0.6, powerOutput: 1418, fuelFlow: 0.09 }),
      documentation: [
        { title: 'Operating Parameters', content: 'Hydrogen pressure: 3.5 bar. Purity: 99.8%. Stator cooling water temperature: 40°C. Field current: 4,200 A.' },
        { title: 'Insulation', content: 'Stator winding insulation resistance: 1,200 MΩ (limit: 200 MΩ). Polarization index: 2.8. No partial discharge activity.' },
        { title: 'Cooling System', content: 'Hydrogen cooler inlet temp: 32°C. Water coolers in service. Hydrogen dryer function nominal.' },
      ],
      aiSuggestion: '',
    },
    // ── 15. SGT-100 ───────────────────────────────────────────────────────────
    {
      id: 'GT-10',
      name: 'SGT-100',
      type: 'Small Industrial Gas Turbine',
      description: '5.1 MW compact single-shaft gas turbine',
      location: 'Plant Omicron — Cairo, EG',
      imageUrl: makeEquipmentImage('SGT-100', '#2dd4bf', 14),
      manualUrl: 'https://www.siemens-energy.com/global/en/home/products-services/product/sgt-100.html',
      status: 'OK',
      currentStatus: 'OK',
      telemetryBaseline: { exhaustTemp: 495, vibration: 0.7, shaftSpeed: 17400, powerOutput: 5.0, fuelFlow: 0.36 },
      exhaustTemp: 493.8,
      shaftSpeed: 17400.0,
      vibration: 0.689,
      hoursSinceOverhaul: 2100,
      fuelFlow: 0.358,
      powerOutput: 5.02,
      tempAlert: false,
      vibrationAlert: false,
      alert: null,
      metricHistory: generateAllHistories({ exhaustTemp: 493, shaftSpeed: 17400, vibration: 0.7, powerOutput: 5.0, fuelFlow: 0.36 }),
      documentation: [
        { title: 'Application', content: 'Remote power generation for water treatment facility. Operated at ISO rated conditions 24/7. No grid connection.' },
        { title: 'Fuel', content: 'Natural gas from pipeline. Wobbe index: 52.4 MJ/m³ (spec: 48–53 MJ/m³). Gas quality trending stable.' },
        { title: 'Annual Inspection', content: 'Next scheduled at 4,000 hrs. Hot section life: 1,900 hrs remaining. Filter replacement due at 2,500 hrs.' },
      ],
      aiSuggestion: '',
    },
    // ── 16. SGT-300 ───────────────────────────────────────────────────────────
    {
      id: 'GT-11',
      name: 'SGT-300',
      type: 'Small Industrial Gas Turbine',
      description: '8.9 MW twin-shaft industrial gas turbine',
      location: 'Plant Pi — Nairobi, KE',
      imageUrl: makeEquipmentImage('SGT-300', '#2dd4bf', 15),
      manualUrl: 'https://www.siemens-energy.com/global/en/home/products-services/product/sgt-300.html',
      status: 'OK',
      currentStatus: 'OK',
      telemetryBaseline: { exhaustTemp: 501, vibration: 0.9, shaftSpeed: 11500, powerOutput: 8.7, fuelFlow: 0.62 },
      exhaustTemp: 499.6,
      shaftSpeed: 11500.0,
      vibration: 0.876,
      hoursSinceOverhaul: 4700,
      fuelFlow: 0.618,
      powerOutput: 8.72,
      tempAlert: false,
      vibrationAlert: false,
      alert: null,
      metricHistory: generateAllHistories({ exhaustTemp: 499, shaftSpeed: 11500, vibration: 0.9, powerOutput: 8.7, fuelFlow: 0.62 }),
      documentation: [
        { title: 'Application', content: 'Hospital campus power backup and peak shaving. Dual-fuel: natural gas primary, LPG backup. Auto-start tested monthly.' },
        { title: 'Generator Connection', content: 'Direct-coupled synchronous generator, 50 Hz, 11 kV. Power factor: 0.85 lagging. Excitation system: brushless.' },
        { title: 'Service History', content: 'Commissioned 2024-02-15. First combustion inspection due at 6,000 hrs (1,300 hrs remaining). No faults logged.' },
      ],
      aiSuggestion: '',
    },
    // ── 17. SGT6-8000H ────────────────────────────────────────────────────────
    {
      id: 'GT-12',
      name: 'SGT6-8000H',
      type: 'H-class Gas Turbine (60 Hz)',
      description: '274 MW 60 Hz H-class flagship unit',
      location: 'Plant Rho — Atlanta, GA',
      imageUrl: makeEquipmentImage('SGT6-8000H', '#f87171', 16),
      manualUrl: 'https://www.siemens-energy.com/global/en/home/products-services/product/sgt6-8000h.html',
      status: 'NOK',
      currentStatus: 'NOK',
      telemetryBaseline: { exhaustTemp: 555, vibration: 1.4, shaftSpeed: 3600, powerOutput: 268, fuelFlow: 11.4 },
      exhaustTemp: 641.8,
      shaftSpeed: 3600.0,
      vibration: 7.891,
      hoursSinceOverhaul: 29800,
      fuelFlow: 11.348,
      powerOutput: 260.4,
      tempAlert: true,
      vibrationAlert: true,
      alert: 'CRITICAL: Vibration 7.9 mm/s & exhaust temp 642°C — immediate shutdown required.',
      metricHistory: generateAllHistories({ exhaustTemp: 641, shaftSpeed: 3600, vibration: 7.9, powerOutput: 260, fuelFlow: 11.3 }),
      documentation: [
        { title: 'CRITICAL — Dual Exceedance', content: 'Both vibration (7.9 mm/s on bearing #1) and exhaust temp (642°C) at critical levels simultaneously. Root cause: suspected hot-section distress.' },
        { title: 'Overhaul Status', content: 'Unit at 29,800 hrs approaching 30,000 hr major overhaul. Hot gas path components showing end-of-life thermal fatigue patterns.' },
        { title: 'Grid Impact', content: 'Unit provides 250 MW to SERC grid. Controlled shutdown coordinated with grid operator. Backup capacity arranged from GT-05.' },
      ],
      aiSuggestion: 'URGENT: Simultaneous critical vibration (7.9 mm/s) and exhaust temperature (642°C) exceedance. Execute immediate controlled shutdown per SOP-GT12-001. Initiate emergency hot-section inspection.',
    },
    // ── 18. SGen-100A ─────────────────────────────────────────────────────────
    {
      id: 'GEN-02',
      name: 'SGen-100A',
      type: 'Air-Cooled Synchronous Generator',
      description: '130 MVA air-cooled two-pole generator',
      location: 'Plant Sigma — Paris, FR',
      imageUrl: makeEquipmentImage('SGen-100A', '#2dd4bf', 17),
      manualUrl: 'https://www.siemens-energy.com/global/en/home/products-services/product/generators/sgen-100a.html',
      status: 'OK',
      currentStatus: 'OK',
      telemetryBaseline: { exhaustTemp: 82, vibration: 0.5, shaftSpeed: 3000, powerOutput: 121, fuelFlow: 0.05 },
      exhaustTemp: 81.7,
      shaftSpeed: 3000.0,
      vibration: 0.498,
      hoursSinceOverhaul: 9200,
      fuelFlow: 0.048,
      powerOutput: 121.4,
      tempAlert: false,
      vibrationAlert: false,
      alert: null,
      metricHistory: generateAllHistories({ exhaustTemp: 81, shaftSpeed: 3000, vibration: 0.5, powerOutput: 121, fuelFlow: 0.05 }),
      documentation: [
        { title: 'Design Data', content: 'Rating: 130 MVA, 50 Hz, 15.75 kV. Power factor: 0.85. Short-circuit ratio: 0.62. Insulation class: F.' },
        { title: 'Bearing Condition', content: 'Drive-end bearing: vibration 0.45 mm/s. Non-drive-end: 0.51 mm/s. Lube oil temperature: 55°C. All within limits.' },
        { title: 'Last Major Inspection', content: '2025-04-22 at 7,200 hrs. Stator winding re-wedged. Rotor balance verified. Exciter diodes all replaced.' },
      ],
      aiSuggestion: '',
    },
  ]
}

// ── Generate Mock Diagnostic Action Plan (Simulated RAG) ──────────────────────
export function generateActionPlan(turbine) {
  const isVibrationCritical = turbine.vibration > thresholds.vibration.critical
  const isExhaustCritical = turbine.exhaustTemp > thresholds.exhaustTemp.critical

  if (isVibrationCritical) {
    return [
      `1. Initiate controlled load reduction on ${turbine.name} ${turbine.type} #${turbine.id}`,
      `2. Verify bearing temperatures and oil pressure on all journal bearings`,
      `3. Cross-reference vibration spectrum data with baseline from last overhaul at ${Math.floor(turbine.hoursSinceOverhaul).toLocaleString()}h`,
      `4. If vibration exceeds 8.0 mm/s, execute emergency shutdown per SOP-${turbine.id}-001`,
      `5. Schedule emergency bearing inspection and rotor balance check within 24 hours`,
      `6. Notify plant operations manager and prepare maintenance crew for potential outage`,
    ]
  }

  if (isExhaustCritical) {
    return [
      `1. Reduce load on ${turbine.name} ${turbine.type} #${turbine.id} to 75% rated capacity immediately`,
      `2. Verify combustion liner temperatures across all cans`,
      `3. Check fuel nozzle spray patterns and fuel gas quality parameters`,
      `4. If temperature continues rising above ${thresholds.exhaustTemp.critical}°C, initiate controlled shutdown`,
      `5. Schedule combustion inspection within 48 hours per maintenance manual Section 9`,
      `6. Review compressor wash schedule — last performed may indicate fouling trend`,
    ]
  }

  return [
    `1. Continue monitoring ${turbine.name} ${turbine.type} #${turbine.id} telemetry at elevated frequency`,
    `2. Review trending data for the last 72 hours to identify degradation patterns`,
    `3. Schedule preventive maintenance review within 7 days`,
  ]
}
