import { computed, ref, watch } from 'vue'
import { createUIKitStorageKey, useUIKit } from '@easemob-community/uikit-im'

import { DEMO_SIDEBAR_CONFIG } from '@/config/demo'

/**
 * UIKit 侧边栏宽度（EmResizable 拖拽调整 + localStorage 持久化）。
 * 会话 / 通讯录 / 设置三页共用同一套逻辑，此处收敛为单一实现。
 *
 * 无记忆时 sidebarWidth 为 undefined：EmResizable 进入 fluid 弹性模式，不写内联宽度，
 * 交给 UIKIT 侧栏基准 token（--uikit-sidebar-width，默认 clamp(240px, 25%, 480px)）决定，
 * 随窗口变宽 / 变窄伸缩（约 1440px 处为 360px）；用户拖拽后写回具体 px 并持久化，
 * 此后按手动宽度固定。
 *
 * @param storageSuffix 存储 key 后缀（与 UIKit 内部配置同一套体系；
 *   会话 / 通讯录 / 设置三页传同一后缀，使三页侧边栏宽度联动一致）
 * @returns sidebarWidth 当前宽度（ref；undefined 表示无记忆、走弹性基准；供 v-model 绑定）；
 *   persistSidebarWidth 拖拽结束回调
 */
export function useSidebarWidth(storageSuffix: string) {
  const { stores } = useUIKit()

  /** 存储 key：按 appKey + 用户隔离（与 UIKit 内部配置同一套体系） */
  const sidebarStorageKey = computed(() =>
    createUIKitStorageKey(stores.client.appKey, stores.client.currentUser, storageSuffix),
  )

  const sidebarWidth = ref<number | undefined>(undefined)

  /** 读取持久化宽度（含边界钳制）；无记忆 / 非法时置 undefined（走弹性基准）；登录用户变化时重新读取 */
  function readStoredSidebarWidth() {
    const raw = localStorage.getItem(sidebarStorageKey.value)
    const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN
    sidebarWidth.value = Number.isNaN(parsed)
      ? undefined
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
