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

import featurePromoImg from '@/assets/feature-promo.png'
import CheckUpdates from '@/components/CheckUpdates.vue'
import ChatIcon from '@/components/icons/ChatIcon.vue'
import ContactsIcon from '@/components/icons/ContactsIcon.vue'
import SettingsIcon from '@/components/icons/SettingsIcon.vue'
import { useFeaturePromo } from '@/composables/useFeaturePromo'
import { useMobileView } from '@/composables/useMobileView'
import { useSettingsDrawer } from '@/composables/useSettingsDrawer'
import { DEMO_AVATAR_CONFIG } from '@/config/demo'

import SettingsDrawer from './SettingsDrawer.vue'

defineOptions({ name: 'AppLayout' })

const isMobileView = useMobileView()
const { isOpen: isSettingsDrawerOpen, toggle: toggleSettingsDrawer } = useSettingsDrawer()
const {
  showRedDot: showFeatureRedDot,
  showPromo: showFeaturePromo,
  dismissRedDot,
  closePromo,
} = useFeaturePromo()
const { t } = useI18n()
const { currentUser } = useClient()
const { avatarUrl, displayName } = useOwnUserInfo()
const conversationStore = useConversationStore()
const { inviteList } = useContact()

const tabs = [
  { key: 'chat' as const, icon: ChatIcon, label: t('nav.chat'), to: '/chat', size: 26 },
  {
    key: 'contacts' as const,
    icon: ContactsIcon,
    label: t('nav.contacts'),
    to: '/contacts',
    size: 26,
  },
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

/** 点击特性图标：打开/收起设置抽屉，并隐藏诱导红点 */
function handleFeaturesClick() {
  dismissRedDot()
  toggleSettingsDrawer()
}

/** 点击广告弹层：进入特性控制台（设置抽屉）并关闭弹层 */
function handlePromoClick() {
  dismissRedDot()
  closePromo()
  if (!isSettingsDrawerOpen.value) {
    toggleSettingsDrawer()
  }
}
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
          :size="DEMO_AVATAR_CONFIG.size"
          :editable="DEMO_AVATAR_CONFIG.editable"
        />
      </div>

      <nav class="app-layout__nav">
        <router-link v-for="tab in tabs" :key="tab.key" class="app-layout__nav-item" :to="tab.to">
          <EmBadge
            v-if="tab.key === 'chat' && totalUnread > 0"
            :count="totalUnread"
            class="app-layout__nav-badge"
          >
            <component :is="tab.icon" :size="tab.size" />
          </EmBadge>
          <EmBadge
            v-else-if="tab.key === 'contacts' && pendingNoticeCount > 0"
            :count="pendingNoticeCount"
            class="app-layout__nav-badge"
          >
            <component :is="tab.icon" :size="tab.size" />
          </EmBadge>
          <component :is="tab.icon" v-else :size="tab.size" />
        </router-link>
      </nav>

      <div class="app-layout__tools">
        <div class="app-layout__features-entry">
          <button
            type="button"
            class="app-layout__tool-btn"
            :class="{ 'app-layout__tool-btn--active': isSettingsDrawerOpen }"
            :aria-label="t('nav.features')"
            @click="handleFeaturesClick"
          >
            <span class="app-layout__feature-icon-wrap">
              <EmIcon name="console" :size="22" />
              <span v-if="showFeatureRedDot" class="app-layout__red-dot" />
            </span>
          </button>
          <!-- 特性广告弹层：登录后默认展示，关闭后下次登录再次展示 -->
          <Transition name="feature-promo">
            <div
              v-if="showFeaturePromo && !isSettingsDrawerOpen"
              class="app-layout__feature-promo"
              @click="handlePromoClick"
            >
              <img :src="featurePromoImg" :alt="t('nav.featurePromoAlt')" />
              <button
                type="button"
                class="app-layout__feature-promo-close"
                :aria-label="t('common.close')"
                @click.stop="closePromo"
              />
            </div>
          </Transition>
        </div>
        <router-link
          class="app-layout__tool-btn"
          to="/settings"
          :aria-label="t('nav.settings')"
        >
          <SettingsIcon :size="18" />
        </router-link>
      </div>
    </aside>

    <main class="app-layout__main">
      <div class="app-layout__content">
        <router-view />
      </div>
      <!-- 右侧设置抽屉：挤占式（flex 兄弟节点宽度动画），非遮盖 -->
      <Transition name="settings-drawer">
        <SettingsDrawer v-if="isSettingsDrawerOpen" />
      </Transition>
    </main>

    <!-- H5：底部 tabbar 导航 -->
    <nav v-if="isMobileView" class="app-layout__tabbar safe-area-bottom">
      <router-link v-for="tab in tabs" :key="tab.key" class="app-layout__tab" :to="tab.to">
        <EmBadge
          v-if="tab.key === 'chat' && totalUnread > 0"
          :count="totalUnread"
          class="app-layout__tab-badge"
        >
          <component :is="tab.icon" :size="tab.size" />
        </EmBadge>
        <EmBadge
          v-else-if="tab.key === 'contacts' && pendingNoticeCount > 0"
          :count="pendingNoticeCount"
          class="app-layout__tab-badge"
        >
          <component :is="tab.icon" :size="tab.size" />
        </EmBadge>
        <component :is="tab.icon" v-else :size="tab.size" />
        <span class="app-layout__tab-label">{{ tab.label }}</span>
      </router-link>
    </nav>

    <!-- 新版本检测：轮询 index.html 指纹变化时全屏弹窗引导刷新 -->
    <CheckUpdates />
  </div>
</template>

<style lang="scss" scoped src="./index.scss"></style>
