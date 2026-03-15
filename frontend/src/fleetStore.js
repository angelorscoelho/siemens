// ══════════════════════════════════════════════════════════════════════════════
// Fleet Data Store — Centralized asset library for the Fleet Overview Dashboard
// ══════════════════════════════════════════════════════════════════════════════

// ── Maintenance History Data Store ────────────────────────────────────────────
// Realistic maintenance records (6-10 per asset) used for the History modal
// and as RAG context for the AI assistant.  Newest record first.
const MAINTENANCE_HISTORIES = {
  'GT-01': [
    { timestamp: '2025-12-10T07:00:00Z', orderNumber: 'WO-2025-GT01-007', type: 'Hot Gas Path Inspection', technician: 'Team Alpha — J. Müller (lead)', description: 'Scheduled HGP inspection at 8,000 EOH. Combustion liners, transition pieces, and first-stage nozzles inspected. All components within acceptance limits. Thermal barrier coatings intact. Unit returned to service.', findings: 'Minor erosion on blade leading edges — within acceptance criteria. TBC thickness nominal across all blades.', partsReplaced: ['Combustion liner gaskets (×16)', 'Turbine shroud seal strips (×4)'], durationHours: 144, result: 'COMPLETED', hoursAtService: 8000 },
    { timestamp: '2025-06-15T06:00:00Z', orderNumber: 'WO-2025-GT01-006', type: 'Compressor Offline Water Wash', technician: 'J. Schmidt', description: 'Offline water wash performed due to compressor efficiency drop of 1.2%. Post-wash efficiency recovered to design baseline.', findings: 'Salt deposit buildup on compressor blades stages 1–5. Post-wash efficiency gain: +1.8%.', partsReplaced: [], durationHours: 8, result: 'COMPLETED', hoursAtService: 7200 },
    { timestamp: '2024-12-02T08:00:00Z', orderNumber: 'WO-2024-GT01-005', type: 'Combustion Inspection', technician: 'Team Beta — K. Wagner', description: 'Scheduled CI at 4,000 EOH. Fuel nozzles cleaned, cross-fire tubes inspected, liner wear measured. All within 20% wear limit.', findings: 'Fuel nozzle carbon deposit moderate. Liner wear at 11% — acceptable. All cross-fire tubes operational.', partsReplaced: ['Fuel nozzle tip inserts (×16)', 'Combustion can gaskets (×16)'], durationHours: 72, result: 'COMPLETED', hoursAtService: 4000 },
    { timestamp: '2024-05-20T10:00:00Z', orderNumber: 'WO-2024-GT01-004', type: 'Lube Oil Analysis & Change', technician: 'M. Fischer', description: 'Annual lube oil change and system inspection per Section 15 of maintenance manual. Oil samples sent for laboratory analysis.', findings: 'Viscosity 31.2 cSt — within ISO VG 32 spec. Acid number nominal. No metal contamination detected.', partsReplaced: ['ISO VG 32 turbine oil (×600 L)', 'Oil filter cartridges (×3)'], durationHours: 12, result: 'COMPLETED', hoursAtService: 3100 },
    { timestamp: '2023-11-10T07:30:00Z', orderNumber: 'WO-2023-GT01-003', type: 'Inlet Filter Replacement', technician: 'F. Braun', description: 'Stage 1 and Stage 2 inlet filter elements replaced. ΔP across filter bank approached 25 mbar threshold.', findings: 'Filter ΔP reached 23.4 mbar — replacement threshold is 25 mbar. Preventive replacement carried out.', partsReplaced: ['Stage 1 filter elements (×24)', 'Stage 2 HEPA filters (×12)'], durationHours: 6, result: 'COMPLETED', hoursAtService: 1800 },
    { timestamp: '2023-06-01T06:00:00Z', orderNumber: 'WO-2023-GT01-002', type: 'Commissioning & Initial Inspection', technician: 'Siemens Energy Commissioning Team', description: 'Unit commissioning completed. All mechanical systems verified, first fire achieved, load ramp-up to 100% rated power. Documentation complete.', findings: 'No issues found during commissioning. All parameters within design envelope. Unit accepted for commercial operation.', partsReplaced: [], durationHours: 240, result: 'COMPLETED', hoursAtService: 0 },
  ],
  'ST-01': [
    { timestamp: '2026-03-10T14:32:00Z', orderNumber: 'WO-2026-ST01-010', type: 'Emergency Bearing Inspection', technician: 'On-call Team — R. Johnson', description: 'UNPLANNED: Bearing #3 vibration alarm triggered at 4.5 mm/s. Emergency inspection initiated. Unit kept online at reduced load (70%) per SOP.', findings: 'Bearing #3 shows oil film breakdown — elevated metal particles in oil sample. Vibration trend upward over 72 h. Bearing replacement recommended within 48 h.', partsReplaced: ['Lube oil sample (analysis pending)'], durationHours: 4, result: 'COMPLETED_WITH_FINDINGS', hoursAtService: 23810 },
    { timestamp: '2025-11-15T08:00:00Z', orderNumber: 'WO-2025-ST01-009', type: 'Combustion Inspection', technician: 'Team Gamma — P. Davis', description: 'Combustion inspection at 22,000 EOH. Fuel nozzles cleaned, cross-fire tubes inspected. Liner wear at 17% — approaching replacement limit.', findings: 'Liner wear 17% — within 20% limit but trending toward replacement at next CI. Combustion dynamics stable.', partsReplaced: ['Fuel nozzle tip inserts (×12)', 'Cross-fire tubes (×2)'], durationHours: 64, result: 'COMPLETED_WITH_FINDINGS', hoursAtService: 22000 },
    { timestamp: '2025-04-20T07:00:00Z', orderNumber: 'WO-2025-ST01-008', type: 'Hot Gas Path Inspection', technician: 'Team Alpha — B. Carter', description: 'HGP inspection at 20,000 EOH. First-stage blades showing significant thermal fatigue. TBC partially spalled on 3 blades.', findings: 'Stage 1 blade TBC spallation on blades #4, #7, #11. Creep elongation within limits. Transition pieces show oxidation — replaced.', partsReplaced: ['Stage 1 transition pieces (×12)', 'Combustion liner segments (×6)', 'Thermocouple probes (×4)'], durationHours: 192, result: 'COMPLETED_WITH_FINDINGS', hoursAtService: 20000 },
    { timestamp: '2024-01-15T06:00:00Z', orderNumber: 'WO-2024-ST01-007', type: 'Major Overhaul', technician: 'Siemens Energy MRO Team', description: 'Major overhaul at 18,000 EOH. Full hot-section disassembly, blade row 1 replacement, compressor wash, all seals renewed. Unit re-commissioned.', findings: 'Blade row 1 at end-of-life — replaced as planned. Bearing #2 and #4 replaced — within wear limits but preventive. Rotor balance within ISO 2.5.', partsReplaced: ['Blade row 1 complete set (×36)', 'Bearings #2 and #4', 'All combustion liners', 'Compressor stage 1–3 blades'], durationHours: 480, result: 'COMPLETED', hoursAtService: 18000 },
    { timestamp: '2022-09-10T08:00:00Z', orderNumber: 'WO-2022-ST01-005', type: 'Hot Gas Path Inspection', technician: 'Team Beta', description: 'HGP inspection at 12,000 EOH. Blades and nozzles in acceptable condition. Combustion liners replaced as scheduled.', findings: 'All blades within creep limits. Stage 1 nozzles show 18% wear — below 25% limit. Liners replaced at scheduled interval.', partsReplaced: ['All combustion liners (×12)', 'Stage 1 nozzle seals'], durationHours: 168, result: 'COMPLETED', hoursAtService: 12000 },
    { timestamp: '2021-09-05T07:00:00Z', orderNumber: 'WO-2021-ST01-004', type: 'Combustion Inspection', technician: 'T. Williams', description: 'CI at 8,000 EOH. Normal wear found. Fuel nozzles cleaned and reinstalled. Unit returned to service within schedule.', findings: 'All combustion components in good condition. No anomalies.', partsReplaced: ['Fuel nozzle tip inserts (×12)'], durationHours: 60, result: 'COMPLETED', hoursAtService: 8000 },
  ],
  'GT-02': [
    { timestamp: '2026-01-15T08:00:00Z', orderNumber: 'WO-2026-GT02-006', type: 'Inlet Filter Replacement', technician: 'A. Al-Rashid', description: 'Stage 1 and Stage 2 inlet filters replaced per schedule. Dusty desert conditions require accelerated replacement cycle every 1,500 EOH.', findings: 'Filter loading heavier than expected — suggest reducing replacement interval to 1,200 EOH given local dust conditions.', partsReplaced: ['Stage 1 coarse filters (×18)', 'Stage 2 fine filters (×9)'], durationHours: 6, result: 'COMPLETED', hoursAtService: 5100 },
    { timestamp: '2025-08-10T06:00:00Z', orderNumber: 'WO-2025-GT02-005', type: 'Combustion Inspection', technician: 'Team Delta — H. Al-Zahrani', description: 'CI at 4,000 EOH. All combustion components within limits. Compressor wash carried out offline simultaneously.', findings: 'Combustion system in excellent condition. Compressor efficiency improved by 1.4% post-wash. No defects found.', partsReplaced: ['Combustion can O-rings (×18)', 'Fuel nozzle strainers (×18)'], durationHours: 80, result: 'COMPLETED', hoursAtService: 4000 },
    { timestamp: '2025-02-20T08:00:00Z', orderNumber: 'WO-2025-GT02-004', type: 'Lube Oil Analysis & Change', technician: 'S. Hassan', description: 'Lube oil change at 2,000 h interval and system inspection. Operating in high ambient temperature environment (45°C average).', findings: 'Oil oxidation index slightly elevated — within spec but trending. Recommend next change at 3,000 h (not 4,000 h) given ambient conditions.', partsReplaced: ['ISO VG 32 turbine oil (×180 L)', 'Oil filter elements (×2)'], durationHours: 8, result: 'COMPLETED_WITH_FINDINGS', hoursAtService: 2800 },
    { timestamp: '2024-09-12T07:00:00Z', orderNumber: 'WO-2024-GT02-003', type: 'Online Water Wash (×3)', technician: 'F. Al-Amri', description: 'Routine online compressor washes performed at 500-hour intervals. Compressor efficiency maintained above 95% of design.', findings: 'Efficiency trend stable. Dust ingestion controlled effectively by current filtration system.', partsReplaced: [], durationHours: 3, result: 'COMPLETED', hoursAtService: 2400 },
    { timestamp: '2025-07-01T06:00:00Z', orderNumber: 'WO-2025-GT02-002', type: 'Borescope Inspection', technician: 'K. Nomura (Siemens)', description: 'Borescope inspection of compressor and hot section following filter clogging event. All stages checked via borescope ports.', findings: 'No ingestion damage found. Compressor blade condition good. Hot section nominal. Inspection duration shorter than planned.', partsReplaced: [], durationHours: 16, result: 'COMPLETED', hoursAtService: 4800 },
    { timestamp: '2025-07-15T06:00:00Z', orderNumber: 'WO-2025-GT02-001', type: 'Commissioning & Initial Inspection', technician: 'Siemens Energy Commissioning Team', description: 'Unit commissioned 2025-06-20. Dual-fuel system verified, DLE burners tuned. All emission limits met. Unit accepted by customer.', findings: 'Commissioning completed without issues. NOx 22 ppm — below 25 ppm limit. Unit operational.', partsReplaced: [], durationHours: 168, result: 'COMPLETED', hoursAtService: 0 },
  ],
  'ST-02': [
    { timestamp: '2025-09-01T07:00:00Z', orderNumber: 'WO-2025-ST02-007', type: 'Hot Section Inspection', technician: 'Team Omega — D. van der Berg', description: 'Hot section inspection at 12,000 EOH. Turbine blades checked for creep, erosion, and corrosion. All within limits.', findings: 'Stage 1–3 blades within creep elongation limits. Erosion shields intact. Steam seals in good condition. Next HSI at 20,000 h.', partsReplaced: ['HP turbine sealing strips (×8)', 'Journal bearing inserts (×2)'], durationHours: 120, result: 'COMPLETED', hoursAtService: 12000 },
    { timestamp: '2024-11-10T08:00:00Z', orderNumber: 'WO-2024-ST02-006', type: 'Steam System Inspection', technician: 'A. de Jong', description: 'Annual steam system inspection. Main and reheat stop valves serviced. Steam strainers cleaned. Condensate system flushed.', findings: 'Main steam stop valve seat wear acceptable. Strainer mesh 15% blocked — cleaned. Condensate pump seals showing wear — replaced.', partsReplaced: ['Condensate pump mechanical seals (×2)', 'Steam strainer mesh (×4)'], durationHours: 48, result: 'COMPLETED_WITH_FINDINGS', hoursAtService: 11000 },
    { timestamp: '2024-03-15T07:00:00Z', orderNumber: 'WO-2024-ST02-005', type: 'Lube Oil Change', technician: 'B. Janssen', description: 'Planned lube oil change and bearing inspection. All bearings within vibration and temperature limits.', findings: 'Oil analysis clean — no metal particles. Bearing vibrations 1.3–1.6 mm/s, all within limits.', partsReplaced: ['Turbine oil ISO VG 46 (×400 L)', 'Oil cooler gaskets'], durationHours: 14, result: 'COMPLETED', hoursAtService: 10200 },
    { timestamp: '2023-09-20T08:00:00Z', orderNumber: 'WO-2023-ST02-004', type: 'Governor & Control System', technician: 'Controls Team — E. Bakker', description: 'Annual calibration of turbine governor, speed sensors, and overspeed protection system. Trip test performed successfully.', findings: 'All control parameters within calibration limits. Overspeed trip set point confirmed at 110% rated speed.', partsReplaced: ['Speed sensor O-rings (×4)'], durationHours: 16, result: 'COMPLETED', hoursAtService: 8500 },
    { timestamp: '2022-12-05T07:00:00Z', orderNumber: 'WO-2022-ST02-003', type: 'Planned Outage Inspection', technician: 'Team Delta', description: 'Annual planned outage inspection. Turbine casing flanges checked, LP blade row inspected, gland sealing system serviced.', findings: 'LP blade row in excellent condition. Gland seal strips worn on stage 4 — replaced. Casing flanges torqued to specification.', partsReplaced: ['LP stage 4 gland seal strips', 'HP valve packing sets (×2)'], durationHours: 96, result: 'COMPLETED', hoursAtService: 6000 },
    { timestamp: '2022-05-15T06:00:00Z', orderNumber: 'WO-2022-ST02-002', type: 'Combustion/Steam System Tuning', technician: 'Siemens Performance Team', description: 'Performance optimization during planned outage. Steam extraction valves calibrated. Thermal efficiency improved.', findings: 'Heat rate improved by 0.3%. Extraction valve actuators re-calibrated for process heat demand optimization.', partsReplaced: ['Extraction valve actuator seals'], durationHours: 24, result: 'COMPLETED', hoursAtService: 4800 },
  ],
  'GT-03': [
    { timestamp: '2025-12-01T11:00:00Z', orderNumber: 'WO-2025-GT03-009', type: 'Unplanned: Combustion Liner Check', technician: 'Emergency Team — O. Adeyemi', description: 'UNPLANNED: Exhaust temperature trending 15°C above baseline over 30 days. Borescope inspection of combustion section performed.', findings: 'Fuel nozzle #3 and #5 showing carbon fouling. Combustion liner zone B showing localized hot spot. Nozzles cleaned; liner monitoring intensified.', partsReplaced: ['Fuel nozzle tips #3 and #5'], durationHours: 18, result: 'COMPLETED_WITH_FINDINGS', hoursAtService: 28900 },
    { timestamp: '2025-05-20T07:00:00Z', orderNumber: 'WO-2025-GT03-008', type: 'Hot Gas Path Inspection', technician: 'Team Epsilon — C. Okafor', description: 'HGP inspection at 28,000 EOH. Unit approaching major overhaul interval. Extended inspection scope performed.', findings: 'Stage 1 blade creep at 87% of limit — serviceable but overhaul should not be deferred beyond 30,000 h. TBC on blades #2 and #8 spalled — coatings applied.', partsReplaced: ['TBC repair on blades #2 and #8', 'Stage 1 nozzle seals (×4)', 'Combustion liner gaskets (×18)'], durationHours: 216, result: 'COMPLETED_WITH_FINDINGS', hoursAtService: 28000 },
    { timestamp: '2024-08-15T06:00:00Z', orderNumber: 'WO-2024-GT03-007', type: 'Inlet Cooling System Service', technician: 'E. Chukwu', description: 'Inlet air cooling system (evaporative cooler) serviced. High ambient temperatures (45°C) in Nigeria require active cooling for rated power output.', findings: 'Evaporative cooler pads fouled — replaced. Cooling effectiveness restored: inlet depression of 8°C achieved at design ambient.', partsReplaced: ['Evaporative cooler pads (×6)', 'Water distribution nozzles (×12)'], durationHours: 10, result: 'COMPLETED', hoursAtService: 25000 },
    { timestamp: '2023-09-10T07:00:00Z', orderNumber: 'WO-2023-GT03-006', type: 'Combustion Inspection', technician: 'Team Zeta — I. Obi', description: 'CI at 24,000 EOH. High-cycle fatigue on fuel nozzles detected. All 18 fuel nozzles replaced preventively.', findings: 'Fuel nozzle wear accelerated — attributed to frequent start-stop peaking duty cycle. All 18 nozzles replaced.', partsReplaced: ['All fuel nozzles (×18)', 'Cross-fire tubes (×3)', 'Combustion liners (×4)'], durationHours: 96, result: 'COMPLETED_WITH_FINDINGS', hoursAtService: 24000 },
    { timestamp: '2023-05-20T07:00:00Z', orderNumber: 'WO-2023-GT03-005', type: 'Major Overhaul', technician: 'Siemens Energy MRO Team', description: 'Major overhaul at 24,000 EOH. Full strip-down, blade replacement, compressor overhaul. Unit returned to service in 30 days.', findings: 'Blade row 1 at expected end-of-life for 24,000 h cycle. Compressor stage 3 showing erosion — blades replaced. Rotor rebalanced.', partsReplaced: ['Blade row 1 (×36)', 'Compressor stage 3 blades (×28)', 'All seals and gaskets', 'All bearings'], durationHours: 720, result: 'COMPLETED', hoursAtService: 24000 },
    { timestamp: '2022-11-01T08:00:00Z', orderNumber: 'WO-2022-GT03-004', type: 'Dust Filter Replacement (Accelerated)', technician: 'O. Adeyemi', description: 'Accelerated filter replacement due to Harmattan dust season. Dust ingestion risk elevated — filters replaced every 500 EOH.', findings: 'Filter loading 3× normal rate during Harmattan season. Secondary HEPA installed as additional protection.', partsReplaced: ['All filter stages (full replacement)', 'Secondary HEPA pre-filter (new)'], durationHours: 4, result: 'COMPLETED', hoursAtService: 20000 },
  ],
  'GT-04': [
    { timestamp: '2026-03-11T08:15:00Z', orderNumber: 'WO-2026-GT04-012', type: 'CRITICAL: Emergency Shutdown Investigation', technician: 'Emergency Response Team', description: 'CRITICAL: Bearing #2 vibration at 7.2 mm/s. Controlled shutdown initiated. Emergency borescope of bearing compartment and hot section ordered.', findings: 'Bearing #2 shows severe oil film failure — metal pickup on shaft journal. Hot section TBC severely degraded. Unit requires immediate full overhaul.', partsReplaced: ['PENDING — unit in emergency shutdown'], durationHours: 8, result: 'COMPLETED_WITH_FINDINGS', hoursAtService: 31200 },
    { timestamp: '2025-11-02T09:00:00Z', orderNumber: 'WO-2025-GT04-011', type: 'Fuel Nozzle Replacement (#4)', technician: 'Y. Tanaka', description: 'Fuel nozzle #4 replaced due to carbon buildup causing combustion instability detected by dynamic pressure sensors.', findings: 'Carbon deposit on nozzle #4 tip causing combustion oscillations (35 Hz). Replaced and re-tuned combustion.', partsReplaced: ['Fuel nozzle #4 tip assembly'], durationHours: 8, result: 'COMPLETED', hoursAtService: 30500 },
    { timestamp: '2025-08-14T07:00:00Z', orderNumber: 'WO-2025-GT04-010', type: 'Compressor Blade Tip Rub Repair', technician: 'Siemens Emergency MRO — K. Suzuki', description: 'Compressor blade tip rub event caused by rotor thermal bow at startup. Stage 3 blade tips rub-stripped. In-situ repair performed.', findings: 'Stage 3 compressor blade tips rubbed on casing — clearance reduced to zero during thermal bow. In-situ tip re-coating performed.', partsReplaced: ['Stage 3 compressor blade tip coatings (in-situ)'], durationHours: 48, result: 'COMPLETED', hoursAtService: 29800 },
    { timestamp: '2025-04-10T07:00:00Z', orderNumber: 'WO-2025-GT04-009', type: 'Hot Gas Path Inspection', technician: 'Team Alpha — H. Nakamura', description: 'HGP inspection at 30,000 EOH. Unit past recommended major overhaul interval. Grid demand constraints prevented scheduled outage.', findings: 'Stage 1 blades at 112% of creep limit — overhauled blades in-situ where possible. Overhaul DEFERRED — grid operator notification issued.', partsReplaced: ['Stage 1 nozzle segments (×4)', 'Combustion liners (×16)', 'Transition pieces (×4)'], durationHours: 288, result: 'COMPLETED_WITH_FINDINGS', hoursAtService: 30000 },
    { timestamp: '2024-08-20T08:00:00Z', orderNumber: 'WO-2024-GT04-008', type: 'Bearing #2 Vibration Investigation', technician: 'R. Yamamoto', description: 'Elevated vibration on bearing #2 (3.8 mm/s) investigated. Oil sample analysis and vibration spectrum analysis performed.', findings: 'Early signs of bearing wear — oil analysis shows slight iron increase. Bearing acceptable for continued operation with weekly monitoring.', partsReplaced: ['Lube oil (partial drain and refill)', 'Oil filter cartridge'], durationHours: 8, result: 'COMPLETED_WITH_FINDINGS', hoursAtService: 28000 },
    { timestamp: '2023-06-15T06:00:00Z', orderNumber: 'WO-2023-GT04-007', type: 'Combustion Inspection', technician: 'Team Beta — N. Watanabe', description: 'CI at 24,000 EOH. Combustion system inspection including fuel nozzles, liners, and dynamic pressure sensors.', findings: 'All combustion components serviceable. Dynamic pressure sensors recalibrated. Combustion dynamics within limits.', partsReplaced: ['All fuel nozzle strainers (×16)', 'Dynamic pressure sensor membranes (×4)'], durationHours: 80, result: 'COMPLETED', hoursAtService: 24000 },
    { timestamp: '2022-01-10T07:00:00Z', orderNumber: 'WO-2022-GT04-006', type: 'Major Overhaul', technician: 'Siemens Energy MRO Team', description: 'Major overhaul at 24,000 EOH. All hot-section components replaced. Compressor fully inspected and cleaned. Unit returned to service.', findings: 'Blade row 1 and 2 replaced as planned. Compressor in good condition. Rotor balance within ISO 2.5.', partsReplaced: ['Blade rows 1 and 2', 'All combustion liners and nozzles', 'All seals, gaskets and bearings'], durationHours: 480, result: 'COMPLETED', hoursAtService: 24000 },
  ],
  'GT-05': [
    { timestamp: '2025-11-15T07:00:00Z', orderNumber: 'WO-2025-GT05-006', type: 'Combustion Inspection', technician: 'Team Alpha — L. García', description: 'Scheduled CI at 6,000 EOH. Fuel nozzles inspected and cleaned, combustion liners measured, cross-fire tubes verified.', findings: 'All combustion components within tolerance. Liner wear at 8%. Excellent condition for a mid-life unit.', partsReplaced: ['Fuel nozzle tip strainers (×16)', 'Igniter plugs (×4)'], durationHours: 72, result: 'COMPLETED', hoursAtService: 6000 },
    { timestamp: '2025-04-10T08:00:00Z', orderNumber: 'WO-2025-GT05-005', type: 'Compressor Online Water Wash (×6)', technician: 'M. Rodriguez', description: 'Six consecutive online compressor washes performed per the 500-EOH schedule. Compressor efficiency maintained at 96.8% of design.', findings: 'Compressor efficiency trend stable. No offline wash required this period.', partsReplaced: [], durationHours: 6, result: 'COMPLETED', hoursAtService: 5800 },
    { timestamp: '2024-10-20T08:00:00Z', orderNumber: 'WO-2024-GT05-004', type: 'Lube Oil Analysis & Partial Change', technician: 'A. Sánchez', description: 'Lube oil sample analysis at 4,000 h interval. Oil condition good — partial change and filter replacement performed.', findings: 'Oil viscosity 31.8 cSt within spec. Acid number nominal. Trace iron particles below alarm threshold.', partsReplaced: ['Oil filter cartridges (×3)', 'ISO VG 32 oil top-up (×120 L)'], durationHours: 10, result: 'COMPLETED', hoursAtService: 4000 },
    { timestamp: '2024-05-15T07:00:00Z', orderNumber: 'WO-2024-GT05-003', type: 'Borescope Inspection (Routine)', technician: 'P. Martín', description: 'Routine borescope inspection per annual schedule. All compressor stages and first two turbine stages inspected.', findings: 'All stages in excellent condition. No erosion, corrosion, or FOD damage found. Hot section TBC intact.', partsReplaced: [], durationHours: 12, result: 'COMPLETED', hoursAtService: 2800 },
    { timestamp: '2023-11-20T09:00:00Z', orderNumber: 'WO-2023-GT05-002', type: 'DLE Burner Replacement', technician: 'Team Beta — R. Fernández', description: 'DLE burner replacement at 6,000 h per OEM schedule. All 16 burners replaced as a complete set to ensure combustion uniformity.', findings: 'Previous burners at scheduled replacement interval. New burners installed and combustion dynamics verified within limits.', partsReplaced: ['DLE burners (×16 complete assemblies)'], durationHours: 48, result: 'COMPLETED', hoursAtService: 500 },
    { timestamp: '2023-06-01T06:00:00Z', orderNumber: 'WO-2023-GT05-001', type: 'Commissioning & Initial Run', technician: 'Siemens Energy Commissioning Team', description: 'Unit commissioned at Plant Eta. Grid synchronisation achieved. Load ramp to 100% rated power. All systems nominal.', findings: 'No commissioning defects. Electrical output 292 MW at rated conditions — exceeds nameplate. NOx 24 ppm.', partsReplaced: [], durationHours: 200, result: 'COMPLETED', hoursAtService: 0 },
  ],
  'GT-06': [
    { timestamp: '2026-01-20T10:00:00Z', orderNumber: 'WO-2026-GT06-008', type: 'Unplanned: Exhaust Temp & Vibration Check', technician: 'Emergency Team — T. Miller', description: 'UNPLANNED: Simultaneous exhaust temp (603°C) and vibration (4.0 mm/s) elevation. Unit load reduced to 75%. Borescope and bearing checks initiated.', findings: 'Combustion hot spot on can #7 — liner burn-through developing. Bearing #4 journal showing wear. Maintenance within 72 h mandatory.', partsReplaced: [], durationHours: 6, result: 'COMPLETED_WITH_FINDINGS', hoursAtService: 19200 },
    { timestamp: '2025-06-18T07:00:00Z', orderNumber: 'WO-2025-GT06-007', type: 'Combustion Inspection', technician: 'Team Theta — C. Wilson', description: 'CI at 16,800 EOH. Fuel nozzles cleaned, liners inspected. Liner condition good. DLE combustion system recalibrated.', findings: 'Combustion dynamics improved after recalibration. All liners within 20% wear limit. Fuel nozzles cleaned without replacement.', partsReplaced: ['Fuel nozzle strainers (×16)', 'Combustion can gaskets (×16)'], durationHours: 68, result: 'COMPLETED', hoursAtService: 16800 },
    { timestamp: '2024-09-10T08:00:00Z', orderNumber: 'WO-2024-GT06-006', type: 'Hot Gas Path Inspection', technician: 'Team Alpha', description: 'HGP inspection at 16,000 EOH. Stage 1 blade leading-edge erosion within limits. TBC in good condition. Bearing #4 trending.', findings: 'Bearing #4 vibration at 2.8 mm/s — above 2.5 mm/s warning at time of inspection. Monitoring increased to weekly.', partsReplaced: ['Stage 1 shroud seal strips (×4)', 'Combustion liner gaskets (×16)'], durationHours: 160, result: 'COMPLETED_WITH_FINDINGS', hoursAtService: 16000 },
    { timestamp: '2023-08-15T07:00:00Z', orderNumber: 'WO-2023-GT06-005', type: 'Bearing #4 Journal Remetalling', technician: 'D. Anderson', description: 'Bearing #4 journal bearing remetalled following elevated vibration trend. Journal inspected and shaft surface polished.', findings: 'White metal bearing material showing fatigue cracks — bearing remetalled. Shaft surface finish restored. Vibration returned to 1.6 mm/s.', partsReplaced: ['Bearing #4 journal shell (×2)'], durationHours: 36, result: 'COMPLETED', hoursAtService: 14500 },
    { timestamp: '2022-06-10T07:00:00Z', orderNumber: 'WO-2022-GT06-004', type: 'Combustion Inspection', technician: 'Team Beta', description: 'CI at 12,000 EOH. Normal wear found. Unit approaching planned HGP inspection at 16,000 EOH.', findings: 'All combustion components serviceable. Liner wear at 13% — acceptable.', partsReplaced: ['Fuel nozzle tip inserts (×16)', 'Cross-fire tubes (×4)'], durationHours: 64, result: 'COMPLETED', hoursAtService: 12000 },
    { timestamp: '2021-08-20T07:00:00Z', orderNumber: 'WO-2021-GT06-003', type: 'Major Overhaul', technician: 'Siemens Energy MRO Team', description: 'First major overhaul at 12,000 EOH. All blades inspected and re-coated. Compressor fully cleaned. Rotor balance verified.', findings: 'All blades within limits — re-coated with new TBC. Compressor efficiency improved by 2.1% post-overhaul.', partsReplaced: ['All blade TBC coatings', 'Stage 1 combustion liners', 'All main bearings'], durationHours: 480, result: 'COMPLETED', hoursAtService: 12000 },
  ],
  'GT-07': [
    { timestamp: '2025-08-12T07:00:00Z', orderNumber: 'WO-2025-GT07-006', type: 'Hot Gas Path Inspection', technician: 'Team Iota — A. Al-Mansouri', description: 'HGP inspection at 8,000 EOH. Unit in excellent condition for a 11,200 h asset. All components within limits.', findings: 'Stage 1 blade leading edges show minimal erosion. TBC intact. No corrective action required.', partsReplaced: ['Combustion liner gaskets', 'Turbine stage 1 sealing strips'], durationHours: 120, result: 'COMPLETED', hoursAtService: 8000 },
    { timestamp: '2024-12-20T08:00:00Z', orderNumber: 'WO-2024-GT07-005', type: 'Lube Oil Analysis & Change', technician: 'F. Al-Hashemi', description: 'Annual lube oil change. Operating in high-temperature desert environment. Oil condition within spec but changed per annual schedule.', findings: 'Oil viscosity 30.9 cSt — within ISO VG 32 spec. Acid number 0.12 (limit 0.20). No contamination.', partsReplaced: ['ISO VG 32 turbine oil (×240 L)', 'Oil filter elements (×2)'], durationHours: 12, result: 'COMPLETED', hoursAtService: 9500 },
    { timestamp: '2024-05-18T07:00:00Z', orderNumber: 'WO-2024-GT07-004', type: 'Combustion Inspection', technician: 'Team Kappa — M. Al-Saadi', description: 'CI at 8,000 EOH. All combustion components inspected. Pipeline gas quality excellent — minimal nozzle deposits.', findings: 'Combustion system in excellent condition. No defects found. Liner wear 6% — well within limits.', partsReplaced: ['Fuel nozzle strainers (×12)', 'Cross-fire tube connectors (×2)'], durationHours: 60, result: 'COMPLETED', hoursAtService: 8000 },
    { timestamp: '2023-09-15T08:00:00Z', orderNumber: 'WO-2023-GT07-003', type: 'Speed Governor Calibration', technician: 'Controls Team', description: 'Annual calibration of speed governor and overspeed protection. Compressor gas pipeline application requires precise speed control.', findings: 'Governor calibration within ±0.1% — acceptable. Overspeed trip tested at 110% — correct operation confirmed.', partsReplaced: ['Speed sensor O-rings (×4)'], durationHours: 8, result: 'COMPLETED', hoursAtService: 7200 },
    { timestamp: '2022-12-10T07:00:00Z', orderNumber: 'WO-2022-GT07-002', type: 'Combustion Inspection', technician: 'B. Al-Rashidi', description: 'CI at 4,000 EOH. First major inspection since commissioning. Unit in excellent condition.', findings: 'Outstanding condition — no defects. Combustion efficiency high. All parameters nominal.', partsReplaced: ['Fuel nozzle tip inserts (×12)', 'Igniter plugs (×2)'], durationHours: 56, result: 'COMPLETED', hoursAtService: 4000 },
    { timestamp: '2021-10-05T06:00:00Z', orderNumber: 'WO-2021-GT07-001', type: 'Commissioning', technician: 'Siemens Energy Commissioning Team', description: 'Unit commissioned for gas pipeline compression duty. Speed control verified at 7,700 RPM. All mechanical systems nominal.', findings: 'Commissioning completed. No issues found. Customer acceptance test passed.', partsReplaced: [], durationHours: 168, result: 'COMPLETED', hoursAtService: 0 },
  ],
  'GT-08': [
    { timestamp: '2025-12-01T08:00:00Z', orderNumber: 'WO-2025-GT08-006', type: 'Compressor Offline Water Wash', technician: 'C. Lim', description: 'Offline water wash performed. Tropical high-humidity environment causes compressor fouling. Efficiency restored after wash.', findings: 'Compressor efficiency: pre-wash 86.8%, post-wash 88.3%. Improvement of 1.5% achieved.', partsReplaced: [], durationHours: 10, result: 'COMPLETED', hoursAtService: 7500 },
    { timestamp: '2025-06-10T07:00:00Z', orderNumber: 'WO-2025-GT08-005', type: 'Combustion Inspection', technician: 'Team Kappa — S. Tan', description: 'CI at 4,000 EOH. High-humidity tropics cause accelerated nozzle wear. Inspection scope expanded.', findings: 'Fuel nozzle tips show 20% more wear than expected — tropical fuel gas moisture content implicated. Nozzles replaced.', partsReplaced: ['All fuel nozzle tip assemblies (×12)', 'Cross-fire tubes (×2)', 'Combustion liner gaskets (×12)'], durationHours: 76, result: 'COMPLETED_WITH_FINDINGS', hoursAtService: 4000 },
    { timestamp: '2024-11-20T08:00:00Z', orderNumber: 'WO-2024-GT08-004', type: 'CHP System Inspection', technician: 'Process Team — L. Wong', description: 'Annual CHP integration inspection. Heat recovery unit steam output verified. All control valves calibrated.', findings: 'Heat recovery efficiency at 98% of design. Steam output stable at design 10 bar. All control valves operating correctly.', partsReplaced: ['Steam valve actuator seals (×2)'], durationHours: 24, result: 'COMPLETED', hoursAtService: 3500 },
    { timestamp: '2024-05-15T07:00:00Z', orderNumber: 'WO-2024-GT08-003', type: 'Inlet Filtration System Upgrade', technician: 'Modifications Team', description: 'Coalescing pre-filter and HEPA filter system upgraded to new high-efficiency design. Moisture separator added.', findings: 'New filtration system reduces compressor fouling rate by estimated 40%. ΔP nominal at 18 mbar.', partsReplaced: ['Coalescing pre-filters (×8 upgraded)', 'HEPA filter banks (×4 new design)', 'Moisture separator (new install)'], durationHours: 32, result: 'COMPLETED', hoursAtService: 2000 },
    { timestamp: '2023-10-10T08:00:00Z', orderNumber: 'WO-2023-GT08-002', type: 'Lube Oil Analysis', technician: 'K. Goh', description: 'Annual lube oil analysis. Unit operating in tropical CHP mode. Oil condition within spec.', findings: 'Oil viscosity 31.1 cSt. No contamination. Water content below 50 ppm. Oil change not required — monitoring continued.', partsReplaced: ['Oil filter elements (×2)'], durationHours: 6, result: 'COMPLETED', hoursAtService: 1500 },
    { timestamp: '2023-03-15T06:00:00Z', orderNumber: 'WO-2023-GT08-001', type: 'Commissioning', technician: 'Siemens Energy Commissioning Team', description: 'Unit commissioned for CHP duty. Grid synchronization, heat recovery system verified. All emission parameters met.', findings: 'NOx 22 ppm. Heat recovery delivering 8.5 MW thermal at design steam pressure. Customer acceptance complete.', partsReplaced: [], durationHours: 192, result: 'COMPLETED', hoursAtService: 0 },
  ],
  'GT-09': [
    { timestamp: '2025-11-20T08:00:00Z', orderNumber: 'WO-2025-GT09-004', type: 'Combustion Inspection', technician: 'Team Lambda — P. Andersen', description: 'Combustion inspection at 2,800 EOH. First CI for this offshore unit. Fuel nozzles cleaned, cross-fire tubes inspected.', findings: 'All combustion components in excellent new condition. Fuel nozzle wear minimal. Cross-fire tubes clear. Marine atmosphere not yet causing corrosion.', partsReplaced: ['Igniter plugs (×2)', 'Fuel nozzle strainers (×8)'], durationHours: 48, result: 'COMPLETED', hoursAtService: 2800 },
    { timestamp: '2025-05-15T07:00:00Z', orderNumber: 'WO-2025-GT09-003', type: 'Corrosion Protection Inspection', technician: 'Marine Coatings Team', description: 'Annual marine corrosion inspection. Offshore salt-spray environment. All surfaces, seals, and electrical connections checked.', findings: 'Minor surface corrosion on non-critical brackets — treated. Electrical connectors all sealed correctly. No structural corrosion found.', partsReplaced: ['Anti-corrosion sealant on 3 brackets', 'Humidity absorber packs in electrics cabinet (×12)'], durationHours: 16, result: 'COMPLETED', hoursAtService: 2200 },
    { timestamp: '2024-11-20T08:00:00Z', orderNumber: 'WO-2024-GT09-002', type: 'Lube Oil Analysis', technician: 'E. Eriksen', description: 'First lube oil analysis at 1,500 EOH. Offshore operation with limited access. Oil condition within spec.', findings: 'Oil in excellent condition. Viscosity 31.5 cSt. No contamination. Oil change at 4,000 h per schedule.', partsReplaced: ['Oil filter elements (×2)'], durationHours: 6, result: 'COMPLETED', hoursAtService: 1500 },
    { timestamp: '2024-06-10T06:00:00Z', orderNumber: 'WO-2024-GT09-001', type: 'Commissioning (Offshore)', technician: 'Siemens Energy Commissioning Team', description: 'Unit commissioned on offshore platform. Zone 2 hazardous area commissioning procedures followed. All safety systems tested.', findings: 'Emergency shutdown system verified. Firegas detection integration tested. Unit accepted for offshore operation.', partsReplaced: [], durationHours: 240, result: 'COMPLETED', hoursAtService: 0 },
  ],
  'ST-03': [
    { timestamp: '2025-07-30T07:00:00Z', orderNumber: 'WO-2025-ST03-006', type: 'Blade Inspection', technician: 'Team Mu — W. Lee', description: 'Turbine blade inspection at 10,000 EOH. Stages 1–3 checked for creep, erosion, and corrosion. High-pressure steam conditions monitored closely.', findings: 'Stages 1–3 blades within creep limits. Erosion shields intact. Stage 1 leading-edge erosion at 15% of acceptance limit.', partsReplaced: ['Stage 1 erosion shield touch-ups (×8)', 'HP turbine sealing strips (×6)'], durationHours: 144, result: 'COMPLETED', hoursAtService: 10000 },
    { timestamp: '2024-12-10T08:00:00Z', orderNumber: 'WO-2024-ST03-005', type: 'Steam Chemistry Verification', technician: 'Chemistry Team', description: 'Annual steam purity verification. Cation conductivity and sodium measured. IAPWS guidelines compliance verified.', findings: 'Cation conductivity 0.08 μS/cm (limit 0.15). Sodium <2 ppb. Chemistry fully compliant. Next check in 6 months.', partsReplaced: ['Ion exchange resin (partial replacement)'], durationHours: 8, result: 'COMPLETED', hoursAtService: 9800 },
    { timestamp: '2024-06-20T07:00:00Z', orderNumber: 'WO-2024-ST03-004', type: 'HP Stop Valve Overhaul', technician: 'Valve Team — S. Koh', description: 'HP stop valve overhauled during planned outage. Valve seat wear measured. Packing renewed. Trip time tested.', findings: 'Valve seat wear acceptable. Packing renewed — steam leakage eliminated. Trip time 0.9 s — within 1.0 s specification.', partsReplaced: ['HP valve packing set', 'Valve seat ring (lapped)', 'Valve stem seals'], durationHours: 72, result: 'COMPLETED', hoursAtService: 8000 },
    { timestamp: '2023-09-15T07:00:00Z', orderNumber: 'WO-2023-ST03-003', type: 'Governor & Protection System Test', technician: 'Controls Team', description: 'Annual overspeed trip and governor calibration. Combined cycle plant operation requires precise speed regulation.', findings: 'Governor calibration: ±0.05% — excellent. Overspeed trip at 110.2% — within tolerance. Load rejection test passed.', partsReplaced: ['Speed sensor (×1 replaced proactively)'], durationHours: 14, result: 'COMPLETED', hoursAtService: 6500 },
    { timestamp: '2022-12-10T07:00:00Z', orderNumber: 'WO-2022-ST03-002', type: 'Routine Planned Outage', technician: 'Team Omega', description: 'Annual planned outage. HP and IP turbine casings opened. Blade row inspection, seal strip replacement, and lube oil change.', findings: 'All blade rows in good condition. Seal strips replaced as per schedule. Turbine efficiency maintained at 94.2% of design.', partsReplaced: ['All turbine seal strips', 'Journal bearing inserts (×2)', 'Turbine oil (×400 L)'], durationHours: 120, result: 'COMPLETED', hoursAtService: 5000 },
    { timestamp: '2022-05-20T06:00:00Z', orderNumber: 'WO-2022-ST03-001', type: 'Commissioning (Combined Cycle)', technician: 'Siemens Energy Commissioning Team', description: 'Unit commissioned as part of 750 MW combined cycle plant. HP steam at 165 bar / 565°C verified. Grid synchronisation achieved.', findings: 'No commissioning defects. Electrical output 248 MW — exceeds nameplate. Combined cycle plant efficiency 62.5%.', partsReplaced: [], durationHours: 360, result: 'COMPLETED', hoursAtService: 0 },
  ],
  'ST-04': [
    { timestamp: '2026-02-15T08:00:00Z', orderNumber: 'WO-2026-ST04-008', type: 'Unplanned: Steam Temp Elevation', technician: 'Emergency Team — R. Patel', description: 'UNPLANNED: Steam inlet temperature 16°C above normal (596°C vs 580°C baseline). Boiler superheat control valve position deviation investigated.', findings: 'Boiler superheat control valve position actuator drifting — causing 16°C steam temperature rise. Valve recalibrated. Root cause: actuator potentiometer wear.', partsReplaced: ['Superheat control valve actuator potentiometer'], durationHours: 8, result: 'COMPLETED_WITH_FINDINGS', hoursAtService: 22500 },
    { timestamp: '2025-09-10T07:00:00Z', orderNumber: 'WO-2025-ST04-007', type: 'Overhaul at 18,000 EOH', technician: 'Siemens Energy MRO Team', description: 'Scheduled overhaul at 18,000 EOH. All blades replaced, seals and bearings renewed. Refinery process heat integration verified post-outage.', findings: 'All blade rows replaced as planned. Bearing journals re-machined. Casing flanges re-torqued. Unit returned to service in 28 days.', partsReplaced: ['All turbine blade rows', 'All journal bearings', 'All gland seals', 'Backpressure valve assembly'], durationHours: 672, result: 'COMPLETED', hoursAtService: 18000 },
    { timestamp: '2024-04-20T07:00:00Z', orderNumber: 'WO-2024-ST04-006', type: 'Refinery Steam System Integration Check', technician: 'Process Integration Team', description: 'Annual check of backpressure steam delivery to refinery process. Control valves, pressure regulators, and steam traps inspected.', findings: 'Steam trap #7 failed open — replaced. Process steam pressure delivery at 10 bar maintained. All other components serviceable.', partsReplaced: ['Steam trap #7', 'Steam trap gaskets (×4)'], durationHours: 16, result: 'COMPLETED_WITH_FINDINGS', hoursAtService: 14500 },
    { timestamp: '2023-08-12T08:00:00Z', orderNumber: 'WO-2023-ST04-005', type: 'Hot Section Inspection', technician: 'Team Nu — P. Desai', description: 'Hot section inspection at 14,000 EOH. All blades checked. Approaching 18,000 h overhaul — planning commenced.', findings: 'Stage 1 blade creep at 82% of limit — serviceable until 18,000 h overhaul as planned. Stage 2 blades show salt corrosion — Mumbai coastal environment.', partsReplaced: ['Stage 2 blade anti-corrosion coating (×12 blades)', 'HP casing steam seals'], durationHours: 120, result: 'COMPLETED_WITH_FINDINGS', hoursAtService: 14000 },
    { timestamp: '2022-06-15T07:00:00Z', orderNumber: 'WO-2022-ST04-004', type: 'Governor Calibration & Trip Test', technician: 'Controls Team', description: 'Annual overspeed and governor calibration. Backpressure regulation also verified for refinery process heat.', findings: 'All systems within calibration limits. Process pressure control ±0.1 bar — excellent.', partsReplaced: ['Pressure sensor transmitters (×2 recalibrated)'], durationHours: 12, result: 'COMPLETED', hoursAtService: 10500 },
    { timestamp: '2021-09-10T07:00:00Z', orderNumber: 'WO-2021-ST04-003', type: 'Planned Outage Inspection', technician: 'Team Beta', description: 'Annual inspection at 8,000 EOH. Normal wear found. Unit in good condition for a 22,500 h life-to-date asset.', findings: 'All turbine components within limits. Seal strips replaced as scheduled. Efficiency maintained.', partsReplaced: ['Turbine seal strips (full set)', 'Lube oil (×200 L)'], durationHours: 72, result: 'COMPLETED', hoursAtService: 8000 },
  ],
  'GEN-01': [
    { timestamp: '2025-10-15T08:00:00Z', orderNumber: 'WO-2025-GEN01-006', type: 'Hydrogen System Inspection', technician: 'Gas System Team — C. Oliveira', description: 'Annual hydrogen system inspection. Purity, pressure, and gas-tightness verified. Gas dryer function and hydrogen cooler performance checked.', findings: 'Hydrogen purity 99.8% — nominal. No leaks detected. Gas dryer capacity adequate. Cooler water flow nominal.', partsReplaced: ['H2 system O-rings (×8)', 'Gas dryer desiccant (×4 cartridges)'], durationHours: 16, result: 'COMPLETED', hoursAtService: 17500 },
    { timestamp: '2025-04-22T07:00:00Z', orderNumber: 'WO-2025-GEN01-005', type: 'Major Stator & Rotor Inspection', technician: 'Siemens Energy Generators Team', description: 'Planned major inspection at 7,200 h equivalent. Stator winding re-wedged. Rotor balance verified. Exciter diodes all replaced.', findings: 'Stator wedge looseness in 12 slots — re-wedged with epoxy. Rotor balance within ISO 2.5. PD levels reduced after re-wedging.', partsReplaced: ['Stator slot wedges (×12)', 'Exciter diodes (full set)', 'Air cooler gaskets'], durationHours: 240, result: 'COMPLETED', hoursAtService: 7200 },
    { timestamp: '2024-09-10T08:00:00Z', orderNumber: 'WO-2024-GEN01-004', type: 'Insulation Resistance & PD Test', technician: 'Electrical Test Team', description: 'Annual insulation resistance and partial discharge testing. High insulation resistance confirms excellent winding condition.', findings: 'Insulation resistance 1,200 MΩ — well above 200 MΩ limit. Polarization index 2.8. No partial discharge activity detected.', partsReplaced: [], durationHours: 8, result: 'COMPLETED', hoursAtService: 14500 },
    { timestamp: '2023-11-20T08:00:00Z', orderNumber: 'WO-2023-GEN01-003', type: 'Bearing & Cooling System Service', technician: 'Team Xi', description: 'Annual bearing inspection and cooling system service. Drive-end and non-drive-end bearings checked. Stator cooling water quality verified.', findings: 'Bearings: DE 0.45 mm/s, NDE 0.51 mm/s — both within limits. Cooling water conductivity 0.5 μS/cm — excellent.', partsReplaced: ['Bearing seals (×2)', 'Cooling water deionization filter (×1)'], durationHours: 24, result: 'COMPLETED', hoursAtService: 12000 },
    { timestamp: '2022-12-05T07:00:00Z', orderNumber: 'WO-2022-GEN01-002', type: 'Transformer & Protection System Test', technician: 'Electrical Team', description: 'Annual protection relay calibration and transformer oil analysis. All protection functions tested including differential and over-excitation.', findings: 'All relays calibrated within tolerance. Transformer oil in excellent condition. Protection coordination verified with utility.', partsReplaced: ['Protection relay battery backup (×2)'], durationHours: 16, result: 'COMPLETED', hoursAtService: 8000 },
    { timestamp: '2021-06-20T06:00:00Z', orderNumber: 'WO-2021-GEN01-001', type: 'Commissioning (1500 MVA Generator)', technician: 'Siemens Energy Commissioning Team', description: 'Generator commissioned. Hydrogen filling and gas purity verification, synchronization to grid, and full-load test performed.', findings: 'No commissioning defects. Output power 1,420 MW at rated conditions. Power factor 0.85 — excellent.', partsReplaced: [], durationHours: 480, result: 'COMPLETED', hoursAtService: 0 },
  ],
  'GT-10': [
    { timestamp: '2025-10-15T08:00:00Z', orderNumber: 'WO-2025-GT10-003', type: 'Filter Replacement (Early)', technician: 'M. Al-Sayyid', description: 'Inlet filters replaced at 2,000 EOH (schedule calls for 2,500 EOH) due to Khamsin dust storm season. Preventive early replacement.', findings: 'Filters 60% loaded — Khamsin season caused accelerated loading. Preventive replacement appropriate.', partsReplaced: ['All filter stages (×12 elements)'], durationHours: 4, result: 'COMPLETED', hoursAtService: 2000 },
    { timestamp: '2025-04-20T07:00:00Z', orderNumber: 'WO-2025-GT10-002', type: 'Annual Inspection', technician: 'O. Khalil', description: 'Annual inspection per OEM schedule. All systems checked. Unit in excellent condition for a newer asset.', findings: 'Combustion system in excellent condition. Fuel Wobbe index stable — no nozzle deposits. All safety systems functional.', partsReplaced: ['Igniter plugs (×2)', 'Fuel nozzle strainers (×6)'], durationHours: 16, result: 'COMPLETED', hoursAtService: 1500 },
    { timestamp: '2024-05-20T06:00:00Z', orderNumber: 'WO-2024-GT10-001', type: 'Commissioning (Remote Site)', technician: 'Siemens Energy Commissioning Team', description: 'Unit commissioned for remote water treatment facility. Auto-start system verified. No grid connection — island mode only.', findings: 'Auto-start tested: cold start to full load in 12 minutes — within 15 minute specification. All systems nominal.', partsReplaced: [], durationHours: 120, result: 'COMPLETED', hoursAtService: 0 },
  ],
  'GT-11': [
    { timestamp: '2025-11-25T08:00:00Z', orderNumber: 'WO-2025-GT11-004', type: 'Auto-Start System Test', technician: 'Controls Team — J. Mwangi', description: 'Monthly auto-start system test. Hospital campus requires guaranteed backup power within 10 seconds of main supply failure.', findings: 'Auto-start test: 0 to 5 kV bus restore in 8.5 seconds — within 10 second requirement. LPG switchover also tested successfully.', partsReplaced: [], durationHours: 4, result: 'COMPLETED', hoursAtService: 4600 },
    { timestamp: '2025-07-10T07:00:00Z', orderNumber: 'WO-2025-GT11-003', type: 'Lube Oil Analysis', technician: 'K. Ngugi', description: 'First lube oil analysis at 2,000 EOH. Standby/intermittent operation profile checked.', findings: 'Oil in excellent condition despite mixed standby/running duty. Viscosity nominal. No contamination.', partsReplaced: ['Oil filter elements (×2)'], durationHours: 6, result: 'COMPLETED', hoursAtService: 2000 },
    { timestamp: '2025-01-15T08:00:00Z', orderNumber: 'WO-2025-GT11-002', type: 'Annual Safety System Inspection', technician: 'Safety Team', description: 'Annual inspection of fuel trip valves, firegas detectors, and emergency shutdown systems. Hospital critical power — zero-compromise safety required.', findings: 'All safety systems functional. Fuel trip valve response time <0.2 s. Gas detectors calibrated. ESD logic tested.', partsReplaced: ['Gas detector membranes (×4)', 'Fuel trip valve seals (×2)'], durationHours: 12, result: 'COMPLETED', hoursAtService: 1500 },
    { timestamp: '2024-03-15T06:00:00Z', orderNumber: 'WO-2024-GT11-001', type: 'Commissioning (Hospital Campus)', technician: 'Siemens Energy Commissioning Team', description: 'Unit commissioned for hospital critical power. Dual-fuel switchover (NG to LPG) verified. Automatic load transfer tested.', findings: 'All commissioning requirements met. Dual-fuel switchover in <5 seconds. Load transfer to hospital bus seamless.', partsReplaced: [], durationHours: 168, result: 'COMPLETED', hoursAtService: 0 },
  ],
  'GT-12': [
    { timestamp: '2026-03-11T06:00:00Z', orderNumber: 'WO-2026-GT12-010', type: 'CRITICAL: Emergency Shutdown Initiated', technician: 'Emergency Team — Siemens Energy', description: 'CRITICAL: Simultaneous vibration (7.9 mm/s bearing #1) and exhaust temperature (642°C) exceedances. Emergency shutdown initiated. Grid operator notified. Backup GT-05 activated.', findings: 'Root cause suspected: hot-section thermal fatigue distress causing stage 1 blade liberation event. Unit remains shut down pending full forensic inspection.', partsReplaced: ['PENDING — forensic inspection in progress'], durationHours: 12, result: 'COMPLETED_WITH_FINDINGS', hoursAtService: 29800 },
    { timestamp: '2025-11-10T07:00:00Z', orderNumber: 'WO-2025-GT12-009', type: 'Hot Gas Path Inspection (Extended)', technician: 'Team Rho — G. Mitchell', description: 'Extended HGP at 28,000 EOH — overhaul overdue (should be at 24,000 h). Extensive inspection of all hot-section components.', findings: 'Stage 1 blades at 118% of creep limit — overhauled is overdue. TBC on 6 blades spalled. Transition pieces oxidized. Major overhaul URGENTLY recommended.', partsReplaced: ['6× stage 1 blade TBC re-coatings', 'All transition pieces', 'Combustion liner segments (×8)'], durationHours: 336, result: 'COMPLETED_WITH_FINDINGS', hoursAtService: 28000 },
    { timestamp: '2024-06-20T07:00:00Z', orderNumber: 'WO-2024-GT12-008', type: 'Combustion Inspection', technician: 'Team Alpha — T. Brooks', description: 'CI at 24,000 EOH. Combustion system inspected. HGP overhaul deferred per grid operator request — SERC capacity constraints.', findings: 'Fuel nozzles at replacement limit — all replaced. Combustion liners at 22% wear — above 20% limit, but deferred per grid constraints.', partsReplaced: ['All fuel nozzles (×16)', 'Combustion liners #3, #7, #12 (emergency replacement)'], durationHours: 96, result: 'COMPLETED_WITH_FINDINGS', hoursAtService: 24000 },
    { timestamp: '2023-08-15T08:00:00Z', orderNumber: 'WO-2023-GT12-007', type: 'Hot Gas Path Inspection', technician: 'Team Beta', description: 'HGP at 20,000 EOH. All components within limits. Overhaul planning for 24,000 h interval commenced.', findings: 'Stage 1 blades at 74% of creep limit — acceptable. TBC intact. No immediate corrective action required.', partsReplaced: ['Stage 1 nozzle seals (×4)', 'Combustion liner gaskets (×16)'], durationHours: 168, result: 'COMPLETED', hoursAtService: 20000 },
    { timestamp: '2022-03-10T07:00:00Z', orderNumber: 'WO-2022-GT12-006', type: 'Major Overhaul', technician: 'Siemens Energy MRO Team', description: 'First major overhaul at 12,000 EOH. All blade rows inspected and re-coated. Compressor overhauled. Rotor balanced. Unit returned to service.', findings: 'All components within inspection criteria. Re-coated all stage 1–2 blades. Compressor efficiency improved post-overhaul.', partsReplaced: ['All blade TBC coatings', 'All main bearings', 'All seal strips and gaskets'], durationHours: 480, result: 'COMPLETED', hoursAtService: 12000 },
    { timestamp: '2020-09-15T06:00:00Z', orderNumber: 'WO-2020-GT12-001', type: 'Commissioning (274 MW H-class)', technician: 'Siemens Energy Commissioning Team', description: 'Unit commissioned at Plant Rho for SERC grid. Load ramp from 0 to 274 MW completed. All 60 Hz systems verified.', findings: 'Commissioning completed without issues. Output 276 MW at 60 Hz — above nameplate. NOx 23 ppm. Unit in commercial operation.', partsReplaced: [], durationHours: 480, result: 'COMPLETED', hoursAtService: 0 },
  ],
  'GEN-02': [
    { timestamp: '2025-04-22T07:00:00Z', orderNumber: 'WO-2025-GEN02-005', type: 'Major Inspection at 7,200 EOH', technician: 'Siemens Energy Generators Team', description: 'Major inspection at 7,200 EOH. Stator winding re-wedged, rotor balance verified. Exciter diodes replaced as a set.', findings: 'Stator winding in excellent condition — re-wedged as per schedule. Rotor unbalance within ISO 2.5. No PD activity.', partsReplaced: ['Exciter diodes (full set)', 'Air cooler gaskets (×6)', 'Stator slot wedges (×6)'], durationHours: 200, result: 'COMPLETED', hoursAtService: 7200 },
    { timestamp: '2024-09-15T08:00:00Z', orderNumber: 'WO-2024-GEN02-004', type: 'Insulation & PD Testing', technician: 'Electrical Test Team', description: 'Annual insulation resistance and PD testing. Unit in excellent electrical condition.', findings: 'IR: 950 MΩ (limit 200 MΩ). PI: 2.6. No PD detected. Excellent insulation condition.', partsReplaced: [], durationHours: 8, result: 'COMPLETED', hoursAtService: 8500 },
    { timestamp: '2023-10-10T07:00:00Z', orderNumber: 'WO-2023-GEN02-003', type: 'Bearing & Cooling System Service', technician: 'Team Sigma — M. Dubois', description: 'Annual bearing and cooling system inspection. Air coolers and lube system checked.', findings: 'Drive-end bearing 0.45 mm/s. NDE bearing 0.51 mm/s. Air coolers clean. Lube oil clean. All systems nominal.', partsReplaced: ['Bearing seal sets (×2)', 'Air filter elements (×8)'], durationHours: 20, result: 'COMPLETED', hoursAtService: 7000 },
    { timestamp: '2022-08-20T08:00:00Z', orderNumber: 'WO-2022-GEN02-002', type: 'Protection Relay Calibration', technician: 'Electrical Protection Team', description: 'Annual protection relay calibration. Differential, over-excitation, and loss-of-field protection tested.', findings: 'All relays calibrated within tolerance. Field protection coordination with grid operator confirmed.', partsReplaced: ['Relay battery backup units (×2)'], durationHours: 12, result: 'COMPLETED', hoursAtService: 5500 },
    { timestamp: '2021-02-10T06:00:00Z', orderNumber: 'WO-2021-GEN02-001', type: 'Commissioning (130 MVA Generator)', technician: 'Siemens Energy Commissioning Team', description: 'Air-cooled generator commissioned at Plant Sigma. Synchronization to 50 Hz grid. Full-load test at 121 MW.', findings: 'No commissioning defects. Power factor 0.85 achieved. THD <2% — excellent power quality.', partsReplaced: [], durationHours: 240, result: 'COMPLETED', hoursAtService: 0 },
  ],
}

export function getMaintenanceHistory(turbineId) {
  return MAINTENANCE_HISTORIES[turbineId] || []
}

// ── Metric Parameters Definition (OEM-aligned per Siemens Energy GS D) ────────
export const metricParams = [
  { key: 'tet',               label: 'TET (Exhaust Temp)',       unit: '°C',   decimals: 1 },
  { key: 'pcd',               label: 'PCD (Compr. Disch. Press)', unit: 'bar',  decimals: 1 },
  { key: 'tcd',               label: 'TCD (Compr. Disch. Temp)', unit: '°C',   decimals: 1 },
  { key: 'rotationalSpeed',   label: 'Rotational Speed',         unit: 'RPM',  decimals: 0 },
  { key: 'vibrationVelocity', label: 'Vibration Velocity (RMS)', unit: 'mm/s', decimals: 3 },
  { key: 'powerOutput',       label: 'Power Output',             unit: 'MW-e', decimals: 2 },
  { key: 'fuelMassFlow',      label: 'Fuel Mass Flow',           unit: 'kg/s', decimals: 3 },
  { key: 'pressureRatio',     label: 'Pressure Ratio',           unit: ':1',   decimals: 1 },
  { key: 'tetSpread',         label: 'TET Spread',               unit: '°C',   decimals: 1 },
  { key: 'eoh',               label: 'EOH (Equiv. Oper. Hours)', unit: 'h',    decimals: 0 },
]

// Metrics to track in history (all except eoh which is cumulative)
export const historyMetricKeys = ['tet', 'pcd', 'tcd', 'rotationalSpeed', 'vibrationVelocity', 'powerOutput', 'fuelMassFlow', 'pressureRatio', 'tetSpread']

// ── Thresholds for alerts ─────────────────────────────────────────────────────
// Vibration: ISO 10816-4 zones for gas/steam turbines:
//   Zone A ≤ 3.5 mm/s RMS → newly commissioned
//   Zone B 3.5–7.1 mm/s RMS → acceptable for long-term operation
//   Zone C 7.1–11.2 mm/s RMS → short-term acceptable (RISK)
//   Zone D > 11.2 mm/s RMS → damage likely (NOK)
// TET Spread: >50°C is a critical warning indicator per research baseline
export const thresholds = {
  tet: { warning: 590, critical: 630 },
  tetSpread: { warning: 40, critical: 50 },
  vibrationVelocity: { warning: 7.1, critical: 11.2 },
}

// ── EOH Formula (per Siemens Energy maintenance philosophy) ───────────────────
// EOH = H_base × F_fuel × F_peak + (N_starts × F_start)
//   F_fuel:  1.0 for natural gas, 1.5 for liquid fuel
//   F_peak:  1.0 at base load, increases for above-base-load operation
//   F_start: 20–50 equivalent hours per start (depends on turbine class)
export function calculateEOH({ baseHours, fuelFactor, peakFactor, startCount, startFactor }) {
  return baseHours * fuelFactor * peakFactor + (startCount * startFactor)
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
  // Fallbacks are safe defaults for mid-range gas turbines; all 18 records
  // now provide explicit values so these only guard against future omissions.
  return {
    tet: generateInitialHistory(baseline.tet, 8, count),
    pcd: generateInitialHistory(baseline.pcd ?? 18, 0.5, count),
    tcd: generateInitialHistory(baseline.tcd ?? 420, 4, count),
    rotationalSpeed: generateInitialHistory(baseline.rotationalSpeed, 30, count),
    vibrationVelocity: generateInitialHistory(baseline.vibrationVelocity, 0.15, count),
    powerOutput: generateInitialHistory(baseline.powerOutput, 2, count),
    fuelMassFlow: generateInitialHistory(baseline.fuelMassFlow, 0.1, count),
    pressureRatio: generateInitialHistory(baseline.pressureRatio ?? 20, 0.3, count),
    tetSpread: generateInitialHistory(baseline.tetSpread ?? 15, 2, count),
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
//
// Prefix with import.meta.env.BASE_URL so the paths resolve correctly both in
// local dev (BASE_URL = '/') and in production (BASE_URL = '/siemens/').
const baseUrl = import.meta.env.BASE_URL ?? '/'
const IMAGE_SLOTS = [
  `${baseUrl}images/turbine-01.jpg`,
  `${baseUrl}images/turbine-02.jpg`,
  `${baseUrl}images/turbine-03.jpg`,
  `${baseUrl}images/turbine-04.jpg`,
  `${baseUrl}images/turbine-05.jpg`,
  `${baseUrl}images/turbine-06.jpg`,
  `${baseUrl}images/turbine-07.jpg`,
  `${baseUrl}images/turbine-08.jpg`,
  `${baseUrl}images/turbine-09.jpg`,
  `${baseUrl}images/turbine-10.jpg`,
  `${baseUrl}images/turbine-11.jpg`,
  `${baseUrl}images/turbine-12.jpg`,
  `${baseUrl}images/turbine-13.jpg`,
  `${baseUrl}images/turbine-14.jpg`,
  `${baseUrl}images/turbine-15.jpg`,
  `${baseUrl}images/turbine-16.jpg`,
  `${baseUrl}images/turbine-17.jpg`,
  `${baseUrl}images/turbine-18.jpg`,
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
  return makeFallbackSvg(name, '', color)
}

// ── Type-specific SVG machine drawings for image fallbacks ────────────────────
export function makeFallbackSvg(name, type, color) {
  const svgColor = color || '#2dd4bf'
  const equipmentType = (type || '').toLowerCase()
  let drawing

  if (equipmentType.includes('steam turbine')) {
    // Steam turbine: wide, low profile with steam pipes
    drawing = `
      <rect x="30" y="82" width="140" height="48" rx="4" fill="none" stroke="${svgColor}" stroke-width="1.5" opacity="0.85"/>
      <rect x="86" y="42" width="28" height="42" fill="none" stroke="${svgColor}" stroke-width="1.4" opacity="0.75"/>
      <rect x="80" y="36" width="40" height="8" rx="2" fill="none" stroke="${svgColor}" stroke-width="1.2" opacity="0.7"/>
      <line x1="56" y1="82" x2="56" y2="130" stroke="${svgColor}" stroke-width="1" opacity="0.35"/>
      <line x1="82" y1="82" x2="82" y2="130" stroke="${svgColor}" stroke-width="1" opacity="0.35"/>
      <line x1="108" y1="82" x2="108" y2="130" stroke="${svgColor}" stroke-width="1" opacity="0.35"/>
      <line x1="134" y1="82" x2="134" y2="130" stroke="${svgColor}" stroke-width="1" opacity="0.35"/>
      <rect x="86" y="128" width="28" height="22" fill="none" stroke="${svgColor}" stroke-width="1.2" opacity="0.6"/>
      <circle cx="30" cy="106" r="7" fill="none" stroke="${svgColor}" stroke-width="1.2" opacity="0.5"/>
      <circle cx="170" cy="106" r="7" fill="none" stroke="${svgColor}" stroke-width="1.2" opacity="0.5"/>
      <line x1="8" y1="106" x2="37" y2="106" stroke="${svgColor}" stroke-width="1.8" opacity="0.5"/>
      <line x1="163" y1="106" x2="192" y2="106" stroke="${svgColor}" stroke-width="1.8" opacity="0.5"/>`
  } else if (equipmentType.includes('generator')) {
    // Generator: long cylinder with cooling fins and shaft ends
    drawing = `
      <rect x="18" y="76" width="164" height="58" rx="28" fill="none" stroke="${svgColor}" stroke-width="1.5" opacity="0.85"/>
      <line x1="52" y1="76" x2="52" y2="134" stroke="${svgColor}" stroke-width="1" opacity="0.35"/>
      <line x1="76" y1="76" x2="76" y2="134" stroke="${svgColor}" stroke-width="1" opacity="0.35"/>
      <line x1="100" y1="76" x2="100" y2="134" stroke="${svgColor}" stroke-width="1" opacity="0.35"/>
      <line x1="124" y1="76" x2="124" y2="134" stroke="${svgColor}" stroke-width="1" opacity="0.35"/>
      <line x1="148" y1="76" x2="148" y2="134" stroke="${svgColor}" stroke-width="1" opacity="0.35"/>
      <rect x="6" y="85" width="14" height="40" rx="3" fill="none" stroke="${svgColor}" stroke-width="1.2" opacity="0.6"/>
      <rect x="180" y="85" width="14" height="40" rx="3" fill="none" stroke="${svgColor}" stroke-width="1.2" opacity="0.6"/>
      <line x1="1" y1="105" x2="20" y2="105" stroke="${svgColor}" stroke-width="2" opacity="0.6"/>
      <line x1="180" y1="105" x2="199" y2="105" stroke="${svgColor}" stroke-width="2" opacity="0.6"/>
      <rect x="78" y="62" width="44" height="16" rx="3" fill="none" stroke="${svgColor}" stroke-width="1.2" opacity="0.7"/>
      <circle cx="100" cy="105" r="14" fill="none" stroke="${svgColor}" stroke-width="1" opacity="0.3"/>
      <circle cx="100" cy="105" r="4" fill="${svgColor}" opacity="0.4"/>`
  } else if (equipmentType.includes('aeroderivative')) {
    // Aeroderivative: slim jet-engine style with fan face
    drawing = `
      <ellipse cx="32" cy="100" rx="18" ry="28" fill="none" stroke="${svgColor}" stroke-width="1.5" opacity="0.75"/>
      <line x1="32" y1="72" x2="32" y2="100" stroke="${svgColor}" stroke-width="1" opacity="0.4"/>
      <line x1="44" y1="76" x2="32" y2="100" stroke="${svgColor}" stroke-width="1" opacity="0.4"/>
      <line x1="50" y1="88" x2="32" y2="100" stroke="${svgColor}" stroke-width="1" opacity="0.4"/>
      <line x1="14" y1="76" x2="32" y2="100" stroke="${svgColor}" stroke-width="1" opacity="0.4"/>
      <line x1="14" y1="124" x2="32" y2="100" stroke="${svgColor}" stroke-width="1" opacity="0.4"/>
      <line x1="44" y1="124" x2="32" y2="100" stroke="${svgColor}" stroke-width="1" opacity="0.4"/>
      <rect x="50" y="87" width="112" height="26" rx="13" fill="none" stroke="${svgColor}" stroke-width="1.5" opacity="0.85"/>
      <rect x="80" y="89" width="46" height="22" rx="3" fill="none" stroke="${svgColor}" stroke-width="1" opacity="0.5"/>
      <line x1="103" y1="87" x2="103" y2="113" stroke="${svgColor}" stroke-width="1" opacity="0.4"/>
      <line x1="118" y1="87" x2="118" y2="113" stroke="${svgColor}" stroke-width="1" opacity="0.4"/>
      <polygon points="162,91 188,96 188,104 162,109" fill="none" stroke="${svgColor}" stroke-width="1.4" stroke-linejoin="round" opacity="0.75"/>
      <circle cx="192" cy="100" r="3" fill="${svgColor}" opacity="0.3"/>
      <circle cx="196" cy="97" r="2" fill="${svgColor}" opacity="0.2"/>
      <circle cx="196" cy="103" r="2" fill="${svgColor}" opacity="0.2"/>`
  } else if (equipmentType.includes('small')) {
    // Small industrial gas turbine: compact enclosed package
    drawing = `
      <rect x="35" y="66" width="130" height="78" rx="6" fill="none" stroke="${svgColor}" stroke-width="1.5" opacity="0.85"/>
      <polygon points="10,86 35,76 35,124 10,114" fill="none" stroke="${svgColor}" stroke-width="1.3" opacity="0.75"/>
      <rect x="40" y="73" width="44" height="64" rx="3" fill="none" stroke="${svgColor}" stroke-width="1" opacity="0.5"/>
      <line x1="54" y1="73" x2="54" y2="137" stroke="${svgColor}" stroke-width="0.8" opacity="0.35"/>
      <line x1="67" y1="73" x2="67" y2="137" stroke="${svgColor}" stroke-width="0.8" opacity="0.35"/>
      <line x1="78" y1="73" x2="78" y2="137" stroke="${svgColor}" stroke-width="0.8" opacity="0.35"/>
      <circle cx="110" cy="105" r="20" fill="none" stroke="${svgColor}" stroke-width="1.3" opacity="0.65"/>
      <circle cx="110" cy="105" r="8" fill="none" stroke="${svgColor}" stroke-width="1" opacity="0.35"/>
      <polygon points="155,76 192,86 192,114 155,124" fill="none" stroke="${svgColor}" stroke-width="1.3" opacity="0.75"/>
      <line x1="10" y1="100" x2="192" y2="100" stroke="${svgColor}" stroke-width="0.8" opacity="0.15" stroke-dasharray="5,4"/>`
  } else {
    // Default heavy-duty / industrial gas turbine (H-class, F-class, industrial)
    drawing = `
      <polygon points="12,82 46,70 46,130 12,118" fill="none" stroke="${svgColor}" stroke-width="1.5" stroke-linejoin="round" opacity="0.85"/>
      <rect x="46" y="70" width="42" height="60" rx="2" fill="none" stroke="${svgColor}" stroke-width="1.5" opacity="0.75"/>
      <line x1="57" y1="70" x2="57" y2="130" stroke="${svgColor}" stroke-width="0.9" opacity="0.4"/>
      <line x1="67" y1="70" x2="67" y2="130" stroke="${svgColor}" stroke-width="0.9" opacity="0.4"/>
      <line x1="77" y1="70" x2="77" y2="130" stroke="${svgColor}" stroke-width="0.9" opacity="0.4"/>
      <rect x="88" y="64" width="42" height="72" rx="4" fill="none" stroke="${svgColor}" stroke-width="1.5" opacity="0.75"/>
      <ellipse cx="109" cy="78" rx="11" ry="5.5" fill="none" stroke="${svgColor}" stroke-width="1" opacity="0.5"/>
      <ellipse cx="109" cy="100" rx="11" ry="5.5" fill="none" stroke="${svgColor}" stroke-width="1" opacity="0.5"/>
      <ellipse cx="109" cy="122" rx="11" ry="5.5" fill="none" stroke="${svgColor}" stroke-width="1" opacity="0.5"/>
      <rect x="130" y="74" width="32" height="52" rx="2" fill="none" stroke="${svgColor}" stroke-width="1.5" opacity="0.75"/>
      <line x1="140" y1="74" x2="140" y2="126" stroke="${svgColor}" stroke-width="0.9" opacity="0.4"/>
      <line x1="151" y1="74" x2="151" y2="126" stroke="${svgColor}" stroke-width="0.9" opacity="0.4"/>
      <polygon points="162,70 190,82 190,118 162,130" fill="none" stroke="${svgColor}" stroke-width="1.5" stroke-linejoin="round" opacity="0.85"/>
      <line x1="12" y1="100" x2="190" y2="100" stroke="${svgColor}" stroke-width="0.8" opacity="0.12" stroke-dasharray="4,4"/>`
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <rect fill="#0f172a" width="200" height="200" rx="8"/>
    ${drawing}
    <text fill="${svgColor}" font-family="system-ui,sans-serif" font-size="11" font-weight="bold" text-anchor="middle" x="100" y="158">${name}</text>
    <text fill="#475569" font-family="system-ui,sans-serif" font-size="8" text-anchor="middle" x="100" y="171">SIEMENS ENERGY</text>
  </svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

// ── OK card insight data ───────────────────────────────────────────────────────
// Keeps the green banner text short — these cards need minimal attention.
// The seed ensures each turbine gets a stable, deterministic message.
export function getOkCardInsight(turbine) {
  const hours = Math.floor(turbine.eoh)
  const days = Math.floor(hours / 24)
  const cappedDays = Math.min(days, 30)
  const seed = turbine.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)

  // Short, varied banners — no deviation history available, so keep it factual
  const okHeadlines = [
    `All nominal · No deviations in ${cappedDays}d`,
    `Healthy · Last anomaly >${cappedDays}d ago`,
    `All KPIs in tolerance · ${cappedDays}d clean`,
    `Nominal readings · No action needed`,
    `Within limits · ${cappedDays}d anomaly-free`,
    `Stable · No alerts in ${cappedDays} days`,
    `All parameters nominal · No action`,
    `Clean run · ${cappedDays}d since last flag`,
  ]

  const stableStr = okHeadlines[seed % okHeadlines.length]
  return { stableStr }
}

// ── Operating ranges for normalized variation (based on randomWalk min/max) ────
const METRIC_OPERATING_RANGES = {
  tet:               { min: 420, max: 670 },    // °C
  pcd:               { min: 5, max: 45 },       // bar
  tcd:               { min: 300, max: 500 },     // °C
  rotationalSpeed:   { min: 2800, max: 20000 },  // RPM
  vibrationVelocity: { min: 0.3, max: 12.0 },    // mm/s RMS (ISO 10816-4 range)
  powerOutput:       { min: 1, max: 1500 },       // MW-e
  fuelMassFlow:      { min: 0.05, max: 16.0 },    // kg/s
  pressureRatio:     { min: 10, max: 25 },         // :1
  tetSpread:         { min: 0, max: 80 },          // °C
}

// ── Determine most critical / most variant metric key for a turbine ────────────
export function getMostCriticalMetricKey(turbine) {
  // Always surface an actively alarming metric first
  if (turbine.vibrationVelocity > thresholds.vibrationVelocity.critical) return 'vibrationVelocity'
  if (turbine.tet > thresholds.tet.critical) return 'tet'
  if (turbine.tetSpread > thresholds.tetSpread.critical) return 'tetSpread'
  if (turbine.vibrationVelocity > thresholds.vibrationVelocity.warning) return 'vibrationVelocity'
  if (turbine.tet > thresholds.tet.warning) return 'tet'
  if (turbine.tetSpread > thresholds.tetSpread.warning) return 'tetSpread'

  // For OK turbines: pick the metric with the greatest *normalized* variation
  // (max − min in history / operating range) so large-scale metrics like RPM
  // don't automatically dominate over fast-changing ones like vibration.
  if (turbine.metricHistory) {
    let bestKey = 'tet'
    let bestVariation = -Infinity
    for (const key of historyMetricKeys) {
      const hist = turbine.metricHistory[key]
      if (!hist || hist.length < 2) continue
      const bounds = METRIC_OPERATING_RANGES[key]
      if (!bounds) continue
      const range = bounds.max - bounds.min
      const variation = (Math.max(...hist) - Math.min(...hist)) / range
      if (variation > bestVariation) {
        bestVariation = variation
        bestKey = key
      }
    }
    return bestKey
  }

  return 'tet'
}

// ── Manual URL Map — Real Siemens Energy Product Pages ─────────────────────────
// Sources: Official Siemens Energy product catalogue + GT Portfolio Brochure 2024
const MANUAL_URLS = {
  // Heavy-duty gas turbines
  'SGT5-9000HL': 'https://www.siemens-energy.com/global/en/home/products-services/product/sgt5-9000hl.html',
  'SGT6-9000HL': 'https://www.siemens-energy.com/global/en/home/products-services/product/sgt6-9000hl-heavy-duty-gas-turbine.html',
  'SGT5-8000H':  'https://www.siemens-energy.com/global/en/home/products-services/product/sgt5-8000h.html',
  'SGT6-8000H':  'https://www.siemens-energy.com/global/en/home/products-services/product/sgt6-8000h.html',
  'SGT5-4000F':  'https://www.siemens-energy.com/global/en/home/products-services/product/sgt5-4000f.html',
  'SGT6-5000F':  'https://www.siemens-energy.com/global/en/home/products-services/product/sgt6-5000f.html',
  // Industrial gas turbines
  'SGT-800':     'https://www.siemens-energy.com/global/en/home/products-services/product/sgt-800.html',
  'SGT-750':     'https://www.siemens-energy.com/global/en/home/products-services/product/sgt-750.html',
  'SGT-700':     'https://www.siemens-energy.com/global/en/home/products-services/product/sgt-700.html',
  'SGT-600':     'https://www.siemens-energy.com/global/en/home/products-services/product/sgt-600.html',
  'SGT-400':     'https://www.siemens-energy.com/global/en/home/products-services/product/sgt-400.html',
  'SGT-100':     'https://www.siemens-energy.com/global/en/home/products-services/product/sgt-100.html',
  // Aeroderivative gas turbine
  'SGT-A65':     'https://www.siemens-energy.com/global/en/home/products-services/product/sgt-a65.html',
  // Steam turbines
  'SST-6000':    'https://www.siemens-energy.com/global/en/home/products-services/product/sst-6000.html',
  'SST-800':     'https://www.siemens-energy.com/global/en/home/products-services/product/sst-800.html',
  'SST-400':     'https://www.siemens-energy.com/global/en/home/products-services/product/sst-400.html',
  // Generators
  'SGen-1000A':  'https://www.siemens-energy.com/global/en/home/products-services/product/sgen-1000a.html',
  'SGen-100A':   'https://www.siemens-energy.com/global/en/home/products-services/product/sgen-100a.html',
}
const MANUAL_FALLBACK_URL = 'https://www.siemens-energy.com/global/en/home/products-services/product-offerings/gas-turbines.html'

/**
 * Open the official Siemens Energy product page for the given equipment model.
 * Falls back to the general gas turbine portfolio page if no exact match.
 */
export function openManual(equipment) {
  const url = MANUAL_URLS[equipment.name] || MANUAL_FALLBACK_URL
  window.open(url, '_blank')
  if (!MANUAL_URLS[equipment.name]) {
    console.warn(`[openManual] No exact manual URL for model "${equipment.name}" — opened fallback.`)
  }
}

/**
 * Get the manual URL for the given equipment (for use in href attributes).
 */
export function getManualUrl(equipment) {
  return MANUAL_URLS[equipment.name] || MANUAL_FALLBACK_URL
}

// ── Equipment Category Helpers ────────────────────────────────────────────────
/** Returns true for gas turbines (Brayton cycle — have TET, PCD, TCD, etc.) */
export function isGasTurbine(equipment) {
  return equipment.name.startsWith('SGT')
}

/** Returns true for steam turbines (Rankine cycle only — no Brayton parameters) */
export function isSteamTurbine(equipment) {
  return equipment.name.startsWith('SST')
}

/** Returns true for generators (no thermodynamic cycle parameters) */
export function isGenerator(equipment) {
  return equipment.name.startsWith('SGen')
}

// ── Fleet Data — 18 Distinct Real-World Assets ────────────────────────────────
export function createFleetData() {
  return [
    // ── 1. SGT5-8000H ─────────────────────────────────────────────────────────
    {
      id: 'GT-01',
      name: 'SGT5-8000H',
      type: 'H-class Heavy-Duty Gas Turbine',
      description: '450 MW combined cycle H-class',
      location: 'Irsching 4 — Vohburg an der Donau, DE',
      imageUrl: makeEquipmentImage('SGT5-8000H', '#2dd4bf', 0),
      manualUrl: 'https://www.siemens-energy.com/global/en/home/products-services/product/sgt5-8000h.html',
      status: 'OK',
      currentStatus: 'OK',
      telemetryBaseline: { tet: 560, vibrationVelocity: 1.2, rotationalSpeed: 3000, powerOutput: 450, fuelMassFlow: 14.8, pcd: 19.5, tcd: 430, pressureRatio: 21.0, tetSpread: 18 },
      tet: 545.2,
      pcd: 19.8,
      tcd: 432.5,
      rotationalSpeed: 3000.0,
      vibrationVelocity: 1.245,
      eoh: 8420,
      fuelMassFlow: 14.832,
      powerOutput: 448.7,
      pressureRatio: 21.2,
      tetSpread: 18.4,
      tetAlert: false,
      vibrationAlert: false,
      alert: null,
      metricHistory: generateAllHistories({ tet: 545, rotationalSpeed: 3000, vibrationVelocity: 1.2, powerOutput: 448, fuelMassFlow: 14.8, pcd: 19.5, tcd: 430, pressureRatio: 21.0, tetSpread: 18 }),
      documentation: [
        { title: 'Last Inspection — 2025-12-10', content: 'Hot gas path inspection completed. All combustion liners within tolerance. Next scheduled: 2026-06-10.' },
        { title: 'Bearing Service Log', content: 'Bearing #1-#5 lubrication system checked. Oil quality nominal. Vibration baseline: 1.2 mm/s.' },
        { title: 'Combustion System', content: '16-can combustion system. DLE (Dry Low Emission) burners last replaced at 6,000 hrs. Next replacement at 12,000 hrs.' },
      ],
      aiSuggestion: '',
      maintenanceHistory: getMaintenanceHistory('GT-01'),
    },
    // ── 2. SST-400 ────────────────────────────────────────────────────────────
    {
      id: 'ST-01',
      name: 'SST-400',
      type: 'Industrial Steam Turbine',
      description: '65 MW mechanical drive & power generation steam turbine',
      location: 'Plant Beta — Houston, TX',
      imageUrl: makeEquipmentImage('SST-400', '#fbbf24', 1),
      manualUrl: 'https://www.siemens-energy.com/global/en/home/products-services/product/sst-400.html',
      status: 'RISK',
      currentStatus: 'RISK',
      telemetryBaseline: { tet: 520, vibrationVelocity: 2.0, rotationalSpeed: 3600, powerOutput: 198, fuelMassFlow: 11.4, pcd: 65, tcd: 480, pressureRatio: 0, tetSpread: 42 },
      tet: 608.7,
      pcd: 66.2,
      tcd: 481.3,
      rotationalSpeed: 3600.0,
      vibrationVelocity: 4.712,
      eoh: 23810,
      fuelMassFlow: 11.438,
      powerOutput: 198.45,
      pressureRatio: 0,
      tetSpread: 42.5,
      tetAlert: true,
      vibrationAlert: true,
      alert: 'High vibration detected on bearing #3. Maintenance recommended within 48 h.',
      metricHistory: generateAllHistories({ tet: 608, rotationalSpeed: 3600, vibrationVelocity: 4.7, powerOutput: 198, fuelMassFlow: 11.4, pcd: 65, tcd: 480, pressureRatio: 0, tetSpread: 42 }),
      documentation: [
        { title: 'Alert — Vibration Exceedance', content: 'Bearing #3 vibration exceeded 4.5 mm/s threshold at 2026-03-10 14:32 UTC. Trending upward over 72 hrs.' },
        { title: 'Maintenance History', content: 'Last major overhaul: 2024-01-15 at 18,000 hrs. Blade row 1 replacement completed. Compressor wash performed monthly.' },
        { title: 'Operational Notes', content: 'Unit operates in peaking duty cycle. Frequent start/stop cycles contribute to increased thermal fatigue on hot gas path components.' },
      ],
      aiSuggestion: 'Bearing #3 vibration is trending above 4.5 mm/s. Schedule vibration analysis and bearing inspection within 48 hours to prevent potential rotor imbalance damage.',
      maintenanceHistory: getMaintenanceHistory('ST-01'),
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
      telemetryBaseline: { tet: 540, vibrationVelocity: 0.9, rotationalSpeed: 6608, powerOutput: 48, fuelMassFlow: 3.6, pcd: 19.2, tcd: 395, pressureRatio: 21.5, tetSpread: 15 },
      tet: 545.2,
      pcd: 19.4,
      tcd: 396.2,
      rotationalSpeed: 6608.0,
      vibrationVelocity: 0.892,
      eoh: 5200,
      fuelMassFlow: 3.654,
      powerOutput: 48.92,
      pressureRatio: 21.7,
      tetSpread: 15.3,
      tetAlert: false,
      vibrationAlert: false,
      alert: null,
      metricHistory: generateAllHistories({ tet: 545, rotationalSpeed: 6608, vibrationVelocity: 0.9, powerOutput: 48, fuelMassFlow: 3.6, pcd: 19.2, tcd: 395, pressureRatio: 21.5, tetSpread: 15 }),
      documentation: [
        { title: 'Commissioning Date', content: 'Unit commissioned 2025-06-20. Running on natural gas. Dual-fuel capability available.' },
        { title: 'Performance Log', content: 'Heat rate: 9,480 kJ/kWh. Efficiency: 38.0%. All parameters within design envelope.' },
        { title: 'Filter Status', content: 'Inlet air filtration system — Stage 1 & 2 filters replaced 2026-01-15. Differential pressure nominal.' },
      ],
      aiSuggestion: '',
      maintenanceHistory: getMaintenanceHistory('GT-02'),
    },
    // ── 4. SST-6000 ───────────────────────────────────────────────────────────
    // 3000 RPM = synchronous speed for 50 Hz grid (2-pole generator)
    {
      id: 'ST-02',
      name: 'SST-6000',
      type: 'Large Steam Turbine',
      description: 'Up to 1,200 MW reheat steam turbine for large combined cycle',
      location: 'Plant Delta — Boxberg, DE',
      imageUrl: makeEquipmentImage('SST-6000', '#2dd4bf', 3),
      manualUrl: 'https://www.siemens-energy.com/global/en/home/products-services/product/sst-6000.html',
      status: 'OK',
      currentStatus: 'OK',
      telemetryBaseline: { tet: 460, vibrationVelocity: 1.5, rotationalSpeed: 3000, powerOutput: 900, fuelMassFlow: 2.9, pcd: 165, tcd: 565, pressureRatio: 0, tetSpread: 0 },
      tet: 468.3,
      pcd: 163.8,
      tcd: 563.2,
      rotationalSpeed: 3000.0,
      vibrationVelocity: 1.534,
      eoh: 15600,
      fuelMassFlow: 2.987,
      powerOutput: 895.4,
      pressureRatio: 0,
      tetSpread: 0,
      tetAlert: false,
      vibrationAlert: false,
      alert: null,
      metricHistory: generateAllHistories({ tet: 468, rotationalSpeed: 3000, vibrationVelocity: 1.5, powerOutput: 895, fuelMassFlow: 2.9, pcd: 165, tcd: 565, pressureRatio: 0, tetSpread: 0 }),
      documentation: [
        { title: 'Operational Profile', content: 'Baseload continuous duty in large combined cycle plant. HP/IP/LP turbine sections. Main steam: 165 bar / 565°C. Reheat: 40 bar / 565°C.' },
        { title: 'Last Hot Section Inspection', content: '2025-09-01 at 12,000 hrs. Turbine blades within creep limits. Next HSI at 20,000 hrs.' },
        { title: 'Steam System', content: 'Main steam pressure: 165 bar. Reheat steam: 40 bar. Designed for large combined cycle and fossil power plant applications.' },
      ],
      aiSuggestion: '',
      maintenanceHistory: getMaintenanceHistory('ST-02'),
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
      telemetryBaseline: { tet: 530, vibrationVelocity: 1.8, rotationalSpeed: 9500, powerOutput: 12, fuelMassFlow: 1.6, pcd: 18.5, tcd: 400, pressureRatio: 20.8, tetSpread: 38 },
      tet: 594.8,
      pcd: 18.8,
      tcd: 402.1,
      rotationalSpeed: 9500.0,
      vibrationVelocity: 3.876,
      eoh: 28900,
      fuelMassFlow: 1.623,
      powerOutput: 12.14,
      pressureRatio: 21.0,
      tetSpread: 38.6,
      tetAlert: true,
      vibrationAlert: false,
      alert: 'Exhaust temperature trending high. Combustion inspection advised within 7 days.',
      metricHistory: generateAllHistories({ tet: 594, rotationalSpeed: 9500, vibrationVelocity: 3.8, powerOutput: 12, fuelMassFlow: 1.6, pcd: 18.5, tcd: 400, pressureRatio: 20.8, tetSpread: 38 }),
      documentation: [
        { title: 'Alert — Exhaust Temp Trend', content: 'Exhaust temperature has increased ~15°C over the last 30 days. Potential combustion liner degradation or fuel nozzle fouling.' },
        { title: 'Overhaul Status', content: 'Unit approaching 30,000 hr major overhaul interval. Last overhaul: 2023-05-20. Recommend scheduling during next planned outage.' },
        { title: 'Environmental', content: 'Operating in high-ambient (45°C) conditions. Inlet cooling system active. Dust ingestion filters on accelerated replacement schedule.' },
      ],
      aiSuggestion: 'Exhaust temperature trending 15°C above baseline over 30 days. Inspect combustion liners and fuel nozzles for fouling or degradation before the next load increase.',
      maintenanceHistory: getMaintenanceHistory('GT-03'),
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
      telemetryBaseline: { tet: 550, vibrationVelocity: 1.5, rotationalSpeed: 3600, powerOutput: 58, fuelMassFlow: 5.4, pcd: 30, tcd: 445, pressureRatio: 32, tetSpread: 55 },
      tet: 651.3,
      pcd: 29.4,
      tcd: 443.8,
      rotationalSpeed: 3600.0,
      vibrationVelocity: 7.234,
      eoh: 31200,
      fuelMassFlow: 5.412,
      powerOutput: 58.67,
      pressureRatio: 31.5,
      tetSpread: 56.3,
      tetAlert: true,
      vibrationAlert: true,
      alert: 'CRITICAL: Vibration exceeds 7.0 mm/s on bearing #2. Immediate shutdown recommended.',
      metricHistory: generateAllHistories({ tet: 651, rotationalSpeed: 3600, vibrationVelocity: 7.2, powerOutput: 58, fuelMassFlow: 5.4, pcd: 30, tcd: 445, pressureRatio: 32, tetSpread: 55 }),
      documentation: [
        { title: 'CRITICAL ALERT — Vibration', content: 'Bearing #2 vibration spiked to 7.2 mm/s at 2026-03-11 08:15 UTC. Trip threshold: 8.0 mm/s. Immediate inspection required.' },
        { title: 'Overhaul Overdue', content: 'Unit at 31,200 hours — 1,200 hours past recommended major overhaul interval of 30,000 hours. Deferred due to grid demand constraints.' },
        { title: 'Previous Incidents', content: '2025-08-14: Compressor blade tip rub event. Repaired in-situ. 2025-11-02: Fuel nozzle #4 replaced due to carbon buildup.' },
      ],
      aiSuggestion: 'URGENT: Vibration at 7.2 mm/s on bearing #2 approaching trip threshold. Initiate controlled shutdown and perform emergency bearing inspection to prevent catastrophic rotor damage.',
      maintenanceHistory: getMaintenanceHistory('GT-04'),
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
      telemetryBaseline: { tet: 545, vibrationVelocity: 1.1, rotationalSpeed: 3000, powerOutput: 288, fuelMassFlow: 12.1, pcd: 16.5, tcd: 395, pressureRatio: 18.2, tetSpread: 14 },
      tet: 542.7,
      pcd: 16.7,
      tcd: 396.1,
      rotationalSpeed: 3000.0,
      vibrationVelocity: 1.124,
      eoh: 6850,
      fuelMassFlow: 12.087,
      powerOutput: 287.6,
      pressureRatio: 18.4,
      tetSpread: 14.2,
      tetAlert: false,
      vibrationAlert: false,
      alert: null,
      metricHistory: generateAllHistories({ tet: 542, rotationalSpeed: 3000, vibrationVelocity: 1.1, powerOutput: 288, fuelMassFlow: 12.1, pcd: 16.5, tcd: 395, pressureRatio: 18.2, tetSpread: 14 }),
      documentation: [
        { title: 'Performance Data', content: 'Electrical efficiency: 39.8%. Heat rate: 9,045 kJ/kWh. Operating at 98.6% rated load. All KPIs within design envelope.' },
        { title: 'Maintenance Schedule', content: 'Combustion inspection due at 8,000 hrs (1,150 hrs remaining). Hot gas path inspection at 16,000 hrs.' },
        { title: 'Emissions', content: 'NOx: 25 ppm (within 42 ppm limit). CO: 8 ppm. DLE combustion system fully operational.' },
      ],
      aiSuggestion: '',
      maintenanceHistory: getMaintenanceHistory('GT-05'),
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
      telemetryBaseline: { tet: 538, vibrationVelocity: 2.2, rotationalSpeed: 3600, powerOutput: 228, fuelMassFlow: 9.8, pcd: 17.2, tcd: 400, pressureRatio: 18.8, tetSpread: 36 },
      tet: 603.1,
      pcd: 16.9,
      tcd: 398.5,
      rotationalSpeed: 3600.0,
      vibrationVelocity: 4.018,
      eoh: 19200,
      fuelMassFlow: 9.734,
      powerOutput: 225.3,
      pressureRatio: 18.5,
      tetSpread: 36.7,
      tetAlert: true,
      vibrationAlert: true,
      alert: 'Elevated exhaust temperature (603°C) and vibration trending up. Inspection within 72 h advised.',
      metricHistory: generateAllHistories({ tet: 603, rotationalSpeed: 3600, vibrationVelocity: 4.0, powerOutput: 225, fuelMassFlow: 9.7, pcd: 17.2, tcd: 400, pressureRatio: 18.8, tetSpread: 36 }),
      documentation: [
        { title: 'Alert Summary', content: 'Exhaust temperature 23°C above warning threshold. Vibration on bearing #4 trending: 2.8→4.0 mm/s over 14 days.' },
        { title: 'Maintenance Record', content: 'Last combustion inspection: 2025-06-18 at 16,800 hrs. Fuel nozzles cleaned, liners in good condition.' },
        { title: 'Grid Obligations', content: 'Unit provides 200 MW firm capacity to MISO grid. Any derating requires 48 h advance notice to grid operator.' },
      ],
      aiSuggestion: 'Both exhaust temperature and vibration are elevated simultaneously. Initiate scheduled outage for combustion and bearing inspection. Do not defer beyond 72 hours.',
      maintenanceHistory: getMaintenanceHistory('GT-06'),
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
      telemetryBaseline: { tet: 524, vibrationVelocity: 1.0, rotationalSpeed: 7700, powerOutput: 31, fuelMassFlow: 2.2, pcd: 14.8, tcd: 370, pressureRatio: 18.5, tetSpread: 16 },
      tet: 522.4,
      pcd: 14.9,
      tcd: 371.2,
      rotationalSpeed: 7700.0,
      vibrationVelocity: 0.983,
      eoh: 11200,
      fuelMassFlow: 2.198,
      powerOutput: 31.05,
      pressureRatio: 18.6,
      tetSpread: 16.4,
      tetAlert: false,
      vibrationAlert: false,
      alert: null,
      metricHistory: generateAllHistories({ tet: 522, rotationalSpeed: 7700, vibrationVelocity: 1.0, powerOutput: 31, fuelMassFlow: 2.2, pcd: 14.8, tcd: 370, pressureRatio: 18.5, tetSpread: 16 }),
      documentation: [
        { title: 'Operational Profile', content: 'Driving a natural gas pipeline compressor. Continuous baseload duty at 95% rated speed. Fuel: pipeline quality gas.' },
        { title: 'Last Inspection', content: '2025-08-12 at 8,000 hrs. All hot gas path components within tolerance. Blades show minimal wear.' },
        { title: 'Lube Oil System', content: 'Oil analysis: viscosity 31.4 cSt (ISO VG 32 spec: 28.8–35.2). No contamination detected. Next change at 12,000 hrs.' },
      ],
      aiSuggestion: '',
      maintenanceHistory: getMaintenanceHistory('GT-07'),
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
      telemetryBaseline: { tet: 516, vibrationVelocity: 1.3, rotationalSpeed: 8500, powerOutput: 24, fuelMassFlow: 1.7, pcd: 12.5, tcd: 355, pressureRatio: 14.0, tetSpread: 14 },
      tet: 514.8,
      pcd: 12.6,
      tcd: 356.1,
      rotationalSpeed: 8500.0,
      vibrationVelocity: 1.287,
      eoh: 7800,
      fuelMassFlow: 1.698,
      powerOutput: 24.31,
      pressureRatio: 14.2,
      tetSpread: 14.3,
      tetAlert: false,
      vibrationAlert: false,
      alert: null,
      metricHistory: generateAllHistories({ tet: 514, rotationalSpeed: 8500, vibrationVelocity: 1.3, powerOutput: 24, fuelMassFlow: 1.7, pcd: 12.5, tcd: 355, pressureRatio: 14.0, tetSpread: 14 }),
      documentation: [
        { title: 'Application', content: 'Power generation for industrial complex. Operates in combined heat and power (CHP) mode. Steam recovered for process use.' },
        { title: 'Air Filtration', content: 'High-humidity tropical environment. Coalescing pre-filter + HEPA installed. Differential pressure nominal at 18 mbar.' },
        { title: 'Compressor Washes', content: 'Online water wash performed weekly. Last offline wash: 2025-12-01. Compressor efficiency: 88.3% (design: 88.0%).' },
      ],
      aiSuggestion: '',
      maintenanceHistory: getMaintenanceHistory('GT-08'),
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
      telemetryBaseline: { tet: 505, vibrationVelocity: 0.8, rotationalSpeed: 14700, powerOutput: 13, fuelMassFlow: 0.92, pcd: 14.0, tcd: 360, pressureRatio: 16.0, tetSpread: 12 },
      tet: 504.1,
      pcd: 14.1,
      tcd: 361.4,
      rotationalSpeed: 14700.0,
      vibrationVelocity: 0.814,
      eoh: 3400,
      fuelMassFlow: 0.921,
      powerOutput: 13.08,
      pressureRatio: 16.2,
      tetSpread: 12.1,
      tetAlert: false,
      vibrationAlert: false,
      alert: null,
      metricHistory: generateAllHistories({ tet: 504, rotationalSpeed: 14700, vibrationVelocity: 0.8, powerOutput: 13, fuelMassFlow: 0.92, pcd: 14.0, tcd: 360, pressureRatio: 16.0, tetSpread: 12 }),
      documentation: [
        { title: 'Application', content: 'Offshore platform power generation. Classified for hazardous area (Zone 2). Dual-fuel capable: natural gas + diesel backup.' },
        { title: 'Recent Service', content: 'Combustion inspection completed 2025-11-20 at 2,800 hrs. All fuel nozzles cleaned. Cross-fire tubes replaced.' },
        { title: 'Environmental', content: 'Operating in salt-laden marine environment. Inlet filtration: two-stage separator + HEPA. Corrosion protection active.' },
      ],
      aiSuggestion: '',
      maintenanceHistory: getMaintenanceHistory('GT-09'),
    },
    // ── 12. SST-800 ───────────────────────────────────────────────────────────
    {
      id: 'ST-03',
      name: 'SST-800',
      type: 'Industrial Steam Turbine',
      description: '250 MW high-pressure steam turbine',
      location: 'Plant Mu — Singapore, SG',
      imageUrl: makeEquipmentImage('SST-800', '#2dd4bf', 11),
      manualUrl: 'https://www.siemens-energy.com/global/en/home/products-services/product/sst-800.html',
      status: 'OK',
      currentStatus: 'OK',
      telemetryBaseline: { tet: 480, vibrationVelocity: 1.6, rotationalSpeed: 3000, powerOutput: 245, fuelMassFlow: 8.9, pcd: 165, tcd: 565, pressureRatio: 0, tetSpread: 0 },
      tet: 478.5,
      pcd: 164.2,
      tcd: 564.1,
      rotationalSpeed: 3000.0,
      vibrationVelocity: 1.612,
      eoh: 12400,
      fuelMassFlow: 8.876,
      powerOutput: 245.8,
      pressureRatio: 0,
      tetSpread: 0,
      tetAlert: false,
      vibrationAlert: false,
      alert: null,
      metricHistory: generateAllHistories({ tet: 478, rotationalSpeed: 3000, vibrationVelocity: 1.6, powerOutput: 245, fuelMassFlow: 8.9, pcd: 165, tcd: 565, pressureRatio: 0, tetSpread: 0 }),
      documentation: [
        { title: 'Plant Configuration', content: 'Part of a 750 MW combined cycle plant. HP turbine inlet: 165 bar / 565°C. Reheated steam: 40 bar / 565°C.' },
        { title: 'Blade Inspection', content: 'Last blade inspection at 10,000 hrs (2025-07-30). Stage 1-3 blades within creep limits. Erosion shields intact.' },
        { title: 'Steam Quality', content: 'Cation conductivity: 0.08 μS/cm (limit: 0.15 μS/cm). Sodium: <2 ppb. Chemistry fully within IAPWS guidelines.' },
      ],
      aiSuggestion: '',
      maintenanceHistory: getMaintenanceHistory('ST-03'),
    },
    // ── 13. SGT5-9000HL ───────────────────────────────────────────────────────
    {
      id: 'GT-13',
      name: 'SGT5-9000HL',
      type: 'HL-class Heavy-Duty Gas Turbine',
      description: '593 MW HL-class flagship for large combined cycle',
      location: 'Keadby 2 — Scunthorpe, UK',
      imageUrl: makeEquipmentImage('SGT5-9000HL', '#fbbf24', 12),
      manualUrl: 'https://www.siemens-energy.com/global/en/home/products-services/product/sgt5-9000hl.html',
      status: 'RISK',
      currentStatus: 'RISK',
      telemetryBaseline: { tet: 580, vibrationVelocity: 3.1, rotationalSpeed: 3000, powerOutput: 580, fuelMassFlow: 15.8, pcd: 22, tcd: 445, pressureRatio: 23.0, tetSpread: 38 },
      tet: 596.4,
      pcd: 21.6,
      tcd: 443.2,
      rotationalSpeed: 3000.0,
      vibrationVelocity: 3.142,
      eoh: 22500,
      fuelMassFlow: 15.812,
      powerOutput: 578.4,
      pressureRatio: 22.8,
      tetSpread: 42.3,
      tetAlert: true,
      vibrationAlert: false,
      alert: 'Exhaust temperature elevated at 596°C. Review combustion system and TET spread trending.',
      metricHistory: generateAllHistories({ tet: 596, rotationalSpeed: 3000, vibrationVelocity: 3.1, powerOutput: 578, fuelMassFlow: 15.8, pcd: 22, tcd: 445, pressureRatio: 23.0, tetSpread: 42 }),
      documentation: [
        { title: 'Alert — TET Elevated', content: 'Exhaust temperature 16°C above baseline. HL-class combustion system check recommended. TET spread trending upward.' },
        { title: 'Last Service', content: 'Combustion inspection completed at 18,000 hrs. All 16 combustion cans inspected. Unit returned to service in 28 days.' },
        { title: 'Plant Configuration', content: '593 MW HL-class in combined cycle at Keadby 2. >43% simple cycle efficiency. Mass flow: 1,050 kg/s. 50 Hz grid connection.' },
      ],
      aiSuggestion: 'Exhaust temperature elevated on HL-class unit. Verify combustion system and monitor TET spread. Schedule inspection if trend continues.',
      // Maintenance history kept under original asset key (ST-04) to preserve records
      maintenanceHistory: getMaintenanceHistory('ST-04'),
    },
    // ── 14. SGen-1000A ────────────────────────────────────────────────────────
    {
      id: 'GEN-01',
      name: 'SGen-1000A',
      type: 'Hydrogen-Cooled Synchronous Generator',
      description: '1,500 MVA air/hydrogen cooled generator',
      location: 'Plant Xi — São Paulo, BR',
      imageUrl: makeEquipmentImage('SGen-1000A', '#2dd4bf', 13),
      manualUrl: 'https://www.siemens-energy.com/global/en/home/products-services/product/sgen-1000a.html',
      status: 'OK',
      currentStatus: 'OK',
      telemetryBaseline: { tet: 75, vibrationVelocity: 0.6, rotationalSpeed: 3600, powerOutput: 1420, fuelMassFlow: 0.1, pcd: 0, tcd: 0, pressureRatio: 0, tetSpread: 0 },
      tet: 74.3,
      pcd: 0,
      tcd: 0,
      rotationalSpeed: 3600.0,
      vibrationVelocity: 0.612,
      eoh: 18600,
      fuelMassFlow: 0.09,
      powerOutput: 1418.5,
      pressureRatio: 0,
      tetSpread: 0,
      tetAlert: false,
      vibrationAlert: false,
      alert: null,
      metricHistory: generateAllHistories({ tet: 74, rotationalSpeed: 3600, vibrationVelocity: 0.6, powerOutput: 1418, fuelMassFlow: 0.09, pcd: 0, tcd: 0, pressureRatio: 0, tetSpread: 0 }),
      documentation: [
        { title: 'Operating Parameters', content: 'Hydrogen pressure: 3.5 bar. Purity: 99.8%. Stator cooling water temperature: 40°C. Field current: 4,200 A.' },
        { title: 'Insulation', content: 'Stator winding insulation resistance: 1,200 MΩ (limit: 200 MΩ). Polarization index: 2.8. No partial discharge activity.' },
        { title: 'Cooling System', content: 'Hydrogen cooler inlet temp: 32°C. Water coolers in service. Hydrogen dryer function nominal.' },
      ],
      aiSuggestion: '',
      maintenanceHistory: getMaintenanceHistory('GEN-01'),
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
      telemetryBaseline: { tet: 495, vibrationVelocity: 0.7, rotationalSpeed: 17400, powerOutput: 5.0, fuelMassFlow: 0.36, pcd: 8.2, tcd: 340, pressureRatio: 12.5, tetSpread: 13 },
      tet: 493.8,
      pcd: 8.3,
      tcd: 341.2,
      rotationalSpeed: 17400.0,
      vibrationVelocity: 0.689,
      eoh: 2100,
      fuelMassFlow: 0.358,
      powerOutput: 5.02,
      pressureRatio: 12.6,
      tetSpread: 13.1,
      tetAlert: false,
      vibrationAlert: false,
      alert: null,
      metricHistory: generateAllHistories({ tet: 493, rotationalSpeed: 17400, vibrationVelocity: 0.7, powerOutput: 5.0, fuelMassFlow: 0.36, pcd: 8.2, tcd: 340, pressureRatio: 12.5, tetSpread: 13 }),
      documentation: [
        { title: 'Application', content: 'Remote power generation for water treatment facility. Operated at ISO rated conditions 24/7. No grid connection.' },
        { title: 'Fuel', content: 'Natural gas from pipeline. Wobbe index: 52.4 MJ/m³ (spec: 48–53 MJ/m³). Gas quality trending stable.' },
        { title: 'Annual Inspection', content: 'Next scheduled at 4,000 hrs. Hot section life: 1,900 hrs remaining. Filter replacement due at 2,500 hrs.' },
      ],
      aiSuggestion: '',
      maintenanceHistory: getMaintenanceHistory('GT-10'),
    },
    // ── 16. SGT6-9000HL ───────────────────────────────────────────────────────
    {
      id: 'GT-11',
      name: 'SGT6-9000HL',
      type: 'HL-class Gas Turbine (60 Hz)',
      description: '~405 MW 60 Hz HL-class gas turbine',
      location: 'Long Ridge — Hannibal, OH',
      imageUrl: makeEquipmentImage('SGT6-9000HL', '#2dd4bf', 15),
      manualUrl: 'https://www.siemens-energy.com/global/en/home/products-services/product/sgt6-9000hl-heavy-duty-gas-turbine.html',
      status: 'OK',
      currentStatus: 'OK',
      telemetryBaseline: { tet: 555, vibrationVelocity: 0.9, rotationalSpeed: 3600, powerOutput: 400, fuelMassFlow: 13.2, pcd: 21.0, tcd: 440, pressureRatio: 22.0, tetSpread: 15 },
      tet: 552.4,
      pcd: 21.3,
      tcd: 441.6,
      rotationalSpeed: 3600.0,
      vibrationVelocity: 0.876,
      eoh: 4700,
      fuelMassFlow: 13.18,
      powerOutput: 398.5,
      pressureRatio: 22.2,
      tetSpread: 15.4,
      tetAlert: false,
      vibrationAlert: false,
      alert: null,
      metricHistory: generateAllHistories({ tet: 552, rotationalSpeed: 3600, vibrationVelocity: 0.9, powerOutput: 398, fuelMassFlow: 13.2, pcd: 21.0, tcd: 440, pressureRatio: 22.0, tetSpread: 15 }),
      documentation: [
        { title: 'Application', content: '60 Hz HL-class gas turbine in combined cycle configuration. ~405 MW class. High efficiency advanced air-cooled technology.' },
        { title: 'Generator Connection', content: 'Direct-coupled synchronous generator, 60 Hz, 18 kV. Power factor: 0.85 lagging. 3,600 RPM rated speed.' },
        { title: 'Service History', content: 'Commissioned 2024-02-15. First combustion inspection due at 6,000 hrs (1,300 hrs remaining). No faults logged.' },
      ],
      aiSuggestion: '',
      maintenanceHistory: getMaintenanceHistory('GT-11'),
    },
    // ── 17. SGT6-8000H ────────────────────────────────────────────────────────
    {
      id: 'GT-12',
      name: 'SGT6-8000H',
      type: 'H-class Gas Turbine (60 Hz)',
      description: '310 MW 60 Hz H-class combined cycle',
      location: 'Andong CCPP — Andong, KR',
      imageUrl: makeEquipmentImage('SGT6-8000H', '#f87171', 16),
      manualUrl: 'https://www.siemens-energy.com/global/en/home/products-services/product/sgt6-8000h.html',
      status: 'NOK',
      currentStatus: 'NOK',
      telemetryBaseline: { tet: 555, vibrationVelocity: 1.4, rotationalSpeed: 3600, powerOutput: 310, fuelMassFlow: 11.4, pcd: 19.0, tcd: 425, pressureRatio: 20.0, tetSpread: 58 },
      tet: 641.8,
      pcd: 18.4,
      tcd: 422.1,
      rotationalSpeed: 3600.0,
      vibrationVelocity: 7.891,
      eoh: 29800,
      fuelMassFlow: 11.348,
      powerOutput: 305.2,
      pressureRatio: 19.6,
      tetSpread: 58.7,
      tetAlert: true,
      vibrationAlert: true,
      alert: 'CRITICAL: Vibration 7.9 mm/s & exhaust temp 642°C — immediate shutdown required.',
      metricHistory: generateAllHistories({ tet: 641, rotationalSpeed: 3600, vibrationVelocity: 7.9, powerOutput: 305, fuelMassFlow: 11.3, pcd: 19.0, tcd: 425, pressureRatio: 20.0, tetSpread: 58 }),
      documentation: [
        { title: 'CRITICAL — Dual Exceedance', content: 'Both vibration (7.9 mm/s on bearing #1) and exhaust temp (642°C) at critical levels simultaneously. Root cause: suspected hot-section distress.' },
        { title: 'Overhaul Status', content: 'Unit at 29,800 hrs approaching 30,000 hr major overhaul. Hot gas path components showing end-of-life thermal fatigue patterns.' },
        { title: 'Grid Impact', content: 'Unit provides 310 MW to Korean grid. Controlled shutdown coordinated with grid operator. Backup capacity arranged.' },
      ],
      aiSuggestion: 'URGENT: Simultaneous critical vibration (7.9 mm/s) and exhaust temperature (642°C) exceedance. Execute immediate controlled shutdown per SOP-GT12-001. Initiate emergency hot-section inspection.',
      maintenanceHistory: getMaintenanceHistory('GT-12'),
    },
    // ── 18. SGen-100A ─────────────────────────────────────────────────────────
    {
      id: 'GEN-02',
      name: 'SGen-100A',
      type: 'Air-Cooled Synchronous Generator',
      description: '130 MVA air-cooled two-pole generator',
      location: 'Plant Sigma — Paris, FR',
      imageUrl: makeEquipmentImage('SGen-100A', '#2dd4bf', 17),
      manualUrl: 'https://www.siemens-energy.com/global/en/home/products-services/product/sgen-100a.html',
      status: 'OK',
      currentStatus: 'OK',
      telemetryBaseline: { tet: 82, vibrationVelocity: 0.5, rotationalSpeed: 3000, powerOutput: 121, fuelMassFlow: 0.05, pcd: 0, tcd: 0, pressureRatio: 0, tetSpread: 0 },
      tet: 81.7,
      pcd: 0,
      tcd: 0,
      rotationalSpeed: 3000.0,
      vibrationVelocity: 0.498,
      eoh: 9200,
      fuelMassFlow: 0.048,
      powerOutput: 121.4,
      pressureRatio: 0,
      tetSpread: 0,
      tetAlert: false,
      vibrationAlert: false,
      alert: null,
      metricHistory: generateAllHistories({ tet: 81, rotationalSpeed: 3000, vibrationVelocity: 0.5, powerOutput: 121, fuelMassFlow: 0.05, pcd: 0, tcd: 0, pressureRatio: 0, tetSpread: 0 }),
      documentation: [
        { title: 'Design Data', content: 'Rating: 130 MVA, 50 Hz, 15.75 kV. Power factor: 0.85. Short-circuit ratio: 0.62. Insulation class: F.' },
        { title: 'Bearing Condition', content: 'Drive-end bearing: vibration 0.45 mm/s. Non-drive-end: 0.51 mm/s. Lube oil temperature: 55°C. All within limits.' },
        { title: 'Last Major Inspection', content: '2025-04-22 at 7,200 hrs. Stator winding re-wedged. Rotor balance verified. Exciter diodes all replaced.' },
      ],
      aiSuggestion: '',
      maintenanceHistory: getMaintenanceHistory('GEN-02'),
    },
  ]
}

// ── Generate Mock Diagnostic Action Plan (Simulated RAG) ──────────────────────
export function generateActionPlan(turbine) {
  const isVibrationCritical = turbine.vibrationVelocity > thresholds.vibrationVelocity.critical
  const isTetCritical = turbine.tet > thresholds.tet.critical
  const isTetSpreadCritical = turbine.tetSpread > thresholds.tetSpread.critical

  if (isVibrationCritical) {
    return [
      `1. Initiate controlled load reduction on ${turbine.name} ${turbine.type} #${turbine.id}`,
      `2. Vibration velocity at ${turbine.vibrationVelocity.toFixed(1)} mm/s RMS — ISO 10816-4 Zone D (>11.2 mm/s). Verify bearing temps and lube oil pressure`,
      `3. Cross-reference vibration spectrum with baseline from last overhaul at ${Math.floor(turbine.eoh).toLocaleString()} EOH`,
      `4. If vibration exceeds 11.2 mm/s, execute emergency shutdown per SOP-${turbine.id}-001`,
      `5. Schedule emergency bearing inspection and rotor balance check within 24 hours`,
      `6. Notify plant operations manager and prepare maintenance crew for potential outage`,
    ]
  }

  if (isTetSpreadCritical) {
    return [
      `1. TET Spread at ${turbine.tetSpread.toFixed(0)}°C exceeds 50°C critical threshold on ${turbine.name} #${turbine.id}`,
      `2. Inspect individual burner cans for combustion asymmetry — check fuel nozzle spray patterns`,
      `3. Verify PCD (currently ${(turbine.pcd ?? 0).toFixed(1)} bar) for compressor degradation indication`,
      `4. Cross-reference with TET trending — current TET: ${turbine.tet.toFixed(0)}°C`,
      `5. Schedule combustion inspection within 48 hours per maintenance manual`,
      `6. Review fuel gas quality and Wobbe index for recent changes`,
    ]
  }

  if (isTetCritical) {
    return [
      `1. Reduce load on ${turbine.name} ${turbine.type} #${turbine.id} to 75% rated capacity immediately`,
      `2. TET at ${turbine.tet.toFixed(0)}°C — verify combustion liner temperatures across all cans`,
      `3. Check PCD (${(turbine.pcd ?? 0).toFixed(1)} bar) and TCD for compressor health indicators`,
      `4. If TET continues rising above ${thresholds.tet.critical}°C, initiate controlled shutdown`,
      `5. Schedule combustion inspection within 48 hours per maintenance manual Section 9`,
      `6. Review compressor wash schedule — PCD drop may indicate fouling trend`,
    ]
  }

  return [
    `1. Continue monitoring ${turbine.name} ${turbine.type} #${turbine.id} telemetry at elevated frequency`,
    `2. All parameters within ISO 10816-4 Zone A/B. Review trending data for the last 72 hours`,
    `3. Next maintenance milestone: EOH ${Math.floor(turbine.eoh).toLocaleString()} h. Schedule preventive review within 7 days`,
  ]
}
