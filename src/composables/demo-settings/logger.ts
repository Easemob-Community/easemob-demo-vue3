/**
 * Demo UIKIT特性开关 - 日志域
 *
 * 职责：
 * - 持有「日志获取」特性面板内日志收集与级别配置
 * - 由 App.vue 聚合成 loggerConfig 注入 EmUIKitProvider
 *
 * 设计取舍：
 * - 只做「状态 + 动作」聚合，不持有任何 UI 结构
 * - 模块级单例，保证面板修改能实时作用到页面
 */
import { ref } from 'vue'

function createLoggerSettings() {
  /* ===== 日志获取配置 ===== */
  /** 是否收集 SDK 日志（UIKit 运行日志默认持久化；该开关额外控制 SDK 层日志） */
  const logCollectionEnabled = ref(true)
  /** UIKit 层日志收集级别（默认 'info'） */
  const uikitLogLevel = ref<'debug' | 'info' | 'warn' | 'error'>('info')
  /** SDK 层日志收集级别（默认 'warn'） */
  const sdkLogLevel = ref<'debug' | 'warn' | 'error'>('warn')
  /** 日志操作反馈文案（导出条数 / 清空提示） */
  const logActionTip = ref('')

  function setUikitLogLevel(level: 'debug' | 'info' | 'warn' | 'error') {
    uikitLogLevel.value = level
  }

  function setSdkLogLevel(level: 'debug' | 'warn' | 'error') {
    sdkLogLevel.value = level
  }

  return {
    // 日志获取
    logCollectionEnabled,
    uikitLogLevel,
    sdkLogLevel,
    logActionTip,
    setUikitLogLevel,
    setSdkLogLevel,
  }
}

/**
 * 全局单例访问：设置面板（SettingsLogPanel）与 App.vue 必须共享同一份状态，
 * 否则面板修改无法作用到页面。首次调用创建实例，之后一律复用。
 */
let loggerSettings: ReturnType<typeof createLoggerSettings> | null = null

export function useLoggerSettings() {
  if (!loggerSettings) loggerSettings = createLoggerSettings()
  return loggerSettings
}
