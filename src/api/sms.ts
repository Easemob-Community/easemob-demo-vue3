/**
 * 短信验证码接口封装。
 *
 * 覆盖三条链路：
 * - 登录：阿里云验证码 2.0 → AES-GCM 加密 → POST /inside/app/sms/send/v2
 * - 注册 / 重置密码：图片验证码 → POST /inside/app/sms/send
 * - 前置：GET /inside/app/image 获取图片验证码
 *
 * 请求使用独立 axios 实例，baseURL 固定为环信域名（协议跟随当前页面），
 * 不经过本地代理，也不携带用户 token（短信接口本身不需要登录态）。
 */

import axios, { type AxiosResponse } from 'axios'

import { captchaConfig } from '@/config/captcha'

// ------------------------------------------------------------------
// 常量
// ------------------------------------------------------------------

/** 环信线上正式域名 */
const EASEMOB_BASE_URL = `${window.location.protocol}//a1.easemob.com`

/** 手机号校验正则 */
export const PHONE_REGEX = /^1[3-9]\d{9}$/

// ------------------------------------------------------------------
// 独立 axios 实例（短信专用）
// ------------------------------------------------------------------

const smsRequest = axios.create({
  withCredentials: false,
  baseURL: EASEMOB_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// 响应拦截器：HTTP ≥ 400 视为错误，其余直接返回 response.data
smsRequest.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error) => {
    const res = error.response
    if (res?.status === 403) {
      return Promise.reject(new Error('您没有权限进行查询和操作!'))
    }
    if (res?.status >= 400) {
      const desc = res.data?.error_description || res.data?.errorInfo || 'Error'
      return Promise.reject(new Error(desc))
    }
    return Promise.reject(error)
  },
)

// ------------------------------------------------------------------
// 类型
// ------------------------------------------------------------------

/** 图片验证码响应 */
export interface ImageCaptchaResult {
  data: {
    image_id: string
    image_enabled: string
  }
}

/** 短信发送通用响应 */
export interface SmsSendResult {
  code: number
}

// ------------------------------------------------------------------
// AES-GCM 加密（阿里云 captchaVerifyParam）
// ------------------------------------------------------------------

/**
 * 使用 AES-GCM-256 加密明文，输出 base64(iv + ciphertext)。
 *
 * @param plaintext  待加密字符串（阿里云验证码返回的 captchaVerifyParam）
 * @param secretKey  密钥，base64 编码的字符串
 */
export async function encryptAES(plaintext: string, secretKey: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(plaintext)

  const binaryString = window.atob(secretKey)
  const keyData = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    keyData[i] = binaryString.charCodeAt(i)
  }

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt'],
  )
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data)
  const encryptedArray = new Uint8Array(
    Array.from(iv).concat(Array.from(new Uint8Array(encrypted))),
  )
  return btoa(String.fromCharCode.apply(null, Array.from(encryptedArray) as number[]))
}

// ------------------------------------------------------------------
// 接口
// ------------------------------------------------------------------

/**
 * 获取图片验证码。
 *
 * @returns 图片验证码 ID 与是否启用标识
 */
export function getImageCaptcha() {
  return smsRequest.get<unknown, ImageCaptchaResult>('/inside/app/image')
}

/** 登录短信验证码 v2 入参 */
export interface SendLoginSmsPayload {
  phoneNumber: string
  /** 经 AES-GCM 加密后的阿里云验证参数 */
  captchaVerifyParam: string
}

/**
 * 登录场景：发送短信验证码（需阿里云人机验证）。
 */
export function sendLoginSms(payload: SendLoginSmsPayload) {
  return smsRequest.post<unknown, SmsSendResult>('/inside/app/sms/send/v2', payload)
}

/** 注册 / 重置密码短信验证码入参 */
export interface SendRegisterSmsPayload {
  phoneNumber: string
  imageId: string
  imageCode: string
}

/**
 * 注册 / 重置密码场景：发送短信验证码（需图片验证码）。
 */
export function sendRegisterSms(payload: SendRegisterSmsPayload) {
  return smsRequest.post<unknown, SmsSendResult>('/inside/app/sms/send', payload)
}

// ------------------------------------------------------------------
// 错误映射
// ------------------------------------------------------------------

/**
 * 登录场景（v2 接口）错误文案映射。
 *
 * @param errorDescription 后端返回的 error_description 字段
 */
export function mapLoginSmsError(errorDescription: string): string {
  if (errorDescription.includes('phone number illegal')) {
    return '请输入正确的手机号码'
  }
  if (errorDescription.includes('Please wait a moment while trying to send.')) {
    return '操作过于频繁，请稍后再试'
  }
  if (
    errorDescription.includes('exceed the limit') ||
    errorDescription.includes('SMS verification code exceeds the limit') ||
    errorDescription.includes('This request has reached api limit.')
  ) {
    return '验证码获取已达上限，请明日再试'
  }
  return errorDescription || '验证码获取失败'
}

/**
 * 注册 / 重置密码场景错误文案映射。
 *
 * @param code  业务码
 * @param info  errorInfo 字段
 */
export function mapRegisterSmsError(code: number, info: string): string {
  if (code === 400) {
    if (info.includes('Please wait a moment while trying to send.')) {
      return '验证码在有效期内，请勿重复发送！'
    }
    if (info.includes('Image verification code error.')) {
      return '图片验证码错误，请更换验证码或重新输入！'
    }
    if (info.includes('Image code id cannot be empty.')) {
      return '请填入图片验证码！'
    }
    if (info.includes('Phone number cannot be empty.')) {
      return '获取图片验证码请填入手机号！'
    }
    if (info.includes('phone number illegal')) {
      return '手机号不合法！'
    }
    if (info.includes('Please send SMS to get mobile phone verification code.')) {
      return '请发送短信获取手机验证码！'
    }
    if (info.includes('SMS verification code error.')) {
      return '验证码错误！'
    }
  }
  if (code === 17) {
    if (info.includes('unauthorized')) {
      return '未开放授权注册！'
    }
    if (info.includes('resource_limited')) {
      return '注册已达上限请开通企业版！'
    }
  }
  return info || '验证码获取失败'
}

// ------------------------------------------------------------------
// 阿里云验证码 2.0 工具
// ------------------------------------------------------------------

/** 阿里云验证码实例（由 initAliyunCaptcha 回调注入） */
let aliyunCaptchaInstance: Record<string, unknown> | null = null

/**
 * 初始化阿里云验证码 2.0（仅在生产环境且配置齐全时执行）。
 *
 * @param options 配置项
 */
export function initAliyunCaptcha(options: {
  /** 验证通过回调：接收 captchaVerifyParam，需自行加密并调短信接口 */
  onVerify: (captchaVerifyParam: string) => Promise<void> | void
  /** 业务结果回调（可选） */
  onBizResult?: () => void
}): (() => void) | undefined {
  if (!captchaConfig.enabled) return

  const init = (window as unknown as Record<string, unknown>).initAliyunCaptcha as
    ((config: Record<string, unknown>) => void) | undefined

  if (typeof init !== 'function') {
    console.warn('[AliyunCaptcha] SDK 未加载，跳过初始化')
    return
  }

  init({
    SceneId: captchaConfig.sceneId,
    prefix: captchaConfig.prefix,
    mode: 'popup',
    element: '#captcha-element',
    button: '#captcha-button',
    captchaVerifyCallback: async (captchaVerifyParam: string) => {
      const data = { captchaResult: false, bizResult: true }
      if (!captchaVerifyParam) {
        return data
      }
      data.captchaResult = true
      await options.onVerify(captchaVerifyParam)
      return data
    },
    onBizResultCallback: options.onBizResult,
    getInstance: (instance: Record<string, unknown>) => {
      aliyunCaptchaInstance = instance
    },
    slideStyle: { width: 360, height: 40 },
    language: 'cn',
  })

  // 返回清理函数
  return () => {
    document.getElementById('aliyunCaptcha-mask')?.remove()
    document.getElementById('aliyunCaptcha-window-popup')?.remove()
    aliyunCaptchaInstance = null
  }
}

/**
 * 重置阿里云验证码（验证失败后可调用）。
 */
export function resetAliyunCaptcha() {
  if (
    aliyunCaptchaInstance &&
    typeof (aliyunCaptchaInstance as { reset?: () => void }).reset === 'function'
  ) {
    ;(aliyunCaptchaInstance as { reset: () => void }).reset()
  }
}
