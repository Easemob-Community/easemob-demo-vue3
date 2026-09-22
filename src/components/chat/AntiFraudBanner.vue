<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { EmIcon } from '@easemob-community/uikit-im'

defineOptions({ name: 'AntiFraudBanner' })

const emit = defineEmits<{
  /** 点击关闭：隐藏提示条 */
  close: []
  /** 点击「点我举报」 */
  report: []
}>()

const { t } = useI18n()
</script>

<template>
  <div class="anti-fraud-banner" role="alert">
    <!-- 图标 + 标题/正文（对应设计稿 Frame 2923:18442：图标与标题行顶部对齐） -->
    <div class="anti-fraud-banner__main">
      <EmIcon class="anti-fraud-banner__icon" name="circle/bang" :size="18" />
      <div class="anti-fraud-banner__content">
        <p class="anti-fraud-banner__title">{{ t('chat.antiFraud.title') }}</p>
        <p class="anti-fraud-banner__body">
          {{ t('chat.antiFraud.text') }}
          <button type="button" class="anti-fraud-banner__report" @click="emit('report')">
            {{ t('chat.antiFraud.report') }}
          </button>
        </p>
      </div>
    </div>
    <button
      type="button"
      class="anti-fraud-banner__close"
      :aria-label="t('chat.antiFraud.close')"
      @click="emit('close')"
    >
      <EmIcon name="xmark/bold" :size="16" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.anti-fraud-banner {
  // 设计稿（Figma 新 Demo 2866:18542）亮色取值；暗色初版同值，后续可按主题扩展
  --anti-fraud-banner-bg: #ffe6b3;
  --anti-fraud-banner-text: #171a1c;
  --anti-fraud-banner-link: #ff661a;

  // 设计稿中横幅实例带 12px 外边距（聊天窗口内四周留白）
  margin: 12px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 12px 10px;
  border-radius: 8px;
  background: var(--anti-fraud-banner-bg);
  box-shadow: 1px 0 2px 0 rgb(26 26 26 / 10%);

  &__main {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  &__icon {
    flex-shrink: 0;
    // 设计稿图标 fill 为 #FF661A（与「点我举报」同色）
    color: var(--anti-fraud-banner-link);
  }

  &__content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  // 全局 reset 不清 p 的 UA 默认 margin（见 reset.scss 头注释），需显式清零
  &__title {
    margin: 0;
    font-size: calc(16px * var(--demo-font-scale, 1));
    font-weight: 500;
    line-height: calc(18px * var(--demo-font-scale, 1));
    color: var(--anti-fraud-banner-text);
  }

  &__body {
    margin: 0;
    font-size: calc(12px * var(--demo-font-scale, 1));
    line-height: calc(18px * var(--demo-font-scale, 1));
    color: var(--anti-fraud-banner-text);
    word-break: break-word;
  }

  &__report {
    padding: 0;
    border: none;
    font-size: inherit;
    line-height: calc(16px * var(--demo-font-scale, 1));
    font-weight: 500;
    color: var(--anti-fraud-banner-link);
    background: transparent;
    cursor: pointer;
  }

  &__close {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: calc(1px * var(--demo-font-scale, 1));
    border: none;
    color: var(--anti-fraud-banner-text);
    background: transparent;
    cursor: pointer;
    opacity: 0.8;

    &:hover {
      opacity: 1;
    }
  }
}
</style>
