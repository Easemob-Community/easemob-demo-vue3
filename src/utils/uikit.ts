import type { useClient } from '@easemob-community/uikit-im'

type ClientInit = ReturnType<typeof useClient>['init']

/**
 * 统一初始化 IM SDK。
 *
 * `init` 须由调用方在组件 setup（UIKit Provider 作用域）内通过 `useClient()` 获取后传入——
 * `useClient()` 依赖 Vue 的 inject，在 setup 之外（如点击处理器）调用会取不到 Provider 上下文。
 * appKey 为空时抛错，由调用方决定提示方式或静默跳过。
 */
export async function initUIKit(init: ClientInit, appKey: string): Promise<void> {
  if (!appKey) {
    throw new Error('AppKey 未配置，无法初始化 IM SDK')
  }
  await init({ appKey })
}
