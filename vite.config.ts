import { existsSync, rmSync, statSync } from 'node:fs'
import { basename, join } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { brotliCompressSync, constants as zlibConstants, gzipSync } from 'node:zlib'

import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'

import { resolveWebsdkVersion } from './scripts/resolve-websdk-version.mjs'

/**
 * 防呆：vue3-uikit 经 npm registry（@easemob-community/*）引入，升级版本 pnpm install 后，
 * vite 会把依赖预打包缓存到 node_modules/.vite；若不重启 dev server，
 * vite 会继续服务旧版本的预打包产物（典型症状：黑名单等新功能不出现、样式无变化）。
 * 这里在 dev/build 启动时检测：已安装的 uikit 产物（im/core dist）比 .vite 缓存新
 * → 自动清空缓存，强制本次启动重新预打包。详见 .agent/skills/uikit-tgz-integration。
 */
const viteCacheDir = join(process.cwd(), 'node_modules/.vite')
const depsDir = join(viteCacheDir, 'deps')
/** dist 产物 → 对应 vite 预打包文件（.vite/deps 内文件名以实际 import 名生成） */
const uikitPairs = [
  {
    dist: join(process.cwd(), 'node_modules/@easemob-community/uikit-im/dist/easemob-uikit-im.js'),
    pre: join(depsDir, '@easemob-community_uikit-im.js'),
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

/** 需要预压缩的文本类产物扩展名（图片等二进制跳过） */
const COMPRESSIBLE_RE = /\.(?:js|mjs|css|html|svg|json|ico|txt|xml|webmanifest)$/

/**
 * 构建产物预压缩：为文本资源生成同名 .gz（gzip level 9）与 .br（brotli q11）文件，
 * 供静态服务器直接返回（nginx 需开启 gzip_static / brotli_static，见 AGENTS.md 部署小节），
 * 首次打开传输量可从约 2.9MB 降到约 850KB。原始文件保留，兼容不支持预压缩文件的服务器。
 * 不引入第三方压缩插件（对 rolldown 版 Vite 的兼容性不确定），直接用内置 zlib 实现。
 */
function buildCompressionPlugin(): Plugin {
  return {
    name: 'demo-build-compression',
    apply: 'build',
    generateBundle(_options, bundle) {
      for (const [fileName, item] of Object.entries(bundle)) {
        if (!COMPRESSIBLE_RE.test(fileName)) continue
        const source = item.type === 'chunk' ? item.code : item.source
        const buf = Buffer.isBuffer(source) ? source : Buffer.from(source as Uint8Array | string)
        this.emitFile({
          type: 'asset',
          fileName: `${fileName}.gz`,
          source: gzipSync(buf, { level: 9 }),
        })
        this.emitFile({
          type: 'asset',
          fileName: `${fileName}.br`,
          source: brotliCompressSync(buf, {
            params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 11 },
          }),
        })
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [vue(), buildCompressionPlugin()],
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
