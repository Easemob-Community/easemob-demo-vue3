import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MESSAGE_STATUS, MESSAGE_TYPE } from '@easemob-community/uikit-im'
import type { UiMessage } from '@easemob-community/uikit-im'
import { extractSnippetText, toUiConversation } from '@easemob-community/uikit-sdk-websdk5'

import { HUANXIN_EMOJI_META, STICKER_I18N_KEY_BY_CODE, resolveStickerLastMessageText } from '@/config/sticker'
import i18n from '@/locales'

function makeImageMessage(ext: Record<string, unknown>): UiMessage {
  return {
    msgServerId: 'srv-1',
    msgLocalId: 'local-1',
    from: 'alice',
    to: 'me',
    sender: { userId: 'alice' },
    conversationId: 'alice',
    conversationType: 'singleChat',
    type: MESSAGE_TYPE.IMAGE,
    sendStatus: MESSAGE_STATUS.SENT,
    status: MESSAGE_STATUS.SENT,
    isSelf: false,
    ext,
    timestamp: 1700000000000,
    body: { localUrl: '', isGif: true },
  }
}

const cases = [
  ['huanxin.biubiu', '[亮个相吧]', '[Ta-da!]'],
  ['huanxin.caffe', '[辛苦啦]', '[Thanks for Your Hard Work]'],
  ['huanxin.debug', '[Bug终结者]', '[Bug Slayer]'],
  ['huanxin.dont_wanna', '[你说神嘛]', '[What Did You Say?]'],
  ['huanxin.error', '[报错了]', '[Something Went Wrong]'],
  ['huanxin.like', '[真棒]', '[Awesome!]'],
  ['huanxin.insane', '[厉害]', '[Impressive!]'],
  ['huanxin.jajaja', '[笑死]', '[LOL]'],
  ['huanxin.likes', '[真棒棒]', '[So Awesome!]'],
  ['huanxin.success', '[成功啦]', '[Success!]'],
  ['huanxin.roll_out', '[上线了]', "[It's Live!]"],
  ['huanxin.OKDK', '[好的收到]', '[Got It!]'],
  ['huanxin.thanks', '[谢谢老板]', '[Thanks, Boss!]'],
] as const

beforeEach(() => {
  i18n.global.locale.value = 'zh-CN'
})

describe('环信动画表情摘要', () => {
  it.each(cases)('%s 按当前语言返回对应含义', (code, zhText, enText) => {
    const message = makeImageMessage({ isSticker: true, stickerCode: code })

    expect(resolveStickerLastMessageText(message)).toBe(zhText)
    i18n.global.locale.value = 'en-US'
    expect(resolveStickerLastMessageText(message)).toBe(enText)
  })

  it('13 个内置表情均有唯一编码映射', () => {
    expect(HUANXIN_EMOJI_META).toHaveLength(13)
    expect(STICKER_I18N_KEY_BY_CODE.size).toBe(13)
    expect(new Set(STICKER_I18N_KEY_BY_CODE.keys()).size).toBe(13)
  })

  it.each([
    ['缺失', { isSticker: true }],
    ['空字符串', { isSticker: true, stickerCode: '' }],
    ['空白字符串', { isSticker: true, stickerCode: '   ' }],
    ['null', { isSticker: true, stickerCode: null }],
    ['数字', { isSticker: true, stickerCode: 42 }],
    ['未知编码', { isSticker: true, stickerCode: 'huanxin.unknown' }],
    ['特殊属性名', { isSticker: true, stickerCode: '__proto__' }],
  ])('stickerCode %s 时使用当前语言兜底', (_name, ext) => {
    const message = makeImageMessage(ext)

    expect(resolveStickerLastMessageText(message)).toBe('[动画表情]')
    i18n.global.locale.value = 'en-US'
    expect(resolveStickerLastMessageText(message)).toBe('[Animated Sticker]')
  })

  it.each([
    ['普通 GIF', {}],
    ['字符串 isSticker', { isSticker: 'true' }],
  ])('%s 不按动画表情处理', (_name, ext) => {
    const message = makeImageMessage(ext)

    expect(resolveStickerLastMessageText(message)).toBe('[图片]')
    i18n.global.locale.value = 'en-US'
    expect(resolveStickerLastMessageText(message)).toBe('[Image]')
  })

  it('命中 code 但当前语言缺少文案时使用当前语言兜底', () => {
    const message = makeImageMessage({ isSticker: true, stickerCode: 'huanxin.biubiu' })
    const te = vi.spyOn(i18n.global, 'te').mockReturnValue(false)

    try {
      expect(resolveStickerLastMessageText(message)).toBe('[动画表情]')
      i18n.global.locale.value = 'en-US'
      expect(resolveStickerLastMessageText(message)).toBe('[Animated Sticker]')
    }
    finally {
      te.mockRestore()
    }
  })

  it('命中 code 但文案为空字符串时使用当前语言兜底', () => {
    const message = makeImageMessage({ isSticker: true, stickerCode: 'huanxin.biubiu' })
    const originalT = i18n.global.t.bind(i18n.global)
    const t = vi.spyOn(i18n.global, 't').mockImplementation(key =>
      key === 'chat.sticker.huanxin.biubiu' ? '' : originalT(key),
    )

    try {
      expect(resolveStickerLastMessageText(message)).toBe('[动画表情]')
      i18n.global.locale.value = 'en-US'
      expect(resolveStickerLastMessageText(message)).toBe('[Animated Sticker]')
    }
    finally {
      t.mockRestore()
    }
  })

  it('非图片消息交给默认摘要解析器', () => {
    const message = {
      ...makeImageMessage({}),
      type: MESSAGE_TYPE.TEXT,
      body: { content: 'hello' },
    } as UiMessage

    expect(resolveStickerLastMessageText(message)).toBeUndefined()
  })
})


type ConversationSnippet = NonNullable<Parameters<typeof extractSnippetText>[0]>
type SdkConversation = Parameters<typeof toUiConversation>[0]

function makeConversationSnippet(ext: Record<string, unknown>): ConversationSnippet {
  return {
    msgServerId: 'srv-1',
    msgLocalId: 'local-1',
    from: 'alice',
    to: 'group-1',
    sender: { userId: 'alice', nickname: 'Alice' },
    conversationId: 'group-1',
    conversationType: 'groupChat',
    type: MESSAGE_TYPE.IMAGE,
    sendStatus: MESSAGE_STATUS.SENT,
    ext,
    timestamp: 1700000000000,
    body: { isGif: true },
  }
}

function makeSdkConversation(lastMessage: ConversationSnippet): SdkConversation {
  return {
    conversationId: 'group-1',
    conversationType: 'groupChat',
    conversationName: 'group-1',
    unreadCount: 0,
    lastMessage,
    marks: [],
    remindType: 'DEFAULT',
  }
}

describe('实际 WebSDK5 产物的会话快照集成', () => {
  it('快照恢复后按 code 和当前语言生成摘要', () => {
    const snippet = makeConversationSnippet({ isSticker: true, stickerCode: 'huanxin.biubiu' })

    expect(extractSnippetText(snippet, undefined, resolveStickerLastMessageText)).toBe('[亮个相吧]')
    i18n.global.locale.value = 'en-US'
    expect(extractSnippetText(snippet, undefined, resolveStickerLastMessageText)).toBe('[Ta-da!]')
  })

  it('历史快照只有 isSticker 时使用当前语言兜底', () => {
    const snippet = makeConversationSnippet({ isSticker: true })

    expect(extractSnippetText(snippet, undefined, resolveStickerLastMessageText)).toBe('[动画表情]')
    i18n.global.locale.value = 'en-US'
    expect(extractSnippetText(snippet, undefined, resolveStickerLastMessageText)).toBe('[Animated Sticker]')
  })

  it('会话快照转换保留群聊发送者前缀', () => {
    const conversation = makeSdkConversation(makeConversationSnippet({
      isSticker: true,
      stickerCode: 'huanxin.thanks',
    }))

    expect(toUiConversation(conversation, {
      lastMessageTextResolver: resolveStickerLastMessageText,
    }).lastMessageText).toBe('Alice: [谢谢老板]')
  })
})
