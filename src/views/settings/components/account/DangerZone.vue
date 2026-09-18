<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { EmIcon, EmModal, useToast, useUIKit } from '@easemob/uikit-im'

import { deleteAccount } from '@/api/user'
import { useUserStore } from '@/store/modules/user'

defineOptions({ name: 'DangerZone' })

const { t } = useI18n()
const router = useRouter()
const { error: showError } = useToast()
const userStore = useUserStore()
const { logout } = useUIKit()

/* ===== 退出登录确认弹窗 ===== */

const isLogoutModalOpen = ref(false)
const isLoggingOut = ref(false)

function openLogoutModal() {
  isLogoutModalOpen.value = true
}

function closeLogoutModal() {
  isLogoutModalOpen.value = false
}

async function confirmLogout() {
  if (isLoggingOut.value) return
  isLoggingOut.value = true
  try {
    // UIKit logout 内部会关闭 SDK 连接并清理全局 store
    await logout()
    // 清理本地 Pinia 与 sessionStorage 凭证
    userStore.reset()
    await router.replace('/login')
  } catch (err) {
    showError(err instanceof Error ? err.message : t('common.saveFailed'))
  } finally {
    isLoggingOut.value = false
    closeLogoutModal()
  }
}

/* ===== 注销账户确认弹窗 ===== */

const isDeleteAccountModalOpen = ref(false)
const isDeletingAccount = ref(false)

function openDeleteAccountModal() {
  isDeleteAccountModalOpen.value = true
}

function closeDeleteAccountModal() {
  isDeleteAccountModalOpen.value = false
}

async function confirmDeleteAccount() {
  if (isDeletingAccount.value) return
  const phoneNumber = userStore.phoneNumber
  const chatToken = userStore.chatToken
  if (!phoneNumber || !chatToken) {
    showError(t('settings.account.deleteAccountUnavailable'))
    return
  }

  isDeletingAccount.value = true
  try {
    await deleteAccount(phoneNumber, chatToken)
    // 注销成功后复用退出登录的完整清理逻辑
    await confirmLogout()
  } catch (err) {
    console.error('delete account failed:', err)
    showError(err instanceof Error ? err.message : t('settings.account.deleteAccountFailed'))
  } finally {
    isDeletingAccount.value = false
    closeDeleteAccountModal()
  }
}
</script>

<template>
  <div class="account-info__actions">
    <button
      type="button"
      class="account-info__btn"
      :disabled="!userStore.phoneNumber || !userStore.chatToken"
      @click="openDeleteAccountModal"
    >
      <EmIcon name="person/xmark" :size="18" class="account-info__btn-icon" />
      <span>{{ t('settings.account.deactivateAccount') }}</span>
    </button>
    <button type="button" class="account-info__btn" @click="openLogoutModal">
      <EmIcon name="rect/rgtarrow" :size="18" class="account-info__btn-icon" />
      <span>{{ t('settings.account.logout') }}</span>
    </button>
  </div>

  <EmModal
    v-model:show="isLogoutModalOpen"
    :title="t('settings.account.logoutConfirmTitle')"
    :confirm-text="t('settings.account.logout')"
    :close-on-click-overlay="false"
    @confirm="confirmLogout"
    @cancel="closeLogoutModal"
  >
    <p class="account-info__logout-message">{{ t('settings.account.logoutConfirmMessage') }}</p>
  </EmModal>

  <EmModal
    v-model:show="isDeleteAccountModalOpen"
    :title="t('settings.account.deleteAccountConfirmTitle')"
    type="danger"
    :confirm-text="t('settings.account.deactivateAccount')"
    :close-on-click-overlay="false"
    @confirm="confirmDeleteAccount"
    @cancel="closeDeleteAccountModal"
  >
    <p class="account-info__delete-message">
      {{ t('settings.account.deleteAccountConfirmMessage') }}
    </p>
  </EmModal>
</template>

<style lang="scss" scoped>
.account-info {
  /* 操作按钮组：与资料列表同宽（520px 由父级内容列约束），间距 16px */
  &__actions {
    display: flex;
    gap: 16px;
    width: 100%;
  }

  /* 按钮对齐设计稿：40px 高、胶囊圆角 999px、次级灰底、无边框 */
  &__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    flex: 1;
    height: 40px;
    padding: 0 16px;
    font-size: calc(14px * var(--demo-font-scale, 1));
    font-weight: 500;
    color: var(--color-text);
    cursor: pointer;
    background: var(--color-bg-secondary);
    border: none;
    border-radius: 999px;
    transition: background-color 0.2s;

    &:hover:not(:disabled) {
      background: var(--color-border);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  &__btn-icon {
    width: 18px;
    height: 18px;
  }

  &__logout-message,
  &__delete-message {
    margin: 0;
    font-size: calc(14px * var(--demo-font-scale, 1));
    line-height: 1.5;
    color: var(--color-text-secondary);
  }
}
</style>
