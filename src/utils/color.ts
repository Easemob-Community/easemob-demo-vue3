/**
 * 颜色换算纯函数工具（无 Vue 依赖）
 *
 * 支持 HSL / RGB / Hex / HSB 之间的互转，供外观设置面板的主题色取色器使用。
 * HSL 为取色器的唯一数据源，其余格式均通过与 HSL 双向换算实现同步。
 */

export interface HslColor {
  h: number
  s: number
  l: number
}

export interface RgbColor {
  r: number
  g: number
  b: number
}

export interface HsbColor {
  h: number
  s: number
  b: number
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function hslToRgb(h: number, s: number, l: number): RgbColor {
  const sat = s / 100
  const lum = l / 100
  const c = (1 - Math.abs(2 * lum - 1)) * sat
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = lum - c / 2
  let r = 0
  let g = 0
  let b = 0

  if (h >= 0 && h < 60) {
    r = c
    g = x
    b = 0
  } else if (h >= 60 && h < 120) {
    r = x
    g = c
    b = 0
  } else if (h >= 120 && h < 180) {
    r = 0
    g = c
    b = x
  } else if (h >= 180 && h < 240) {
    r = 0
    g = x
    b = c
  } else if (h >= 240 && h < 300) {
    r = x
    g = 0
    b = c
  } else if (h >= 300 && h <= 360) {
    r = c
    g = 0
    b = x
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  }
}

export function rgbToHsl(r: number, g: number, b: number): HslColor {
  const red = r / 255
  const green = g / 255
  const blue = b / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const d = max - min
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case red:
        h = (green - blue) / d + (green < blue ? 6 : 0)
        break
      case green:
        h = (blue - red) / d + 2
        break
      case blue:
        h = (red - green) / d + 4
        break
    }
    h /= 6
  }

  return { h: h * 360, s: s * 100, l: l * 100 }
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function hexToRgb(hex: string): RgbColor | null {
  const normalized = hex.trim()
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized)
  if (!result) return null
  return {
    r: Number.parseInt(result[1], 16),
    g: Number.parseInt(result[2], 16),
    b: Number.parseInt(result[3], 16),
  }
}

export function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l)
  return rgbToHex(r, g, b)
}

export function hexToHsl(hex: string): HslColor | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  return rgbToHsl(rgb.r, rgb.g, rgb.b)
}

export function hslToHsb(h: number, s: number, l: number): HsbColor {
  const sat = s / 100
  const lum = l / 100
  const b = lum + sat * Math.min(lum, 1 - lum)
  const sb = b === 0 ? 0 : 2 * (1 - lum / b)
  return { h, s: sb * 100, b: b * 100 }
}

export function hsbToHsl(h: number, s: number, b: number): HslColor {
  const sat = s / 100
  const bri = b / 100
  const l = bri * (1 - sat / 2)
  const sl = l === 0 || l === 1 ? 0 : (bri - l) / Math.min(l, 1 - l)
  return { h, s: sl * 100, l: l * 100 }
}
