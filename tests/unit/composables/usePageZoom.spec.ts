import { beforeEach, describe, expect, it } from 'vitest'

import {
  PAGE_ZOOM_LEVELS,
  PAGE_ZOOM_STORAGE_KEY,
  readStoredZoom,
  usePageZoom,
} from '@/composables/usePageZoom'

describe('usePageZoom', () => {
  beforeEach(() => {
    // 模块级共享状态，用例间复位（zoom ref 导出，直接归位 100% 并清缓存）
    window.localStorage.clear()
    usePageZoom().resetZoom()
  })

  it('默认 100%，写入根节点 zoom 与补偿系数 --demo-page-zoom', () => {
    const { zoom, isDefaultZoom } = usePageZoom()
    expect(zoom.value).toBe(100)
    expect(isDefaultZoom.value).toBe(true)
    expect(document.documentElement.style.getPropertyValue('zoom')).toBe('1')
    expect(document.documentElement.style.getPropertyValue('--demo-page-zoom')).toBe('1')
  })

  it('zoomIn 按 Chrome 档位阶梯逐级放大', () => {
    const { zoom } = usePageZoom()
    const ladderUp = PAGE_ZOOM_LEVELS.filter((level) => level > 100)
    for (const level of ladderUp) {
      usePageZoom().zoomIn()
      expect(zoom.value).toBe(level)
    }
    expect(document.documentElement.style.getPropertyValue('zoom')).toBe('5')
  })

  it('zoomOut 按 Chrome 档位阶梯逐级缩小', () => {
    const { zoom } = usePageZoom()
    const ladderDown = PAGE_ZOOM_LEVELS.filter((level) => level < 100).reverse()
    for (const level of ladderDown) {
      usePageZoom().zoomOut()
      expect(zoom.value).toBe(level)
    }
    expect(document.documentElement.style.getPropertyValue('zoom')).toBe('0.25')
  })

  it('到达档位边界后不再变化', () => {
    const { zoom, canZoomIn, canZoomOut } = usePageZoom()
    for (let i = 0; i < 20; i++) usePageZoom().zoomIn()
    expect(zoom.value).toBe(500)
    expect(canZoomIn.value).toBe(false)

    for (let i = 0; i < 40; i++) usePageZoom().zoomOut()
    expect(zoom.value).toBe(25)
    expect(canZoomOut.value).toBe(false)
  })

  it('非档位值（如缓存中的 95）向最近档取整步进', () => {
    window.localStorage.setItem(PAGE_ZOOM_STORAGE_KEY, '95')
    // 模拟下次启动读取：直接改值触发 watch（readStoredZoom 在模块加载时执行一次）
    const { zoom } = usePageZoom()
    zoom.value = 95
    usePageZoom().zoomIn()
    expect(zoom.value).toBe(100)
    zoom.value = 95
    usePageZoom().zoomOut()
    expect(zoom.value).toBe(90)
  })

  it('缩放变化持久化到 localStorage', () => {
    usePageZoom().zoomIn()
    expect(window.localStorage.getItem(PAGE_ZOOM_STORAGE_KEY)).toBe('110')
  })

  it('readStoredZoom 对缺失 / 非法 / 越界缓存回退或钳制', () => {
    expect(readStoredZoom()).toBe(100)

    window.localStorage.setItem(PAGE_ZOOM_STORAGE_KEY, 'abc')
    expect(readStoredZoom()).toBe(100)

    window.localStorage.setItem(PAGE_ZOOM_STORAGE_KEY, '600')
    expect(readStoredZoom()).toBe(500)

    window.localStorage.setItem(PAGE_ZOOM_STORAGE_KEY, '10')
    expect(readStoredZoom()).toBe(25)

    window.localStorage.setItem(PAGE_ZOOM_STORAGE_KEY, '90')
    expect(readStoredZoom()).toBe(90)
  })

  it('resetZoom 回到 100% 并同步 DOM', () => {
    const { zoom, isDefaultZoom } = usePageZoom()
    usePageZoom().zoomIn()
    usePageZoom().resetZoom()
    expect(zoom.value).toBe(100)
    expect(isDefaultZoom.value).toBe(true)
    expect(document.documentElement.style.getPropertyValue('zoom')).toBe('1')
  })

  it('多次调用返回同一共享状态', () => {
    const a = usePageZoom()
    const b = usePageZoom()
    a.zoomIn()
    expect(b.zoom.value).toBe(110)
    b.zoomOut()
    expect(a.zoom.value).toBe(100)
  })
})
