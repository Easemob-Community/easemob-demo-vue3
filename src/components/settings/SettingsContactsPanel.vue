<script setup lang="ts">
/**
 * UIKIT特性开关 - 通讯录面板
 *
 * 包含：
 * - 联系人搜索控制（首页 / 联系人子视图 / 群组子视图的搜索框显隐）
 * - 通讯录入口显隐（通知 / 联系人 / 群组 / 黑名单）
 * - 子视图头部按钮显隐（添加好友 / 创建群组 / 添加黑名单）
 * - 一键重置
 *
 * 状态来自 useDemoSettings，由 contacts/index.vue 绑定到 EmContactContainer。
 */
import { useI18n } from 'vue-i18n'

import { useDemoSettings } from '@/composables/useDemoSettings'

defineOptions({ name: 'SettingsContactsPanel' })

const { t } = useI18n()
const {
  contactShowHomeSearch,
  contactShowContactSearch,
  contactShowGroupSearch,
  contactShowNotice,
  contactShowContactEntry,
  contactShowGroupEntry,
  contactShowBlocklist,
  contactShowContactAddButton,
  contactShowGroupCreateButton,
  contactShowBlocklistAddButton,
  resetContactSettings,
} = useDemoSettings()
</script>

<template>
  <div class="settings-contacts-panel">
    <!-- ===== 联系人搜索控制 ===== -->
    <section class="settings-contacts-panel__section">
      <h3 class="settings-contacts-panel__section-title">
        {{ t('features.contact.searchControl') }}
      </h3>

      <div class="settings-contacts-panel__switch-list">
        <div class="settings-contacts-panel__switch-item">
          <span class="settings-contacts-panel__label">
            {{ t('features.contact.showSearch.home') }}
          </span>
          <button
            type="button"
            class="settings-contacts-panel__switch"
            :class="{ 'settings-contacts-panel__switch--active': contactShowHomeSearch }"
            :aria-checked="contactShowHomeSearch"
            role="switch"
            @click="contactShowHomeSearch = !contactShowHomeSearch"
          >
            <span class="settings-contacts-panel__switch-thumb" />
          </button>
        </div>

        <div class="settings-contacts-panel__switch-item">
          <span class="settings-contacts-panel__label">
            {{ t('features.contact.showSearch.contact') }}
          </span>
          <button
            type="button"
            class="settings-contacts-panel__switch"
            :class="{ 'settings-contacts-panel__switch--active': contactShowContactSearch }"
            :aria-checked="contactShowContactSearch"
            role="switch"
            @click="contactShowContactSearch = !contactShowContactSearch"
          >
            <span class="settings-contacts-panel__switch-thumb" />
          </button>
        </div>

        <div class="settings-contacts-panel__switch-item">
          <span class="settings-contacts-panel__label">
            {{ t('features.contact.showSearch.group') }}
          </span>
          <button
            type="button"
            class="settings-contacts-panel__switch"
            :class="{ 'settings-contacts-panel__switch--active': contactShowGroupSearch }"
            :aria-checked="contactShowGroupSearch"
            role="switch"
            @click="contactShowGroupSearch = !contactShowGroupSearch"
          >
            <span class="settings-contacts-panel__switch-thumb" />
          </button>
        </div>
      </div>

      <p class="settings-contacts-panel__desc">
        {{ t('features.contact.searchControlDesc') }}
      </p>
    </section>

    <!-- ===== 通讯录入口显隐 ===== -->
    <section class="settings-contacts-panel__section">
      <h3 class="settings-contacts-panel__section-title">
        {{ t('features.contact.entryVisibility') }}
      </h3>

      <div class="settings-contacts-panel__switch-list">
        <div class="settings-contacts-panel__switch-item">
          <span class="settings-contacts-panel__label">
            {{ t('features.contact.showEntry.notice') }}
          </span>
          <button
            type="button"
            class="settings-contacts-panel__switch"
            :class="{ 'settings-contacts-panel__switch--active': contactShowNotice }"
            :aria-checked="contactShowNotice"
            role="switch"
            @click="contactShowNotice = !contactShowNotice"
          >
            <span class="settings-contacts-panel__switch-thumb" />
          </button>
        </div>

        <div class="settings-contacts-panel__switch-item">
          <span class="settings-contacts-panel__label">
            {{ t('features.contact.showEntry.contact') }}
          </span>
          <button
            type="button"
            class="settings-contacts-panel__switch"
            :class="{ 'settings-contacts-panel__switch--active': contactShowContactEntry }"
            :aria-checked="contactShowContactEntry"
            role="switch"
            @click="contactShowContactEntry = !contactShowContactEntry"
          >
            <span class="settings-contacts-panel__switch-thumb" />
          </button>
        </div>

        <div class="settings-contacts-panel__switch-item">
          <span class="settings-contacts-panel__label">
            {{ t('features.contact.showEntry.group') }}
          </span>
          <button
            type="button"
            class="settings-contacts-panel__switch"
            :class="{ 'settings-contacts-panel__switch--active': contactShowGroupEntry }"
            :aria-checked="contactShowGroupEntry"
            role="switch"
            @click="contactShowGroupEntry = !contactShowGroupEntry"
          >
            <span class="settings-contacts-panel__switch-thumb" />
          </button>
        </div>

        <div class="settings-contacts-panel__switch-item">
          <span class="settings-contacts-panel__label">
            {{ t('features.contact.showEntry.blocklist') }}
          </span>
          <button
            type="button"
            class="settings-contacts-panel__switch"
            :class="{ 'settings-contacts-panel__switch--active': contactShowBlocklist }"
            :aria-checked="contactShowBlocklist"
            role="switch"
            @click="contactShowBlocklist = !contactShowBlocklist"
          >
            <span class="settings-contacts-panel__switch-thumb" />
          </button>
        </div>
      </div>

      <p class="settings-contacts-panel__desc">
        {{ t('features.contact.entryVisibilityDesc') }}
      </p>
    </section>

    <!-- ===== 子视图头部按钮显隐 ===== -->
    <section class="settings-contacts-panel__section">
      <h3 class="settings-contacts-panel__section-title">
        {{ t('features.contact.headerButtons') }}
      </h3>

      <div class="settings-contacts-panel__switch-list">
        <div class="settings-contacts-panel__switch-item">
          <span class="settings-contacts-panel__label">
            {{ t('features.contact.showHeaderButton.contactAdd') }}
          </span>
          <button
            type="button"
            class="settings-contacts-panel__switch"
            :class="{ 'settings-contacts-panel__switch--active': contactShowContactAddButton }"
            :aria-checked="contactShowContactAddButton"
            role="switch"
            @click="contactShowContactAddButton = !contactShowContactAddButton"
          >
            <span class="settings-contacts-panel__switch-thumb" />
          </button>
        </div>

        <div class="settings-contacts-panel__switch-item">
          <span class="settings-contacts-panel__label">
            {{ t('features.contact.showHeaderButton.groupCreate') }}
          </span>
          <button
            type="button"
            class="settings-contacts-panel__switch"
            :class="{ 'settings-contacts-panel__switch--active': contactShowGroupCreateButton }"
            :aria-checked="contactShowGroupCreateButton"
            role="switch"
            @click="contactShowGroupCreateButton = !contactShowGroupCreateButton"
          >
            <span class="settings-contacts-panel__switch-thumb" />
          </button>
        </div>

        <div class="settings-contacts-panel__switch-item">
          <span class="settings-contacts-panel__label">
            {{ t('features.contact.showHeaderButton.blocklistAdd') }}
          </span>
          <button
            type="button"
            class="settings-contacts-panel__switch"
            :class="{ 'settings-contacts-panel__switch--active': contactShowBlocklistAddButton }"
            :aria-checked="contactShowBlocklistAddButton"
            role="switch"
            @click="contactShowBlocklistAddButton = !contactShowBlocklistAddButton"
          >
            <span class="settings-contacts-panel__switch-thumb" />
          </button>
        </div>
      </div>

      <p class="settings-contacts-panel__desc">
        {{ t('features.contact.headerButtonsDesc') }}
      </p>
    </section>

    <!-- ===== 一键重置 ===== -->
    <button
      type="button"
      class="settings-contacts-panel__reset"
      @click="resetContactSettings"
    >
      {{ t('features.contact.resetAll') }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.settings-contacts-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;

  &__section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__section-title {
    margin: 0;
    font-size: calc(13px * var(--demo-font-scale, 1));
    font-weight: 600;
    color: var(--color-text-secondary);
  }

  &__switch-list {
    display: flex;
    flex-direction: column;
  }

  &__switch-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    min-height: 48px;
    border-bottom: 1px solid var(--color-border);

    &:first-child {
      border-top: 1px solid var(--color-border);
    }
  }

  &__label {
    font-size: calc(15px * var(--demo-font-scale, 1));
    font-weight: 500;
    color: var(--color-text);
  }

  &__desc {
    margin: -4px 0 0;
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
