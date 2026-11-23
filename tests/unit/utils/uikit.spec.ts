import { describe, expect, it, vi } from 'vitest'

import { initUIKit } from '@/utils/uikit'
import { resolveStickerLastMessageText } from '@/config/sticker'

describe('initUIKit', () => {
  it('appKey 非空时注入 appKey 和统一消息摘要 resolver，不传固定服务地址', async () => {
    const init = vi.fn().mockResolvedValue(undefined)

    await initUIKit(init, { appKey: 'test-app-key' })

    expect(init).toHaveBeenCalledTimes(1)
    expect(init).toHaveBeenCalledWith({
      appKey: 'test-app-key',
      adapterConfig: { lastMessageTextResolver: resolveStickerLastMessageText },
    })
  })

  it('AppID 模式注入 appId 且不传 appKey', async () => {
    const init = vi.fn().mockResolvedValue(undefined)
    const appId = 'fdde6bc4ae6841a9b874be1b7ad0a8ff'

    await initUIKit(init, { appId })

    expect(init).toHaveBeenCalledWith({
      appId,
      adapterConfig: { lastMessageTextResolver: resolveStickerLastMessageText },
    })
    expect(init.mock.calls[0][0]).not.toHaveProperty('appKey')
  })

  it('私有服务器地址映射为 WebSDK 5 serviceConfig.serverUrls', async () => {
    const init = vi.fn().mockResolvedValue(undefined)
    const serverUrls = {
      restApiUrl: 'https://rest.example.com/api',
      wsUrl: 'wss://im.example.com/ws',
    }

    await initUIKit(init, { appKey: 'custom#app', serverUrls })

    expect(init).toHaveBeenCalledWith({
      appKey: 'custom#app',
      adapterConfig: {
        lastMessageTextResolver: resolveStickerLastMessageText,
        serviceConfig: { serverUrls },
      },
    })
  })

  it.each([
    { restApiUrl: '', wsUrl: 'wss://im.example.com' },
    { restApiUrl: 'rest.example.com', wsUrl: 'wss://im.example.com' },
    { restApiUrl: 'https://rest.example.com', wsUrl: 'im.example.com' },
    { restApiUrl: 'wss://rest.example.com', wsUrl: 'https://im.example.com' },
  ])('私有地址非法时拒绝初始化且不动态回退：%j', async (serverUrls) => {
    const init = vi.fn()

    await expect(initUIKit(init, { appKey: 'custom#app', serverUrls })).rejects.toThrow(
      '私有服务器地址无效',
    )
    expect(init).not.toHaveBeenCalled()
  })

  it('AppKey 和 AppID 均为空时抛错且不调用 init', async () => {
    const init = vi.fn()

    await expect(initUIKit(init, { appKey: '' })).rejects.toThrow(
      'AppKey 或 AppID 未配置，无法初始化 IM SDK',
    )
    expect(init).not.toHaveBeenCalled()
  })

  it('init 抛错时原样向上传递', async () => {
    const init = vi.fn().mockRejectedValue(new Error('adapter not registered'))

    await expect(initUIKit(init, { appKey: 'test-app-key' })).rejects.toThrow(
      'adapter not registered',
    )
  })
})
