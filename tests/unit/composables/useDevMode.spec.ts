import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createDevMode } from '@/composables/useDevMode'
import { getDevModeEnabled, setDevModeEnabled } from '@/config/dev'

describe('useDevMode 状态机', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
    localStorage.clear()
    sessionStorage.clear()
  })

  it('默认参数：前 4 次静默、第 5/6 次提示剩余次数、第 7 次开启', () => {
    const dm = createDevMode()
    expect(dm.devEnabled.value).toBe(false)

    for (let i = 0; i < 4; i += 1) {
      expect(dm.registerTap()).toEqual({ status: 'silent' })
    }
    expect(dm.registerTap()).toEqual({ status: 'hint', remaining: 2 })
    expect(dm.registerTap()).toEqual({ status: 'hint', remaining: 1 })
    expect(dm.registerTap()).toEqual({ status: 'enabled' })
    expect(dm.devEnabled.value).toBe(true)
    expect(dm.tapCount.value).toBe(0)
  })

  it('已开启时再次点击即退出', () => {
    const dm = createDevMode({ initialEnabled: true })
    expect(dm.registerTap()).toEqual({ status: 'exited' })
    expect(dm.devEnabled.value).toBe(false)
  })

  it('超过复位窗口未继续点击则计数归零', () => {
    const dm = createDevMode()
    dm.registerTap()
    dm.registerTap()
    dm.registerTap()
    expect(dm.tapCount.value).toBe(3)

    vi.advanceTimersByTime(3000)
    expect(dm.tapCount.value).toBe(0)
    expect(dm.registerTap()).toEqual({ status: 'silent' })
  })

  it('显式退出会清空计数', () => {
    const dm = createDevMode({ initialEnabled: true })
    dm.exitDevMode()
    expect(dm.devEnabled.value).toBe(false)
    expect(dm.tapCount.value).toBe(0)
  })

  it('进入和退出时通知持久化层，重复保存开启状态也会写回', () => {
    const onEnabledChange = vi.fn()
    const dm = createDevMode({ initialEnabled: true, onEnabledChange })

    dm.enterDevMode()
    expect(dm.devEnabled.value).toBe(true)
    expect(onEnabledChange).toHaveBeenLastCalledWith(true)

    dm.exitDevMode()
    expect(dm.devEnabled.value).toBe(false)
    expect(onEnabledChange).toHaveBeenLastCalledWith(false)
    expect(onEnabledChange).toHaveBeenCalledTimes(2)
  })

  it('可用持久化状态重建实例，模拟保存刷新后仍处于 dev 模式', () => {
    setDevModeEnabled(true)
    const restored = createDevMode({ initialEnabled: getDevModeEnabled() ?? false })

    expect(restored.devEnabled.value).toBe(true)
  })
})
