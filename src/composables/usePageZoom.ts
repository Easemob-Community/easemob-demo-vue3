import { computed, ref, watch } from 'vue'

/**
 * 页面缩放（复刻 Chrome 页面缩放的档位行为）。
 *
 * 与「UIKit 特性开关 - 字号」（fontSizeScale，只放大文字）不同，这里通过
 * documentElement 的 CSS `zoom` 属性做整页缩放：px 单位、图片、布局全部
 * 按档位重排，媒体查询按缩放后的视口重新求值，效果等同浏览器 cmd+加号/减号。
 *
 * 档位完全照抄 Chrome 缩放阶梯（%）：100 以上为 110 / 125 / 150 / 175 / 200 /
 * 250 / 300 / 400 / 500，100 以下为 90 / 80 / 75 / 67 / 50 / 33 / 25，
 * 范围钳制在 25% – 500%。
 *
 * 缩放值持久化在 localStorage（key: layout_page_zoom），刷新 / 重开页面自动恢复。
 */

/** localStorage 缓存键（与 layout_sidebar_width 同体系） */
export const PAGE_ZOOM_STORAGE_KEY = 'layout_page_zoom'

/** Chrome 缩放档位阶梯（升序，单位 %） */
export const PAGE_ZOOM_LEVELS = [
  25, 33, 50, 67, 75, 80, 90, 100, 110, 125, 150, 175, 200, 250, 300, 400, 500,
] as const

const ZOOM_MIN = PAGE_ZOOM_LEVELS[0]
const ZOOM_MAX = PAGE_ZOOM_LEVELS[PAGE_ZOOM_LEVELS.length - 1]

/** 读取持久化缩放值；无记忆 / 非法 / 越界时钳制回合法范围（默认 100） */
export function readStoredZoom(storage?: Storage): number {
  if (typeof window === 'undefined' && !storage) return 100
  const store = storage ?? window.localStorage
  try {
    const raw = store.getItem(PAGE_ZOOM_STORAGE_KEY)
    const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN
    if (Number.isNaN(parsed)) return 100
    return Math.min(Math.max(parsed, ZOOM_MIN), ZOOM_MAX)
  } catch {
    // 缓存不可读（隐私模式 / 损坏）时按 100% 处理
    return 100
  }
}

/** 当前缩放值（%，模块级共享状态，设置面板多实例调用返回同一引用） */
const zoom = ref(readStoredZoom())

/** 当前档位的下一档（zoomIn 取大于当前值的最小档，zoomOut 取小于当前值的最大档） */
function nextLevel(current: number, direction: 1 | -1): number {
  if (direction === 1) {
    for (const level of PAGE_ZOOM_LEVELS) {
      if (level > current) return level
    }
    return ZOOM_MAX
  }
  for (let i = PAGE_ZOOM_LEVELS.length - 1; i >= 0; i--) {
    if (PAGE_ZOOM_LEVELS[i] < current) return PAGE_ZOOM_LEVELS[i]
  }
  return ZOOM_MIN
}

function applyZoom(value: number) {
  if (typeof document === 'undefined') return
  const rootStyle = document.documentElement.style
  rootStyle.setProperty('zoom', String(value / 100))
  // CSS zoom 下 vh 单位按未缩放视口解析（与浏览器原生缩放不同），会导致满铺高度
  // 在缩小档底部留白；这里写一份缩放系数，满铺高度以 calc(100vh / var(--demo-page-zoom)) 补偿
  rootStyle.setProperty('--demo-page-zoom', String(value / 100))
}

// 启动即恢复持久化档位并写入根节点；后续变化同步到 DOM 与 localStorage。
// flush: 'sync' —— 档位切换即时生效，避免面板连续点按时出现一帧延迟。
watch(
  zoom,
  (value) => {
    applyZoom(value)
    try {
      window.localStorage.setItem(PAGE_ZOOM_STORAGE_KEY, String(value))
    } catch {
      // 写入失败（隐私模式）时不影响本次会话
    }
  },
  { immediate: true, flush: 'sync' },
)

export function usePageZoom() {
  const zoomIn = () => {
    zoom.value = nextLevel(zoom.value, 1)
  }
  const zoomOut = () => {
    zoom.value = nextLevel(zoom.value, -1)
  }
  const resetZoom = () => {
    zoom.value = 100
  }

  const canZoomIn = computed(() => zoom.value < ZOOM_MAX)
  const canZoomOut = computed(() => zoom.value > ZOOM_MIN)
  const isDefaultZoom = computed(() => zoom.value === 100)

  return { zoom, zoomIn, zoomOut, resetZoom, canZoomIn, canZoomOut, isDefaultZoom }
}
