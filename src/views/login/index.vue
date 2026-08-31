<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDevMode } from '@/composables/useDevMode'
import { DEMO_VERSION, SDK_VERSION, UIKIT_VERSION } from '@/config/version'
import LoginHero from './components/LoginHero/index.vue'
import LoginDevConfig from './components/LoginDevConfig/index.vue'
import LoginForm from './components/LoginForm/index.vue'

defineOptions({ name: 'LoginPage' })

const { t, locale } = useI18n()

// 开发者模式：统一由 useDevMode 管理（dev 构建默认开启、生产默认关闭），单击退出、连点 7 次进入
const { devEnabled, remaining, isHinting, registerTap, exitDevMode } = useDevMode()

// 连点提示 toast（分段反馈：前 4 次静默，之后提示「再点 X 次」）
const devToast = ref('')
const devToastVisible = ref(false)

let devToastTimer: ReturnType<typeof setTimeout> | null = null

onUnmounted(() => {
  if (devToastTimer) clearTimeout(devToastTimer)
})

function showDevToast(message: string) {
  devToast.value = message
  devToastVisible.value = true
  if (devToastTimer) clearTimeout(devToastTimer)
  devToastTimer = setTimeout(() => {
    devToastVisible.value = false
  }, 2000)
}

const devIconTitle = computed(() => {
  if (devEnabled.value) return t('login.devModeExitHint')
  if (isHinting.value) return t('login.devModeHint', { count: remaining.value })
  return ''
})

function handleDevIconClick() {
  const result = registerTap()
  if (result.status === 'hint') {
    showDevToast(t('login.devModeHint', { count: result.remaining }))
  } else if (result.status === 'enabled') {
    showDevToast(t('login.devModeEnabled'))
  }
}
</script>

<template>
  <div class="login-page">
    <!-- 背景渐变 -->
    <div class="login-page__bg" />

    <!-- 右上角紫色光晕 -->
    <div class="login-page__light-burst">
      <div class="login-page__light-burst-main" />
      <div class="login-page__light-burst-magenta" />
      <div class="login-page__light-burst-indigo" />
      <div class="login-page__light-burst-core" />
    </div>

    <!-- 噪点纹理 -->
    <div class="login-page__noise" />

    <!-- 左上角 Logo -->
    <a
      href="https://www.easemob.com"
      target="_blank"
      rel="noopener noreferrer"
      class="login-page__logo"
    >
      <img src="/login-assets/logo.svg" :alt="$t('app.title')" />
    </a>

    <!-- 主内容区 -->
    <div class="login-page__content">
      <div class="login-page__layout">
        <!-- 左侧主视觉 -->
        <LoginHero />

        <!-- 右侧表单面板 -->
        <div class="login-page__form-panel">
          <div class="login-page__form-card">
            <!-- 顶部 shimmer 线 -->
            <div class="login-page__shimmer login-page__shimmer--top" />

            <!-- 开发者模式图标 -->
            <div class="login-page__dev-icon-wrap">
              <button
                type="button"
                class="login-page__dev-icon"
                :class="{
                  'login-page__dev-icon--active': devEnabled,
                  'login-page__dev-icon--hint': isHinting,
                }"
                :title="devIconTitle"
                @click="handleDevIconClick"
              >
                &lt;/&gt;
              </button>
            </div>

            <div class="login-page__form-body">
              <!-- 标题 -->
              <div class="login-page__titles">
                <p class="login-page__subtitle">{{ $t('login.subtitle') }}</p>
                <h2 class="login-page__title">
                  <!-- 中文标题使用设计稿 SVG（仅含中文「环信即时通讯云」），其他语言回退文字 -->
                  <img
                    v-if="locale === 'zh-CN'"
                    class="login-page__title-img"
                    src="/login-assets/title.svg"
                    :alt="$t('login.mainTitle')"
                  />
                  <template v-else>{{ $t('login.mainTitle') }}</template>
                </h2>
                <p class="login-page__tagline">{{ $t('login.tagline') }}</p>
              </div>

              <!-- 开发者配置 -->
              <LoginDevConfig v-show="devEnabled" @exit="exitDevMode" />

              <!-- 登录表单 -->
              <LoginForm :dev-mode="devEnabled" />
            </div>

            <!-- 底部 shimmer 线 -->
            <div class="login-page__shimmer login-page__shimmer--bottom" />
          </div>
        </div>
      </div>
    </div>

    <!-- 底部版本信息 -->
    <div class="login-page__footer">
      <p>{{ $t('login.footer.copyright') }}</p>
      <span>|</span>
      <button type="button">
        {{
          $t('login.footer.sdkVersion', {
            sdkVersion: SDK_VERSION,
            uikitVersion: UIKIT_VERSION,
            demoVersion: DEMO_VERSION,
          })
        }}
      </button>
    </div>

    <!-- 连点提示 toast -->
    <Transition name="dev-toast">
      <div v-if="devToastVisible" class="login-page__dev-toast">{{ devToast }}</div>
    </Transition>
  </div>
</template>

<style src="./login.scss" scoped lang="scss"></style>
