import { describe, expect, it } from 'vitest'

import { useDemoSettings } from '@/composables/useDemoSettings'

describe('useDemoSettings（会话UIKIT特性开关）', () => {
  it('首次调用创建单例，状态为默认值', () => {
    const settings = useDemoSettings()

    expect(settings.statusBannerEnabled.value).toBe(true)
    expect(settings.conversationUnreadMode.value).toBe('count')
    expect(settings.conversationUnreadPlacement.value).toBe('inline')
    expect(settings.conversationBadgePlacement.value).toBe('top-right')
    expect(settings.conversationTabsVisible.value).toBe(true)
    expect(settings.conversationTabsTakeover.value).toBe(false)
    expect(settings.notificationEnable.value).toBe(false)
    expect(settings.conversationActiveTab.value).toBe('all')
    expect(settings.conversationTabs.value).toContain('all')
    expect(settings.conversationTabs.value).toContain('unread')
    expect(settings.conversationTabs.value).toContain('atMe')
    expect(settings.conversationTabs.value).toContain('single')
    expect(settings.conversationTabs.value).toContain('group')
    expect(settings.chatInputMode.value).toBe('simple')
    expect(settings.chatInputStyle.value).toBe('toolbar-top')
    expect(settings.chatInputFeatures.value.emoji).toBe(true)
    expect(settings.groupReadReceiptEnabled.value).toBe(true)
    expect(settings.chatMessageSearchEnabled.value).toBe(false)
    expect(settings.contactShowHomeSearch.value).toBe(true)
    expect(settings.contactShowContactSearch.value).toBe(true)
    expect(settings.contactShowGroupSearch.value).toBe(true)
    expect(settings.contactShowNotice.value).toBe(true)
    expect(settings.contactShowContactEntry.value).toBe(true)
    expect(settings.contactShowGroupEntry.value).toBe(true)
    expect(settings.contactShowBlocklist.value).toBe(true)
    expect(settings.contactShowContactAddButton.value).toBe(true)
    expect(settings.contactShowGroupCreateButton.value).toBe(true)
    expect(settings.contactShowBlocklistAddButton.value).toBe(true)
    expect(settings.aiMockReplyEnabled.value).toBe(false)
    expect(settings.noticeTone.value).toBe('default')
    expect(settings.notificationEnable.value).toBe(false)
    expect(settings.notificationBrowser.value).toBe(true)
    expect(settings.notificationInApp.value).toBe(true)
    expect(settings.notificationAutoRequest.value).toBe(true)
    expect(settings.notificationTriggerMode.value).toBe('background')
    expect(settings.notificationSound.value).toBe(false)
    expect(settings.logCollectionEnabled.value).toBe(true)
    expect(settings.uikitLogLevel.value).toBe('info')
    expect(settings.sdkLogLevel.value).toBe('warn')
  })

  it('toggleConversationTab 控制 tab 显隐并处理激活 tab 回落', () => {
    const settings = useDemoSettings()
    settings.conversationActiveTab.value = 'unread'

    settings.toggleConversationTab('unread', false)
    expect(settings.conversationTabs.value).not.toContain('unread')
    expect(settings.conversationActiveTab.value).toBe('all')

    settings.toggleConversationTab('single', true)
    expect(settings.conversationTabs.value).toContain('single')
  })

  it('moveConversationTab 调整 tab 顺序', () => {
    const settings = useDemoSettings()
    const origin = [...settings.conversationTabs.value]

    settings.moveConversationTab(0, 2)
    expect(settings.conversationTabs.value[2]).toBe(origin[0])
  })

  it('resetConversationSettings 重置为默认值', () => {
    const settings = useDemoSettings()
    settings.statusBannerEnabled.value = false
    settings.conversationUnreadMode.value = 'dot'
    settings.conversationUnreadPlacement.value = 'avatar'
    settings.conversationBadgePlacement.value = 'bottom-right'
    settings.conversationTabsVisible.value = false
    settings.conversationTabsTakeover.value = true
    settings.conversationActiveTab.value = 'group'
    settings.conversationTabs.value = ['single']

    settings.resetConversationSettings()

    expect(settings.statusBannerEnabled.value).toBe(true)
    expect(settings.conversationUnreadMode.value).toBe('count')
    expect(settings.conversationUnreadPlacement.value).toBe('inline')
    expect(settings.conversationBadgePlacement.value).toBe('top-right')
    expect(settings.conversationTabsVisible.value).toBe(true)
    expect(settings.conversationTabsTakeover.value).toBe(false)
    expect(settings.conversationActiveTab.value).toBe('all')
    expect(settings.conversationTabs.value.length).toBeGreaterThan(1)
  })

  it('resetChatSettings 重置聊天状态为默认值', () => {
    const settings = useDemoSettings()
    settings.chatInputMode.value = 'rich'
    settings.chatInputStyle.value = 'toolbar-bottom'
    settings.chatInputFeatures.value = {
      emoji: false,
      image: false,
      file: false,
      voice: false,
      video: false,
      mention: false,
    }
    settings.chatInputAutoFocus.value = true
    settings.chatInputFocusBorderColor.value = '#ff0000'
    settings.chatInputMaxLength.value = 100
    settings.groupReadReceiptEnabled.value = false
    settings.groupReadReceiptMaxSize.value = 50
    settings.chatShowTime.value = 'hover'
    settings.chatMessageSearchEnabled.value = true
    settings.chatMessageServerSearchEnabled.value = true
    settings.chatMessageListShowAvatar.value = false
    settings.chatMessageStatusShowText.value = true
    settings.chatMessageStatusDirection.value = 'vertical'
    settings.chatMessageStatusPosition.value = 'inline'
    settings.chatMessageStatusStyle.value = 'capsule'
    settings.chatMessageAction.value = {
      enableQuote: false,
      enableCopy: false,
      enableDownload: false,
      enableDelete: false,
      enableRecall: false,
      enableRecallOther: false,
      enableEdit: false,
      enableForward: false,
      enableMultiSelect: false,
      enableTranslate: false,
      enableVoiceToText: false,
      enablePin: false,
    }

    settings.resetChatSettings()

    expect(settings.chatInputMode.value).toBe('simple')
    expect(settings.chatInputStyle.value).toBe('toolbar-top')
    expect(settings.chatInputFeatures.value.emoji).toBe(true)
    expect(settings.chatInputAutoFocus.value).toBe(false)
    expect(settings.chatInputFocusBorderColor.value).toBe('')
    expect(settings.chatInputMaxLength.value).toBe(0)
    expect(settings.groupReadReceiptEnabled.value).toBe(true)
    expect(settings.groupReadReceiptMaxSize.value).toBe(200)
    expect(settings.chatShowTime.value).toBe(false)
    expect(settings.chatMessageSearchEnabled.value).toBe(false)
    expect(settings.chatMessageListShowAvatar.value).toBe(true)
    expect(settings.chatMessageShowSelfAvatar.value).toBe(true)
    expect(settings.chatMessageStatusStyle.value).toBe('classic')
    expect(settings.chatMessageStatusPosition.value).toBe('inline')
    expect(settings.chatMessageAction.value.enableQuote).toBe(true)
    expect(settings.chatMessageAction.value.enablePin).toBe(true)
  })

  it('resetContactSettings 重置通讯录状态为默认值', () => {
    const settings = useDemoSettings()
    settings.contactShowHomeSearch.value = false
    settings.contactShowContactSearch.value = false
    settings.contactShowGroupSearch.value = false
    settings.contactShowNotice.value = false
    settings.contactShowContactEntry.value = false
    settings.contactShowGroupEntry.value = false
    settings.contactShowBlocklist.value = false
    settings.contactShowContactAddButton.value = false
    settings.contactShowGroupCreateButton.value = false
    settings.contactShowBlocklistAddButton.value = false

    settings.resetContactSettings()

    expect(settings.contactShowHomeSearch.value).toBe(true)
    expect(settings.contactShowContactSearch.value).toBe(true)
    expect(settings.contactShowGroupSearch.value).toBe(true)
    expect(settings.contactShowNotice.value).toBe(true)
    expect(settings.contactShowContactEntry.value).toBe(true)
    expect(settings.contactShowGroupEntry.value).toBe(true)
    expect(settings.contactShowBlocklist.value).toBe(true)
    expect(settings.contactShowContactAddButton.value).toBe(true)
    expect(settings.contactShowGroupCreateButton.value).toBe(true)
    expect(settings.contactShowBlocklistAddButton.value).toBe(true)
  })

  it('resetAiSettings 重置 AI 流式状态为默认值', () => {
    const settings = useDemoSettings()
    settings.aiMockReplyEnabled.value = true

    settings.resetAiSettings()

    expect(settings.aiMockReplyEnabled.value).toBe(false)
  })

  it('resetNoticeSettings 重置消息通知状态为默认值', () => {
    const settings = useDemoSettings()
    settings.notificationEnable.value = true
    settings.notificationBrowser.value = false
    settings.notificationInApp.value = false
    settings.notificationAutoRequest.value = false
    settings.notificationTriggerMode.value = 'always'
    settings.notificationSound.value = true
    settings.noticeTone.value = 'playful'

    settings.resetNoticeSettings()

    expect(settings.notificationEnable.value).toBe(false)
    expect(settings.notificationBrowser.value).toBe(true)
    expect(settings.notificationInApp.value).toBe(true)
    expect(settings.notificationAutoRequest.value).toBe(true)
    expect(settings.notificationTriggerMode.value).toBe('background')
    expect(settings.notificationSound.value).toBe(false)
    expect(settings.noticeTone.value).toBe('default')
  })

  it('Provider 能力开关默认全部开启（单聊昵称除外），自定义数据源默认关闭', () => {
    const settings = useDemoSettings()

    expect(settings.providerEnableContact.value).toBe(true)
    expect(settings.providerEnableBlocklist.value).toBe(true)
    expect(settings.providerEnablePresence.value).toBe(true)
    expect(settings.providerEnableDraft.value).toBe(true)
    expect(settings.providerEnableMotion.value).toBe(true)
    expect(settings.providerEnableTyping.value).toBe(true)
    expect(settings.providerShowNicknameInSingleChat.value).toBe(false)
    expect(settings.providerShowNicknameInGroupChat.value).toBe(true)
    expect(settings.providerEnableFetchContacts.value).toBe(false)
    expect(settings.providerEnableGroup.value).toBe(true)
    expect(settings.providerEnableUserInfo.value).toBe(true)
    expect(settings.providerEnableUserInfoSubscription.value).toBe(true)
    expect(settings.providerFilterBlockedContacts.value).toBe(true)
    expect(settings.providerEnableToast.value).toBe(true)
    expect(settings.providerContactFetchMode.value).toBe('page')
  })

  it('resetProviderSettings 重置 Provider 能力开关为默认开启', () => {
    const settings = useDemoSettings()
    settings.providerEnableContact.value = false
    settings.providerEnableBlocklist.value = false
    settings.providerEnablePresence.value = false
    settings.providerEnableDraft.value = false
    settings.providerEnableMotion.value = false
    settings.providerEnableTyping.value = false
    settings.providerShowNicknameInSingleChat.value = true
    settings.providerShowNicknameInGroupChat.value = false
    settings.providerEnableFetchContacts.value = true
    settings.providerEnableGroup.value = false
    settings.providerEnableUserInfo.value = false
    settings.providerEnableUserInfoSubscription.value = false
    settings.providerFilterBlockedContacts.value = false
    settings.providerEnableToast.value = false
    settings.providerContactFetchMode.value = 'all'

    settings.resetProviderSettings()

    expect(settings.providerEnableContact.value).toBe(true)
    expect(settings.providerEnableBlocklist.value).toBe(true)
    expect(settings.providerEnablePresence.value).toBe(true)
    expect(settings.providerEnableDraft.value).toBe(true)
    expect(settings.providerEnableMotion.value).toBe(true)
    expect(settings.providerEnableTyping.value).toBe(true)
    expect(settings.providerShowNicknameInSingleChat.value).toBe(false)
    expect(settings.providerShowNicknameInGroupChat.value).toBe(true)
    expect(settings.providerEnableFetchContacts.value).toBe(false)
    expect(settings.providerEnableGroup.value).toBe(true)
    expect(settings.providerEnableUserInfo.value).toBe(true)
    expect(settings.providerEnableUserInfoSubscription.value).toBe(true)
    expect(settings.providerFilterBlockedContacts.value).toBe(true)
    expect(settings.providerEnableToast.value).toBe(true)
    expect(settings.providerContactFetchMode.value).toBe('page')
  })
})
