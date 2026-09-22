<script setup lang="ts">
/**
 * 页面级空状态占位（对齐 Figma 新 Demo 空状态节点 1336:6814 / 1336:6983）
 *
 * 两处使用：
 * - 聊天页：经 EmChatContainer `#empty` 插槽注入（图标由 UIKit EmEmpty 自带 bubble/rect/2，此处不传 icon）；
 * - 通讯录页：PC 主区未选中联系人/群组时的占位，传 icon="person/double"（demo 自绘占位块内使用）。
 *
 * 文案走 i18n `emptyState.title` / `emptyState.tip`，两处保持一致。
 */
import { useI18n } from 'vue-i18n'
import { EmIcon } from '@easemob-community/uikit-im'

defineOptions({ name: 'EmptyStateNotice' })

interface Props {
  /** 空状态图标名（UIKit 图标，格式 "category/icon-name"）；不传则只渲染文案（图标由外层提供） */
  icon?: string
}

const props = defineProps<Props>()

const { t } = useI18n()
</script>

<template>
  <div class="empty-state-notice">
    <EmIcon v-if="props.icon" :name="props.icon" :size="100" class="empty-state-notice__icon" />
    <p class="empty-state-notice__title">{{ t('emptyState.title') }}</p>
    <p class="empty-state-notice__tip">{{ t('emptyState.tip') }}</p>
  </div>
</template>

<style scoped>
.empty-state-notice {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
}

.empty-state-notice__icon {
  color: var(--color-text-quaternary);
}

.empty-state-notice__title {
  /* 全局 reset 未清零 p 默认外边距（见 reset.scss 约定），此处显式清零，保证与图标的间距严格为 8px */
  margin: 0;
  font-size: calc(24px * var(--demo-font-scale, 1));
  font-weight: 500;
  color: var(--color-text-quaternary);
}

.empty-state-notice__tip {
  margin: 0;
  font-size: calc(13px * var(--demo-font-scale, 1));
  line-height: calc(18px * var(--demo-font-scale, 1));
  color: var(--color-text-quaternary);
}
</style>
