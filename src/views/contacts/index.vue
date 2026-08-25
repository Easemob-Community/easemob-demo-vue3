<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  EmContactContainer,
  EmContactDetail,
  EmGroupDetail,
  EmIcon,
} from '@easemob/uikit-im'
import type { UiContact, UiGroup } from '@easemob/uikit-core'

import { useMobileView } from '@/composables/useMobileView'

defineOptions({ name: 'ContactsPage' })

const { t } = useI18n()
const isMobileView = useMobileView()

/** 当前选中的联系人/群组详情 ID */
const detailUserId = ref<string | null>(null)
const detailGroupId = ref<string | null>(null)
const detailTitle = ref('')

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

function onDetailDeleted() {
  detailUserId.value = null
  detailTitle.value = ''
}

function backToContactList() {
  detailUserId.value = null
  detailGroupId.value = null
  detailTitle.value = ''
}
</script>

<template>
  <div class="contacts-page">
    <!-- PC 端：左侧通讯录 + 右侧详情 -->
    <template v-if="!isMobileView">
      <div class="contacts-page__sidebar">
        <EmContactContainer
          :show-home-search="true"
          :show-contact-search="true"
          :show-group-search="true"
          @view-change="onViewChange"
          @contact-click="onContactClick"
          @group-click="onGroupClick"
        />
      </div>
      <div class="contacts-page__main">
        <EmContactDetail
          v-if="detailUserId"
          :user-id="detailUserId"
          @deleted="onDetailDeleted"
        />
        <EmGroupDetail
          v-else-if="detailGroupId"
          :group-id="detailGroupId"
        />
        <div v-else class="contacts-page__empty">
          <EmIcon name="person/list" :size="48" />
          <p>{{ t('contacts.empty') }}</p>
        </div>
      </div>
    </template>

    <!-- H5 端：单栏栈式（列表 → 详情） -->
    <template v-else>
      <div v-show="!detailUserId && !detailGroupId" class="contacts-page__mobile-list">
        <EmContactContainer
          :show-home-search="true"
          :show-contact-search="true"
          :show-group-search="true"
          @view-change="onViewChange"
          @contact-click="onContactClick"
          @group-click="onGroupClick"
        />
      </div>
      <div v-show="!!detailUserId || !!detailGroupId" class="contacts-page__mobile-detail">
        <div class="contacts-page__mobile-header safe-area-top">
          <button
            type="button"
            class="contacts-page__mobile-back"
            @click="backToContactList"
          >
            <EmIcon name="arrow/left" :size="20" />
            <span>{{ t('common.back') }}</span>
          </button>
          <span class="contacts-page__mobile-title">{{ detailTitle }}</span>
        </div>
        <div class="contacts-page__mobile-body">
          <EmContactDetail
            v-if="detailUserId"
            :user-id="detailUserId"
            @deleted="onDetailDeleted"
          />
          <EmGroupDetail
            v-else-if="detailGroupId"
            :group-id="detailGroupId"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.contacts-page {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  background: var(--color-bg);

  &__sidebar {
    width: 320px;
    flex-shrink: 0;
    border-right: 1px solid var(--color-border);
  }

  &__main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
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
