// 百度统计站点 ID：公开信息（任何访客查看页面源码均可见），非密钥，无需脱敏或走 env
const BAIDU_TONGJI_ID = 'fe4106b5ec311f704294a641def7bbb3'

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
