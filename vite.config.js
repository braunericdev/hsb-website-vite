import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import injectHTML from 'vite-plugin-html-inject'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    tailwindcss(),
    injectHTML(),
  ],
  build: {
    rollupOptions: {
      input: {
        // Hauptseite
        main: resolve(__dirname, 'index.html'),

        // Hauptkategorien
        hausmeisterservice: resolve(__dirname, 'hausmeisterservice/index.html'),
        kontakt: resolve(__dirname, 'kontakt/index.html'),
        karriere: resolve(__dirname, 'karriere/index.html'),

        // Außenbereich
        gartengrundstueckspflege: resolve(__dirname, 'gartengrundstueckspflege/index.html'),
        heckenschnitt: resolve(__dirname, 'heckenschnitt/index.html'),
        rasenmaehen: resolve(__dirname, 'rasenmaehen/index.html'),
        reinigung: resolve(__dirname, 'reinigung/index.html'),
        gestaltung: resolve(__dirname, 'gestaltung/index.html'),
        winterdienst: resolve(__dirname, 'winterdienst/index.html'),

        // Innenbereich
        gebaeudereinigung: resolve(__dirname, 'gebaeudereinigung/index.html'),
        bodenverlegen: resolve(__dirname, 'bodenverlegen/index.html'),
        montage: resolve(__dirname, 'montageservice/index.html'), 
        entruempelung: resolve(__dirname, 'entruempelung/index.html'),

        // Rechtliches & Sonstiges
        impressum: resolve(__dirname, 'impressum/index.html'),
        datenschutz: resolve(__dirname, 'datenschutz/index.html'),
        danke: resolve(__dirname, 'danke/index.html'),
      },
    },
  },
})