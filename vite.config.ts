import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        // 自研 vue3-uikit 本地联调时可指向上层目录源码，例如：
        // 'vue3-uikit': fileURLToPath(new URL('../vue3-uikit/src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      open: false,
      proxy: {
        // 后端接口代理，按需调整 target
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})
