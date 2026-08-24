import { useMediaQuery } from '@vueuse/core'
import type { Ref } from 'vue'

/** 移动端视口断点（px），与团队成员保持一致 */
export const MOBILE_BREAKPOINT = 768

/**
 * 响应式判断是否处于移动端视口（宽度 < 768px）。
 * 用于运行期切换交互 / 布局逻辑，窗口缩放、横竖屏切换会自动更新。
 *
 * 注意：与 `@/utils/env` 中基于 UA 的 `isMobile` 用途不同——
 * UA 判断是静态的，只用于启动期决策（如是否加载 eruda）；
 * 运行期的交互适配请一律使用本 Hook。
 */
export function useMobileView(): Ref<boolean> {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
}
