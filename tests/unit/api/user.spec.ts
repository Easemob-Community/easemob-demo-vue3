import MockAdapter from 'axios-mock-adapter'
import axios from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('user 接口', () => {
  let mock: MockAdapter

  beforeEach(() => {
    vi.stubEnv('VITE_APP_SERVER_URL', 'https://appserver.example.com')
    mock = new MockAdapter(axios)
  })

  afterEach(() => {
    mock.restore()
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('通过手机号查询用户：携带 operator 与 chatToken，返回 chatUserName', async () => {
    mock.onGet('https://appserver.example.com/inside/app/user/13800138000').reply((config) => {
      expect(config.params?.operator).toBe('user-1')
      expect(config.headers?.Authorization).toBe('Bearer chat-token')
      return [200, { code: 200, chatUserName: 'abc123' }]
    })

    const { getUserByPhoneApi } = await import('@/api/user')
    const result = await getUserByPhoneApi('13800138000', 'user-1', 'chat-token')

    expect(result).toEqual({ code: 200, chatUserName: 'abc123' })
  })

  it('App Server 地址未配置时直接拒绝', async () => {
    vi.stubEnv('VITE_APP_SERVER_URL', '')

    const { getUserByPhoneApi } = await import('@/api/user')

    await expect(getUserByPhoneApi('13800138000', 'user-1', 'chat-token')).rejects.toThrow(
      'App Server 地址未配置',
    )
  })
})
