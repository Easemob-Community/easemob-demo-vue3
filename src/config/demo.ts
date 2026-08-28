import type { EmojiStickerPack } from '@easemob/uikit-im'
import type { UiContact } from '@easemob/uikit-core'

/**
 * 项目 Demo 配置常量
 *
 * 与 UIKit demo（easemob-uikit-vue/apps/demo）对齐的演示配置，集中管理后统一导出：
 * - 容器配置（组件容器的间距 / 圆角）：通过 applyDemoContainerConfig 写入 CSS 变量，
 *   SCSS 侧以 var(--demo-*) 消费，脚本侧可直接导入常量
 * - 交互配置（hover / 选中态圆角模式）：通过 useUIKitConfig 同步到 UIKit 主题 store
 * - 通讯录 / 会话容器配置（搜索框显隐、下拉刷新等开关）：视图模板直接导入常量绑定
 * - 组件静态属性配置（尺寸 / 开关 / 拖拽方向等）：uikit 组件模板中的静态值统一归入常量，
 *   模板一律以 :prop="DEMO_XXX_CONFIG.xxx" 绑定，不在视图里写死
 * - 间距阶梯 / 侧边栏宽度等布局配置：视图（如 EmResizable 宽度边界）直接导入常量使用
 */

/** ===== 间距阶梯（对齐 UIKit --uikit-spacing-1~7：4/8/12/16/24/32/48px） ===== */
export const DEMO_SPACING = {
  /** 极窄间距（4px） */
  xs: 4,
  /** 窄间距（8px），容器间距默认档 */
  sm: 8,
  /** 常规间距（12px） */
  md: 12,
  /** 宽间距（16px） */
  lg: 16,
  /** 更宽间距（24px） */
  xl: 24,
  /** 段落级间距（32px） */
  xxl: 32,
  /** 页面级留白（48px） */
  xxxl: 48,
} as const

/** ===== 容器配置（组件容器的间距与圆角） ===== */
export const DEMO_CONTAINER_CONFIG = {
  /**
   * 组件容器之间的间距（px）。
   * 对应 UIKit 主题变量 --uikit-container-gap（默认 --uikit-spacing-2 = 8px），
   * 用于会话列表 / 聊天窗口 / 通讯录详情等容器之间的留白（flex gap）。
   */
  gap: DEMO_SPACING.sm,
  /**
   * 页面容器四周的外边距（px）。
   * 与 UIKit demo 的布局一致：页面整体 padding 取与 gap 相同的值，
   * 使容器与视口边缘的留白与容器之间的间距保持统一。
   */
  padding: DEMO_SPACING.sm,
  /**
   * 组件容器圆角（px）。
   * 对应 UIKit 主题变量 --uikit-components-radius（默认 8px），
   * 用于侧边栏 / 主区域等容器卡片的圆角。
   */
  radius: 8,
} as const

/** ===== 交互配置（hover / 选中态圆角模式） ===== */

/**
 * 列表项（会话 / 联系人 / 群组 / Cell 等）的 hover 与选中态圆角模式，
 * 对齐 UIKit demo「外观」面板的 Hover 风格设置：
 * - 'rounded'：圆角卡片模式，hover / 激活态带 8px 圆角与左右缩进
 *   （UIKit 通过 --uikit-item-hover-radius / --uikit-item-active-radius 等变量驱动）
 * - 'default'：整行直角高亮模式
 */
export const DEMO_INTERACTION_CONFIG = {
  /** hover / 选中态圆角模式：'rounded' 圆角卡片 | 'default' 直角整行 */
  hoverStyle: 'rounded',
} as const

/** ===== 通讯录容器配置（对齐 UIKit demo 设置抽屉的「搜索控制」） ===== */
export const DEMO_CONTACT_CONFIG = {
  /** 通讯录首页（联系人 / 群组入口页）是否展示搜索框（对应 EmContactContainer 的 show-home-search） */
  showHomeSearch: true,
  /** 联系人列表是否展示搜索框（对应 show-contact-search） */
  showContactSearch: true,
  /** 群组列表是否展示搜索框（对应 show-group-search） */
  showGroupSearch: true,
  /** 是否展示「黑名单」入口（对应 EmContactContainer 的 show-blocklist；默认 true） */
  showBlocklist: true,
} as const

/** ===== 会话容器配置 ===== */
export const DEMO_CONVERSATION_CONFIG = {
  /**
   * 会话列表是否支持下拉刷新（对应 EmConversationContainer 的 pull-refresh）。
   * 下拉刷新手势主要面向 H5，PC 端结合设备判断（isMobile）生效。
   */
  pullRefresh: true,
} as const

/** ===== 组件静态属性配置（uikit 组件模板里的静态值统一归入常量，不在视图写死） ===== */

/**
 * EmUIKitProvider 功能开关
 *
 * 与「UIKIT特性开关 - Provider」面板一一对应（默认全部开启，见面板说明「Provider 能力开关默认全部开启」）。
 * 由 useDemoSettings 读取作为默认值，App.vue 绑定到 EmUIKitProvider；运行期改动即时反映为 Provider props。
 */
export const DEMO_PROVIDER_CONFIG = {
  /** 是否启用好友体系（好友列表与好友事件） */
  enableContact: true,
  /** 是否启用黑名单（Blocklist）能力：开启后通讯录首页出现「黑名单」入口，可查看/移出已拉黑用户 */
  enableBlocklist: true,
  /** 是否启用在线状态（Presence）能力 */
  enablePresence: true,
  /** 是否启用会话列表草稿显示（enableDraft） */
  enableDraft: true,
  /**
   * 是否启用 ＠我 消息提醒。
   * 设计面板标签为 enableMotion，实际映射 UIKit Provider 的 `enableAtMe` prop。
   */
  enableAtMe: true,
  /** 是否启用对方正在输入提示（enableTyping） */
  enableTyping: true,
  /**
   * 是否使用自定义数据源接管拉取联系人（fetchContacts）。
   * 开启后拉取好友走示例接口（返回 DEMO_CUSTOM_CONTACTS，Alice / Bob），否则走 SDK 默认。
   */
  enableFetchContacts: false,
  /** 是否启用群组体系（群列表 / 群成员等群能力） */
  enableGroup: true,
  /** 是否启用用户资料（昵称/头像）展示与拉取 */
  enableUserInfo: true,
  /** 是否启用陌生人用户资料变更订阅（服务端未开通时自动熔断） */
  enableUserInfoSubscription: true,
  /** 好友列表是否过滤掉已拉黑用户（仅联系人子视图/好友列表生效，选人弹窗不受影响） */
  filterBlockedContacts: true,
  /** 是否启用内置 Toast 提示（关闭后可用 useToast() 自行渲染） */
  enableToast: true,
  /**
   * 联系人拉取模式：'page' 分页（SDK 未暴露分页游标接口，实际按全量返回处理）｜'all' 一次性全量拉取。
   */
  contactFetchMode: 'page',
} as const

/**
 * 自定义数据源示例联系人。
 * 当 Provider 面板「自定义数据源 (fetchContacts)」开启时，拉取好友返回此演示数据（Alice / Bob）。
 */
export const DEMO_CUSTOM_CONTACTS: UiContact[] = [
  { userId: 'alice', name: 'Alice', remark: 'Alice' },
  { userId: 'bob', name: 'Bob', remark: 'Bob' },
]

/**
 * 示例自定义 GIF 表情包（本地资源）。
 * 注入到 EmChatContainer 的 input.stickerPacks，用于演示自定义 GIF 表情发送。
 * 实际业务建议替换为 CDN 地址或按真实表情包分组。
 */
export const DEMO_STICKER_PACKS: EmojiStickerPack[] = [
  {
    id: 'demo-gifs',
    name: '动图',
    iconUrl: new URL('../assets/emojis/gif/c090e86d6886cfcb94183e2696d9614f.gif', import.meta.url).href,
    stickers: [
      { key: 'gif-1', name: '动图 1', url: new URL('../assets/emojis/gif/095b05168fb1492da412487a7aa89aaf.gif', import.meta.url).href },
      { key: 'gif-2', name: '动图 2', url: new URL('../assets/emojis/gif/24f3a4e92a3a2ea59abfa388a3a54d25.gif', import.meta.url).href },
      { key: 'gif-3', name: '动图 3', url: new URL('../assets/emojis/gif/36e638cd7d6c4f171259587c2168256d.gif', import.meta.url).href },
      { key: 'gif-4', name: '动图 4', url: new URL('../assets/emojis/gif/44e4ce643a5b292d37e837b39cf5ffad.gif', import.meta.url).href },
      { key: 'gif-5', name: '动图 5', url: new URL('../assets/emojis/gif/469ffa4999ba01348efbb4ade7f9abc9.gif', import.meta.url).href },
      { key: 'gif-6', name: '动图 6', url: new URL('../assets/emojis/gif/485bbf83060c03f430a45679f4989479.gif', import.meta.url).href },
      { key: 'gif-7', name: '动图 7', url: new URL('../assets/emojis/gif/5781ab9a6accfb990594d8becfeebcc6.gif', import.meta.url).href },
      { key: 'gif-8', name: '动图 8', url: new URL('../assets/emojis/gif/65157921c0fa3ac91ec3ea8c46bf085d.gif', import.meta.url).href },
      { key: 'gif-9', name: '动图 9', url: new URL('../assets/emojis/gif/c090e86d6886cfcb94183e2696d9614f.gif', import.meta.url).href },
      { key: 'gif-10', name: '动图 10', url: new URL('../assets/emojis/gif/c5524a09f35f847e1d192cd01f5d78f4.gif', import.meta.url).href },
      { key: 'gif-11', name: '动图 11', url: new URL('../assets/emojis/gif/d1ae6829d2e99eeb9c12594d421ad79e.gif', import.meta.url).href },
      { key: 'gif-12', name: '动图 12', url: new URL('../assets/emojis/gif/db4fccdcf7d785b7e43390662ad72cd2.gif', import.meta.url).href },
    ],
  },
]

/**
 * EmChatContainer 聊天页面配置（对齐 UIKit demo 的 chatContainer 配置面板默认值）。
 * 通过 EmChatContainer 的 `config` prop 传入（PC / H5 布局共用）。
 */
export const DEMO_CHAT_CONFIG = {
  input: {
    /** 输入框是否显示发送按钮：对齐 UIKit demo，默认关闭（回车发送） */
    showSendButton: false,
    /** 自定义 GIF 表情包，注入到 emoji picker 的 sticker 标签页 */
    stickerPacks: DEMO_STICKER_PACKS,
  },
} as const

/** EmResizable 拖拽调整条配置 */
export const DEMO_RESIZABLE_CONFIG = {
  /** 拖拽方向：horizontal 水平调整宽度（会话 / 通讯录侧边栏） */
  axis: 'horizontal' as const,
  /** 拖拽手柄宽度（px） */
  handleSize: 10,
} as const

/** EmPresenceAvatar 在线状态头像配置 */
export const DEMO_AVATAR_CONFIG = {
  /** 侧边栏头像尺寸（px） */
  size: 40,
  /** 是否允许点击更换头像 */
  editable: true,
} as const

/** EmIcon 图标尺寸配置 */
export const DEMO_ICON_SIZE = {
  /** 侧边栏导航 / Tab 图标尺寸（px） */
  nav: 22,
  /** 侧边栏工具按钮图标尺寸（px） */
  tool: 18,
  /** 返回按钮图标尺寸（px） */
  back: 20,
  /** 空状态占位大图标尺寸（px） */
  empty: 48,
} as const

/** ===== UIKit 文档配置 ===== */
export const DEMO_UIKIT_DOCS_CONFIG = {
  /** UIKit 使用文档地址：「更多」面板跳转查看详细配置（官方文档，新标签页打开） */
  url: 'https://doc.easemob.com/uikit/chatuikit/web/chatuikit_integrated_vue.html',
} as const

/** ===== 布局配置 ===== */

/**
 * 会话列表侧边栏宽度（px），对齐 UIKit demo 的 EmResizable 可拖拽范围（240~480）。
 */
export const DEMO_SIDEBAR_CONFIG = {
  /** 侧边栏默认宽度（px）：无记忆时的初始值，保证首屏宽度舒适 */
  defaultWidth: 400,
  /** 侧边栏最小宽度（px） */
  minWidth: 240,
  /** 侧边栏最大宽度（px） */
  maxWidth: 480,
} as const

/** 通讯录页侧边栏默认宽度（px），对齐 UIKit demo 的 EmResizable 可拖拽范围（240~480） */
export const CONTACTS_SIDEBAR_WIDTH = 320

/**
 * 将容器配置写入 CSS 变量（处理入口）。
 * 应用启动时调用一次，SCSS 侧统一以 var(--demo-container-*) / var(--demo-component-*) 消费，
 * 保证「常量 → CSS 变量 → 样式」单一来源。
 */
export function applyDemoContainerConfig(): void {
  const root = document.documentElement
  root.style.setProperty('--demo-container-gap', `${DEMO_CONTAINER_CONFIG.gap}px`)
  root.style.setProperty('--demo-container-padding', `${DEMO_CONTAINER_CONFIG.padding}px`)
  root.style.setProperty('--demo-component-radius', `${DEMO_CONTAINER_CONFIG.radius}px`)
}
