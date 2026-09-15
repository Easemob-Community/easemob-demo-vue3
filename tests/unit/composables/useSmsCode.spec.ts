import { describe, expect, it, vi } from 'vitest'

import { useSmsCode } from '@/composables/useSmsCode'

// 模拟 sms API 模块
vi.mock('@/api/sms', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/sms')>()
  return {
    ...actual,
    sendLoginSms: vi.fn(),
    sendRegisterSms: vi.fn(),
    getImageCaptcha: vi.fn(),
  }
})

// 模拟 captchaConfig
vi.mock('@/config/captcha', () => ({
  captchaConfig: {
    enabled: false,
    sceneId: '',
    prefix: '',
    secret: '',
  },
}))

describe('useSmsCode 组合式函数', () => {
  it('初始状态正确', () => {
    const { countdown, loading, error } = useSmsCode('login')
    expect(countdown.value).toBe(0)
    expect(loading.value).toBe(false)
    expect(error.value).toBe('')
  })

  it('手机号格式错误时直接返回 false 并设置错误', async () => {
    const { send, error, loading } = useSmsCode('login')
    const result = await send('123')
    expect(result).toBe(false)
    expect(error.value).toBe('请输入正确的手机号码')
    expect(loading.value).toBe(false)
  })

  it('倒计时期间禁止重复发送', async () => {
    const { countdown, send } = useSmsCode('login')
    // 手动设置倒计时
    countdown.value = 30
    const result = await send('13800138000')
    expect(result).toBe(false)
  })

  it('clearCountdown 能重置状态', () => {
    const { countdown, clearCountdown } = useSmsCode('login')
    countdown.value = 30
    clearCountdown()
    expect(countdown.value).toBe(0)
  })

  it('register 场景初始不加载图片验证码', () => {
    const { imageEnabled, imageCaptchaUrl } = useSmsCode('register')
    expect(imageEnabled.value).toBe(false)
    expect(imageCaptchaUrl.value).toBe('')
  })
})
