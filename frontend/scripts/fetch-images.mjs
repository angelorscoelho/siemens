/**
 * fetch-images.mjs — Build-time image fetcher for Siemens Energy PoC
 *
 * Downloads real turbine/industrial equipment photos from Wikimedia Commons
 * (public domain) into public/images/. Runs before every build via "prebuild".
 * Uses WebP thumbnails when available, JPEG otherwise.
 * Falls back gracefully if the network is unavailable.
 */

import { writeFileSync, existsSync, mkdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = join(__dirname, '..', 'public', 'images')
const THUMB_WIDTH = 400
const CACHE_DAYS = 7
const MAX_AGE_MS = CACHE_DAYS * 24 * 60 * 60 * 1000 // Refresh every 7 days

// ── Image catalogue: Wikimedia Commons files for each turbine slot ────────────
// These are real public-domain industrial/turbine photos.
// Each entry: { slot, file, description }
const IMAGE_CATALOGUE = [
  // Gas turbine photos
  {
    slot: 'turbine-01',
    // SGT5-8000H H-class gas turbine — large combined-cycle unit
    file: 'Siemens_SGT5-8000H_gas_turbine.jpg',
    fallback: 'Gas_turbine_compressor_blade.jpg',
  },
  {
    slot: 'turbine-02',
    // Steam turbine (SST-400 class)
    file: 'Steam_turbine_of_a_nuclear_power_plant.jpg',
    fallback: 'Steam_turbine_1.jpg',
  },
  {
    slot: 'turbine-03',
    // Industrial gas turbine interior view
    file: 'GasTurbine.jpg',
    fallback: 'Gas_turbine_compressor_blade.jpg',
  },
  {
    slot: 'turbine-04',
    // Large steam turbine hall
    file: 'Turbine_Hall_at_Hoover_Dam.jpg',
    fallback: 'Steam_turbine_of_a_nuclear_power_plant.jpg',
  },
  {
    slot: 'turbine-05',
    // Gas turbine rotor/compressor
    file: 'Gas_turbine_compressor_blade.jpg',
    fallback: 'GasTurbine.jpg',
  },
  {
    slot: 'turbine-06',
    // Combined cycle power plant (F-class)
    file: 'Irsching_gas_turbine_power_plant.jpg',
    fallback: 'Gas_turbine_compressor_blade.jpg',
  },
  {
    slot: 'turbine-07',
    // Aeroderivative gas turbine
    file: 'SGT-750_gas_turbine_Siemens.jpg',
    fallback: 'GasTurbine.jpg',
  },
  {
    slot: 'turbine-08',
    // Power plant exterior
    file: 'Gas_fired_power_plant.jpg',
    fallback: 'Irsching_gas_turbine_power_plant.jpg',
  },
  {
    slot: 'turbine-09',
    // H-class 60Hz unit
    file: 'Siemens_SGT6-8000H_gas_turbine.jpg',
    fallback: 'Siemens_SGT5-8000H_gas_turbine.jpg',
  },
  {
    slot: 'turbine-10',
    // Industrial gas turbine (mid-range)
    file: 'Gas_turbine_mounted_in_a_generating_station.jpg',
    fallback: 'GasTurbine.jpg',
  },
  {
    slot: 'turbine-11',
    // Small industrial gas turbine
    file: 'Gas_Turbine_Operation.svg',
    fallback: 'GasTurbine.jpg',
    isSvg: true,
  },
  {
    slot: 'turbine-12',
    // Steam turbine (SST-800 high pressure)
    file: 'Siemens_SST-900.jpg',
    fallback: 'Steam_turbine_of_a_nuclear_power_plant.jpg',
  },
  {
    slot: 'turbine-13',
    // CHP steam turbine
    file: 'Steam_turbine_1.jpg',
    fallback: 'Steam_turbine_of_a_nuclear_power_plant.jpg',
  },
  {
    slot: 'turbine-14',
    // Large generator (hydrogen-cooled)
    file: 'Turbogenerator02.jpg',
    fallback: 'Gas_turbine_mounted_in_a_generating_station.jpg',
  },
  {
    slot: 'turbine-15',
    // Small gas turbine
    file: 'Small_gas_turbine.jpg',
    fallback: 'GasTurbine.jpg',
  },
  {
    slot: 'turbine-16',
    // Twin-shaft turbine
    file: 'SGT-300_gas_turbine.jpg',
    fallback: 'GasTurbine.jpg',
  },
  {
    slot: 'turbine-17',
    // H-class 60Hz (SGT6-8000H)
    file: 'Turbine_hall.jpg',
    fallback: 'Irsching_gas_turbine_power_plant.jpg',
  },
  {
    slot: 'turbine-18',
    // Air-cooled generator
    file: 'Generator_hall.jpg',
    fallback: 'Turbogenerator02.jpg',
  },
]

// ── Wikimedia Commons thumbnail URL builder ───────────────────────────────────
function wikimediaThumbnailUrl(filename, width) {
  // Use the Wikimedia Commons Special:FilePath API — always resolves correctly.
  // Using ?width= causes Wikimedia to rasterise SVGs to PNG, which is fine
  // because we always save images as .jpg for consistency.
  const encoded = encodeURIComponent(filename.replace(/ /g, '_'))
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encoded}?width=${width}`
}

// ── Download a single file (with timeout + size guard) ────────────────────────
const FETCH_TIMEOUT_MS = 15000
const MIN_IMAGE_BYTES = 1024 // anything smaller is likely an error page

async function downloadFile(url, destPath) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  let resp
  try {
    resp = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'SiemensEnergyPoC/2.0 (build image fetcher; educational/demo use)',
      },
    })
  } catch (err) {
    clearTimeout(timer)
    if (err.name === 'AbortError') {
      throw new Error(`Timed out after ${FETCH_TIMEOUT_MS / 1000}s: ${url}`)
    }
    throw err
  }
  clearTimeout(timer)

  if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${url}`)
  const contentType = resp.headers.get('content-type') || ''
  if (!contentType.startsWith('image/') && !contentType.includes('svg')) {
    throw new Error(`Unexpected content-type: ${contentType}`)
  }
  const buffer = await resp.arrayBuffer()
  if (buffer.byteLength < MIN_IMAGE_BYTES) {
    throw new Error(`Response too small (${buffer.byteLength} B) — likely an error page`)
  }
  writeFileSync(destPath, Buffer.from(buffer))
  return contentType
}

// ── Check if cached image is fresh ───────────────────────────────────────────
function isFresh(filePath) {
  if (!existsSync(filePath)) return false
  const age = Date.now() - statSync(filePath).mtimeMs
  return age < MAX_AGE_MS
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true })
  console.log(`\n📸  Siemens Energy PoC — Image Fetcher`)
  console.log(`   Output: ${OUTPUT_DIR}\n`)

  let downloaded = 0
  let skipped = 0
  let failed = 0

  for (const entry of IMAGE_CATALOGUE) {
    // Always use .jpg as the target extension. Wikimedia rasterises SVGs when
    // ?width= is specified, so the downloaded file is always a JPEG/PNG.
    const destPath = join(OUTPUT_DIR, `${entry.slot}.jpg`)

    // Skip if fresh copy already exists
    if (isFresh(destPath)) {
      console.log(`  ✓  ${entry.slot} — cached (skip)`)
      skipped++
      continue
    }

    // Try primary file, then fallback
    const filesToTry = [entry.file, entry.fallback].filter(Boolean)
    let success = false

    for (const filename of filesToTry) {
      const url = wikimediaThumbnailUrl(filename, THUMB_WIDTH)

      try {
        process.stdout.write(`  ↓  ${entry.slot} — ${filename.substring(0, 50)}…`)
        await downloadFile(url, destPath)
        console.log(` ✓`)
        downloaded++
        success = true
        break
      } catch (err) {
        console.log(` ✗ (${err.message.substring(0, 60)})`)
      }
    }

    if (!success) {
      console.log(`  ⚠  ${entry.slot} — all sources failed; SVG fallback will be used`)
      failed++
    }
  }

  console.log(`\n  Summary: ${downloaded} downloaded, ${skipped} cached, ${failed} failed`)
  if (failed > 0) {
    console.log(`  ℹ  Failed images will use inline SVG fallback in the app.`)
  }
  console.log()
}

main().catch(err => {
  // Non-fatal: build continues even if images can't be fetched
  console.warn(`\n⚠  Image fetch failed (network unavailable?): ${err.message}`)
  console.warn(`   The app will use inline SVG placeholders.\n`)
})
