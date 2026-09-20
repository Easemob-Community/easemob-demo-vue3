<script setup lang="ts">
/**
 * UIKit 特性开关 - 聊天面板
 *
 * 按设计图一比一还原，包含：
 * - 输入框模式（简洁 / 富文本）
 * - 功能栏位置（底部 / 顶部）
 * - 输入框功能（Emoji / 图片 / 文件 / 语音 / 视频 / ＠提及）
 * - 输入框扩展配置（自动聚焦、聚焦边框色、光标颜色、选中背景色、最大长度）
 * - 群已读回执（启用、人数上限）
 * - 消息列表（消息搜索、服务端搜索、时间戳展示、状态文本、位置）
 * - 一键重置
 *
 * 状态来自 useDemoSettings，由 chat/index.vue 绑定到 EmChatContainer。
 */
import { useI18n } from 'vue-i18n'

import { useDemoSettings } from '@/composables/useDemoSettings'

defineOptions({ name: 'SettingsChatPanel' })

const { t } = useI18n()
const {
  chatInputMode,
  chatInputStyle,
  chatInputFeatures,
  chatInputAutoFocus,
  chatInputFocusBorderColor,
  chatInputCaretColor,
  chatInputSelectionColor,
  chatInputMaxLength,
  groupReadReceiptEnabled,
  groupReadReceiptMaxSize,
  chatShowTime,
  chatMessageSearchEnabled,
  chatMessageServerSearchEnabled,
  chatMessageListShowAvatar,
  chatMessageShowSelfAvatar,
  chatMessageStatusShowText,
  chatMessageStatusDirection,
  chatMessageStatusPosition,
  chatMessageAction,
  resetChatSettings,
} = useDemoSettings()

const FEATURE_KEYS = ['emoji', 'image', 'file', 'voice', 'video', 'mention'] as const

const MESSAGE_ACTION_KEYS = [
  'enableQuote',
  'enableCopy',
  'enableDownload',
  'enableDelete',
  'enableRecall',
  'enableRecallOther',
  'enableEdit',
  'enableForward',
  'enableMultiSelect',
  'enableTranslate',
  'enableVoiceToText',
  'enablePin',
] as const
</script>

<template>
  <div class="settings-chat-panel">
    <!-- ===== 输入框模式 ===== -->
    <section class="settings-chat-panel__section">
      <h3 class="settings-chat-panel__section-title">
        {{ t('features.chat.inputMode') }}
      </h3>
      <div class="settings-chat-panel__options">
        <button
          type="button"
          class="settings-chat-panel__option"
          :class="{ 'settings-chat-panel__option--active': chatInputMode === 'simple' }"
          @click="chatInputMode = 'simple'"
        >
          {{ t('features.chat.inputModeSimple') }}
        </button>
        <button
          type="button"
          class="settings-chat-panel__option"
          :class="{ 'settings-chat-panel__option--active': chatInputMode === 'rich' }"
          @click="chatInputMode = 'rich'"
        >
          {{ t('features.chat.inputModeRich') }}
        </button>
      </div>
      <p class="settings-chat-panel__desc">
        {{ t('features.chat.inputModeDesc') }}
      </p>
    </section>

    <!-- ===== 功能栏位置 ===== -->
    <section class="settings-chat-panel__section">
      <h3 class="settings-chat-panel__section-title">
        {{ t('features.chat.toolbarPosition') }}
      </h3>
      <div class="settings-chat-panel__options">
        <button
          type="button"
          class="settings-chat-panel__option"
          :class="{ 'settings-chat-panel__option--active': chatInputStyle === 'toolbar-bottom' }"
          @click="chatInputStyle = 'toolbar-bottom'"
        >
          {{ t('features.chat.toolbarPositionBottom') }}
        </button>
        <button
          type="button"
          class="settings-chat-panel__option"
          :class="{ 'settings-chat-panel__option--active': chatInputStyle === 'toolbar-top' }"
          @click="chatInputStyle = 'toolbar-top'"
        >
          {{ t('features.chat.toolbarPositionTop') }}
        </button>
      </div>
      <p class="settings-chat-panel__desc">
        {{ t('features.chat.toolbarPositionDesc') }}
      </p>
    </section>

    <!-- ===== 输入框功能 ===== -->
    <section class="settings-chat-panel__section">
      <h3 class="settings-chat-panel__section-title">
        {{ t('features.chat.inputFeatures') }}
      </h3>
      <div class="settings-chat-panel__feature-list">
        <label
          v-for="key in FEATURE_KEYS"
          :key="key"
          class="settings-chat-panel__feature-item"
        >
          <input v-model="chatInputFeatures[key]" type="checkbox" />
          <span class="settings-chat-panel__checkmark">
            <span class="settings-chat-panel__checkmark-inner" />
          </span>
          <span class="settings-chat-panel__feature-label">
            {{ t(`features.chat.inputFeatureLabels.${key}`) }}
          </span>
        </label>
      </div>
      <p class="settings-chat-panel__desc">
        {{ t('features.chat.inputFeaturesDesc') }}
      </p>
    </section>

    <!-- ===== 输入框扩展配置 ===== -->
    <section class="settings-chat-panel__section">
      <h3 class="settings-chat-panel__section-title">
        {{ t('features.chat.inputExtra') }}
      </h3>

      <div class="settings-chat-panel__row">
        <span class="settings-chat-panel__label">
          {{ t('features.chat.inputAutoFocus') }}
        </span>
        <button
          type="button"
          class="settings-chat-panel__switch"
          :class="{ 'settings-chat-panel__switch--active': chatInputAutoFocus }"
          :aria-checked="chatInputAutoFocus"
          role="switch"
          @click="chatInputAutoFocus = !chatInputAutoFocus"
        >
          <span class="settings-chat-panel__switch-thumb" />
        </button>
      </div>

      <div class="settings-chat-panel__color-row">
        <span class="settings-chat-panel__label">
          {{ t('features.chat.focusBorderColor') }}
        </span>
        <div class="settings-chat-panel__color-inputs">
          <input
            v-model="chatInputFocusBorderColor"
            type="text"
            class="settings-chat-panel__text-input"
            :placeholder="t('features.chat.colorPlaceholder')"
          />
          <input
            v-model="chatInputFocusBorderColor"
            type="color"
            class="settings-chat-panel__color-input"
            :aria-label="t('features.chat.focusBorderColor')"
          />
          <button
            type="button"
            class="settings-chat-panel__restore"
            @click="chatInputFocusBorderColor = ''"
          >
            {{ t('features.chat.restore') }}
          </button>
        </div>
      </div>

      <div class="settings-chat-panel__color-row">
        <span class="settings-chat-panel__label">
          {{ t('features.chat.caretColor') }}
        </span>
        <div class="settings-chat-panel__color-inputs">
          <input
            v-model="chatInputCaretColor"
            type="text"
            class="settings-chat-panel__text-input"
            :placeholder="t('features.chat.colorPlaceholder')"
          />
          <input
            v-model="chatInputCaretColor"
            type="color"
            class="settings-chat-panel__color-input"
            :aria-label="t('features.chat.caretColor')"
          />
          <button
            type="button"
            class="settings-chat-panel__restore"
            @click="chatInputCaretColor = ''"
          >
            {{ t('features.chat.restore') }}
          </button>
        </div>
      </div>

      <div class="settings-chat-panel__color-row">
        <span class="settings-chat-panel__label">
          {{ t('features.chat.selectionColor') }}
        </span>
        <div class="settings-chat-panel__color-inputs">
          <input
            v-model="chatInputSelectionColor"
            type="text"
            class="settings-chat-panel__text-input"
            :placeholder="t('features.chat.colorPlaceholder')"
          />
          <input
            v-model="chatInputSelectionColor"
            type="color"
            class="settings-chat-panel__color-input"
            :aria-label="t('features.chat.selectionColor')"
          />
          <button
            type="button"
            class="settings-chat-panel__restore"
            @click="chatInputSelectionColor = ''"
          >
            {{ t('features.chat.restore') }}
          </button>
        </div>
      </div>

      <div class="settings-chat-panel__color-row">
        <span class="settings-chat-panel__label">
          {{ t('features.chat.maxLength') }}
        </span>
        <div class="settings-chat-panel__color-inputs">
          <input
            v-model.number="chatInputMaxLength"
            type="number"
            min="0"
            class="settings-chat-panel__text-input settings-chat-panel__text-input--number"
            :placeholder="t('features.chat.maxLengthPlaceholder')"
          />
          <button
            type="button"
            class="settings-chat-panel__restore"
            @click="chatInputMaxLength = 0"
          >
            {{ t('features.chat.restore') }}
          </button>
        </div>
      </div>
    </section>

    <!-- ===== 群已读回执 ===== -->
    <section class="settings-chat-panel__section">
      <h3 class="settings-chat-panel__section-title">
        {{ t('features.chat.groupReadReceipt') }}
      </h3>

      <div class="settings-chat-panel__row">
        <span class="settings-chat-panel__label">
          {{ t('features.chat.enableGroupReadReceipt') }}
        </span>
        <button
          type="button"
          class="settings-chat-panel__switch"
          :class="{ 'settings-chat-panel__switch--active': groupReadReceiptEnabled }"
          :aria-checked="groupReadReceiptEnabled"
          role="switch"
          @click="groupReadReceiptEnabled = !groupReadReceiptEnabled"
        >
          <span class="settings-chat-panel__switch-thumb" />
        </button>
      </div>

      <div class="settings-chat-panel__color-row">
        <span class="settings-chat-panel__label">
          {{ t('features.chat.groupReadReceiptMaxSize') }}
        </span>
        <input
          v-model.number="groupReadReceiptMaxSize"
          type="number"
          min="1"
          class="settings-chat-panel__text-input settings-chat-panel__text-input--number"
          :placeholder="t('features.chat.groupReadReceiptMaxSizePlaceholder')"
        />
      </div>
    </section>

    <!-- ===== 消息列表 ===== -->
    <section class="settings-chat-panel__section">
      <h3 class="settings-chat-panel__section-title">
        {{ t('features.chat.messageList') }}
      </h3>

      <div class="settings-chat-panel__row">
        <span class="settings-chat-panel__label">
          {{ t('features.chat.showMessageAvatar') }}
        </span>
        <button
          type="button"
          class="settings-chat-panel__switch"
          :class="{ 'settings-chat-panel__switch--active': chatMessageListShowAvatar }"
          :aria-checked="chatMessageListShowAvatar"
          role="switch"
          @click="chatMessageListShowAvatar = !chatMessageListShowAvatar"
        >
          <span class="settings-chat-panel__switch-thumb" />
        </button>
      </div>
      <p class="settings-chat-panel__desc">
        {{ t('features.chat.showMessageAvatarDesc') }}
      </p>

      <div class="settings-chat-panel__row">
        <span class="settings-chat-panel__label">
          {{ t('features.chat.showSelfAvatar') }}
        </span>
        <button
          type="button"
          class="settings-chat-panel__switch"
          :class="{ 'settings-chat-panel__switch--active': chatMessageShowSelfAvatar }"
          :aria-checked="chatMessageShowSelfAvatar"
          role="switch"
          @click="chatMessageShowSelfAvatar = !chatMessageShowSelfAvatar"
        >
          <span class="settings-chat-panel__switch-thumb" />
        </button>
      </div>
      <p class="settings-chat-panel__desc">
        {{ t('features.chat.showSelfAvatarDesc') }}
      </p>

      <div class="settings-chat-panel__row">
        <span class="settings-chat-panel__label">
          {{ t('features.chat.enableMessageSearch') }}
        </span>
        <button
          type="button"
          class="settings-chat-panel__switch"
          :class="{ 'settings-chat-panel__switch--active': chatMessageSearchEnabled }"
          :aria-checked="chatMessageSearchEnabled"
          role="switch"
          @click="chatMessageSearchEnabled = !chatMessageSearchEnabled"
        >
          <span class="settings-chat-panel__switch-thumb" />
        </button>
      </div>

      <div class="settings-chat-panel__row">
        <span
          class="settings-chat-panel__label"
          :class="{ 'settings-chat-panel__label--disabled': !chatMessageSearchEnabled }"
        >
          {{ t('features.chat.enableServerMessageSearch') }}
        </span>
        <button
          type="button"
          class="settings-chat-panel__switch"
          :class="{ 'settings-chat-panel__switch--active': chatMessageServerSearchEnabled }"
          :aria-checked="chatMessageServerSearchEnabled"
          :disabled="!chatMessageSearchEnabled"
          role="switch"
          @click="chatMessageServerSearchEnabled = !chatMessageServerSearchEnabled"
        >
          <span class="settings-chat-panel__switch-thumb" />
        </button>
      </div>
      <p class="settings-chat-panel__desc">
        {{ t('features.chat.serverMessageSearchDesc') }}
      </p>

      <div class="settings-chat-panel__subsection">
        <span class="settings-chat-panel__sub-title">
          {{ t('features.chat.showTime') }}
        </span>
        <div class="settings-chat-panel__options">
          <button
            type="button"
            class="settings-chat-panel__option"
            :class="{ 'settings-chat-panel__option--active': chatShowTime === false }"
            @click="chatShowTime = false"
          >
            {{ t('features.chat.showTimeOff') }}
          </button>
          <button
            type="button"
            class="settings-chat-panel__option"
            :class="{ 'settings-chat-panel__option--active': chatShowTime === true || chatShowTime === 'always' }"
            @click="chatShowTime = 'always'"
          >
            {{ t('features.chat.showTimeAlways') }}
          </button>
          <button
            type="button"
            class="settings-chat-panel__option"
            :class="{ 'settings-chat-panel__option--active': chatShowTime === 'hover' }"
            @click="chatShowTime = 'hover'"
          >
            {{ t('features.chat.showTimeHover') }}
          </button>
        </div>
      </div>

      <div class="settings-chat-panel__row">
        <span class="settings-chat-panel__label">
          {{ t('features.chat.showStatusText') }}
        </span>
        <button
          type="button"
          class="settings-chat-panel__switch"
          :class="{ 'settings-chat-panel__switch--active': chatMessageStatusShowText }"
          :aria-checked="chatMessageStatusShowText"
          role="switch"
          @click="chatMessageStatusShowText = !chatMessageStatusShowText"
        >
          <span class="settings-chat-panel__switch-thumb" />
        </button>
      </div>

      <div class="settings-chat-panel__subsection">
        <span class="settings-chat-panel__sub-title">
          {{ t('features.chat.statusTextPosition') }}
        </span>
        <div class="settings-chat-panel__options">
          <button
            type="button"
            class="settings-chat-panel__option"
            :class="{ 'settings-chat-panel__option--active': chatMessageStatusPosition === 'below' }"
            @click="chatMessageStatusPosition = 'below'"
          >
            {{ t('features.chat.statusTextBelow') }}
          </button>
          <button
            type="button"
            class="settings-chat-panel__option"
            :class="{ 'settings-chat-panel__option--active': chatMessageStatusPosition === 'inline' }"
            @click="chatMessageStatusPosition = 'inline'"
          >
            {{ t('features.chat.statusTextInline') }}
          </button>
        </div>
      </div>

      <div class="settings-chat-panel__subsection">
        <span class="settings-chat-panel__sub-title">
          {{ t('features.chat.statusDirection') }}
        </span>
        <div class="settings-chat-panel__options">
          <button
            type="button"
            class="settings-chat-panel__option"
            :class="{ 'settings-chat-panel__option--active': chatMessageStatusDirection === 'horizontal' }"
            @click="chatMessageStatusDirection = 'horizontal'"
          >
            {{ t('features.chat.statusDirectionHorizontal') }}
          </button>
          <button
            type="button"
            class="settings-chat-panel__option"
            :class="{ 'settings-chat-panel__option--active': chatMessageStatusDirection === 'vertical' }"
            @click="chatMessageStatusDirection = 'vertical'"
          >
            {{ t('features.chat.statusDirectionVertical') }}
          </button>
        </div>
      </div>
    </section>

    <!-- ===== 消息操作菜单 ===== -->
    <section class="settings-chat-panel__section">
      <h3 class="settings-chat-panel__section-title">
        {{ t('features.chat.messageAction') }}
      </h3>
      <p class="settings-chat-panel__desc">
        {{ t('features.chat.messageActionDesc') }}
      </p>

      <div class="settings-chat-panel__action-grid">
        <div
          v-for="key in MESSAGE_ACTION_KEYS"
          :key="key"
          class="settings-chat-panel__action-item"
        >
          <span class="settings-chat-panel__action-label">
            {{ t(`features.chat.messageActionLabels.${key}`) }}
          </span>
          <button
            type="button"
            class="settings-chat-panel__switch"
            :class="{ 'settings-chat-panel__switch--active': chatMessageAction[key] }"
            :aria-checked="chatMessageAction[key]"
            role="switch"
            @click="chatMessageAction[key] = !chatMessageAction[key]"
          >
            <span class="settings-chat-panel__switch-thumb" />
          </button>
        </div>
      </div>
    </section>

    <!-- ===== 一键重置 ===== -->
    <button
      type="button"
      class="settings-chat-panel__reset"
      @click="resetChatSettings"
    >
      {{ t('features.chat.resetAll') }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.settings-chat-panel {
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

  &__subsection {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__sub-title {
    font-size: calc(13px * var(--demo-font-scale, 1));
    color: var(--color-text-secondary);
  }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    min-height: 24px;
  }

  &__color-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    min-height: 32px;
  }

  &__label {
    font-size: calc(16px * var(--demo-font-scale, 1));
    font-weight: 500;
    color: var(--color-text);

    &--disabled {
      color: var(--color-text-secondary);
    }
  }

  &__desc {
    margin: -10px 0 0;
    font-size: calc(12px * var(--demo-font-scale, 1));
    color: var(--color-text-secondary);
    line-height: 1.5;
    text-align: right;
  }

  /* Segmented options */
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

    &:hover {
      border-color: var(--uikit-primary-color, var(--color-primary));
    }

    &--active {
      border-color: var(--uikit-primary-color, var(--color-primary));
      background-color: var(--uikit-primary-color, var(--color-primary));
      color: #ffffff;
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

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

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

  /* Feature checkboxes */
  &__feature-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  &__feature-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: calc(14px * var(--demo-font-scale, 1));
    color: var(--color-text);
    cursor: pointer;

    input {
      position: absolute;
      width: 0;
      height: 0;
      opacity: 0;
    }
  }

  &__feature-label {
    user-select: none;
  }

  &__checkmark {
    position: relative;
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    border: 2px solid var(--color-border);
    border-radius: 4px;
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

    input:checked + .settings-chat-panel__checkmark & {
      opacity: 1;
    }
  }

  /* Color / number inputs */
  &__color-inputs {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__text-input {
    width: 120px;
    height: 32px;
    padding: 0 10px;
    border: 1px solid var(--color-border);
    box-sizing: border-box;
    border-radius: 6px;
    background-color: var(--color-bg);
    color: var(--color-text);
    font-size: calc(13px * var(--demo-font-scale, 1));
    outline: none;

    &:focus {
      border-color: var(--uikit-primary-color, var(--color-primary));
    }

    &--number {
      width: 80px;
    }
  }

  &__color-input {
    width: 32px;
    height: 32px;
    padding: 0;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    background: none;
    cursor: pointer;

    &::-webkit-color-swatch-wrapper {
      padding: 0;
    }

    &::-webkit-color-swatch {
      border: none;
      border-radius: 4px;
    }
  }

  &__restore {
    height: 24px;
    padding: 0 8px;
    border: none;
    border-radius: 999px;
    background-color: transparent;
    color: var(--color-text-secondary);
    font-size: calc(12px * var(--demo-font-scale, 1));
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;

    &:hover {
      color: var(--uikit-primary-color, var(--color-primary));
      background-color: var(--color-bg-secondary);
    }
  }

  /* Message action grid */
  &__action-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  &__action-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 32px;
  }

  &__action-label {
    font-size: calc(14px * var(--demo-font-scale, 1));
    color: var(--color-text);
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
