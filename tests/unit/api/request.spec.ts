import MockAdapter from 'axios-mock-adapter'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import router from '@/router'
import { useUserStore } from '@/store/modules/user'

import request, { http } from '@/api/request'

describe('request 封装', () => {
  let mock: MockAdapter

  beforeEach(() => {
    setActivePinia(createPinia())
    mock = new MockAdapter(request)
  })

  afterEach(() => {
    mock.restore()
    useUserStore().reset()
  })

  it('code === 0 时拆包返回 data', async () => {
    mock.onGet('/ok').reply(200, { code: 0, message: 'ok', data: { id: 1 } })

    await expect(http.get<{ id: number }>('/ok')).resolves.toEqual({ id: 1 })
  })

  it('code !== 0 时以 message 作为业务错误 reject', async () => {
    mock.onGet('/business-error').reply(200, { code: 10001, message: '参数错误', data: null })

    await expect(http.get('/business-error')).rejects.toThrow('参数错误')
  })

  it('HTTP 错误直接 reject', async () => {
    mock.onGet('/http-error').reply(500, { code: 500, message: '服务器错误', data: null })

    await expect(http.get('/http-error')).rejects.toThrow()
  })

  it('有 token 时自动注入 Authorization 头', async () => {
    useUserStore().setToken('test-token')
    mock.onGet('/auth').reply((config) => {
      expect(config.headers?.Authorization).toBe('Bearer test-token')
      return [200, { code: 0, message: 'ok', data: null }]
    })

    await http.get('/auth')
  })

  it('401 时清除登录态并跳转登录页', async () => {
    useUserStore().setToken('expired-token')
    mock.onGet('/expired').reply(401, { code: 401, message: '未授权', data: null })

    await expect(http.get('/expired')).rejects.toThrow()

    expect(useUserStore().token).toBe('')
    await vi.waitFor(() => {
      expect(router.currentRoute.value.path).toBe('/login')
    })
  })
})
