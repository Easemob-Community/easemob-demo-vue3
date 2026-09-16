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
 * 对齐 UIKit demo 的默认配置（即 UIKit 主题 store 的出厂值，「外观」面板重置后也是该档）：
 * - 'default'：整行高亮模式，无左右缩进（UIKit demo 默认）
 * - 'rounded'：圆角卡片模式，hover / 激活态带 8px 圆角与左右缩进
 *   （UIKit 通过 --uikit-item-hover-radius / --uikit-item-active-radius 等变量驱动）
 */
export const DEMO_INTERACTION_CONFIG = {
  /** hover / 选中态圆角模式：'default' 整行高亮（UIKit demo 默认） | 'rounded' 圆角卡片 */
  hoverStyle: 'default',
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
 * 环信内置表情包：key 语义标签映射。
 * 文件名约定：{key}.gif 为实际动图、{key}-封面.jpg 为预览图。
 */
const HUANXIN_EMOJI_META: Array<{ key: string; name: string }> = [
  { key: 'biubiu', name: '亮个相吧' },
  { key: 'caffe', name: '辛苦啦' },
  { key: 'debug', name: 'Bug终结者' },
  { key: 'dont_wanna', name: '你说神嘛' },
  { key: 'error', name: '报错了' },
  { key: 'like', name: '真棒' },
  { key: 'insane', name: '厉害' },
  { key: 'jajaja', name: '笑死' },
  { key: 'likes', name: '真棒棒' },
  { key: 'success', name: '成功啦' },
  { key: 'roll_out', name: '上线了' },
  { key: 'OKDK', name: '好的收到' },
  { key: 'thanks', name: '谢谢老板' },
]

/** 环信表情资源（glob：*.gif 为动图、*.jpg 为预览图，query ?url 得到资源地址） */
const huanxinGifs = import.meta.glob('../assets/emojis/huanxin/*.gif', { eager: true, query: '?url', import: 'default' })
const huanxinCovers = import.meta.glob('../assets/emojis/huanxin/*-封面.jpg', { eager: true, query: '?url', import: 'default' })

/**
 * 环信内置表情包（本地资源，预览 jpg + 实际动图 gif）。
 * 注入到 EmChatContainer 的 input.stickerPacks，演示自定义 GIF 表情发送；
 * hover 预览时默认展示 jpg，移出/实际发送走 gif。
 */
export const DEMO_STICKER_PACKS: EmojiStickerPack[] = [
  {
    id: 'huanxin',
    name: '环信表情',
    iconUrl: huanxinCovers['../assets/emojis/huanxin/biubiu-封面.jpg'],
    stickers: HUANXIN_EMOJI_META.map(({ key, name }) => ({
      key,
      name,
      thumbUrl: huanxinCovers[`../assets/emojis/huanxin/${key}-封面.jpg`],
      url: huanxinGifs[`../assets/emojis/huanxin/${key}.gif`] as string,
    })),
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
    /** Emoji 面板配置：表情视图 tab 使用自定义图标（替换默认文字「表情」） */
    emoji: {
      emojiIcon: new URL('../assets/emojis/emoji-tab-icon.png', import.meta.url).href,
    },
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
  /** 在线状态指示器直径（px），对齐设计稿：8px 圆点 + 2px 白边 */
  presenceSize: 8,
  /** 是否允许点击更换头像 */
  editable: true,
} as const

/** EmIcon 图标尺寸配置 */
export const DEMO_ICON_SIZE = {
  /** 侧边栏导航 / Tab 图标尺寸（px） */
  nav: 24,
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
