import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocale, useTheme as useUIKitTheme } from '@easemob/uikit-im'

import { useTheme } from './useTheme'
import { DEMO_CONTAINER_CONFIG, DEMO_INTERACTION_CONFIG } from '@/config/demo'
import type { AppLocale } from '@/locales'

/**
 * UIKit 仅支持 `zh-CN` / `en` 两种语言，Demo 侧的 `en-US` 需映射为 `en`。
 */
export const UIKIT_LOCALE_MAP: Record<AppLocale, 'zh-CN' | 'en'> = {
  'zh-CN': 'zh-CN',
  'en-US': 'en',
}

export type UIKitLocale = (typeof UIKIT_LOCALE_MAP)[AppLocale]

/** 将 Demo 语言映射为 UIKit 语言（UIKit 不支持的 locale 回退中文） */
export function toUIKitLocale(locale: AppLocale): UIKitLocale {
  return UIKIT_LOCALE_MAP[locale] ?? 'zh-CN'
}

/**
 * 让 `EmUIKitProvider`（UIKit）与 Demo 本体联动：
 *
 * - 语言：UIKit 仅在 Provider **挂载时**应用一次 `locale` 属性（见 useProviderSideEffects 的 onMounted），
 *   运行期切换语言需额外 `watch` 调用 `setLocale` 响应式同步，同时把映射后的语言传给 Provider 以覆盖其默认值。
 * - 主题：UIKit 对 `theme` prop 是**响应式**的（Provider 内部 watch + deep），直接按 `isDark` 返回 `mode` 即可联动。
 */
export function useUIKitConfig() {
  const { locale } = useI18n()
  const { isDark } = useTheme()
  const { setLocale } = useLocale()

  const uikitThemeApi = useUIKitTheme()

  // 容器间距对齐：
  // 1. 以 Demo 常量初始化 UIKit 主题 store 的 containerGap。
  // 2. 运行期特性开关改动 containerGap 时，把 --uikit-container-gap 同步回 --demo-container-gap，
  //    让 Demo 布局（会话 / 通讯录 / 设置等外层卡片 gap/padding）与 UIKit 内部容器保持一致。
  uikitThemeApi.setContainerGap(DEMO_CONTAINER_CONFIG.gap)
  watch(
    uikitThemeApi.containerGap,
    (gap) => {
      document.documentElement.style.setProperty('--demo-container-gap', `${gap}px`)
      document.documentElement.style.setProperty('--demo-container-padding', `${gap}px`)
    },
    { immediate: true },
  )

  // 交互配置对齐：列表项（会话 / 联系人等）hover 与选中态使用圆角卡片模式，
  // 由 UIKit 主题 store 写入 --uikit-item-hover-radius / --uikit-item-active-radius 等变量驱动
  uikitThemeApi.setHoverStyle(DEMO_INTERACTION_CONFIG.hoverStyle)

  const uikitLocale = computed<UIKitLocale>(() => toUIKitLocale(locale.value as AppLocale))

  // 跟随 Demo 语言切换 UIKit 全局语言
  watch(uikitLocale, (value) => setLocale(value), { immediate: true })

  // 跟随 Demo 主题切换 UIKit 模式（Demo 已解析 auto → light/dark）
  const uikitTheme = computed(() => ({
    mode: isDark.value ? ('dark' as const) : ('light' as const),
  }))

  return { uikitLocale, uikitTheme }
}
