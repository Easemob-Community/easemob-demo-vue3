import { afterEach, describe, expect, it, vi } from 'vitest'

import { setupBaiduAnalytics } from '@/utils/analytics'

describe('setupBaiduAnalytics', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('非生产环境不注入统计脚本', () => {
    vi.stubEnv('PROD', false)
    const appendSpy = vi.spyOn(document.head, 'appendChild')

    setupBaiduAnalytics()

    expect(appendSpy).not.toHaveBeenCalled()
  })

  it('生产环境注入异步统计脚本', () => {
    vi.stubEnv('PROD', true)
    // mock 掉真实插入，避免 happy-dom 尝试加载外链脚本时打噪音日志
    const appendSpy = vi
      .spyOn(document.head, 'appendChild')
      .mockImplementation((node) => node as never)

    setupBaiduAnalytics()

    expect(appendSpy).toHaveBeenCalledTimes(1)
    const script = appendSpy.mock.calls[0][0] as HTMLScriptElement
    expect(script.tagName).toBe('SCRIPT')
    expect(script.src).toContain('hm.baidu.com/hm.js?fe4106b5ec311f704294a641def7bbb3')
    expect(script.async).toBe(true)
  })
})
