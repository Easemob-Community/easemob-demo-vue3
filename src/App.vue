<script setup lang="ts">
import { EmUIKitProvider } from '@easemob/uikit-im'
import { DEMO_PROVIDER_CONFIG } from '@/config/demo'
import { getEffectiveAppKey } from '@/config/dev'
import { useUIKitConfig } from '@/composables/useUIKitConfig'

// UIKit 接入：appKey 优先取开发者本地配置，未配置时回退到环境变量；
// 均无配置时 Provider 不自动初始化 SDK，待登录逻辑通过 useClient().init(config) 显式初始化
const appKey = getEffectiveAppKey()

// UIKit 与 Demo 本体联动：语言（en-US → en）与主题（light/dark）
const { uikitLocale, uikitTheme } = useUIKitConfig()
</script>

<template>
  <EmUIKitProvider
    :app-key="appKey"
    :auto-init="!!appKey"
    :locale="uikitLocale"
    :theme="uikitTheme"
    :enable-presence="DEMO_PROVIDER_CONFIG.enablePresence"
    :enable-blocklist="DEMO_PROVIDER_CONFIG.enableBlocklist"
  >
    <router-view />
  </EmUIKitProvider>
</template>
