/**
 * Demo UIKIT特性开关 - 会话相关状态集中管理
 *
 * 职责：
 * - 持有「会话」特性抽屉内全部可配置状态（状态横幅、会话分栏 tabs、#tabs 插槽接管、新消息提醒等）
 * - 提供面板状态与 chat/index.vue 中 EmConversationContainer 的绑定桥接
 *
 * 设计取舍：
 * - 只做「状态 + 动作」聚合，不持有任何 UI 结构
 * - 模块级单例，保证面板修改能实时作用到页面
 */
import { computed, ref } from 'vue'
import { DEFAULT_CONVERSATION_TABS, NOTICE_EVENT_TYPE } from '@easemob/uikit-im'
import type { ConversationTabKey, NoticeConfig } from '@easemob/uikit-im'

import { DEMO_PROVIDER_CONFIG } from '@/config/demo'

function createDemoSettings() {
  /* ===== 聊天输入框配置 ===== */
  const chatInputMode = ref<'simple' | 'rich'>('simple')
  const chatInputStyle = ref<'toolbar-top' | 'toolbar-bottom'>('toolbar-top')
  const chatInputFeatures = ref({
    emoji: true,
    image: true,
    file: true,
    voice: true,
    video: true,
    mention: true,
  })
  const chatInputAutoFocus = ref(false)
  const chatInputFocusBorderColor = ref('')
  const chatInputCaretColor = ref('')
  const chatInputSelectionColor = ref('')
  const chatInputMaxLength = ref(0)

  /* ===== 群已读回执配置 ===== */
  const groupReadReceiptEnabled = ref(true)
  const groupReadReceiptMaxSize = ref(200)

  /* ===== 消息列表配置 ===== */
  const chatShowTime = ref<false | true | 'always' | 'hover'>(false)
  const chatMessageSearchEnabled = ref(false)
  const chatMessageServerSearchEnabled = ref(false)
  const chatMessageListShowAvatar = ref(true)
  /** 是否展示己方消息头像（2.7.0+：设为 false 仅隐藏己方头像，对方头像照常显示） */
  const chatMessageShowSelfAvatar = ref(true)
  const chatMessageStatusShowText = ref(false)
  const chatMessageStatusDirection = ref<'horizontal' | 'vertical'>('horizontal')
  const chatMessageStatusPosition = ref<'below' | 'inline'>('below')
  const chatMessageStatusStyle = ref<'classic' | 'capsule'>('classic')

  /* ===== 消息操作菜单配置 ===== */
  const chatMessageAction = ref({
    enableQuote: true,
    enableCopy: true,
    enableDownload: true,
    enableDelete: true,
    enableRecall: true,
    enableRecallOther: true,
    enableEdit: true,
    enableForward: true,
    enableMultiSelect: true,
    enableTranslate: true,
    enableVoiceToText: true,
    enablePin: true,
  })

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

  /* ===== 通讯录搜索配置 ===== */
  /** 通讯录首页（联系人 / 群组入口页）是否展示搜索框 */
  const contactShowHomeSearch = ref(true)
  /** 联系人列表是否展示搜索框 */
  const contactShowContactSearch = ref(true)
  /** 群组列表是否展示搜索框 */
  const contactShowGroupSearch = ref(true)

  /* ===== 通讯录入口显隐配置 ===== */
  /** 是否展示「通知」入口 */
  const contactShowNotice = ref(true)
  /** 是否展示「联系人」入口 */
  const contactShowContactEntry = ref(true)
  /** 是否展示「群组」入口 */
  const contactShowGroupEntry = ref(true)
  /** 是否展示「黑名单」入口（Provider.enableBlocklist=false 时强制隐藏） */
  const contactShowBlocklist = ref(true)

  /* ===== 通讯录子视图头部按钮显隐配置 ===== */
  /** 是否在联系人子视图头部展示添加好友按钮 */
  const contactShowContactAddButton = ref(true)
  /** 是否在群组子视图头部展示创建群组按钮 */
  const contactShowGroupCreateButton = ref(true)
  /** 是否在黑名单子视图头部展示添加黑名单按钮 */
  const contactShowBlocklistAddButton = ref(true)

  /* ===== 新消息提醒配置（useNotification） ===== */
  /** 消息通知总开关 */
  const notificationEnable = ref(false)
  /** 浏览器系统通知（页面在后台时优先） */
  const notificationBrowser = ref(true)
  /** 页内右上角弹窗（浏览器通知不可用时降级） */
  const notificationInApp = ref(true)
  /** 首次通知时自动请求浏览器通知权限 */
  const notificationAutoRequest = ref(true)
  /** 触发模式：'background' 仅页面隐藏时（默认）| 'always' 非当前会话即触发 */
  const notificationTriggerMode = ref<'background' | 'always'>('background')
  /** 新消息响铃（onNotify 送达回调演示：Web Audio 哔声） */
  const notificationSound = ref(false)

  /* ===== 群系统通知配置（Provider noticeConfig） ===== */
  /**
   * 群系统通知话术档位：
   * - default：使用 UIKit 内置多语言文案
   * - playful：自定义俏皮话术覆盖成员加入/退出/群创建，并过滤批量加入（>5 人）刷屏
   * - silent：禁用成员加入/退出/群创建三类通知
   */
  const noticeTone = ref<'default' | 'playful' | 'silent'>('default')

  /**
   * Provider :notice-config 实际配置。
   * 随 noticeTone 推导，由 App.vue 注入 EmUIKitProvider。
   */
  const noticeConfig = computed<NoticeConfig>(() => {
    if (noticeTone.value === 'playful') {
      return {
        renderText: (ctx) => {
          if (ctx.eventType === NOTICE_EVENT_TYPE.MEMBER_JOINED)
            return `欢迎 ${ctx.params.name} 闪亮登场~`
          if (ctx.eventType === NOTICE_EVENT_TYPE.MEMBER_EXITED)
            return `${ctx.params.name} 溜了溜了`
          if (ctx.eventType === NOTICE_EVENT_TYPE.GROUP_CREATED)
            return '新群开张，喜气洋洋！'
          return null
        },
        filter: (ctx) => {
          // 批量加入（>5 人）避免刷屏，直接隐藏
          if (
            ctx.eventType === NOTICE_EVENT_TYPE.MEMBER_JOINED
            && (ctx.params.count as number) > 5
          )
            return false
          return true
        },
      }
    }
    if (noticeTone.value === 'silent') {
      return {
        disabledEvents: [
          NOTICE_EVENT_TYPE.MEMBER_JOINED,
          NOTICE_EVENT_TYPE.MEMBER_EXITED,
          NOTICE_EVENT_TYPE.GROUP_CREATED,
        ],
      }
    }
    return {}
  })

  /* ===== 日志获取配置 ===== */
  /** 是否收集 SDK 日志（UIKit 运行日志默认持久化；该开关额外控制 SDK 层日志） */
  const logCollectionEnabled = ref(true)
  /** UIKit 层日志收集级别（默认 'info'） */
  const uikitLogLevel = ref<'debug' | 'info' | 'warn' | 'error'>('info')
  /** SDK 层日志收集级别（默认 'warn'） */
  const sdkLogLevel = ref<'debug' | 'warn' | 'error'>('warn')
  /** 日志操作反馈文案（导出条数 / 清空提示） */
  const logActionTip = ref('')

  function setUikitLogLevel(level: 'debug' | 'info' | 'warn' | 'error') {
    uikitLogLevel.value = level
  }

  function setSdkLogLevel(level: 'debug' | 'warn' | 'error') {
    sdkLogLevel.value = level
  }

  /* ===== AI 流式演示 ===== */
  /** AI 应答开关（mock）：开启后自己发送文本消息自动触发 mock AI markdown 流式回复 */
  const aiMockReplyEnabled = ref(false)

  /* ===== Provider 能力开关（EmUIKitProvider，见「UIKIT特性开关 - Provider」面板） =====
   * 默认全部开启（对齐 DEMO_PROVIDER_CONFIG），关闭后对应功能不再拉取 / 渲染 / 发送。
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

  /** 一键重置聊天相关状态 */
  function resetChatSettings() {
    chatInputMode.value = 'simple'
    chatInputStyle.value = 'toolbar-top'
    chatInputFeatures.value = {
      emoji: true,
      image: true,
      file: true,
      voice: true,
      video: true,
      mention: true,
    }
    chatInputAutoFocus.value = false
    chatInputFocusBorderColor.value = ''
    chatInputCaretColor.value = ''
    chatInputSelectionColor.value = ''
    chatInputMaxLength.value = 0
    groupReadReceiptEnabled.value = true
    groupReadReceiptMaxSize.value = 200
    chatShowTime.value = false
    chatMessageSearchEnabled.value = false
    chatMessageServerSearchEnabled.value = false
    chatMessageListShowAvatar.value = true
    chatMessageShowSelfAvatar.value = true
    chatMessageStatusShowText.value = false
    chatMessageStatusDirection.value = 'horizontal'
    chatMessageStatusPosition.value = 'below'
    chatMessageStatusStyle.value = 'classic'
    chatMessageAction.value = {
      enableQuote: true,
      enableCopy: true,
      enableDownload: true,
      enableDelete: true,
      enableRecall: true,
      enableRecallOther: true,
      enableEdit: true,
      enableForward: true,
      enableMultiSelect: true,
      enableTranslate: true,
      enableVoiceToText: true,
      enablePin: true,
    }
  }

  /** 一键重置通讯录相关状态 */
  function resetContactSettings() {
    contactShowHomeSearch.value = true
    contactShowContactSearch.value = true
    contactShowGroupSearch.value = true
    contactShowNotice.value = true
    contactShowContactEntry.value = true
    contactShowGroupEntry.value = true
    contactShowBlocklist.value = true
    contactShowContactAddButton.value = true
    contactShowGroupCreateButton.value = true
    contactShowBlocklistAddButton.value = true
  }

  /** 一键重置 AI 流式演示状态 */
  function resetAiSettings() {
    aiMockReplyEnabled.value = false
  }

  /** 一键重置消息通知状态 */
  function resetNoticeSettings() {
    notificationEnable.value = false
    notificationBrowser.value = true
    notificationInApp.value = true
    notificationAutoRequest.value = true
    notificationTriggerMode.value = 'background'
    notificationSound.value = false
    noticeTone.value = 'default'
  }

  /** 一键重置 Provider 能力开关 */
  function resetProviderSettings() {
    providerEnableContact.value = DEMO_PROVIDER_CONFIG.enableContact
    providerEnableBlocklist.value = DEMO_PROVIDER_CONFIG.enableBlocklist
    providerEnablePresence.value = DEMO_PROVIDER_CONFIG.enablePresence
    providerEnableDraft.value = DEMO_PROVIDER_CONFIG.enableDraft
    providerEnableMotion.value = DEMO_PROVIDER_CONFIG.enableAtMe
    providerEnableTyping.value = DEMO_PROVIDER_CONFIG.enableTyping
    providerEnableFetchContacts.value = DEMO_PROVIDER_CONFIG.enableFetchContacts
    providerEnableGroup.value = DEMO_PROVIDER_CONFIG.enableGroup
    providerEnableUserInfo.value = DEMO_PROVIDER_CONFIG.enableUserInfo
    providerEnableUserInfoSubscription.value = DEMO_PROVIDER_CONFIG.enableUserInfoSubscription
    providerFilterBlockedContacts.value = DEMO_PROVIDER_CONFIG.filterBlockedContacts
    providerEnableToast.value = DEMO_PROVIDER_CONFIG.enableToast
    providerContactFetchMode.value = DEMO_PROVIDER_CONFIG.contactFetchMode
  }

  return {
    // 聊天输入框
    chatInputMode,
    chatInputStyle,
    chatInputFeatures,
    chatInputAutoFocus,
    chatInputFocusBorderColor,
    chatInputCaretColor,
    chatInputSelectionColor,
    chatInputMaxLength,
    // 群已读回执
    groupReadReceiptEnabled,
    groupReadReceiptMaxSize,
    // 消息列表
    chatShowTime,
    chatMessageSearchEnabled,
    chatMessageServerSearchEnabled,
    chatMessageListShowAvatar,
    chatMessageShowSelfAvatar,
    chatMessageStatusShowText,
    chatMessageStatusDirection,
    chatMessageStatusPosition,
    chatMessageStatusStyle,
    // 消息操作菜单
    chatMessageAction,
    // 状态横幅
    statusBannerEnabled,
    // 会话分栏
    conversationTabs,
    conversationTabsVisible,
    conversationTabsTakeover,
    conversationActiveTab,
    // 通讯录搜索
    contactShowHomeSearch,
    contactShowContactSearch,
    contactShowGroupSearch,
    // 通讯录入口显隐
    contactShowNotice,
    contactShowContactEntry,
    contactShowGroupEntry,
    contactShowBlocklist,
    // 通讯录子视图头部按钮显隐
    contactShowContactAddButton,
    contactShowGroupCreateButton,
    contactShowBlocklistAddButton,
    // 新消息提醒
    notificationEnable,
    notificationBrowser,
    notificationInApp,
    notificationAutoRequest,
    notificationTriggerMode,
    notificationSound,
    // 群系统通知
    noticeTone,
    noticeConfig,
    // 日志获取
    logCollectionEnabled,
    uikitLogLevel,
    sdkLogLevel,
    logActionTip,
    setUikitLogLevel,
    setSdkLogLevel,
    // AI 流式演示
    aiMockReplyEnabled,
    // Provider 能力开关
    providerEnableContact,
    providerEnableBlocklist,
    providerEnablePresence,
    providerEnableDraft,
    providerEnableMotion,
    providerEnableTyping,
    providerEnableFetchContacts,
    providerEnableGroup,
    providerEnableUserInfo,
    providerEnableUserInfoSubscription,
    providerFilterBlockedContacts,
    providerEnableToast,
    providerContactFetchMode,
    // 动作
    toggleConversationTab,
    moveConversationTab,
    presetConversationTabs,
    resetConversationSettings,
    resetChatSettings,
    resetContactSettings,
    resetAiSettings,
    resetNoticeSettings,
    resetProviderSettings,
  }
}

/**
 * 全局单例访问：设置面板（SettingsConversationPanel）与 chat/index.vue 必须共享同一份状态，
 * 否则面板修改无法作用到页面。首次调用创建实例，之后一律复用。
 */
let demoSettings: ReturnType<typeof createDemoSettings> | null = null

export function useDemoSettings() {
  if (!demoSettings) demoSettings = createDemoSettings()
  return demoSettings
}
