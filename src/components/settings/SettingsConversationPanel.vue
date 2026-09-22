<script setup lang="ts">
/**
 * UIKit 特性开关 - 会话面板
 *
 * 按设计图一比一还原，包含：
 * - 展示连接/同步状态横幅
 * - 展示会话分栏 tab 栏
 * - 展示 tab 按钮（全部 / 未读 / @我 / 单聊 / 群组），可勾选与拖拽排序
 * - 新消息提醒总开关
 * - 使用 #tabs 插槽完全接管 tab 栏渲染
 * - 一键重置
 *
 * 状态来自 useDemoSettings，由 chat/index.vue 绑定到 EmConversationContainer。
 */
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ConversationTabKey } from '@easemob-community/uikit-im'

import { useDemoSettings } from '@/composables/useDemoSettings'

const ALL_TAB_KEYS: ConversationTabKey[] = ['all', 'unread', 'atMe', 'single', 'group']

defineOptions({ name: 'SettingsConversationPanel' })

const { t } = useI18n()
const {
  statusBannerEnabled,
  conversationUnreadMode,
  conversationUnreadPlacement,
  conversationBadgePlacement,
  conversationTabs,
  conversationTabsVisible,
  conversationTabsTakeover,
  toggleConversationTab,
  moveConversationTab,
  resetConversationSettings,
} = useDemoSettings()

/** 未选中的 tab 按默认顺序排列 */
const unpickedTabs = computed(() =>
  ALL_TAB_KEYS.filter((tab) => !conversationTabs.value.includes(tab)),
)

const dragFromIndex = ref<number | null>(null)

function onDragStart(e: DragEvent, index: number) {
  dragFromIndex.value = index
  if (e.dataTransfer) {
    e.dataTransfer.setData('text/plain', String(index))
    e.dataTransfer.effectAllowed = 'move'
  }
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
}

function onDrop(e: DragEvent, toIndex: number) {
  e.preventDefault()
  const fromIndex = dragFromIndex.value
  if (fromIndex === null || fromIndex === toIndex) return
  moveConversationTab(fromIndex, toIndex)
  dragFromIndex.value = null
}

function onDragEnd() {
  dragFromIndex.value = null
}

function onToggleTab(tab: ConversationTabKey, checked: boolean) {
  toggleConversationTab(tab, checked)
}
</script>

<template>
  <div class="settings-conversation-panel">
    <!-- ===== 状态横幅 ===== -->
    <section class="settings-conversation-panel__section">
      <h3 class="settings-conversation-panel__section-title">
        {{ t('features.conversation.statusBanner') }}
      </h3>

      <div class="settings-conversation-panel__row">
        <span class="settings-conversation-panel__label">
          {{ t('features.conversation.showStatusBanner') }}
        </span>
        <button
          type="button"
          class="settings-conversation-panel__switch"
          :class="{ 'settings-conversation-panel__switch--active': statusBannerEnabled }"
          :aria-checked="statusBannerEnabled"
          role="switch"
          @click="statusBannerEnabled = !statusBannerEnabled"
        >
          <span class="settings-conversation-panel__switch-thumb" />
        </button>
      </div>
      <p class="settings-conversation-panel__desc">
        {{ t('features.conversation.showStatusBannerDesc') }}
      </p>
    </section>

    <!-- ===== 分栏显隐 ===== -->
    <section class="settings-conversation-panel__section">
      <h3 class="settings-conversation-panel__section-title">
        {{ t('features.conversation.tabsVisibility') }}
      </h3>

      <div class="settings-conversation-panel__row">
        <span class="settings-conversation-panel__label">
          {{ t('features.conversation.showTabs') }}
        </span>
        <button
          type="button"
          class="settings-conversation-panel__switch"
          :class="{ 'settings-conversation-panel__switch--active': conversationTabsVisible }"
          :aria-checked="conversationTabsVisible"
          role="switch"
          @click="conversationTabsVisible = !conversationTabsVisible"
        >
          <span class="settings-conversation-panel__switch-thumb" />
        </button>
      </div>
      <p class="settings-conversation-panel__desc">
        {{ t('features.conversation.showTabsDesc') }}
      </p>
    </section>

    <!-- ===== 展示 tab 按钮 ===== -->
    <section class="settings-conversation-panel__section">
      <h3 class="settings-conversation-panel__section-title">
        {{ t('features.conversation.tabButtons') }}
      </h3>

      <div class="settings-conversation-panel__tab-list">
        <!-- 已展示的 tab：可勾选、可拖拽排序 -->
        <div
          v-for="(tab, index) in conversationTabs"
          :key="tab"
          class="settings-conversation-panel__tab-item"
          :class="{ 'settings-conversation-panel__tab-item--dragging': dragFromIndex === index }"
          draggable="true"
          @dragstart="onDragStart($event, index)"
          @dragover.prevent="onDragOver"
          @drop.prevent="onDrop($event, index)"
          @dragend="onDragEnd"
        >
          <label class="settings-conversation-panel__tab-check">
            <input
              type="checkbox"
              :checked="true"
              @change="onToggleTab(tab, ($event.target as HTMLInputElement).checked)"
            />
            <span class="settings-conversation-panel__checkmark">
              <span class="settings-conversation-panel__checkmark-inner" />
            </span>
            <span class="settings-conversation-panel__tab-label">
              {{ t(`features.conversation.tabLabels.${tab}`) }}
            </span>
          </label>
          <span class="settings-conversation-panel__drag-handle"> <span /><span /><span /> </span>
        </div>

        <!-- 未展示的 tab：可勾选、不可拖拽 -->
        <div
          v-for="tab in unpickedTabs"
          :key="tab"
          class="settings-conversation-panel__tab-item settings-conversation-panel__tab-item--unpicked"
        >
          <label class="settings-conversation-panel__tab-check">
            <input
              type="checkbox"
              :checked="false"
              @change="onToggleTab(tab, ($event.target as HTMLInputElement).checked)"
            />
            <span class="settings-conversation-panel__checkmark">
              <span class="settings-conversation-panel__checkmark-inner" />
            </span>
            <span class="settings-conversation-panel__tab-label">
              {{ t(`features.conversation.tabLabels.${tab}`) }}
            </span>
          </label>
          <span
            class="settings-conversation-panel__drag-handle settings-conversation-panel__drag-handle--disabled"
          >
            <span /><span /><span />
          </span>
        </div>
      </div>
      <p class="settings-conversation-panel__desc">
        {{ t('features.conversation.tabButtonsDesc') }}
      </p>
    </section>

    <!-- ===== 未读徽标 ===== -->
    <section class="settings-conversation-panel__section">
      <h3 class="settings-conversation-panel__section-title">
        {{ t('features.conversation.unreadBadge') }}
      </h3>

      <div class="settings-conversation-panel__row">
        <span class="settings-conversation-panel__label">
          {{ t('features.conversation.unreadMode') }}
        </span>
      </div>
      <div class="settings-conversation-panel__options">
        <button
          type="button"
          class="settings-conversation-panel__option"
          :class="{ 'settings-conversation-panel__option--active': conversationUnreadMode === 'count' }"
          @click="conversationUnreadMode = 'count'"
        >
          {{ t('features.conversation.unreadModeCount') }}
        </button>
        <button
          type="button"
          class="settings-conversation-panel__option"
          :class="{ 'settings-conversation-panel__option--active': conversationUnreadMode === 'dot' }"
          @click="conversationUnreadMode = 'dot'"
        >
          {{ t('features.conversation.unreadModeDot') }}
        </button>
      </div>

      <div class="settings-conversation-panel__row">
        <span class="settings-conversation-panel__label">
          {{ t('features.conversation.unreadPlacement') }}
        </span>
      </div>
      <div class="settings-conversation-panel__options">
        <button
          type="button"
          class="settings-conversation-panel__option"
          :class="{ 'settings-conversation-panel__option--active': conversationUnreadPlacement === 'inline' }"
          @click="conversationUnreadPlacement = 'inline'"
        >
          {{ t('features.conversation.unreadPlacementInline') }}
        </button>
        <button
          type="button"
          class="settings-conversation-panel__option"
          :class="{ 'settings-conversation-panel__option--active': conversationUnreadPlacement === 'avatar' }"
          @click="conversationUnreadPlacement = 'avatar'"
        >
          {{ t('features.conversation.unreadPlacementAvatar') }}
        </button>
      </div>

      <div class="settings-conversation-panel__row">
        <span class="settings-conversation-panel__label">
          {{ t('features.conversation.badgePlacement') }}
        </span>
      </div>
      <div class="settings-conversation-panel__options">
        <button
          type="button"
          class="settings-conversation-panel__option"
          :class="{ 'settings-conversation-panel__option--active': conversationBadgePlacement === 'top-right' }"
          :disabled="conversationUnreadPlacement !== 'avatar'"
          @click="conversationBadgePlacement = 'top-right'"
        >
          {{ t('features.conversation.badgePlacementTopRight') }}
        </button>
        <button
          type="button"
          class="settings-conversation-panel__option"
          :class="{ 'settings-conversation-panel__option--active': conversationBadgePlacement === 'bottom-right' }"
          :disabled="conversationUnreadPlacement !== 'avatar'"
          @click="conversationBadgePlacement = 'bottom-right'"
        >
          {{ t('features.conversation.badgePlacementBottomRight') }}
        </button>
      </div>
      <p class="settings-conversation-panel__desc">
        {{ t('features.conversation.unreadBadgeDesc') }}
      </p>
    </section>

    <!-- ===== 完全接管渲染 ===== -->
    <section class="settings-conversation-panel__section">
      <h3 class="settings-conversation-panel__section-title">
        {{ t('features.conversation.takeover') }}
      </h3>

      <div class="settings-conversation-panel__row">
        <span class="settings-conversation-panel__label">
          {{ t('features.conversation.useTabsSlot') }}
        </span>
        <button
          type="button"
          class="settings-conversation-panel__switch"
          :class="{ 'settings-conversation-panel__switch--active': conversationTabsTakeover }"
          :aria-checked="conversationTabsTakeover"
          role="switch"
          @click="conversationTabsTakeover = !conversationTabsTakeover"
        >
          <span class="settings-conversation-panel__switch-thumb" />
        </button>
      </div>
      <p class="settings-conversation-panel__desc">
        {{ t('features.conversation.useTabsSlotDesc') }}
      </p>
    </section>

    <!-- ===== 一键重置 ===== -->
    <button
      type="button"
      class="settings-conversation-panel__reset"
      @click="resetConversationSettings"
    >
      {{ t('features.conversation.resetAll') }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.settings-conversation-panel {
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

  /* Tab 列表 */
  &__tab-list {
    display: flex;
    flex-direction: column;
    border-top: 1px solid var(--color-border);
  }

  &__tab-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--color-border);
    cursor: grab;
    transition: background-color 0.15s;

    &--dragging {
      opacity: 0.5;
    }

    &--unpicked {
      cursor: default;
    }
  }

  &__tab-check {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
    cursor: pointer;

    input {
      position: absolute;
      width: 0;
      height: 0;
      opacity: 0;
    }
  }

  &__checkmark {
    position: relative;
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    border: 2px solid var(--color-border);
    border-radius: 50%;
    transition:
      border-color 0.15s,
      background-color 0.15s;

    input:checked + & {
      border-color: var(--uikit-primary-color, var(--color-primary));
      background-color: var(--uikit-primary-color, var(--color-primary));
    }
  }

  &__checkmark-inner {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 9px;
    border: solid #ffffff;
    border-width: 0 2px 2px 0;
    opacity: 0;
    transform: translate(-50%, -60%) rotate(45deg);
    transition: opacity 0.15s;

    input:checked + .settings-conversation-panel__checkmark & {
      opacity: 1;
    }
  }

  &__tab-label {
    font-size: calc(15px * var(--demo-font-scale, 1));
    color: var(--color-text);
  }

  /* Drag handle */
  &__drag-handle {
    display: flex;
    flex-direction: column;
    gap: 3px;
    width: 14px;
    padding: 4px 0;
    flex-shrink: 0;
    cursor: grab;

    > span {
      display: block;
      width: 100%;
      height: 2px;
      border-radius: 1px;
      background-color: var(--color-text-secondary);
    }

    &--disabled {
      cursor: default;
      opacity: 0.3;
    }
  }

  /* Segmented options（与 SettingsChatPanel 同口径） */
  &__options {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__option {
    flex: 1;
    height: 32px;
    min-width: 64px;
    padding: 0 12px;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    background-color: transparent;
    color: var(--color-text);
    font-size: calc(13px * var(--demo-font-scale, 1));
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;

    &:hover:not(:disabled) {
      border-color: var(--uikit-primary-color, var(--color-primary));
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    &--active {
      border-color: var(--uikit-primary-color, var(--color-primary));
      background-color: var(--uikit-primary-color, var(--color-primary));
      color: #ffffff;
    }
  }

  /* 一键重置 */
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
