// vite.config.ts
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "file:///C:/Users/luofeiyun/code/TwinOps/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/luofeiyun/code/TwinOps/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///C:/Users/luofeiyun/code/TwinOps/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import { visualizer } from "file:///C:/Users/luofeiyun/code/TwinOps/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
var __vite_injected_original_import_meta_url = "file:///C:/Users/luofeiyun/code/TwinOps/vite.config.ts";
var vite_config_default = defineConfig({
  base: "./",
  build: {
    outDir: "./docs",
    rollupOptions: {
      output: {
        chunkFileNames: "js/[name]-[hash].js",
        // 引入文件名的名称
        entryFileNames: "js/[name]-[hash].js",
        // 包的入口文件名称
        assetFileNames: "[ext]/[name]-[hash].[ext]",
        // 资源文件像 字体，图片等
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        }
      }
    }
  },
  plugins: [
    vue(),
    vueJsx(),
    visualizer({ open: true })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          // 'primary-6': '#009cdc',
          "border-radius-small": "0px",
          "border-radius-medium": "0px",
          "border-radius-large": "0px"
        },
        javascriptEnabled: true
      }
    }
  },
  server: {
    host: "0.0.0.0",
    port: 8090,
    open: true,
    proxy: {
      "/bridge": {
        // target: 'http://192.168.1.123:9990',
        // target: 'http://192.168.1.21:9990',
        target: "http://192.168.100.125:8081",
        changeOrigin: true
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxsdW9mZWl5dW5cXFxcY29kZVxcXFxUd2luT3BzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxsdW9mZWl5dW5cXFxcY29kZVxcXFxUd2luT3BzXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9sdW9mZWl5dW4vY29kZS9Ud2luT3BzL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnXHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xyXG5pbXBvcnQgdnVlSnN4IGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZS1qc3gnXHJcbmltcG9ydCB7IHZpc3VhbGl6ZXIgfSBmcm9tICdyb2xsdXAtcGx1Z2luLXZpc3VhbGl6ZXInXHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIGJhc2U6ICcuLycsXHJcbiAgYnVpbGQ6IHtcclxuICAgIG91dERpcjogJy4vZG9jcycsXHJcbiAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgIG91dHB1dDoge1xyXG4gICAgICAgIGNodW5rRmlsZU5hbWVzOiAnanMvW25hbWVdLVtoYXNoXS5qcycsIC8vIFx1NUYxNVx1NTE2NVx1NjU4N1x1NEVGNlx1NTQwRFx1NzY4NFx1NTQwRFx1NzlGMFxyXG4gICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnanMvW25hbWVdLVtoYXNoXS5qcycsIC8vIFx1NTMwNVx1NzY4NFx1NTE2NVx1NTNFM1x1NjU4N1x1NEVGNlx1NTQwRFx1NzlGMFxyXG4gICAgICAgIGFzc2V0RmlsZU5hbWVzOiAnW2V4dF0vW25hbWVdLVtoYXNoXS5bZXh0XScsIC8vIFx1OEQ0NFx1NkU5MFx1NjU4N1x1NEVGNlx1NTBDRiBcdTVCNTdcdTRGNTNcdUZGMENcdTU2RkVcdTcyNDdcdTdCNDlcclxuICAgICAgICBtYW51YWxDaHVua3MoaWQpIHtcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3InXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBwbHVnaW5zOiBbXHJcbiAgICB2dWUoKSxcclxuICAgIHZ1ZUpzeCgpLFxyXG4gICAgdmlzdWFsaXplcih7IG9wZW46IHRydWUgfSksXHJcbiAgXSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICAnQCc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMnLCBpbXBvcnQubWV0YS51cmwpKSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBjc3M6IHtcclxuICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcclxuICAgICAgbGVzczoge1xyXG4gICAgICAgIG1vZGlmeVZhcnM6IHtcclxuICAgICAgICAgIC8vICdwcmltYXJ5LTYnOiAnIzAwOWNkYycsXHJcbiAgICAgICAgICAnYm9yZGVyLXJhZGl1cy1zbWFsbCc6ICcwcHgnLFxyXG4gICAgICAgICAgJ2JvcmRlci1yYWRpdXMtbWVkaXVtJzogJzBweCcsXHJcbiAgICAgICAgICAnYm9yZGVyLXJhZGl1cy1sYXJnZSc6ICcwcHgnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgamF2YXNjcmlwdEVuYWJsZWQ6IHRydWUsXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgc2VydmVyOiB7XHJcbiAgICBob3N0OiAnMC4wLjAuMCcsXHJcbiAgICBwb3J0OiA4MDkwLFxyXG4gICAgb3BlbjogdHJ1ZSxcclxuICAgIHByb3h5OiB7XHJcbiAgICAgICcvYnJpZGdlJzoge1xyXG4gICAgICAgIC8vIHRhcmdldDogJ2h0dHA6Ly8xOTIuMTY4LjEuMTIzOjk5OTAnLFxyXG4gICAgICAgIC8vIHRhcmdldDogJ2h0dHA6Ly8xOTIuMTY4LjEuMjE6OTk5MCcsXHJcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovLzE5Mi4xNjguMTAwLjEyNTo4MDgxJyxcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbn0pXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBeVIsU0FBUyxlQUFlLFdBQVc7QUFDNVQsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sWUFBWTtBQUNuQixTQUFTLGtCQUFrQjtBQUpvSixJQUFNLDJDQUEyQztBQU9oTyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixNQUFNO0FBQUEsRUFDTixPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixnQkFBZ0I7QUFBQTtBQUFBLFFBQ2hCLGdCQUFnQjtBQUFBO0FBQUEsUUFDaEIsZ0JBQWdCO0FBQUE7QUFBQSxRQUNoQixhQUFhLElBQUk7QUFDZixjQUFJLEdBQUcsU0FBUyxjQUFjLEdBQUc7QUFDL0IsbUJBQU87QUFBQSxVQUNUO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsSUFBSTtBQUFBLElBQ0osT0FBTztBQUFBLElBQ1AsV0FBVyxFQUFFLE1BQU0sS0FBSyxDQUFDO0FBQUEsRUFDM0I7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssY0FBYyxJQUFJLElBQUksU0FBUyx3Q0FBZSxDQUFDO0FBQUEsSUFDdEQ7QUFBQSxFQUNGO0FBQUEsRUFDQSxLQUFLO0FBQUEsSUFDSCxxQkFBcUI7QUFBQSxNQUNuQixNQUFNO0FBQUEsUUFDSixZQUFZO0FBQUE7QUFBQSxVQUVWLHVCQUF1QjtBQUFBLFVBQ3ZCLHdCQUF3QjtBQUFBLFVBQ3hCLHVCQUF1QjtBQUFBLFFBQ3pCO0FBQUEsUUFDQSxtQkFBbUI7QUFBQSxNQUNyQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDTCxXQUFXO0FBQUE7QUFBQTtBQUFBLFFBR1QsUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLE1BQ2hCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
