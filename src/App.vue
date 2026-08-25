<script setup lang="ts">
import { EmUIKitProvider } from '@easemob/uikit-im'
import { getEffectiveAppKey } from '@/config/dev'

// UIKit 接入：appKey 优先取开发者本地配置，未配置时回退到环境变量；
// 均无配置时 Provider 不自动初始化 SDK，待登录逻辑通过 useClient().init(config) 显式初始化
const appKey = getEffectiveAppKey()
</script>

<template>
  <EmUIKitProvider :app-key="appKey" :auto-init="!!appKey">
    <router-view />
  </EmUIKitProvider>
</template>
