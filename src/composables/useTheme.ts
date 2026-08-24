import { usePreferredDark, useStorage } from '@vueuse/core'
import { computed, watch } from 'vue'

/** 主题模式：浅色 / 深色 / 跟随系统 */
export type ThemeMode = 'light' | 'dark' | 'auto'

const mode = useStorage<ThemeMode>('app-theme-mode', 'auto')
const preferredDark = usePreferredDark()

const isDark = computed(() => (mode.value === 'auto' ? preferredDark.value : mode.value === 'dark'))

// 模块加载即生效：同步 <html class="dark">、color-scheme 与 H5 状态栏主题色
watch(
  isDark,
  (dark) => {
    const root = document.documentElement
    root.classList.toggle('dark', dark)
    root.style.colorScheme = dark ? 'dark' : 'light'
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', dark ? '#141414' : '#ffffff')
  },
  { immediate: true },
)

export function useTheme() {
  function setMode(value: ThemeMode) {
    mode.value = value
  }

  return { mode, isDark, setMode }
}
