/**
 * Demo UIKit 特性开关 - Provider 能力开关域
 *
 * 职责：
 * - 持有「UIKit 特性开关 - Provider」面板内各能力开关（对齐 DEMO_PROVIDER_CONFIG）
 * - 由 App.vue 绑定到 EmUIKitProvider props；关闭后对应功能不再拉取 / 渲染 / 发送
 *
 * 注意：开关在 Provider 挂载时读取，登录后修改需重新登录（或刷新页面）才能完整生效。
 *
 * 设计取舍：
 * - 只做「状态 + 动作」聚合，不持有任何 UI 结构
 * - 模块级单例，保证面板修改能实时作用到页面
 */
import { ref } from 'vue'

import { DEMO_PROVIDER_CONFIG } from '@/config/demo'

function createProviderSettings() {
  /* ===== Provider 能力开关（EmUIKitProvider，见「UIKit 特性开关 - Provider」面板） =====
   * 默认对齐 DEMO_PROVIDER_CONFIG（除昵称展示/自定义数据源外默认全部开启），关闭后对应功能不再拉取 / 渲染 / 发送。
   * 注意：开关在 Provider 挂载时读取，登录后修改需重新登录（或刷新页面）才能完整生效。
   */
  /** 好友列表与好友事件（标签 enableContact） */
  const providerEnableContact = ref(DEMO_PROVIDER_CONFIG.enableContact as boolean)
  /** 黑名单与拉黑事件（标签 enableBlocklist） */
  const providerEnableBlocklist = ref(DEMO_PROVIDER_CONFIG.enableBlocklist as boolean)
  /** 在线状态订阅（标签 enablePresence） */
  const providerEnablePresence = ref(DEMO_PROVIDER_CONFIG.enablePresence as boolean)
  /** 会话列表草稿显示（标签 enableDraft） */
  const providerEnableDraft = ref(DEMO_PROVIDER_CONFIG.enableDraft as boolean)
  /**
   * ＠我 消息提醒。面板标签为 enableMotion，实际映射 UIKit Provider 的 `enableAtMe` prop。
   */
  const providerEnableMotion = ref(DEMO_PROVIDER_CONFIG.enableAtMe as boolean)
  /** 对方正在输入提示（标签 enableTyping） */
  const providerEnableTyping = ref(DEMO_PROVIDER_CONFIG.enableTyping as boolean)
  /**
   * 消息已读回执总开关（标签 enableReadReceipt）。
   * 因 Prod 集群已读回执问题临时默认关闭；群聊发送方回执请求另由「聊天」面板的群已读回执开关控制。
   */
  const providerEnableReadReceipt = ref(DEMO_PROVIDER_CONFIG.enableReadReceipt as boolean)
  /** 单聊消息列表展示对方昵称（标签 showNicknameInSingleChat，默认关闭） */
  const providerShowNicknameInSingleChat = ref(DEMO_PROVIDER_CONFIG.showNicknameInSingleChat as boolean)
  /** 群聊消息列表展示发送者昵称（标签 showNicknameInGroupChat，默认开启） */
  const providerShowNicknameInGroupChat = ref(DEMO_PROVIDER_CONFIG.showNicknameInGroupChat as boolean)
  /**
   * 自定义数据源（fetchContacts）：开启后拉取好友走示例接口（返回 Alice / Bob），否则走 SDK 默认。
   */
  const providerEnableFetchContacts = ref(DEMO_PROVIDER_CONFIG.enableFetchContacts as boolean)
  /** 群组体系（群列表 / 群成员等群能力） */
  const providerEnableGroup = ref(DEMO_PROVIDER_CONFIG.enableGroup as boolean)
  /** 用户资料（昵称/头像）展示与拉取 */
  const providerEnableUserInfo = ref(DEMO_PROVIDER_CONFIG.enableUserInfo as boolean)
  /** 陌生人用户资料变更订阅（服务端未开通时自动熔断） */
  const providerEnableUserInfoSubscription = ref(
    DEMO_PROVIDER_CONFIG.enableUserInfoSubscription as boolean,
  )
  /** 好友列表过滤已拉黑用户（仅联系人子视图/好友列表生效，选人弹窗不受影响） */
  const providerFilterBlockedContacts = ref(DEMO_PROVIDER_CONFIG.filterBlockedContacts as boolean)
  /** 内置 Toast 提示（关闭后可用 useToast() 自行渲染） */
  const providerEnableToast = ref(DEMO_PROVIDER_CONFIG.enableToast as boolean)
  /** 联系人拉取模式：'page' 分页｜'all' 一次性全量 */
  const providerContactFetchMode = ref<'page' | 'all'>(DEMO_PROVIDER_CONFIG.contactFetchMode)

  /** 一键重置 Provider 能力开关 */
  function resetProviderSettings() {
    providerEnableContact.value = DEMO_PROVIDER_CONFIG.enableContact
    providerEnableBlocklist.value = DEMO_PROVIDER_CONFIG.enableBlocklist
    providerEnablePresence.value = DEMO_PROVIDER_CONFIG.enablePresence
    providerEnableDraft.value = DEMO_PROVIDER_CONFIG.enableDraft
    providerEnableMotion.value = DEMO_PROVIDER_CONFIG.enableAtMe
    providerEnableTyping.value = DEMO_PROVIDER_CONFIG.enableTyping
    providerEnableReadReceipt.value = DEMO_PROVIDER_CONFIG.enableReadReceipt
    providerShowNicknameInSingleChat.value = DEMO_PROVIDER_CONFIG.showNicknameInSingleChat
    providerShowNicknameInGroupChat.value = DEMO_PROVIDER_CONFIG.showNicknameInGroupChat
    providerEnableFetchContacts.value = DEMO_PROVIDER_CONFIG.enableFetchContacts
    providerEnableGroup.value = DEMO_PROVIDER_CONFIG.enableGroup
    providerEnableUserInfo.value = DEMO_PROVIDER_CONFIG.enableUserInfo
    providerEnableUserInfoSubscription.value = DEMO_PROVIDER_CONFIG.enableUserInfoSubscription
    providerFilterBlockedContacts.value = DEMO_PROVIDER_CONFIG.filterBlockedContacts
    providerEnableToast.value = DEMO_PROVIDER_CONFIG.enableToast
    providerContactFetchMode.value = DEMO_PROVIDER_CONFIG.contactFetchMode
  }

  return {
    // Provider 能力开关
    providerEnableContact,
    providerEnableBlocklist,
    providerEnablePresence,
    providerEnableDraft,
    providerEnableMotion,
    providerEnableTyping,
    providerEnableReadReceipt,
    providerShowNicknameInSingleChat,
    providerShowNicknameInGroupChat,
    providerEnableFetchContacts,
    providerEnableGroup,
    providerEnableUserInfo,
    providerEnableUserInfoSubscription,
    providerFilterBlockedContacts,
    providerEnableToast,
    providerContactFetchMode,
    // 动作
    resetProviderSettings,
  }
}

/**
 * 全局单例访问：设置面板（SettingsProviderPanel）与 App.vue 必须共享同一份状态，
 * 否则面板修改无法作用到页面。首次调用创建实例，之后一律复用。
 */
let providerSettings: ReturnType<typeof createProviderSettings> | null = null

export function useProviderSettings() {
  if (!providerSettings) providerSettings = createProviderSettings()
  return providerSettings
}
