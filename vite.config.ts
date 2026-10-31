import { defineConfig } from "vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: [".modal.host"],
  },
  plugins: [tailwindcss(), tanstackStart(), react()],
})
