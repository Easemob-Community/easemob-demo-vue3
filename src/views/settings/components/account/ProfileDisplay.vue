<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { UiPresence } from '@easemob/uikit-core'
import { EmAvatar, EmIcon, useOwnUserInfo, useToast } from '@easemob/uikit-im'

interface Props {
  userId: string
  /** 在线状态（由上层 usePresenceSubscription 订阅读取） */
  presence: UiPresence['status']
}

const props = defineProps<Props>()

defineOptions({ name: 'ProfileDisplay' })

const { t } = useI18n()
const { success: showSuccess } = useToast()
const { avatarUrl: userAvatarUrl, displayName } = useOwnUserInfo()

const nickname = computed(() => displayName.value || t('settings.account.defaultNickname'))
const avatarUrl = computed(() => userAvatarUrl.value || '')

async function copyUserId() {
  try {
    await navigator.clipboard.writeText(props.userId)
    showSuccess(t('common.copySuccess'))
  } catch {
    // 复制失败时静默降级，避免阻塞用户
  }
}
</script>

<template>
  <div class="account-info__profile">
    <EmAvatar
      :size="80"
      :src="avatarUrl"
      :name="nickname"
      shape="circle"
      :presence="presence"
      class="account-info__avatar"
    />
    <h2 class="account-info__nickname">{{ nickname }}</h2>
    <div class="account-info__user-id">
      <span>ID: {{ userId }}</span>
      <button
        type="button"
        class="account-info__icon-btn"
        :aria-label="t('common.copy')"
        @click="copyUserId"
      >
        <EmIcon name="rects" :size="16" />
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.account-info {
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
    font-weight: 600;
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
}
</style>
