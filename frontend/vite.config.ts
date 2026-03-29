import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { visualizer } from 'rollup-plugin-visualizer'

const shouldAnalyze = process.env.ANALYZE === 'true'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    outDir: './docs',
    rollupOptions: {
      output: {
        chunkFileNames: 'js/[name]-[hash].js', // 引入文件名的名称
        entryFileNames: 'js/[name]-[hash].js', // 包的入口文件名称
        assetFileNames: '[ext]/[name]-[hash].[ext]', // 资源文件像 字体，图片等
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          if (id.includes('three/examples')) {
            return 'vendor-3d-addons'
          }

          if (id.includes('@tweenjs') || id.includes('gsap')) {
            return 'vendor-motion'
          }

          if (id.includes('three')) {
            return 'vendor-3d-core'
          }

          if (id.includes('echarts') || id.includes('zrender')) {
            return 'vendor-charts-deferred'
          }

          if (id.includes('vue')) {
            return 'vendor-vue'
          }

          if (
            id.includes('lodash') ||
            id.includes('axios') ||
            id.includes('mitt') ||
            id.includes('autofit.js')
          ) {
            return 'vendor-utils'
          }

          return 'vendor-misc'
        },
      },
    },
  },
  plugins: [
    vue(),
    vueJsx(),
    shouldAnalyze ? visualizer({ open: true }) : null,
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          // 'primary-6': '#009cdc',
          'border-radius-small': '0px',
          'border-radius-medium': '0px',
          'border-radius-large': '0px',
        },
        javascriptEnabled: true,
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 8090,
    open: true,
    proxy: {
      '/bridge': {
        // target: 'http://192.168.1.123:9990',
        // target: 'http://192.168.1.21:9990',
        target: 'http://192.168.100.125:8081',
        changeOrigin: true,
      },
    },
  },
})
