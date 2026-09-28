// 百度统计站点 ID：公开信息（任何访客查看页面源码均可见），非密钥，无需脱敏或走 env
const BAIDU_TONGJI_ID = 'fe4106b5ec311f704294a641def7bbb3'

declare global {
  interface Window {
    /** 百度统计全局队列（hm.js 读取；脚本未加载/被拦截时为 undefined，调用侧用可选链守卫） */
    _hmt?: [string, ...unknown[]][]
  }
}

// 加载百度统计脚本，仅生产环境生效（开发环境不计入统计）。
// 用动态 script 而非 index.html 内联片段：CSP 的 script-src 无 'unsafe-inline'，内联脚本会被拦截；
// 外链脚本由 script-src 的 hm.baidu.com 白名单放行，上报走 image beacon（img-src 已含 https: 通配）。
export function setupBaiduAnalytics(): void {
  if (!import.meta.env.PROD) return
  const script = document.createElement('script')
  script.src = `https://hm.baidu.com/hm.js?${BAIDU_TONGJI_ID}`
  script.async = true
  document.head.appendChild(script)
}

/**
 * SPA 路由切换手动上报 pageview：hm.js 只自动统计首次加载，
 * 后续路由切换需在 router.afterEach 中显式调用（首次导航跳过，避免与自动上报重复计数）
 */
export function trackPageview(path: string): void {
  if (!import.meta.env.PROD) return
  window._hmt?.push(['_trackPageview', path])
}

/**
 * 自定义事件上报：以「虚拟页面」pageview 形式推送到 `/event/<category>/<action>[/<label>]`。
 * 原因：百度统计 2024-02 起「事件分析」报表转为付费功能，免费版仅「受访页面」报表可见，
 * 故事件伪装成 /event/ 前缀的虚拟页面路径，报表内按该前缀过滤即可与真实页面区分。
 * 仅生产环境生效；hm.js 未加载或被广告拦截时静默跳过
 */
export function trackEvent(category: string, action: string, label?: string): void {
  if (!import.meta.env.PROD) return
  window._hmt?.push(['_trackPageview', toVirtualEventPath(category, action, label)])
}

/** 事件参数拼虚拟页面路径；/ ? # 空白等会破坏路径结构的字符统一替换为 -，单段截断防超长 */
function toVirtualEventPath(category: string, action: string, label?: string): string {
  const seg = (s: string) => s.replace(/[/?#\s]+/g, '-').slice(0, 60)
  const safeLabel = label ? seg(label) : ''
  return `/event/${seg(category)}/${seg(action)}${safeLabel ? `/${safeLabel}` : ''}`
}
