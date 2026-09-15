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
      <ProfileDisplay :user-id="userId" :presence="presenceStatus" />

      <div class="account-info__form">
        <ProfileEditor>
          <template #avatar-row>
            <AvatarSection />
          </template>
        </ProfileEditor>
      </div>

      <DangerZone />
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
    padding: 32px 24px;
  }

  &__form {
    max-width: 560px;
    margin: 0 auto 32px;
  }
}
</style>
