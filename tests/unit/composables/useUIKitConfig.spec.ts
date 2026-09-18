import { describe, expect, it } from 'vitest'

import { patchLegacyThemeStorage, toUIKitLocale, UIKIT_THEME_STORAGE_KEY } from '@/composables/useUIKitConfig'
import { DEMO_CONTAINER_CONFIG, DEMO_INTERACTION_CONFIG } from '@/config/demo'

/** 内存版 Storage，避免测试污染真实 localStorage */
function createMemoryStorage(): Storage {
  const data = new Map<string, string>()
  return {
    get length() {
      return data.size
    },
    clear: () => data.clear(),
    getItem: (key: string) => data.get(key) ?? null,
    key: (index: number) => [...data.keys()][index] ?? null,
    removeItem: (key: string) => void data.delete(key),
    setItem: (key: string, value: string) => void data.set(key, value),
  }
}

describe('toUIKitLocale（Demo 语言 → UIKit 语言）', () => {
  it('Demo zh-CN 映射为 uikit zh-CN', () => {
    expect(toUIKitLocale('zh-CN')).toBe('zh-CN')
  })

  it('Demo en-US 映射为 uikit en', () => {
    expect(toUIKitLocale('en-US')).toBe('en')
  })
})

describe('patchLegacyThemeStorage（旧主题缓存补齐）', () => {
  it('缓存不存在时不写入', () => {
    const storage = createMemoryStorage()
    patchLegacyThemeStorage(storage)
    expect(storage.getItem(UIKIT_THEME_STORAGE_KEY)).toBeNull()
  })

  it('旧缓存缺少 containerGap / hoverStyle 时按 Demo 常量补齐', () => {
    const storage = createMemoryStorage()
    storage.setItem(UIKIT_THEME_STORAGE_KEY, JSON.stringify({ mode: 'dark', primaryColor: 203 }))
    patchLegacyThemeStorage(storage)
    const cached = JSON.parse(storage.getItem(UIKIT_THEME_STORAGE_KEY) ?? '{}') as Record<string, unknown>
    expect(cached.containerGap).toBe(DEMO_CONTAINER_CONFIG.gap)
    expect(cached.hoverStyle).toBe(DEMO_INTERACTION_CONFIG.hoverStyle)
    // 已有字段不被改动
    expect(cached.mode).toBe('dark')
  })

  it('用户已调过并持久化的值不被覆盖', () => {
    const storage = createMemoryStorage()
    storage.setItem(
      UIKIT_THEME_STORAGE_KEY,
      JSON.stringify({ mode: 'light', containerGap: 20, hoverStyle: 'rounded' }),
    )
    patchLegacyThemeStorage(storage)
    const cached = JSON.parse(storage.getItem(UIKIT_THEME_STORAGE_KEY) ?? '{}') as Record<string, unknown>
    expect(cached.containerGap).toBe(20)
    expect(cached.hoverStyle).toBe('rounded')
  })

  it('缓存 JSON 损坏时不抛异常、不写入', () => {
    const storage = createMemoryStorage()
    storage.setItem(UIKIT_THEME_STORAGE_KEY, '{broken json')
    expect(() => patchLegacyThemeStorage(storage)).not.toThrow()
    expect(storage.getItem(UIKIT_THEME_STORAGE_KEY)).toBe('{broken json')
  })
})
