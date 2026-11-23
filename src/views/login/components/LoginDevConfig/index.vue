<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  getDevConfig,
  getPersistEnabled,
  isAppId,
  isValidAppKey,
  isValidRestServerUrl,
  isValidWebSocketUrl,
  setDevConfig,
  setPersistEnabled,
  type DevConfig,
} from '@/config/dev'
import { useDevMode } from '@/composables/useDevMode'

defineOptions({ name: 'LoginDevConfig' })

const { t } = useI18n()
const { enterDevMode } = useDevMode()

const emit = defineEmits<{ exit: [] }>()

const usePrivateServer = ref(false)
const persistEnabled = ref(false)
const devAppKey = ref('')
const devImServer = ref('')
const devRestServer = ref('')
const devSaveState = ref<'idle' | 'success' | 'error' | 'invalid-url'>('idle')
const focused = ref<string | null>(null)

let devSaveTimer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  const config = getDevConfig()
  devAppKey.value = config.appKey
  devImServer.value = config.imServer
  devRestServer.value = config.restServer
  usePrivateServer.value = config.usePrivateServer
  persistEnabled.value = getPersistEnabled()
})

onUnmounted(() => {
  if (devSaveTimer) clearTimeout(devSaveTimer)
})

const appIdMode = computed(() => isAppId(devAppKey.value))

watch(appIdMode, (enabled) => {
  if (enabled) usePrivateServer.value = false
})

function handlePersistToggle() {
  persistEnabled.value = !persistEnabled.value
  setPersistEnabled(persistEnabled.value)
}

function handleDevSave() {
  const appKey = devAppKey.value.trim()
  const imServer = devImServer.value.trim()
  const restServer = devRestServer.value.trim()

  if (!isValidAppKey(appKey) && !isAppId(appKey)) {
    devSaveState.value = 'error'
  } else if (!appIdMode.value && usePrivateServer.value && (!imServer || !restServer)) {
    devSaveState.value = 'error'
  } else if (
    usePrivateServer.value &&
    (!isValidWebSocketUrl(imServer) || !isValidRestServerUrl(restServer))
  ) {
    devSaveState.value = 'invalid-url'
  } else {
    devSaveState.value = 'success'
    const existing = getDevConfig()
    const config: DevConfig = {
      ...existing,
      appKey,
      imServer,
      restServer,
      usePrivateServer: appIdMode.value ? false : usePrivateServer.value,
    }
    setDevConfig(config)
    enterDevMode()
    // appKey 与私有服务器变更需要重新创建 SDK，刷新后仍恢复 dev 模式
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
      <span>{{ $t('login.useCustomAppKey') }}</span>
    </div>

    <div class="login-page__dev-field">
      <label for="dev-app-identity">AppKey / AppID</label>
      <div
        class="login-page__input"
        :class="{ 'login-page__input--focused': focused === 'devAppKey' }"
      >
        <input
          id="dev-app-identity"
          v-model="devAppKey"
          name="appIdentity"
          type="text"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="none"
          spellcheck="false"
          :placeholder="$t('login.appKeyPlaceholder')"
          @focus="focused = 'devAppKey'"
          @blur="focused = null"
        />
      </div>
    </div>

    <div class="login-page__dev-row">
      <span>
        {{ appIdMode ? $t('login.appIdPrivateServerUnsupported') : $t('login.usePrivateServer') }}
      </span>
      <button
        type="button"
        class="login-page__switch"
        :class="{ 'login-page__switch--active': usePrivateServer }"
        :disabled="appIdMode"
        @click="usePrivateServer = !usePrivateServer"
      >
        <span />
      </button>
    </div>

    <div v-if="usePrivateServer" class="login-page__dev-field">
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

    <div v-if="usePrivateServer" class="login-page__dev-field">
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
          'login-page__dev-save--error': ['error', 'invalid-url'].includes(devSaveState),
        }"
        @click="handleDevSave"
      >
        {{
          devSaveState === 'success'
            ? `✓  ${t('login.saved')}`
            : devSaveState === 'error'
              ? t('login.checkRequired')
              : devSaveState === 'invalid-url'
                ? t('login.invalidServerUrl')
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
