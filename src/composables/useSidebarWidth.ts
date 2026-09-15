import { computed, ref, watch } from 'vue'
import { createUIKitStorageKey, useUIKit } from '@easemob/uikit-im'

import { DEMO_SIDEBAR_CONFIG } from '@/config/demo'

/**
 * UIKit 侧边栏宽度（EmResizable 拖拽调整 + localStorage 持久化）。
 * 会话 / 通讯录 / 设置三页共用同一套逻辑，此处收敛为单一实现。
 *
 * @param storageSuffix 存储 key 后缀（与 UIKit 内部配置同一套体系，各页互不影响）
 * @param defaultWidth 无持久化记忆时的默认宽度（px）
 * @returns sidebarWidth 当前宽度（ref，供 v-model 绑定）；persistSidebarWidth 拖拽结束回调
 */
export function useSidebarWidth(storageSuffix: string, defaultWidth: number) {
  const { stores } = useUIKit()

  /** 存储 key：按 appKey + 用户隔离（与 UIKit 内部配置同一套体系） */
  const sidebarStorageKey = computed(() =>
    createUIKitStorageKey(stores.client.appKey, stores.client.currentUser, storageSuffix),
  )

  const sidebarWidth = ref<number>(defaultWidth)

  /** 读取持久化宽度（含边界钳制）；登录用户变化时重新读取 */
  function readStoredSidebarWidth() {
    const raw = localStorage.getItem(sidebarStorageKey.value)
    const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN
    sidebarWidth.value = Number.isNaN(parsed)
      ? defaultWidth
      : Math.min(Math.max(parsed, DEMO_SIDEBAR_CONFIG.minWidth), DEMO_SIDEBAR_CONFIG.maxWidth)
  }

  watch(
    [() => stores.client.appKey, () => stores.client.currentUser],
    () => readStoredSidebarWidth(),
    { immediate: true },
  )

  /** 拖拽结束回调：写回状态并持久化到 UIKIT 内部配置存储 */
  function persistSidebarWidth(width: number) {
    sidebarWidth.value = width
    localStorage.setItem(sidebarStorageKey.value, String(width))
  }

  return { sidebarWidth, persistSidebarWidth }
}
