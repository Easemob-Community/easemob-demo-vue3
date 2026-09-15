/** 页面展示用的版本号（从 package.json、构建注入与本地 uikit 包中读取） */
import pkg from '../../package.json'

/** UIKit 版本：从 package.json 的 uikit-im tgz 依赖名中提取（file:./easemob-uikit-im-3.5.0.tgz → 3.5.0） */
const uikitImVersion = extractVersion(pkg.dependencies?.['@easemob/uikit-im']) ?? '1.0.0'

/** SDK 版本：构建时注入当前实际安装的 easemob-websdk 版本（exports 未暴露 package.json，无法运行时读取） */
export const SDK_VERSION = typeof __SDK_VERSION__ === 'undefined' ? '5.x' : __SDK_VERSION__
export const UIKIT_VERSION = `VUE ${uikitImVersion}`
/** Demo 版本：直接取本仓库 package.json 的 version */
export const DEMO_VERSION = pkg.version

function extractVersion(versionSpec: string | undefined): string | undefined {
  if (!versionSpec) return undefined
  const match = versionSpec.match(/(\d+\.\d+\.\d+)/)
  return match?.[1]
}
