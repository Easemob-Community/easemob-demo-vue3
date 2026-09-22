import { effectScope, nextTick, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { UiPresence } from '@easemob-community/uikit-im'

import { usePresenceSubscription } from '@/composables/usePresenceSubscription'

// 可编程的 usePresence mock：调用记录 + 内存 presence 数据源
const presenceApi = vi.hoisted(() => ({
  subscribePresence: vi.fn<(userIds: string[], expiry?: number) => Promise<void>>(),
  unsubscribePresence: vi.fn<(userIds: string[]) => Promise<void>>(),
  presenceState: {} as Record<string, UiPresence>,
}))

vi.mock('@easemob-community/uikit-im', async () => {
  const { computed } = await import('vue')
  const { subscribePresence, unsubscribePresence, presenceState } = presenceApi
  return {
    usePresence: () => ({
      subscribePresence,
      unsubscribePresence,
      get: (userId: string) => computed(() => presenceState[userId]),
    }),
  }
})

describe('usePresenceSubscription', () => {
  beforeEach(() => {
    presenceApi.subscribePresence.mockReset().mockResolvedValue(undefined)
    presenceApi.unsubscribePresence.mockReset().mockResolvedValue(undefined)
    for (const key of Object.keys(presenceApi.presenceState)) {
      delete presenceApi.presenceState[key]
    }
  })

  it('初始化时立即订阅 userId 并暴露 presence 状态', async () => {
    presenceApi.presenceState['u1'] = { userId: 'u1', status: 'busy' }
    const userId = ref<string | undefined>('u1')

    const scope = effectScope()
    const result = scope.run(() => usePresenceSubscription(userId))
    if (!result) throw new Error('usePresenceSubscription 未返回结果')
    await nextTick()

    expect(presenceApi.subscribePresence).toHaveBeenCalledWith(['u1'])
    expect(result.presence.value?.status).toBe('busy')
    expect(result.presenceStatus.value).toBe('busy')
    expect(result.subscribed.value).toBe(true)

    scope.stop()
  })

  it('无 presence 数据时 presence 为 undefined，presenceStatus 回退 online', async () => {
    const userId = ref<string | undefined>('u1')

    const scope = effectScope()
    const result = scope.run(() => usePresenceSubscription(userId))
    if (!result) throw new Error('usePresenceSubscription 未返回结果')
    await nextTick()

    expect(result.presence.value).toBeUndefined()
    expect(result.presenceStatus.value).toBe('online')

    scope.stop()
  })

  it('userId 未配置（undefined）时不发起订阅', async () => {
    const userId = ref<string | undefined>(undefined)

    const scope = effectScope()
    const result = scope.run(() => usePresenceSubscription(userId))
    if (!result) throw new Error('usePresenceSubscription 未返回结果')
    await nextTick()

    expect(presenceApi.subscribePresence).not.toHaveBeenCalled()
    // scope 销毁时无订阅目标，也不发起退订
    scope.stop()
    expect(presenceApi.unsubscribePresence).not.toHaveBeenCalled()
  })

  it('订阅失败时静默降级，subscribed 为 false', async () => {
    presenceApi.subscribePresence.mockRejectedValueOnce(new Error('presence 未开通'))
    const userId = ref<string | undefined>('u1')

    const scope = effectScope()
    const result = scope.run(() => usePresenceSubscription(userId))
    if (!result) throw new Error('usePresenceSubscription 未返回结果')
    await nextTick()
    await nextTick()

    expect(result.subscribed.value).toBe(false)
    expect(result.presenceStatus.value).toBe('online')

    scope.stop()
  })

  it('userId 变化时退订旧目标并订阅新目标', async () => {
    const userId = ref<string | undefined>('u1')

    const scope = effectScope()
    scope.run(() => usePresenceSubscription(userId))
    await nextTick()

    userId.value = 'u2'
    await nextTick()

    expect(presenceApi.unsubscribePresence).toHaveBeenCalledWith(['u1'])
    expect(presenceApi.subscribePresence).toHaveBeenLastCalledWith(['u2'])

    scope.stop()
  })

  it('scope 销毁时退订当前订阅目标', async () => {
    const userId = ref<string | undefined>('u1')

    const scope = effectScope()
    scope.run(() => usePresenceSubscription(userId))
    await nextTick()

    scope.stop()

    expect(presenceApi.unsubscribePresence).toHaveBeenCalledWith(['u1'])
  })
})
