<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { EmPopup } from '@easemob-community/uikit-im'

import { useCheckUpdates } from '@/composables/useCheckUpdates'

defineOptions({ name: 'CheckUpdates' })

/** 版本检测轮询间隔（分钟） */
const CHECK_INTERVAL_MINUTES = 1

const { t } = useI18n()
const { hasUpdate, startPolling, stopPolling, confirmUpdate } = useCheckUpdates({
  interval: CHECK_INTERVAL_MINUTES,
})

onMounted(startPolling)
onBeforeUnmount(stopPolling)
</script>

<template>
  <!-- 不可关闭：点遮罩 / ESC / 关闭按钮均不生效，只能点「刷新」 -->
  <EmPopup
    :show="hasUpdate"
    position="center"
    :close-on-click-overlay="false"
    :close-on-esc="false"
    class="check-updates"
  >
    <div class="check-updates__content">
      <div class="check-updates__header">
        <span class="check-updates__title">{{ t('update.title') }}</span>
      </div>
      <p class="check-updates__description">{{ t('update.description') }}</p>
      <div class="check-updates__footer">
        <button
          type="button"
          class="check-updates__btn check-updates__btn--confirm"
          @click="confirmUpdate"
        >
          {{ t('update.refresh') }}
        </button>
      </div>
    </div>
  </EmPopup>
</template>

<style lang="scss" scoped>
.check-updates {
  :deep(.uikit-popup__content) {
    padding: 0;
    border-radius: 12px;
    background: var(--color-bg);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  &__content {
    width: 320px;
    padding: 20px;
    box-sizing: border-box;
  }

  &__header {
    margin-bottom: 12px;
  }

  &__title {
    font-size: calc(16px * var(--demo-font-scale, 1));
    font-weight: 600;
    color: var(--color-text);
  }

  &__description {
    margin: 0;
    font-size: calc(14px * var(--demo-font-scale, 1));
    line-height: 1.6;
    color: var(--color-text-secondary);
  }

  &__footer {
    display: flex;
    margin-top: 20px;
  }

  &__btn {
    flex: 1;
    min-width: 0;
    height: 36px;
    padding: 0 12px;
    font-size: calc(14px * var(--demo-font-scale, 1));
    border: none;
    border-radius: 999px;
    cursor: pointer;
    transition: background-color 0.2s;

    &--confirm {
      color: #ffffff;
      background: var(--color-primary);

      &:hover {
        background: var(--color-primary-hover, var(--color-primary));
      }
    }
  }
}
</style>
