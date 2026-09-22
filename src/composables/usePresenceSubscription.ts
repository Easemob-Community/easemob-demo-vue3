import {
  computed,
  onScopeDispose,
  ref,
  toValue,
  watch,
  type ComputedRef,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'
import type { UiPresence } from '@easemob-community/uikit-im'
import { usePresence } from '@easemob-community/uikit-im'

export interface UsePresenceSubscriptionReturn {
  /** 订阅到的 presence 原始数据（无数据时为 undefined） */
  presence: ComputedRef<UiPresence | undefined>
  /** 在线状态：优先取订阅数据，无数据时回退为 online */
  presenceStatus: ComputedRef<UiPresence['status']>
  /** 当前是否订阅成功（服务端未开通或异常时为 false，静默降级） */
  subscribed: Ref<boolean>
}

/**
 * 订阅指定用户的在线状态（presence）。
 *
 * - userId 变化时自动退订旧目标并订阅新目标，宿主组件卸载时自动退订
 * - 服务端未开通 presence 或订阅异常时静默降级（presenceStatus 回退为 online）
 */
export function usePresenceSubscription(
  userId: MaybeRefOrGetter<string | undefined>,
): UsePresenceSubscriptionReturn {
  const { subscribePresence, unsubscribePresence, get: getPresence } = usePresence()

  const subscribed = ref(false)
  /** 最近一次订阅成功的目标，作为卸载时退订的依据 */
  const subscribedId = ref<string | undefined>(undefined)
  /** 订阅代次，避免 userId 快速变化时旧回调覆盖新状态 */
  let generation = 0

  const presence = computed(() => {
    const id = toValue(userId)
    return id ? getPresence(id)?.value : undefined
  })

  /** 在线状态：优先从 UIKit presence 订阅读取，默认 online */
  const presenceStatus = computed(() => presence.value?.status ?? 'online')

  // 订阅在线状态；服务端未开通或异常时静默降级
  watch(
    () => toValue(userId),
    async (id, oldId) => {
      const gen = ++generation
      if (oldId && oldId !== id) {
        unsubscribePresence([oldId]).catch(() => {
          // 忽略未连接等异常
        })
      }
      subscribedId.value = undefined
      if (!id) {
        subscribed.value = false
        return
      }
      try {
        await subscribePresence([id])
        if (gen !== generation) return
        subscribedId.value = id
        subscribed.value = true
      } catch {
        if (gen !== generation) return
        subscribed.value = false
      }
    },
    { immediate: true },
  )

  // 组件卸载 / 作用域销毁时退订当前目标
  onScopeDispose(() => {
    const id = subscribedId.value
    if (id) {
      unsubscribePresence([id]).catch(() => {
        // 忽略未连接等异常
      })
    }
  })

  return { presence, presenceStatus, subscribed }
}
