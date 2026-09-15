import { existsSync, rmSync, statSync } from 'node:fs'
import { basename, join } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'

import { resolveWebsdkVersion } from './scripts/resolve-websdk-version.mjs'

/**
 * 防呆：vue3-uikit 以本地 tgz 方式联调（file:./easemob-uikit-*.tgz）。
 * vite 会把依赖预打包缓存到 node_modules/.vite；换新 tgz + pnpm install 后，
 * 若不重启 dev server，vite 会继续服务旧版本的预打包产物（典型症状：
 * 黑名单等新功能不出现、样式无变化）。
 * 这里在 dev/build 启动时检测：已安装的 uikit 产物（im/core dist）比 .vite 缓存新
 * → 自动清空缓存，强制本次启动重新预打包。详见 .agent/skills/uikit-tgz-integration。
 */
const viteCacheDir = join(process.cwd(), 'node_modules/.vite')
const depsDir = join(viteCacheDir, 'deps')
/** dist 产物 → 对应 vite 预打包文件（.vite/deps 内文件名以实际 import 名生成） */
const uikitPairs = [
  {
    dist: join(process.cwd(), 'node_modules/@easemob/uikit-im/dist/easemob-uikit-im.js'),
    pre: join(depsDir, '@easemob_uikit-im.js'),
  },
  {
    dist: join(process.cwd(), 'node_modules/@easemob/uikit-core/dist/easemob-uikit-core.js'),
    pre: join(depsDir, '@easemob_uikit-core.js'),
  },
]
if (existsSync(viteCacheDir)) {
  // 以预打包文件自身的 mtime 为准（目录 mtime 会被 dev server 运行期间刷新，不可靠）
  const stale = uikitPairs.some(
    ({ dist, pre }) =>
      existsSync(dist) && (!existsSync(pre) || statSync(dist).mtimeMs > statSync(pre).mtimeMs),
  )
  if (stale) {
    rmSync(viteCacheDir, { recursive: true, force: true })
    console.warn(
      `[vite] 检测到 vue3-uikit 产物已更新（新于预打包缓存，如 ${uikitPairs.map((p) => basename(p.dist)).join(' / ')}），已自动清除 node_modules/.vite，本次启动将重新预打包。`,
    )
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [vue()],
    define: {
      // 注入实际安装的 easemob-websdk 版本号（「关于我们 / 登录页」展示用，见 src/config/version.ts）
      __SDK_VERSION__: JSON.stringify(resolveWebsdkVersion()),
    },
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
