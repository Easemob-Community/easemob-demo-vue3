<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { EmIcon, useUIKit, useTheme as useUIKitTheme } from '@easemob/uikit-im'
import { isKeyboardShortcutsEnabled, setKeyboardShortcutsEnabled } from '@easemob/uikit-core'

import { useDemoSettings } from '@/composables/useDemoSettings'
import { useTheme, type ThemeMode } from '@/composables/useTheme'

defineOptions({ name: 'GeneralSettings' })

const { t, locale } = useI18n()
const { mode: themeMode, setMode: setThemeMode } = useTheme()
const uikitTheme = useUIKitTheme()
const { stores } = useUIKit()
const { notificationEnable } = useDemoSettings()

/** 显示输入状态：接入 UIKit 会话 store 的 typingEnabled */
const showTyping = computed({
  get: () => stores.conversation.typingEnabled,
  set: (value) => stores.conversation.setTypingEnabled(value),
})

/** 暗黑模式：跟随系统 / 浅色 / 深色 三档，Demo 与 UIKit 主题同步切换 */
function selectThemeMode(value: ThemeMode) {
  setThemeMode(value)
  uikitTheme.setMode(value)
  darkModeOpen.value = false
}

/** 键盘操作：直连 UIKit 全局键盘快捷键开关（Esc 关闭弹层、方向键切换导航项等） */
const keyboardState = ref(isKeyboardShortcutsEnabled())
const keyboardEnabled = computed({
  get: () => keyboardState.value,
  set: (value) => {
    setKeyboardShortcutsEnabled(value)
    keyboardState.value = value
  },
})

/* ===== 下拉弹层（暗黑模式 / 语言设置）：同一时刻仅展开一个 ===== */
const darkModeOpen = ref(false)
const languageOpen = ref(false)

/** 暗黑模式选项：跟随系统 / 浅色 / 深色 */
const darkModeOptions = computed(() => [
  { label: t('theme.auto'), value: 'auto' as ThemeMode },
  { label: t('theme.light'), value: 'light' as ThemeMode },
  { label: t('theme.dark'), value: 'dark' as ThemeMode },
])

const languageOptions = computed(() => [
  { label: t('settings.general.langZh'), value: 'zh-CN' },
  { label: t('settings.general.langEn'), value: 'en-US' },
])

const currentDarkModeLabel = computed(
  () =>
    darkModeOptions.value.find((item) => item.value === themeMode.value)?.label ??
    darkModeOptions.value[0].label,
)

const currentLanguageLabel = computed(
  () =>
    languageOptions.value.find((item) => item.value === locale.value)?.label ??
    languageOptions.value[0].label,
)

function toggleDarkModePanel() {
  const willOpen = !darkModeOpen.value
  darkModeOpen.value = willOpen
  if (willOpen) {
    languageOpen.value = false
  }
}

function toggleLanguagePanel() {
  const willOpen = !languageOpen.value
  languageOpen.value = willOpen
  if (willOpen) {
    darkModeOpen.value = false
  }
}

function selectLanguage(value: string) {
  locale.value = value
  languageOpen.value = false
}
</script>

<template>
  <div class="general-settings">
    <div class="general-settings__header">
      <span class="general-settings__title">{{ t('settings.general.title') }}</span>
    </div>

    <div class="general-settings__body">
      <!-- 第一组：显示输入状态 / 暗黑模式 / 语言设置 -->
      <div class="general-settings__group">
        <div class="general-settings__item">
          <div class="general-settings__row">
            <span class="general-settings__label">{{ t('settings.general.showTyping') }}</span>
            <label class="general-settings__switch">
              <input v-model="showTyping" type="checkbox" />
              <span class="general-settings__switch-track" />
            </label>
          </div>
          <p class="general-settings__hint">{{ t('settings.general.showTypingHint') }}</p>
        </div>

        <div class="general-settings__item general-settings__popup-wrapper">
          <div
            class="general-settings__row general-settings__row--clickable"
            @click="toggleDarkModePanel"
          >
            <span class="general-settings__label">{{ t('settings.general.darkMode') }}</span>
            <span class="general-settings__value">
              {{ currentDarkModeLabel }}
              <EmIcon :name="darkModeOpen ? 'chevron/up' : 'chevron/down'" :size="16" />
            </span>
          </div>

          <div v-show="darkModeOpen" class="general-settings__popup">
            <div
              v-for="item in darkModeOptions"
              :key="item.value"
              class="general-settings__popup-item"
              @click="selectThemeMode(item.value)"
            >
              <span class="general-settings__popup-label">{{ item.label }}</span>
              <svg
                v-if="themeMode === item.value"
                class="general-settings__popup-check"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M5 12l5 5L20 7"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        <div class="general-settings__item general-settings__popup-wrapper">
          <div
            class="general-settings__row general-settings__row--clickable"
            @click="toggleLanguagePanel"
          >
            <span class="general-settings__label">{{ t('settings.general.language') }}</span>
            <span class="general-settings__value">
              {{ currentLanguageLabel }}
              <EmIcon :name="languageOpen ? 'chevron/up' : 'chevron/down'" :size="16" />
            </span>
          </div>

          <div v-show="languageOpen" class="general-settings__popup">
            <div
              v-for="item in languageOptions"
              :key="item.value"
              class="general-settings__popup-item"
              @click="selectLanguage(item.value)"
            >
              <span class="general-settings__popup-label">{{ item.label }}</span>
              <svg
                v-if="locale === item.value"
                class="general-settings__popup-check"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M5 12l5 5L20 7"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 第二组：消息通知 -->
      <div class="general-settings__group">
        <div class="general-settings__item">
          <div class="general-settings__row">
            <span class="general-settings__label">{{
              t('settings.general.messageNotification')
            }}</span>
            <label class="general-settings__switch">
              <input v-model="notificationEnable" type="checkbox" />
              <span class="general-settings__switch-track" />
            </label>
          </div>
          <p class="general-settings__hint">{{ t('settings.general.messageNotificationHint') }}</p>
        </div>
      </div>

      <!-- 第三组：键盘操作 -->
      <div class="general-settings__group">
        <div class="general-settings__item">
          <div class="general-settings__row">
            <span class="general-settings__label">{{
              t('settings.general.keyboardOperation')
            }}</span>
            <label class="general-settings__switch">
              <input v-model="keyboardEnabled" type="checkbox" />
              <span class="general-settings__switch-track" />
            </label>
          </div>
          <p class="general-settings__hint">{{ t('settings.general.keyboardOperationHint') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.general-settings {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: var(--color-bg);

  /* 与另外两个设置面板头部统一：60px 高、18px 标题、无底线 */
  &__header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    min-height: 60px;
    padding: 0 16px;
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
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 24px;
    box-sizing: border-box;
  }

  /* 设计稿内容列宽 520px 居中，组间距 16px */
  &__group {
    width: 100%;
    max-width: 520px;
  }

  /* 行高 54px，左 14px / 右 12px 内边距，底部 1px 分割线 */
  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 54px;
    padding: 0 12px 0 14px;
    border-bottom: 1px solid var(--color-border);
    box-sizing: border-box;

    &--clickable {
      cursor: pointer;
    }
  }

  &__label {
    font-size: calc(14px * var(--demo-font-scale, 1));
    font-weight: 500;
    color: var(--color-text);
  }

  &__value {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-size: calc(14px * var(--demo-font-scale, 1));
    font-weight: 500;
    color: var(--color-text-secondary);
  }

  /* 行下方说明文案：28px 高、右对齐、12px 次级色 */
  &__hint {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 28px;
    margin: 0;
    padding: 0 12px 0 14px;
    font-size: calc(12px * var(--demo-font-scale, 1));
    color: var(--color-text-secondary);
    box-sizing: border-box;
  }

  /* 开关：40×28 点击区内嵌 36×20 轨道 + 18px 滑块（对齐设计稿 Switches 组件） */
  &__switch {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 28px;
    flex-shrink: 0;
    cursor: pointer;

    input {
      position: absolute;
      width: 0;
      height: 0;
      opacity: 0;
    }
  }

  &__switch-track {
    position: relative;
    width: 36px;
    height: 20px;
    background: var(--color-border);
    border-radius: 10px;
    transition: background-color 0.2s;

    &::after {
      position: absolute;
      top: 1px;
      left: 1px;
      width: 18px;
      height: 18px;
      content: '';
      background: #ffffff;
      border-radius: 50%;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
      transition: transform 0.2s;
    }
  }

  &__switch input:checked + &__switch-track {
    background: var(--uikit-primary-color, var(--color-primary));
  }

  &__switch input:checked + &__switch-track::after {
    transform: translateX(16px);
  }

  /* 下拉弹层：220px 宽、4px 内边距、次级底色 + 1px 描边（对齐设计稿 overflowmenu） */
  &__popup-wrapper {
    position: relative;
  }

  &__popup {
    position: absolute;
    top: calc(100% + 4px);
    right: 12px;
    left: auto;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 220px;
    padding: 4px;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    box-sizing: border-box;
    box-shadow:
      0 4px 8px rgba(23, 26, 28, 0.1),
      0 1px 3px rgba(70, 78, 83, 0.15);
  }

  &__popup-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 36px;
    padding: 0 8px 0 12px;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background: var(--color-bg);
    }
  }

  &__popup-label {
    font-size: calc(14px * var(--demo-font-scale, 1));
    font-weight: 500;
    color: var(--color-text);
  }

  &__popup-check {
    width: 14px;
    height: 14px;
    color: var(--color-text);
  }
}
</style>
