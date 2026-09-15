<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { EmIcon, EmInput, EmPopup, useOwnUserInfo, useToast } from '@easemob/uikit-im'

defineOptions({ name: 'ProfileEditor' })

const { t } = useI18n()
const { success: showSuccess, error: showError } = useToast()
const { displayName, userInfo, updateOwnInfo, updateOwnInfoByAttribute } = useOwnUserInfo()

const nickname = computed(() => displayName.value || t('settings.account.defaultNickname'))
const signature = computed(() => userInfo.value?.sign || t('settings.account.defaultSignature'))

/* ===== 昵称 / 签名编辑弹窗 ===== */

type EditField = 'nickname' | 'signature'

const isEditModalOpen = ref(false)
const editingField = ref<EditField | null>(null)
const editValue = ref('')
const editError = ref('')
const isSaving = ref(false)
const editInputRef = ref<{ inputRef?: HTMLInputElement | null } | null>(null)

const editModalTitle = computed(() => {
  if (editingField.value === 'nickname') return t('settings.account.editNickname')
  if (editingField.value === 'signature') return t('settings.account.editSignature')
  return ''
})

const editPlaceholder = computed(() => {
  if (editingField.value === 'nickname') return t('settings.account.nicknamePlaceholder')
  if (editingField.value === 'signature') return t('settings.account.signaturePlaceholder')
  return ''
})

function openEditModal(field: EditField) {
  editingField.value = field
  editValue.value = field === 'nickname' ? nickname.value : signature.value
  editError.value = ''
  isEditModalOpen.value = true
  nextTick(() => {
    editInputRef.value?.inputRef?.focus()
  })
}

function closeEditModal() {
  isEditModalOpen.value = false
  editingField.value = null
  editValue.value = ''
  editError.value = ''
}

async function confirmEdit() {
  if (!editingField.value || isSaving.value) return

  const trimmed = editValue.value.trim()

  if (editingField.value === 'nickname' && !trimmed) {
    editError.value = t('settings.account.nicknameRequired')
    return
  }

  isSaving.value = true
  try {
    if (editingField.value === 'nickname') {
      await updateOwnInfo({ nickname: trimmed })
    } else {
      await updateOwnInfoByAttribute('sign', trimmed)
    }
    showSuccess(t('common.saveSuccess'))
    closeEditModal()
  } catch (err) {
    showError(err instanceof Error ? err.message : t('common.saveFailed'))
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="account-info__row">
    <span class="account-info__label">{{ t('settings.account.nickname') }}</span>
    <div class="account-info__field">
      <span class="account-info__field-text">{{ nickname }}</span>
      <button
        type="button"
        class="account-info__icon-btn"
        :aria-label="t('common.edit')"
        @click="openEditModal('nickname')"
      >
        <EmIcon name="rect_notched/pen" :size="16" />
      </button>
    </div>
  </div>

  <!-- 头像行由 AvatarSection 渲染，保持原有表单项顺序：昵称 → 头像 → 签名 -->
  <slot name="avatar-row" />

  <div class="account-info__row">
    <span class="account-info__label">{{ t('settings.account.signature') }}</span>
    <div class="account-info__field">
      <span class="account-info__field-text">{{ signature }}</span>
      <button
        type="button"
        class="account-info__icon-btn"
        :aria-label="t('common.edit')"
        @click="openEditModal('signature')"
      >
        <EmIcon name="rect_notched/pen" :size="16" />
      </button>
    </div>
  </div>

  <EmPopup
    v-model:show="isEditModalOpen"
    position="center"
    :close-on-click-overlay="false"
    :close-on-esc="false"
    class="account-info__edit-popup"
  >
    <div class="account-info__edit-modal">
      <div class="account-info__edit-modal-header">
        <span class="account-info__edit-modal-title">{{ editModalTitle }}</span>
      </div>
      <div class="account-info__edit-modal-body">
        <EmInput
          ref="editInputRef"
          v-model="editValue"
          :placeholder="editPlaceholder"
          :error="!!editError"
          :error-message="editError"
          :disabled="isSaving"
          :maxlength="50"
          @submit="confirmEdit"
        />
      </div>
      <div class="account-info__edit-modal-footer">
        <button
          type="button"
          class="account-info__edit-btn account-info__edit-btn--cancel"
          :disabled="isSaving"
          @click="closeEditModal"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          type="button"
          class="account-info__edit-btn account-info__edit-btn--confirm"
          :disabled="isSaving"
          @click="confirmEdit"
        >
          {{ t('common.confirm') }}
        </button>
      </div>
    </div>
  </EmPopup>
</template>

<style lang="scss" scoped>
.account-info {
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
  }

  &__field-text {
    font-size: 14px;
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

  &__edit-popup {
    :deep(.uikit-popup__content) {
      padding: 0;
      border-radius: 12px;
      background: var(--color-bg);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }
  }

  &__edit-modal {
    width: 320px;
    padding: 20px;
  }

  &__edit-modal-header {
    margin-bottom: 16px;
  }

  &__edit-modal-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
  }

  &__edit-modal-body {
    margin-bottom: 20px;
  }

  &__edit-modal-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  &__edit-btn {
    height: 36px;
    padding: 0 16px;
    font-size: 14px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition:
      background-color 0.2s,
      opacity 0.2s;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    &--cancel {
      color: var(--color-text);
      background: var(--color-bg-secondary);

      &:hover:not(:disabled) {
        background: var(--color-border);
      }
    }

    &--confirm {
      color: #ffffff;
      background: var(--color-primary);

      &:hover:not(:disabled) {
        background: var(--color-primary-hover, var(--color-primary));
      }
    }
  }
}
</style>
