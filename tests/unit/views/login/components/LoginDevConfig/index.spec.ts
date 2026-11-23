import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick, type App } from 'vue'

import LoginDevConfig from '@/views/login/components/LoginDevConfig/index.vue'
import { getDevConfig, getDevModeEnabled } from '@/config/dev'
import { useDevMode } from '@/composables/useDevMode'
import i18n from '@/locales'

describe('LoginDevConfig', () => {
  let app: App<Element> | null = null
  let container: HTMLDivElement | null = null

  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
    sessionStorage.clear()
    useDevMode().exitDevMode()
  })

  afterEach(() => {
    app?.unmount()
    container?.remove()
    app = null
    container = null
    vi.clearAllTimers()
    vi.useRealTimers()
    localStorage.clear()
    sessionStorage.clear()
  })

  function mountPanel() {
    container = document.createElement('div')
    document.body.appendChild(container)
    app = createApp(LoginDevConfig)
    app.use(i18n)
    app.mount(container)
    return container
  }

  it('保存 AppID 时禁用私有服务器并写入 dev 配置', async () => {
    const root = mountPanel()
    const appIdInput = root.querySelector<HTMLInputElement>('.login-page__dev-field input')
    const privateServerSwitch = root.querySelectorAll<HTMLButtonElement>('.login-page__switch')[1]
    const saveButton = root.querySelector<HTMLButtonElement>('.login-page__dev-save')
    const appId = 'fdde6bc4ae6841a9b874be1b7ad0a8ff'

    privateServerSwitch.click()
    appIdInput!.value = appId
    appIdInput!.dispatchEvent(new Event('input'))
    await nextTick()

    expect(privateServerSwitch.disabled).toBe(true)
    expect(privateServerSwitch.classList).not.toContain('login-page__switch--active')

    saveButton!.click()
    await nextTick()

    expect(getDevConfig().appKey).toBe(appId)
    expect(getDevConfig().usePrivateServer).toBe(false)
    expect(saveButton!.textContent).toContain(i18n.global.t('login.saved'))
  })

  it('保存 AppKey 后写入 dev 开启状态，供整页刷新后恢复', async () => {
    const root = mountPanel()
    const appKeyInput = root.querySelector<HTMLInputElement>('.login-page__dev-field input')
    const saveButton = root.querySelector<HTMLButtonElement>('.login-page__dev-save')
    expect(appKeyInput).not.toBeNull()
    expect(saveButton).not.toBeNull()

    appKeyInput!.value = 'custom#app'
    appKeyInput!.dispatchEvent(new Event('input'))
    saveButton!.click()
    await nextTick()

    expect(getDevConfig().appKey).toBe('custom#app')
    expect(getDevModeEnabled()).toBe(true)
    expect(useDevMode().devEnabled.value).toBe(true)
    expect(saveButton!.textContent).toContain(i18n.global.t('login.saved'))
  })
})
