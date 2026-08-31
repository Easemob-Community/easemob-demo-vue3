<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useClient } from '@easemob/uikit-im'

import { useUserStore } from '@/store/modules/user'

interface Props {
  /** 环信 AppKey，由外层 App.vue 传入 */
  appKey: string
}

const props = defineProps<Props>()

defineOptions({ name: 'AppInitializer' })

const { init, login } = useClient()
const userStore = useUserStore()
const router = useRouter()

/** 刷新页面后若 sessionStorage 中保留登录凭证，自动初始化并重新登录 IM SDK */
async function autoLoginToSDK() {
  if (!userStore.token || !userStore.userId || !props.appKey) return
  try {
    // UIKit init 配置类型未暴露 appKey，按实际运行时传参断言
    init({ appKey: props.appKey } as Parameters<typeof init>[0])
    await login({ user: userStore.userId, accessToken: userStore.token })
  } catch (err) {
    console.error('[AppInitializer] 自动登录 IM SDK 失败', err)
    userStore.reset()
    router.replace('/login')
  }
}

onMounted(autoLoginToSDK)
</script>

<template>
  <!-- 仅负责应用级初始化副作用，不渲染实际 DOM -->
  <slot />
</template>
