import { computed, watch } from 'vue'
import { tryOnBeforeUnmount } from '@vueuse/core'

import { useUIKit } from '@easemob/uikit-im'

import i18n from '@/locales'

/**
 * 新消息标签页标题提醒 composable：
 * 页面处于后台（document.hidden）时收到新消息，在浏览器标签页标题上闪烁「您有新消息」提示；
 * 页面回到前台后自动停止并恢复原标题。需在 EmUIKitProvider 作用域内调用。
 */

/** 标题闪烁间隔（毫秒） */
const FLASH_INTERVAL = 1000

export function useNewMessageNotice() {
  const { stores } = useUIKit()

  /** 全部会话消息总数：新消息到达即 +1，避免深监听整个 messageMap */
  const totalMessageCount = computed(() =>
    Object.values(stores.message.messageMap).reduce((count, msgs) => count + msgs.length, 0),
  )

  let flashTimer: ReturnType<typeof setInterval> | null = null
  /** 开始闪烁前记录的原始标题，停止时恢复 */
  let originalTitle = ''
  /** 闪烁相位：true 时显示提示文案 */
  let showingNotice = false

  function stopFlash(restoreTitle = true) {
    if (flashTimer !== null) {
      clearInterval(flashTimer)
      flashTimer = null
    }
    if (restoreTitle) document.title = originalTitle
  }

  function startFlash() {
    if (flashTimer !== null) return
    originalTitle = document.title
    showingNotice = false
    flashTimer = setInterval(() => {
      showingNotice = !showingNotice
      document.title = showingNotice
        ? `${i18n.global.t('app.newMessageNotice')} ${originalTitle}`
        : originalTitle
    }, FLASH_INTERVAL)
  }

  /** 页面回到前台：停止闪烁并恢复原标题 */
  function handleVisibilityChange() {
    if (document.visibilityState === 'visible') stopFlash()
  }

  watch(totalMessageCount, (count, prevCount) => {
    // 消息数减少（撤回、清缓存等）不处理；页面可见时不打扰
    if (count <= prevCount || !document.hidden) return
    startFlash()
  })

  document.addEventListener('visibilitychange', handleVisibilityChange)

  tryOnBeforeUnmount(() => {
    stopFlash(false)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })
}
