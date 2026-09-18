<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Component } from 'vue'
import { useI18n } from 'vue-i18n'
import { EmIcon } from '@easemob/uikit-im'

import SettingsAiPanel from '@/components/settings/SettingsAiPanel.vue'
import SettingsAppearancePanel from '@/components/settings/SettingsAppearancePanel.vue'
import SettingsChatPanel from '@/components/settings/SettingsChatPanel.vue'
import SettingsContactsPanel from '@/components/settings/SettingsContactsPanel.vue'
import SettingsConversationPanel from '@/components/settings/SettingsConversationPanel.vue'
import SettingsLogPanel from '@/components/settings/SettingsLogPanel.vue'
import SettingsMorePanel from '@/components/settings/SettingsMorePanel.vue'
import SettingsNoticePanel from '@/components/settings/SettingsNoticePanel.vue'
import SettingsProviderPanel from '@/components/settings/SettingsProviderPanel.vue'
import { useMobileView } from '@/composables/useMobileView'
import { useSettingsDrawer } from '@/composables/useSettingsDrawer'
import { DEMO_ICON_SIZE } from '@/config/demo'

type CategoryKey =
  | 'appearance'
  | 'conversation'
  | 'chat'
  | 'contact'
  | 'ai'
  | 'notification'
  | 'logs'
  | 'provider'
  | 'more'

defineOptions({ name: 'SettingsDrawer' })

const { t } = useI18n()
const isMobileView = useMobileView()
const { close } = useSettingsDrawer()

const categoryKeys: CategoryKey[] = [
  'appearance',
  'conversation',
  'chat',
  'contact',
  'ai',
  'notification',
  'logs',
  'provider',
  'more',
]

/** 分类 key 与对应面板组件的映射，PC / H5 共用同一份渲染 */
const panelComponents: Record<CategoryKey, Component> = {
  appearance: SettingsAppearancePanel,
  conversation: SettingsConversationPanel,
  chat: SettingsChatPanel,
  contact: SettingsContactsPanel,
  ai: SettingsAiPanel,
  notification: SettingsNoticePanel,
  logs: SettingsLogPanel,
  provider: SettingsProviderPanel,
  more: SettingsMorePanel,
}

const categories = computed(() =>
  categoryKeys.map((key) => ({
    key,
    label: t(`features.categories.${key}`),
  })),
)

const activeCategory = ref<CategoryKey>('appearance')

function selectCategory(key: CategoryKey) {
  activeCategory.value = key
}
</script>

<template>
  <aside class="settings-drawer" :class="{ 'settings-drawer--mobile': isMobileView }">
    <header class="settings-drawer__header">
      <span class="settings-drawer__title">{{ t('features.title') }}</span>
      <button
        type="button"
        class="settings-drawer__close"
        :aria-label="t('common.close')"
        @click="close"
      >
        <EmIcon name="xmark/light" :size="DEMO_ICON_SIZE.tool" />
      </button>
    </header>

    <!-- PC / H5 仅在分类导航形态上有差异：左侧竖向导航 vs 顶部横向 tab -->
    <div class="settings-drawer__body" :class="{ 'settings-drawer__body--split': !isMobileView }">
      <!-- PC：左侧分类导航 -->
      <nav v-if="!isMobileView" class="settings-drawer__nav">
        <button
          v-for="cat in categories"
          :key="cat.key"
          type="button"
          class="settings-drawer__nav-item"
          :class="{ 'settings-drawer__nav-item--active': activeCategory === cat.key }"
          @click="selectCategory(cat.key)"
        >
          {{ cat.label }}
        </button>
      </nav>
      <!-- H5：顶部横向分类 tab -->
      <nav v-else class="settings-drawer__tabs">
        <button
          v-for="cat in categories"
          :key="cat.key"
          type="button"
          class="settings-drawer__tab-item"
          :class="{ 'settings-drawer__tab-item--active': activeCategory === cat.key }"
          @click="selectCategory(cat.key)"
        >
          {{ cat.label }}
        </button>
      </nav>
      <div class="settings-drawer__content">
        <component :is="panelComponents[activeCategory]" :key="activeCategory" />
      </div>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.settings-drawer {
  display: flex;
  flex-direction: column;
  width: 460px;
  height: auto;
  flex-shrink: 0;
  /* 宽度过渡动画期间避免内容换行抖动 */
  overflow: hidden;
  /* 卡片式容器：圆角/间距/悬浮阴影与会话、聊天容器对齐 */
  margin: var(--demo-container-padding, 8px);
  margin-left: 0;
  border-radius: var(--demo-component-radius, 8px);
  background: var(--color-bg);
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  &--mobile {
    /* H5：占满主区域，挤占后聊天区归零，仍保持「挤占不遮盖」语义 */
    width: 100%;
    margin: 0;
    border-radius: 0;
  }

  &__header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    /* 与 UIKit 容器 header（会话 / 聊天 56px）对齐；分隔线宽度由 UIKit 主题
       store 的 headerBorder 开关驱动（--uikit-header-border-width，默认 0 无线条） */
    min-height: 56px;
    padding: 0 16px;
    border-bottom: var(--uikit-header-border-width, 0px) solid var(--color-border);
  }

  &__title {
    font-size: var(--uikit-font-size-18, 18px);
    font-weight: 500;
    line-height: calc(22px * var(--demo-font-scale, 1));
    color: var(--color-text);
  }

  &__close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    color: var(--color-text-secondary);
    background: transparent;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition:
      background-color 0.2s,
      color 0.2s;

    &:hover {
      color: var(--color-text);
      background: var(--color-bg-secondary);
    }
  }

  &__body {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    &--split {
      flex-direction: row;
      padding: 0;
    }
  }

  /* PC 左侧分类导航 */
  &__nav {
    width: auto;
    min-width: 104px;
    max-width: 160px;
    box-sizing: border-box;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px 8px;
    border-right: var(--uikit-header-border-width, 0px) solid var(--color-border);
    overflow-y: auto;
  }

  &__nav-item {
    display: flex;
    align-items: center;
    min-height: 40px;
    padding: 8px 14px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--color-text-secondary);
    font-size: calc(14px * var(--demo-font-scale, 1));
    line-height: 1.3;
    text-align: left;
    cursor: pointer;
    transition:
      background-color 0.15s,
      color 0.15s;
    white-space: normal;

    &:hover {
      background-color: var(--color-bg-secondary);
      color: var(--color-text);
    }

    &--active {
      background-color: var(--uikit-primary-color-opacity, rgba(0, 158, 255, 0.12));
      color: var(--uikit-primary-color, var(--color-primary));
      font-weight: 500;
    }
  }

  /* H5 顶部横向 tab */
  &__tabs {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding: 12px;
    padding-bottom: 4px;
    flex-shrink: 0;
    border-bottom: var(--uikit-header-border-width, 0px) solid var(--color-border);
  }

  &__tab-item {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 32px;
    padding: 0 12px;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    background: transparent;
    color: var(--color-text-secondary);
    font-size: calc(13px * var(--demo-font-scale, 1));
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
    flex-shrink: 0;

    &--active {
      border-color: var(--uikit-primary-color, var(--color-primary));
      background-color: var(--uikit-primary-color, var(--color-primary));
      color: #ffffff;
    }
  }

  /* 内容区 */
  &__content {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
    padding: 16px;
  }
}
</style>
