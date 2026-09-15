/**
 * Demo UIKIT特性开关 - 会话域
 *
 * 职责：
 * - 持有「会话」特性抽屉内状态横幅、会话分栏 tabs、#tabs 插槽接管等可配置状态
 * - 提供面板状态与 chat/index.vue 中 EmConversationContainer 的绑定桥接
 *
 * 设计取舍：
 * - 只做「状态 + 动作」聚合，不持有任何 UI 结构
 * - 模块级单例，保证面板修改能实时作用到页面
 */
import { ref } from 'vue'
import { DEFAULT_CONVERSATION_TABS } from '@easemob/uikit-im'
import type { ConversationTabKey } from '@easemob/uikit-im'

function createConversationSettings() {
  /* ===== 状态横幅配置（EmStatusBanner） ===== */
  /** 是否展示 ConversationList 中的连接 / 同步状态横幅 */
  const statusBannerEnabled = ref(true)

  /* ===== 会话分栏配置 ===== */
  /** 会话分栏 tab 集合（顺序即渲染优先级；置空数组隐藏 tab 栏） */
  const conversationTabs = ref<ConversationTabKey[]>([...DEFAULT_CONVERSATION_TABS])
  /** 分栏 tab 栏显隐开关 */
  const conversationTabsVisible = ref(true)
  /** 是否用 #tabs 插槽完全接管渲染（配合 useConversationTabs hook） */
  const conversationTabsTakeover = ref(false)
  /** 当前激活的分栏 tab */
  const conversationActiveTab = ref<ConversationTabKey>('all')

  /** 按 key 切换 tab 是否展示（保留原顺序） */
  function toggleConversationTab(tab: ConversationTabKey, on: boolean) {
    if (on) {
      if (!conversationTabs.value.includes(tab)) conversationTabs.value.push(tab)
    } else {
      conversationTabs.value = conversationTabs.value.filter((t) => t !== tab)
      // 激活的 tab 被移除时回落到剩余第一个，若没有则回到 'all'
      if (conversationActiveTab.value === tab) {
        conversationActiveTab.value = conversationTabs.value[0] ?? 'all'
      }
    }
  }

  /** 调整 tab 渲染优先级（拖拽/上下移动） */
  function moveConversationTab(fromIndex: number, toIndex: number) {
    const len = conversationTabs.value.length
    if (fromIndex < 0 || fromIndex >= len || toIndex < 0 || toIndex >= len || fromIndex === toIndex)
      return

    const next = [...conversationTabs.value]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    conversationTabs.value = next
  }

  /** 快捷预设：仅单聊 / 仅群组 / 单聊 + 群组 / 恢复默认 */
  function presetConversationTabs(preset: 'single' | 'group' | 'singleGroup' | 'default') {
    if (preset === 'single') conversationTabs.value = ['single']
    else if (preset === 'group') conversationTabs.value = ['group']
    else if (preset === 'singleGroup') conversationTabs.value = ['single', 'group']
    else conversationTabs.value = [...DEFAULT_CONVERSATION_TABS]

    conversationActiveTab.value = conversationTabs.value[0] ?? 'all'
  }

  /** 一键重置会话相关状态 */
  function resetConversationSettings() {
    statusBannerEnabled.value = true
    conversationTabs.value = [...DEFAULT_CONVERSATION_TABS]
    conversationTabsVisible.value = true
    conversationTabsTakeover.value = false
    conversationActiveTab.value = 'all'
  }

  return {
    // 状态横幅
    statusBannerEnabled,
    // 会话分栏
    conversationTabs,
    conversationTabsVisible,
    conversationTabsTakeover,
    conversationActiveTab,
    // 动作
    toggleConversationTab,
    moveConversationTab,
    presetConversationTabs,
    resetConversationSettings,
  }
}

/**
 * 全局单例访问：设置面板（SettingsConversationPanel）与 chat/index.vue 必须共享同一份状态，
 * 否则面板修改无法作用到页面。首次调用创建实例，之后一律复用。
 */
let conversationSettings: ReturnType<typeof createConversationSettings> | null = null

export function useConversationSettings() {
  if (!conversationSettings) conversationSettings = createConversationSettings()
  return conversationSettings
}
