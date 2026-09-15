/** 开发者配置持久化：appKey / 私有服务器 / userId+token 等，保存后刷新页面生效 */

const DEV_CONFIG_KEY = 'easemob-demo-dev-config'
const DEV_PERSIST_KEY = 'easemob-demo-dev-persist'

export interface DevConfig {
  appKey: string
  imServer: string
  restServer: string
  usePrivateServer: boolean
  /** 开发者模式登录凭据 */
  devUserId: string
  devToken: string
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
  storageFor(persist)?.setItem(DEV_CONFIG_KEY, JSON.stringify(config))
  storageFor(prev)?.removeItem(DEV_CONFIG_KEY)

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

/** 实际生效的 appKey：开发者配置 > 环境变量 */
export function getEffectiveAppKey(): string {
  return getDevConfig().appKey || import.meta.env.VITE_APP_KEY || ''
}
