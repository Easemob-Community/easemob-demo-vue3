import { useClient } from '@easemob/uikit-im'

/**
 * 统一初始化 IM SDK。
 *
 * 必须在组件 setup（UIKit Provider 作用域）内调用——内部依赖 `useClient()` 的 context 注入。
 * appKey 为空时抛错，由调用方决定提示方式或静默跳过。
 */
export async function initUIKit(appKey: string): Promise<void> {
  if (!appKey) {
    throw new Error('AppKey 未配置，无法初始化 IM SDK')
  }
  const { init } = useClient()
  await init({ appKey })
}
