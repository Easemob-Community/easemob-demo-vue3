/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  /** 请求超时时间（毫秒），未配置时默认 15000 */
  readonly VITE_API_TIMEOUT?: string
  /** 阿里云验证码 2.0（仅生产环境，配置在 .env.production.local，不入库） */
  readonly VITE_CAPTCHA_SCENE_ID?: string
  readonly VITE_CAPTCHA_PREFIX?: string
  readonly VITE_CAPTCHA_SECRET?: string
  /** UIKit 接入：环信 AppKey（格式 xxxx#xxxx），未配置时 Provider 不初始化 SDK */
  readonly VITE_APP_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
