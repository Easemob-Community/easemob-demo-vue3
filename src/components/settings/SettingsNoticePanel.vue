<script setup lang="ts">
/**
 * UIKit 特性开关 - 消息通知面板
 *
 * 命名说明：
 * - 设计图里的「通知开关」控制的是 UIKit `useNotification` 能力：
 *   浏览器系统通知 + 页内右上角弹窗 + 触发模式 + 响铃等。
 * - 设计图里的「群系统通知」控制的是 UIKit Provider `noticeConfig`：
 *   聊天消息列表中灰色中性的系统通知（成员加入/退出/群创建等）。
 * - 两者都归为「消息通知」面板，避免和「会话」面板混淆。
 *
 * 面板能力：
 * - 通知总开关及子开关（浏览器通知 / 页内弹窗 / 自动请求权限 / 响铃）
 * - 触发模式（仅页面隐藏时 / 非当前会话即触发）
 * - 群系统通知文案（内置 / 俏皮 / 关闭入群相关通知）
 * - 浏览器通知权限状态与手动请求
 * - 手动注入成员加入通知，实时预览群系统通知文案效果
 * - 一键重置
 */
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  NOTICE_EVENT_TYPE,
  insertChatNotice,
  useClientStore,
  useConversation,
  useMessageStore,
  useNotification,
} from '@easemob/uikit-im'

import { useDemoSettings } from '@/composables/useDemoSettings'

type NoticeTone = 'default' | 'playful' | 'silent'
type TriggerMode = 'background' | 'always'

const TONE_OPTIONS: { key: NoticeTone; labelKey: string }[] = [
  { key: 'default', labelKey: 'features.notice.toneDefault' },
  { key: 'playful', labelKey: 'features.notice.tonePlayful' },
  { key: 'silent', labelKey: 'features.notice.toneSilent' },
]

const TRIGGER_OPTIONS: { key: TriggerMode; labelKey: string }[] = [
  { key: 'background', labelKey: 'features.notice.triggerBackground' },
  { key: 'always', labelKey: 'features.notice.triggerAlways' },
]

defineOptions({ name: 'SettingsNoticePanel' })

const { t } = useI18n()
const {
  notificationEnable,
  notificationBrowser,
  notificationInApp,
  notificationAutoRequest,
  notificationTriggerMode,
  notificationSound,
  noticeTone,
  resetNoticeSettings,
} = useDemoSettings()
const {
  state: notificationState,
  ensureBrowserPermission,
  notify: notifyNotification,
} = useNotification()
const clientStore = useClientStore()
const messageStore = useMessageStore()
const { currentConversation } = useConversation()

const injectTipVisible = ref(false)

/** 浏览器通知权限中文/英文文案 */
const permissionText = computed(() => {
  const map: Record<string, string> = {
    granted: t('features.notice.permissionGranted'),
    denied: t('features.notice.permissionDenied'),
    default: t('features.notice.permissionDefault'),
    unsupported: t('features.notice.permissionUnsupported'),
  }
  return map[notificationState.value.permission] || notificationState.value.permission
})

function setTone(tone: NoticeTone) {
  noticeTone.value = tone
}

function setTriggerMode(mode: TriggerMode) {
  notificationTriggerMode.value = mode
}

/** 手动请求浏览器通知权限 */
async function requestPermission() {
  await ensureBrowserPermission()
}

/** 向当前会话手动注入一条「成员加入」系统通知，用于实时验证文案风格 */
function injectDemoNotice() {
  const conv = currentConversation.value
  if (!conv) {
    showInjectTip()
    return
  }

  insertChatNotice(
    {
      client: { currentUser: clientStore.currentUser },
      message: { addMessage: messageStore.addMessage },
    },
    conv.id,
    conv.type,
    {
      eventType: NOTICE_EVENT_TYPE.MEMBER_JOINED,
      params: { name: 'Alice', count: 1 },
      defaultText: 'Alice 加入群组',
    },
  )
}

function showInjectTip() {
  injectTipVisible.value = true
  window.setTimeout(() => {
    injectTipVisible.value = false
  }, 2000)
}

/** 模拟收到一条新消息通知，用于验证浏览器通知 / 页内弹窗 / 响铃效果 */
function simulateNewMessage() {
  notifyNotification({
    title: 'Alice',
    body: '这是一条模拟的新消息通知',
    conversationId: 'mock_alice',
    conversationType: 'singleChat',
    timestamp: Date.now(),
  })
}
</script>

<template>
  <div class="settings-notice-panel">
    <!-- ===== 通知开关 ===== -->
    <section class="settings-notice-panel__section">
      <h3 class="settings-notice-panel__section-title">
        {{ t('features.notice.switches') }}
      </h3>

      <div class="settings-notice-panel__row">
        <span class="settings-notice-panel__label">
          {{ t('features.notice.enableNotification') }}
        </span>
        <button
          type="button"
          class="settings-notice-panel__switch"
          :class="{ 'settings-notice-panel__switch--active': notificationEnable }"
          :aria-checked="notificationEnable"
          role="switch"
          @click="notificationEnable = !notificationEnable"
        >
          <span class="settings-notice-panel__switch-thumb" />
        </button>
      </div>
      <p class="settings-notice-panel__desc">
        {{ t('features.notice.enableNotificationDesc') }}
      </p>

      <div class="settings-notice-panel__sub-list">
        <div class="settings-notice-panel__row">
          <span class="settings-notice-panel__label settings-notice-panel__label--sub">
            {{ t('features.notice.browserNotification') }}
          </span>
          <button
            type="button"
            class="settings-notice-panel__switch"
            :class="{ 'settings-notice-panel__switch--active': notificationBrowser }"
            :aria-checked="notificationBrowser"
            :disabled="!notificationEnable"
            role="switch"
            @click="notificationBrowser = !notificationBrowser"
          >
            <span class="settings-notice-panel__switch-thumb" />
          </button>
        </div>
        <p class="settings-notice-panel__desc">
          {{ t('features.notice.browserNotificationDesc') }}
        </p>

        <!-- 浏览器通知权限：与浏览器系统通知开关强相关，放在同一区域 -->
        <div class="settings-notice-panel__row settings-notice-panel__row--permission">
          <span class="settings-notice-panel__label settings-notice-panel__label--sub">
            {{ t('features.notice.permissionStatus') }}
          </span>
          <div class="settings-notice-panel__permission-actions">
            <span class="settings-notice-panel__status">{{ permissionText }}</span>
            <button
              type="button"
              class="settings-notice-panel__request-btn"
              :disabled="
                !notificationBrowser
                  || notificationState.permission === 'granted'
                  || notificationState.permission === 'unsupported'
              "
              @click="requestPermission"
            >
              {{ t('features.notice.requestPermission') }}
            </button>
          </div>
        </div>
        <p class="settings-notice-panel__desc">
          {{ t('features.notice.browserPermissionDesc') }}
        </p>

        <div class="settings-notice-panel__row">
          <span class="settings-notice-panel__label settings-notice-panel__label--sub">
            {{ t('features.notice.inAppNotification') }}
          </span>
          <button
            type="button"
            class="settings-notice-panel__switch"
            :class="{ 'settings-notice-panel__switch--active': notificationInApp }"
            :aria-checked="notificationInApp"
            :disabled="!notificationEnable"
            role="switch"
            @click="notificationInApp = !notificationInApp"
          >
            <span class="settings-notice-panel__switch-thumb" />
          </button>
        </div>
        <p class="settings-notice-panel__desc">
          {{ t('features.notice.inAppNotificationDesc') }}
        </p>

        <div class="settings-notice-panel__row">
          <span class="settings-notice-panel__label settings-notice-panel__label--sub">
            {{ t('features.notice.autoRequestPermission') }}
          </span>
          <button
            type="button"
            class="settings-notice-panel__switch"
            :class="{ 'settings-notice-panel__switch--active': notificationAutoRequest }"
            :aria-checked="notificationAutoRequest"
            :disabled="!notificationEnable"
            role="switch"
            @click="notificationAutoRequest = !notificationAutoRequest"
          >
            <span class="settings-notice-panel__switch-thumb" />
          </button>
        </div>
        <p class="settings-notice-panel__desc">
          {{ t('features.notice.autoRequestPermissionDesc') }}
        </p>

        <div class="settings-notice-panel__row">
          <span class="settings-notice-panel__label settings-notice-panel__label--sub">
            {{ t('features.notice.sound') }}
          </span>
          <button
            type="button"
            class="settings-notice-panel__switch"
            :class="{ 'settings-notice-panel__switch--active': notificationSound }"
            :aria-checked="notificationSound"
            :disabled="!notificationEnable"
            role="switch"
            @click="notificationSound = !notificationSound"
          >
            <span class="settings-notice-panel__switch-thumb" />
          </button>
        </div>
        <p class="settings-notice-panel__desc">
          {{ t('features.notice.soundDesc') }}
        </p>

        <!-- 模拟收到消息：验证浏览器通知 / 页内弹窗 / 响铃 -->
        <button
          type="button"
          class="settings-notice-panel__mock-btn"
          :disabled="!notificationEnable"
          @click="simulateNewMessage"
        >
          {{ t('features.notice.simulateNewMessage') }}
        </button>
        <p class="settings-notice-panel__desc">
          {{ t('features.notice.simulateNewMessageDesc') }}
        </p>
      </div>
    </section>

    <!-- ===== 触发模式 ===== -->
    <section class="settings-notice-panel__section">
      <h3 class="settings-notice-panel__section-title">
        {{ t('features.notice.triggerMode') }}
      </h3>

      <div class="settings-notice-panel__options">
        <button
          v-for="opt in TRIGGER_OPTIONS"
          :key="opt.key"
          type="button"
          class="settings-notice-panel__option"
          :class="{ 'settings-notice-panel__option--active': notificationTriggerMode === opt.key }"
          :disabled="!notificationEnable"
          @click="setTriggerMode(opt.key)"
        >
          {{ t(opt.labelKey) }}
        </button>
      </div>

      <p class="settings-notice-panel__desc">
        {{ t('features.notice.triggerModeDesc') }}
      </p>
    </section>

    <!-- ===== 群系统通知文案 ===== -->
    <section class="settings-notice-panel__section">
      <h3 class="settings-notice-panel__section-title">
        {{ t('features.notice.tone') }}
      </h3>

      <div class="settings-notice-panel__options">
        <button
          v-for="opt in TONE_OPTIONS"
          :key="opt.key"
          type="button"
          class="settings-notice-panel__option"
          :class="{ 'settings-notice-panel__option--active': noticeTone === opt.key }"
          @click="setTone(opt.key)"
        >
          {{ t(opt.labelKey) }}
        </button>
      </div>

      <p class="settings-notice-panel__desc">
        {{ t('features.notice.toneDesc') }}
      </p>

      <button
        type="button"
        class="settings-notice-panel__inject-btn"
        :disabled="!currentConversation"
        @click="injectDemoNotice"
      >
        {{ t('features.notice.injectMemberJoined') }}
      </button>

      <p
        class="settings-notice-panel__tip"
        :class="{ 'settings-notice-panel__tip--visible': injectTipVisible || !currentConversation }"
      >
        {{ t('features.notice.selectConversationTip') }}
      </p>
    </section>

    <!-- ===== 一键重置 ===== -->
    <button
      type="button"
      class="settings-notice-panel__reset"
      @click="resetNoticeSettings"
    >
      {{ t('features.notice.resetAll') }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.settings-notice-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;

  &__section {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  &__section-title {
    margin: 0;
    font-size: calc(13px * var(--demo-font-scale, 1));
    font-weight: 600;
    color: var(--color-text-secondary);
  }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    min-height: 24px;

    &--permission {
      align-items: flex-start;
      flex-wrap: wrap;
    }
  }

  &__permission-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  &__label {
    font-size: calc(16px * var(--demo-font-scale, 1));
    font-weight: 500;
    color: var(--color-text);

    &--sub {
      font-size: calc(15px * var(--demo-font-scale, 1));
      font-weight: 400;
      color: var(--color-text);
    }
  }

  &__status {
    font-size: calc(14px * var(--demo-font-scale, 1));
    color: var(--color-text-secondary);
  }

  &__desc {
    margin: -10px 0 0;
    font-size: calc(12px * var(--demo-font-scale, 1));
    color: var(--color-text-secondary);
    line-height: 1.5;
    text-align: right;
  }

  &__sub-list {
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding-left: 12px;
    border-left: 2px solid var(--color-border);
  }

  /* Toggle switch */
  &__switch {
    position: relative;
    width: 44px;
    height: 24px;
    padding: 0;
    border: none;
    border-radius: 12px;
    background-color: var(--color-bg-secondary);
    cursor: pointer;
    transition: background-color 0.2s;
    flex-shrink: 0;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    &--active {
      background-color: var(--uikit-primary-color, var(--color-primary));
    }
  }

  &__switch-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    transition: transform 0.2s;
  }

  &__switch--active &__switch-thumb {
    transform: translateX(20px);
  }

  /* Options buttons */
  &__options {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__option {
    display: inline-flex;
    align-items: center;
    height: 32px;
    padding: 0 14px;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    background: transparent;
    color: var(--color-text);
    font-size: calc(13px * var(--demo-font-scale, 1));
    cursor: pointer;
    transition: all 0.15s;

    &:hover:not(:disabled) {
      border-color: var(--uikit-primary-color, var(--color-primary));
      color: var(--uikit-primary-color, var(--color-primary));
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    &--active {
      border-color: var(--uikit-primary-color, var(--color-primary));
      background-color: var(--uikit-primary-color, var(--color-primary));
      color: #ffffff;

      &:hover:not(:disabled) {
        color: #ffffff;
      }
    }
  }

  /* Inject / request / mock button */
  &__inject-btn,
  &__request-btn,
  &__mock-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    height: 32px;
    padding: 0 14px;
    border: 1px solid var(--uikit-primary-color, var(--color-primary));
    border-radius: 999px;
    background: transparent;
    color: var(--uikit-primary-color, var(--color-primary));
    font-size: calc(13px * var(--demo-font-scale, 1));
    cursor: pointer;
    transition: all 0.15s;

    &:hover:not(:disabled) {
      background-color: var(--uikit-primary-color-opacity, rgba(0, 158, 255, 0.12));
    }

    &:disabled {
      border-color: var(--color-border);
      color: var(--color-text-secondary);
      cursor: not-allowed;
    }
  }

  &__tip {
    margin: 0;
    font-size: calc(12px * var(--demo-font-scale, 1));
    color: var(--uikit-error-color, #ff4d4f);
    opacity: 0;
    transition: opacity 0.2s;

    &--visible {
      opacity: 1;
    }
  }

  /* Reset button */
  &__reset {
    width: 100%;
    height: 40px;
    margin-top: 8px;
    border: none;
    border-radius: 999px;
    background-color: var(--color-bg-secondary);
    color: var(--color-text);
    font-size: calc(14px * var(--demo-font-scale, 1));
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--color-border);
    }
  }
}
</style>
