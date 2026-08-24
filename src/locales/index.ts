import { createI18n } from 'vue-i18n'

import enUS from './en-US'
import zhCN from './zh-CN'

export type AppLocale = 'zh-CN' | 'en-US'

export const SUPPORT_LOCALES: { label: string; value: AppLocale }[] = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' },
]

/** 默认语言跟随浏览器，不在支持列表内则回退中文 */
const browserLocale = navigator.language
const defaultLocale: AppLocale = SUPPORT_LOCALES.some((item) => item.value === browserLocale)
  ? (browserLocale as AppLocale)
  : 'zh-CN'

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  globalInjection: true, // 模板中可直接使用 $t
  locale: defaultLocale,
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
})

export default i18n
