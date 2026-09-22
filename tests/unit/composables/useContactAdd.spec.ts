import { beforeEach, describe, expect, it, vi } from 'vitest'

import i18n from '@/locales'

const mocks = vi.hoisted(() => ({
  getUserByPhoneApi: vi.fn(),
  addContact: vi.fn(),
  contacts: [] as { userId: string }[],
  currentUser: 'me',
  chatToken: 'chat-token',
  accessToken: 'access-token',
}))

vi.mock('@/api/user', () => ({
  getUserByPhoneApi: mocks.getUserByPhoneApi,
  mapPhoneQueryError: (info: string, phoneNumber?: string) => {
    if (phoneNumber && info.includes(`UserId ${phoneNumber} does not exist.`)) {
      return '用户不存在'
    }
    return info || '查询失败，请重试'
  },
}))

vi.mock('@/store/modules/user', () => ({
  useUserStore: () => ({
    chatToken: mocks.chatToken,
    accessToken: mocks.accessToken,
  }),
}))

vi.mock('@easemob-community/uikit-im', () => ({
  useContact: () => ({
    contactList: { value: mocks.contacts },
    addContact: mocks.addContact,
  }),
  useUIKit: () => ({
    stores: {
      client: { currentUser: mocks.currentUser },
    },
  }),
}))

import { useContactAdd } from '@/composables/useContactAdd'

describe('useContactAdd', () => {
  beforeEach(() => {
    // 注意用 mockReset 而非 clearAllMocks：后者不会清除 mockRejectedValue 等实现，会泄漏到后续用例
    mocks.getUserByPhoneApi.mockReset()
    mocks.addContact.mockReset()
    mocks.contacts.length = 0
    mocks.currentUser = 'me'
    mocks.chatToken = 'chat-token'
    mocks.accessToken = 'access-token'
  })

  describe('addByKeyword（用户 ID）', () => {
    it('直接按用户 ID 发送好友申请并透传验证消息', async () => {
      const { addByKeyword } = useContactAdd()
      await addByKeyword('abc123', '你好')

      expect(mocks.getUserByPhoneApi).not.toHaveBeenCalled()
      expect(mocks.addContact).toHaveBeenCalledWith('abc123', '你好')
    })

    it('验证消息为空字符串时按 undefined 透传', async () => {
      const { addByKeyword } = useContactAdd()
      await addByKeyword('abc123', '')

      expect(mocks.addContact).toHaveBeenCalledWith('abc123', undefined)
    })

    it('输入为空时提示请输入', async () => {
      const { addByKeyword } = useContactAdd()

      await expect(addByKeyword('   ')).rejects.toThrow(
        i18n.global.t('contacts.addContact.errorRequired'),
      )
      expect(mocks.addContact).not.toHaveBeenCalled()
    })

    it('目标是自己时拦截并提示不能添加自己', async () => {
      const { addByKeyword } = useContactAdd()

      await expect(addByKeyword('me')).rejects.toThrow(i18n.global.t('contacts.addSelfError'))
      expect(mocks.addContact).not.toHaveBeenCalled()
    })

    it('目标已是好友时前置拦截，不再调用 SDK 添加', async () => {
      mocks.contacts.push({ userId: 'abc123' })

      const { addByKeyword } = useContactAdd()

      await expect(addByKeyword('abc123')).rejects.toThrow(i18n.global.t('contacts.alreadyFriend'))
      expect(mocks.addContact).not.toHaveBeenCalled()
    })

    it('SDK 查无此用户（error.type === 204）时提示用户不存在', async () => {
      mocks.addContact.mockRejectedValue({ type: 204, message: 'Service resource not found' })

      const { addByKeyword } = useContactAdd()

      await expect(addByKeyword('ghost')).rejects.toThrow(i18n.global.t('contacts.userNotExist'))
    })
  })

  describe('addByKeyword（手机号）', () => {
    it('先经 App Server 解析为用户 ID，再发送好友申请', async () => {
      mocks.getUserByPhoneApi.mockResolvedValue({ chatUserName: 'abc123' })

      const { addByKeyword } = useContactAdd()
      await addByKeyword('13800138000', '你好')

      expect(mocks.getUserByPhoneApi).toHaveBeenCalledWith(
        '13800138000',
        'access-token',
        'me',
      )
      expect(mocks.addContact).toHaveBeenCalledWith('abc123', '你好')
    })

    it('兼容 chatUserName 嵌套在 data 字段下的响应', async () => {
      mocks.getUserByPhoneApi.mockResolvedValue({ data: { chatUserName: 'abc123' } })

      const { addByKeyword } = useContactAdd()
      await addByKeyword('13800138000')

      expect(mocks.addContact).toHaveBeenCalledWith('abc123', undefined)
    })

    it('accessToken 为空时回退使用 chatToken 鉴权', async () => {
      mocks.accessToken = ''
      mocks.getUserByPhoneApi.mockResolvedValue({ chatUserName: 'abc123' })

      const { addByKeyword } = useContactAdd()
      await addByKeyword('13800138000')

      expect(mocks.getUserByPhoneApi).toHaveBeenCalledWith('13800138000', 'chat-token', 'me')
    })

    it('App Server 返回用户不存在时提示用户存在性文案且不调用 SDK', async () => {
      mocks.getUserByPhoneApi.mockRejectedValue(new Error('UserId 13800138000 does not exist.'))

      const { addByKeyword } = useContactAdd()

      await expect(addByKeyword('13800138000')).rejects.toThrow('用户不存在')
      expect(mocks.addContact).not.toHaveBeenCalled()
    })

    it('App Server 返回空 chatUserName 时提示用户不存在', async () => {
      mocks.getUserByPhoneApi.mockResolvedValue({})

      const { addByKeyword } = useContactAdd()

      await expect(addByKeyword('13800138000')).rejects.toThrow(
        i18n.global.t('contacts.userNotExist'),
      )
      expect(mocks.addContact).not.toHaveBeenCalled()
    })

    it('解析结果是自己时拦截并提示不能添加自己', async () => {
      mocks.getUserByPhoneApi.mockResolvedValue({ chatUserName: 'me' })

      const { addByKeyword } = useContactAdd()

      await expect(addByKeyword('13800138000')).rejects.toThrow(
        i18n.global.t('contacts.addSelfError'),
      )
      expect(mocks.addContact).not.toHaveBeenCalled()
    })

    it('解析结果已是好友时前置拦截，不再调用 SDK 添加', async () => {
      mocks.getUserByPhoneApi.mockResolvedValue({ chatUserName: 'abc123' })
      mocks.contacts.push({ userId: 'abc123' })

      const { addByKeyword } = useContactAdd()

      await expect(addByKeyword('13800138000')).rejects.toThrow(
        i18n.global.t('contacts.alreadyFriend'),
      )
      expect(mocks.addContact).not.toHaveBeenCalled()
    })
  })

  describe('addContactWithCheck', () => {
    it('已是好友时前置拦截，不再调用 SDK 添加', async () => {
      mocks.contacts.push({ userId: 'abc123' })

      const { addContactWithCheck } = useContactAdd()

      await expect(addContactWithCheck('abc123')).rejects.toThrow(
        i18n.global.t('contacts.alreadyFriend'),
      )
      expect(mocks.addContact).not.toHaveBeenCalled()
    })

    it('SDK 查无此用户（error.type === 204）时提示用户不存在', async () => {
      mocks.addContact.mockRejectedValue({ type: 204, message: 'Service resource not found' })

      const { addContactWithCheck } = useContactAdd()

      await expect(addContactWithCheck('ghost')).rejects.toThrow(
        i18n.global.t('contacts.userNotExist'),
      )
    })

    it('透传验证消息并原样抛出其他 SDK 错误', async () => {
      const sdkError = new Error('request failed')
      mocks.addContact.mockRejectedValue(sdkError)

      const { addContactWithCheck } = useContactAdd()

      await expect(addContactWithCheck('abc123', '你好')).rejects.toThrow(sdkError)
      expect(mocks.addContact).toHaveBeenCalledWith('abc123', '你好')
    })
  })
})
