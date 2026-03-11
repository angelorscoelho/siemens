import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // Serve and build under /siemens/ so this app integrates as a sub-page of
  // angelorscoelho.dev (i.e. https://www.angelorscoelho.dev/siemens).
  base: '/siemens/',
})
