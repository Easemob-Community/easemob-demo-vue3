<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  EmChatContainer,
  EmConversationContainer,
  EmCreateGroupModal,
  EmIcon,
  EmResizable,
  useConversation,
  useConversationTabs,
  useUIKit,
  useViewport,
} from '@easemob/uikit-im'
import type { ConversationTabKey, UiMessage } from '@easemob/uikit-im'

import MarkdownStreamMessage from '@/components/ai/MarkdownStreamMessage.vue'
import AddContactModal from '@/components/contact/AddContactModal.vue'
import { useDemoCreateGroup } from '@/composables/useDemoCreateGroup'
import { useDemoSettings } from '@/composables/useDemoSettings'
import { useMobileView } from '@/composables/useMobileView'
import { useSidebarWidth } from '@/composables/useSidebarWidth'
import { getMockAiReply, simulateStreamMessage } from '@/composables/useStreamDemo'
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
const { demoCreateGroup } = useDemoCreateGroup()

const hasCurrentConversation = computed(() => !!currentConversation.value)

/* ===== 会话UIKIT特性开关配置（由特性抽屉「会话」面板驱动） ===== */
const {
  statusBannerEnabled,
  conversationUnreadMode,
  conversationUnreadPlacement,
  conversationBadgePlacement,
  conversationTabs,
  conversationTabsVisible,
  conversationTabsTakeover,
  conversationActiveTab,
  // 聊天UIKIT特性开关
  chatInputMode,
  chatInputStyle,
  chatInputFeatures,
  chatInputAutoFocus,
  chatInputFocusBorderColor,
  chatInputCaretColor,
  chatInputSelectionColor,
  chatInputMaxLength,
  groupReadReceiptEnabled,
  groupReadReceiptMaxSize,
  chatShowTime,
  chatMessageSearchEnabled,
  chatMessageServerSearchEnabled,
  chatMessageListShowAvatar,
  chatMessageShowSelfAvatar,
  chatMessageStatusShowText,
  chatMessageStatusDirection,
  chatMessageStatusPosition,
  chatMessageStatusStyle,
  chatMessageAction,
  // AI 流式演示
  aiMockReplyEnabled,
} = useDemoSettings()

/** 完全接管模式：使用 useConversationTabs hook 自绘 tab 栏 */
const {
  tabs: takeoverTabs,
  activeTab: takeoverActiveTab,
  selectTab: takeoverSelectTab,
} = useConversationTabs({
  tabs: ['all', 'unread', 'single', 'group'],
  activeTab: 'all',
})

/** 实际传给 EmConversationContainer 的 tabs（接管模式优先；普通模式按显隐开关置空） */
const effectiveConversationTabs = computed(() =>
  conversationTabsTakeover.value
    ? takeoverTabs.value
    : conversationTabsVisible.value
      ? conversationTabs.value
      : [],
)

/** 实际激活的 tab：接管模式用 hook 状态，普通模式用面板状态 */
const effectiveConversationActiveTab = computed(() =>
  conversationTabsTakeover.value ? takeoverActiveTab.value : conversationActiveTab.value,
)

function onConversationActiveTabChange(tab: ConversationTabKey) {
  if (conversationTabsTakeover.value) takeoverSelectTab(tab)
  else conversationActiveTab.value = tab
}

/** 接管模式下自绘 tab 按钮的文案 */
const takeoverTabLabels = computed<Record<string, string>>(() => ({
  all: t('features.conversation.tabLabels.all'),
  unread: t('features.conversation.tabLabels.unread'),
  atMe: t('features.conversation.tabLabels.atMe'),
  single: t('features.conversation.tabLabels.single'),
  group: t('features.conversation.tabLabels.group'),
}))

/** H5：返回会话列表 */
function backToConversationList() {
  leaveConversation()
}

/* ===== 会话列表宽度（参照 UIKit demo：EmResizable 拖拽调整 + localStorage 持久化） ===== */

const { stores } = useUIKit()
const { sidebarWidth, persistSidebarWidth } = useSidebarWidth(
  'layout_sidebar_width',
  DEMO_SIDEBAR_CONFIG.defaultWidth,
)

/* ===== 聊天UIKIT特性开关配置（由特性抽屉「聊天」面板驱动） ===== */
const chatConfig = computed(() => ({
  ...DEMO_CHAT_CONFIG,
  // 抽屉挤出模式（对齐 UIKit demo 默认档）：好友 / 群信息面板作为独立平面区域挤压聊天区，
  // 与聊天主区之间的间隙透出外层灰底；'overlay' 则为遮挡式浮层
  drawer: { mode: 'push' as const },
  groupReadReceipt: {
    enabled: groupReadReceiptEnabled.value,
    maxGroupSize: groupReadReceiptMaxSize.value,
  },
  input: {
    ...DEMO_CHAT_CONFIG.input,
    mode: chatInputMode.value,
    style: chatInputStyle.value,
    features: { ...chatInputFeatures.value },
    autoFocus: chatInputAutoFocus.value,
    ...(chatInputFocusBorderColor.value
      ? { focusBorderColor: chatInputFocusBorderColor.value }
      : {}),
    ...(chatInputCaretColor.value ? { caretColor: chatInputCaretColor.value } : {}),
    ...(chatInputSelectionColor.value ? { selectionColor: chatInputSelectionColor.value } : {}),
    ...(chatInputMaxLength.value > 0 ? { maxLength: chatInputMaxLength.value } : {}),
  },
  messageList: {
    showTime: chatShowTime.value,
    showAvatar: chatMessageListShowAvatar.value,
    showSelfAvatar: chatMessageShowSelfAvatar.value,
    search: {
      enabled: chatMessageSearchEnabled.value,
      enableServerSearch: chatMessageServerSearchEnabled.value,
    },
    messageStatus: {
      showText: chatMessageStatusShowText.value,
      direction: chatMessageStatusDirection.value,
      position: chatMessageStatusPosition.value,
      style: chatMessageStatusStyle.value,
    },
  },
  messageAction: { ...chatMessageAction.value },
}))

/* ===== AI 流式演示（mock） ===== */

const aiRepliedMessageIds = new Set<string>()

/**
 * AI 应答（mock）：开启后自己发送文本消息，自动注入 mock AI 的 markdown 流式回复。
 * 监听当前会话最后一条消息（isSelf 文本、非流式、非撤回）→ 延迟触发模拟器。
 */
watch(
  () => {
    const cvsId = stores.conversation.currentConversationId
    if (!cvsId || !aiMockReplyEnabled.value) return ''
    const msgs = stores.message.getMessages(cvsId)
    const last = msgs[msgs.length - 1]
    if (
      !last ||
      !last.isSelf ||
      last.type !== 'text' ||
      last.recalled ||
      last.stream ||
      aiRepliedMessageIds.has(last.msgLocalId || last.msgServerId)
    ) {
      return ''
    }
    return last.msgLocalId || last.msgServerId
  },
  (msgId) => {
    if (!msgId) return
    const cvs = stores.conversation.currentConversation
    if (!cvs) return
    const msgs = stores.message.getMessages(cvs.id)
    const last = msgs[msgs.length - 1]
    if (!last) return
    aiRepliedMessageIds.add(msgId)
    const question = (last.body as { content?: string }).content || ''
    window.setTimeout(() => {
      simulateStreamMessage(stores.message, {
        conversationId: cvs.id,
        conversationType: cvs.type,
        to: stores.client.currentUser || '',
        customType: 'markdown',
        content: getMockAiReply(question),
      })
    }, 700)
  },
)
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
        <EmConversationContainer
          :pull-refresh="isMobile && DEMO_CONVERSATION_CONFIG.pullRefresh"
          :tabs="effectiveConversationTabs"
          :active-tab="effectiveConversationActiveTab"
          :show-status-banner="statusBannerEnabled"
          :unread-mode="conversationUnreadMode"
          :unread-placement="conversationUnreadPlacement"
          :badge-placement="conversationBadgePlacement"
          @update:active-tab="onConversationActiveTabChange"
        >
          <template #add-contact="{ show, close }">
            <AddContactModal :show="show" @update:show="close" />
          </template>
          <!-- 创建群组接管：群名改为「群组 + 创建日期时间」，便于区分造数 -->
          <template #create-group="{ show, close }">
            <EmCreateGroupModal :show="show" :create-fn="demoCreateGroup" @update:show="close" />
          </template>
          <template v-if="conversationTabsTakeover" #tabs="{ tabs, activeTab, selectTab }">
            <div class="chat-page__takeover-tabs">
              <button
                v-for="tab in tabs"
                :key="tab"
                type="button"
                class="chat-page__takeover-tab"
                :class="{ 'chat-page__takeover-tab--active': activeTab === tab }"
                @click="selectTab(tab)"
              >
                {{ takeoverTabLabels[tab] || tab }}
              </button>
            </div>
          </template>
        </EmConversationContainer>
      </EmResizable>
      <div class="chat-page__main">
        <!-- card 档位（对齐 UIKit demo）：圆角卡片壳（细边框 + 圆角 + 底色）由容器自绘，
             宿主壳退化为纯定位容器，避免双层卡片 -->
        <EmChatContainer variant="card" :config="chatConfig">
          <template #message-text="{ message }">
            <MarkdownStreamMessage :message="message as UiMessage" />
          </template>
        </EmChatContainer>
      </div>
    </template>

    <!-- H5 端：单栏栈式（列表 → 聊天） -->
    <template v-else>
      <div v-show="!hasCurrentConversation" class="chat-page__mobile-list">
        <EmConversationContainer
          :pull-refresh="DEMO_CONVERSATION_CONFIG.pullRefresh"
          :tabs="effectiveConversationTabs"
          :active-tab="effectiveConversationActiveTab"
          :show-status-banner="statusBannerEnabled"
          :unread-mode="conversationUnreadMode"
          :unread-placement="conversationUnreadPlacement"
          :badge-placement="conversationBadgePlacement"
          @update:active-tab="onConversationActiveTabChange"
        >
          <template #add-contact="{ show, close }">
            <AddContactModal :show="show" @update:show="close" />
          </template>
          <!-- 创建群组接管：群名改为「群组 + 创建日期时间」，便于区分造数 -->
          <template #create-group="{ show, close }">
            <EmCreateGroupModal :show="show" :create-fn="demoCreateGroup" @update:show="close" />
          </template>
          <template v-if="conversationTabsTakeover" #tabs="{ tabs, activeTab, selectTab }">
            <div class="chat-page__takeover-tabs">
              <button
                v-for="tab in tabs"
                :key="tab"
                type="button"
                class="chat-page__takeover-tab"
                :class="{ 'chat-page__takeover-tab--active': activeTab === tab }"
                @click="selectTab(tab)"
              >
                {{ takeoverTabLabels[tab] || tab }}
              </button>
            </div>
          </template>
        </EmConversationContainer>
      </div>
      <div v-show="hasCurrentConversation" class="chat-page__mobile-chat">
        <div class="chat-page__mobile-header safe-area-top">
          <button type="button" class="chat-page__mobile-back" @click="backToConversationList">
            <EmIcon name="arrow/left" :size="DEMO_ICON_SIZE.back" />
            <span>{{ t('common.back') }}</span>
          </button>
        </div>
        <div class="chat-page__mobile-body">
          <EmChatContainer :config="chatConfig">
            <template #message-text="{ message }">
              <MarkdownStreamMessage :message="message as UiMessage" />
            </template>
          </EmChatContainer>
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

  /* 宿主壳退化为纯定位容器（对齐 UIKit demo demo-layout__main--bare）：
     card 档位的卡片壳（细边框 + 圆角 + 底色）由 EmChatContainer variant="card" 自绘，
     此处不再叠边框/圆角/阴影，避免双层卡片；
     push 抽屉挤出时容器变透明壳（chat-container--drawer-push），此处透出外层灰底 */
  &__main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: transparent;
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
    border-radius: 50%;
    cursor: pointer;
  }

  &__mobile-body {
    flex: 1;
    min-height: 0;
  }

  /* 完全接管 #tabs 插槽：下划线风格 */
  &__takeover-tabs {
    display: flex;
    gap: 8px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--color-border);
    overflow-x: auto;
  }

  &__takeover-tab {
    flex-shrink: 0;
    padding: 6px 4px;
    border: none;
    border-bottom: 2px solid transparent;
    background: transparent;
    color: var(--color-text-secondary);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s;

    &--active {
      color: var(--uikit-primary-color, var(--color-primary));
      border-bottom-color: var(--uikit-primary-color, var(--color-primary));
      font-weight: 500;
    }
  }
}
</style>
