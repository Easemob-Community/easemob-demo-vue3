import { useContact } from '@easemob/uikit-im'
import type { UiContact } from '@easemob/uikit-core'

import { PHONE_REGEX } from '@/api/sms'
import { getUserByPhoneApi } from '@/api/user'
import i18n from '@/locales'
import { useUserStore } from '@/store/modules/user'

/**
 * 添加好友弹窗（EmAddContactModal）的搜索 / 添加注入，复刻 React Demo
 * 「手机号 / 用户 ID 添加联系人」能力（UIKit 内只认环信 userId）：
 *
 * - searchFn：关键字为手机号时，先经 App Server 把手机号置换为环信 userId 再作为候选返回；
 *   其他关键字视为环信用户 ID，直接作为候选返回，由弹窗确认后走 SDK 添加。
 * - addFn：添加前拦截「已是好友」；SDK 查无此用户（error.type === 204）时映射为「用户不存在」。
 *   错误统一以抛错形式交给弹窗在错误区域展示。
 */
export function useContactSearch() {
  const userStore = useUserStore()
  const { contactList, addContact } = useContact()

  /** 是否已是好友（UIKit 通讯录列表以 userId 为唯一标识） */
  function isAlreadyFriend(userId: string): boolean {
    return contactList.value.some((contact) => contact.userId === userId)
  }

  /** EmAddContactModal 的 search-fn 注入：手机号 → App Server 置换 userId，其余按 userId 处理 */
  async function searchContacts(keyword: string): Promise<UiContact[]> {
    const key = keyword.trim()
    if (!key) return []
    if (!PHONE_REGEX.test(key)) {
      return [{ userId: key }]
    }
    try {
      const result = await getUserByPhoneApi(key, userStore.userId, userStore.chatToken)
      if (result.code === 200 && result.chatUserName) {
        return [{ userId: result.chatUserName, phone: key }]
      }
    } catch (error) {
      // 请求失败与查无用户统一按「用户不存在」提示
      throw new Error(i18n.global.t('contacts.userNotExist'), { cause: error })
    }
    throw new Error(i18n.global.t('contacts.userNotExist'))
  }

  /** EmAddContactModal 的 add-fn 注入：已是好友前置拦截，SDK 用户不存在错误做文案映射 */
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

  return { searchContacts, addContactWithCheck, isAlreadyFriend }
}
