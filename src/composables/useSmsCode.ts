import { ref } from 'vue'

import {
  encryptAES,
  getImageCaptcha,
  mapLoginSmsError,
  mapRegisterSmsError,
  PHONE_REGEX,
  sendLoginSms,
  sendRegisterSms,
  type SendLoginSmsPayload,
  type SendRegisterSmsPayload,
} from '@/api/sms'
import { captchaConfig } from '@/config/captcha'

/**
 * 短信验证码发送与倒计时管理。
 *
 * 封装两条链路：
 * - 登录：生产环境走阿里云验证码 2.0（AES-GCM 加密后调 v2 接口），开发环境走模拟倒计时
 * - 注册 / 重置密码：先获取图片验证码，再携带 imageId + imageCode 调短信接口
 *
 * 使用示例：
 * ```ts
 * const { countdown, loading, error, send, refreshImageCaptcha, imageCaptchaUrl, imageEnabled } = useSmsCode('login')
 * ```
 */

export type SmsScene = 'login' | 'register' | 'reset'

const COUNTDOWN_SECONDS = 60

export function useSmsCode(scene: SmsScene) {
  /** 倒计时剩余秒数，0 表示未在倒计时 */
  const countdown = ref(0)
  /** 发送中 loading */
  const loading = ref(false)
  /** 最近一次错误文案 */
  const error = ref('')

  let timerId: ReturnType<typeof setInterval> | null = null

  /** 图片验证码相关（仅 register / reset 场景） */
  const imageId = ref('')
  const imageEnabled = ref(false)
  const imageCaptchaUrl = ref('')

  /** 清理倒计时 */
  function clearCountdown() {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    }
    countdown.value = 0
  }

  /** 启动倒计时 */
  function startCountdown() {
    clearCountdown()
    countdown.value = COUNTDOWN_SECONDS
    timerId = setInterval(() => {
      countdown.value -= 1
      if (countdown.value <= 0) {
        clearCountdown()
      }
    }, 1000)
  }

  /**
   * 获取图片验证码（register / reset 场景前置）。
   *
   * @param phoneNumber 手机号（部分后端要求传入手机号）
   */
  async function refreshImageCaptcha(phoneNumber?: string) {
    if (scene === 'login') return
    try {
      const res = await getImageCaptcha()
      const id = res.data?.image_id ?? ''
      const enabled = res.data?.image_enabled === 'true'
      imageId.value = id
      imageEnabled.value = enabled
      if (enabled && id) {
        imageCaptchaUrl.value = `${window.location.protocol}//a1.easemob.com/inside/app/image/${id}`
      } else {
        imageCaptchaUrl.value = ''
      }
      // 若后端要求手机号，可在此做校验
      if (phoneNumber && !PHONE_REGEX.test(phoneNumber)) {
        error.value = '请输入正确的手机号码'
        return
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取图片验证码失败'
    }
  }

  /**
   * 发送短信验证码。
   *
   * @param phoneNumber  手机号
   * @param imageCode    图片验证码内容（register / reset 场景必填）
   * @param captchaVerifyParam  阿里云验证参数（login 场景且生产环境时由外部回调注入）
   */
  async function send(
    phoneNumber: string,
    imageCode?: string,
    captchaVerifyParam?: string,
  ): Promise<boolean> {
    error.value = ''

    if (!PHONE_REGEX.test(phoneNumber)) {
      error.value = '请输入正确的手机号码'
      return false
    }

    if (loading.value || countdown.value > 0) return false
    loading.value = true

    try {
      if (scene === 'login') {
        // 生产环境且配置了阿里云验证码 → 需要 captchaVerifyParam（由阿里云回调传入）
        if (captchaConfig.enabled) {
          if (!captchaVerifyParam) {
            error.value = '请先进行安全验证!'
            loading.value = false
            return false
          }
          const encrypted = await encryptAES(captchaVerifyParam, captchaConfig.secret)
          const payload: SendLoginSmsPayload = { phoneNumber, captchaVerifyParam: encrypted }
          const loginSmsRes = await sendLoginSms(payload)
          if (loginSmsRes.code !== 200) {
            throw new Error('验证码发送失败')
          }
        } else {
          // 开发环境：模拟发送，直接启动倒计时
          // TODO: 开发环境可接入 mock 接口或保持模拟行为
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      } else {
        // register / reset
        if (imageEnabled.value) {
          if (!imageCode) {
            error.value = '请填入图片验证码！'
            loading.value = false
            return false
          }
          if (!imageId.value) {
            error.value = '图片验证码已过期，请刷新'
            loading.value = false
            return false
          }
        }
        const payload: SendRegisterSmsPayload = {
          phoneNumber,
          imageId: imageId.value,
          imageCode: imageCode ?? '',
        }
        const registerSmsRes = await sendRegisterSms(payload)
        if (registerSmsRes.code !== 200) {
          throw new Error('验证码发送失败')
        }
      }

      startCountdown()
      return true
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (scene === 'login') {
        error.value = mapLoginSmsError(msg)
      } else {
        // register / reset：尝试从 message 中解析 code 与 info
        // 由于 axios 拦截器已把错误包装为 Error，这里简单按字符串匹配
        error.value = mapRegisterSmsError(400, msg)
      }
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    countdown,
    loading,
    error,
    send,
    refreshImageCaptcha,
    imageCaptchaUrl,
    imageEnabled,
    imageId,
    clearCountdown,
  }
}
