import { defineStore } from 'pinia'

interface UserState {
  token: string
  userId: string
  nickname: string
}

/** 用户信息占位，登录/IM 初始化逻辑后续补充 */
export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: '',
    userId: '',
    nickname: '',
  }),
  actions: {
    setToken(token: string) {
      this.token = token
    },
    reset() {
      this.$reset()
    },
  },
})
