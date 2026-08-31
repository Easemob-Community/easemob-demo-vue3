import { defineStore } from 'pinia'

/** 登录凭证在 sessionStorage 中的 key，与 React Demo 保持一致 */
const WEB_IM_AUTH_KEY = 'webImAuth'

interface UserState {
  token: string
  userId: string
  nickname: string
  /** 登录手机号，注销账户时使用 */
  phoneNumber: string
  /** 短信验证码登录时使用的验证码，短期凭证随登录态一起持久化 */
  smsCode: string
  /** IM 登录返回的 chatToken，注销账户鉴权使用 */
  chatToken: string
  /** SDK 登录后的 accessToken，用于头像上传等 REST 接口鉴权 */
  accessToken: string
  /** 登录模式：dev 为开发者模式，phone 为手机号模式 */
  loginMode: 'dev' | 'phone' | ''
}

/** 从 sessionStorage 恢复登录凭证 */
function readAuthFromStorage(): Partial<UserState> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = sessionStorage.getItem(WEB_IM_AUTH_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Partial<UserState>
    return parsed
  } catch {
    return {}
  }
}

/** 用户信息占位，登录/IM 初始化逻辑后续补充 */
export const useUserStore = defineStore('user', {
  state: (): UserState => {
    const persisted = readAuthFromStorage()
    return {
      token: persisted.token ?? '',
      userId: persisted.userId ?? '',
      nickname: persisted.nickname ?? '',
      phoneNumber: persisted.phoneNumber ?? '',
      smsCode: persisted.smsCode ?? '',
      chatToken: persisted.chatToken ?? '',
      accessToken: persisted.accessToken ?? '',
      loginMode: (persisted.loginMode as UserState['loginMode']) ?? '',
    }
  },
  actions: {
    setToken(token: string) {
      this.token = token
    },
    setUserId(userId: string) {
      this.userId = userId
    },
    setNickname(nickname: string) {
      this.nickname = nickname
    },
    setPhoneNumber(phoneNumber: string) {
      this.phoneNumber = phoneNumber
    },
    setSmsCode(smsCode: string) {
      this.smsCode = smsCode
    },
    setChatToken(token: string) {
      this.chatToken = token
    },
    setAccessToken(token: string) {
      this.accessToken = token
    },
    setLoginMode(mode: UserState['loginMode']) {
      this.loginMode = mode
    },
    /** 将当前登录态持久化到 sessionStorage */
    persistToStorage() {
      if (typeof window === 'undefined') return
      const payload: Partial<UserState> = {
        token: this.token,
        userId: this.userId,
        nickname: this.nickname,
        phoneNumber: this.phoneNumber,
        smsCode: this.smsCode,
        chatToken: this.chatToken,
        accessToken: this.accessToken,
        loginMode: this.loginMode,
      }
      sessionStorage.setItem(WEB_IM_AUTH_KEY, JSON.stringify(payload))
    },
    /** 从 sessionStorage 恢复登录态 */
    restoreFromStorage() {
      const persisted = readAuthFromStorage()
      this.token = persisted.token ?? ''
      this.userId = persisted.userId ?? ''
      this.nickname = persisted.nickname ?? ''
      this.phoneNumber = persisted.phoneNumber ?? ''
      this.smsCode = persisted.smsCode ?? ''
      this.chatToken = persisted.chatToken ?? ''
      this.accessToken = persisted.accessToken ?? ''
      this.loginMode = (persisted.loginMode as UserState['loginMode']) ?? ''
    },
    reset() {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(WEB_IM_AUTH_KEY)
      }
      this.$reset()
    },
  },
})
