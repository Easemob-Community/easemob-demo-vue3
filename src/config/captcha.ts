/**
 * 滑块验证（阿里云验证码 2.0）与短信相关配置。
 *
 * 配置值来自 .env.production.local（不被 git 追踪，仅生产构建注入），
 * 非生产环境或未配置时 captchaConfig.enabled 为 false，业务侧据此跳过滑块验证流程。
 */

export interface CaptchaConfig {
  /** 是否启用滑块验证：仅生产环境且配置齐全时为 true */
  readonly enabled: boolean
  /** 场景 ID */
  readonly sceneId: string
  /** 身份标 */
  readonly prefix: string
  /** 验证参数加密密钥（前端混淆用，与后端约定一致） */
  readonly secret: string
}

const sceneId = import.meta.env.VITE_CAPTCHA_SCENE_ID ?? ''
const prefix = import.meta.env.VITE_CAPTCHA_PREFIX ?? ''
const secret = import.meta.env.VITE_CAPTCHA_SECRET ?? ''

export const captchaConfig: CaptchaConfig = {
  enabled: import.meta.env.PROD && Boolean(sceneId && prefix && secret),
  sceneId,
  prefix,
  secret,
}
