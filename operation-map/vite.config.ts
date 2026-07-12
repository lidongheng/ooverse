import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import viteCompression from 'vite-plugin-compression'

const timestamp = Date.now()

export default defineConfig(({ command }) => ({
  // 本地开发使用根路径，生产环境部署到统一镜像中的 operation-map 子目录。
  base: command === 'build' ? '/ooverse/operation-map/' : '/',
  plugins: [
    vue(),
    viteCompression({
      threshold: 10240,
      filter: /\.(js|css|html)$/
    })
  ],
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shared': fileURLToPath(new URL('../shared', import.meta.url))
    }
  },
  server: {
    port: 5174,
    open: true
  },
  build: {
    outDir: 'dist/operation-map',
    assetsDir: 'static',
    sourcemap: false,
    assetsInlineLimit: 4000 * 1024,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        entryFileNames: `js/[name].${timestamp}.js`,
        chunkFileNames: `js/[name].${timestamp}.js`,
        assetFileNames: 'static/[name].[hash][extname]',
        manualChunks(id) {
          if (id.includes('/node_modules/element-plus/')) {
            return 'element-plus'
          }

          if (id.includes('/node_modules/')) {
            return 'chunk-vendors'
          }
        }
      }
    }
  }
}))
