import type { useClient } from '@easemob-community/uikit-im'

import {
  isValidRestServerUrl,
  isValidWebSocketUrl,
  type SDKInitConfig,
} from '@/config/dev'
import { resolveStickerLastMessageText } from '@/config/sticker'

type ClientInit = ReturnType<typeof useClient>['init']

/**
 * 统一初始化 IM SDK。
 *
 * `init` 须由调用方在组件 setup（UIKit Provider 作用域）内通过 `useClient()` 获取后传入——
 * `useClient()` 依赖 Vue 的 inject，在 setup 之外（如点击处理器）调用会取不到 Provider 上下文。
 * AppKey 与 AppID 均为空时抛错，由调用方决定提示方式或静默跳过。
 */
export async function initUIKit(init: ClientInit, config: SDKInitConfig): Promise<void> {
  const { appKey, appId, serverUrls } = config
  if (!appKey && !appId) {
    throw new Error('AppKey 或 AppID 未配置，无法初始化 IM SDK')
  }
  if (
    serverUrls &&
    (!isValidRestServerUrl(serverUrls.restApiUrl) || !isValidWebSocketUrl(serverUrls.wsUrl))
  ) {
    throw new Error('私有服务器地址无效，请填写带协议的完整 REST 和 WebSocket 地址')
  }
  await init({
    ...(appId ? { appId } : { appKey }),
    adapterConfig: {
      lastMessageTextResolver: resolveStickerLastMessageText,
      ...(serverUrls ? { serviceConfig: { serverUrls } } : {}),
    },
  })
}
