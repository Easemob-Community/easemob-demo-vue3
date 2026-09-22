import { setPinyinAdapter } from '@easemob-community/uikit-im'
import { pinyin } from 'pinyin-pro'

/**
 * 注入拼音适配器（Pinyin Adapter）
 *
 * UIKit 默认不携带任何拼音库，这里按需注入 pinyin-pro，以支持中文联系人 / 群组的
 * 首字母分组、完整拼音搜索与首字母缩写搜索；未注入 adapter 时，UIKit 会自动降级
 * 为仅按字符串 includes 匹配。
 *
 * 注册时机：UIKit 在调用 resolvePinyin 时才读取 adapter（模块级变量，注册时无快照），
 * 因此无需在 app.use(UIKit) 之前调用，可在应用挂载后动态 import 再注册（见 src/main.ts），
 * 把 pinyin-pro 完整词典移出首屏关键链；注册前已完成的解析不缓存空结果，注册后即恢复。
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
