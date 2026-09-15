/**
 * Demo UIKIT特性开关 - 聚合层
 *
 * 职责：
 * - 按域拆分至 demo-settings/ 子目录（chat / conversation / contacts / notice / logger / ai / provider）
 * - 本文件聚合各域单例并 re-export，保持原有返回对象形状，
 *   使各消费方 `const { xxx } = useDemoSettings()` 的解构写法无需修改
 *
 * 设计取舍：
 * - 各域为独立模块级单例，聚合层仅做合并，不新增状态
 */
import { useAiSettings } from './demo-settings/ai'
import { useChatSettings } from './demo-settings/chat'
import { useContactSettings } from './demo-settings/contacts'
import { useConversationSettings } from './demo-settings/conversation'
import { useLoggerSettings } from './demo-settings/logger'
import { useNoticeSettings } from './demo-settings/notice'
import { useProviderSettings } from './demo-settings/provider'

export {
  useAiSettings,
  useChatSettings,
  useContactSettings,
  useConversationSettings,
  useLoggerSettings,
  useNoticeSettings,
  useProviderSettings,
}

/**
 * 全局单例访问：设置面板与页面（chat / contacts / App.vue）必须共享同一份状态，
 * 否则面板修改无法作用到页面。各域实例在首次调用对应 composable 时创建，之后一律复用。
 */
export function useDemoSettings() {
  return {
    ...useChatSettings(),
    ...useConversationSettings(),
    ...useContactSettings(),
    ...useNoticeSettings(),
    ...useLoggerSettings(),
    ...useAiSettings(),
    ...useProviderSettings(),
  }
}
