import { describe, expect, it } from 'vitest'

import { captchaConfig } from '@/config/captcha'

describe('captchaConfig', () => {
  it('测试/开发环境下 enabled 恒为 false（仅生产且配置齐全才启用）', () => {
    expect(captchaConfig.enabled).toBe(false)
  })

  it('未配置环境变量时值为空字符串', () => {
    expect(captchaConfig.sceneId).toBe('')
    expect(captchaConfig.prefix).toBe('')
    expect(captchaConfig.secret).toBe('')
  })
})
