<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  EmBadge,
  EmIcon,
  EmPresenceAvatar,
  useClient,
  useContact,
  useConversationStore,
  useOwnUserInfo,
} from '@easemob/uikit-im'

import { useMobileView } from '@/composables/useMobileView'
import { useTheme } from '@/composables/useTheme'
import { SUPPORT_LOCALES, type AppLocale } from '@/locales'

defineOptions({ name: 'AppLayout' })

const isMobileView = useMobileView()
const { t, locale } = useI18n()
const { mode, isDark, setMode } = useTheme()
const { currentUser } = useClient()
const { avatarUrl, displayName } = useOwnUserInfo()
const conversationStore = useConversationStore()
const { inviteList } = useContact()

function switchLocale(value: AppLocale) {
  locale.value = value
}

const tabs = [
  { key: 'chat' as const, icon: 'bubble/rect/empty', label: t('nav.chat'), to: '/chat' },
  { key: 'contacts' as const, icon: 'person/list', label: t('nav.contacts'), to: '/contacts' },
]

/** 会话未读总数（忽略静音会话） */
const totalUnread = computed(() => {
  return conversationStore.conversationList.reduce((sum, cvs) => {
    if (cvs.isMuted) return sum
    return sum + (cvs.unreadCount || 0)
  }, 0)
})

/** 联系人/群邀请待处理数量 */
const pendingNoticeCount = computed(() => {
  return inviteList.value.filter((item) => item.status === 'pending').length
})
</script>

<template>
  <div class="app-layout" :class="{ 'app-layout--mobile': isMobileView }">
    <!-- PC：左侧图标导航栏 -->
    <aside v-if="!isMobileView" class="app-layout__aside">
      <div class="app-layout__avatar">
        <EmPresenceAvatar
          :user-id="currentUser || 'Guest'"
          :src="avatarUrl"
          :name="displayName || currentUser || 'Guest'"
          :size="40"
          editable
        />
      </div>

      <nav class="app-layout__nav">
        <router-link
          v-for="tab in tabs"
          :key="tab.key"
          class="app-layout__nav-item"
          :to="tab.to"
          :title="tab.label"
        >
          <EmBadge
            v-if="tab.key === 'chat' && totalUnread > 0"
            :count="totalUnread"
            class="app-layout__nav-badge"
          >
            <EmIcon :name="tab.icon" :size="22" />
          </EmBadge>
          <EmBadge
            v-else-if="tab.key === 'contacts' && pendingNoticeCount > 0"
            :count="pendingNoticeCount"
            class="app-layout__nav-badge"
          >
            <EmIcon :name="tab.icon" :size="22" />
          </EmBadge>
          <EmIcon v-else :name="tab.icon" :size="22" />
        </router-link>
      </nav>

      <div class="app-layout__tools">
        <button
          v-for="item in SUPPORT_LOCALES"
          :key="item.value"
          type="button"
          class="app-layout__tool-btn"
          :class="{ 'app-layout__tool-btn--active': locale === item.value }"
          @click="switchLocale(item.value)"
        >
          {{ item.label }}
        </button>
        <button
          type="button"
          class="app-layout__tool-btn"
          :title="mode === 'auto' ? t('theme.auto') : isDark ? t('theme.light') : t('theme.dark')"
          @click="setMode(mode === 'light' ? 'dark' : mode === 'dark' ? 'auto' : 'light')"
        >
          <EmIcon v-if="mode === 'auto'" name="monitor" :size="18" />
          <EmIcon v-else-if="isDark" name="sun" :size="18" />
          <EmIcon v-else name="moon" :size="18" />
        </button>
      </div>
    </aside>

    <main class="app-layout__main">
      <div class="app-layout__content">
        <router-view />
      </div>
    </main>

    <!-- H5：底部 tabbar 导航 -->
    <nav v-if="isMobileView" class="app-layout__tabbar safe-area-bottom">
      <router-link
        v-for="tab in tabs"
        :key="tab.key"
        class="app-layout__tab"
        :to="tab.to"
      >
        <EmBadge
          v-if="tab.key === 'chat' && totalUnread > 0"
          :count="totalUnread"
          class="app-layout__tab-badge"
        >
          <EmIcon :name="tab.icon" :size="22" />
        </EmBadge>
        <EmBadge
          v-else-if="tab.key === 'contacts' && pendingNoticeCount > 0"
          :count="pendingNoticeCount"
          class="app-layout__tab-badge"
        >
          <EmIcon :name="tab.icon" :size="22" />
        </EmBadge>
        <EmIcon v-else :name="tab.icon" :size="22" />
        <span class="app-layout__tab-label">{{ tab.label }}</span>
      </router-link>
    </nav>
  </div>
</template>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  height: 100vh;
  background: var(--color-bg);

  &--mobile {
    flex-direction: column;
  }

  &__aside {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 64px;
    padding: 16px 0;
    border-right: 1px solid var(--color-border);
    background: var(--color-bg-secondary);
    flex-shrink: 0;
    user-select: none;
  }

  &__avatar {
    margin-bottom: 16px;
  }

  &__nav {
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  &__nav-item {
    position: relative;
    width: 40px;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    color: var(--color-text-secondary);
    transition: background-color 0.2s, color 0.2s;

    &:hover {
      background: var(--color-bg);
      color: var(--color-text);
    }

    &.router-link-active {
      color: var(--color-primary);
      background: var(--color-bg);
    }
  }

  &__nav-badge {
    display: inline-flex;
  }

  &__tools {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding-top: 12px;
    border-top: 1px solid var(--color-border);
  }

  &__tool-btn {
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    color: var(--color-text-secondary);
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;

    &--active {
      color: #fff;
      background: var(--color-primary);
      border-color: var(--color-primary);
    }
  }

  &__main {
    position: relative;
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }

  &__content {
    flex: 1;
    min-height: 0;
  }

  &__tabbar {
    display: flex;
    border-top: 1px solid var(--color-border);
    background: var(--color-bg);
  }

  &__tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    padding: 8px 0;
    color: var(--color-text-secondary);
    text-decoration: none;
    font-size: 11px;

    &.router-link-active {
      color: var(--color-primary);
    }
  }

  &__tab-label {
    line-height: 1;
  }

  &__tab-badge {
    display: inline-flex;
  }
}
</style>
