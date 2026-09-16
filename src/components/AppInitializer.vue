<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useClient } from '@easemob/uikit-im'

import { useUserStore } from '@/store/modules/user'
import { initUIKit } from '@/utils/uikit'

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

/** 是否存在可自动登录的凭证（刷新页面后由 user store 从 sessionStorage 恢复） */
const hasCredentials = Boolean(userStore.token && userStore.userId && props.appKey)

/** 自动登录进行中：全屏 loading，避免未连接态下渲染聊天容器（对齐 uikit demo 的 auto-login-loading） */
const autoLoggingIn = ref(false)
/** 自动登录失败原因，展示在错误态中 */
const autoLoginError = ref('')

async function autoLoginToSDK() {
  if (!hasCredentials) return
  autoLoggingIn.value = true
  autoLoginError.value = ''
  try {
    await initUIKit(initClient, props.appKey)
    await login({ user: userStore.userId, accessToken: userStore.token })
  } catch (err) {
    console.error('[AppInitializer] 自动登录 IM SDK 失败', err)
    autoLoginError.value = err instanceof Error ? err.message : String(err)
  } finally {
    autoLoggingIn.value = false
  }
}

/** 自动登录失败：清除凭证并返回登录页 */
function handleRelogin() {
  userStore.reset()
  router.replace('/login')
}

onMounted(autoLoginToSDK)
</script>

<template>
  <!-- 自动登录进行中：全屏 loading，登录成功后再渲染页面内容 -->
  <div v-if="autoLoggingIn" class="app-initializer__loading">
    <div class="app-initializer__spinner" />
    <span class="app-initializer__loading-text">{{ t('autoLogin.loading') }}</span>
  </div>
  <!-- 自动登录失败：提示错误并提供返回登录页入口（凭证同时已失效，重新登录后刷新） -->
  <div v-else-if="autoLoginError" class="app-initializer__loading">
    <span class="app-initializer__loading-text">{{ t('autoLogin.failed') }}</span>
    <span class="app-initializer__error-detail">{{ autoLoginError }}</span>
    <button class="app-initializer__relogin" type="button" @click="handleRelogin">
      {{ t('autoLogin.relogin') }}
    </button>
  </div>
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
  font-size: 14px;
  color: var(--color-text-secondary);
}

.app-initializer__error-detail {
  max-width: 80%;
  font-size: 12px;
  color: var(--color-text-secondary);
  word-break: break-all;
}

.app-initializer__relogin {
  padding: 8px 24px;
  border: none;
  border-radius: 999px;
  font-size: 14px;
  color: #fff;
  background-color: var(--color-primary);
  cursor: pointer;
}
</style>
