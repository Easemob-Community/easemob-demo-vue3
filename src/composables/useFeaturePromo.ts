import { ref } from 'vue'

/**
 * navbar 特性入口的诱导展示状态，模块级单例全局共享。
 *
 * 交互约定：每次登录成功后调用 `resetOnLogin()` 重置，红点与广告弹层默认展示；
 * 点击特性图标后红点消失；广告弹层点右上角关闭后本次登录内不再展示，
 * 下一次登录再次展示（状态为内存态，刷新页面后需重新登录才会再次触发）。
 */

/** 特性图标右下角的诱导红点 */
const showRedDot = ref(false)

/** 特性广告弹层（定位在特性图标右侧） */
const showPromo = ref(false)

/** 登录成功后调用：重置本次登录的诱导展示状态 */
function resetOnLogin() {
  showRedDot.value = true
  showPromo.value = true
}

/** 点击特性图标后隐藏红点 */
function dismissRedDot() {
  showRedDot.value = false
}

/** 关闭广告弹层（本次登录内不再展示） */
function closePromo() {
  showPromo.value = false
}

export function useFeaturePromo() {
  return { showRedDot, showPromo, resetOnLogin, dismissRedDot, closePromo }
}
