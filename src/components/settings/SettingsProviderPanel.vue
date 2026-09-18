<script setup lang="ts">
/**
 * UIKIT特性开关 - Provider 面板
 *
 * 按设计图一比一还原，包含：
 * - 8 项 Provider 能力开关（好友列表 / 黑名单 / 在线状态 / 草稿 / ＠我 / 正在输入 / 单聊昵称 / 群聊昵称）
 * - 自定义数据源（fetchContacts）开关及「由业务接口接管拉取联系人」说明
 * - 扩展能力开关：群组体系 / 用户资料 / 用户资料订阅 / 过滤拉黑好友 / 内置 Toast
 * - 联系人拉取模式（contactFetchMode：分页 / 全量）
 * - 「开启后：」提示文案块
 * - 一键重置
 *
 * 状态来自 useDemoSettings，由 App.vue 绑定到 EmUIKitProvider。
 * 注意：开关在 Provider 挂载时读取，登录后修改需重新登录（或刷新页面）才能完整生效。
 */
import { useI18n } from 'vue-i18n'

import { useDemoSettings } from '@/composables/useDemoSettings'

defineOptions({ name: 'SettingsProviderPanel' })

const { t } = useI18n()
const {
  providerEnableContact,
  providerEnableBlocklist,
  providerEnablePresence,
  providerEnableDraft,
  providerEnableMotion,
  providerEnableTyping,
  providerShowNicknameInSingleChat,
  providerShowNicknameInGroupChat,
  providerEnableFetchContacts,
  providerEnableGroup,
  providerEnableUserInfo,
  providerEnableUserInfoSubscription,
  providerFilterBlockedContacts,
  providerEnableToast,
  providerContactFetchMode,
  resetProviderSettings,
} = useDemoSettings()
</script>

<template>
  <div class="settings-provider-panel">
    <!-- ===== 能力开关列表 ===== -->
    <div class="settings-provider-panel__switch-list">
      <div class="settings-provider-panel__switch-item">
        <span class="settings-provider-panel__label">
          {{ t('features.provider.enableContact') }}
        </span>
        <button
          type="button"
          class="settings-provider-panel__switch"
          :class="{ 'settings-provider-panel__switch--active': providerEnableContact }"
          :aria-checked="providerEnableContact"
          role="switch"
          @click="providerEnableContact = !providerEnableContact"
        >
          <span class="settings-provider-panel__switch-thumb" />
        </button>
      </div>

      <div class="settings-provider-panel__switch-item">
        <span class="settings-provider-panel__label">
          {{ t('features.provider.enableBlocklist') }}
        </span>
        <button
          type="button"
          class="settings-provider-panel__switch"
          :class="{ 'settings-provider-panel__switch--active': providerEnableBlocklist }"
          :aria-checked="providerEnableBlocklist"
          role="switch"
          @click="providerEnableBlocklist = !providerEnableBlocklist"
        >
          <span class="settings-provider-panel__switch-thumb" />
        </button>
      </div>

      <div class="settings-provider-panel__switch-item">
        <span class="settings-provider-panel__label">
          {{ t('features.provider.enablePresence') }}
        </span>
        <button
          type="button"
          class="settings-provider-panel__switch"
          :class="{ 'settings-provider-panel__switch--active': providerEnablePresence }"
          :aria-checked="providerEnablePresence"
          role="switch"
          @click="providerEnablePresence = !providerEnablePresence"
        >
          <span class="settings-provider-panel__switch-thumb" />
        </button>
      </div>

      <div class="settings-provider-panel__switch-item">
        <span class="settings-provider-panel__label">
          {{ t('features.provider.enableDraft') }}
        </span>
        <button
          type="button"
          class="settings-provider-panel__switch"
          :class="{ 'settings-provider-panel__switch--active': providerEnableDraft }"
          :aria-checked="providerEnableDraft"
          role="switch"
          @click="providerEnableDraft = !providerEnableDraft"
        >
          <span class="settings-provider-panel__switch-thumb" />
        </button>
      </div>

      <div class="settings-provider-panel__switch-item">
        <span class="settings-provider-panel__label">
          {{ t('features.provider.enableMotion') }}
        </span>
        <button
          type="button"
          class="settings-provider-panel__switch"
          :class="{ 'settings-provider-panel__switch--active': providerEnableMotion }"
          :aria-checked="providerEnableMotion"
          role="switch"
          @click="providerEnableMotion = !providerEnableMotion"
        >
          <span class="settings-provider-panel__switch-thumb" />
        </button>
      </div>

      <div class="settings-provider-panel__switch-item">
        <span class="settings-provider-panel__label">
          {{ t('features.provider.enableTyping') }}
        </span>
        <button
          type="button"
          class="settings-provider-panel__switch"
          :class="{ 'settings-provider-panel__switch--active': providerEnableTyping }"
          :aria-checked="providerEnableTyping"
          role="switch"
          @click="providerEnableTyping = !providerEnableTyping"
        >
          <span class="settings-provider-panel__switch-thumb" />
        </button>
      </div>

      <div class="settings-provider-panel__switch-item">
        <span class="settings-provider-panel__label">
          {{ t('features.provider.showNicknameInSingleChat') }}
        </span>
        <button
          type="button"
          class="settings-provider-panel__switch"
          :class="{ 'settings-provider-panel__switch--active': providerShowNicknameInSingleChat }"
          :aria-checked="providerShowNicknameInSingleChat"
          role="switch"
          @click="providerShowNicknameInSingleChat = !providerShowNicknameInSingleChat"
        >
          <span class="settings-provider-panel__switch-thumb" />
        </button>
      </div>

      <div class="settings-provider-panel__switch-item">
        <span class="settings-provider-panel__label">
          {{ t('features.provider.showNicknameInGroupChat') }}
        </span>
        <button
          type="button"
          class="settings-provider-panel__switch"
          :class="{ 'settings-provider-panel__switch--active': providerShowNicknameInGroupChat }"
          :aria-checked="providerShowNicknameInGroupChat"
          role="switch"
          @click="providerShowNicknameInGroupChat = !providerShowNicknameInGroupChat"
        >
          <span class="settings-provider-panel__switch-thumb" />
        </button>
      </div>

      <div class="settings-provider-panel__switch-item">
        <span class="settings-provider-panel__label">
          {{ t('features.provider.fetchContacts') }}
        </span>
        <button
          type="button"
          class="settings-provider-panel__switch"
          :class="{ 'settings-provider-panel__switch--active': providerEnableFetchContacts }"
          :aria-checked="providerEnableFetchContacts"
          role="switch"
          @click="providerEnableFetchContacts = !providerEnableFetchContacts"
        >
          <span class="settings-provider-panel__switch-thumb" />
        </button>
      </div>
      <p class="settings-provider-panel__row-desc">
        {{ t('features.provider.fetchContactsDesc') }}
      </p>

      <!-- ===== 扩展能力开关（Provider 组件层其余可开关能力） ===== -->
      <div class="settings-provider-panel__switch-item">
        <span class="settings-provider-panel__label">
          {{ t('features.provider.enableGroup') }}
        </span>
        <button
          type="button"
          class="settings-provider-panel__switch"
          :class="{ 'settings-provider-panel__switch--active': providerEnableGroup }"
          :aria-checked="providerEnableGroup"
          role="switch"
          @click="providerEnableGroup = !providerEnableGroup"
        >
          <span class="settings-provider-panel__switch-thumb" />
        </button>
      </div>

      <div class="settings-provider-panel__switch-item">
        <span class="settings-provider-panel__label">
          {{ t('features.provider.enableUserInfo') }}
        </span>
        <button
          type="button"
          class="settings-provider-panel__switch"
          :class="{ 'settings-provider-panel__switch--active': providerEnableUserInfo }"
          :aria-checked="providerEnableUserInfo"
          role="switch"
          @click="providerEnableUserInfo = !providerEnableUserInfo"
        >
          <span class="settings-provider-panel__switch-thumb" />
        </button>
      </div>

      <div class="settings-provider-panel__switch-item">
        <span class="settings-provider-panel__label">
          {{ t('features.provider.enableUserInfoSubscription') }}
        </span>
        <button
          type="button"
          class="settings-provider-panel__switch"
          :class="{ 'settings-provider-panel__switch--active': providerEnableUserInfoSubscription }"
          :aria-checked="providerEnableUserInfoSubscription"
          role="switch"
          @click="providerEnableUserInfoSubscription = !providerEnableUserInfoSubscription"
        >
          <span class="settings-provider-panel__switch-thumb" />
        </button>
      </div>

      <div class="settings-provider-panel__switch-item">
        <span class="settings-provider-panel__label">
          {{ t('features.provider.filterBlockedContacts') }}
        </span>
        <button
          type="button"
          class="settings-provider-panel__switch"
          :class="{ 'settings-provider-panel__switch--active': providerFilterBlockedContacts }"
          :aria-checked="providerFilterBlockedContacts"
          role="switch"
          @click="providerFilterBlockedContacts = !providerFilterBlockedContacts"
        >
          <span class="settings-provider-panel__switch-thumb" />
        </button>
      </div>

      <div class="settings-provider-panel__switch-item">
        <span class="settings-provider-panel__label">
          {{ t('features.provider.enableToast') }}
        </span>
        <button
          type="button"
          class="settings-provider-panel__switch"
          :class="{ 'settings-provider-panel__switch--active': providerEnableToast }"
          :aria-checked="providerEnableToast"
          role="switch"
          @click="providerEnableToast = !providerEnableToast"
        >
          <span class="settings-provider-panel__switch-thumb" />
        </button>
      </div>

      <!-- 联系人拉取模式：分页 / 全量 -->
      <div class="settings-provider-panel__subsection">
        <span class="settings-provider-panel__sub-title">
          {{ t('features.provider.contactFetchMode') }}
        </span>
        <div class="settings-provider-panel__options">
          <button
            type="button"
            class="settings-provider-panel__option"
            :class="{ 'settings-provider-panel__option--active': providerContactFetchMode === 'page' }"
            @click="providerContactFetchMode = 'page'"
          >
            {{ t('features.provider.contactFetchModePage') }}
          </button>
          <button
            type="button"
            class="settings-provider-panel__option"
            :class="{ 'settings-provider-panel__option--active': providerContactFetchMode === 'all' }"
            @click="providerContactFetchMode = 'all'"
          >
            {{ t('features.provider.contactFetchModeAll') }}
          </button>
        </div>
        <p class="settings-provider-panel__row-desc">
          {{ t('features.provider.contactFetchModeDesc') }}
        </p>
      </div>
    </div>

    <!-- ===== 开启后说明 ===== -->
    <div class="settings-provider-panel__notes">
      <p class="settings-provider-panel__note-title">
        {{ t('features.provider.notes.afterEnable') }}
      </p>
      <p class="settings-provider-panel__note-text">
        {{ t('features.provider.notes.defaultAllOn') }}
      </p>
      <p class="settings-provider-panel__note-text">
        {{ t('features.provider.notes.readOnMount') }}
      </p>
      <p class="settings-provider-panel__note-text">
        {{ t('features.provider.notes.customDataSource') }}
      </p>
    </div>

    <!-- ===== 一键重置 ===== -->
    <button
      type="button"
      class="settings-provider-panel__reset"
      @click="resetProviderSettings"
    >
      {{ t('features.provider.resetAll') }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.settings-provider-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;

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

  &__row-desc {
    margin: 8px 0 0;
    font-size: calc(12px * var(--demo-font-scale, 1));
    color: var(--color-text-secondary);
    line-height: 1.5;
    text-align: right;
  }

  /* 子分区（联系人拉取模式等枚举选择） */
  &__subsection {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px 0;
    border-bottom: 1px solid var(--color-border);
  }

  &__sub-title {
    font-size: calc(15px * var(--demo-font-scale, 1));
    font-weight: 500;
    color: var(--color-text);
  }

  &__options {
    display: flex;
    gap: 8px;
  }

  &__option {
    flex: 1;
    height: 32px;
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

  /* 开启后说明 */
  &__notes {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__note-title {
    margin: 0;
    font-size: calc(13px * var(--demo-font-scale, 1));
    font-weight: 500;
    color: var(--color-text);
  }

  &__note-text {
    margin: 0;
    font-size: calc(12px * var(--demo-font-scale, 1));
    color: var(--color-text-secondary);
    line-height: 1.6;
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
