/**
 * Demo UIKit 特性开关 - 通讯录域
 *
 * 职责：
 * - 持有「通讯录」特性面板内搜索框、入口、子视图头部按钮的显隐配置
 * - 由 contacts/index.vue 绑定到 EmContactContainer
 *
 * 设计取舍：
 * - 只做「状态 + 动作」聚合，不持有任何 UI 结构
 * - 模块级单例，保证面板修改能实时作用到页面
 */
import { ref } from 'vue'

function createContactSettings() {
  /* ===== 通讯录搜索配置 ===== */
  /** 通讯录首页（联系人 / 群组入口页）是否展示搜索框 */
  const contactShowHomeSearch = ref(true)
  /** 联系人列表是否展示搜索框 */
  const contactShowContactSearch = ref(true)
  /** 群组列表是否展示搜索框 */
  const contactShowGroupSearch = ref(true)

  /* ===== 通讯录入口显隐配置 ===== */
  /** 是否展示「通知」入口 */
  const contactShowNotice = ref(true)
  /** 是否展示「联系人」入口 */
  const contactShowContactEntry = ref(true)
  /** 是否展示「群组」入口 */
  const contactShowGroupEntry = ref(true)
  /** 是否展示「黑名单」入口（Provider.enableBlocklist=false 时强制隐藏） */
  const contactShowBlocklist = ref(true)

  /* ===== 通讯录子视图头部按钮显隐配置 ===== */
  /** 是否在联系人子视图头部展示添加好友按钮 */
  const contactShowContactAddButton = ref(true)
  /** 是否在群组子视图头部展示创建群组按钮 */
  const contactShowGroupCreateButton = ref(true)
  /** 是否在黑名单子视图头部展示添加黑名单按钮 */
  const contactShowBlocklistAddButton = ref(true)

  /** 一键重置通讯录相关状态 */
  function resetContactSettings() {
    contactShowHomeSearch.value = true
    contactShowContactSearch.value = true
    contactShowGroupSearch.value = true
    contactShowNotice.value = true
    contactShowContactEntry.value = true
    contactShowGroupEntry.value = true
    contactShowBlocklist.value = true
    contactShowContactAddButton.value = true
    contactShowGroupCreateButton.value = true
    contactShowBlocklistAddButton.value = true
  }

  return {
    // 通讯录搜索
    contactShowHomeSearch,
    contactShowContactSearch,
    contactShowGroupSearch,
    // 通讯录入口显隐
    contactShowNotice,
    contactShowContactEntry,
    contactShowGroupEntry,
    contactShowBlocklist,
    // 通讯录子视图头部按钮显隐
    contactShowContactAddButton,
    contactShowGroupCreateButton,
    contactShowBlocklistAddButton,
    // 动作
    resetContactSettings,
  }
}

/**
 * 全局单例访问：设置面板（SettingsContactsPanel）与 contacts/index.vue 必须共享同一份状态，
 * 否则面板修改无法作用到页面。首次调用创建实例，之后一律复用。
 */
let contactSettings: ReturnType<typeof createContactSettings> | null = null

export function useContactSettings() {
  if (!contactSettings) contactSettings = createContactSettings()
  return contactSettings
}
