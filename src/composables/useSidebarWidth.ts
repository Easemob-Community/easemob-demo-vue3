import { computed, ref, watch } from 'vue'
import { createUIKitStorageKey, useUIKit } from '@easemob-community/uikit-im'

import { DEMO_SIDEBAR_CONFIG } from '@/config/demo'

/**
 * UIKit 侧边栏宽度（EmResizable 拖拽调整 + localStorage 持久化）。
 * 会话 / 通讯录 / 设置三页共用同一套逻辑，此处收敛为单一实现。
 *
 * 无拖拽记忆时回退到 DEMO_SIDEBAR_CONFIG.defaultWidth（360px）作为受控宽度——
 * 不走 UIKit fluid 弹性基准（clamp(240px, 25%, 480px)），宽窗口下 25% 可达 480px，
 * 与默认宽度设置不一致、观感过宽；用户拖拽后写回具体 px 并持久化，此后按手动宽度固定。
 *
 * @param storageSuffix 存储 key 后缀（与 UIKit 内部配置同一套体系；
 *   会话 / 通讯录 / 设置三页传同一后缀，使三页侧边栏宽度联动一致）
 * @returns sidebarWidth 当前宽度（ref；供 v-model 绑定）；
 *   persistSidebarWidth 拖拽结束回调
 */
export function useSidebarWidth(storageSuffix: string) {
  const { stores } = useUIKit()

  /** 存储 key：按 appKey + 用户隔离（与 UIKit 内部配置同一套体系） */
  const sidebarStorageKey = computed(() =>
    createUIKitStorageKey(stores.client.appKey, stores.client.currentUser, storageSuffix),
  )

  const sidebarWidth = ref<number>(DEMO_SIDEBAR_CONFIG.defaultWidth)

  /** 读取持久化宽度（含边界钳制）；无记忆 / 非法时回退默认宽度；登录用户变化时重新读取 */
  function readStoredSidebarWidth() {
    const raw = localStorage.getItem(sidebarStorageKey.value)
    const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN
    sidebarWidth.value = Number.isNaN(parsed)
      ? DEMO_SIDEBAR_CONFIG.defaultWidth
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
