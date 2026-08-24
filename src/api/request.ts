import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'

/** 后端统一响应体结构，按实际接口约定调整 */
export interface ApiResult<T = unknown> {
  code: number
  message: string
  data: T
}

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
})

// 请求拦截器：注入 token 等
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // const token = useUserStore().token
    // if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error: AxiosError) => Promise.reject(error),
)

// 响应拦截器：统一拆包与错误处理
request.interceptors.response.use(
  (response: AxiosResponse<ApiResult>) => {
    const { code, message, data } = response.data
    if (code !== 0) {
      // TODO: 统一错误提示
      return Promise.reject(new Error(message || '请求失败'))
    }
    // 拆包返回 data，与 axios 默认签名不符，这里做断言
    return data as unknown as AxiosResponse
  },
  (error: AxiosError<ApiResult>) => {
    // TODO: 401 跳转登录等
    return Promise.reject(error)
  },
)

export default request
