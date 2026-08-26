import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  getDevConfig,
  getEffectiveAppKey,
  getPersistEnabled,
  setDevConfig,
  setPersistEnabled,
} from './dev'

const CONFIG_KEY = 'easemob-demo-dev-config'
const PERSIST_KEY = 'easemob-demo-dev-persist'

describe('dev 配置持久化', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('默认持久化到 localStorage', () => {
    expect(getPersistEnabled()).toBe(true)
    setDevConfig({ ...getDevConfig(), appKey: 'foo#bar' })
    expect(localStorage.getItem(CONFIG_KEY)).toContain('foo#bar')
    expect(sessionStorage.getItem(CONFIG_KEY)).toBeNull()
  })

  it('关闭持久化后迁移到 sessionStorage，并清理 localStorage 配置', () => {
    setDevConfig({ ...getDevConfig(), appKey: 'foo#bar' })
    setPersistEnabled(false)

    expect(getPersistEnabled()).toBe(false)
    expect(localStorage.getItem(PERSIST_KEY)).toBe('false')
    expect(localStorage.getItem(CONFIG_KEY)).toBeNull()
    expect(sessionStorage.getItem(CONFIG_KEY)).toContain('foo#bar')
    expect(getDevConfig().appKey).toBe('foo#bar')
  })

  it('重新开启持久化会把 sessionStorage 配置迁回 localStorage', () => {
    setPersistEnabled(false)
    setDevConfig({ ...getDevConfig(), appKey: 'bar#baz' })

    setPersistEnabled(true)

    expect(getPersistEnabled()).toBe(true)
    expect(sessionStorage.getItem(CONFIG_KEY)).toBeNull()
    expect(localStorage.getItem(CONFIG_KEY)).toContain('bar#baz')
  })

  it('关闭持久化时 getEffectiveAppKey 仍能读到 sessionStorage 配置', () => {
    setPersistEnabled(false)
    setDevConfig({ ...getDevConfig(), appKey: 'qux#quux' })

    expect(getEffectiveAppKey()).toBe('qux#quux')
  })
})
