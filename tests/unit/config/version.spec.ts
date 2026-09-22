import { describe, expect, it } from 'vitest'

import pkg from '../../../package.json'
import { DEMO_VERSION, SDK_VERSION, UIKIT_VERSION } from '@/config/version'

describe('version 版本信息', () => {
  it('SDK_VERSION 为构建注入的 easemob-websdk 实际版本（x.y.z 格式）', () => {
    expect(SDK_VERSION).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it('UIKIT_VERSION 从 package.json 的 uikit-im tgz 依赖名提取，带 VUE 前缀', () => {
    expect(UIKIT_VERSION).toMatch(/^VUE \d+\.\d+\.\d+$/)
    const tgzVersion = pkg.dependencies['@easemob-community/uikit-im'].match(/(\d+\.\d+\.\d+)/)?.[1]
    expect(UIKIT_VERSION).toBe(`VUE ${tgzVersion}`)
  })

  it('DEMO_VERSION 与 package.json 的 version 一致', () => {
    expect(DEMO_VERSION).toBe(pkg.version)
  })
})
