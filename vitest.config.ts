import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

import { resolveWebsdkVersion } from './scripts/resolve-websdk-version.mjs'

export default defineConfig({
  plugins: [vue()],
  define: {
    // 与 vite.config.ts 保持一致：注入实际安装的 easemob-websdk 版本号
    __SDK_VERSION__: JSON.stringify(resolveWebsdkVersion()),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.spec.ts'],
  },
})
