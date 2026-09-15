<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { DEMO_VERSION, SDK_VERSION, UIKIT_VERSION } from '@/config/version'

defineOptions({ name: 'AboutUs' })

const { t } = useI18n()

const versionInfo = [
  { label: t('settings.about.sdkVersion'), value: SDK_VERSION },
  { label: t('settings.about.uikitVersion'), value: UIKIT_VERSION },
  { label: t('settings.about.demoVersion'), value: DEMO_VERSION },
]

const contactList = [
  { label: t('settings.about.phone'), value: '400-622-1776', href: 'tel:400-622-1776' },
  { label: t('settings.about.website'), value: 'www.easemob.com', href: 'https://www.easemob.com' },
]

const footerLinks = [
  { label: t('settings.about.privacyPolicy'), href: '#' },
  { label: t('settings.about.termsOfService'), href: '#' },
  { label: t('settings.about.thirdPartyInfo'), href: '#' },
  { label: t('settings.about.personalInfoCollection'), href: '#' },
]
</script>

<template>
  <div class="about-us">
    <div class="about-us__header">
      <span class="about-us__title">{{ t('settings.about.title') }}</span>
    </div>

    <div class="about-us__body">
      <div class="about-us__banner">
        <img src="/settings-banner.png" :alt="t('settings.about.bannerAlt')" />
        <!-- 手写注册按钮（替代旧图内嵌按钮）：点击跳转环信控制台注册页 -->
        <a
          class="about-us__register-btn"
          href="https://console.easemob.com/user/register?utm_source=demo"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ t('settings.about.registerButton') }}
        </a>
      </div>

      <div class="about-us__content">
        <p class="about-us__welcome">{{ t('settings.about.welcome') }}</p>
        <h1 class="about-us__name">{{ t('app.title') }}</h1>
        <p class="about-us__desc">{{ t('settings.about.description') }}</p>

        <div class="about-us__versions">
          <span
            v-for="(item, index) in versionInfo"
            :key="item.label"
            class="about-us__version-item"
          >
            {{ item.label }}：{{ item.value }}
            <span v-if="index < versionInfo.length - 1" class="about-us__version-divider">|</span>
          </span>
        </div>

        <div class="about-us__links">
          <a
            v-for="item in contactList"
            :key="item.label"
            class="about-us__link-row"
            :href="item.href"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="about-us__link-label">{{ item.label }}</span>
            <span class="about-us__link-value">{{ item.value }}</span>
          </a>
        </div>

        <div class="about-us__footer">
          <div class="about-us__footer-links">
            <a
              v-for="item in footerLinks"
              :key="item.label"
              class="about-us__footer-link"
              :href="item.href"
            >
              {{ item.label }}
            </a>
          </div>
          <p class="about-us__copyright">{{ t('settings.about.copyright') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.about-us {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: var(--color-bg);

  /* 与左侧设置列表头部同高（48px），无底线 */
  &__header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    min-height: 48px;
    padding: 12px 24px;
  }

  &__title {
    font-size: 16px;
    font-weight: 500;
    color: var(--color-text);
  }

  /* body 作为容器查询上下文：banner 按钮 / 文案字号按参考设计随内容区宽度等比缩放（cqw） */
  &__body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 24px;
    container-type: inline-size;
  }

  &__banner {
    position: relative;
    width: 100%;
    overflow: hidden;
    border-radius: 12px;

    img {
      display: block;
      width: 100%;
      height: auto;
      object-fit: cover;
    }
  }

  /* banner 左下角「即刻接入」按钮：蓝色渐变胶囊白字，位置/尺寸按参考图等比（左 3.4%、上 73%、高 18%） */
  &__register-btn {
    position: absolute;
    left: 3.4%;
    top: 73%;
    height: 18%;
    display: inline-flex;
    align-items: center;
    padding: 0 2.5cqw;
    font-size: clamp(12px, 1.75cqw, 28px);
    font-weight: 600;
    color: #ffffff;
    text-decoration: none;
    background: linear-gradient(135deg, #17b3fe 0%, #128fff 100%);
    border-radius: 999px;
    box-shadow: 0 2px 10px rgba(18, 100, 220, 0.35);
    transition: filter 0.15s;

    &:hover {
      filter: brightness(1.06);
    }
  }

  /* 内容栏：参考设计为居中 960px 宽文本栏，左对齐 */
  &__content {
    max-width: 960px;
    margin: clamp(24px, 4cqw, 64px) auto 0;
    text-align: left;
  }

  &__welcome {
    margin: 0;
    font-size: clamp(15px, 2.1cqw, 34px);
    color: var(--color-text-secondary);
  }

  &__name {
    margin: 8px 0 0;
    font-size: clamp(28px, 3.6cqw, 60px);
    font-weight: 800;
    color: var(--color-text);
  }

  &__desc {
    margin: 8px 0 0;
    font-size: 14px;
    color: var(--color-text-secondary);
  }

  &__versions {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 16px;
    font-size: 14px;
    color: var(--color-text-secondary);
  }

  &__version-divider {
    margin: 0 8px;
    color: var(--color-border);
  }

  &__links {
    max-width: 960px;
    margin: 40px auto 0;
  }

  &__link-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 0;
    color: inherit;
    text-decoration: none;
    border-bottom: 1px solid var(--color-border);

    &:last-child {
      border-bottom: none;
    }
  }

  &__link-label {
    font-size: 14px;
    color: var(--color-text);
  }

  &__link-value {
    font-size: 14px;
    color: var(--color-primary);
  }

  // 页脚（隐私政策 / 服务条款等）随正文一起滚动，不固定在视口底部
  &__footer {
    margin-top: 40px;
    padding: 24px 0 8px;
    text-align: center;
    border-top: 1px solid var(--color-border);
  }

  &__footer-links {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 32px;
  }

  &__footer-link {
    font-size: 13px;
    color: var(--color-primary);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  &__copyright {
    margin: 16px 0 0;
    font-size: 12px;
    color: var(--color-text-secondary);
  }
}
</style>
