import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useUserStore } from './user'

describe('user store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('初始状态为空', () => {
    const store = useUserStore()
    expect(store.token).toBe('')
    expect(store.userId).toBe('')
    expect(store.nickname).toBe('')
  })

  it('setToken 写入 token', () => {
    const store = useUserStore()
    store.setToken('abc')
    expect(store.token).toBe('abc')
  })

  it('reset 恢复初始状态', () => {
    const store = useUserStore()
    store.setToken('abc')
    store.userId = 'u1'
    store.reset()
    expect(store.token).toBe('')
    expect(store.userId).toBe('')
  })
})
