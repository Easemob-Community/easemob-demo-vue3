import { describe, expect, it, vi } from 'vitest'

import { initUIKit } from '@/utils/uikit'

describe('initUIKit', () => {
  it('appKey 非空时以 { appKey } 调用 init', async () => {
    const init = vi.fn().mockResolvedValue(undefined)

    await initUIKit(init, 'test-app-key')

    expect(init).toHaveBeenCalledTimes(1)
    expect(init).toHaveBeenCalledWith({ appKey: 'test-app-key' })
  })

  it('appKey 为空时抛错且不调用 init', async () => {
    const init = vi.fn()

    await expect(initUIKit(init, '')).rejects.toThrow('AppKey 未配置，无法初始化 IM SDK')
    expect(init).not.toHaveBeenCalled()
  })

  it('init 抛错时原样向上传递', async () => {
    const init = vi.fn().mockRejectedValue(new Error('adapter not registered'))

    await expect(initUIKit(init, 'test-app-key')).rejects.toThrow('adapter not registered')
  })
})
