import { nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useUIKit } from '@easemob/uikit-im'

import { useSidebarWidth } from '@/composables/useSidebarWidth'
import { DEMO_SIDEBAR_CONFIG } from '@/config/demo'

// 模拟 uikit 的 client 状态（appKey / 当前登录用户），用例中可直接改写以触发重新读取
const clientState = vi.hoisted(() => ({ appKey: 'app-key-1', currentUser: 'user-1' }))

vi.mock('@easemob/uikit-im', async () => {
  const { reactive } = await import('vue')
  // 缓存同一份响应式代理，保证 composable 与用例读写的是同一状态
  const client = reactive(clientState)
  return {
    createUIKitStorageKey: (appKey: string, user: string, suffix: string) =>
      `uikit:${appKey}:${user}:${suffix}`,
    useUIKit: () => ({ stores: { client } }),
  }
})

/** mock 的 client 响应式状态（写操作需走代理才能触发 watch） */
function mockClient() {
  return useUIKit().stores.client as typeof clientState
}

/** 当前 mock 用户对应的存储 key */
function currentStorageKey(suffix: string) {
  const { appKey, currentUser } = mockClient()
  return `uikit:${appKey}:${currentUser}:${suffix}`
}

const SUFFIX = 'layout_test_sidebar_width'
const DEFAULT_WIDTH = 320

describe('useSidebarWidth', () => {
  beforeEach(() => {
    localStorage.clear()
    mockClient().appKey = 'app-key-1'
    mockClient().currentUser = 'user-1'
  })

  it('无持久化值时使用默认宽度', () => {
    const { sidebarWidth } = useSidebarWidth(SUFFIX, DEFAULT_WIDTH)
    expect(sidebarWidth.value).toBe(DEFAULT_WIDTH)
  })

  it('读取范围内的持久化宽度', () => {
    localStorage.setItem(currentStorageKey(SUFFIX), String(DEFAULT_WIDTH + 40))
    const { sidebarWidth } = useSidebarWidth(SUFFIX, DEFAULT_WIDTH)
    expect(sidebarWidth.value).toBe(DEFAULT_WIDTH + 40)
  })

  it('持久化宽度超出边界时钳制到最小 / 最大宽度', () => {
    localStorage.setItem(currentStorageKey(SUFFIX), String(DEMO_SIDEBAR_CONFIG.minWidth - 100))
    const tooNarrow = useSidebarWidth(SUFFIX, DEFAULT_WIDTH)
    expect(tooNarrow.sidebarWidth.value).toBe(DEMO_SIDEBAR_CONFIG.minWidth)

    localStorage.setItem(currentStorageKey(SUFFIX), String(DEMO_SIDEBAR_CONFIG.maxWidth + 100))
    const tooWide = useSidebarWidth(SUFFIX, DEFAULT_WIDTH)
    expect(tooWide.sidebarWidth.value).toBe(DEMO_SIDEBAR_CONFIG.maxWidth)
  })

  it('持久化值非法（非数字）时回退默认宽度', () => {
    localStorage.setItem(currentStorageKey(SUFFIX), 'abc')
    const { sidebarWidth } = useSidebarWidth(SUFFIX, DEFAULT_WIDTH)
    expect(sidebarWidth.value).toBe(DEFAULT_WIDTH)
  })

  it('登录用户变化时按新 key 重新读取', async () => {
    localStorage.setItem(currentStorageKey(SUFFIX), String(DEFAULT_WIDTH + 40))

    const { sidebarWidth } = useSidebarWidth(SUFFIX, DEFAULT_WIDTH)
    expect(sidebarWidth.value).toBe(DEFAULT_WIDTH + 40)

    // 切换用户：新用户无记忆 → 回退默认宽度
    mockClient().currentUser = 'user-2'
    await nextTick()
    expect(sidebarWidth.value).toBe(DEFAULT_WIDTH)

    // 给新用户写入记忆后再切回，按各自 key 独立读取
    localStorage.setItem(currentStorageKey(SUFFIX), String(DEFAULT_WIDTH + 80))
    mockClient().currentUser = 'user-1'
    await nextTick()
    expect(sidebarWidth.value).toBe(DEFAULT_WIDTH + 40)
  })

  it('persistSidebarWidth 写回状态并持久化到当前用户的存储 key', () => {
    const { sidebarWidth, persistSidebarWidth } = useSidebarWidth(SUFFIX, DEFAULT_WIDTH)

    persistSidebarWidth(DEFAULT_WIDTH + 60)
    expect(sidebarWidth.value).toBe(DEFAULT_WIDTH + 60)
    expect(localStorage.getItem(currentStorageKey(SUFFIX))).toBe(String(DEFAULT_WIDTH + 60))
  })
})
