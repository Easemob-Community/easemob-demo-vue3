import axios, { type AxiosResponse } from 'axios'

import { http } from './request'
import type { LoginResult } from '@/types'

/** 环信 Demo App Server 地址 */
const appServerUrl = import.meta.env.VITE_APP_SERVER_URL ?? ''

/** App Server 专用 axios 实例 */
const appServerRequest = axios.create({
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// 响应拦截器：HTTP 200 直接返回 data；业务错误按 errorInfo 抛出
appServerRequest.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error) => {
    const res = error.response
    if (res?.status >= 400) {
      const info = res.data?.errorInfo || res.data?.error_description || '登录失败'
      return Promise.reject(new Error(info))
    }
    return Promise.reject(error)
  },
)

/** 登录入参 */
export interface LoginPayload {
  username: string
  password: string
}

/** 登录接口占位，业务逻辑后续补充 */
export function loginApi(payload: LoginPayload) {
  return http.post<LoginResult>('/user/login', payload)
}

/** 手机号 + 短信验证码登录入参 */
export interface PhoneLoginPayload {
  phoneNumber: string
  smsCode: string
}

/** 手机号登录接口响应 */
export interface PhoneLoginResult {
  /** Chat Token，用于 IM SDK 登录及注销账户鉴权 */
  token: string
  /** 环信用户 ID */
  chatUserName: string
}

/**
 * 手机号 + 短信验证码登录。
 *
 * POST {appServer}/inside/app/user/login/V2
 */
export function loginByPhoneApi(payload: PhoneLoginPayload) {
  if (!appServerUrl) {
    return Promise.reject(new Error('App Server 地址未配置'))
  }
  return appServerRequest.post<unknown, PhoneLoginResult>(
    `${appServerUrl}/inside/app/user/login/V2`,
    payload,
  )
}

/** 头像上传接口响应 */
export interface AvatarUploadResult {
  avatarUrl: string
}

/**
 * 手机号登录错误文案映射。
 *
 * @param info 后端返回的 errorInfo 字段
 * @param phoneNumber 当前登录手机号，用于匹配「用户不存在」提示
 */
export function mapPhoneLoginError(info: string, phoneNumber?: string): string {
  if (info.includes('UserId password error.')) {
    return '用户名或密码错误'
  }
  if (phoneNumber && info.includes(`UserId ${phoneNumber} does not exist.`)) {
    return '用户不存在'
  }
  if (info.includes('phone number illegal')) {
    return '请输入正确的手机号码'
  }
  if (info.includes('SMS verification code error.')) {
    return '验证码错误'
  }
  if (info.includes('Sms code cannot be empty')) {
    return '验证码不能为空'
  }
  if (info.includes('Please send SMS to get mobile phone verification code.')) {
    return '请发送短信获取手机验证码'
  }
  return info || '登录失败，请重试'
}

/** 手机号查询用户响应 */
export interface PhoneUserLookupResult {
  /** 业务码，200 表示查询成功 */
  code: number
  /** 手机号对应的环信用户 ID */
  chatUserName: string
}

/**
 * 通过手机号查询环信用户 ID（手机号搜索添加好友时使用）。
 *
 * GET {appServer}/inside/app/user/{phoneNumber}?operator={operator}
 * 鉴权：IM 登录返回的 chatToken（Bearer）。
 */
export function getUserByPhoneApi(phoneNumber: string, operator: string, chatToken: string) {
  if (!appServerUrl) {
    return Promise.reject(new Error('App Server 地址未配置'))
  }
  return axios
    .get<PhoneUserLookupResult>(`${appServerUrl}/inside/app/user/${phoneNumber}`, {
      params: { operator },
      headers: { Authorization: `Bearer ${chatToken}` },
    })
    .then((response) => response.data)
}

/**
 * 注销账户。
 *
 * DELETE {appServer}/inside/app/user/{phoneNumber}
 * 鉴权：IM 登录返回的 chatToken（Bearer）。
 */
export function deleteAccount(phoneNumber: string, chatToken: string) {
  if (!appServerUrl) {
    return Promise.reject(new Error('App Server 地址未配置'))
  }
  return axios.delete(`${appServerUrl}/inside/app/user/${phoneNumber}`, {
    headers: {
      Authorization: `Bearer ${chatToken}`,
    },
  })
}

/**
 * 上传用户头像。
 *
 * POST {appServer}/inside/app/user/{userId}/avatar/upload
 * 鉴权：SDK 登录后的 accessToken（Bearer）。
 */
export function uploadAvatar(userId: string, file: Blob, accessToken: string) {
  if (!appServerUrl) {
    return Promise.reject(new Error('App Server 地址未配置'))
  }
  const formData = new FormData()
  formData.append('file', file, 'avatar.jpg')
  return axios
    .post<AvatarUploadResult>(
      `${appServerUrl}/inside/app/user/${userId}/avatar/upload`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      },
    )
    .then((response) => response.data)
}
