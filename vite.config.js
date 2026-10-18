import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' supaya hasil build bisa di-hosting di mana saja (GitHub Pages, Netlify, dll.)
export default defineConfig({
  plugins: [react()],
  base: './',
});
