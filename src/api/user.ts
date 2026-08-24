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
