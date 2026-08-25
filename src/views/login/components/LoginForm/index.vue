<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import LoginCaptcha from '../LoginCaptcha/index.vue'

defineOptions({ name: 'LoginForm' })

const { t } = useI18n()

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
  if (smsLoading.value) return t('login.sending')
  if (smsCountdown.value > 0) return `${smsCountdown.value}s`
  return t('login.getSmsCode')
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
    loginError.value = t('login.errorAgreeTerms')
    return
  }
  if (captchaInput.value.toUpperCase() !== captchaRef.value?.text) {
    loginError.value = t('login.errorCaptcha')
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
    <div class="login-page__input" :class="{ 'login-page__input--focused': focused === 'phone' }">
      <span class="login-page__phone-prefix">+86</span>
      <span class="login-page__phone-divider" />
      <input
        v-model="phone"
        type="tel"
        :placeholder="$t('login.phonePlaceholder')"
        maxlength="11"
        required
        @focus="focused = 'phone'"
        @blur="focused = null"
        @input="onPhoneInput"
      />
    </div>

    <!-- 短信验证码 -->
    <div class="login-page__sms-row">
      <div class="login-page__input" :class="{ 'login-page__input--focused': focused === 'sms' }">
        <input
          v-model="smsCode"
          type="text"
          :placeholder="$t('login.smsCodePlaceholder')"
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
          :placeholder="$t('login.captchaPlaceholder')"
          maxlength="5"
          required
          @focus="focused = 'captcha'"
          @blur="focused = null"
          @input="onCaptchaInput"
        />
      </div>
      <LoginCaptcha ref="captchaRef" @refresh="handleCaptchaRefresh" />
    </div>
    <p class="login-page__captcha-hint">{{ $t('login.captchaHint') }}</p>

    <!-- 错误提示 -->
    <p v-if="loginError" class="login-page__error">{{ loginError }}</p>

    <!-- 登录按钮 -->
    <button type="submit" class="login-page__submit" :disabled="loginLoading">
      {{ loginLoading ? $t('login.loggingIn') : $t('login.login') }}
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
        {{ $t('login.agreePrefix') }}
        <a href="https://www.easemob.com/demo/agreement" target="_blank" rel="noopener noreferrer">
          {{ $t('login.termsOfService') }}
        </a>
        {{ $t('login.and') }}
        <a href="https://www.easemob.com/console/privacy" target="_blank" rel="noopener noreferrer">
          {{ $t('login.privacyPolicy') }}
        </a>
      </p>
    </div>
  </form>
</template>

<style src="./index.scss" scoped lang="scss"></style>
