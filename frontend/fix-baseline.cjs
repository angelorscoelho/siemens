const fs = require('fs');

function applyFixes() {
  // --- 1. Fix OverviewDialog.vue ---
  let overview = fs.readFileSync('src/components/OverviewDialog.vue', 'utf8');
  overview = overview.replace("defineEmits(['close', 'refresh'])", "defineEmits(['close', 'refresh', 'open-turbine'])");
  
  // Make items clickable
  overview = overview.replace(
    /<div v-for="t in nokTurbines" :key="t\.id" class="px-4 py-3 bg-gray-950\/80">/g,
    `<div v-for="t in nokTurbines" :key="t.id" class="px-4 py-3 bg-gray-950/80 cursor-pointer hover:bg-gray-900 transition-colors" @click="$emit('open-turbine', t.id, 'NOK')">`
  );
  overview = overview.replace(
    /<div v-for="t in riskTurbines" :key="t\.id" class="px-4 py-3 bg-gray-950\/80">/g,
    `<div v-for="t in riskTurbines" :key="t.id" class="px-4 py-3 bg-gray-950/80 cursor-pointer hover:bg-gray-900 transition-colors" @click="$emit('open-turbine', t.id, 'RISK')">`
  );
  fs.writeFileSync('src/components/OverviewDialog.vue', overview);

  // --- 2. Fix EquipmentCard.vue ---
  let card = fs.readFileSync('src/components/EquipmentCard.vue', 'utf8');
  card = card.replace(/:title="'Click to open full detail view'"/g, ":title=\"turbine.alert + ' - click to view full scenario'\"");
  fs.writeFileSync('src/components/EquipmentCard.vue', card);

  // --- 3. Fix fleetStore.js ---
  let store = fs.readFileSync('src/fleetStore.js', 'utf8');
  store = store.replace(
    "if (turbine.exhaustTemp > thresholds.exhaustTemp.warning) return 'exhaustTemp'\r\n  return 'exhaustTemp'",
    `if (turbine.exhaustTemp > thresholds.exhaustTemp.warning) return 'exhaustTemp'\r\n  // Priority 2 (OK cards): pick the metric with the highest variance\r\n  const ranges = { exhaustTemp: {min: 420, max: 670}, shaftSpeed: {min: 2800, max: 20000}, vibration: {min: 0.3, max: 9.0}, powerOutput: {min: 1.0, max: 1500.0}, fuelFlow: {min: 0.05, max: 16.0} }\r\n  let best = 'exhaustTemp', maxDev = -1;\r\n  for (const k of ['exhaustTemp','shaftSpeed','vibration','powerOutput','fuelFlow']) {\r\n    const v = turbine[k]; if (isNaN(v)) continue;\r\n    const dev = Math.abs(v - (ranges[k].min+ranges[k].max)/2)/(ranges[k].max-ranges[k].min);\r\n    if (dev > maxDev) { maxDev = dev; best = k; }\r\n  }\r\n  return best`
  );
  // (In case line endings are \n instead of \r\n)
  store = store.replace(
    "if (turbine.exhaustTemp > thresholds.exhaustTemp.warning) return 'exhaustTemp'\n  return 'exhaustTemp'",
    `if (turbine.exhaustTemp > thresholds.exhaustTemp.warning) return 'exhaustTemp'\n  // Priority 2 (OK cards): pick the metric with the highest variance\n  const ranges = { exhaustTemp: {min: 420, max: 670}, shaftSpeed: {min: 2800, max: 20000}, vibration: {min: 0.3, max: 9.0}, powerOutput: {min: 1.0, max: 1500.0}, fuelFlow: {min: 0.05, max: 16.0} }\n  let best = 'exhaustTemp', maxDev = -1;\n  for (const k of ['exhaustTemp','shaftSpeed','vibration','powerOutput','fuelFlow']) {\n    const v = turbine[k]; if (isNaN(v)) continue;\n    const dev = Math.abs(v - (ranges[k].min+ranges[k].max)/2)/(ranges[k].max-ranges[k].min);\n    if (dev > maxDev) { maxDev = dev; best = k; }\n  }\n  return best`
  );
  fs.writeFileSync('src/fleetStore.js', store);

  console.log("Applied minor file fixes.");
}

applyFixes();
