<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import LoginHero from './components/LoginHero/index.vue'
import LoginDevConfig from './components/LoginDevConfig/index.vue'
import LoginForm from './components/LoginForm/index.vue'

defineOptions({ name: 'LoginPage' })

// 开发者模式：双击右上角图标进入，单击退出
const devMode = ref(false)
const devDblClickCount = ref(0)

let devResetTimer: ReturnType<typeof setTimeout> | null = null

onUnmounted(() => {
  if (devResetTimer) clearTimeout(devResetTimer)
})

function handleDevIconClick() {
  if (devMode.value) devMode.value = false
}

function handleDevIconDblClick() {
  if (devMode.value) return
  devDblClickCount.value += 1
  if (devDblClickCount.value >= 2) {
    devMode.value = true
    devDblClickCount.value = 0
  } else {
    if (devResetTimer) clearTimeout(devResetTimer)
    devResetTimer = setTimeout(() => {
      devDblClickCount.value = 0
    }, 3000)
  }
}
</script>

<template>
  <div class="login-page keep-px">
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
      <img src="/login-assets/logo.svg" alt="环信 Easemob" />
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
                  'login-page__dev-icon--active': devMode,
                  'login-page__dev-icon--hint': devDblClickCount === 1,
                }"
                :title="
                  devMode ? '单击退出开发者模式' : devDblClickCount === 1 ? '再次双击激活' : ''
                "
                @click="handleDevIconClick"
                @dblclick="handleDevIconDblClick"
              >
                &lt;/&gt;
              </button>
            </div>

            <div class="login-page__form-body">
              <!-- 标题 -->
              <div class="login-page__titles">
                <p class="login-page__subtitle">欢迎体验</p>
                <h2 class="login-page__title">环信即时通讯云</h2>
                <p class="login-page__tagline">EASEMOB IM DEMO · FOR VUE</p>
              </div>

              <!-- 开发者配置 -->
              <LoginDevConfig v-show="devMode" @exit="devMode = false" />

              <!-- 登录表单 -->
              <LoginForm />
            </div>

            <!-- 底部 shimmer 线 -->
            <div class="login-page__shimmer login-page__shimmer--bottom" />
          </div>
        </div>
      </div>
    </div>

    <!-- 底部版本信息 -->
    <div class="login-page__footer">
      <p>© 2026 环信</p>
      <span>|</span>
      <button type="button">
        SDK版本：5.1.1&nbsp;&nbsp;UIKit版本：VUE 1.0.0&nbsp;&nbsp;Demo版本：2.0.0
      </button>
    </div>
  </div>
</template>

<style src="./login.scss" scoped lang="scss"></style>
