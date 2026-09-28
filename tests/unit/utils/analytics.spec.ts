import { afterEach, describe, expect, it, vi } from 'vitest'

import { setupBaiduAnalytics, trackEvent, trackPageview } from '@/utils/analytics'

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

describe('trackPageview / trackEvent', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    delete window._hmt
  })

  it('非生产环境不上报', () => {
    vi.stubEnv('PROD', false)
    window._hmt = []

    trackPageview('/chat')
    trackEvent('login', 'submit', 'phone')

    expect(window._hmt).toEqual([])
  })

  it('生产环境且 hm.js 未加载（_hmt 不存在）时静默跳过不抛错', () => {
    vi.stubEnv('PROD', true)

    expect(() => {
      trackPageview('/chat')
      trackEvent('login', 'submit', 'phone')
    }).not.toThrow()
  })

  it('trackPageview 上报 _trackPageview 与路径', () => {
    vi.stubEnv('PROD', true)
    window._hmt = []

    trackPageview('/contacts')

    expect(window._hmt).toEqual([['_trackPageview', '/contacts']])
  })

  it('trackEvent 以虚拟页面 pageview 上报（带 label 与不带 label）', () => {
    vi.stubEnv('PROD', true)
    window._hmt = []

    trackEvent('login', 'submit', 'phone')
    trackEvent('contacts', 'add-contact')

    expect(window._hmt).toEqual([
      ['_trackPageview', '/event/login/submit/phone'],
      ['_trackPageview', '/event/contacts/add-contact'],
    ])
  })

  it('trackEvent 会替换 label 中破坏路径结构的字符并截断超长段', () => {
    vi.stubEnv('PROD', true)
    window._hmt = []

    trackEvent('login', 'fail', 'dev:a/b?c#d e')
    trackEvent('login', 'fail', 'x'.repeat(100))

    expect(window._hmt).toEqual([
      ['_trackPageview', '/event/login/fail/dev:a-b-c-d-e'],
      ['_trackPageview', `/event/login/fail/${'x'.repeat(60)}`],
    ])
  })
})
