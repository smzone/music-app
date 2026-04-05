/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // 手动拆分 vendor chunk — react 核心和第三方库分别缓存
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['lucide-react', 'react-hot-toast'],
          'vendor-state': ['zustand'],
          'vendor-i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
        },
      },
    },
  },
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: 'autoUpdate',
    workbox: {
      skipWaiting: true,
      clientsClaim: true,
      cleanupOutdatedCaches: true,
      runtimeCaching: [{
        urlPattern: /^https:\/\/.*\.(js|css|html)$/,
        handler: 'NetworkFirst',
        options: { cacheName: 'app-cache', expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 } }
      }]
    },
    includeAssets: ['music-icon.svg'],
    manifest: {
      name: '音乐平台',
      short_name: '音乐',
      description: '在线音乐播放、分享与社交平台',
      theme_color: '#1DB954',
      background_color: '#121212',
      display: 'standalone',
      start_url: '/',
      icons: [{
        src: '/music-icon-192.png',
        sizes: '192x192',
        type: 'image/png'
      }, {
        src: '/music-icon-512.png',
        sizes: '512x512',
        type: 'image/png'
      }]
    }
  })],
  test: {
    projects: [{
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        }
      }
    }]
  }
});