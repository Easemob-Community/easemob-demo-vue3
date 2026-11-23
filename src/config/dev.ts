/** 开发者配置持久化：AppKey 或 AppID / 私有服务器 / userId+token 等，保存后刷新页面生效 */

const DEV_CONFIG_KEY = 'easemob-demo-dev-config'
const DEV_PERSIST_KEY = 'easemob-demo-dev-persist'
const DEV_MODE_KEY = 'easemob-demo-dev-mode'

export interface DevConfig {
  /** 应用标识：org#app 格式的 AppKey，或 32 位 AppID（沿用原存储字段以兼容已有配置） */
  appKey: string
  imServer: string
  restServer: string
  usePrivateServer: boolean
  /** 开发者模式登录凭据 */
  devUserId: string
  devToken: string
}

export type SDKLoginMode = 'dev' | 'phone'

export interface ServerUrls {
  restApiUrl: string
  wsUrl: string
}

export interface SDKInitConfig {
  appKey?: string
  appId?: string
  serverUrls?: ServerUrls
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function normalizeConfig(parsed: Partial<DevConfig>): DevConfig {
  return {
    appKey: parsed.appKey ?? '',
    imServer: parsed.imServer ?? '',
    restServer: parsed.restServer ?? '',
    usePrivateServer: parsed.usePrivateServer ?? false,
    devUserId: parsed.devUserId ?? '',
    devToken: parsed.devToken ?? '',
  }
}

/** 按持久化开关选择存储：true → localStorage，false → sessionStorage */
function storageFor(persist: boolean): Storage | null {
  if (typeof window === 'undefined') return null
  return persist ? window.localStorage : window.sessionStorage
}

/** 是否持久化配置：默认 true（localStorage）；关闭后改用 sessionStorage（刷新保留、关闭浏览器即丢） */
export function getPersistEnabled(): boolean {
  if (typeof localStorage === 'undefined') return true
  return localStorage.getItem(DEV_PERSIST_KEY) !== 'false'
}

/** 切换持久化开关：把现有配置迁移到目标存储，并清理旧存储 */
export function setPersistEnabled(persist: boolean) {
  const prev = getPersistEnabled()
  if (prev === persist) return

  const raw = storageFor(prev)?.getItem(DEV_CONFIG_KEY) ?? null
  const config = normalizeConfig(safeParse<Partial<DevConfig>>(raw, {}))
  const devMode = storageFor(prev)?.getItem(DEV_MODE_KEY) ?? null
  storageFor(persist)?.setItem(DEV_CONFIG_KEY, JSON.stringify(config))
  if (devMode === null) {
    storageFor(persist)?.removeItem(DEV_MODE_KEY)
  } else {
    storageFor(persist)?.setItem(DEV_MODE_KEY, devMode)
  }
  storageFor(prev)?.removeItem(DEV_CONFIG_KEY)
  storageFor(prev)?.removeItem(DEV_MODE_KEY)

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(DEV_PERSIST_KEY, String(persist))
  }
}

export function getDevConfig(): DevConfig {
  const raw = storageFor(getPersistEnabled())?.getItem(DEV_CONFIG_KEY) ?? null
  return normalizeConfig(safeParse<Partial<DevConfig>>(raw, {}))
}

export function setDevConfig(config: DevConfig) {
  storageFor(getPersistEnabled())?.setItem(DEV_CONFIG_KEY, JSON.stringify(config))
}

export function getDevModeEnabled(): boolean | null {
  const value = storageFor(getPersistEnabled())?.getItem(DEV_MODE_KEY) ?? null
  if (value === 'true') return true
  if (value === 'false') return false
  return null
}

export function setDevModeEnabled(enabled: boolean) {
  storageFor(getPersistEnabled())?.setItem(DEV_MODE_KEY, String(enabled))
}

function isValidUrlProtocol(value: string, protocols: string[]): boolean {
  try {
    const url = new URL(value)
    return Boolean(url.hostname) && protocols.includes(url.protocol)
  } catch {
    return false
  }
}

export function isValidRestServerUrl(value: string): boolean {
  return isValidUrlProtocol(value.trim(), ['http:', 'https:'])
}

export function isValidWebSocketUrl(value: string): boolean {
  return isValidUrlProtocol(value.trim(), ['ws:', 'wss:'])
}

export function isAppId(value: string): boolean {
  return /^[0-9a-f]{32}$/i.test(value.trim())
}

export function isValidAppKey(value: string): boolean {
  return /^[^#\s]+#[^#\s]+$/.test(value.trim())
}

/** 默认登录只使用官方环境配置；dev 登录读取自定义 AppKey 或 AppID，私有服务器仅支持 AppKey */
export function getSDKInitConfig(mode: SDKLoginMode): SDKInitConfig {
  const defaultAppKey = import.meta.env.VITE_APP_KEY || ''
  if (mode === 'phone') return { appKey: defaultAppKey }

  const config = getDevConfig()
  const appIdentity = config.appKey.trim() || defaultAppKey
  if (isAppId(appIdentity)) return { appId: appIdentity }

  const appKey = appIdentity
  if (!config.usePrivateServer) return { appKey }

  const restApiUrl = config.restServer.trim()
  const wsUrl = config.imServer.trim()
  return { appKey, serverUrls: { restApiUrl, wsUrl } }
}
