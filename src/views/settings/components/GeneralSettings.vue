<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  isKeyboardShortcutsEnabled,
  setKeyboardShortcutsEnabled,
  useNotification,
  useUIKit,
} from '@easemob/uikit-im'

import { useTheme, type ThemeMode } from '@/composables/useTheme'

defineOptions({ name: 'GeneralSettings' })

const { t, locale } = useI18n()
const { mode: themeMode, setMode: setThemeMode } = useTheme()
const { stores } = useUIKit()
const notification = useNotification()

/** 显示输入状态：接入 UIKit 会话 store 的 typingEnabled */
const showTyping = computed({
  get: () => stores.conversation.typingEnabled,
  set: (value) => stores.conversation.setTypingEnabled(value),
})

/** 消息通知：接入 UIKit useNotification 总开关 */
const messageNotification = computed({
  get: () => notification.state.value.enabled,
  set: (value) => notification.setEnabled(value),
})

/** 键盘操作：接入 UIKit 全局键盘快捷键开关 */
const keyboardOperation = computed({
  get: () => isKeyboardShortcutsEnabled(),
  set: (value) => setKeyboardShortcutsEnabled(value),
})

const theme = ref('classic')

const languageOpen = ref(false)
const themeModeOpen = ref(false)

const themeOptions = [{ label: t('settings.general.themeClassic'), value: 'classic' }]

const languageOptions = [
  { label: t('settings.general.langZh'), value: 'zh-CN' },
  { label: t('settings.general.langEn'), value: 'en-US' },
]

const themeModeOptions = [
  { label: t('theme.auto'), value: 'auto' as ThemeMode },
  { label: t('theme.light'), value: 'light' as ThemeMode },
  { label: t('theme.dark'), value: 'dark' as ThemeMode },
]

const currentLanguageLabel = computed(
  () =>
    languageOptions.find((item) => item.value === locale.value)?.label ?? languageOptions[0].label,
)

const currentThemeLabel = computed(
  () => themeOptions.find((item) => item.value === theme.value)?.label ?? themeOptions[0].label,
)

const currentThemeModeLabel = computed(
  () =>
    themeModeOptions.find((item) => item.value === themeMode.value)?.label ??
    themeModeOptions[0].label,
)

function toggleLanguagePanel() {
  languageOpen.value = !languageOpen.value
}

function selectLanguage(value: string) {
  locale.value = value
  languageOpen.value = false
}

function toggleThemeModePanel() {
  themeModeOpen.value = !themeModeOpen.value
}

function selectThemeMode(value: ThemeMode) {
  setThemeMode(value)
  themeModeOpen.value = false
}
</script>

<template>
  <div class="general-settings">
    <div class="general-settings__header">
      <span class="general-settings__title">{{ t('settings.general.title') }}</span>
    </div>

    <div class="general-settings__body">
      <div class="general-settings__section">
        <div class="general-settings__row">
          <span class="general-settings__label">{{ t('settings.general.showTyping') }}</span>
          <label class="general-settings__switch">
            <input v-model="showTyping" type="checkbox" />
            <span class="general-settings__switch-track" />
          </label>
        </div>
        <p class="general-settings__hint">{{ t('settings.general.showTypingHint') }}</p>

        <div class="general-settings__row general-settings__row--clickable">
          <span class="general-settings__label">{{ t('settings.general.darkMode') }}</span>
          <span class="general-settings__value" @click="toggleThemeModePanel">
            {{ currentThemeModeLabel }}
            <span
              class="general-settings__arrow"
              :class="{ 'general-settings__arrow--up': themeModeOpen }"
            >
              ›
            </span>
          </span>
        </div>

        <div v-show="themeModeOpen" class="general-settings__dropdown">
          <div
            v-for="item in themeModeOptions"
            :key="item.value"
            class="general-settings__dropdown-item"
            :class="{ 'general-settings__dropdown-item--active': themeMode === item.value }"
            @click="selectThemeMode(item.value)"
          >
            {{ item.label }}
          </div>
        </div>
      </div>

      <div class="general-settings__section">
        <div class="general-settings__row general-settings__row--clickable">
          <span class="general-settings__label">{{ t('settings.general.switchTheme') }}</span>
          <span class="general-settings__value">
            {{ currentThemeLabel }}
            <span class="general-settings__arrow">›</span>
          </span>
        </div>

        <div class="general-settings__row general-settings__row--clickable">
          <span class="general-settings__label">{{ t('settings.general.setColor') }}</span>
          <span class="general-settings__value">
            <span class="general-settings__arrow">›</span>
          </span>
        </div>

        <div class="general-settings__row general-settings__row--clickable">
          <span class="general-settings__label">{{ t('settings.general.language') }}</span>
          <span class="general-settings__value" @click="toggleLanguagePanel">
            {{ currentLanguageLabel }}
            <span
              class="general-settings__arrow"
              :class="{ 'general-settings__arrow--up': languageOpen }"
            >
              ›
            </span>
          </span>
        </div>

        <div v-show="languageOpen" class="general-settings__dropdown">
          <div
            v-for="item in languageOptions"
            :key="item.value"
            class="general-settings__dropdown-item"
            :class="{ 'general-settings__dropdown-item--active': locale === item.value }"
            @click="selectLanguage(item.value)"
          >
            {{ item.label }}
          </div>
        </div>
      </div>

      <div class="general-settings__section">
        <div class="general-settings__row">
          <span class="general-settings__label">{{
            t('settings.general.messageNotification')
          }}</span>
          <label class="general-settings__switch">
            <input v-model="messageNotification" type="checkbox" />
            <span class="general-settings__switch-track" />
          </label>
        </div>
        <p class="general-settings__hint">{{ t('settings.general.messageNotificationHint') }}</p>

        <div class="general-settings__row">
          <span class="general-settings__label">{{ t('settings.general.keyboardOperation') }}</span>
          <label class="general-settings__switch">
            <input v-model="keyboardOperation" type="checkbox" />
            <span class="general-settings__switch-track" />
          </label>
        </div>
        <p class="general-settings__hint">{{ t('settings.general.keyboardOperationHint') }}</p>
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

  &__header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    height: 56px;
    padding: 0 24px;
    border-bottom: 1px solid var(--color-border);
  }

  &__title {
    font-size: 16px;
    font-weight: 500;
    color: var(--color-text);
  }

  &__body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 24px;
  }

  &__section {
    max-width: 560px;
    margin: 0 auto 24px;
    padding: 0 16px;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 52px;
    padding: 12px 0;
    border-bottom: 1px solid var(--color-border);

    &:last-child {
      border-bottom: none;
    }

    &--clickable {
      cursor: pointer;
    }
  }

  &__label {
    font-size: 14px;
    color: var(--color-text);
  }

  &__value {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    color: var(--color-text-secondary);
    cursor: pointer;
  }

  &__arrow {
    display: inline-block;
    font-size: 16px;
    transform: rotate(90deg);
    transition: transform 0.2s;

    &--up {
      transform: rotate(-90deg);
    }
  }

  &__hint {
    margin: 0;
    padding: 0 0 12px;
    font-size: 12px;
    color: var(--color-text-secondary);
    text-align: right;
  }

  &__switch {
    position: relative;
    display: inline-flex;
    align-items: center;
    width: 40px;
    height: 22px;
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
    width: 100%;
    height: 100%;
    background: var(--color-border);
    border-radius: 11px;
    transition: background-color 0.2s;

    &::after {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 18px;
      height: 18px;
      content: '';
      background: var(--color-bg);
      border-radius: 50%;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
      transition: transform 0.2s;
    }
  }

  &__switch input:checked + &__switch-track {
    background: var(--color-primary);
  }

  &__switch input:checked + &__switch-track::after {
    transform: translateX(18px);
  }

  &__dropdown {
    margin: -8px 0 8px;
    padding: 4px 0;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  &__dropdown-item {
    padding: 10px 16px;
    font-size: 14px;
    color: var(--color-text);
    cursor: pointer;

    &:hover {
      background: var(--color-bg-secondary);
    }

    &--active {
      color: var(--color-primary);
    }
  }
}
</style>
