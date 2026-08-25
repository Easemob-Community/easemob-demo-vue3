<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'LoginDevConfig' })

const { t } = useI18n()

const emit = defineEmits<{ exit: [] }>()

const useCustomServer = ref(false)
const usePrivateServer = ref(false)
const devAppKey = ref('')
const devImServer = ref('')
const devRestServer = ref('')
const devSaveState = ref<'idle' | 'success' | 'error'>('idle')
const focused = ref<string | null>(null)

let devSaveTimer: ReturnType<typeof setTimeout> | null = null

onUnmounted(() => {
  if (devSaveTimer) clearTimeout(devSaveTimer)
})

function handleDevSave() {
  if (useCustomServer.value && !devAppKey.value.trim()) {
    devSaveState.value = 'error'
  } else if (usePrivateServer.value && (!devImServer.value.trim() || !devRestServer.value.trim())) {
    devSaveState.value = 'error'
  } else {
    devSaveState.value = 'success'
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
