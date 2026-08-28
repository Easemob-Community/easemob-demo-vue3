import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useUserStore } from './user'

describe('user store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    sessionStorage.clear()
  })

  it('初始状态为空', () => {
    const store = useUserStore()
    expect(store.token).toBe('')
    expect(store.userId).toBe('')
    expect(store.nickname).toBe('')
    expect(store.phoneNumber).toBe('')
    expect(store.chatToken).toBe('')
    expect(store.accessToken).toBe('')
    expect(store.loginMode).toBe('')
  })

  it('setToken 写入 token', () => {
    const store = useUserStore()
    store.setToken('abc')
    expect(store.token).toBe('abc')
  })

  it('可写入手机号与各类 token', () => {
    const store = useUserStore()
    store.setPhoneNumber('13800000000')
    store.setChatToken('ct')
    store.setAccessToken('at')
    expect(store.phoneNumber).toBe('13800000000')
    expect(store.chatToken).toBe('ct')
    expect(store.accessToken).toBe('at')
  })

  it('persistToStorage / restoreFromStorage 与 sessionStorage 同步', () => {
    const store = useUserStore()
    store.setToken('tk')
    store.setUserId('uid')
    store.setPhoneNumber('13800000000')
    store.setChatToken('ct')
    store.setAccessToken('at')
    store.setLoginMode('phone')
    store.persistToStorage()

    expect(sessionStorage.getItem('webImAuth')).toContain('13800000000')

    const another = useUserStore()
    another.restoreFromStorage()
    expect(another.token).toBe('tk')
    expect(another.userId).toBe('uid')
    expect(another.phoneNumber).toBe('13800000000')
    expect(another.chatToken).toBe('ct')
    expect(another.accessToken).toBe('at')
    expect(another.loginMode).toBe('phone')
  })

  it('reset 恢复初始状态并清除 sessionStorage', () => {
    const store = useUserStore()
    store.setToken('abc')
    store.setUserId('u1')
    store.setPhoneNumber('13800000000')
    store.persistToStorage()
    store.reset()
    expect(store.token).toBe('')
    expect(store.userId).toBe('')
    expect(store.phoneNumber).toBe('')
    expect(sessionStorage.getItem('webImAuth')).toBeNull()
  })
})
