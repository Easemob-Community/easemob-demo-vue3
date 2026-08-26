import { describe, expect, it } from 'vitest'

import { toUIKitLocale } from './useUIKitConfig'

describe('toUIKitLocale（Demo 语言 → UIKit 语言）', () => {
  it('Demo zh-CN 映射为 uikit zh-CN', () => {
    expect(toUIKitLocale('zh-CN')).toBe('zh-CN')
  })

  it('Demo en-US 映射为 uikit en', () => {
    expect(toUIKitLocale('en-US')).toBe('en')
  })
})
