import { ref } from 'vue'

/**
 * 设置抽屉（layout 右侧滑出容器）开关状态，模块级单例全局共享。
 *
 * 供后续 UIKit 特性按钮调用 `open()` 触发，抽屉本身渲染在 `src/layout/index.vue`，
 * 以挤占（flex 兄弟节点宽度动画）而非遮盖的方式展开。
 */

/** 抽屉是否展开 */
const isOpen = ref(false)

function open() {
  isOpen.value = true
}

function close() {
  isOpen.value = false
}

function toggle() {
  isOpen.value = !isOpen.value
}

export function useSettingsDrawer() {
  return { isOpen, open, close, toggle }
}
