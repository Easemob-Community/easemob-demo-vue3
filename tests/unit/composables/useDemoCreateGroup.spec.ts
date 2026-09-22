import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createGroup: vi.fn(),
  updateConversation: vi.fn(),
}))

vi.mock('@easemob-community/uikit-im', () => ({
  useGroup: () => ({
    createGroup: mocks.createGroup,
  }),
  useUIKit: () => ({
    stores: {
      conversation: {
        updateConversation: mocks.updateConversation,
      },
    },
  }),
}))

import type { CreateGroupParams } from '@easemob-community/uikit-im'

import { useDemoCreateGroup } from '@/composables/useDemoCreateGroup'

describe('useDemoCreateGroup', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mocks.createGroup.mockReset()
    mocks.updateConversation.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('formatGroupName', () => {
    it('格式化为「群组 + 日期时间」，且个位数补零', () => {
      const { formatGroupName } = useDemoCreateGroup()
      const name = formatGroupName(new Date(2026, 8, 16, 9, 5, 3))

      expect(name).toBe('群组 2026-09-16 09:05:03')
    })
  })

  describe('demoCreateGroup', () => {
    const baseParams: CreateGroupParams = {
      name: 'Alice、Bob',
      description: '',
      memberIds: ['alice', 'bob'],
    }

    it('以「群组 + 日期时间」替换传入的群名后走 SDK 默认创建', async () => {
      mocks.createGroup.mockResolvedValue({ groupId: 'group-1' })

      const { demoCreateGroup } = useDemoCreateGroup()
      const result = await demoCreateGroup(baseParams)

      expect(result).toEqual({ groupId: 'group-1' })
      expect(mocks.createGroup).toHaveBeenCalledTimes(1)
      const passed = mocks.createGroup.mock.calls[0][0] as CreateGroupParams
      expect(passed.name).toMatch(/^群组 \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
      expect(passed.memberIds).toEqual(['alice', 'bob'])
    })

    it('创建成功后在宏任务把本地会话名纠正为新群名', async () => {
      mocks.createGroup.mockResolvedValue({ groupId: 'group-1' })

      const { demoCreateGroup } = useDemoCreateGroup()
      await demoCreateGroup(baseParams)

      expect(mocks.updateConversation).not.toHaveBeenCalled()
      vi.runAllTimers()
      expect(mocks.updateConversation).toHaveBeenCalledTimes(1)
      const [id, patch] = mocks.updateConversation.mock.calls[0] as [string, { name?: string }]
      expect(id).toBe('group-1')
      expect(patch.name).toMatch(/^群组 /)
    })

    it('SDK 创建失败时透传错误且不补改名', async () => {
      const sdkError = new Error('create failed')
      mocks.createGroup.mockRejectedValue(sdkError)

      const { demoCreateGroup } = useDemoCreateGroup()

      await expect(demoCreateGroup(baseParams)).rejects.toThrow(sdkError)
      vi.runAllTimers()
      expect(mocks.updateConversation).not.toHaveBeenCalled()
    })
  })
})
