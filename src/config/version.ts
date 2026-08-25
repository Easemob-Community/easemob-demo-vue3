/** 页面展示用的版本号（从 package.json 与本地 uikit 包中读取） */
import pkg from '../../package.json'

const uikitImVersion = extractVersion(pkg.dependencies?.['@easemob/uikit-im']) ?? '1.0.0'

export const SDK_VERSION = '5.1.1'
export const UIKIT_VERSION = `VUE ${uikitImVersion}`
export const DEMO_VERSION = '2.0.0'

function extractVersion(versionSpec: string | undefined): string | undefined {
  if (!versionSpec) return undefined
  const match = versionSpec.match(/(\d+\.\d+\.\d+)/)
  return match?.[1]
}
