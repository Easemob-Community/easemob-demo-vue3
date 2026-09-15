<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  CONVERSATION_TYPE,
  EmAddContactModal,
  EmContactContainer,
  EmCreateGroupModal,
  EmIcon,
  EmResizable,
  useConversation,
  useUIKit,
} from '@easemob/uikit-im'
import type { UiContact, UiGroup } from '@easemob/uikit-core'

import { useDemoSettings } from '@/composables/useDemoSettings'
import { useMobileView } from '@/composables/useMobileView'
import { useSidebarWidth } from '@/composables/useSidebarWidth'
import {
  CONTACTS_SIDEBAR_WIDTH,
  DEMO_ICON_SIZE,
  DEMO_RESIZABLE_CONFIG,
  DEMO_SIDEBAR_CONFIG,
} from '@/config/demo'

import ContactCard from './components/ContactCard.vue'
import GroupCard from './components/GroupCard.vue'

defineOptions({ name: 'ContactsPage' })

const { t } = useI18n()
const isMobileView = useMobileView()
const { stores } = useUIKit()
const {
  contactShowHomeSearch,
  contactShowContactSearch,
  contactShowGroupSearch,
  contactShowNotice,
  contactShowContactEntry,
  contactShowGroupEntry,
  contactShowBlocklist,
  contactShowContactAddButton,
  contactShowGroupCreateButton,
  contactShowBlocklistAddButton,
} = useDemoSettings()

/* ===== 通讯录侧边栏宽度（与会话页一致：EmResizable 拖拽调整 + localStorage 持久化） ===== */

/** 最小 / 最大宽度与 UIKit demo 的侧边栏配置一致（默认宽度来自 Demo 配置常量） */
const SIDEBAR_MIN_WIDTH = DEMO_SIDEBAR_CONFIG.minWidth
const SIDEBAR_MAX_WIDTH = DEMO_SIDEBAR_CONFIG.maxWidth

const { sidebarWidth, persistSidebarWidth } = useSidebarWidth(
  'layout_contacts_sidebar_width',
  CONTACTS_SIDEBAR_WIDTH,
)

/** 当前选中的联系人/群组详情 ID */
const detailUserId = ref<string | null>(null)
const detailGroupId = ref<string | null>(null)
const detailTitle = ref('')

/**
 * EmContactContainer 右上角加号只负责抛出 add-contact / create-group 事件，
 * 自身不会弹出任何弹窗；这里由页面接管，弹出 uikit 内置的添加好友/创建群组弹窗。
 */
const showAddContactModal = ref(false)
const showCreateGroupModal = ref(false)

function onContactClick(contact: UiContact) {
  detailUserId.value = contact.userId
  detailGroupId.value = null
  detailTitle.value = contact.remark || contact.name || contact.userId
}

function onGroupClick(group: UiGroup) {
  detailGroupId.value = group.groupId
  detailUserId.value = null
  detailTitle.value = group.groupName || group.groupId
}

function onViewChange() {
  detailUserId.value = null
  detailGroupId.value = null
  detailTitle.value = ''
}

/* ===== 联系人/群组卡片「发送消息」：自研卡片（ContactCard/GroupCard）emit send-message，跳转与会话创建由页面接管 ===== */

const router = useRouter()
const { selectConversation } = useConversation()

/**
 * selectConversation 只对会话列表中已存在的会话生效（找不到则空操作），
 * 因此对从未聊过天的对象需先 addConversation 建一条本地会话，再选中并跳转聊天页。
 */
function gotoConversation(
  id: string,
  type: (typeof CONVERSATION_TYPE)[keyof typeof CONVERSATION_TYPE],
  name: string,
  avatar?: string,
) {
  if (!stores.conversation.conversationList.find((cvs) => cvs.id === id)) {
    stores.conversation.addConversation({
      id,
      name,
      avatar,
      type,
      unreadCount: 0,
      lastMessageText: '',
      isPinned: false,
      isMuted: false,
      marks: [],
    })
  }
  selectConversation(id)
  router.push('/chat')
}

function onSendMessageToUser(userId: string) {
  const contact = stores.contact.getContact(userId)
  gotoConversation(
    userId,
    CONVERSATION_TYPE.SINGLECHAT,
    contact?.remark || contact?.name || userId,
    contact?.avatar,
  )
}

function onSendMessageToGroup(groupId: string) {
  const group = stores.group.getGroupById(groupId)
  gotoConversation(
    groupId,
    CONVERSATION_TYPE.GROUPCHAT,
    group?.groupName || groupId,
    group?.avatar,
  )
}

/** 删除联系人/退出/解散群组后，关闭右侧详情回到列表 */
function onContactDeleted() {
  detailUserId.value = null
  detailTitle.value = ''
}

function onGroupClosed() {
  detailGroupId.value = null
  detailTitle.value = ''
}

function backToContactList() {
  detailUserId.value = null
  detailGroupId.value = null
  detailTitle.value = ''
}
</script>

<template>
  <div class="contacts-page" :class="{ 'contacts-page--pc': !isMobileView }">
    <!-- PC 端：左侧通讯录 + 右侧详情（容器间距对齐 UIKit demo，见 DEMO_CONTAINER_CONFIG） -->
    <template v-if="!isMobileView">
      <!-- 通讯录宽度可拖拽调整（240~480），宽度持久化到 UIKIT 内部配置存储 -->
      <EmResizable
        v-model="sidebarWidth"
        :axis="DEMO_RESIZABLE_CONFIG.axis"
        :min="SIDEBAR_MIN_WIDTH"
        :max="SIDEBAR_MAX_WIDTH"
        :handle-size="DEMO_RESIZABLE_CONFIG.handleSize"
        class="contacts-page__sidebar"
        @resize-end="persistSidebarWidth"
      >
        <EmContactContainer
          :show-home-search="contactShowHomeSearch"
          :show-contact-search="contactShowContactSearch"
          :show-group-search="contactShowGroupSearch"
          :show-notice="contactShowNotice"
          :show-contact="contactShowContactEntry"
          :show-group="contactShowGroupEntry"
          :show-blocklist="contactShowBlocklist"
          :show-contact-add-button="contactShowContactAddButton"
          :show-group-create-button="contactShowGroupCreateButton"
          :show-blocklist-add-button="contactShowBlocklistAddButton"
          @view-change="onViewChange"
          @contact-click="onContactClick"
          @group-click="onGroupClick"
          @blocklist-item-click="onContactClick"
          @add-contact="showAddContactModal = true"
          @create-group="showCreateGroupModal = true"
        />
      </EmResizable>
      <div class="contacts-page__main">
        <ContactCard
          v-if="detailUserId"
          :user-id="detailUserId"
          @send-message="onSendMessageToUser"
          @deleted="onContactDeleted"
        />
        <GroupCard
          v-else-if="detailGroupId"
          :group-id="detailGroupId"
          @send-message="onSendMessageToGroup"
          @left="onGroupClosed"
          @destroyed="onGroupClosed"
        />
        <div v-else class="contacts-page__empty">
          <EmIcon name="person/list" :size="DEMO_ICON_SIZE.empty" />
          <p>{{ t('contacts.empty') }}</p>
        </div>
      </div>
    </template>

    <!-- H5 端：单栏栈式（列表 → 详情） -->
    <template v-else>
      <div v-show="!detailUserId && !detailGroupId" class="contacts-page__mobile-list">
        <EmContactContainer
          :show-home-search="contactShowHomeSearch"
          :show-contact-search="contactShowContactSearch"
          :show-group-search="contactShowGroupSearch"
          :show-notice="contactShowNotice"
          :show-contact="contactShowContactEntry"
          :show-group="contactShowGroupEntry"
          :show-blocklist="contactShowBlocklist"
          :show-contact-add-button="contactShowContactAddButton"
          :show-group-create-button="contactShowGroupCreateButton"
          :show-blocklist-add-button="contactShowBlocklistAddButton"
          @view-change="onViewChange"
          @contact-click="onContactClick"
          @group-click="onGroupClick"
          @blocklist-item-click="onContactClick"
          @add-contact="showAddContactModal = true"
          @create-group="showCreateGroupModal = true"
        />
      </div>
      <div v-show="!!detailUserId || !!detailGroupId" class="contacts-page__mobile-detail">
        <div class="contacts-page__mobile-header safe-area-top">
          <button type="button" class="contacts-page__mobile-back" @click="backToContactList">
            <EmIcon name="arrow/left" :size="DEMO_ICON_SIZE.back" />
            <span>{{ t('common.back') }}</span>
          </button>
          <span class="contacts-page__mobile-title">{{ detailTitle }}</span>
        </div>
        <div class="contacts-page__mobile-body">
          <ContactCard
            v-if="detailUserId"
            :user-id="detailUserId"
            @send-message="onSendMessageToUser"
            @deleted="onContactDeleted"
          />
          <GroupCard
            v-else-if="detailGroupId"
            :group-id="detailGroupId"
            @send-message="onSendMessageToGroup"
            @left="onGroupClosed"
            @destroyed="onGroupClosed"
          />
        </div>
      </div>
    </template>

    <!-- 加号弹窗：添加好友 / 创建群组（PC 与 H5 共用一份） -->
    <EmAddContactModal v-model:show="showAddContactModal" />
    <EmCreateGroupModal v-model:show="showCreateGroupModal" />
  </div>
</template>

<style lang="scss" scoped>
.contacts-page {
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

  &__empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: var(--color-text-secondary);
    font-size: 14px;
  }

  &__mobile-list,
  &__mobile-detail {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  &__mobile-header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;
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

  &__mobile-title {
    flex: 1;
    min-width: 0;
    font-size: 16px;
    font-weight: 500;
    color: var(--color-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__mobile-body {
    flex: 1;
    min-height: 0;
  }
}
</style>
