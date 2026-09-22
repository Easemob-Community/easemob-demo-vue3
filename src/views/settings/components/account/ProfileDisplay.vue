<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { UiPresence } from '@easemob-community/uikit-im'
import { EmAvatar, EmIcon, useOwnUserInfo, useToast } from '@easemob-community/uikit-im'

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
    <!-- 设计稿 707-3659 徽标为 20px 白环绿心，与 UIKit EmAvatar 固定 8px 核心指示器（Figma 1994:26192）
         规格不同，此处自绘徽标、不走 presence prop -->
    <div class="account-info__avatar-wrap">
      <EmAvatar :size="100" :src="avatarUrl" :name="nickname" shape="circle" />
      <span class="account-info__presence" :class="`is-${presence}`" />
    </div>
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

  /* 100px 头像容器（尺寸与 EmAvatar size 固定值保持一致，不随字号缩放）；
     内部首字符字号对齐设计稿 34px（作用于 .uikit-avatar__text） */
  &__avatar-wrap {
    position: relative;
    width: 100px;
    height: 100px;
    font-size: calc(34px * var(--demo-font-scale, 1));
    font-weight: 500;
  }

  /* 在线状态徽标：总直径 20px（4px 白环 + 12px 彩心），右下角内缩 4px，对齐设计稿 Badge/onlight */
  &__presence {
    position: absolute;
    right: 4px;
    bottom: 4px;
    width: 20px;
    height: 20px;
    box-sizing: border-box;
    border: 4px solid var(--color-presence-ring);
    border-radius: 50%;

    &.is-online {
      background: var(--color-presence-online);
    }

    /* 非在线状态复用 UIKit presence 色板，保证 busy / away 等语义一致 */
    &.is-offline {
      background: var(--uikit-presence-offline-color, #454545);
    }

    &.is-away {
      background: var(--uikit-presence-away-color, #b9bbc5);
    }

    &.is-busy,
    &.is-doNotDisturb {
      background: var(--uikit-presence-busy-color, #ed7587);
    }

    &.is-custom {
      background: var(--uikit-presence-custom-color, #f3c850);
    }
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
