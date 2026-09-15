import { describe, expect, it } from 'vitest'

import {
  clamp,
  hexToHsl,
  hexToRgb,
  hsbToHsl,
  hslToHex,
  hslToHsb,
  hslToRgb,
  rgbToHex,
  rgbToHsl,
} from '@/utils/color'

describe('clamp', () => {
  it('小于下限时取下限', () => {
    expect(clamp(-5, 0, 100)).toBe(0)
  })

  it('大于上限时取上限', () => {
    expect(clamp(120, 0, 100)).toBe(100)
  })

  it('在范围内时原样返回', () => {
    expect(clamp(50, 0, 100)).toBe(50)
  })
})

describe('hslToRgb', () => {
  it('纯红', () => {
    expect(hslToRgb(0, 100, 50)).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('纯绿', () => {
    expect(hslToRgb(120, 100, 50)).toEqual({ r: 0, g: 255, b: 0 })
  })

  it('纯蓝', () => {
    expect(hslToRgb(240, 100, 50)).toEqual({ r: 0, g: 0, b: 255 })
  })

  it('白色与黑色', () => {
    expect(hslToRgb(0, 0, 100)).toEqual({ r: 255, g: 255, b: 255 })
    expect(hslToRgb(0, 0, 0)).toEqual({ r: 0, g: 0, b: 0 })
  })

  it('默认主题色 hsl(203, 100%, 60%) 对应 #33b1ff', () => {
    expect(hslToRgb(203, 100, 60)).toEqual({ r: 51, g: 177, b: 255 })
  })
})

describe('rgbToHsl', () => {
  it('纯红', () => {
    expect(rgbToHsl(255, 0, 0)).toEqual({ h: 0, s: 100, l: 50 })
  })

  it('灰色饱和度为 0', () => {
    const { s } = rgbToHsl(128, 128, 128)
    expect(s).toBe(0)
  })

  it('与 hslToRgb 互逆（允许浮点误差）', () => {
    const { h, s, l } = rgbToHsl(51, 177, 255)
    expect(h).toBeCloseTo(203, 0)
    expect(s).toBeCloseTo(100, 0)
    expect(l).toBeCloseTo(60, 0)
  })
})

describe('rgbToHex / hexToRgb', () => {
  it('基础颜色', () => {
    expect(rgbToHex(255, 0, 0)).toBe('#ff0000')
    expect(rgbToHex(0, 0, 0)).toBe('#000000')
  })

  it('带 # 与不带 # 的 hex 均可解析', () => {
    expect(hexToRgb('#3bb1ff')).toEqual({ r: 59, g: 177, b: 255 })
    expect(hexToRgb('3bb1ff')).toEqual({ r: 59, g: 177, b: 255 })
  })

  it('非法输入返回 null', () => {
    expect(hexToRgb('#xyz')).toBeNull()
    expect(hexToRgb('#fff')).toBeNull()
    expect(hexToRgb('')).toBeNull()
  })

  it('越界分量被钳制到 0-255', () => {
    expect(rgbToHex(300, -5, 128)).toBe('#ff0080')
  })
})

describe('hslToHex / hexToHsl', () => {
  it('默认主题色换算为 #33b1ff', () => {
    expect(hslToHex(203, 100, 60)).toBe('#33b1ff')
  })

  it('hex 转 HSL 近似还原', () => {
    const hsl = hexToHsl('#33b1ff')
    expect(hsl).not.toBeNull()
    expect(hsl!.h).toBeCloseTo(203, 0)
    expect(hsl!.s).toBeCloseTo(100, 0)
    expect(hsl!.l).toBeCloseTo(60, 0)
  })

  it('非法 hex 返回 null', () => {
    expect(hexToHsl('not-a-color')).toBeNull()
  })
})

describe('hslToHsb / hsbToHsl', () => {
  it('默认主题色 hsl(203, 100%, 60%) 对应 hsb(203, 80%, 100%)', () => {
    expect(hslToHsb(203, 100, 60)).toEqual({ h: 203, s: 80, b: 100 })
  })

  it('hsbToHsl 还原默认主题色', () => {
    expect(hsbToHsl(203, 80, 100)).toEqual({ h: 203, s: 100, l: 60 })
  })

  it('黑白两色的亮度极端值不产出 NaN', () => {
    expect(hsbToHsl(0, 50, 0)).toEqual({ h: 0, s: 0, l: 0 })
    expect(hsbToHsl(0, 50, 100)).toEqual({ h: 0, s: 100, l: 75 })
  })

  it('hsl → hsb → hsl 往返一致', () => {
    const hsb = hslToHsb(150, 60, 40)
    const hsl = hsbToHsl(hsb.h, hsb.s, hsb.b)
    expect(hsl.h).toBeCloseTo(150, 5)
    expect(hsl.s).toBeCloseTo(60, 5)
    expect(hsl.l).toBeCloseTo(40, 5)
  })
})
