import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createDevMode } from './useDevMode'

describe('useDevMode 状态机', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
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
})
