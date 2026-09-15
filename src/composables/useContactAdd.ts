import { useContact, useUIKit } from '@easemob/uikit-im'

import { PHONE_REGEX } from '@/api/sms'
import { getUserByPhoneApi, mapPhoneQueryError } from '@/api/user'
import i18n from '@/locales'
import { useUserStore } from '@/store/modules/user'

/**
 * 添加联系人（单个输入框，支持手机号或环信用户 ID）：
 *
 * - addByKeyword：输入为手机号时先经 App Server（GET /inside/app/user/{phone}）解析为环信用户 ID，
 *   再拦截「添加自己」「已是好友」后走 SDK 发送好友申请；输入为普通用户 ID 时直接添加；
 * - addContactWithCheck：直接按环信 userId 添加，SDK 查无此用户（error.type === 204）
 *   时映射为「用户不存在」。
 *
 * 错误统一以抛错形式交给弹窗在错误区域展示。
 */
export function useContactAdd() {
  const { stores } = useUIKit()
  const { contactList, addContact } = useContact()

  /** 是否已是好友（UIKit 通讯录列表以 userId 为唯一标识） */
  function isAlreadyFriend(userId: string): boolean {
    return contactList.value.some((contact) => contact.userId === userId)
  }

  /** 添加前置检查：已是好友前置拦截，SDK 用户不存在错误做文案映射 */
  async function addContactWithCheck(userId: string, message?: string): Promise<void> {
    if (isAlreadyFriend(userId)) {
      throw new Error(i18n.global.t('contacts.alreadyFriend'))
    }
    try {
      await addContact(userId, message)
    } catch (error) {
      // SDK 查无此用户时 error.type 为 204
      if ((error as { type?: number })?.type === 204) {
        throw new Error(i18n.global.t('contacts.userNotExist'), { cause: error })
      }
      throw error
    }
  }

  /** 手机号解析为环信用户 ID（App Server 查询失败时做文案映射） */
  async function resolvePhone(phoneNumber: string): Promise<string> {
    const userStore = useUserStore()
    // 与官方 H5 Demo 对齐：Bearer 使用 SDK 登录返回的 accessToken，并携带 operator（当前用户 ID）
    const accessToken = userStore.accessToken || userStore.chatToken
    const operator = stores.client.currentUser
    let result
    try {
      result = await getUserByPhoneApi(phoneNumber, accessToken, operator)
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      throw new Error(mapPhoneQueryError(msg, phoneNumber), { cause: error })
    }
    const chatUserName = result?.chatUserName ?? result?.data?.chatUserName ?? ''
    if (!chatUserName) {
      throw new Error(i18n.global.t('contacts.userNotExist'))
    }
    return chatUserName
  }

  /** 手机号或用户 ID 添加联系人：手机号先解析为用户 ID，再走好友申请 */
  async function addByKeyword(keyword: string, message?: string): Promise<void> {
    const target = keyword.trim()
    if (!target) {
      throw new Error(i18n.global.t('contacts.addContact.errorRequired'))
    }
    const userId = PHONE_REGEX.test(target) ? await resolvePhone(target) : target
    if (userId === stores.client.currentUser) {
      throw new Error(i18n.global.t('contacts.addSelfError'))
    }
    await addContactWithCheck(userId, message || undefined)
  }

  return { addByKeyword, addContactWithCheck, isAlreadyFriend }
}
