<script setup lang="ts">
import { EmUIKitProvider } from '@easemob/uikit-im'

// UIKit 接入：appKey 走环境变量（格式 xxxx#xxxx）；未配置时 Provider 不初始化 SDK，
// 登录逻辑接入后再通过 useClient().init(config) 显式初始化
const appKey = import.meta.env.VITE_APP_KEY || ''
</script>

<template>
  <EmUIKitProvider :app-key="appKey" :auto-init="!!appKey">
    <router-view />
  </EmUIKitProvider>
</template>
