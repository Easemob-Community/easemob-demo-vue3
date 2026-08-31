<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { EmUIKitProvider } from '@easemob/uikit-im'
import type { UIKitDataSource } from '@easemob/uikit-im'

import AppInitializer from '@/components/AppInitializer.vue'
import { DEMO_CUSTOM_CONTACTS } from '@/config/demo'
import { getEffectiveAppKey } from '@/config/dev'
import { useDemoSettings } from '@/composables/useDemoSettings'
import { useUIKitConfig } from '@/composables/useUIKitConfig'
import { useUserStore } from '@/store/modules/user'

// UIKit 接入：appKey 优先取开发者本地配置，未配置时回退到环境变量；
// 均无配置时 Provider 不自动初始化 SDK，待登录逻辑通过 useClient().init(config) 显式初始化
const appKey = getEffectiveAppKey()

const userStore = useUserStore()
const router = useRouter()

/** Token 过期：清理登录态并返回登录页 */
function handleTokenExpired() {
  userStore.reset()
  router.replace('/login')
}

// UIKit 与 Demo 本体联动：语言（en-US → en）与主题（light/dark）
const { uikitLocale, uikitTheme } = useUIKitConfig()

/* ===== Provider 能力开关（由「UIKIT特性开关 - Provider」面板驱动，默认全部开启） =====
 * 注意：这些开关在 Provider 挂载时读取，登录后修改需重新登录（或刷新页面）才能完整生效。
 */
const {
  providerEnableContact,
  providerEnableBlocklist,
  providerEnablePresence,
  providerEnableDraft,
  // 面板标签为 enableMotion，实际映射 Provider 的 enableAtMe
  providerEnableMotion,
  providerEnableTyping,
  providerEnableFetchContacts,
  providerEnableGroup,
  providerEnableUserInfo,
  providerEnableUserInfoSubscription,
  providerFilterBlockedContacts,
  providerEnableToast,
  providerContactFetchMode,
  noticeConfig,
  logCollectionEnabled,
  uikitLogLevel,
  sdkLogLevel,
} = useDemoSettings()

/** 日志持久化配置（由「日志获取」面板驱动） */
const loggerConfig = computed(() => ({
  collectSdkLog: logCollectionEnabled.value,
  uikitLevel: uikitLogLevel.value,
  sdkLevel: sdkLogLevel.value,
}))

/**
 * 自定义数据源：开启后拉取好友走示例接口（返回 Alice / Bob），否则不注入、走 SDK 默认。
 * UIKitDataSource 字段均可选，仅注入 fetchContacts 即可被业务接管。
 */
const providerDataSource = computed<UIKitDataSource | undefined>(() =>
  providerEnableFetchContacts.value
    ? {
        fetchContacts: async () => ({ list: DEMO_CUSTOM_CONTACTS, hasMore: false }),
      }
    : undefined,
)
</script>

<template>
  <EmUIKitProvider
    :app-key="appKey"
    :auto-init="false"
    :on-token-expired="handleTokenExpired"
    :locale="uikitLocale"
    :theme="uikitTheme"
    :enable-contact="providerEnableContact"
    :enable-blocklist="providerEnableBlocklist"
    :enable-presence="providerEnablePresence"
    :enable-draft="providerEnableDraft"
    :enable-at-me="providerEnableMotion"
    :enable-typing="providerEnableTyping"
    :data-source="providerDataSource"
    :enable-group="providerEnableGroup"
    :enable-user-info="providerEnableUserInfo"
    :enable-user-info-subscription="providerEnableUserInfoSubscription"
    :filter-blocked-contacts="providerFilterBlockedContacts"
    :enable-toast="providerEnableToast"
    :contact-fetch-mode="providerContactFetchMode"
    :notice-config="noticeConfig"
    :logger="loggerConfig"
  >
    <AppInitializer :app-key="appKey">
      <router-view />
    </AppInitializer>
  </EmUIKitProvider>
</template>
