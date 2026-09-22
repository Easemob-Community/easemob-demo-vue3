import { setPinyinAdapter } from '@easemob-community/uikit-im'
import { pinyin } from 'pinyin-pro'

/**
 * 注入拼音适配器（Pinyin Adapter）
 *
 * UIKit 默认不携带任何拼音库，这里按需注入 pinyin-pro，以支持中文联系人 / 群组的
 * 首字母分组、完整拼音搜索与首字母缩写搜索；未注入 adapter 时，UIKit 会自动降级
 * 为仅按字符串 includes 匹配。该函数需在 app.use(UIKit) 之前调用。
 */
export function setupPinyinAdapter(): void {
  setPinyinAdapter((text) => {
    const full = pinyin(text, { toneType: 'none', type: 'string', nonZh: 'consecutive' })
      .replace(/\s+/g, '')
      .toLowerCase()
    const initialsRaw = pinyin(text, { pattern: 'first', toneType: 'none', type: 'string' })
      .replace(/\s+/g, '')
      .toLowerCase()
    const firstChar = initialsRaw.charAt(0).toUpperCase()
    return {
      pinyin: full, // 完整拼音，如 "zhangsan"
      initials: initialsRaw, // 首字母缩写，如 "zs"，用于缩写搜索
      firstLetter: /^[A-Z]$/.test(firstChar) ? firstChar : '#', // 字母分组用
    }
  })
}
