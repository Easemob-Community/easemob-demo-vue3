<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUIKit } from '@easemob/uikit-im'

import { usePresenceSubscription } from '@/composables/usePresenceSubscription'
import { useUserStore } from '@/store/modules/user'

import AvatarSection from './account/AvatarSection.vue'
import DangerZone from './account/DangerZone.vue'
import ProfileDisplay from './account/ProfileDisplay.vue'
import ProfileEditor from './account/ProfileEditor.vue'

defineOptions({ name: 'AccountInfo' })

const { t } = useI18n()
const userStore = useUserStore()
const { client } = useUIKit()

const userId = computed(
  () => client.value?.currentUserId || userStore.userId || 'supercalifragilisticexpialidocious',
)

// 订阅自身在线状态；服务端未开通或异常时静默降级（composable 内部处理退订）
const { presenceStatus } = usePresenceSubscription(userId)
</script>

<template>
  <div class="account-info">
    <div class="account-info__header">
      <span class="account-info__title">{{ t('settings.account.title') }}</span>
    </div>

    <div class="account-info__body">
      <div class="account-info__content">
        <ProfileDisplay :user-id="userId" :presence="presenceStatus" />

        <ProfileEditor>
          <template #avatar-row>
            <AvatarSection />
          </template>
        </ProfileEditor>

        <DangerZone />
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

  /* 头部对齐设计稿 top_bars：60px 高、18px 标题、底部 1px 分割线 */
  &__header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    min-height: 60px;
    padding: 0 16px;
    border-bottom: 1px solid var(--color-border);
  }

  &__title {
    font-size: 18px;
    font-weight: 500;
    color: var(--color-text);
  }

  &__body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    padding: 32px 24px;
  }

  /* 内容列：520px 宽水平居中、垂直居中（margin auto 保证超高时可滚动不裁切），区块间距对齐设计稿 63px */
  &__content {
    width: 100%;
    max-width: 520px;
    margin: auto;
    display: flex;
    flex-direction: column;
    gap: 63px;
  }
}
</style>
