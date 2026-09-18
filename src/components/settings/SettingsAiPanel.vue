<script setup lang="ts">
/**
 * UIKIT特性开关 - AI（流式输出）面板
 *
 * 按设计图一比一还原，包含：
 * - 开启 AI 应答（mock 流式）开关
 * - 手动注入流式演示：markdown 流式 / 异常流式
 * - 接入说明
 * - 一键重置
 *
 * 状态来自 useDemoSettings，由 chat/index.vue 监听并注入 mock AI 回复。
 */
import { useI18n } from 'vue-i18n'
import { useUIKit } from '@easemob/uikit-im'

import { useDemoSettings } from '@/composables/useDemoSettings'
import {
  runMarkdownStreamDemo,
  runMarkdownStreamErrorDemo,
} from '@/composables/useStreamDemo'

defineOptions({ name: 'SettingsAiPanel' })

const { t } = useI18n()
const { aiMockReplyEnabled, resetAiSettings } = useDemoSettings()
const { stores } = useUIKit()

/** 当前会话（无会话时演示按钮禁用） */
const currentConversation = () => stores.conversation.currentConversation

/** 在当前会话注入 markdown 流式演示消息 */
function injectMarkdownDemo() {
  const cvs = currentConversation()
  if (!cvs) return
  runMarkdownStreamDemo(stores.message, {
    conversationId: cvs.id,
    conversationType: cvs.type,
    to: stores.client.currentUser || '',
  })
}

/** 在当前会话注入异常流式演示消息 */
function injectErrorDemo() {
  const cvs = currentConversation()
  if (!cvs) return
  runMarkdownStreamErrorDemo(stores.message, {
    conversationId: cvs.id,
    conversationType: cvs.type,
    to: stores.client.currentUser || '',
  })
}
</script>

<template>
  <div class="settings-ai-panel">
    <!-- ===== AI 应答（Mock 流式） ===== -->
    <section class="settings-ai-panel__section">
      <h3 class="settings-ai-panel__section-title">
        {{ t('features.ai.mockStream') }}
      </h3>

      <div class="settings-ai-panel__row">
        <span class="settings-ai-panel__label">
          {{ t('features.ai.enableMockReply') }}
        </span>
        <button
          type="button"
          class="settings-ai-panel__switch"
          :class="{ 'settings-ai-panel__switch--active': aiMockReplyEnabled }"
          :aria-checked="aiMockReplyEnabled"
          role="switch"
          @click="aiMockReplyEnabled = !aiMockReplyEnabled"
        >
          <span class="settings-ai-panel__switch-thumb" />
        </button>
      </div>
      <p class="settings-ai-panel__desc">
        {{ t('features.ai.enableMockReplyDesc') }}
      </p>
    </section>

    <!-- ===== 手动注入流式演示 ===== -->
    <section class="settings-ai-panel__section">
      <h3 class="settings-ai-panel__section-title">
        {{ t('features.ai.manualInjection') }}
      </h3>

      <div class="settings-ai-panel__inject-list">
        <div class="settings-ai-panel__inject-item">
          <span class="settings-ai-panel__inject-label">
            {{ t('features.ai.injectMarkdown') }}
          </span>
          <button
            type="button"
            class="settings-ai-panel__inject-btn"
            :disabled="!currentConversation()"
            @click="injectMarkdownDemo"
          >
            {{ t('features.ai.inject') }}
          </button>
        </div>

        <div class="settings-ai-panel__inject-item">
          <span class="settings-ai-panel__inject-label">
            {{ t('features.ai.injectError') }}
          </span>
          <button
            type="button"
            class="settings-ai-panel__inject-btn"
            :disabled="!currentConversation()"
            @click="injectErrorDemo"
          >
            {{ t('features.ai.inject') }}
          </button>
        </div>
      </div>
      <p class="settings-ai-panel__desc">
        {{ t('features.ai.manualInjectionDesc') }}
      </p>
    </section>

    <!-- ===== 接入说明 ===== -->
    <section class="settings-ai-panel__section">
      <h3 class="settings-ai-panel__section-title">
        {{ t('features.ai.integration') }}
      </h3>
      <p class="settings-ai-panel__desc settings-ai-panel__desc--block">
        {{ t('features.ai.integrationDesc') }}
      </p>
    </section>

    <!-- ===== 一键重置 ===== -->
    <button
      type="button"
      class="settings-ai-panel__reset"
      @click="resetAiSettings"
    >
      {{ t('features.ai.resetAll') }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.settings-ai-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;

  &__section {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  &__section-title {
    margin: 0;
    font-size: calc(13px * var(--demo-font-scale, 1));
    font-weight: 600;
    color: var(--color-text-secondary);
  }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    min-height: 24px;
  }

  &__label {
    font-size: calc(16px * var(--demo-font-scale, 1));
    font-weight: 500;
    color: var(--color-text);
  }

  &__desc {
    margin: -10px 0 0;
    font-size: calc(12px * var(--demo-font-scale, 1));
    color: var(--color-text-secondary);
    line-height: 1.5;
    text-align: right;

    &--block {
      margin: 0;
      white-space: pre-line;
      text-align: left;
    }
  }

  /* Toggle switch */
  &__switch {
    position: relative;
    width: 44px;
    height: 24px;
    padding: 0;
    border: none;
    border-radius: 12px;
    background-color: var(--color-bg-secondary);
    cursor: pointer;
    transition: background-color 0.2s;
    flex-shrink: 0;

    &--active {
      background-color: var(--uikit-primary-color, var(--color-primary));
    }
  }

  &__switch-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    transition: transform 0.2s;
  }

  &__switch--active &__switch-thumb {
    transform: translateX(20px);
  }

  /* Injection list */
  &__inject-list {
    display: flex;
    flex-direction: column;
    border-top: 1px solid var(--color-border);
  }

  &__inject-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--color-border);
  }

  &__inject-label {
    font-size: calc(15px * var(--demo-font-scale, 1));
    font-weight: 500;
    color: var(--color-text);
  }

  &__inject-btn {
    flex-shrink: 0;
    height: 32px;
    padding: 0 16px;
    border: 1px solid var(--uikit-primary-color, var(--color-primary));
    border-radius: 999px;
    background-color: transparent;
    color: var(--uikit-primary-color, var(--color-primary));
    font-size: calc(13px * var(--demo-font-scale, 1));
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      background-color: var(--uikit-primary-color, var(--color-primary));
      color: #ffffff;
    }

    &:disabled {
      border-color: var(--color-border);
      background-color: var(--color-bg-secondary);
      color: var(--color-text-secondary);
      cursor: not-allowed;
    }
  }

  /* Reset button */
  &__reset {
    width: 100%;
    height: 40px;
    margin-top: 8px;
    border: none;
    border-radius: 999px;
    background-color: var(--color-bg-secondary);
    color: var(--color-text);
    font-size: calc(14px * var(--demo-font-scale, 1));
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--color-border);
    }
  }
}
</style>
