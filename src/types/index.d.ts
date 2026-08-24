/** 全局通用类型声明（共享业务类型集中于此，页面 / 接口模块按需 import type 引用） */

/** 后端统一响应体结构，按实际接口约定调整 */
export interface ApiResult<T = unknown> {
  code: number
  message: string
  data: T
}

/** 分页查询通用入参 */
export interface PageQuery {
  pageNum: number
  pageSize: number
}

/** 分页响应通用结构 */
export interface PageResult<T> {
  list: T[]
  total: number
}

/** 登录成功返回 */
export interface LoginResult {
  token: string
  userId: string
  nickname?: string
  avatar?: string
}
