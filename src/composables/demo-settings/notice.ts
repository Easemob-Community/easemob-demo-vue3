/**
 * Demo UIKIT特性开关 - 通知域
 *
 * 职责：
 * - 持有「通知」特性面板内新消息提醒（useNotification）与群系统通知话术（Provider noticeConfig）配置
 * - noticeConfig 由 App.vue 注入 EmUIKitProvider
 *
 * 设计取舍：
 * - 只做「状态 + 动作」聚合，不持有任何 UI 结构
 * - 模块级单例，保证面板修改能实时作用到页面
 */
import { computed, ref } from 'vue'
import { NOTICE_EVENT_TYPE } from '@easemob/uikit-im'
import type { NoticeConfig } from '@easemob/uikit-im'

function createNoticeSettings() {
  /* ===== 新消息提醒配置（useNotification） ===== */
  /** 消息通知总开关 */
  const notificationEnable = ref(false)
  /** 浏览器系统通知（页面在后台时优先） */
  const notificationBrowser = ref(true)
  /** 页内右上角弹窗（浏览器通知不可用时降级） */
  const notificationInApp = ref(true)
  /** 首次通知时自动请求浏览器通知权限 */
  const notificationAutoRequest = ref(true)
  /** 触发模式：'background' 仅页面隐藏时（默认）| 'always' 非当前会话即触发 */
  const notificationTriggerMode = ref<'background' | 'always'>('background')
  /** 新消息响铃（onNotify 送达回调演示：Web Audio 哔声） */
  const notificationSound = ref(false)

  /* ===== 群系统通知配置（Provider noticeConfig） ===== */
  /**
   * 群系统通知话术档位：
   * - default：使用 UIKit 内置多语言文案
   * - playful：自定义俏皮话术覆盖成员加入/退出/群创建，并过滤批量加入（>5 人）刷屏
   * - silent：禁用成员加入/退出/群创建三类通知
   */
  const noticeTone = ref<'default' | 'playful' | 'silent'>('default')

  /**
   * Provider :notice-config 实际配置。
   * 随 noticeTone 推导，由 App.vue 注入 EmUIKitProvider。
   */
  const noticeConfig = computed<NoticeConfig>(() => {
    if (noticeTone.value === 'playful') {
      return {
        renderText: (ctx) => {
          if (ctx.eventType === NOTICE_EVENT_TYPE.MEMBER_JOINED)
            return `欢迎 ${ctx.params.name} 闪亮登场~`
          if (ctx.eventType === NOTICE_EVENT_TYPE.MEMBER_EXITED)
            return `${ctx.params.name} 溜了溜了`
          if (ctx.eventType === NOTICE_EVENT_TYPE.GROUP_CREATED)
            return '新群开张，喜气洋洋！'
          return null
        },
        filter: (ctx) => {
          // 批量加入（>5 人）避免刷屏，直接隐藏
          if (
            ctx.eventType === NOTICE_EVENT_TYPE.MEMBER_JOINED
            && (ctx.params.count as number) > 5
          )
            return false
          return true
        },
      }
    }
    if (noticeTone.value === 'silent') {
      return {
        disabledEvents: [
          NOTICE_EVENT_TYPE.MEMBER_JOINED,
          NOTICE_EVENT_TYPE.MEMBER_EXITED,
          NOTICE_EVENT_TYPE.GROUP_CREATED,
        ],
      }
    }
    return {}
  })

  /** 一键重置消息通知状态 */
  function resetNoticeSettings() {
    notificationEnable.value = false
    notificationBrowser.value = true
    notificationInApp.value = true
    notificationAutoRequest.value = true
    notificationTriggerMode.value = 'background'
    notificationSound.value = false
    noticeTone.value = 'default'
  }

  return {
    // 新消息提醒
    notificationEnable,
    notificationBrowser,
    notificationInApp,
    notificationAutoRequest,
    notificationTriggerMode,
    notificationSound,
    // 群系统通知
    noticeTone,
    noticeConfig,
    // 动作
    resetNoticeSettings,
  }
}

/**
 * 全局单例访问：设置面板（SettingsNoticePanel）与 App.vue 必须共享同一份状态，
 * 否则面板修改无法作用到页面。首次调用创建实例，之后一律复用。
 */
let noticeSettings: ReturnType<typeof createNoticeSettings> | null = null

export function useNoticeSettings() {
  if (!noticeSettings) noticeSettings = createNoticeSettings()
  return noticeSettings
}
