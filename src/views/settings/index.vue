<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { EmIcon, EmResizable } from '@easemob/uikit-im'

import { useMobileView } from '@/composables/useMobileView'
import { useSidebarWidth } from '@/composables/useSidebarWidth'
import { DEMO_RESIZABLE_CONFIG, DEMO_SIDEBAR_CONFIG } from '@/config/demo'

import AboutUs from './components/AboutUs.vue'
import AccountInfo from './components/AccountInfo.vue'
import GeneralSettings from './components/GeneralSettings.vue'

type SettingsTab = 'account' | 'general' | 'about'

defineOptions({ name: 'SettingsPage' })

const { t } = useI18n()
const isMobileView = useMobileView()

const activeTab = ref<SettingsTab>('account')
const showMobileDetail = ref(false)

/** 设置菜单项：icon 为 EmIcon 名称（账户信息 / 通用 / 关于我们）；选中态切换为 filled 面性图标 */
const menuItems = computed(() => [
  {
    key: 'account' as SettingsTab,
    label: t('settings.account.title'),
    icon: 'person/single',
  },
  {
    key: 'general' as SettingsTab,
    label: t('settings.general.title'),
    icon: 'flower',
  },
  {
    key: 'about' as SettingsTab,
    label: t('settings.about.title'),
    icon: 'rect/candle',
  },
])

function menuIcon(item: { key: SettingsTab; icon: string }) {
  if (activeTab.value !== item.key || item.icon.startsWith('filled/')) {
    return item.icon
  }
  return `filled/${item.icon}`
}

const activeTabLabel = computed(
  () => menuItems.value.find((item) => item.key === activeTab.value)?.label ?? '',
)

function selectTab(tab: SettingsTab) {
  activeTab.value = tab
  if (isMobileView.value) {
    showMobileDetail.value = true
  }
}

/* ===== 设置面板宽度（与会话/联系人侧边栏完全对齐：同一存储 key + 同一默认宽度，三页宽度始终一致） ===== */

const SETTINGS_SIDEBAR_MIN = DEMO_SIDEBAR_CONFIG.minWidth
const SETTINGS_SIDEBAR_MAX = DEMO_SIDEBAR_CONFIG.maxWidth

const { sidebarWidth, persistSidebarWidth } = useSidebarWidth(
  'layout_sidebar_width',
  DEMO_SIDEBAR_CONFIG.defaultWidth,
)
</script>

<template>
  <div class="settings-page" :class="{ 'settings-page--pc': !isMobileView }">
    <!-- PC 端：左侧设置列表 + 右侧详情（容器间距对齐 UIKit demo） -->
    <template v-if="!isMobileView">
      <EmResizable
        v-model="sidebarWidth"
        :axis="DEMO_RESIZABLE_CONFIG.axis"
        :min="SETTINGS_SIDEBAR_MIN"
        :max="SETTINGS_SIDEBAR_MAX"
        :handle-size="DEMO_RESIZABLE_CONFIG.handleSize"
        class="settings-page__sidebar"
        @resize-end="persistSidebarWidth"
      >
        <div class="settings-page__sidebar-inner">
          <div class="settings-page__header">
            <span class="settings-page__title">{{ t('nav.settings') }}</span>
          </div>
          <div class="settings-page__list">
            <button
              v-for="item in menuItems"
              :key="item.key"
              type="button"
              class="settings-page__menu-item"
              :class="{ 'settings-page__menu-item--active': activeTab === item.key }"
              @click="selectTab(item.key)"
            >
              <EmIcon :name="menuIcon(item)" :size="24" class="settings-page__menu-icon" />
              <span class="settings-page__menu-label">{{ item.label }}</span>
            </button>
          </div>
        </div>
      </EmResizable>
      <div class="settings-page__main">
        <AccountInfo v-if="activeTab === 'account'" />
        <GeneralSettings v-else-if="activeTab === 'general'" />
        <AboutUs v-else-if="activeTab === 'about'" />
      </div>
    </template>

    <!-- H5 端：单栏全屏 -->
    <template v-else>
      <div class="settings-page__mobile-header safe-area-top">
        <span class="settings-page__mobile-title">{{ t('nav.settings') }}</span>
      </div>
      <div class="settings-page__mobile-body">
        <button
          v-for="item in menuItems"
          :key="item.key"
          type="button"
          class="settings-page__menu-item"
          :class="{ 'settings-page__menu-item--active': activeTab === item.key }"
          @click="selectTab(item.key)"
        >
          <EmIcon :name="menuIcon(item)" :size="24" class="settings-page__menu-icon" />
          <span class="settings-page__menu-label">{{ item.label }}</span>
        </button>

        <!-- H5 详情页：点击菜单后全屏展示 -->
        <div v-if="showMobileDetail" class="settings-page__mobile-detail">
          <div class="settings-page__mobile-detail-header safe-area-top">
            <button
              type="button"
              class="settings-page__mobile-back"
              :aria-label="t('common.back')"
              @click="showMobileDetail = false"
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 19l-7-7 7-7"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
            <span class="settings-page__mobile-detail-title">{{ activeTabLabel }}</span>
          </div>
          <div class="settings-page__mobile-detail-body">
            <AccountInfo v-if="activeTab === 'account'" />
            <GeneralSettings v-else-if="activeTab === 'general'" />
            <AboutUs v-else-if="activeTab === 'about'" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.settings-page {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  background: var(--color-bg);

  /* PC：容器间距对齐 UIKit demo（gap + padding 取 --demo-container-gap），次级色背景凸显容器卡片 */
  &--pc {
    gap: var(--demo-container-gap, 8px);
    padding: var(--demo-container-padding, 8px);
    box-sizing: border-box;
    background: var(--color-bg-secondary);
  }

  &__sidebar {
    flex-shrink: 0;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    border-radius: var(--demo-component-radius, 8px);
    background: var(--color-bg);
    transition:
      box-shadow 0.2s,
      border-color 0.2s;

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
  }

  &__sidebar-inner {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  /* 头部对齐设计稿 top_bars：60px 高、18px 标题 */
  &__header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    min-height: 60px;
    padding: 0 16px;
  }

  &__title {
    font-size: 18px;
    font-weight: 500;
    color: var(--color-text);
  }

  /* 菜单列表：左右 8px 内边距、项间距 8px（对齐设计稿 conversation_list） */
  &__list {
    flex: 1;
    min-height: 0;
    padding: 0 8px 8px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* 菜单项：54px 高、24px 图标 + 8px 间距、圆角 8px、常态底色 --color-bg-secondary */
  &__menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    height: 54px;
    flex-shrink: 0;
    padding: 0 12px;
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text);
    cursor: pointer;
    background: var(--color-bg-secondary);
    border: none;
    border-radius: 8px;
    transition:
      background-color 0.2s,
      color 0.2s;

    &--active {
      color: var(--color-primary);
      background: var(--uikit-bg-active, #ebf7ff);
    }
  }

  &__menu-icon {
    flex-shrink: 0;
  }

  &__menu-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__divider {
    height: 1px;
    margin: 8px 0;
    background: var(--color-border);
  }

  &__main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: var(--demo-component-radius, 8px);
    background: var(--color-bg);
    transition:
      box-shadow 0.2s,
      border-color 0.2s;

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
  }

  &__mobile-header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 48px;
    padding: 0 12px;
    background: var(--color-bg);
  }

  &__mobile-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--color-text);
  }

  &__mobile-body {
    flex: 1;
    min-height: 0;
    padding: 0 8px 8px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__mobile-detail {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    flex-direction: column;
    background: var(--color-bg);
  }

  &__mobile-detail-header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 12px;
    height: 48px;
    padding: 0 12px;
    background: var(--color-bg);
  }

  &__mobile-back {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    color: var(--color-text);
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 50%;

    svg {
      width: 20px;
      height: 20px;
    }

    &:hover {
      background: var(--color-bg-secondary);
    }
  }

  &__mobile-detail-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--color-text);
  }

  &__mobile-detail-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }
}
</style>
