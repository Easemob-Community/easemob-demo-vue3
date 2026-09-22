<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useClient } from '@easemob-community/uikit-im'

import { useUserStore } from '@/store/modules/user'
import { initUIKit } from '@/utils/uikit'
import { useNewMessageNotice } from '@/composables/useNewMessageNotice'

interface Props {
  /** 环信 AppKey，由外层 App.vue 传入 */
  appKey: string
}

const props = defineProps<Props>()

defineOptions({ name: 'AppInitializer' })

const { t } = useI18n()
const { login, init: initClient } = useClient()
const userStore = useUserStore()
const router = useRouter()

// 页面在后台时收到新消息，标签页标题闪烁提示（依赖 Provider 作用域，需在 useClient 同一上下文）
useNewMessageNotice()

/** 是否存在可自动登录的凭证（刷新页面后由 user store 从 sessionStorage 恢复） */
const hasCredentials = Boolean(userStore.token && userStore.userId && props.appKey)

/** 自动登录进行中：全屏 loading，避免未连接态下渲染聊天容器（对齐 uikit demo 的 auto-login-loading） */
const autoLoggingIn = ref(false)

async function autoLoginToSDK() {
  if (!hasCredentials) return
  autoLoggingIn.value = true
  try {
    await initUIKit(initClient, props.appKey)
    await login({ user: userStore.userId, accessToken: userStore.token })
  } catch (err) {
    // 凭证已失效（如 token 过期）：直接清除登录态回登录页，避免卡在无法恢复的错误态
    console.error('[AppInitializer] 自动登录 IM SDK 失败，返回登录页', err)
    userStore.reset()
    router.replace('/login')
  } finally {
    autoLoggingIn.value = false
  }
}

onMounted(autoLoginToSDK)
</script>

<template>
  <!-- 自动登录进行中：全屏 loading，登录成功后再渲染页面内容 -->
  <div v-if="autoLoggingIn" class="app-initializer__loading">
    <div class="app-initializer__spinner" />
    <span class="app-initializer__loading-text">{{ t('autoLogin.loading') }}</span>
  </div>
  <!-- 自动登录失败时清除登录态直接返回登录页，无中间错误态 -->
  <slot v-else />
</template>

<style scoped lang="scss">
.app-initializer__loading {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background-color: var(--color-bg);
}

.app-initializer__spinner {
  width: 32px;
  height: 32px;
  box-sizing: border-box;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: app-initializer-spin 0.8s linear infinite;
}

@keyframes app-initializer-spin {
  to {
    transform: rotate(360deg);
  }
}

.app-initializer__loading-text {
  font-size: calc(14px * var(--demo-font-scale, 1));
  color: var(--color-text-secondary);
}
</style>
