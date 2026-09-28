import { readonly, ref } from 'vue'

/**
 * H5 底部 tabbar 显隐状态，模块级单例全局共享。
 *
 * 使用场景：H5 下聊天页进入会话聊天态（`chat-page__mobile-chat`）时隐藏底部 tabbar，
 * 避免 tabbar 顶起 UIKit 内嵌的表情面板 / 输入区；返回会话列表态或离开聊天页时恢复。
 * 状态由 `src/views/chat/index.vue` 驱动，`src/layout/index.vue` 消费渲染条件；
 * PC 下 tabbar 本就不渲染，该状态置位与否均无视觉影响。
 */

/** tabbar 是否隐藏 */
const isHidden = ref(false)

function hideTabbar() {
  isHidden.value = true
}

function showTabbar() {
  isHidden.value = false
}

export function useMobileTabbar() {
  return { isTabbarHidden: readonly(isHidden), hideTabbar, showTabbar }
}
