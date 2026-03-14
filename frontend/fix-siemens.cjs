const fs = require('fs');
let file = fs.readFileSync('src/components/SiemensPoC.vue', 'utf8');

file = file.replace(
  "@close=\"closeFleetOverviewModal\"",
  "@close=\"closeFleetOverviewModal\"\n      @open-turbine=\"onOpenTurbineFromOverview\""
);

// add the function near closeFleetOverviewModal
const func = `
const onOpenTurbineFromOverview = (id) => {
  fleetOverviewOpen.value = false;
  selectedTurbine.value = turbines.value.find(t => t.id === id);
}
`;
file = file.replace(
  "const closeFleetOverviewModal = () => {",
  func + "\nconst closeFleetOverviewModal = () => {"
);

fs.writeFileSync('src/components/SiemensPoC.vue', file);
console.log("Updated SiemensPoC.vue");
