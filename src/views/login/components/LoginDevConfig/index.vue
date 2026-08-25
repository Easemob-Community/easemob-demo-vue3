<script setup lang="ts">
import { onUnmounted, ref } from 'vue'

defineOptions({ name: 'LoginDevConfig' })

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
      <span>开发者配置</span>
      <span />
    </div>

    <div class="login-page__dev-row">
      <span>使用自定义服务器</span>
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
          placeholder="xxxx#xxxx"
          @focus="focused = 'devAppKey'"
          @blur="focused = null"
        />
      </div>
    </div>

    <div class="login-page__dev-row">
      <span>使用私有服务器</span>
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
      <label>IM 服务器地址</label>
      <div
        class="login-page__input"
        :class="{ 'login-page__input--focused': focused === 'devIm' }"
      >
        <input
          v-model="devImServer"
          type="text"
          placeholder="im-api-v2.easemob.com"
          @focus="focused = 'devIm'"
          @blur="focused = null"
        />
      </div>
    </div>

    <div class="login-page__dev-field">
      <label>REST 服务器地址</label>
      <div
        class="login-page__input"
        :class="{ 'login-page__input--focused': focused === 'devRest' }"
      >
        <input
          v-model="devRestServer"
          type="text"
          placeholder="a1.easemob.com"
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
            ? '✓  已保存'
            : devSaveState === 'error'
              ? '请检查必填项'
              : '保存配置'
        }}
      </button>
      <button type="button" class="login-page__dev-exit" @click="emit('exit')">
        退出
      </button>
    </div>

    <div class="login-page__dev-divider login-page__dev-divider--light">
      <span />
      <span>登录</span>
      <span />
    </div>
  </div>
</template>

<style src="./index.scss" scoped lang="scss"></style>
