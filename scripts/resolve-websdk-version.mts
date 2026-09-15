/**
 * 读取实际安装的 easemob-websdk 版本号，供 vite/vitest 的 define 注入到 src/config/version.ts。
 *
 * 背景：easemob-websdk 是 @easemob/uikit-sdk-websdk5 的传递依赖（pnpm 不会提升到根
 * node_modules），且其 package.json 的 exports 未暴露 ./package.json，无法在源码里直接
 * import。这里借助 uikit-sdk-websdk5 的包目录解析其依赖树中的 easemob-websdk 入口，
 * 再回读同目录的 package.json 版本号。
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

export function resolveWebsdkVersion(fallback = '5.x'): string {
  try {
    const require = createRequire(import.meta.url)
    // 先定位 @easemob/uikit-sdk-websdk5 包目录（pnpm 虚拟存储内），
    // 再从该目录解析其依赖 easemob-websdk 的入口文件
    const adapterDir = dirname(require.resolve('@easemob/uikit-sdk-websdk5'))
    const entry = require.resolve('easemob-websdk', { paths: [adapterDir] })
    const pkg = JSON.parse(readFileSync(join(dirname(entry), 'package.json'), 'utf-8')) as {
      version?: string
    }
    return pkg.version ?? fallback
  } catch {
    return fallback
  }
}
