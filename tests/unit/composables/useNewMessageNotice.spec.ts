import { nextTick, reactive } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import i18n from '@/locales'
import { useNewMessageNotice } from '@/composables/useNewMessageNotice'

/** 可变的 messageMap 数据源，模拟 uikit message store */
const messageMap = reactive<Record<string, unknown[]>>({})

vi.mock('@easemob-community/uikit-im', () => ({
  useUIKit: () => ({
    stores: {
      message: {
        get messageMap() {
          return messageMap
        },
      },
    },
  }),
}))

describe('useNewMessageNotice', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    document.title = '环信 IM Demo'
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })
  })

  afterEach(() => {
    vi.useRealTimers()
    for (const key of Object.keys(messageMap)) delete messageMap[key]
  })

  function setPageHidden(hidden: boolean) {
    Object.defineProperty(document, 'hidden', { value: hidden, configurable: true })
    Object.defineProperty(document, 'visibilityState', {
      value: hidden ? 'hidden' : 'visible',
      configurable: true,
    })
  }

  it('页面可见时收到新消息不闪烁标题', async () => {
    useNewMessageNotice()

    messageMap['cvs-1'] = [{}]
    await nextTick()
    await vi.advanceTimersByTimeAsync(3000)

    expect(document.title).toBe('环信 IM Demo')
  })

  it('页面隐藏时收到新消息，标题在原文与提示文案间闪烁', async () => {
    useNewMessageNotice()
    setPageHidden(true)

    messageMap['cvs-1'] = [{}]
    await nextTick()

    // 闪烁前的原始标题不变
    expect(document.title).toBe('环信 IM Demo')

    await vi.advanceTimersByTimeAsync(1000)
    expect(document.title).toBe(`${i18n.global.t('app.newMessageNotice')} 环信 IM Demo`)

    await vi.advanceTimersByTimeAsync(1000)
    expect(document.title).toBe('环信 IM Demo')
  })

  it('页面回到前台后停止闪烁并恢复原标题', async () => {
    useNewMessageNotice()
    setPageHidden(true)

    messageMap['cvs-1'] = [{}]
    await nextTick()
    await vi.advanceTimersByTimeAsync(1000)
    expect(document.title).not.toBe('环信 IM Demo')

    setPageHidden(false)
    document.dispatchEvent(new Event('visibilitychange'))
    expect(document.title).toBe('环信 IM Demo')

    // 定时器已清除，标题不再变化
    await vi.advanceTimersByTimeAsync(3000)
    expect(document.title).toBe('环信 IM Demo')
  })

  it('消息数减少（撤回等）不触发闪烁', async () => {
    messageMap['cvs-1'] = [{}]
    useNewMessageNotice()
    await nextTick()

    setPageHidden(true)
    messageMap['cvs-1'] = []
    await nextTick()
    await vi.advanceTimersByTimeAsync(3000)

    expect(document.title).toBe('环信 IM Demo')
  })

  it('闪烁期间再来新消息不重启闪烁节奏', async () => {
    useNewMessageNotice()
    setPageHidden(true)

    messageMap['cvs-1'] = [{}]
    await nextTick()
    await vi.advanceTimersByTimeAsync(1000)
    expect(document.title).toBe(`${i18n.global.t('app.newMessageNotice')} 环信 IM Demo`)

    // 闪烁进行中再来一条消息，相位不被重置
    messageMap['cvs-2'] = [{}]
    await nextTick()
    await vi.advanceTimersByTimeAsync(1000)
    expect(document.title).toBe('环信 IM Demo')
  })
})
