import { MESSAGE_TYPE } from '@easemob-community/uikit-im'
import type { EmojiStickerItem, UiMessage } from '@easemob-community/uikit-im'

import i18n from '@/locales'

export const HUANXIN_EMOJI_META: Array<{ key: string; name: string }> = [
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

export const STICKER_I18N_KEY_BY_CODE: ReadonlyMap<string, string> = new Map(
  HUANXIN_EMOJI_META.map(({ key }) => [`huanxin.${key}`, `chat.sticker.huanxin.${key}`]),
)

export function buildDemoStickerExt(sticker: EmojiStickerItem, packId: string) {
  return { stickerCode: `${packId}.${sticker.key}` }
}

export function resolveStickerLastMessageText(message: UiMessage): string | undefined {
  if (message.type !== MESSAGE_TYPE.IMAGE) return undefined
  if (message.ext?.isSticker !== true) {
    return `[${i18n.global.t('chat.messagePreview.image')}]`
  }

  const code = typeof message.ext?.stickerCode === 'string' ? message.ext.stickerCode.trim() : ''
  const labelKey = code ? STICKER_I18N_KEY_BY_CODE.get(code) : undefined
  const translated = labelKey && i18n.global.te(labelKey) ? i18n.global.t(labelKey) : ''
  const label = translated || i18n.global.t('chat.sticker.fallback')

  return `[${label}]`
}
