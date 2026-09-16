import { ref } from 'vue'

/**
 * 检测新版本 composable：轮询部署后 index.html 的 etag / last-modified 指纹，
 * 指纹变化即认为有新构建发布，配合弹窗引导用户刷新页面。
 * 参考 vben-admin 的 CheckUpdates 实现（请求 index.html 对比 ETag，无 PWA 依赖）。
 * 注意使用 GET 而非 HEAD：部分 CDN / 网关会拦截 HEAD 方法返回 403。
 */

export interface CheckUpdatesOptions {
  /** 轮询间隔（分钟），<= 0 时关闭自动轮询（仍可手动调用 checkForUpdates） */
  interval?: number
  /** 版本检测地址，默认 import.meta.env.BASE_URL（部署后的 index.html） */
  url?: string
}

/** 本地开发环境主机名：直接跳过检测，避免 dev server 频繁变动误报 */
const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1']

export function useCheckUpdates(options: CheckUpdatesOptions = {}) {
  const intervalMinutes = options.interval ?? 1
  const checkUrl = options.url ?? import.meta.env.BASE_URL

  /** 是否有新版本待刷新 */
  const hasUpdate = ref(false)
  /** 上次记录的资源指纹（基线），首次检查只记录、不提示 */
  const lastVersionTag = ref<string | null>(null)
  /** 检测到的新版本指纹 */
  const currentVersionTag = ref<string | null>(null)

  let timer: ReturnType<typeof setInterval> | null = null
  let isChecking = false

  /** 拉取检测地址的 etag / last-modified 作为版本指纹；本地开发与请求失败返回 null */
  async function getVersionTag(): Promise<string | null> {
    if (LOCAL_HOSTNAMES.includes(location.hostname)) return null
    try {
      const response = await fetch(checkUrl, {
        cache: 'no-cache',
        method: 'GET',
        redirect: 'manual',
      })
      return response.headers.get('etag') || response.headers.get('last-modified')
    } catch {
      return null
    }
  }

  /** 对比版本指纹：首次运行只记录基线，之后指纹变化即视为有新版本 */
  async function checkForUpdates(): Promise<void> {
    if (isChecking || hasUpdate.value) return
    isChecking = true
    try {
      const versionTag = await getVersionTag()
      if (!versionTag) return
      if (!lastVersionTag.value) {
        lastVersionTag.value = versionTag
        return
      }
      if (lastVersionTag.value !== versionTag) {
        stopPolling()
        currentVersionTag.value = versionTag
        hasUpdate.value = true
      }
    } finally {
      isChecking = false
    }
  }

  function clearTimer() {
    if (timer !== null) {
      clearInterval(timer)
      timer = null
    }
  }

  function stopPolling() {
    clearTimer()
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }

  /** 页面隐藏时暂停轮询，回到前台立即检查一次并恢复轮询 */
  function handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      clearTimer()
      return
    }
    void checkForUpdates()
    if (timer === null && intervalMinutes > 0 && !hasUpdate.value) {
      timer = setInterval(() => void checkForUpdates(), intervalMinutes * 60 * 1000)
    }
  }

  /** 开始轮询：立即检查一次，之后按间隔定时检查 */
  function startPolling() {
    if (intervalMinutes <= 0) return
    stopPolling()
    void checkForUpdates()
    timer = setInterval(() => void checkForUpdates(), intervalMinutes * 60 * 1000)
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }

  /** 确认刷新：先把基线更新为当前版本，再重载页面获取新版本资源 */
  function confirmUpdate() {
    lastVersionTag.value = currentVersionTag.value
    location.reload()
  }

  return { hasUpdate, checkForUpdates, startPolling, stopPolling, confirmUpdate }
}
