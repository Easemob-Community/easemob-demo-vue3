import { beforeEach, describe, expect, it } from 'vitest'

import { useSettingsDrawer } from '@/composables/useSettingsDrawer'

describe('useSettingsDrawer', () => {
  beforeEach(() => {
    // 模块级共享状态，用例间复位
    useSettingsDrawer().close()
  })

  it('默认关闭，open/close/toggle 切换状态', () => {
    const drawer = useSettingsDrawer()
    expect(drawer.isOpen.value).toBe(false)

    drawer.open()
    expect(drawer.isOpen.value).toBe(true)

    drawer.close()
    expect(drawer.isOpen.value).toBe(false)

    drawer.toggle()
    expect(drawer.isOpen.value).toBe(true)

    drawer.toggle()
    expect(drawer.isOpen.value).toBe(false)
  })

  it('多次调用返回同一共享状态', () => {
    const a = useSettingsDrawer()
    const b = useSettingsDrawer()

    a.open()
    expect(b.isOpen.value).toBe(true)

    b.close()
    expect(a.isOpen.value).toBe(false)
  })
})
