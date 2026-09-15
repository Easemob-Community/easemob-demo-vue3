import { useGroup, useUIKit } from '@easemob/uikit-im'
import type { CreateGroupParams } from '@easemob/uikit-im'

/**
 * 创建群组接管（EmCreateGroupModal 的 create-fn）：demo 造数时把群名改为
 * 「群组 + 创建日期时间」，便于区分多次创建的群。
 *
 * 改名后委托 useGroup().createGroup 走 SDK 默认创建（未注入 repositories.group 时
 * Domain 回落 SDK 默认路径），会话 / 通讯录两页共用。
 *
 * 注意：弹窗创建成功后仍会用自动生成的旧名字写入本地会话，这里在宏任务补一次
 * updateConversation 改名，避免会话列表短暂显示旧名（下次会话同步后也会纠正）。
 */
export function useDemoCreateGroup() {
  const { createGroup } = useGroup()
  const { stores } = useUIKit()

  /** 群名格式化为「群组 yyyy-MM-dd HH:mm:ss」 */
  function formatGroupName(now = new Date()) {
    const p = (n: number) => String(n).padStart(2, '0')
    return `群组 ${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())} ${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`
  }

  /** EmCreateGroupModal create-fn：改名后走 SDK 默认创建 */
  async function demoCreateGroup(params: CreateGroupParams) {
    const name = formatGroupName()
    const result = await createGroup({ ...params, name })
    setTimeout(() => stores.conversation.updateConversation(result.groupId, { name }), 0)
    return result
  }

  return { demoCreateGroup, formatGroupName }
}
