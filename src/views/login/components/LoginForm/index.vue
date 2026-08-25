<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import LoginCaptcha from '../LoginCaptcha/index.vue'

defineOptions({ name: 'LoginForm' })

const phone = ref('')
const smsCode = ref('')
const captchaInput = ref('')
const agreed = ref(false)
const smsCountdown = ref(0)
const focused = ref<string | null>(null)
const loginLoading = ref(false)
const loginError = ref('')
const smsLoading = ref(false)

const captchaRef = ref<InstanceType<typeof LoginCaptcha> | null>(null)

let timerId: ReturnType<typeof setInterval> | null = null

onUnmounted(() => {
  if (timerId) clearInterval(timerId)
})

const smsBtnText = computed(() => {
  if (smsLoading.value) return '发送中...'
  if (smsCountdown.value > 0) return `${smsCountdown.value}s`
  return '获取验证码'
})

function onPhoneInput(event: Event) {
  phone.value = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 11)
}

function onSmsInput(event: Event) {
  smsCode.value = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 6)
}

function onCaptchaInput(event: Event) {
  captchaInput.value = (event.target as HTMLInputElement).value.toUpperCase().slice(0, 5)
}

function handleGetSms() {
  if (smsCountdown.value > 0 || !phone.value || smsLoading.value) return
  smsLoading.value = true
  setTimeout(() => {
    smsLoading.value = false
    smsCountdown.value = 60
    timerId = setInterval(() => {
      smsCountdown.value -= 1
      if (smsCountdown.value <= 1) {
        if (timerId) clearInterval(timerId)
        smsCountdown.value = 0
      }
    }, 1000)
  }, 500)
}

function handleCaptchaRefresh() {
  captchaInput.value = ''
}

function handleLogin() {
  loginError.value = ''
  if (!agreed.value) {
    loginError.value = '请先同意环信服务条款和隐私政策'
    return
  }
  if (captchaInput.value.toUpperCase() !== captchaRef.value?.text) {
    loginError.value = '图像验证码不正确，请重试'
    captchaRef.value?.refresh()
    return
  }
  loginLoading.value = true
  setTimeout(() => {
    loginLoading.value = false
  }, 1500)
}
</script>

<template>
  <form class="login-page__form" @submit.prevent="handleLogin">
    <!-- 手机号 -->
    <div
      class="login-page__input"
      :class="{ 'login-page__input--focused': focused === 'phone' }"
    >
      <span class="login-page__phone-prefix">+86</span>
      <span class="login-page__phone-divider" />
      <input
        v-model="phone"
        type="tel"
        placeholder="请输入手机号"
        maxlength="11"
        required
        @focus="focused = 'phone'"
        @blur="focused = null"
        @input="onPhoneInput"
      />
    </div>

    <!-- 短信验证码 -->
    <div class="login-page__sms-row">
      <div
        class="login-page__input"
        :class="{ 'login-page__input--focused': focused === 'sms' }"
      >
        <input
          v-model="smsCode"
          type="text"
          placeholder="短信验证码"
          maxlength="6"
          required
          @focus="focused = 'sms'"
          @blur="focused = null"
          @input="onSmsInput"
        />
      </div>
      <button
        type="button"
        class="login-page__sms-btn"
        :disabled="smsCountdown > 0 || !phone || smsLoading"
        @click="handleGetSms"
      >
        {{ smsBtnText }}
      </button>
    </div>

    <!-- 图形验证码 -->
    <div class="login-page__captcha-row">
      <div
        class="login-page__input"
        :class="{ 'login-page__input--focused': focused === 'captcha' }"
      >
        <input
          v-model="captchaInput"
          type="text"
          placeholder="输入图中文字"
          maxlength="5"
          required
          @focus="focused = 'captcha'"
          @blur="focused = null"
          @input="onCaptchaInput"
        />
      </div>
      <LoginCaptcha ref="captchaRef" @refresh="handleCaptchaRefresh" />
    </div>
    <p class="login-page__captcha-hint">点击图片刷新验证码</p>

    <!-- 错误提示 -->
    <p v-if="loginError" class="login-page__error">{{ loginError }}</p>

    <!-- 登录按钮 -->
    <button type="submit" class="login-page__submit" :disabled="loginLoading">
      {{ loginLoading ? '登录中...' : '立即登录' }}
    </button>

    <!-- 用户协议 -->
    <div class="login-page__terms">
      <button
        type="button"
        class="login-page__checkbox"
        :class="{ 'login-page__checkbox--checked': agreed }"
        @click="agreed = !agreed"
      >
        <svg v-if="agreed" width="9" height="7" viewBox="0 0 10 7" fill="none">
          <path
            d="M1 3.5L3.5 6L9 1"
            stroke="white"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <p>
        我已阅读并同意环信
        <a
          href="https://www.easemob.com/demo/agreement"
          target="_blank"
          rel="noopener noreferrer"
        >
          服务条款
        </a>
        和
        <a
          href="https://www.easemob.com/console/privacy"
          target="_blank"
          rel="noopener noreferrer"
        >
          隐私政策
        </a>
      </p>
    </div>
  </form>
</template>

<style src="./index.scss" scoped lang="scss"></style>
