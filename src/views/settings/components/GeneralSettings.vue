<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUIKit } from '@easemob/uikit-im'

import { useDemoSettings } from '@/composables/useDemoSettings'
import { useTheme, type ThemeMode } from '@/composables/useTheme'

defineOptions({ name: 'GeneralSettings' })

const { t, locale } = useI18n()
const { mode: themeMode, setMode: setThemeMode } = useTheme()
const { stores } = useUIKit()
const { notificationEnable } = useDemoSettings()

/** 显示输入状态：接入 UIKit 会话 store 的 typingEnabled */
const showTyping = computed({
  get: () => stores.conversation.typingEnabled,
  set: (value) => stores.conversation.setTypingEnabled(value),
})

const languageOpen = ref(false)
const themeModeOpen = ref(false)

const languageOptions = computed(() => [
  { label: t('settings.general.langZh'), value: 'zh-CN' },
  { label: t('settings.general.langEn'), value: 'en-US' },
])

const themeModeOptions = computed(() => [
  { label: t('theme.auto'), value: 'auto' as ThemeMode },
  { label: t('theme.light'), value: 'light' as ThemeMode },
  { label: t('theme.dark'), value: 'dark' as ThemeMode },
])

const currentLanguageLabel = computed(
  () =>
    languageOptions.value.find((item) => item.value === locale.value)?.label ??
    languageOptions.value[0].label,
)

const currentThemeModeLabel = computed(
  () =>
    themeModeOptions.value.find((item) => item.value === themeMode.value)?.label ??
    themeModeOptions.value[0].label,
)

function toggleLanguagePanel() {
  const willOpen = !languageOpen.value
  languageOpen.value = willOpen
  if (willOpen) {
    themeModeOpen.value = false
  }
}

function selectLanguage(value: string) {
  locale.value = value
  languageOpen.value = false
}

function toggleThemeModePanel() {
  const willOpen = !themeModeOpen.value
  themeModeOpen.value = willOpen
  if (willOpen) {
    languageOpen.value = false
  }
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

        <div class="general-settings__row">
          <span class="general-settings__label">{{ t('settings.general.messageNotification') }}</span>
          <label class="general-settings__switch">
            <input v-model="notificationEnable" type="checkbox" />
            <span class="general-settings__switch-track" />
          </label>
        </div>
        <p class="general-settings__hint">{{ t('settings.general.messageNotificationHint') }}</p>

        <div class="general-settings__popup-wrapper">
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

          <div v-show="themeModeOpen" class="general-settings__popup">
            <div
              v-for="item in themeModeOptions"
              :key="item.value"
              class="general-settings__popup-item"
              :class="{ 'general-settings__popup-item--active': themeMode === item.value }"
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
      </div>

      <div class="general-settings__section">
        <div class="general-settings__popup-wrapper">
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

          <div v-show="languageOpen" class="general-settings__popup">
            <div
              v-for="item in languageOptions"
              :key="item.value"
              class="general-settings__popup-item"
              :class="{ 'general-settings__popup-item--active': locale === item.value }"
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

  /* 下拉弹层：展示在切换行下方，深色模式与语言切换共用 */
  &__popup-wrapper {
    position: relative;
  }

  &__popup {
    position: absolute;
    top: calc(100% - 4px);
    right: 0;
    left: auto;
    z-index: 10;
    min-width: 120px;
    max-width: 180px;
    padding: 8px 0;
    background: var(--color-bg);
    border-radius: 12px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  }

  &__popup-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 48px;
    padding: 0 20px;
    cursor: pointer;

    &:hover {
      background: var(--color-bg-secondary);
    }

    &--active {
      .general-settings__popup-label {
        color: var(--color-primary);
      }

      .general-settings__popup-check {
        color: var(--color-primary);
      }
    }
  }

  &__popup-label {
    font-size: 15px;
    color: var(--color-text);
  }

  &__popup-check {
    width: 18px;
    height: 18px;
  }

}
</style>
