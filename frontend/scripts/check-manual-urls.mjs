/**
 * check-manual-urls.mjs
 *
 * Build-time check for manual URLs defined in fleetStore.js.
 * Exits with code 1 and prints a report if any URL returns a 404 (or fails).
 * Run via `node scripts/check-manual-urls.mjs` or as part of the prebuild step.
 *
 * Usage: node scripts/check-manual-urls.mjs [--fail-on-error]
 *   --fail-on-error  Exit with code 1 when any URL is unreachable (default: warn only)
 */

import { readFileSync } from 'fs'

const args = process.argv.slice(2)
const failOnError = args.includes('--fail-on-error')

// ── Extract manual URLs from fleetStore.js ─────────────────────────────────
const storeSource = readFileSync(new URL('../src/fleetStore.js', import.meta.url), 'utf8')
const urlRegex = /manualUrl:\s*'(https?:\/\/[^']+)'/g
const urls = []
let match
while ((match = urlRegex.exec(storeSource)) !== null) {
  urls.push(match[1])
}

if (urls.length === 0) {
  console.log('[check-manual-urls] No manualUrl entries found in fleetStore.js')
  process.exit(0)
}

console.log(`[check-manual-urls] Checking ${urls.length} manual URL(s)…\n`)

// ── Check each URL ─────────────────────────────────────────────────────────
async function checkUrl(url) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'Siemens-PoC-ManualChecker/1.0' },
    })
    clearTimeout(timeout)
    return { url, status: res.status, ok: res.status < 400 }
  } catch (err) {
    return { url, status: 0, ok: false, error: err.message }
  }
}

const results = await Promise.all(urls.map(checkUrl))

let hasErrors = false
for (const r of results) {
  if (r.ok) {
    console.log(`  ✓ ${r.status}  ${r.url}`)
  } else {
    hasErrors = true
    const detail = r.error ? `(${r.error})` : `(HTTP ${r.status})`
    console.warn(`  ✗ FAIL ${detail}  ${r.url}`)
  }
}

console.log()
if (hasErrors) {
  console.warn('[check-manual-urls] ⚠ One or more manual URLs are unreachable.')
  console.warn('[check-manual-urls]   Update the manualUrl values in frontend/src/fleetStore.js.')
  if (failOnError) process.exit(1)
} else {
  console.log('[check-manual-urls] ✓ All manual URLs are reachable.')
}
