<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { EmAvatar, EmIcon, EmModal, GROUP_MEMBER_ROLE, useGroup, useToast, useUIKit } from '@easemob/uikit-im'

import ChatIcon from '@/components/icons/ChatIcon.vue'

interface Props {
  groupId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'send-message', groupId: string): void
  (e: 'left', groupId: string): void
  (e: 'destroyed', groupId: string): void
}>()

defineOptions({ name: 'GroupCard' })

const { t } = useI18n()
const { success: showSuccess, error: showError } = useToast()
const { stores } = useUIKit()
const { fetchGroupInfo, leaveGroup, destroyGroup } = useGroup()

/** 群组资料：优先读 store 缓存，切换群组时触发一次拉取刷新（成员数等信息） */
const group = computed(() => stores.group.getGroupById(props.groupId))

const groupName = computed(() => group.value?.groupName || props.groupId)
const description = computed(() => group.value?.description || t('contacts.card.defaultDescription'))
const memberCount = computed(() => {
  const count = group.value?.memberCount ?? 0
  const max = group.value?.maxUsers
  return max ? `${count} / ${max}` : `${count}`
})
const isOwner = computed(() => group.value?.role === GROUP_MEMBER_ROLE.OWNER)

watch(
  () => props.groupId,
  async (id) => {
    if (!id) return
    try {
      await fetchGroupInfo(id)
    } catch {
      // 拉取失败时静默降级，展示 store 缓存数据
    }
  },
  { immediate: true },
)

async function copyGroupId() {
  try {
    await navigator.clipboard.writeText(props.groupId)
    showSuccess(t('common.copySuccess'))
  } catch {
    // 复制失败时静默降级，避免阻塞用户
  }
}

function onSendMessage() {
  emit('send-message', props.groupId)
}

/* ===== 退出/解散群组确认弹窗 ===== */

const isLeaveModalOpen = ref(false)
const isDestroyModalOpen = ref(false)

function openLeaveModal() {
  isLeaveModalOpen.value = true
}

function closeLeaveModal() {
  isLeaveModalOpen.value = false
}

function openDestroyModal() {
  isDestroyModalOpen.value = true
}

function closeDestroyModal() {
  isDestroyModalOpen.value = false
}

async function confirmLeave() {
  try {
    await leaveGroup(props.groupId)
    showSuccess(t('contacts.card.leaveSuccess'))
    emit('left', props.groupId)
  } catch (err) {
    showError(err instanceof Error ? err.message : t('common.saveFailed'))
  } finally {
    closeLeaveModal()
  }
}

async function confirmDestroy() {
  try {
    await destroyGroup(props.groupId)
    showSuccess(t('contacts.card.destroySuccess'))
    emit('destroyed', props.groupId)
  } catch (err) {
    showError(err instanceof Error ? err.message : t('common.saveFailed'))
  } finally {
    closeDestroyModal()
  }
}
</script>

<template>
  <!-- 结构一比一参照设置页账户信息（AccountInfo.vue）：头部 + 资料区 + 表单行 + 操作区 -->
  <div class="group-card">
    <div class="group-card__header">
      <span class="group-card__title">{{ t('contacts.card.groupTitle') }}</span>
    </div>

    <div class="group-card__body">
      <div class="group-card__profile">
        <EmAvatar
          :size="80"
          :src="group?.avatar || ''"
          :name="groupName"
          shape="circle"
          class="group-card__avatar"
        />
        <h2 class="group-card__name">{{ groupName }}</h2>
        <div class="group-card__group-id">
          <span>ID: {{ groupId }}</span>
          <button
            type="button"
            class="group-card__icon-btn"
            :aria-label="t('common.copy')"
            @click="copyGroupId"
          >
            <EmIcon name="rects" :size="16" />
          </button>
        </div>
      </div>

      <div class="group-card__form">
        <div class="group-card__row">
          <span class="group-card__label">{{ t('contacts.card.members') }}</span>
          <div class="group-card__field">
            <span class="group-card__field-text">{{ memberCount }}</span>
          </div>
        </div>

        <div class="group-card__row">
          <span class="group-card__label">{{ t('contacts.card.description') }}</span>
          <div class="group-card__field">
            <span class="group-card__field-text">{{ description }}</span>
          </div>
        </div>
      </div>

      <div class="group-card__actions">
        <button
          type="button"
          class="group-card__btn group-card__btn--primary"
          @click="onSendMessage"
        >
          <ChatIcon :size="18" class="group-card__btn-icon" />
          <span>{{ t('contacts.card.sendMessage') }}</span>
        </button>
        <button
          v-if="isOwner"
          type="button"
          class="group-card__btn group-card__btn--danger"
          @click="openDestroyModal"
        >
          <span>{{ t('contacts.card.destroyGroup') }}</span>
        </button>
        <button
          v-else
          type="button"
          class="group-card__btn group-card__btn--danger"
          @click="openLeaveModal"
        >
          <span>{{ t('contacts.card.leaveGroup') }}</span>
        </button>
      </div>
    </div>

    <EmModal
      v-model:show="isLeaveModalOpen"
      :title="t('contacts.card.leaveConfirmTitle')"
      type="danger"
      :confirm-text="t('contacts.card.leaveGroup')"
      :close-on-click-overlay="false"
      @confirm="confirmLeave"
      @cancel="closeLeaveModal"
    >
      <p class="group-card__modal-message">
        {{ t('contacts.card.leaveConfirmMessage', { name: groupName }) }}
      </p>
    </EmModal>

    <EmModal
      v-model:show="isDestroyModalOpen"
      :title="t('contacts.card.destroyConfirmTitle')"
      type="danger"
      :confirm-text="t('contacts.card.destroyGroup')"
      :close-on-click-overlay="false"
      @confirm="confirmDestroy"
      @cancel="closeDestroyModal"
    >
      <p class="group-card__modal-message">
        {{ t('contacts.card.destroyConfirmMessage', { name: groupName }) }}
      </p>
    </EmModal>
  </div>
</template>

<style lang="scss" scoped>
.group-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: var(--color-bg);

  &__header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    height: 56px;
    padding: 0 24px;
    border-bottom: 1px solid var(--color-border);
  }

  &__title {
    font-size: 16px;
    font-weight: 500;
    color: var(--color-text);
  }

  &__body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 32px 24px;
  }

  &__profile {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 32px;
  }

  &__avatar {
    font-size: 28px;
    font-weight: 500;
  }

  &__name {
    margin: 16px 0 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text);
  }

  &__group-id {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 6px;
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  &__icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    color: var(--color-text-secondary);
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 4px;
    transition:
      color 0.2s,
      background-color 0.2s;

    &:hover {
      color: var(--color-primary);
      background: var(--color-bg-secondary);
    }
  }

  &__form {
    max-width: 560px;
    margin: 0 auto 32px;
  }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 52px;
    padding: 12px 0;
    border-bottom: 1px solid var(--color-border);

    &:last-child {
      border-bottom: none;
    }
  }

  &__label {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text);
  }

  &__field {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  &__field-text {
    font-size: 14px;
    color: var(--color-text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
    max-width: 560px;
    margin: 0 auto;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    flex: none;
    min-width: 96px;
    height: 36px;
    padding: 0 16px;
    font-size: 14px;
    color: var(--color-text);
    cursor: pointer;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    transition:
      background-color 0.2s,
      border-color 0.2s;

    &--primary {
      color: #ffffff;
      background: var(--color-primary);
      border-color: var(--color-primary);

      &:hover:not(:disabled) {
        background: var(--color-primary-hover, var(--color-primary));
      }
    }

    &--danger {
      color: var(--uikit-danger-color, #ee798c);
      border-color: var(--uikit-danger-color, #ee798c);

      &:hover:not(:disabled) {
        color: #ffffff;
        background: var(--uikit-danger-color, #ee798c);
      }
    }
  }

  &__btn-icon {
    width: 18px;
    height: 18px;
  }

  &__modal-message {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
    color: var(--color-text-secondary);
  }
}
</style>
