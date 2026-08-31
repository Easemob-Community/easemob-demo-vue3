<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  EmAvatar,
  EmIcon,
  EmModal,
  useBlocklist,
  useContact,
  usePresence,
  useToast,
  useUserInfo,
} from '@easemob/uikit-im'

interface Props {
  userId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'send-message', userId: string): void
  (e: 'deleted', userId: string): void
}>()

defineOptions({ name: 'ContactCard' })

const { t } = useI18n()
const { success: showSuccess, error: showError } = useToast()
const { subscribePresence, unsubscribePresence, get: getPresence } = usePresence()
const { isBlocked, addBlock, removeBlock } = useBlocklist()
const { deleteContact } = useContact()

/** 用户资料：展示优先级 联系人备注 > 用户资料昵称/头像 > 用户 ID（uikit 内部已处理拉取与订阅） */
const { contact, displayName, avatarUrl, userInfo } = useUserInfo(() => props.userId)

const signature = computed(() => userInfo.value?.sign || t('contacts.card.defaultSignature'))

/** 联系人在线状态：优先从 UIKit presence 订阅读取，默认 online */
const presenceStatus = computed(() => getPresence(props.userId)?.value?.status ?? 'online')

// 订阅在线状态；服务端未开通或异常时静默降级
watch(
  () => props.userId,
  async (id) => {
    if (!id) return
    try {
      await subscribePresence([id])
    } catch {
      // 静默降级，避免无 presence 能力时影响卡片展示
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  const id = props.userId
  if (id) {
    unsubscribePresence([id]).catch(() => {
      // 忽略未连接等异常
    })
  }
})

async function copyUserId() {
  try {
    await navigator.clipboard.writeText(props.userId)
    showSuccess(t('common.copySuccess'))
  } catch {
    // 复制失败时静默降级，避免阻塞用户
  }
}

function onSendMessage() {
  emit('send-message', props.userId)
}

/* ===== 拉黑 / 取消拉黑：二次确认 ===== */

const isBlockModalOpen = ref(false)

function openBlockModal() {
  isBlockModalOpen.value = true
}

function closeBlockModal() {
  isBlockModalOpen.value = false
}

const blockModalTitle = computed(() =>
  isBlocked(props.userId) ? t('contacts.card.unblockConfirmTitle') : t('contacts.card.blockConfirmTitle'),
)

const blockModalMessage = computed(() =>
  isBlocked(props.userId)
    ? t('contacts.card.unblockConfirmMessage', { name: displayName.value })
    : t('contacts.card.blockConfirmMessage', { name: displayName.value }),
)

const blockConfirmText = computed(() =>
  isBlocked(props.userId) ? t('contacts.card.unblock') : t('contacts.card.block'),
)

async function confirmBlock() {
  try {
    if (isBlocked(props.userId)) {
      await removeBlock(props.userId)
      showSuccess(t('contacts.card.unblockSuccess'))
    } else {
      // addBlock 内部会同步更新 store.blackList，使黑名单列表即时刷新
      await addBlock(
        contact.value || {
          userId: props.userId,
          name: displayName.value,
          avatar: avatarUrl.value,
        },
      )
      showSuccess(t('contacts.card.blockSuccess'))
    }
  } catch (err) {
    showError(err instanceof Error ? err.message : t('common.saveFailed'))
  } finally {
    closeBlockModal()
  }
}

/* ===== 删除联系人确认弹窗 ===== */

const isDeleteModalOpen = ref(false)

function openDeleteModal() {
  isDeleteModalOpen.value = true
}

function closeDeleteModal() {
  isDeleteModalOpen.value = false
}

async function confirmDelete() {
  try {
    await deleteContact(props.userId)
    showSuccess(t('contacts.card.deleteSuccess'))
    emit('deleted', props.userId)
  } catch (err) {
    showError(err instanceof Error ? err.message : t('common.saveFailed'))
  } finally {
    closeDeleteModal()
  }
}
</script>

<template>
  <!-- 结构一比一参照设置页账户信息（AccountInfo.vue）：头部 + 资料区 + 表单行 + 操作区 -->
  <div class="contact-card">
    <div class="contact-card__header">
      <span class="contact-card__title">{{ t('contacts.card.contactTitle') }}</span>
    </div>

    <div class="contact-card__body">
      <div class="contact-card__profile">
        <EmAvatar
          :size="80"
          :src="avatarUrl || ''"
          :name="displayName"
          shape="circle"
          :presence="presenceStatus"
          class="contact-card__avatar"
        />
        <h2 class="contact-card__name">{{ displayName }}</h2>
        <div class="contact-card__user-id">
          <span>ID: {{ userId }}</span>
          <button
            type="button"
            class="contact-card__icon-btn"
            :aria-label="t('common.copy')"
            @click="copyUserId"
          >
            <EmIcon name="rects" :size="16" />
          </button>
        </div>
      </div>

      <div class="contact-card__form">
        <div class="contact-card__row">
          <span class="contact-card__label">{{ t('contacts.card.nickname') }}</span>
          <div class="contact-card__field">
            <span class="contact-card__field-text">{{ displayName }}</span>
          </div>
        </div>

        <div class="contact-card__row">
          <span class="contact-card__label">{{ t('contacts.card.signature') }}</span>
          <div class="contact-card__field">
            <span class="contact-card__field-text">{{ signature }}</span>
          </div>
        </div>
      </div>

      <div class="contact-card__actions">
        <button
          type="button"
          class="contact-card__btn contact-card__btn--primary"
          @click="onSendMessage"
        >
          <EmIcon name="bubble/rect/empty" :size="18" class="contact-card__btn-icon" />
          <span>{{ t('contacts.card.sendMessage') }}</span>
        </button>
        <button type="button" class="contact-card__btn" @click="openBlockModal">
          <EmIcon name="circle/slash" :size="18" class="contact-card__btn-icon" />
          <span>{{ isBlocked(userId) ? t('contacts.card.unblock') : t('contacts.card.block') }}</span>
        </button>
        <button
          type="button"
          class="contact-card__btn contact-card__btn--danger"
          @click="openDeleteModal"
        >
          <EmIcon name="trash" :size="18" class="contact-card__btn-icon" />
          <span>{{ t('contacts.card.deleteContact') }}</span>
        </button>
      </div>
    </div>

    <EmModal
      v-model:show="isBlockModalOpen"
      :title="blockModalTitle"
      :confirm-text="blockConfirmText"
      :close-on-click-overlay="false"
      @confirm="confirmBlock"
      @cancel="closeBlockModal"
    >
      <p class="contact-card__modal-message">{{ blockModalMessage }}</p>
    </EmModal>

    <EmModal
      v-model:show="isDeleteModalOpen"
      :title="t('contacts.card.deleteConfirmTitle')"
      type="danger"
      :confirm-text="t('contacts.card.deleteContact')"
      :close-on-click-overlay="false"
      @confirm="confirmDelete"
      @cancel="closeDeleteModal"
    >
      <p class="contact-card__modal-message">
        {{ t('contacts.card.deleteConfirmMessage', { name: displayName }) }}
      </p>
    </EmModal>
  </div>
</template>

<style lang="scss" scoped>
.contact-card {
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

  &__user-id {
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
