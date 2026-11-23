import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  getDevConfig,
  getDevModeEnabled,
  getPersistEnabled,
  getSDKInitConfig,
  isValidRestServerUrl,
  isValidWebSocketUrl,
  setDevConfig,
  setDevModeEnabled,
  setPersistEnabled,
} from '@/config/dev'

const CONFIG_KEY = 'easemob-demo-dev-config'
const PERSIST_KEY = 'easemob-demo-dev-persist'

describe('dev 配置持久化', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
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

  it('关闭持久化时 dev 模式仍能读到 sessionStorage 配置', () => {
    vi.stubEnv('VITE_APP_KEY', 'default#app')
    setPersistEnabled(false)
    setDevConfig({ ...getDevConfig(), appKey: 'qux#quux' })

    expect(getSDKInitConfig('dev').appKey).toBe('qux#quux')
  })
})

describe('SDK 初始化配置按登录模式隔离', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.stubEnv('VITE_APP_KEY', 'default#app')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    localStorage.clear()
    sessionStorage.clear()
  })

  it('默认手机号模式只使用环境 AppKey，并忽略 dev 私有配置', () => {
    setDevConfig({
      ...getDevConfig(),
      appKey: 'custom#app',
      usePrivateServer: true,
      imServer: 'invalid',
      restServer: '',
    })

    expect(getSDKInitConfig('phone')).toEqual({ appKey: 'default#app' })
  })

  it('dev 模式优先自定义 AppKey，并在开启私有服务器时返回固定地址', () => {
    setDevConfig({
      ...getDevConfig(),
      appKey: 'custom#app',
      usePrivateServer: true,
      imServer: ' wss://im.example.com/ws ',
      restServer: ' https://rest.example.com/api ',
    })

    expect(getSDKInitConfig('dev')).toEqual({
      appKey: 'custom#app',
      serverUrls: {
        restApiUrl: 'https://rest.example.com/api',
        wsUrl: 'wss://im.example.com/ws',
      },
    })
  })

  it('dev 模式识别 32 位 AppID，并且不返回私有服务器地址', () => {
    const appId = 'fdde6bc4ae6841a9b874be1b7ad0a8ff'
    setDevConfig({
      ...getDevConfig(),
      appKey: ` ${appId} `,
      usePrivateServer: true,
      imServer: 'wss://im.example.com/ws',
      restServer: 'https://rest.example.com/api',
    })

    expect(getSDKInitConfig('dev')).toEqual({ appId })
  })

  it('dev AppKey 为空时回退环境 AppKey，私有开关关闭时忽略残留地址', () => {
    setDevConfig({
      ...getDevConfig(),
      appKey: '',
      usePrivateServer: false,
      imServer: 'invalid',
      restServer: 'invalid',
    })

    expect(getSDKInitConfig('dev')).toEqual({ appKey: 'default#app' })
  })

  it.each([
    { imServer: '', restServer: 'https://rest.example.com' },
    { imServer: 'im.example.com', restServer: 'https://rest.example.com' },
    { imServer: 'wss://im.example.com', restServer: 'rest.example.com' },
    { imServer: 'https://im.example.com', restServer: 'wss://rest.example.com' },
  ])('配置选择阶段安全组装旧私有地址，由初始化边界校验：%j', ({ imServer, restServer }) => {
    setDevConfig({
      ...getDevConfig(),
      appKey: 'custom#app',
      usePrivateServer: true,
      imServer,
      restServer,
    })

    expect(getSDKInitConfig('dev')).toEqual({
      appKey: 'custom#app',
      serverUrls: { restApiUrl: restServer.trim(), wsUrl: imServer.trim() },
    })
  })

  it('校验 REST 与 WebSocket 完整 URL 的协议', () => {
    expect(isValidRestServerUrl('http://rest.example.com')).toBe(true)
    expect(isValidRestServerUrl('https://rest.example.com/api')).toBe(true)
    expect(isValidRestServerUrl('wss://rest.example.com')).toBe(false)
    expect(isValidRestServerUrl('rest.example.com')).toBe(false)
    expect(isValidWebSocketUrl('ws://im.example.com')).toBe(true)
    expect(isValidWebSocketUrl('wss://im.example.com/ws')).toBe(true)
    expect(isValidWebSocketUrl('https://im.example.com')).toBe(false)
    expect(isValidWebSocketUrl('im.example.com')).toBe(false)
  })
})


describe('dev 模式开关持久化', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('无记录时返回 null，开启后默认写入 localStorage', () => {
    expect(getDevModeEnabled()).toBeNull()

    setDevModeEnabled(true)

    expect(getDevModeEnabled()).toBe(true)
    expect(localStorage.getItem('easemob-demo-dev-mode')).toBe('true')
    expect(sessionStorage.getItem('easemob-demo-dev-mode')).toBeNull()
  })

  it('跟随持久化开关迁移到 sessionStorage，主动退出保留 false 记录', () => {
    setDevModeEnabled(true)
    setPersistEnabled(false)

    expect(localStorage.getItem('easemob-demo-dev-mode')).toBeNull()
    expect(sessionStorage.getItem('easemob-demo-dev-mode')).toBe('true')
    expect(getDevModeEnabled()).toBe(true)

    setDevModeEnabled(false)
    expect(getDevModeEnabled()).toBe(false)

    setPersistEnabled(true)
    expect(sessionStorage.getItem('easemob-demo-dev-mode')).toBeNull()
    expect(localStorage.getItem('easemob-demo-dev-mode')).toBe('false')
    expect(getDevModeEnabled()).toBe(false)
  })
})
