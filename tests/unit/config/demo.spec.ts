import { beforeEach, describe, expect, it } from 'vitest'

import {
  DEMO_AVATAR_CONFIG,
  DEMO_CHAT_CONFIG,
  DEMO_CONTAINER_CONFIG,
  DEMO_CONTACT_CONFIG,
  DEMO_CONVERSATION_CONFIG,
  DEMO_CUSTOM_CONTACTS,
  DEMO_ICON_SIZE,
  DEMO_INTERACTION_CONFIG,
  DEMO_PROVIDER_CONFIG,
  DEMO_RESIZABLE_CONFIG,
  DEMO_SIDEBAR_CONFIG,
  DEMO_SPACING,
  DEMO_STICKER_PACKS,
  applyDemoContainerConfig,
} from '@/config/demo'

describe('DEMO_CONTAINER_CONFIG（容器配置，对齐 UIKit demo）', () => {
  it('容器间距取间距阶梯窄档（8px），对应 UIKit --uikit-container-gap', () => {
    expect(DEMO_CONTAINER_CONFIG.gap).toBe(DEMO_SPACING.sm)
    expect(DEMO_CONTAINER_CONFIG.gap).toBe(8)
  })

  it('容器外边距与间距同值（8px），保证边缘留白与容器间留白统一', () => {
    expect(DEMO_CONTAINER_CONFIG.padding).toBe(8)
  })

  it('容器圆角为 8px，对应 UIKit --uikit-components-radius', () => {
    expect(DEMO_CONTAINER_CONFIG.radius).toBe(8)
  })
})

describe('DEMO_INTERACTION_CONFIG（hover / 选中态圆角模式）', () => {
  it('使用 UIKit demo 默认的整行高亮模式（default），不做个性化', () => {
    expect(DEMO_INTERACTION_CONFIG.hoverStyle).toBe('default')
  })
})

describe('DEMO_CONTACT_CONFIG（通讯录容器搜索控制，对齐 UIKit demo「搜索控制」）', () => {
  it('首页 / 联系人 / 群组搜索框默认全部开启', () => {
    expect(DEMO_CONTACT_CONFIG.showHomeSearch).toBe(true)
    expect(DEMO_CONTACT_CONFIG.showContactSearch).toBe(true)
    expect(DEMO_CONTACT_CONFIG.showGroupSearch).toBe(true)
  })
})

describe('DEMO_CONVERSATION_CONFIG（会话容器配置）', () => {
  it('会话列表下拉刷新默认开启（H5）', () => {
    expect(DEMO_CONVERSATION_CONFIG.pullRefresh).toBe(true)
  })
})

describe('DEMO_CHAT_CONFIG（EmChatContainer 聊天页面配置，对齐 UIKit demo）', () => {
  it('输入框发送按钮默认关闭（showSendButton=false，回车发送）', () => {
    expect(DEMO_CHAT_CONFIG.input.showSendButton).toBe(false)
  })

  it('注入环信表情包到输入框（stickerPacks：预览 jpg + 实际 gif）', () => {
    expect(DEMO_CHAT_CONFIG.input.stickerPacks).toBe(DEMO_STICKER_PACKS)
    expect(DEMO_STICKER_PACKS).toHaveLength(1)
    expect(DEMO_STICKER_PACKS[0].id).toBe('huanxin')
    expect(DEMO_STICKER_PACKS[0].name).toBe('环信表情')
    expect(DEMO_STICKER_PACKS[0].stickers).toHaveLength(13)
    expect(DEMO_STICKER_PACKS[0].stickers[0].key).toBe('biubiu')
    expect(DEMO_STICKER_PACKS[0].stickers[0].name).toBe('亮个相吧')
    expect(DEMO_STICKER_PACKS[0].stickers[0].url).toContain('.gif')
    expect(DEMO_STICKER_PACKS[0].stickers[0].thumbUrl).toContain('.jpg')
  })
})

describe('组件静态属性配置（uikit 组件模板中的静态值）', () => {
  it('Provider 能力开关默认全部开启，自定义数据源默认关闭', () => {
    expect(DEMO_PROVIDER_CONFIG.enableContact).toBe(true)
    expect(DEMO_PROVIDER_CONFIG.enableBlocklist).toBe(true)
    expect(DEMO_PROVIDER_CONFIG.enablePresence).toBe(true)
    expect(DEMO_PROVIDER_CONFIG.enableDraft).toBe(true)
    expect(DEMO_PROVIDER_CONFIG.enableAtMe).toBe(true)
    expect(DEMO_PROVIDER_CONFIG.enableTyping).toBe(true)
    expect(DEMO_PROVIDER_CONFIG.enableFetchContacts).toBe(false)
    expect(DEMO_PROVIDER_CONFIG.enableGroup).toBe(true)
    expect(DEMO_PROVIDER_CONFIG.enableUserInfo).toBe(true)
    expect(DEMO_PROVIDER_CONFIG.enableUserInfoSubscription).toBe(true)
    expect(DEMO_PROVIDER_CONFIG.filterBlockedContacts).toBe(true)
    expect(DEMO_PROVIDER_CONFIG.enableToast).toBe(true)
    expect(DEMO_PROVIDER_CONFIG.contactFetchMode).toBe('page')
  })

  it('自定义数据源示例联系人返回 Alice / Bob', () => {
    expect(DEMO_CUSTOM_CONTACTS.map((c) => c.name)).toEqual(['Alice', 'Bob'])
  })

  it('EmResizable 为水平拖拽、手柄宽度 10px', () => {
    expect(DEMO_RESIZABLE_CONFIG.axis).toBe('horizontal')
    expect(DEMO_RESIZABLE_CONFIG.handleSize).toBe(10)
  })

  it('侧边栏头像 40px 且可编辑', () => {
    expect(DEMO_AVATAR_CONFIG.size).toBe(40)
    expect(DEMO_AVATAR_CONFIG.editable).toBe(true)
  })

  it('图标尺寸：导航 24 / 工具 18 / 返回 20 / 空状态 48', () => {
    expect(DEMO_ICON_SIZE.nav).toBe(24)
    expect(DEMO_ICON_SIZE.tool).toBe(18)
    expect(DEMO_ICON_SIZE.back).toBe(20)
    expect(DEMO_ICON_SIZE.empty).toBe(48)
  })
})

describe('DEMO_SIDEBAR_CONFIG（侧边栏宽度，对齐 UIKit demo 的 EmResizable 范围）', () => {
  it('会话/通讯录/设置侧边栏共用默认 360 / 最小 240 / 最大 480', () => {
    expect(DEMO_SIDEBAR_CONFIG.defaultWidth).toBe(360)
    expect(DEMO_SIDEBAR_CONFIG.minWidth).toBe(240)
    expect(DEMO_SIDEBAR_CONFIG.maxWidth).toBe(480)
  })
})

describe('applyDemoContainerConfig（容器配置处理入口）', () => {
  const rootStyle = document.documentElement.style

  beforeEach(() => {
    rootStyle.removeProperty('--demo-container-gap')
    rootStyle.removeProperty('--demo-container-padding')
    rootStyle.removeProperty('--demo-component-radius')
  })

  it('将容器配置写入 CSS 变量，供 SCSS 以 var(--demo-*) 消费', () => {
    applyDemoContainerConfig()

    expect(rootStyle.getPropertyValue('--demo-container-gap')).toBe(
      `${DEMO_CONTAINER_CONFIG.gap}px`,
    )
    expect(rootStyle.getPropertyValue('--demo-container-padding')).toBe(
      `${DEMO_CONTAINER_CONFIG.padding}px`,
    )
    expect(rootStyle.getPropertyValue('--demo-component-radius')).toBe(
      `${DEMO_CONTAINER_CONFIG.radius}px`,
    )
  })
})
