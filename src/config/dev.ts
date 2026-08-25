/** 开发者配置持久化：appKey / 私有服务器等，保存后刷新页面生效 */

const DEV_CONFIG_KEY = 'easemob-demo-dev-config'

export interface DevConfig {
  appKey: string
  imServer: string
  restServer: string
  useCustomServer: boolean
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

export function getDevConfig(): DevConfig {
  const parsed = safeParse<Partial<DevConfig>>(
    typeof localStorage !== 'undefined' ? localStorage.getItem(DEV_CONFIG_KEY) : null,
    {},
  )
  return {
    appKey: parsed.appKey ?? '',
    imServer: parsed.imServer ?? '',
    restServer: parsed.restServer ?? '',
    useCustomServer: parsed.useCustomServer ?? false,
    usePrivateServer: parsed.usePrivateServer ?? false,
    devUserId: parsed.devUserId ?? '',
    devToken: parsed.devToken ?? '',
  }
}

export function setDevConfig(config: DevConfig) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(DEV_CONFIG_KEY, JSON.stringify(config))
  }
}

/** 实际生效的 appKey：开发者配置 > 环境变量 */
export function getEffectiveAppKey(): string {
  return getDevConfig().appKey || import.meta.env.VITE_APP_KEY || ''
}
