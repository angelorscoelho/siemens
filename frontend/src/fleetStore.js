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

// ── Thresholds for alerts ─────────────────────────────────────────────────────
export const thresholds = {
  exhaustTemp: { warning: 590, critical: 630 },
  vibration: { warning: 4.0, critical: 7.0 },
}

// ── Helper: Generate initial vibration history ────────────────────────────────
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

// ── Random Walk Simulator (realistic continuity) ──────────────────────────────
export function randomWalk(current, step, min, max) {
  const drift = (Math.random() - 0.5) * step
  let newVal = current + drift
  // Mean-reversion tendency
  const mid = (min + max) / 2
  newVal += (mid - current) * 0.001
  return Math.max(min, Math.min(max, newVal))
}

// ── Equipment image generator (inline SVG data URIs — no external dependency) ─
function makeEquipmentImage(name, color) {
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

// ── Fleet Data — 6 Distinct Assets ────────────────────────────────────────────
export function createFleetData() {
  return [
    {
      id: 'GT-01',
      name: 'SGT5-8000H',
      type: 'H-class Heavy-Duty Gas Turbine',
      description: '375 MW combined cycle flagship',
      location: 'Plant Alpha — Berlin, DE',
      imageUrl: makeEquipmentImage('SGT5-8000H', '#2dd4bf'),
      status: 'Operational',
      currentStatus: 'Operational',
      telemetryBaseline: { exhaustTemp: 560, vibration: 1.2, shaftSpeed: 3000 },
      exhaustTemp: 545.2,
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
      id: 'GT-02',
      name: 'SST-400',
      type: 'Industrial Steam Turbine',
      description: '65 MW mechanical drive & power generation steam turbine',
      location: 'Plant Beta — Houston, TX',
      imageUrl: makeEquipmentImage('SST-400', '#fbbf24'),
      status: 'Warning',
      currentStatus: 'Warning',
      telemetryBaseline: { exhaustTemp: 520, vibration: 2.0, shaftSpeed: 3600 },
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
      id: 'GT-03',
      name: 'SGT-800',
      type: 'Industrial Gas Turbine',
      description: '53 MW high-efficiency mid-range unit',
      location: 'Plant Gamma — Riyadh, SA',
      imageUrl: makeEquipmentImage('SGT-800', '#2dd4bf'),
      status: 'Operational',
      currentStatus: 'Operational',
      telemetryBaseline: { exhaustTemp: 540, vibration: 0.9, shaftSpeed: 6608 },
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
      id: 'GT-04',
      name: 'SST-600',
      type: 'Industrial Steam Turbine',
      description: '150 MW extraction/condensing steam turbine',
      location: 'Plant Delta — Rotterdam, NL',
      imageUrl: makeEquipmentImage('SST-600', '#2dd4bf'),
      status: 'Operational',
      currentStatus: 'Operational',
      telemetryBaseline: { exhaustTemp: 460, vibration: 1.5, shaftSpeed: 6100 },
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
        { title: 'Operational Profile', content: 'Baseload duty — averaging 4 starts/day. Total starts: 12,400. Hot section life limit: 25,000 equivalent operating hours.' },
        { title: 'Last Hot Section Inspection', content: '2025-09-01 at 12,000 hrs. Turbine blades within creep limits. Next HSI at 20,000 hrs.' },
        { title: 'Steam System', content: 'Main steam pressure: 140 bar. Reheat steam: 40 bar. Extraction for process heat at 10 bar.' },
      ],
      aiSuggestion: '',
    },
    {
      id: 'GT-05',
      name: 'SGT-750',
      type: 'Aeroderivative Gas Turbine',
      description: '37 MW fast-start peaker unit',
      location: 'Plant Epsilon — Lagos, NG',
      imageUrl: makeEquipmentImage('SGT-750', '#fbbf24'),
      status: 'Warning',
      currentStatus: 'Warning',
      telemetryBaseline: { exhaustTemp: 530, vibration: 1.8, shaftSpeed: 9500 },
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
      id: 'GT-06',
      name: 'SGT-A65',
      type: 'Aeroderivative Gas Turbine',
      description: '67 MW fast-response grid stabilization',
      location: 'Plant Zeta — Yokohama, JP',
      imageUrl: makeEquipmentImage('SGT-A65', '#f87171'),
      status: 'Critical',
      currentStatus: 'Critical',
      telemetryBaseline: { exhaustTemp: 550, vibration: 1.5, shaftSpeed: 3600 },
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
