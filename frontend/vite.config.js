// Copyright 2026 Ângelo Coelho. All rights reserved.
// PROPRIETARY — NON-COMMERCIAL USE ONLY.
// Licensed under PolyForm Noncommercial License 1.0.0.
// See LICENSE and https://angelorscoelho.dev for licensing.
//

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // Serve and build under /siemens/ so this app integrates as a sub-page of
  // angelorscoelho.dev (i.e. https://www.angelorscoelho.dev/siemens).
  base: '/siemens/',
})
