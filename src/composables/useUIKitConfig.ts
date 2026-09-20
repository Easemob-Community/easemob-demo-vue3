import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocale, useNotification, useTheme as useUIKitTheme } from '@easemob/uikit-im'
import type { NotificationHandler } from '@easemob/uikit-im'

import { useDemoSettings } from './useDemoSettings'
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

/** UIKit 主题 store 的 localStorage 缓存键（与 @easemob/uikit-core 内部一致） */
export const UIKIT_THEME_STORAGE_KEY = 'easemob_uikit_theme'

/**
 * 补齐旧版本主题缓存中缺失的字段（仅缺失时写入，不覆盖已持久化的用户调整）。
 *
 * 背景：UIKit 主题 store 的 containerGap / hoverStyle 早期版本无持久化字段，
 * 旧缓存读取后这两个值为 undefined（store getter 无兜底），会导致
 * --uikit-container-gap 被写成 NaNpx。此前 useUIKitConfig 无条件用 Demo 常量强制
 * setContainerGap / setHoverStyle，会把用户在「UIKit 特性开关」面板调过并
 * 持久化的值在每次启动时踩回默认——这里改为只在字段缺失时补齐。
 */
export function patchLegacyThemeStorage(storage?: Storage): void {
  // 无 window 环境（SSR / 测试注入 Storage 之外的场景）直接跳过
  if (typeof window === 'undefined' && !storage) return
  const store = storage ?? window.localStorage
  try {
    const raw = store.getItem(UIKIT_THEME_STORAGE_KEY)
    if (!raw) return
    const cached = JSON.parse(raw) as Record<string, unknown>
    let changed = false
    if (typeof cached.containerGap !== 'number') {
      cached.containerGap = DEMO_CONTAINER_CONFIG.gap
      changed = true
    }
    if (typeof cached.hoverStyle !== 'string') {
      cached.hoverStyle = DEMO_INTERACTION_CONFIG.hoverStyle
      changed = true
    }
    if (changed) store.setItem(UIKIT_THEME_STORAGE_KEY, JSON.stringify(cached))
  } catch {
    // 缓存不可读（隐私模式 / 损坏）时按 UIKit 默认处理
  }
}

/**
 * 让 `EmUIKitProvider`（UIKit）与 Demo 本体联动：
 *
 * - 语言：UIKit 仅在 Provider **挂载时**应用一次 `locale` 属性（见 useProviderSideEffects 的 onMounted），
 *   运行期切换语言需额外 `watch` 调用 `setLocale` 响应式同步，同时把映射后的语言传给 Provider 以覆盖其默认值。
 * - 主题：UIKit 对 `theme` prop 是**响应式**的（Provider 内部 watch + deep），直接按 `isDark` 返回 `mode` 即可联动。
 */
export function useUIKitConfig() {
  // 必须在首次 useTheme()（创建主题 store 并读取 localStorage）之前补齐旧缓存
  patchLegacyThemeStorage()

  const { locale } = useI18n()
  const { isDark } = useTheme()
  const { setLocale } = useLocale()

  const uikitThemeApi = useUIKitTheme()
  const { configureNotification, setNotificationHandler } = useNotification()
  const {
    notificationEnable,
    notificationBrowser,
    notificationInApp,
    notificationAutoRequest,
    notificationTriggerMode,
    notificationSound,
  } = useDemoSettings()

  /**
   * 文本语音播报（用于「新消息响铃」开关演示）。
   * 使用浏览器原生 Web Speech API，收到通知时播报「您有一条新消息」。
   * 首次播放需在用户手势后触发（点击面板/模拟按钮即为手势）。
   */
  function playVoiceNotification() {
    if (!window.speechSynthesis) return
    const utterance = new SpeechSynthesisUtterance('您有一条新消息')
    utterance.lang = 'zh-CN'
    utterance.rate = 1
    window.speechSynthesis.speak(utterance)
  }

  /**
   * 新消息通知配置同步到 UIKit 通知引擎。
   * 任一开关变化时批量应用完整配置，避免多次 watch 回调。
   */
  watch(
    [notificationEnable, notificationBrowser, notificationInApp, notificationAutoRequest, notificationTriggerMode],
    ([enabled, browserEnabled, inAppEnabled, autoRequestPermission, triggerMode]) => {
      configureNotification({ enabled, browserEnabled, inAppEnabled, autoRequestPermission, triggerMode })
    },
    { immediate: true },
  )

  // 新消息响铃：通过 setNotificationHandler 注册/注销送达回调
  watch(
    notificationSound,
    (enabled) => {
      setNotificationHandler(enabled ? (playVoiceNotification as NotificationHandler) : null)
    },
    { immediate: true },
  )

  // 容器间距对齐：运行期 UIKit 特性开关改动 containerGap 时，把 --uikit-container-gap
  // 同步回 --demo-container-gap，让 Demo 布局（会话 / 通讯录 / 设置等外层卡片 gap/padding）
  // 与 UIKit 内部容器保持一致。启动初始化不再无条件 setContainerGap（会踩掉持久化值），
  // 旧缓存缺失字段由 patchLegacyThemeStorage 补齐。
  watch(
    uikitThemeApi.containerGap,
    (gap) => {
      document.documentElement.style.setProperty('--demo-container-gap', `${gap}px`)
      document.documentElement.style.setProperty('--demo-container-padding', `${gap}px`)
    },
    { immediate: true },
  )

  // 交互配置（hoverStyle）：完全由 UIKit 主题 store 驱动（--uikit-item-hover-radius /
  // --uikit-item-active-radius 等变量），Demo 侧无消费方，因此这里不做同步；
  // 也不再用 Demo 常量无条件初始化，避免启动时踩掉持久化的用户调整。

  // 组件圆角（componentsShape）联动：
  // 1. 根节点 data 属性——Demo 的按钮胶囊化覆盖（index.scss 的 .uikit-button 999px !important）
  //    在「方正」档需让步给 --uikit-components-radius（0px 直角），
  //    由 [data-demo-components-shape='square'] 选择器接管；
  // 2. --demo-component-radius——Demo 页面卡片（会话列表侧栏 / 通讯录 / 设置 / 抽屉等）
  //    的圆角与 UIKit 组件圆角同档：方正档直角（0px），圆润档回 DEMO_CONTAINER_CONFIG.radius。
  watch(
    uikitThemeApi.componentsShape,
    (shape) => {
      document.documentElement.setAttribute('data-demo-components-shape', shape)
      document.documentElement.style.setProperty(
        '--demo-component-radius',
        shape === 'square' ? '0px' : `${DEMO_CONTAINER_CONFIG.radius}px`,
      )
    },
    { immediate: true },
  )

  // 全局字号联动：UIKit 主题 store 把 --uikit-font-scale 写在 <html> 上（UIKit 组件消费
  // --uikit-font-size-* 变量），这里镜像一份 --demo-font-scale，让 Demo 外壳样式以
  // calc(Npx * var(--demo-font-scale, 1)) 跟随「UIKit 特性开关 - 字号」缩放（themes.scss 已定义兜底值 1）。
  watch(
    uikitThemeApi.fontSizeScale,
    (scale) => {
      document.documentElement.style.setProperty('--demo-font-scale', String(scale))
    },
    { immediate: true },
  )

  // 密度联动：UIKit 以 data-uikit-density 驱动自身列表密度（Cell 高度 / 内边距），
  // Demo 侧镜像 data-demo-density 属性，themes.scss 按档位覆写 --demo-density-* 布局变量，
  // 让设置面板等 Demo 列表行高 / 间距随「UIKit 特性开关 - 密度」同档调整。
  watch(
    uikitThemeApi.density,
    (density) => {
      document.documentElement.setAttribute('data-demo-density', density)
    },
    { immediate: true },
  )

  // 主色对齐：「外观」面板取色器改的是 UIKit 主题 store 的主色（--uikit-primary-color），
  // 这里同步回 Demo 自有主色变量，让外壳导航（图标选中态 / tabbar / 开关等 --color-primary 消费方）
  // 与 UIKit 容器保持同色；写入 documentElement 内联样式，覆盖 themes.scss 的 :root / html.dark 默认值。
  watch(
    uikitThemeApi.primaryColorHsl,
    ({ h, s, l }) => {
      const rootStyle = document.documentElement.style
      rootStyle.setProperty('--color-primary', `hsl(${h} ${s}% ${l}%)`)
      rootStyle.setProperty('--color-nav-icon-active', `hsl(${h} ${s}% ${l}%)`)
      rootStyle.setProperty('--color-nav-icon-active-bg', `hsl(${h} ${s}% ${l}% / 0.12)`)
    },
    { immediate: true },
  )

  const uikitLocale = computed<UIKitLocale>(() => toUIKitLocale(locale.value as AppLocale))

  // 跟随 Demo 语言切换 UIKit 全局语言
  watch(uikitLocale, (value) => setLocale(value), { immediate: true })

  // 跟随 Demo 主题切换 UIKit 模式（Demo 已解析 auto → light/dark）
  const uikitTheme = computed(() => ({
    mode: isDark.value ? ('dark' as const) : ('light' as const),
  }))

  return { uikitLocale, uikitTheme }
}
