<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  getDevConfig,
  getPersistEnabled,
  setDevConfig,
  setPersistEnabled,
  type DevConfig,
} from '@/config/dev'

defineOptions({ name: 'LoginDevConfig' })

const { t } = useI18n()

const emit = defineEmits<{ exit: [] }>()

const useCustomServer = ref(false)
const usePrivateServer = ref(false)
const persistEnabled = ref(false)
const devAppKey = ref('')
const devImServer = ref('')
const devRestServer = ref('')
const devSaveState = ref<'idle' | 'success' | 'error'>('idle')
const focused = ref<string | null>(null)

let devSaveTimer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  const config = getDevConfig()
  devAppKey.value = config.appKey
  devImServer.value = config.imServer
  devRestServer.value = config.restServer
  useCustomServer.value = config.useCustomServer
  usePrivateServer.value = config.usePrivateServer
  persistEnabled.value = getPersistEnabled()
})

onUnmounted(() => {
  if (devSaveTimer) clearTimeout(devSaveTimer)
})

function isValidAppKey(value: string): boolean {
  return /^[^#\s]+#[^#\s]+$/.test(value.trim())
}

function handlePersistToggle() {
  persistEnabled.value = !persistEnabled.value
  setPersistEnabled(persistEnabled.value)
}

function handleDevSave() {
  const appKey = devAppKey.value.trim()
  const imServer = devImServer.value.trim()
  const restServer = devRestServer.value.trim()

  if (!isValidAppKey(appKey)) {
    devSaveState.value = 'error'
  } else if (usePrivateServer.value && (!imServer || !restServer)) {
    devSaveState.value = 'error'
  } else {
    devSaveState.value = 'success'
    const existing = getDevConfig()
    const config: DevConfig = {
      ...existing,
      appKey,
      imServer,
      restServer,
      useCustomServer: useCustomServer.value,
      usePrivateServer: usePrivateServer.value,
    }
    setDevConfig(config)
    // appKey 变更需要 Provider 重新初始化，刷新页面生效
    setTimeout(() => {
      window.location.reload()
    }, 600)
  }

  if (devSaveTimer) clearTimeout(devSaveTimer)
  devSaveTimer = setTimeout(
    () => {
      devSaveState.value = 'idle'
    },
    devSaveState.value === 'success' ? 2500 : 2000,
  )
}
</script>

<template>
  <div class="login-page__dev-config">
    <div class="login-page__dev-divider">
      <span />
      <span>{{ $t('login.devConfig') }}</span>
      <span />
    </div>

    <div class="login-page__dev-row">
      <span>{{ $t('login.devPersistLabel') }}</span>
      <button
        type="button"
        class="login-page__switch"
        :class="{ 'login-page__switch--active': persistEnabled }"
        @click="handlePersistToggle"
      >
        <span />
      </button>
    </div>

    <div class="login-page__dev-row">
      <span>{{ $t('login.useCustomServer') }}</span>
      <button
        type="button"
        class="login-page__switch"
        :class="{ 'login-page__switch--active': useCustomServer }"
        @click="useCustomServer = !useCustomServer"
      >
        <span />
      </button>
    </div>

    <div class="login-page__dev-field">
      <label>AppKey</label>
      <div
        class="login-page__input"
        :class="{ 'login-page__input--focused': focused === 'devAppKey' }"
      >
        <input
          v-model="devAppKey"
          type="text"
          :placeholder="$t('login.appKeyPlaceholder')"
          @focus="focused = 'devAppKey'"
          @blur="focused = null"
        />
      </div>
    </div>

    <div class="login-page__dev-row">
      <span>{{ $t('login.usePrivateServer') }}</span>
      <button
        type="button"
        class="login-page__switch"
        :class="{ 'login-page__switch--active': usePrivateServer }"
        @click="usePrivateServer = !usePrivateServer"
      >
        <span />
      </button>
    </div>

    <div class="login-page__dev-field">
      <label>{{ $t('login.imServerLabel') }}</label>
      <div class="login-page__input" :class="{ 'login-page__input--focused': focused === 'devIm' }">
        <input
          v-model="devImServer"
          type="text"
          :placeholder="$t('login.imServerPlaceholder')"
          @focus="focused = 'devIm'"
          @blur="focused = null"
        />
      </div>
    </div>

    <div class="login-page__dev-field">
      <label>{{ $t('login.restServerLabel') }}</label>
      <div
        class="login-page__input"
        :class="{ 'login-page__input--focused': focused === 'devRest' }"
      >
        <input
          v-model="devRestServer"
          type="text"
          :placeholder="$t('login.restServerPlaceholder')"
          @focus="focused = 'devRest'"
          @blur="focused = null"
        />
      </div>
    </div>

    <div class="login-page__dev-actions">
      <button
        type="button"
        class="login-page__dev-save"
        :class="{
          'login-page__dev-save--success': devSaveState === 'success',
          'login-page__dev-save--error': devSaveState === 'error',
        }"
        @click="handleDevSave"
      >
        {{
          devSaveState === 'success'
            ? `✓  ${t('login.saved')}`
            : devSaveState === 'error'
              ? t('login.checkRequired')
              : t('login.saveConfig')
        }}
      </button>
      <button type="button" class="login-page__dev-exit" @click="emit('exit')">
        {{ $t('login.exit') }}
      </button>
    </div>

    <div class="login-page__dev-divider login-page__dev-divider--light">
      <span />
      <span>{{ $t('login.loginDivider') }}</span>
      <span />
    </div>
  </div>
</template>

<style src="./index.scss" scoped lang="scss"></style>
