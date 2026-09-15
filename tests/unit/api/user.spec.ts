import { afterEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: mocks.get,
      post: mocks.post,
      delete: mocks.delete,
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
      defaults: {},
    })),
  },
}))

describe('user 接口模块', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
    vi.clearAllMocks()
  })

  describe('getUserByPhoneApi', () => {
    it('App Server 地址未配置时拒绝调用', async () => {
      vi.stubEnv('VITE_APP_SERVER_URL', '')
      const { getUserByPhoneApi } = await import('@/api/user')

      await expect(getUserByPhoneApi('13800138000', 'token', 'me')).rejects.toThrow(
        'App Server 地址未配置',
      )
      expect(mocks.get).not.toHaveBeenCalled()
    })

    it('以 Bearer accessToken 请求 GET /inside/app/user/{phone} 并携带 operator', async () => {
      vi.stubEnv('VITE_APP_SERVER_URL', 'https://appserver.easesdk.com')
      mocks.get.mockResolvedValue({ chatUserName: 'abc123' })
      const { getUserByPhoneApi } = await import('@/api/user')

      const result = await getUserByPhoneApi('13800138000', 'access-token', 'me')

      expect(mocks.get).toHaveBeenCalledWith(
        'https://appserver.easesdk.com/inside/app/user/13800138000',
        { headers: { Authorization: 'Bearer access-token' }, params: { operator: 'me' } },
      )
      expect(result).toEqual({ chatUserName: 'abc123' })
    })
  })

  describe('mapPhoneQueryError', () => {
    it('映射用户不存在（需提供手机号才会匹配）', async () => {
      vi.stubEnv('VITE_APP_SERVER_URL', 'https://appserver.example.com')
      const { mapPhoneQueryError } = await import('@/api/user')

      expect(mapPhoneQueryError('UserId 13800138000 does not exist.', '13800138000')).toBe(
        '用户不存在',
      )
      expect(mapPhoneQueryError('UserId 13800138000 does not exist.')).toBe(
        'UserId 13800138000 does not exist.',
      )
    })

    it('映射手机号非法，空文案兜底为查询失败', async () => {
      vi.stubEnv('VITE_APP_SERVER_URL', 'https://appserver.example.com')
      const { mapPhoneQueryError } = await import('@/api/user')

      expect(mapPhoneQueryError('phone number illegal', '13800138000')).toBe('请输入正确的手机号码')
      expect(mapPhoneQueryError('')).toBe('查询失败，请重试')
    })
  })
})
