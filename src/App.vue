<script setup lang="ts">
import { computed } from 'vue'
import { EmUIKitProvider } from '@easemob/uikit-im'
import { getEffectiveAppKey } from '@/config/dev'
import { useTheme } from '@/composables/useTheme'

// UIKit 接入：appKey 优先取开发者本地配置，未配置时回退到环境变量；
// 均无配置时 Provider 不自动初始化 SDK，待登录逻辑通过 useClient().init(config) 显式初始化
const appKey = getEffectiveAppKey()

// Provider 主题与项目主题联动，确保 UIKit CSS 变量按 light/dark 生效
const { isDark } = useTheme()
const uikitTheme = computed(() => ({
  mode: isDark.value ? ('dark' as const) : ('light' as const),
}))
</script>

<template>
  <EmUIKitProvider :app-key="appKey" :auto-init="!!appKey" :theme="uikitTheme">
    <router-view />
  </EmUIKitProvider>
</template>
