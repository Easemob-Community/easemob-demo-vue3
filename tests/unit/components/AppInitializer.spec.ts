import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick, type App } from 'vue'

import AppInitializer from '@/components/AppInitializer.vue'
import i18n from '@/locales'

const mocks = vi.hoisted(() => ({
  init: vi.fn(),
  initUIKit: vi.fn(),
  login: vi.fn(),
  replace: vi.fn(),
  userStore: {
    token: 'token',
    userId: 'hfp',
    reset: vi.fn(),
  },
}))

vi.mock('@easemob-community/uikit-im', () => ({
  useClient: () => ({ init: mocks.init, login: mocks.login }),
}))

vi.mock('@/utils/uikit', () => ({
  initUIKit: mocks.initUIKit,
}))

vi.mock('@/composables/useNewMessageNotice', () => ({
  useNewMessageNotice: vi.fn(),
}))

vi.mock('@/store/modules/user', () => ({
  useUserStore: () => mocks.userStore,
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ replace: mocks.replace }),
}))

describe('AppInitializer', () => {
  let app: App<Element> | null = null
  let container: HTMLDivElement | null = null

  beforeEach(() => {
    vi.clearAllMocks()
    mocks.userStore.token = 'token'
    mocks.userStore.userId = 'hfp'
    mocks.initUIKit.mockResolvedValue(undefined)
    mocks.login.mockResolvedValue(undefined)
  })

  afterEach(() => {
    app?.unmount()
    container?.remove()
    app = null
    container = null
  })

  it('AppID 配置下使用已保存凭据自动登录', async () => {
    const sdkConfig = { appId: 'fdde6bc4ae6841a9b874be1b7ad0a8ff' }
    container = document.createElement('div')
    document.body.appendChild(container)
    app = createApp(AppInitializer, { sdkConfig })
    app.use(i18n)
    app.mount(container)
    await nextTick()
    await vi.waitFor(() => expect(mocks.login).toHaveBeenCalledTimes(1))

    expect(mocks.initUIKit).toHaveBeenCalledWith(mocks.init, sdkConfig)
    expect(mocks.login).toHaveBeenCalledWith({ user: 'hfp', accessToken: 'token' })
    expect(mocks.userStore.reset).not.toHaveBeenCalled()
  })
})
