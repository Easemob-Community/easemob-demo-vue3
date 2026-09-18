<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserInfoStore } from '@easemob/uikit-core'
import { EmAvatar, EmIcon, useOwnUserInfo, useToast, useUIKit } from '@easemob/uikit-im'

import { uploadAvatar } from '@/api/user'
import { useUserStore } from '@/store/modules/user'

import AvatarCropperModal from '../AvatarCropperModal.vue'

defineOptions({ name: 'AvatarSection' })

const { t } = useI18n()
const { success: showSuccess, error: showError } = useToast()
const userStore = useUserStore()
const userInfoStore = useUserInfoStore()
const { client } = useUIKit()
const { avatarUrl: userAvatarUrl, displayName, updateOwnInfoByAttribute } = useOwnUserInfo()

const nickname = computed(() => displayName.value || t('settings.account.defaultNickname'))
const avatarUrl = computed(() => userAvatarUrl.value || '')
const userId = computed(
  () => client.value?.currentUserId || userStore.userId || 'supercalifragilisticexpialidocious',
)
const appServerUrl = computed(() => import.meta.env.VITE_APP_SERVER_URL ?? '')

/* ===== 头像编辑弹窗 ===== */

const isAvatarModalOpen = ref(false)
const isAvatarSaving = ref(false)

function openAvatarModal() {
  isAvatarModalOpen.value = true
}

function closeAvatarModal() {
  isAvatarModalOpen.value = false
}

async function confirmAvatarUpdate(blob: Blob) {
  if (isAvatarSaving.value) return
  if (userStore.loginMode === 'dev') {
    showError(t('settings.account.devModeAvatarDisabled'))
    return
  }
  isAvatarSaving.value = true
  try {
    const accessToken = userStore.accessToken
    const uid = userId.value
    if (!appServerUrl.value) {
      showError(t('settings.account.appServerRequired'))
      return
    }
    if (!accessToken) {
      showError(t('settings.account.avatarUploadFailed'))
      return
    }

    // 1. 上传到 App Server
    const { avatarUrl: uploadedUrl } = await uploadAvatar(uid, blob, accessToken)

    // 2. 同步到 IM 用户属性（使其他用户可见）
    await updateOwnInfoByAttribute('avatarUrl', uploadedUrl)

    // 3. 更新本地用户资料缓存，页面即时刷新
    const existing = userInfoStore.getUserInfo(uid)
    userInfoStore.setUserInfo({
      userId: uid,
      avatarUrl: uploadedUrl,
      nickname: existing?.nickname,
      sign: existing?.sign,
      mail: existing?.mail,
      phone: existing?.phone,
      gender: existing?.gender,
      birth: existing?.birth,
      ext: existing?.ext,
    })

    showSuccess(t('common.saveSuccess'))
    closeAvatarModal()
  } catch (err) {
    console.error('upload avatar failed:', err)
    showError(t('settings.account.avatarUploadFailed'))
  } finally {
    isAvatarSaving.value = false
  }
}
</script>

<template>
  <div class="account-info__row">
    <span class="account-info__label">{{ t('settings.account.avatar') }}</span>
    <div class="account-info__field">
      <div class="account-info__avatar-wrapper">
        <EmAvatar
          :size="40"
          :src="avatarUrl"
          :name="nickname"
          shape="circle"
          class="account-info__field-avatar"
        />
        <button
          type="button"
          class="account-info__avatar-edit"
          :aria-label="t('common.edit')"
          @click="openAvatarModal"
        >
          <EmIcon name="rect_notched/pen" :size="24" />
        </button>
      </div>
    </div>
  </div>

  <AvatarCropperModal v-model:show="isAvatarModalOpen" @confirm="confirmAvatarUpdate" />
</template>

<style lang="scss" scoped>
.account-info {
  /* 头像行：64px 高（头像 40px 上下各 12px），分隔线与昵称 / 签名行一致 */
  &__row {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 64px;
    padding: 0 12px 0 14px;

    &::after {
      content: '';
      position: absolute;
      right: 0;
      bottom: 0;
      left: 14px;
      height: 1px;
      background: var(--color-border);
    }
  }

  &__label {
    font-size: calc(14px * var(--demo-font-scale, 1));
    font-weight: 500;
    color: var(--color-text);
  }

  &__field {
    display: inline-flex;
    align-items: center;
  }

  &__field-avatar {
    font-size: calc(12px * var(--demo-font-scale, 1));
    font-weight: 500;
  }

  &__avatar-wrapper {
    position: relative;
    display: inline-flex;
  }

  /* 编辑遮罩常显（对齐设计稿：rgba(0,0,0,0.1) 遮罩 + 白色编辑图标居中） */
  &__avatar-edit {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 0;
    color: #ffffff;
    cursor: pointer;
    background: rgba(0, 0, 0, 0.1);
    border: none;
    border-radius: 50%;
    transition: background-color 0.2s;

    &:hover {
      background: rgba(0, 0, 0, 0.3);
    }
  }
}
</style>
