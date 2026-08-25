import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it } from 'vitest'

import { useConversationStore } from '@easemob/uikit-im'

/**
 * 消费者验证冒烟：@easemob/uikit-im（tgz 产物）运行在 pinia 4.x 下。
 * uikit-im 的 peer 范围为 pinia ^2.1.0，本用例验证 2.x 风格 setup store
 * 在 pinia 4 下的实例化 / 响应式更新兼容性。
 */
describe('@easemob/uikit-im @ pinia 4 兼容性冒烟', () => {
  it('setup store 可在 pinia 4 下实例化并响应式更新', () => {
    setActivePinia(createPinia())
    const store = useConversationStore()

    // 初始状态
    expect(store.conversationList).toEqual([])
    expect(store.currentConversationId).toBeNull()
    expect(store.currentConversation).toBeNull()

    // 通过 action 写入状态，验证 pinia 4 代理 / 响应式正常
    store.setCurrentConversationId('conv-1')
    expect(store.currentConversationId).toBe('conv-1')

    store.setConversationsLoaded(true)
    expect(store.conversationsLoaded).toBe(true)
  })
})
