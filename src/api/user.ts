import request from './request'

/** 登录接口占位，业务逻辑后续补充 */
export function loginApi(payload: { username: string; password: string }) {
  return request.post<unknown, unknown>('/user/login', payload)
}
