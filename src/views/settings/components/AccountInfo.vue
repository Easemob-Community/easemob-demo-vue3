<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { EmAvatar } from '@easemob/uikit-im'

import { useUserStore } from '@/store/modules/user'

defineOptions({ name: 'AccountInfo' })

const { t } = useI18n()
const userStore = useUserStore()

// TODO：后续接入真实用户信息与编辑能力
const nickname = ref('烈焰威风')
const signature = ref('人生活不止靠饼')
const userId = computed(() => userStore.userId || 'supercalifragilisticexpialidocious')
const avatarUrl = ref('')
</script>

<template>
  <div class="account-info">
    <div class="account-info__header">
      <span class="account-info__title">{{ t('settings.account.title') }}</span>
    </div>

    <div class="account-info__body">
      <div class="account-info__profile">
        <EmAvatar
          :size="80"
          :src="avatarUrl"
          :name="nickname"
          shape="circle"
          presence="online"
          class="account-info__avatar"
        />
        <h2 class="account-info__nickname">{{ nickname }}</h2>
        <div class="account-info__user-id">
          <span>ID: {{ userId }}</span>
          <button type="button" class="account-info__icon-btn" :aria-label="t('common.copy')">
            <svg class="account-info__icon" viewBox="0 0 24 24" fill="none">
              <rect
                x="9"
                y="9"
                width="10"
                height="10"
                rx="2"
                stroke="currentColor"
                stroke-width="1.5"
              />
              <path
                d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3"
                stroke="currentColor"
                stroke-width="1.5"
              />
            </svg>
          </button>
        </div>
      </div>

      <div class="account-info__form">
        <div class="account-info__row">
          <span class="account-info__label">{{ t('settings.account.nickname') }}</span>
          <div class="account-info__field">
            <span class="account-info__field-text">{{ nickname }}</span>
            <button type="button" class="account-info__icon-btn" :aria-label="t('common.edit')">
              <svg class="account-info__icon" viewBox="0 0 24 24" fill="none">
                <path
                  d="M13 3l8 8-9 9H4v-8L13 3z"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="account-info__row">
          <span class="account-info__label">{{ t('settings.account.avatar') }}</span>
          <div class="account-info__field">
            <EmAvatar
              :size="32"
              :src="avatarUrl"
              :name="nickname"
              shape="circle"
              class="account-info__field-avatar"
            />
            <button type="button" class="account-info__icon-btn" :aria-label="t('common.edit')">
              <svg class="account-info__icon" viewBox="0 0 24 24" fill="none">
                <path
                  d="M13 3l8 8-9 9H4v-8L13 3z"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="account-info__row">
          <span class="account-info__label">{{ t('settings.account.signature') }}</span>
          <div class="account-info__field">
            <span class="account-info__field-text">{{ signature }}</span>
            <button type="button" class="account-info__icon-btn" :aria-label="t('common.edit')">
              <svg class="account-info__icon" viewBox="0 0 24 24" fill="none">
                <path
                  d="M13 3l8 8-9 9H4v-8L13 3z"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="account-info__actions">
        <button type="button" class="account-info__btn">
          <svg class="account-info__btn-icon" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.5" />
            <path
              d="M4 20c0-4 4-6 8-6s8 2 8 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <path
              d="M17 11l4 4m0-4l-4 4"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
          <span>{{ t('settings.account.deactivateAccount') }}</span>
        </button>
        <button type="button" class="account-info__btn">
          <svg class="account-info__btn-icon" viewBox="0 0 24 24" fill="none">
            <path
              d="M10 16H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <path
              d="M16 17l5-5m0 5l-5-5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path d="M21 12H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
          <span>{{ t('settings.account.logout') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.account-info {
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
    padding: 32px 24px;
  }

  &__profile {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 32px;
  }

  &__avatar {
    font-size: 28px;
    font-weight: 500;
  }

  &__nickname {
    margin: 16px 0 0;
    font-size: 18px;
    font-weight: 500;
    color: var(--color-text);
  }

  &__user-id {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 6px;
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  &__icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    color: var(--color-text-secondary);
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 4px;
    transition:
      color 0.2s,
      background-color 0.2s;

    &:hover {
      color: var(--color-primary);
      background: var(--color-bg-secondary);
    }
  }

  &__icon {
    width: 16px;
    height: 16px;
  }

  &__form {
    max-width: 560px;
    margin: 0 auto 32px;
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
  }

  &__label {
    font-size: 14px;
    color: var(--color-text);
  }

  &__field {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  &__field-text {
    font-size: 14px;
    color: var(--color-text-secondary);
  }

  &__field-avatar {
    font-size: 12px;
    font-weight: 500;
  }

  &__actions {
    display: flex;
    gap: 16px;
    justify-content: center;
    max-width: 560px;
    margin: 0 auto;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    flex: 1;
    height: 40px;
    padding: 0 16px;
    font-size: 14px;
    color: var(--color-text);
    cursor: pointer;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    transition:
      background-color 0.2s,
      border-color 0.2s;

    &:hover {
      background: var(--color-border);
    }
  }

  &__btn-icon {
    width: 18px;
    height: 18px;
  }
}
</style>
