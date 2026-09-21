<<<<<<< HEAD
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
=======
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // 1. Import plugin

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // 2. Pasang plugin di sini
  ],
})
>>>>>>> origin/arya-branch
