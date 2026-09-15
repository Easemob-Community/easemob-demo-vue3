import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import i18n from '@/locales'
import { useUserStore } from '@/store/modules/user'

const mocks = vi.hoisted(() => ({
  getUserByPhoneApi: vi.fn(),
  addContact: vi.fn(),
  contacts: [] as { userId: string }[],
}))

vi.mock('@/api/user', () => ({
  getUserByPhoneApi: mocks.getUserByPhoneApi,
}))

vi.mock('@easemob/uikit-im', () => ({
  useContact: () => ({
    contactList: { value: mocks.contacts },
    addContact: mocks.addContact,
  }),
}))

import { useContactSearch } from '@/composables/useContactSearch'

describe('useContactSearch', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mocks.contacts.length = 0
    const userStore = useUserStore()
    userStore.setUserId('me')
    userStore.setChatToken('chat-token')
  })

  describe('searchContacts', () => {
    it('空关键字返回空数组', async () => {
      const { searchContacts } = useContactSearch()

      await expect(searchContacts('   ')).resolves.toEqual([])
      expect(mocks.getUserByPhoneApi).not.toHaveBeenCalled()
    })

    it('非手机号关键字按用户 ID 处理，直接作为候选返回', async () => {
      const { searchContacts } = useContactSearch()

      await expect(searchContacts(' zhangsan ')).resolves.toEqual([{ userId: 'zhangsan' }])
      expect(mocks.getUserByPhoneApi).not.toHaveBeenCalled()
    })

    it('手机号经 App Server 置换为环信 userId 后返回', async () => {
      mocks.getUserByPhoneApi.mockResolvedValue({ code: 200, chatUserName: 'abc123' })

      const { searchContacts } = useContactSearch()
      const result = await searchContacts('13800138000')

      expect(mocks.getUserByPhoneApi).toHaveBeenCalledWith('13800138000', 'me', 'chat-token')
      expect(result).toEqual([{ userId: 'abc123', phone: '13800138000' }])
    })

    it('业务码非 200 时提示用户不存在', async () => {
      mocks.getUserByPhoneApi.mockResolvedValue({ code: 404, chatUserName: '' })

      const { searchContacts } = useContactSearch()

      await expect(searchContacts('13800138000')).rejects.toThrow(
        i18n.global.t('contacts.userNotExist'),
      )
    })

    it('请求失败时提示用户不存在', async () => {
      mocks.getUserByPhoneApi.mockRejectedValue(new Error('network error'))

      const { searchContacts } = useContactSearch()

      await expect(searchContacts('13800138000')).rejects.toThrow(
        i18n.global.t('contacts.userNotExist'),
      )
    })
  })

  describe('addContactWithCheck', () => {
    it('已是好友时前置拦截，不再调用 SDK 添加', async () => {
      mocks.contacts.push({ userId: 'abc123' })

      const { addContactWithCheck } = useContactSearch()

      await expect(addContactWithCheck('abc123')).rejects.toThrow(
        i18n.global.t('contacts.alreadyFriend'),
      )
      expect(mocks.addContact).not.toHaveBeenCalled()
    })

    it('SDK 查无此用户（error.type === 204）时提示用户不存在', async () => {
      mocks.addContact.mockRejectedValue({ type: 204, message: 'Service resource not found' })

      const { addContactWithCheck } = useContactSearch()

      await expect(addContactWithCheck('ghost')).rejects.toThrow(
        i18n.global.t('contacts.userNotExist'),
      )
    })

    it('透传验证消息并原样抛出其他 SDK 错误', async () => {
      const sdkError = new Error('request failed')
      mocks.addContact.mockRejectedValue(sdkError)

      const { addContactWithCheck } = useContactSearch()

      await expect(addContactWithCheck('abc123', '你好')).rejects.toThrow(sdkError)
      expect(mocks.addContact).toHaveBeenCalledWith('abc123', '你好')
    })
  })
})
