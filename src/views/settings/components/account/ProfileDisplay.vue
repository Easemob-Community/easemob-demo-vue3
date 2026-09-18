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
      :size="100"
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
        <EmIcon name="rects" :size="18" />
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
    padding-top: 16px;
  }

  /* 100px 头像内首字符字号对齐设计稿 34px */
  &__avatar {
    font-size: calc(34px * var(--demo-font-scale, 1));
    font-weight: 500;
  }

  &__nickname {
    margin: 16px 0 0;
    font-size: calc(18px * var(--demo-font-scale, 1));
    font-weight: 500;
    line-height: calc(26px * var(--demo-font-scale, 1));
    color: var(--color-text);
  }

  &__user-id {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    margin-top: 3px;
    font-size: calc(14px * var(--demo-font-scale, 1));
    line-height: calc(20px * var(--demo-font-scale, 1));
    color: var(--color-text-tertiary);
  }

  &__icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    padding: 0;
    color: var(--color-text-tertiary);
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 50%;
    transition: color 0.2s;

    &:hover {
      color: var(--color-primary);
    }
  }
}
</style>
