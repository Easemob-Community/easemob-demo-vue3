import { mergeLocaleMessages } from '@easemob/uikit-im'

/**
 * 覆盖 UIKit 内置文案，对齐 Demo 业务约定。
 *
 * 当前仅「添加联系人」弹窗（EmAddContactModal）：输入框支持手机号或环信用户 ID，
 * 故把标签 / 占位文案从「用户 ID」放宽为「手机号 / 用户 ID」。
 * 注意只覆盖被该弹窗单点使用的 key（contact.userId / contact.addContactPlaceholder），
 * 勿覆盖 conversation.addContact 等被会话菜单复用的 key。
 */
export function applyUIKitLocaleOverrides(): void {
  mergeLocaleMessages('zh-CN', {
    'contact.userId': '手机号 / 用户 ID',
    'contact.addContactPlaceholder': '手机号、ID',
  })
  mergeLocaleMessages('en', {
    'contact.userId': 'Phone / User ID',
    'contact.addContactPlaceholder': 'Phone number or ID',
  })
}
