import { beforeEach, describe, expect, it } from 'vitest'

import { useFeaturePromo } from '@/composables/useFeaturePromo'

describe('useFeaturePromo', () => {
  beforeEach(() => {
    // 模块级共享状态，用例间复位
    const promo = useFeaturePromo()
    promo.dismissRedDot()
    promo.closePromo()
  })

  it('默认不展示，登录后红点与广告弹层均展示', () => {
    const promo = useFeaturePromo()
    expect(promo.showRedDot.value).toBe(false)
    expect(promo.showPromo.value).toBe(false)

    promo.resetOnLogin()
    expect(promo.showRedDot.value).toBe(true)
    expect(promo.showPromo.value).toBe(true)
  })

  it('关闭后本次登录内不再展示，再次登录恢复展示', () => {
    const promo = useFeaturePromo()
    promo.resetOnLogin()

    promo.dismissRedDot()
    expect(promo.showRedDot.value).toBe(false)
    expect(promo.showPromo.value).toBe(true)

    promo.closePromo()
    expect(promo.showPromo.value).toBe(false)

    // 下一次登录再次展示
    promo.resetOnLogin()
    expect(promo.showRedDot.value).toBe(true)
    expect(promo.showPromo.value).toBe(true)
  })

  it('多次调用返回同一共享状态', () => {
    const a = useFeaturePromo()
    const b = useFeaturePromo()

    a.resetOnLogin()
    expect(b.showRedDot.value).toBe(true)
    expect(b.showPromo.value).toBe(true)

    b.closePromo()
    expect(a.showPromo.value).toBe(false)
  })
})
