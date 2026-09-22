<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  CONVERSATION_TYPE,
  EmContactContainer,
  EmContactDetail,
  EmContactNoticeList,
  EmCreateGroupModal,
  EmGroupDetail,
  EmIcon,
  EmResizable,
  useConversation,
  useUIKit,
} from '@easemob-community/uikit-im'
import type { UiContact, UiContactInvite, UiGroup } from '@easemob-community/uikit-im'

import AddContactModal from '@/components/contact/AddContactModal.vue'
import EmptyStateNotice from '@/components/common/EmptyStateNotice.vue'
import { useDemoCreateGroup } from '@/composables/useDemoCreateGroup'
import { useDemoSettings } from '@/composables/useDemoSettings'
import { useMobileView } from '@/composables/useMobileView'
import { useSidebarWidth } from '@/composables/useSidebarWidth'
import { DEMO_ICON_SIZE, DEMO_RESIZABLE_CONFIG, DEMO_SIDEBAR_CONFIG } from '@/config/demo'

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

/* ===== 通讯录侧边栏宽度（与会话页完全共用：同一存储 key + 同一默认宽度，保证两页宽度始终一致） ===== */

/** 最小 / 最大宽度与 UIKit demo 的侧边栏配置一致 */
const SIDEBAR_MIN_WIDTH = DEMO_SIDEBAR_CONFIG.minWidth
const SIDEBAR_MAX_WIDTH = DEMO_SIDEBAR_CONFIG.maxWidth

// 无记忆时 sidebarWidth 为 undefined：走 fluid 弹性基准（与会话页同一存储 key，宽度联动一致）
const { sidebarWidth, persistSidebarWidth } = useSidebarWidth('layout_sidebar_width')

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

/** 创建群组接管：群名改为「群组 + 创建日期时间」，便于区分造数 */
const { demoCreateGroup } = useDemoCreateGroup()

/* ===== 添加好友弹窗：UIKit 内置 EmAddContactModal（手机号 / 用户 ID 单输入框），由页面接管弹出 ===== */

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

/* ===== 联系人/群组详情「发送消息」：内置卡片（EmContactDetail/EmGroupDetail）emit send-message，跳转与会话创建由页面接管 ===== */

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
  gotoConversation(groupId, CONVERSATION_TYPE.GROUPCHAT, group?.groupName || groupId, group?.avatar)
}

/**
 * 好友申请「通过」后直接进入与该用户的单聊：#notice 插槽接管默认通知列表，
 * 复用上方详情卡「发消息」的同一跳转路径（补建本地会话 → selectConversation → 跳聊天页）。
 * 群组邀请通过不跳转。
 */
function onInviteAccepted(invite: UiContactInvite) {
  if (invite.type !== 'contact' || !invite.userId)
    return
  gotoConversation(
    invite.userId,
    CONVERSATION_TYPE.SINGLECHAT,
    invite.nickname || invite.userId,
    invite.avatarUrl,
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
      <!-- 通讯录宽度默认弹性（随窗口伸缩），可拖拽定宽（240~480），拖拽后持久化；无记忆时走 fluid -->
      <EmResizable
        v-model="sidebarWidth"
        :axis="DEMO_RESIZABLE_CONFIG.axis"
        :min="SIDEBAR_MIN_WIDTH"
        :max="SIDEBAR_MAX_WIDTH"
        :initial="DEMO_SIDEBAR_CONFIG.defaultWidth"
        :handle-size="DEMO_RESIZABLE_CONFIG.handleSize"
        fluid
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
        >
          <!-- 通知列表接管：好友申请「通过」后直接跳入单聊（默认渲染无此联动） -->
          <template #notice>
            <EmContactNoticeList @accept="onInviteAccepted" />
          </template>
        </EmContactContainer>
      </EmResizable>
      <div class="contacts-page__main">
        <EmContactDetail
          v-if="detailUserId"
          :user-id="detailUserId"
          @send-message="onSendMessageToUser"
          @deleted="onContactDeleted"
        />
        <EmGroupDetail
          v-else-if="detailGroupId"
          :group-id="detailGroupId"
          @send-message="onSendMessageToGroup"
          @leaved="onGroupClosed"
          @destroyed="onGroupClosed"
        />
        <!-- 空状态占位（未选中联系人/群组）：对齐 Figma 新 Demo 空状态（person/double 图标 + 两行提示） -->
        <div v-else class="contacts-page__empty">
          <EmptyStateNotice icon="person/double" />
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
        >
          <!-- 通知列表接管：好友申请「通过」后直接跳入单聊（默认渲染无此联动） -->
          <template #notice>
            <EmContactNoticeList @accept="onInviteAccepted" />
          </template>
        </EmContactContainer>
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
          <EmContactDetail
            v-if="detailUserId"
            :user-id="detailUserId"
            @send-message="onSendMessageToUser"
            @deleted="onContactDeleted"
          />
          <EmGroupDetail
            v-else-if="detailGroupId"
            :group-id="detailGroupId"
            @send-message="onSendMessageToGroup"
            @leaved="onGroupClosed"
            @destroyed="onGroupClosed"
          />
        </div>
      </div>
    </template>

    <!-- 加号弹窗：添加好友（手机号 / 用户 ID）/ 创建群组（PC 与 H5 共用一份） -->
    <AddContactModal v-model:show="showAddContactModal" />
    <EmCreateGroupModal v-model:show="showCreateGroupModal" :create-fn="demoCreateGroup" />
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
    /* 未拖拽时按 UIKIT 侧栏基准弹性取值（随窗口伸缩）；拖拽后由 EmResizable 内联宽度覆盖。
       内部列表容器覆写 token 为 100% 填满拖拽壳（对齐 UIKit 官方 demo） */
    width: clamp(var(--uikit-sidebar-min-width, 240px), 25%, var(--uikit-sidebar-max-width, 480px));
    --uikit-sidebar-width: 100%;
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

  /* 空状态占位：仅负责居中，图标 / 文案样式由 EmptyStateNotice 自带（对齐 Figma）；
     padding-bottom 27px 让内容组垂直中心上移 13.5px（设计稿 top: 50% - 13.5px） */
  &__empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 27px;
    box-sizing: border-box;
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
    box-sizing: border-box;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-bg);
  }

  &__mobile-back {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 8px;
    font-size: calc(14px * var(--demo-font-scale, 1));
    color: var(--color-text);
    background: transparent;
    border: none;
    border-radius: 50%;
    cursor: pointer;
  }

  &__mobile-title {
    flex: 1;
    min-width: 0;
    font-size: calc(16px * var(--demo-font-scale, 1));
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
