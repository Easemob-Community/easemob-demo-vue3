import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useCheckUpdates } from '@/composables/useCheckUpdates'

/** 构造只读响应头的 fetch mock，按调用顺序依次返回 etag / last-modified */
function mockFetchSequence(tags: Array<{ etag?: string | null; lastModified?: string | null }>) {
  const fetchMock = vi.fn()
  tags.forEach(({ etag, lastModified }) => {
    fetchMock.mockResolvedValueOnce({
      headers: {
        get: (key: string) => {
          const lower = key.toLowerCase()
          if (lower === 'etag') return etag ?? null
          if (lower === 'last-modified') return lastModified ?? null
          return null
        },
      },
    })
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('useCheckUpdates', () => {
  const reloadMock = vi.fn()

  beforeEach(() => {
    vi.useFakeTimers()
    // 模拟线上域名（happy-dom 默认 localhost，会被本地开发跳过逻辑拦截）
    vi.stubGlobal('location', { hostname: 'demo.example.com', reload: reloadMock })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    reloadMock.mockReset()
  })

  it('首次检查只记录基线，不提示更新', async () => {
    const fetchMock = mockFetchSequence([{ etag: '"v1"' }])
    const { hasUpdate, checkForUpdates } = useCheckUpdates({ url: '/' })

    await checkForUpdates()

    expect(hasUpdate.value).toBe(false)
    expect(fetchMock).toHaveBeenCalledWith('/', {
      cache: 'no-cache',
      method: 'HEAD',
      redirect: 'manual',
    })
  })

  it('指纹变化后提示有新版本，且不再重复检查', async () => {
    const fetchMock = mockFetchSequence([{ etag: '"v1"' }, { etag: '"v2"' }, { etag: '"v2"' }])
    const { hasUpdate, checkForUpdates } = useCheckUpdates({ url: '/' })

    await checkForUpdates()
    expect(hasUpdate.value).toBe(false)

    await checkForUpdates()
    expect(hasUpdate.value).toBe(true)

    // 已提示更新后，再次检查直接短路
    await checkForUpdates()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('无 etag 时回退使用 last-modified 作为指纹', async () => {
    mockFetchSequence([{ lastModified: 'Mon, 01 Jan 2024 00:00:00 GMT' }])
    const { hasUpdate, checkForUpdates } = useCheckUpdates({ url: '/' })

    await checkForUpdates()

    expect(hasUpdate.value).toBe(false)
  })

  it('请求失败时不提示更新也不抛错', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')))
    const { hasUpdate, checkForUpdates } = useCheckUpdates({ url: '/' })

    await expect(checkForUpdates()).resolves.toBeUndefined()
    expect(hasUpdate.value).toBe(false)
  })

  it('本地开发环境直接跳过，不发请求', async () => {
    vi.stubGlobal('location', { hostname: 'localhost', reload: reloadMock })
    const fetchMock = mockFetchSequence([{ etag: '"v1"' }])
    const { hasUpdate, checkForUpdates } = useCheckUpdates({ url: '/' })

    await checkForUpdates()

    expect(fetchMock).not.toHaveBeenCalled()
    expect(hasUpdate.value).toBe(false)
  })

  it('confirmUpdate 更新基线并重载页面', async () => {
    mockFetchSequence([{ etag: '"v1"' }, { etag: '"v2"' }])
    const { hasUpdate, checkForUpdates, confirmUpdate } = useCheckUpdates({ url: '/' })

    await checkForUpdates()
    await checkForUpdates()
    expect(hasUpdate.value).toBe(true)

    confirmUpdate()
    expect(reloadMock).toHaveBeenCalledTimes(1)
  })

  it('startPolling 立即检查一次并按间隔轮询，检测到新版本后停止轮询', async () => {
    const fetchMock = mockFetchSequence([
      { etag: '"v1"' },
      { etag: '"v1"' },
      { etag: '"v1"' },
      { etag: '"v2"' },
      { etag: '"v2"' },
    ])
    const { hasUpdate, startPolling, stopPolling } = useCheckUpdates({ url: '/', interval: 1 })

    startPolling()
    await vi.advanceTimersByTimeAsync(0)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    // 1 分钟轮询一次
    await vi.advanceTimersByTimeAsync(60 * 1000)
    expect(fetchMock).toHaveBeenCalledTimes(2)

    // 检测到新版本后清除定时器，不再轮询
    await vi.advanceTimersByTimeAsync(120 * 1000)
    expect(fetchMock).toHaveBeenCalledTimes(4)
    expect(hasUpdate.value).toBe(true)

    await vi.advanceTimersByTimeAsync(120 * 1000)
    expect(fetchMock).toHaveBeenCalledTimes(4)

    stopPolling()
  })

  it('interval <= 0 时不启动轮询', () => {
    const fetchMock = mockFetchSequence([{ etag: '"v1"' }])
    const { startPolling } = useCheckUpdates({ url: '/', interval: 0 })

    startPolling()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('页面隐藏时暂停轮询，回到前台立即检查', async () => {
    const fetchMock = mockFetchSequence([
      { etag: '"v1"' },
      { etag: '"v1"' },
      { etag: '"v2"' },
    ])
    const { hasUpdate, startPolling, stopPolling } = useCheckUpdates({ url: '/', interval: 1 })

    startPolling()
    await vi.advanceTimersByTimeAsync(0)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    // 隐藏页面：暂停轮询
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
    await vi.advanceTimersByTimeAsync(60 * 1000)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    // 回到前台：立即检查一次
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
    await vi.advanceTimersByTimeAsync(0)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(hasUpdate.value).toBe(false)

    stopPolling()
  })
})
