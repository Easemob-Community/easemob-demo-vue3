<script setup lang="ts">
/**
 * UIKIT特性开关 - 日志获取面板
 *
 * 能力：
 * - 收集 SDK 日志开关（UIKit 运行日志默认持久化，此开关额外控制 SDK 层日志）
 * - UIKit / SDK 日志级别选择
 * - 导出持久化日志为 .log 文件
 * - 清空本地持久化日志
 * - 按设计图要求：无「一键重置」按钮，无「开发者友好模式」
 */
import { useI18n } from 'vue-i18n'
import { clearPersistedLogs, exportPersistedLogs } from '@easemob/uikit-im'

import { useDemoSettings } from '@/composables/useDemoSettings'

type UikitLogLevel = 'debug' | 'info' | 'warn' | 'error'
type SdkLogLevel = 'debug' | 'warn' | 'error'

const UIKIT_LEVELS: UikitLogLevel[] = ['debug', 'info', 'warn', 'error']
const SDK_LEVELS: SdkLogLevel[] = ['debug', 'warn', 'error']

defineOptions({ name: 'SettingsLogPanel' })

const { t } = useI18n()
const {
  logCollectionEnabled,
  uikitLogLevel,
  sdkLogLevel,
  logActionTip,
  setUikitLogLevel,
  setSdkLogLevel,
} = useDemoSettings()

async function onExportLogs() {
  const count = await exportPersistedLogs()
  logActionTip.value = t('features.logs.exportSuccess', { count })
}

async function onClearLogs() {
  await clearPersistedLogs()
  logActionTip.value = t('features.logs.clearSuccess')
}
</script>

<template>
  <div class="settings-log-panel">
    <!-- ===== 收集 SDK 日志 ===== -->
    <section class="settings-log-panel__section">
      <div class="settings-log-panel__row">
        <span class="settings-log-panel__label">
          {{ t('features.logs.collectSdkLog') }}
        </span>
        <button
          type="button"
          class="settings-log-panel__switch"
          :class="{ 'settings-log-panel__switch--active': logCollectionEnabled }"
          :aria-checked="logCollectionEnabled"
          role="switch"
          @click="logCollectionEnabled = !logCollectionEnabled"
        >
          <span class="settings-log-panel__switch-thumb" />
        </button>
      </div>
      <p class="settings-log-panel__desc">
        {{ t('features.logs.collectSdkLogDesc') }}
      </p>
    </section>

    <!-- ===== 日志级别 ===== -->
    <section class="settings-log-panel__section">
      <div class="settings-log-panel__level-row">
        <span class="settings-log-panel__level-label">
          {{ t('features.logs.uikitLogLevel') }}
        </span>
        <div class="settings-log-panel__options">
          <button
            v-for="lv in UIKIT_LEVELS"
            :key="lv"
            type="button"
            class="settings-log-panel__option"
            :class="{ 'settings-log-panel__option--active': uikitLogLevel === lv }"
            @click="setUikitLogLevel(lv)"
          >
            {{ lv }}
          </button>
        </div>
      </div>

      <div class="settings-log-panel__level-row">
        <span class="settings-log-panel__level-label">
          {{ t('features.logs.sdkLogLevel') }}
        </span>
        <div class="settings-log-panel__options">
          <button
            v-for="lv in SDK_LEVELS"
            :key="lv"
            type="button"
            class="settings-log-panel__option"
            :class="{ 'settings-log-panel__option--active': sdkLogLevel === lv }"
            @click="setSdkLogLevel(lv)"
          >
            {{ lv }}
          </button>
        </div>
      </div>
    </section>

    <!-- ===== 导出 / 清空日志 ===== -->
    <section class="settings-log-panel__section">
      <div class="settings-log-panel__action-row">
        <span class="settings-log-panel__label">
          {{ t('features.logs.exportLogs') }}
        </span>
        <button
          type="button"
          class="settings-log-panel__text-btn"
          @click="onExportLogs"
        >
          {{ t('features.logs.clickToDownload') }}
        </button>
      </div>

      <div class="settings-log-panel__action-row">
        <span class="settings-log-panel__label">
          {{ t('features.logs.clearLogs') }}
        </span>
        <button
          type="button"
          class="settings-log-panel__outline-btn"
          @click="onClearLogs"
        >
          {{ t('features.logs.clear') }}
        </button>
      </div>

      <p v-if="logActionTip" class="settings-log-panel__tip">
        {{ logActionTip }}
      </p>
    </section>

    <!-- ===== 说明 ===== -->
    <section class="settings-log-panel__notes">
      <p>{{ t('features.logs.notes.levelScope') }}</p>
      <p>{{ t('features.logs.notes.productionSuggestion') }}</p>
      <p>{{ t('features.logs.notes.exportFormat') }}</p>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.settings-log-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;

  &__section {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  &__row,
  &__action-row,
  &__level-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    min-height: 24px;
  }

  &__level-row {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  &__label {
    font-size: 16px;
    font-weight: 500;
    color: var(--color-text);
  }

  &__level-label {
    font-size: 16px;
    font-weight: 500;
    color: var(--color-text);
    flex-shrink: 0;
    padding-top: 4px;
  }

  &__desc {
    margin: -10px 0 0;
    font-size: 12px;
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

  /* Options buttons */
  &__options {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__option {
    display: inline-flex;
    align-items: center;
    height: 32px;
    padding: 0 14px;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    background: transparent;
    color: var(--color-text);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.15s;

    &:hover {
      border-color: var(--uikit-primary-color, var(--color-primary));
      color: var(--uikit-primary-color, var(--color-primary));
    }

    &--active {
      border-color: var(--uikit-primary-color, var(--color-primary));
      background-color: var(--uikit-primary-color, var(--color-primary));
      color: #ffffff;

      &:hover {
        color: #ffffff;
      }
    }
  }

  /* Text button (click to download) */
  &__text-btn {
    padding: 0;
    border: none;
    background: transparent;
    color: var(--uikit-primary-color, var(--color-primary));
    font-size: 14px;
    cursor: pointer;
    transition: opacity 0.15s;

    &:hover {
      opacity: 0.8;
    }
  }

  /* Outline button (clear) */
  &__outline-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    padding: 0 14px;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    background: transparent;
    color: var(--color-text);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.15s;

    &:hover {
      border-color: var(--uikit-primary-color, var(--color-primary));
      color: var(--uikit-primary-color, var(--color-primary));
    }
  }

  &__tip {
    margin: 0;
    font-size: 12px;
    color: var(--uikit-primary-color, var(--color-primary));
  }

  &__notes {
    display: flex;
    flex-direction: column;
    gap: 8px;

    p {
      margin: 0;
      font-size: 12px;
      color: var(--color-text-secondary);
      line-height: 1.5;
    }
  }
}
</style>
