import { beforeEach, describe, expect, it } from 'vitest'

import { useMobileTabbar } from '@/composables/useMobileTabbar'

describe('useMobileTabbar', () => {
  beforeEach(() => {
    // 模块级共享状态，用例间复位
    useMobileTabbar().showTabbar()
  })

  it('默认显示，hideTabbar/showTabbar 切换状态', () => {
    const tabbar = useMobileTabbar()
    expect(tabbar.isTabbarHidden.value).toBe(false)

    tabbar.hideTabbar()
    expect(tabbar.isTabbarHidden.value).toBe(true)

    tabbar.showTabbar()
    expect(tabbar.isTabbarHidden.value).toBe(false)
  })

  it('多次调用返回同一共享状态（进入聊天态置位、离开复位）', () => {
    const a = useMobileTabbar()
    const b = useMobileTabbar()

    a.hideTabbar()
    expect(b.isTabbarHidden.value).toBe(true)

    b.showTabbar()
    expect(a.isTabbarHidden.value).toBe(false)
  })

  it('暴露的状态为只读，直接赋值不生效', () => {
    const tabbar = useMobileTabbar()
    // @ts-expect-error 只读状态不允许直接赋值
    tabbar.isTabbarHidden.value = true
    expect(tabbar.isTabbarHidden.value).toBe(false)
  })
})
