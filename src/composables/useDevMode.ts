import { computed, ref } from 'vue'

/**
 * 开发者模式统一状态机：eruda 与登录框 dev 共用一个开关（模块级单例）。
 *
 * 触发手势采用「分段反馈」化解「不易触发」与「友好提示」的矛盾：
 * - 前 silentCount 次点击完全静默（防误触、不暴露入口）；
 * - 之后每次点击返回 hint 并携带剩余次数，由 UI 弹 toast 提示「再点 X 次」；
 * - 达到 triggerCount 次开启；
 * - 超过 resetWindow 未继续点击则计数归零。
 */

export interface DevModeOptions {
  /** 触发所需连点次数，默认 7 */
  triggerCount?: number
  /** 静默阈值：前 N 次点击零反馈，默认 4 */
  silentCount?: number
  /** 复位窗口（毫秒）：超时未连点则计数归零，默认 3000 */
  resetWindow?: number
  /** 初始是否开启，默认 false */
  initialEnabled?: boolean
}

export type DevTapResult =
  | { status: 'exited' }
  | { status: 'silent' }
  | { status: 'hint'; remaining: number }
  | { status: 'enabled' }

export function createDevMode(options: DevModeOptions = {}) {
  const {
    triggerCount = 7,
    silentCount = 4,
    resetWindow = 3000,
    initialEnabled = false,
  } = options

  const devEnabled = ref(initialEnabled)
  const tapCount = ref(0)

  const remaining = computed(() => triggerCount - tapCount.value)
  const isHinting = computed(() => !devEnabled.value && tapCount.value > silentCount)

  let resetTimer: ReturnType<typeof setTimeout> | null = null

  function clearReset() {
    if (resetTimer) {
      clearTimeout(resetTimer)
      resetTimer = null
    }
  }

  function resetTap() {
    clearReset()
    tapCount.value = 0
  }

  function scheduleReset() {
    clearReset()
    resetTimer = setTimeout(() => {
      tapCount.value = 0
      resetTimer = null
    }, resetWindow)
  }

  /** 显式退出开发者模式（供配置面板「退出」按钮） */
  function exitDevMode() {
    devEnabled.value = false
    resetTap()
  }

  /** 记录一次点击并推进状态机；返回结果供 UI 决定是否提示 */
  function registerTap(): DevTapResult {
    if (devEnabled.value) {
      exitDevMode()
      return { status: 'exited' }
    }
    tapCount.value += 1
    if (tapCount.value >= triggerCount) {
      devEnabled.value = true
      resetTap()
      return { status: 'enabled' }
    }
    scheduleReset()
    if (tapCount.value > silentCount) {
      return { status: 'hint', remaining: remaining.value }
    }
    return { status: 'silent' }
  }

  return { devEnabled, tapCount, remaining, isHinting, registerTap, exitDevMode }
}

/** 全局共享实例：dev 构建默认开启、生产默认关闭（会话级，刷新复位） */
const shared = createDevMode({ initialEnabled: import.meta.env.DEV })

export function useDevMode() {
  return shared
}
