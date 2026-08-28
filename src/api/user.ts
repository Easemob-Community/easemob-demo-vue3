import axios from 'axios'

import { http } from './request'
import type { LoginResult } from '@/types'

/** 登录入参 */
export interface LoginPayload {
  username: string
  password: string
}

/** 登录接口占位，业务逻辑后续补充 */
export function loginApi(payload: LoginPayload) {
  return http.post<LoginResult>('/user/login', payload)
}

/** 头像上传接口响应 */
export interface AvatarUploadResult {
  avatarUrl: string
}

const appServerUrl = import.meta.env.VITE_APP_SERVER_URL ?? ''

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
