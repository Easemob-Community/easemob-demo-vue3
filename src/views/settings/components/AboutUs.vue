<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import aboutLogo from '@/assets/about/about-logo.svg'
import bannerIllustration from '@/assets/about/banner-illustration.jpg'
import bannerTitle from '@/assets/about/banner-title.svg'
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
      <!-- banner：渐变底 + 右侧圆形遮罩插画 + 标题 / 标语 / 接入按钮，16px 边距 + 12px 圆角，内部尺寸随宽度用 cqw 等比缩放 -->
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
          <!-- 手写接入按钮：新开环信控制台注册页 -->
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

      <!-- 内容栏：设计稿为 520px 宽居中文本栏，窄屏下自适应 -->
      <div class="about-us__content">
        <div class="about-us__intro">
          <p class="about-us__welcome">{{ t('settings.about.welcome') }}</p>
          <!--
            logo 字标：原实现固定 261×48 而 SVG 实际比例是 257.9×36.6，
            宽度被 max-width 压缩时高度不变导致字形挤压拉伸；改为 height: auto 后随宽度等比缩放，任何容器下不变形
          -->
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

  /* 顶栏：60px + 18px 标题，无底部分割线（与账户信息 / 通用设置面板头部统一） */
  &__header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    height: 60px;
    padding: 0 16px;
    box-sizing: border-box;
  }

  &__title {
    font-size: calc(18px * var(--demo-font-scale, 1));
    font-weight: 500;
    color: var(--color-text);
  }

  &__body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 16px;
  }

  /* banner：796:188 蓝紫渐变（设计稿原始高度，矮屏下保证官网联系行首屏可见）；自身作为容器查询上下文，内部元素按 cqw 等比缩放 */
  &__banner {
    position: relative;
    width: 100%;
    aspect-ratio: 796 / 188;
    overflow: hidden;
    border-radius: 12px;
    background: linear-gradient(180deg, #2b94e1 1.6%, #874dd7 103%);
    container-type: inline-size;
  }

  /*
   * 右侧插画：旋转 21° 溢出右下角；遮罩为设计稿导出的圆形柔和边缘蒙版
   * （不透明至 86% 半径、100% 处透明），mask 在 64.88cqw 方形盒内尺寸 92.29%、位置 18.86%/15.82%
   * 用 top 而非 bottom 锁位：top: -14.8cqw 等价于 188 高时的 bottom: -26.47cqw，
   * 插画相对顶边不动，画面不下沉
   */
  &__banner-illustration {
    position: absolute;
    right: -10.77cqw;
    top: -14.8cqw;
    width: 64.88cqw;
    aspect-ratio: 1;
    object-fit: cover;
    transform: rotate(21.15deg);
    mask-image: url('@/assets/about/banner-mask.svg');
    mask-repeat: no-repeat;
    mask-size: 92.29%;
    mask-position: 18.86% 15.82%;
    pointer-events: none;
  }

  /*
   * 文案区：设计稿定位距左 27px、距顶 30.47px，宽 268px，块间距 6px；
   * banner 改回 188 高后纵向预算 23.62cqw，文案整体（top/间距/行高/按钮内边距）
   * 按比例下压收紧，保证「即刻接入」按钮不被底边裁切
   */
  &__banner-content {
    position: absolute;
    left: 3.39cqw;
    top: 3.2cqw;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.6cqw;
    width: 33.67cqw;
  }

  /* 标题块：设计稿高 89px、内嵌 248×70.27 字标垂直居中，故字标上下各留 9.37px */
  &__banner-title {
    display: block;
    width: 31.16cqw;
    height: auto;
    margin: 0.8cqw 0;
  }

  &__banner-slogan {
    margin: 0;
    font-size: clamp(10px, 1.76cqw, 15px);
    font-weight: 700;
    line-height: 1.6;
    color: #fff;
    letter-spacing: -0.3px;
    white-space: nowrap;
  }

  /* 「即刻接入」胶囊按钮：青色渐变白字，压在 banner 渐变底上故用固定色值，不随主题切换 */
  &__register-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75cqw 3.015cqw;
    font-size: clamp(10px, 1.76cqw, 15px);
    font-weight: 700;
    line-height: 1.714;
    color: #fff;
    letter-spacing: -0.2px;
    text-decoration: none;
    white-space: nowrap;
    background-color: #35aefd;
    background-image: linear-gradient(102.39deg, #00c4ff 0%, #0099ff 100%);
    border-radius: 100px;
    transition: filter 0.15s;

    &:hover {
      filter: brightness(1.06);
    }
  }

  /* 内容栏：设计稿为 520px 宽居中文本栏，与 banner 间距 20px（较设计稿 29px 收紧，矮屏下保证官网联系行首屏可见） */
  &__content {
    max-width: 520px;
    margin: 20px auto 0;
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
    font-size: calc(16px * var(--demo-font-scale, 1));
    font-weight: 500;
    letter-spacing: 0.64px;
    color: var(--color-text-secondary);
  }

  /*
   * logo 字标：261px 宽 + height auto（SVG 字标比例 257.9×36.6），
   * 不再锁定 48px 高度，窄容器下 max-width: 100% 等比缩小，避免字形被挤压拉伸
   */
  &__logo {
    display: block;
    width: 261px;
    max-width: 100%;
    height: auto;

    /* logo 为黑色 SVG 文字，深色模式下反白 */
    html.dark & {
      filter: brightness(0) invert(1);
    }
  }

  &__desc {
    margin: 0;
    font-size: calc(14px * var(--demo-font-scale, 1));
    color: var(--color-text-tertiary);
  }

  &__versions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
    font-size: calc(14px * var(--demo-font-scale, 1));
    color: var(--color-text-tertiary);
  }

  &__version-item {
    white-space: nowrap;
  }

  &__version-divider {
    font-size: calc(12px * var(--demo-font-scale, 1));
  }

  &__links {
    margin-top: 8px;
  }

  /* 联系行：高 54px，左侧缩进 14px 的底部分隔线（设计稿 list_item/normal/onlight） */
  &__link-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 54px;
    padding-right: 12px;
    margin-left: 14px;
    box-sizing: border-box;
    color: inherit;
    text-decoration: none;
    border-bottom: 1px solid var(--color-border);
  }

  &__link-label {
    font-size: calc(14px * var(--demo-font-scale, 1));
    font-weight: 500;
    color: var(--color-text);
  }

  &__link-value {
    font-size: calc(14px * var(--demo-font-scale, 1));
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
    font-size: calc(12px * var(--demo-font-scale, 1));
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
    font-size: calc(12px * var(--demo-font-scale, 1));
    color: var(--color-text-tertiary);
  }
}
</style>
