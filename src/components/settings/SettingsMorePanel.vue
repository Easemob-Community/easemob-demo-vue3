<script setup lang="ts">
/**
 * UIKIT特性开关 - 更多面板
 *
 * 预留扩展入口：当前提供 UIKit 使用文档跳转（新标签页打开官方文档），
 * 后续可在此继续追加其他辅助入口。
 */
import { useI18n } from 'vue-i18n'
import { EmIcon } from '@easemob/uikit-im'

import { DEMO_ICON_SIZE, DEMO_UIKIT_DOCS_CONFIG } from '@/config/demo'

defineOptions({ name: 'SettingsMorePanel' })

const { t } = useI18n()
</script>

<template>
  <div class="settings-more-panel">
    <!-- ===== UIKit 文档 ===== -->
    <section class="settings-more-panel__section">
      <h3 class="settings-more-panel__section-title">
        {{ t('features.more.docsSection') }}
      </h3>

      <a
        class="settings-more-panel__doc-link"
        :href="DEMO_UIKIT_DOCS_CONFIG.url"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span class="settings-more-panel__doc-info">
          <span class="settings-more-panel__doc-label">
            {{ t('features.more.docsEntry') }}
          </span>
          <span class="settings-more-panel__doc-desc">
            {{ t('features.more.docsEntryDesc') }}
          </span>
        </span>
        <EmIcon
          name="chevron/right"
          :size="DEMO_ICON_SIZE.tool"
          class="settings-more-panel__doc-arrow"
        />
      </a>
      <p class="settings-more-panel__desc">
        {{ t('features.more.docsOpenTip') }}
      </p>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.settings-more-panel {
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

  /* 文档入口行：整行可点击，新标签页打开官方文档 */
  &__doc-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--color-border);
    text-decoration: none;
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.75;
    }
  }

  &__doc-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  &__doc-label {
    font-size: calc(15px * var(--demo-font-scale, 1));
    font-weight: 500;
    color: var(--color-text);
  }

  &__doc-desc {
    font-size: calc(12px * var(--demo-font-scale, 1));
    color: var(--color-text-secondary);
    line-height: 1.5;
  }

  &__doc-arrow {
    flex-shrink: 0;
    color: var(--color-text-secondary);
  }

  &__desc {
    margin: 0;
    font-size: calc(12px * var(--demo-font-scale, 1));
    color: var(--color-text-secondary);
    line-height: 1.5;
  }
}
</style>
