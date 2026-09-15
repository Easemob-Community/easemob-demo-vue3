/**
 * Demo UIKIT特性开关 - AI 流式演示域
 *
 * 职责：
 * - 持有「AI 流式演示」特性面板的 mock AI 应答开关
 * - 由 chat/index.vue 监听并注入 mock AI 回复
 *
 * 设计取舍：
 * - 只做「状态 + 动作」聚合，不持有任何 UI 结构
 * - 模块级单例，保证面板修改能实时作用到页面
 */
import { ref } from 'vue'

function createAiSettings() {
  /* ===== AI 流式演示 ===== */
  /** AI 应答开关（mock）：开启后自己发送文本消息自动触发 mock AI markdown 流式回复 */
  const aiMockReplyEnabled = ref(false)

  /** 一键重置 AI 流式演示状态 */
  function resetAiSettings() {
    aiMockReplyEnabled.value = false
  }

  return {
    // AI 流式演示
    aiMockReplyEnabled,
    // 动作
    resetAiSettings,
  }
}

/**
 * 全局单例访问：设置面板（SettingsAiPanel）与 chat/index.vue 必须共享同一份状态，
 * 否则面板修改无法作用到页面。首次调用创建实例，之后一律复用。
 */
let aiSettings: ReturnType<typeof createAiSettings> | null = null

export function useAiSettings() {
  if (!aiSettings) aiSettings = createAiSettings()
  return aiSettings
}
