// vite.config.js
import { defineConfig } from "file:///C:/Users/admin/1code/wangzhan/music-app/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/admin/1code/wangzhan/music-app/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///C:/Users/admin/1code/wangzhan/music-app/node_modules/@tailwindcss/vite/dist/index.mjs";
import { VitePWA } from "file:///C:/Users/admin/1code/wangzhan/music-app/node_modules/vite-plugin-pwa/dist/index.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "file:///C:/Users/admin/1code/wangzhan/music-app/node_modules/@storybook/addon-vitest/dist/vitest-plugin/index.js";
import { playwright } from "file:///C:/Users/admin/1code/wangzhan/music-app/node_modules/@vitest/browser-playwright/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\admin\\1code\\wangzhan\\music-app";
var __vite_injected_original_import_meta_url = "file:///C:/Users/admin/1code/wangzhan/music-app/vite.config.js";
var dirname = typeof __vite_injected_original_dirname !== "undefined" ? __vite_injected_original_dirname : path.dirname(fileURLToPath(__vite_injected_original_import_meta_url));
var vite_config_default = defineConfig({
  build: {
    rollupOptions: {
      output: {
        // 手动拆分 vendor chunk — react 核心和第三方库分别缓存
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": ["lucide-react", "react-hot-toast"],
          "vendor-state": ["zustand"],
          "vendor-i18n": ["i18next", "react-i18next", "i18next-browser-languagedetector"]
        }
      }
    }
  },
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: "autoUpdate",
    workbox: {
      skipWaiting: true,
      clientsClaim: true,
      cleanupOutdatedCaches: true,
      runtimeCaching: [{
        urlPattern: /^https:\/\/.*\.(js|css|html)$/,
        handler: "NetworkFirst",
        options: { cacheName: "app-cache", expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 } }
      }]
    },
    includeAssets: ["music-icon.svg"],
    manifest: {
      name: "\u97F3\u4E50\u5E73\u53F0",
      short_name: "\u97F3\u4E50",
      description: "\u5728\u7EBF\u97F3\u4E50\u64AD\u653E\u3001\u5206\u4EAB\u4E0E\u793E\u4EA4\u5E73\u53F0",
      theme_color: "#1DB954",
      background_color: "#121212",
      display: "standalone",
      start_url: "/",
      icons: [{
        src: "/music-icon-192.png",
        sizes: "192x192",
        type: "image/png"
      }, {
        src: "/music-icon-512.png",
        sizes: "512x512",
        type: "image/png"
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
          configDir: path.join(dirname, ".storybook")
        })
      ],
      test: {
        name: "storybook",
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: "chromium"
          }]
        }
      }
    }]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxhZG1pblxcXFwxY29kZVxcXFx3YW5nemhhblxcXFxtdXNpYy1hcHBcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGFkbWluXFxcXDFjb2RlXFxcXHdhbmd6aGFuXFxcXG11c2ljLWFwcFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvYWRtaW4vMWNvZGUvd2FuZ3poYW4vbXVzaWMtYXBwL3ZpdGUuY29uZmlnLmpzXCI7Ly8vIDxyZWZlcmVuY2UgdHlwZXM9XCJ2aXRlc3QvY29uZmlnXCIgLz5cbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tICdAdGFpbHdpbmRjc3Mvdml0ZSc7XG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSAndml0ZS1wbHVnaW4tcHdhJztcbmltcG9ydCBwYXRoIGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAnbm9kZTp1cmwnO1xuaW1wb3J0IHsgc3Rvcnlib29rVGVzdCB9IGZyb20gJ0BzdG9yeWJvb2svYWRkb24tdml0ZXN0L3ZpdGVzdC1wbHVnaW4nO1xuaW1wb3J0IHsgcGxheXdyaWdodCB9IGZyb20gJ0B2aXRlc3QvYnJvd3Nlci1wbGF5d3JpZ2h0JztcbmNvbnN0IGRpcm5hbWUgPSB0eXBlb2YgX19kaXJuYW1lICE9PSAndW5kZWZpbmVkJyA/IF9fZGlybmFtZSA6IHBhdGguZGlybmFtZShmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCkpO1xuXG4vLyBNb3JlIGluZm8gYXQ6IGh0dHBzOi8vc3Rvcnlib29rLmpzLm9yZy9kb2NzL25leHQvd3JpdGluZy10ZXN0cy9pbnRlZ3JhdGlvbnMvdml0ZXN0LWFkZG9uXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBidWlsZDoge1xuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICAvLyBcdTYyNEJcdTUyQThcdTYyQzZcdTUyMDYgdmVuZG9yIGNodW5rIFx1MjAxNCByZWFjdCBcdTY4MzhcdTVGQzNcdTU0OENcdTdCMkNcdTRFMDlcdTY1QjlcdTVFOTNcdTUyMDZcdTUyMkJcdTdGMTNcdTVCNThcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgJ3ZlbmRvci1yZWFjdCc6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlYWN0LXJvdXRlci1kb20nXSxcbiAgICAgICAgICAndmVuZG9yLXVpJzogWydsdWNpZGUtcmVhY3QnLCAncmVhY3QtaG90LXRvYXN0J10sXG4gICAgICAgICAgJ3ZlbmRvci1zdGF0ZSc6IFsnenVzdGFuZCddLFxuICAgICAgICAgICd2ZW5kb3ItaTE4bic6IFsnaTE4bmV4dCcsICdyZWFjdC1pMThuZXh0JywgJ2kxOG5leHQtYnJvd3Nlci1sYW5ndWFnZWRldGVjdG9yJ10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHBsdWdpbnM6IFtyZWFjdCgpLCB0YWlsd2luZGNzcygpLCBWaXRlUFdBKHtcbiAgICByZWdpc3RlclR5cGU6ICdhdXRvVXBkYXRlJyxcbiAgICB3b3JrYm94OiB7XG4gICAgICBza2lwV2FpdGluZzogdHJ1ZSxcbiAgICAgIGNsaWVudHNDbGFpbTogdHJ1ZSxcbiAgICAgIGNsZWFudXBPdXRkYXRlZENhY2hlczogdHJ1ZSxcbiAgICAgIHJ1bnRpbWVDYWNoaW5nOiBbe1xuICAgICAgICB1cmxQYXR0ZXJuOiAvXmh0dHBzOlxcL1xcLy4qXFwuKGpzfGNzc3xodG1sKSQvLFxuICAgICAgICBoYW5kbGVyOiAnTmV0d29ya0ZpcnN0JyxcbiAgICAgICAgb3B0aW9uczogeyBjYWNoZU5hbWU6ICdhcHAtY2FjaGUnLCBleHBpcmF0aW9uOiB7IG1heEVudHJpZXM6IDUwLCBtYXhBZ2VTZWNvbmRzOiA2MCAqIDYwIH0gfVxuICAgICAgfV1cbiAgICB9LFxuICAgIGluY2x1ZGVBc3NldHM6IFsnbXVzaWMtaWNvbi5zdmcnXSxcbiAgICBtYW5pZmVzdDoge1xuICAgICAgbmFtZTogJ1x1OTdGM1x1NEU1MFx1NUU3M1x1NTNGMCcsXG4gICAgICBzaG9ydF9uYW1lOiAnXHU5N0YzXHU0RTUwJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnXHU1NzI4XHU3RUJGXHU5N0YzXHU0RTUwXHU2NEFEXHU2NTNFXHUzMDAxXHU1MjA2XHU0RUFCXHU0RTBFXHU3OTNFXHU0RUE0XHU1RTczXHU1M0YwJyxcbiAgICAgIHRoZW1lX2NvbG9yOiAnIzFEQjk1NCcsXG4gICAgICBiYWNrZ3JvdW5kX2NvbG9yOiAnIzEyMTIxMicsXG4gICAgICBkaXNwbGF5OiAnc3RhbmRhbG9uZScsXG4gICAgICBzdGFydF91cmw6ICcvJyxcbiAgICAgIGljb25zOiBbe1xuICAgICAgICBzcmM6ICcvbXVzaWMtaWNvbi0xOTIucG5nJyxcbiAgICAgICAgc2l6ZXM6ICcxOTJ4MTkyJyxcbiAgICAgICAgdHlwZTogJ2ltYWdlL3BuZydcbiAgICAgIH0sIHtcbiAgICAgICAgc3JjOiAnL211c2ljLWljb24tNTEyLnBuZycsXG4gICAgICAgIHNpemVzOiAnNTEyeDUxMicsXG4gICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXG4gICAgICB9XVxuICAgIH1cbiAgfSldLFxuICB0ZXN0OiB7XG4gICAgcHJvamVjdHM6IFt7XG4gICAgICBleHRlbmRzOiB0cnVlLFxuICAgICAgcGx1Z2luczogW1xuICAgICAgLy8gVGhlIHBsdWdpbiB3aWxsIHJ1biB0ZXN0cyBmb3IgdGhlIHN0b3JpZXMgZGVmaW5lZCBpbiB5b3VyIFN0b3J5Ym9vayBjb25maWdcbiAgICAgIC8vIFNlZSBvcHRpb25zIGF0OiBodHRwczovL3N0b3J5Ym9vay5qcy5vcmcvZG9jcy9uZXh0L3dyaXRpbmctdGVzdHMvaW50ZWdyYXRpb25zL3ZpdGVzdC1hZGRvbiNzdG9yeWJvb2t0ZXN0XG4gICAgICBzdG9yeWJvb2tUZXN0KHtcbiAgICAgICAgY29uZmlnRGlyOiBwYXRoLmpvaW4oZGlybmFtZSwgJy5zdG9yeWJvb2snKVxuICAgICAgfSldLFxuICAgICAgdGVzdDoge1xuICAgICAgICBuYW1lOiAnc3Rvcnlib29rJyxcbiAgICAgICAgYnJvd3Nlcjoge1xuICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgICAgaGVhZGxlc3M6IHRydWUsXG4gICAgICAgICAgcHJvdmlkZXI6IHBsYXl3cmlnaHQoe30pLFxuICAgICAgICAgIGluc3RhbmNlczogW3tcbiAgICAgICAgICAgIGJyb3dzZXI6ICdjaHJvbWl1bSdcbiAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfV1cbiAgfVxufSk7Il0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sV0FBVztBQUNsQixPQUFPLGlCQUFpQjtBQUN4QixTQUFTLGVBQWU7QUFDeEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMscUJBQXFCO0FBQzlCLFNBQVMscUJBQXFCO0FBQzlCLFNBQVMsa0JBQWtCO0FBUjNCLElBQU0sbUNBQW1DO0FBQXdKLElBQU0sMkNBQTJDO0FBU2xQLElBQU0sVUFBVSxPQUFPLHFDQUFjLGNBQWMsbUNBQVksS0FBSyxRQUFRLGNBQWMsd0NBQWUsQ0FBQztBQUcxRyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixPQUFPO0FBQUEsSUFDTCxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUE7QUFBQSxRQUVOLGNBQWM7QUFBQSxVQUNaLGdCQUFnQixDQUFDLFNBQVMsYUFBYSxrQkFBa0I7QUFBQSxVQUN6RCxhQUFhLENBQUMsZ0JBQWdCLGlCQUFpQjtBQUFBLFVBQy9DLGdCQUFnQixDQUFDLFNBQVM7QUFBQSxVQUMxQixlQUFlLENBQUMsV0FBVyxpQkFBaUIsa0NBQWtDO0FBQUEsUUFDaEY7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVMsQ0FBQyxNQUFNLEdBQUcsWUFBWSxHQUFHLFFBQVE7QUFBQSxJQUN4QyxjQUFjO0FBQUEsSUFDZCxTQUFTO0FBQUEsTUFDUCxhQUFhO0FBQUEsTUFDYixjQUFjO0FBQUEsTUFDZCx1QkFBdUI7QUFBQSxNQUN2QixnQkFBZ0IsQ0FBQztBQUFBLFFBQ2YsWUFBWTtBQUFBLFFBQ1osU0FBUztBQUFBLFFBQ1QsU0FBUyxFQUFFLFdBQVcsYUFBYSxZQUFZLEVBQUUsWUFBWSxJQUFJLGVBQWUsS0FBSyxHQUFHLEVBQUU7QUFBQSxNQUM1RixDQUFDO0FBQUEsSUFDSDtBQUFBLElBQ0EsZUFBZSxDQUFDLGdCQUFnQjtBQUFBLElBQ2hDLFVBQVU7QUFBQSxNQUNSLE1BQU07QUFBQSxNQUNOLFlBQVk7QUFBQSxNQUNaLGFBQWE7QUFBQSxNQUNiLGFBQWE7QUFBQSxNQUNiLGtCQUFrQjtBQUFBLE1BQ2xCLFNBQVM7QUFBQSxNQUNULFdBQVc7QUFBQSxNQUNYLE9BQU8sQ0FBQztBQUFBLFFBQ04sS0FBSztBQUFBLFFBQ0wsT0FBTztBQUFBLFFBQ1AsTUFBTTtBQUFBLE1BQ1IsR0FBRztBQUFBLFFBQ0QsS0FBSztBQUFBLFFBQ0wsT0FBTztBQUFBLFFBQ1AsTUFBTTtBQUFBLE1BQ1IsQ0FBQztBQUFBLElBQ0g7QUFBQSxFQUNGLENBQUMsQ0FBQztBQUFBLEVBQ0YsTUFBTTtBQUFBLElBQ0osVUFBVSxDQUFDO0FBQUEsTUFDVCxTQUFTO0FBQUEsTUFDVCxTQUFTO0FBQUE7QUFBQTtBQUFBLFFBR1QsY0FBYztBQUFBLFVBQ1osV0FBVyxLQUFLLEtBQUssU0FBUyxZQUFZO0FBQUEsUUFDNUMsQ0FBQztBQUFBLE1BQUM7QUFBQSxNQUNGLE1BQU07QUFBQSxRQUNKLE1BQU07QUFBQSxRQUNOLFNBQVM7QUFBQSxVQUNQLFNBQVM7QUFBQSxVQUNULFVBQVU7QUFBQSxVQUNWLFVBQVUsV0FBVyxDQUFDLENBQUM7QUFBQSxVQUN2QixXQUFXLENBQUM7QUFBQSxZQUNWLFNBQVM7QUFBQSxVQUNYLENBQUM7QUFBQSxRQUNIO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
