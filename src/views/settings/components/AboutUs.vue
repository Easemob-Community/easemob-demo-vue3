<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import bannerIllustration from '@/assets/about/banner-illustration.jpg'
import bannerTitle from '@/assets/about/banner-title.svg'
import aboutLogo from '@/assets/about/about-logo.svg'
import { DEMO_VERSION, SDK_VERSION, UIKIT_VERSION } from '@/config/version'

defineOptions({ name: 'AboutUs' })

const { t } = useI18n()

const versionInfo = [
  { label: t('settings.about.sdkVersion'), value: SDK_VERSION },
  { label: t('settings.about.uikitVersion'), value: UIKIT_VERSION },
  { label: t('settings.about.demoVersion'), value: DEMO_VERSION },
]

/** 联系行：官网按设计稿带下划线；电话保留 tel: 拨号能力但视觉为纯文本 */
const contactList = [
  { label: t('settings.about.phone'), value: '400-622-1776', href: 'tel:400-622-1776' },
  {
    label: t('settings.about.website'),
    value: 'www.easemob.com',
    href: 'https://www.easemob.com/?utm_source=demo',
    underline: true,
  },
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
      <!-- banner：渐变底 + 右侧圆形遮罩插画 + 标题 / 标语 / 注册按钮，内部尺寸随宽度用 cqw 等比缩放 -->
      <div class="about-us__banner">
        <img
          class="about-us__banner-illustration"
          :src="bannerIllustration"
          alt=""
          aria-hidden="true"
        />
        <div class="about-us__banner-content">
          <img
            class="about-us__banner-title"
            :src="bannerTitle"
            :alt="t('settings.about.bannerAlt')"
          />
          <p class="about-us__banner-slogan">{{ t('settings.about.bannerSlogan') }}</p>
          <a
            class="about-us__register-btn"
            href="https://console.easemob.com/user/register?utm_source=demo"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ t('settings.about.registerButton') }}
          </a>
        </div>
      </div>

      <div class="about-us__content">
        <div class="about-us__intro">
          <p class="about-us__welcome">{{ t('settings.about.welcome') }}</p>
          <img class="about-us__logo" :src="aboutLogo" :alt="t('app.title')" />
          <p class="about-us__desc">{{ t('settings.about.description') }}</p>

          <div class="about-us__versions">
            <template v-for="(item, index) in versionInfo" :key="item.label">
              <span class="about-us__version-item">{{ item.label }}：{{ item.value }}</span>
              <span v-if="index < versionInfo.length - 1" class="about-us__version-divider">|</span>
            </template>
          </div>
        </div>

        <div class="about-us__links">
          <a
            v-for="item in contactList"
            :key="item.label"
            class="about-us__link-row"
            :href="item.href"
            :target="item.href.startsWith('tel:') ? undefined : '_blank'"
            rel="noopener noreferrer"
          >
            <span class="about-us__link-label">{{ item.label }}</span>
            <span
              class="about-us__link-value"
              :class="{ 'about-us__link-value--underline': item.underline }"
            >
              {{ item.value }}
            </span>
          </a>
        </div>
      </div>
    </div>

    <!-- 页脚（隐私政策 / 服务条款等 + 版权）固定在面板底部，不随正文滚动 -->
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
</template>

<style lang="scss" scoped>
.about-us {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: var(--color-bg);

  /* 顶栏：60px + 18px 标题 + 底部细线（设计稿 top_bars/onlight） */
  &__header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    height: 60px;
    padding: 0 16px;
    border-bottom: 1px solid var(--color-border);
  }

  &__title {
    font-size: 18px;
    font-weight: 500;
    color: var(--color-text);
  }

  &__body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 16px;
  }

  /* banner：796:223 蓝紫渐变；自身作为容器查询上下文，内部元素按 cqw 等比缩放 */
  &__banner {
    position: relative;
    width: 100%;
    aspect-ratio: 796 / 223;
    overflow: hidden;
    border-radius: 12px;
    background: linear-gradient(180deg, #2b94e1 1.6%, #874dd7 103%);
    container-type: inline-size;
  }

  /* 右侧插画：旋转 21° 溢出右下角，圆形径向遮罩边缘渐隐 */
  &__banner-illustration {
    position: absolute;
    right: -7.4cqw;
    bottom: -21.4cqw;
    width: 71.9cqw;
    transform: rotate(21.15deg);
    mask-image: radial-gradient(circle, #000 58%, transparent 74%);
    pointer-events: none;
  }

  &__banner-content {
    position: absolute;
    left: 3.4cqw;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75cqw;
  }

  &__banner-title {
    display: block;
    width: 33.7cqw;
    height: auto;
  }

  &__banner-slogan {
    margin: 0;
    font-size: clamp(10px, 1.76cqw, 15px);
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.3px;
    white-space: nowrap;
  }

  /* 「即刻接入」胶囊按钮：青色渐变白字 */
  &__register-btn {
    display: inline-flex;
    align-items: center;
    margin-top: 0.5cqw;
    padding: 1cqw 3cqw;
    font-size: clamp(10px, 1.76cqw, 15px);
    font-weight: 700;
    color: #fff;
    text-decoration: none;
    white-space: nowrap;
    background: linear-gradient(102deg, #00c4ff 0%, #0099ff 100%);
    border-radius: 999px;
    transition: filter 0.15s;

    &:hover {
      filter: brightness(1.06);
    }
  }

  /* 内容栏：设计稿为 520px 宽居中文本栏 */
  &__content {
    max-width: 520px;
    margin: 29px auto 0;
    text-align: left;
  }

  &__intro {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding-left: 14px;
  }

  &__welcome {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 0.64px;
    color: var(--color-text-secondary);
  }

  &__logo {
    display: block;
    width: 261px;
    max-width: 100%;
    height: 48px;

    /* logo 为黑色 SVG 文字，深色模式下反白 */
    html.dark & {
      filter: brightness(0) invert(1);
    }
  }

  &__desc {
    margin: 0;
    font-size: 14px;
    color: var(--color-text-tertiary);
  }

  &__versions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
    font-size: 14px;
    color: var(--color-text-tertiary);
  }

  &__version-item {
    white-space: nowrap;
  }

  &__version-divider {
    font-size: 12px;
  }

  &__links {
    margin-top: 16px;
  }

  &__link-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 54px;
    padding: 0 12px 0 14px;
    color: inherit;
    text-decoration: none;
    border-bottom: 1px solid var(--color-border);
  }

  &__link-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text);
  }

  &__link-value {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-primary);

    &--underline {
      text-decoration: underline;
    }
  }

  &__footer {
    flex-shrink: 0;
    padding: 16px 16px 24px;
    text-align: center;
  }

  &__footer-links {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px;
    max-width: 518px;
    margin: 0 auto;
  }

  &__footer-link {
    flex: 1 1 0;
    min-width: fit-content;
    padding: 10px 0;
    font-size: 12px;
    font-weight: 500;
    color: var(--color-primary);
    text-decoration: none;
    white-space: nowrap;

    &:hover {
      text-decoration: underline;
    }
  }

  &__copyright {
    margin: 12px 0 0;
    font-size: 12px;
    color: var(--color-text-tertiary);
  }
}
</style>
