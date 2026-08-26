<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  EmChatContainer,
  EmConversationContainer,
  EmIcon,
  EmResizable,
  createUIKitStorageKey,
  useConversation,
  useUIKit,
  useViewport,
} from '@easemob/uikit-im'

import { useMobileView } from '@/composables/useMobileView'
import {
  DEMO_CHAT_CONFIG,
  DEMO_CONVERSATION_CONFIG,
  DEMO_ICON_SIZE,
  DEMO_RESIZABLE_CONFIG,
  DEMO_SIDEBAR_CONFIG,
} from '@/config/demo'

defineOptions({ name: 'ChatPage' })

const { t } = useI18n()
const isMobileView = useMobileView()
const { isMobile } = useViewport()
const { currentConversation, leaveConversation } = useConversation()

const hasCurrentConversation = computed(() => !!currentConversation.value)

/** H5：返回会话列表 */
function backToConversationList() {
  leaveConversation()
}

/* ===== 会话列表宽度（参照 UIKit demo：EmResizable 拖拽调整 + localStorage 持久化） ===== */

/** 默认宽度 / 最小 / 最大（来自 Demo 配置常量，与 UIKit demo 的侧边栏配置一致） */

const { stores } = useUIKit()

/** 存储 key：按 appKey + 用户隔离（与 UIKit 内部配置同一套体系） */
const sidebarStorageKey = computed(() =>
  createUIKitStorageKey(stores.client.appKey, stores.client.currentUser, 'layout_sidebar_width'),
)

const sidebarWidth = ref<number>(DEMO_SIDEBAR_CONFIG.defaultWidth)

/** 读取持久化宽度（含边界钳制）；登录用户变化时重新读取 */
function readStoredSidebarWidth() {
  const raw = localStorage.getItem(sidebarStorageKey.value)
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN
  sidebarWidth.value = Number.isNaN(parsed)
    ? DEMO_SIDEBAR_CONFIG.defaultWidth
    : Math.min(Math.max(parsed, DEMO_SIDEBAR_CONFIG.minWidth), DEMO_SIDEBAR_CONFIG.maxWidth)
}

watch(
  [() => stores.client.appKey, () => stores.client.currentUser],
  () => readStoredSidebarWidth(),
  { immediate: true },
)

/** 拖拽结束回调：写回状态并持久化到 UIKIT 内部配置存储 */
function persistSidebarWidth(width: number) {
  sidebarWidth.value = width
  localStorage.setItem(sidebarStorageKey.value, String(width))
}
</script>

<template>
  <div class="chat-page" :class="{ 'chat-page--pc': !isMobileView }">
    <!-- PC 端：左侧会话列表 + 右侧聊天窗口（容器间距对齐 UIKit demo，见 DEMO_CONTAINER_CONFIG） -->
    <template v-if="!isMobileView">
      <!-- 会话列表宽度可拖拽调整（240~480），宽度持久化到 UIKIT 内部配置存储 -->
      <EmResizable
        v-model="sidebarWidth"
        :axis="DEMO_RESIZABLE_CONFIG.axis"
        :min="DEMO_SIDEBAR_CONFIG.minWidth"
        :max="DEMO_SIDEBAR_CONFIG.maxWidth"
        :handle-size="DEMO_RESIZABLE_CONFIG.handleSize"
        class="chat-page__sidebar"
        @resize-end="persistSidebarWidth"
      >
        <EmConversationContainer :pull-refresh="isMobile && DEMO_CONVERSATION_CONFIG.pullRefresh" />
      </EmResizable>
      <div class="chat-page__main">
        <EmChatContainer :config="DEMO_CHAT_CONFIG" />
      </div>
    </template>

    <!-- H5 端：单栏栈式（列表 → 聊天） -->
    <template v-else>
      <div v-show="!hasCurrentConversation" class="chat-page__mobile-list">
        <EmConversationContainer :pull-refresh="DEMO_CONVERSATION_CONFIG.pullRefresh" />
      </div>
      <div v-show="hasCurrentConversation" class="chat-page__mobile-chat">
        <div class="chat-page__mobile-header safe-area-top">
          <button type="button" class="chat-page__mobile-back" @click="backToConversationList">
            <EmIcon name="arrow/left" :size="DEMO_ICON_SIZE.back" />
            <span>{{ t('common.back') }}</span>
          </button>
        </div>
        <div class="chat-page__mobile-body">
          <EmChatContainer :config="DEMO_CHAT_CONFIG" />
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.chat-page {
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

  &__mobile-list,
  &__mobile-chat {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  &__mobile-header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    height: 48px;
    padding: 0 12px;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-bg);
  }

  &__mobile-back {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 8px;
    font-size: 14px;
    color: var(--color-text);
    background: transparent;
    border: none;
    cursor: pointer;
  }

  &__mobile-body {
    flex: 1;
    min-height: 0;
  }
}
</style>
