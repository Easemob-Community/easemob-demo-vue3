<script setup lang="ts">
/**
 * 特性开关 - 外观面板
 *
 * 按参考图片一比一布局，包含：
 * - 主题与颜色：主题模式、主题色取色器（2D 饱和度×亮度面板 + 色相条 + 明度条 + Hex/RGB/HSL/HSB 标签页）。
 * - 颜色微调：对方气泡、自己气泡、输入区背景、聊天背景。
 * - 组件风格：Hover 风格、气泡形状、容器间距、字号、密度、动画开关、动画强度、Input 组件风格。
 * - 一键重置。
 *
 * 接入 UIKit 2.6.0+ useTheme：
 * - primaryColorHsl 作为取色器唯一数据源。
 * - 通过 setPrimaryColor / setPrimaryColorSat / setPrimaryColorLum 写入。
 * - Hex/RGB/HSB 标签页通过颜色换算工具与 HSL 双向同步。
 */
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { EmInput, useLocale, useTheme as useUIKitTheme } from '@easemob/uikit-im'

import { useTheme as useAppTheme } from '@/composables/useTheme'

type ColorMode = 'hex' | 'rgb' | 'hsl' | 'hsb'
type InputVariant = 'default' | 'search' | 'filled' | 'ghost' | 'underline'
type ThemeMode = 'light' | 'dark' | 'auto'
type HoverStyle = 'default' | 'rounded'
type BubbleShape = 'ground' | 'square'
type FontSizePreset = 'normal' | 'large' | 'xlarge'
type Density = 'compact' | 'normal' | 'comfortable'
type AnimationLevel = 'subtle' | 'normal' | 'expressive'

interface HslColor {
  h: number
  s: number
  l: number
}

const { t } = useI18n()
const appTheme = useAppTheme()
const uikitTheme = useUIKitTheme()
const { locale, setLocale } = useLocale()

const {
  primaryColorHsl,
  bubbleBgOther,
  bubbleBgSelf,
  chatBg,
  inputBg,
  setPrimaryColor,
  setBubbleBg,
  setChatBg,
  setInputBg,
} = uikitTheme

/* ===== 取色器状态（HSL 为唯一数据源） ===== */
const colorMode = ref<ColorMode>('hsl')
const hsl = ref<HslColor>({ ...primaryColorHsl.value })

// 同步外部（如一键重置、其他面板）对主题色的修改
watch(
  primaryColorHsl,
  (value) => {
    hsl.value = { ...value }
  },
  { deep: true },
)

function applyHsl(value: HslColor) {
  hsl.value = value
  setPrimaryColor(value)
}

/* ===== 颜色换算工具 ===== */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
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
  }
  else if (h >= 60 && h < 120) {
    r = x
    g = c
    b = 0
  }
  else if (h >= 120 && h < 180) {
    r = 0
    g = c
    b = x
  }
  else if (h >= 180 && h < 240) {
    r = 0
    g = x
    b = c
  }
  else if (h >= 240 && h < 300) {
    r = x
    g = 0
    b = c
  }
  else if (h >= 300 && h <= 360) {
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

function rgbToHsl(r: number, g: number, b: number): HslColor {
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

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.trim()
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized)
  if (!result) return null
  return {
    r: Number.parseInt(result[1], 16),
    g: Number.parseInt(result[2], 16),
    b: Number.parseInt(result[3], 16),
  }
}

function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l)
  return rgbToHex(r, g, b)
}

function hexToHsl(hex: string): HslColor | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  return rgbToHsl(rgb.r, rgb.g, rgb.b)
}

function hslToHsb(h: number, s: number, l: number): { h: number; s: number; b: number } {
  const sat = s / 100
  const lum = l / 100
  const b = lum + sat * Math.min(lum, 1 - lum)
  const sb = b === 0 ? 0 : 2 * (1 - lum / b)
  return { h, s: sb * 100, b: b * 100 }
}

function hsbToHsl(h: number, s: number, b: number): HslColor {
  const sat = s / 100
  const bri = b / 100
  const l = bri * (1 - sat / 2)
  const sl = l === 0 || l === 1 ? 0 : (bri - l) / Math.min(l, 1 - l)
  return { h, s: sl * 100, l: l * 100 }
}

/* ===== 各颜色模式下的显示值 ===== */
const hexValue = computed({
  get: () => hslToHex(hsl.value.h, hsl.value.s, hsl.value.l),
  set: (value) => {
    const parsed = hexToHsl(value)
    if (parsed) applyHsl(parsed)
  },
})

const rgbValue = computed({
  get: () => hslToRgb(hsl.value.h, hsl.value.s, hsl.value.l),
  set: (value) => {
    applyHsl(rgbToHsl(value.r, value.g, value.b))
  },
})

const hsbValue = computed({
  get: () => hslToHsb(hsl.value.h, hsl.value.s, hsl.value.l),
  set: (value) => {
    applyHsl(hsbToHsl(value.h, value.s, value.b))
  },
})

/* ===== 主题色 2D 面板（饱和度×亮度，hue 由色相条控制） ===== */
const colorPanelRef = ref<HTMLElement>()
const isDraggingPanel = ref(false)

function panelColorFromEvent(e: MouseEvent | TouchEvent): { s: number; l: number } {
  const panel = colorPanelRef.value
  if (!panel) return { s: hsl.value.s, l: hsl.value.l }
  const rect = panel.getBoundingClientRect()
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
  const x = clamp(clientX - rect.left, 0, rect.width)
  const y = clamp(clientY - rect.top, 0, rect.height)
  return {
    s: Math.round((x / rect.width) * 100),
    l: Math.round((1 - y / rect.height) * 100),
  }
}

function applyPanelColor(e: MouseEvent | TouchEvent) {
  const { s, l } = panelColorFromEvent(e)
  applyHsl({ h: hsl.value.h, s, l })
}

function onPanelMouseDown(e: MouseEvent) {
  isDraggingPanel.value = true
  applyPanelColor(e)
}
function onPanelTouchStart(e: TouchEvent) {
  isDraggingPanel.value = true
  applyPanelColor(e)
}
function onPanelMouseMove(e: MouseEvent) {
  if (!isDraggingPanel.value) return
  applyPanelColor(e)
}
function onPanelTouchMove(e: TouchEvent) {
  if (!isDraggingPanel.value) return
  applyPanelColor(e)
}
function stopDraggingPanel() {
  isDraggingPanel.value = false
}

/* ===== 色相条 ===== */
const hueSliderRef = ref<HTMLElement>()
const isDraggingHue = ref(false)

function hueFromEvent(e: MouseEvent | TouchEvent): number {
  const bar = hueSliderRef.value
  if (!bar) return hsl.value.h
  const rect = bar.getBoundingClientRect()
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const x = clamp(clientX - rect.left, 0, rect.width)
  return Math.round((x / rect.width) * 360)
}

function onHueMouseDown(e: MouseEvent) {
  isDraggingHue.value = true
  applyHsl({ ...hsl.value, h: hueFromEvent(e) })
}
function onHueTouchStart(e: TouchEvent) {
  isDraggingHue.value = true
  applyHsl({ ...hsl.value, h: hueFromEvent(e) })
}
function onHueMouseMove(e: MouseEvent) {
  if (!isDraggingHue.value) return
  applyHsl({ ...hsl.value, h: hueFromEvent(e) })
}
function onHueTouchMove(e: TouchEvent) {
  if (!isDraggingHue.value) return
  applyHsl({ ...hsl.value, h: hueFromEvent(e) })
}
function stopDraggingHue() {
  isDraggingHue.value = false
}

/* ===== 明度条（控制 L） ===== */
const lightnessSliderRef = ref<HTMLElement>()
const isDraggingLightness = ref(false)

function lightnessFromEvent(e: MouseEvent | TouchEvent): number {
  const bar = lightnessSliderRef.value
  if (!bar) return hsl.value.l
  const rect = bar.getBoundingClientRect()
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const x = clamp(clientX - rect.left, 0, rect.width)
  return Math.round((x / rect.width) * 100)
}
function onLightnessMouseDown(e: MouseEvent) {
  isDraggingLightness.value = true
  applyHsl({ ...hsl.value, l: lightnessFromEvent(e) })
}
function onLightnessTouchStart(e: TouchEvent) {
  isDraggingLightness.value = true
  applyHsl({ ...hsl.value, l: lightnessFromEvent(e) })
}
function onLightnessMouseMove(e: MouseEvent) {
  if (!isDraggingLightness.value) return
  applyHsl({ ...hsl.value, l: lightnessFromEvent(e) })
}
function onLightnessTouchMove(e: TouchEvent) {
  if (!isDraggingLightness.value) return
  applyHsl({ ...hsl.value, l: lightnessFromEvent(e) })
}
function stopDraggingLightness() {
  isDraggingLightness.value = false
}

/* ===== 颜色模式标签页 ===== */
const colorModes: { key: ColorMode; label: string }[] = [
  { key: 'hex', label: 'Hex' },
  { key: 'rgb', label: 'RGB' },
  { key: 'hsl', label: 'HSL' },
  { key: 'hsb', label: 'HSB' },
]

/* ===== 主题模式 ===== */
function setThemeMode(mode: ThemeMode) {
  appTheme.setMode(mode)
  uikitTheme.setMode(mode)
}

/* ===== 组件风格 ===== */
function setHoverStyle(style: HoverStyle) {
  uikitTheme.setHoverStyle(style)
}

function setBubbleShape(shape: BubbleShape) {
  uikitTheme.setBubbleShape(shape)
}

function setContainerGap(gap: number) {
  uikitTheme.setContainerGap(gap)
}

function setFontSize(preset: FontSizePreset) {
  uikitTheme.setFontSize(preset)
}

function setDensity(value: Density) {
  uikitTheme.setDensity(value)
}

function setAnimationEnabled(value: boolean) {
  uikitTheme.setAnimationEnabled(value)
}

function setAnimationLevel(level: AnimationLevel) {
  uikitTheme.setAnimationLevel(level)
}

/* ===== Input 组件风格演示 ===== */
const inputVariant = ref<InputVariant>('default')
const inputDemoValue = ref('')

/* ===== 一键重置 ===== */
function resetAll() {
  setThemeMode('auto')
  applyHsl({ h: 203, s: 100, l: 50 })
  setHoverStyle('default')
  setBubbleShape('ground')
  setContainerGap(8)
  setFontSize('normal')
  setDensity('normal')
  setAnimationEnabled(true)
  setAnimationLevel('normal')
  setBubbleBg(null, null)
  setChatBg(undefined)
  setInputBg(undefined)
  inputVariant.value = 'default'
  setLocale('zh-CN')
}

/* ===== 辅助：当前主题色预览 ===== */
const currentColorStyle = computed(() => ({
  backgroundColor: `hsl(${hsl.value.h}, ${hsl.value.s}%, ${hsl.value.l}%)`,
}))
</script>

<template>
  <div class="settings-appearance-panel">
    <!-- ===== 主题与颜色 ===== -->
    <section class="settings-appearance-panel__section">
      <h3 class="settings-appearance-panel__section-title">
        {{ t('features.appearance.themeAndColor') }}
      </h3>

      <div class="settings-appearance-panel__row">
        <span class="settings-appearance-panel__label">
          {{ t('features.appearance.switchTheme') }}
        </span>
        <div class="settings-appearance-panel__segmented">
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{ 'settings-appearance-panel__segmented-item--active': appTheme.mode.value === 'light' }"
            @click="setThemeMode('light')"
          >
            {{ t('features.appearance.themeLight') }}
          </button>
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{ 'settings-appearance-panel__segmented-item--active': appTheme.mode.value === 'dark' }"
            @click="setThemeMode('dark')"
          >
            {{ t('features.appearance.themeDark') }}
          </button>
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{ 'settings-appearance-panel__segmented-item--active': appTheme.mode.value === 'auto' }"
            @click="setThemeMode('auto')"
          >
            {{ t('features.appearance.themeAuto') }}
          </button>
        </div>
      </div>
      <p class="settings-appearance-panel__desc">{{ t('features.appearance.themeDesc') }}</p>

      <div class="settings-appearance-panel__column">
        <span class="settings-appearance-panel__label">
          {{ t('features.appearance.themeColorHue') }}
        </span>
        <p class="settings-appearance-panel__desc">
          {{ t('features.appearance.themeColorDesc') }}
        </p>

        <!-- 2D 色板（饱和度×亮度） -->
        <div
          ref="colorPanelRef"
          class="settings-appearance-panel__color-panel"
          :style="{ '--panel-hue': hsl.h }"
          @mousedown="onPanelMouseDown"
          @mousemove="onPanelMouseMove"
          @mouseup="stopDraggingPanel"
          @mouseleave="stopDraggingPanel"
          @touchstart.prevent="onPanelTouchStart"
          @touchmove.prevent="onPanelTouchMove"
          @touchend="stopDraggingPanel"
        >
          <div
            class="settings-appearance-panel__color-panel-cursor"
            :style="{ left: `${hsl.s}%`, top: `${100 - hsl.l}%` }"
          />
        </div>

        <!-- 色相条 + 预览 -->
        <div class="settings-appearance-panel__slider-row">
          <div class="settings-appearance-panel__color-dot" :style="currentColorStyle" />
          <div
            ref="hueSliderRef"
            class="settings-appearance-panel__hue-slider"
            @mousedown="onHueMouseDown"
            @mousemove="onHueMouseMove"
            @mouseup="stopDraggingHue"
            @mouseleave="stopDraggingHue"
            @touchstart.prevent="onHueTouchStart"
            @touchmove.prevent="onHueTouchMove"
            @touchend="stopDraggingHue"
          >
            <div
              class="settings-appearance-panel__slider-thumb"
              :style="{ left: `${(hsl.h / 360) * 100}%` }"
            />
          </div>
        </div>

        <!-- 明度条 -->
        <div class="settings-appearance-panel__slider-row">
          <div class="settings-appearance-panel__color-dot" :style="currentColorStyle" />
          <div
            ref="lightnessSliderRef"
            class="settings-appearance-panel__lightness-slider"
            :style="{ '--panel-hue': hsl.h }"
            @mousedown="onLightnessMouseDown"
            @mousemove="onLightnessMouseMove"
            @mouseup="stopDraggingLightness"
            @mouseleave="stopDraggingLightness"
            @touchstart.prevent="onLightnessTouchStart"
            @touchmove.prevent="onLightnessTouchMove"
            @touchend="stopDraggingLightness"
          >
            <div
              class="settings-appearance-panel__slider-thumb"
              :style="{ left: `${hsl.l}%` }"
            />
          </div>
        </div>

        <!-- 颜色模式标签页 -->
        <div class="settings-appearance-panel__color-modes">
          <button
            v-for="m in colorModes"
            :key="m.key"
            class="settings-appearance-panel__color-modes-item"
            :class="{ 'settings-appearance-panel__color-modes-item--active': colorMode === m.key }"
            @click="colorMode = m.key"
          >
            {{ m.label }}
          </button>
        </div>

        <!-- HSL 数值 -->
        <div v-if="colorMode === 'hsl'" class="settings-appearance-panel__color-values">
          <div class="settings-appearance-panel__color-value">
            <span class="settings-appearance-panel__color-value-prefix">H</span>
            <input
              type="number"
              min="0"
              max="360"
              :value="Math.round(hsl.h)"
              class="settings-appearance-panel__color-value-input"
              @input="(e: Event) => applyHsl({ ...hsl, h: Number((e.target as HTMLInputElement).value) })"
            />
          </div>
          <div class="settings-appearance-panel__color-value">
            <span class="settings-appearance-panel__color-value-prefix">S</span>
            <input
              type="number"
              min="0"
              max="100"
              :value="Math.round(hsl.s)"
              class="settings-appearance-panel__color-value-input"
              @input="(e: Event) => applyHsl({ ...hsl, s: Number((e.target as HTMLInputElement).value) })"
            />
          </div>
          <div class="settings-appearance-panel__color-value">
            <span class="settings-appearance-panel__color-value-prefix">L</span>
            <input
              type="number"
              min="0"
              max="100"
              :value="Math.round(hsl.l)"
              class="settings-appearance-panel__color-value-input"
              @input="(e: Event) => applyHsl({ ...hsl, l: Number((e.target as HTMLInputElement).value) })"
            />
          </div>
          <div class="settings-appearance-panel__color-value settings-appearance-panel__color-value--percent settings-appearance-panel__color-value--disabled">
            <span class="settings-appearance-panel__color-value-static">{{ Math.round(hsl.l) }}</span>
            <span class="settings-appearance-panel__color-value-unit">%</span>
          </div>
        </div>

        <!-- Hex 数值 -->
        <div v-else-if="colorMode === 'hex'" class="settings-appearance-panel__color-values">
          <input
            type="text"
            :value="hexValue"
            class="settings-appearance-panel__text-input settings-appearance-panel__text-input--full"
            @input="(e: Event) => (hexValue = (e.target as HTMLInputElement).value)"
          />
        </div>

        <!-- RGB 数值 -->
        <div v-else-if="colorMode === 'rgb'" class="settings-appearance-panel__color-values">
          <div class="settings-appearance-panel__color-value">
            <span class="settings-appearance-panel__color-value-prefix">R</span>
            <input
              type="number"
              min="0"
              max="255"
              :value="rgbValue.r"
              class="settings-appearance-panel__color-value-input"
              @input="(e: Event) => (rgbValue = { ...rgbValue, r: Number((e.target as HTMLInputElement).value) })"
            />
          </div>
          <div class="settings-appearance-panel__color-value">
            <span class="settings-appearance-panel__color-value-prefix">G</span>
            <input
              type="number"
              min="0"
              max="255"
              :value="rgbValue.g"
              class="settings-appearance-panel__color-value-input"
              @input="(e: Event) => (rgbValue = { ...rgbValue, g: Number((e.target as HTMLInputElement).value) })"
            />
          </div>
          <div class="settings-appearance-panel__color-value">
            <span class="settings-appearance-panel__color-value-prefix">B</span>
            <input
              type="number"
              min="0"
              max="255"
              :value="rgbValue.b"
              class="settings-appearance-panel__color-value-input"
              @input="(e: Event) => (rgbValue = { ...rgbValue, b: Number((e.target as HTMLInputElement).value) })"
            />
          </div>
        </div>

        <!-- HSB 数值 -->
        <div v-else-if="colorMode === 'hsb'" class="settings-appearance-panel__color-values">
          <div class="settings-appearance-panel__color-value">
            <span class="settings-appearance-panel__color-value-prefix">H</span>
            <input
              type="number"
              min="0"
              max="360"
              :value="Math.round(hsbValue.h)"
              class="settings-appearance-panel__color-value-input"
              @input="(e: Event) => (hsbValue = { ...hsbValue, h: Number((e.target as HTMLInputElement).value) })"
            />
          </div>
          <div class="settings-appearance-panel__color-value">
            <span class="settings-appearance-panel__color-value-prefix">S</span>
            <input
              type="number"
              min="0"
              max="100"
              :value="Math.round(hsbValue.s)"
              class="settings-appearance-panel__color-value-input"
              @input="(e: Event) => (hsbValue = { ...hsbValue, s: Number((e.target as HTMLInputElement).value) })"
            />
          </div>
          <div class="settings-appearance-panel__color-value">
            <span class="settings-appearance-panel__color-value-prefix">B</span>
            <input
              type="number"
              min="0"
              max="100"
              :value="Math.round(hsbValue.b)"
              class="settings-appearance-panel__color-value-input"
              @input="(e: Event) => (hsbValue = { ...hsbValue, b: Number((e.target as HTMLInputElement).value) })"
            />
          </div>
          <div class="settings-appearance-panel__color-value settings-appearance-panel__color-value--percent settings-appearance-panel__color-value--disabled">
            <span class="settings-appearance-panel__color-value-static">{{ Math.round(hsbValue.b) }}</span>
            <span class="settings-appearance-panel__color-value-unit">%</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== 颜色微调 ===== -->
    <section class="settings-appearance-panel__section">
      <h3 class="settings-appearance-panel__section-title">
        {{ t('features.appearance.colorFineTune') }}
      </h3>

      <div class="settings-appearance-panel__row settings-appearance-panel__row--bordered">
        <span class="settings-appearance-panel__label">
          {{ t('features.appearance.bubbleOther') }}
        </span>
        <div class="settings-appearance-panel__right">
          <input
            type="color"
            :value="bubbleBgOther || '#f3f4f6'"
            class="settings-appearance-panel__color-input"
            @input="(e: Event) => setBubbleBg((e.target as HTMLInputElement).value, undefined)"
          />
          <button class="settings-appearance-panel__text-btn" @click="setBubbleBg(null, undefined)">
            {{ t('features.appearance.restore') }}
          </button>
        </div>
      </div>

      <div class="settings-appearance-panel__row settings-appearance-panel__row--bordered">
        <span class="settings-appearance-panel__label">
          {{ t('features.appearance.bubbleSelf') }}
        </span>
        <div class="settings-appearance-panel__right">
          <input
            type="color"
            :value="bubbleBgSelf || '#3bb1ff'"
            class="settings-appearance-panel__color-input"
            @input="(e: Event) => setBubbleBg(undefined, (e.target as HTMLInputElement).value)"
          />
          <button class="settings-appearance-panel__text-btn" @click="setBubbleBg(undefined, null)">
            {{ t('features.appearance.restore') }}
          </button>
        </div>
      </div>

      <div class="settings-appearance-panel__row settings-appearance-panel__row--bordered">
        <span class="settings-appearance-panel__label">
          {{ t('features.appearance.inputBg') }}
        </span>
        <div class="settings-appearance-panel__right">
          <input
            type="color"
            :value="inputBg || '#ffffff'"
            class="settings-appearance-panel__color-input"
            @input="(e: Event) => setInputBg((e.target as HTMLInputElement).value)"
          />
          <button class="settings-appearance-panel__text-btn" @click="setInputBg(undefined)">
            {{ t('features.appearance.restore') }}
          </button>
        </div>
      </div>

      <div class="settings-appearance-panel__column settings-appearance-panel__row--bordered">
        <div class="settings-appearance-panel__spread">
          <span class="settings-appearance-panel__label">
            {{ t('features.appearance.chatBg') }}
          </span>
          <button class="settings-appearance-panel__text-btn" @click="setChatBg(undefined)">
            {{ t('features.appearance.restore') }}
          </button>
        </div>
        <input
          :value="chatBg || ''"
          type="text"
          :placeholder="t('features.appearance.chatBgPlaceholder')"
          class="settings-appearance-panel__text-input"
          @input="(e: Event) => setChatBg((e.target as HTMLInputElement).value || undefined)"
        />
      </div>
    </section>

    <!-- ===== 组件风格 ===== -->
    <section class="settings-appearance-panel__section">
      <h3 class="settings-appearance-panel__section-title">
        {{ t('features.appearance.componentStyle') }}
      </h3>

      <div class="settings-appearance-panel__row settings-appearance-panel__row--bordered">
        <span class="settings-appearance-panel__label">
          {{ t('features.appearance.hoverStyle') }}
        </span>
        <div class="settings-appearance-panel__segmented">
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{ 'settings-appearance-panel__segmented-item--active': uikitTheme.hoverStyle.value === 'default' }"
            @click="setHoverStyle('default')"
          >
            {{ t('features.appearance.hoverDefault') }}
          </button>
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{ 'settings-appearance-panel__segmented-item--active': uikitTheme.hoverStyle.value === 'rounded' }"
            @click="setHoverStyle('rounded')"
          >
            {{ t('features.appearance.hoverRounded') }}
          </button>
        </div>
      </div>
      <p class="settings-appearance-panel__desc">{{ t('features.appearance.hoverDesc') }}</p>

      <div class="settings-appearance-panel__row settings-appearance-panel__row--bordered">
        <span class="settings-appearance-panel__label">
          {{ t('features.appearance.bubbleShape') }}
        </span>
        <div class="settings-appearance-panel__segmented">
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{ 'settings-appearance-panel__segmented-item--active': uikitTheme.bubbleShape.value === 'ground' }"
            @click="setBubbleShape('ground')"
          >
            {{ t('features.appearance.bubbleGround') }}
          </button>
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{ 'settings-appearance-panel__segmented-item--active': uikitTheme.bubbleShape.value === 'square' }"
            @click="setBubbleShape('square')"
          >
            {{ t('features.appearance.bubbleSquare') }}
          </button>
        </div>
      </div>
      <p class="settings-appearance-panel__desc">{{ t('features.appearance.bubbleDesc') }}</p>

      <div class="settings-appearance-panel__row settings-appearance-panel__row--bordered">
        <span class="settings-appearance-panel__label">
          {{ t('features.appearance.containerGap') }}
        </span>
        <div class="settings-appearance-panel__right">
          <input
            type="range"
            min="0"
            max="24"
            :value="uikitTheme.containerGap.value"
            class="settings-appearance-panel__range-input"
            @input="(e: Event) => setContainerGap(Number((e.target as HTMLInputElement).value))"
          />
          <span class="settings-appearance-panel__range-value">{{ uikitTheme.containerGap.value }}</span>
        </div>
      </div>
      <p class="settings-appearance-panel__desc">{{ t('features.appearance.containerGapDesc') }}</p>

      <div class="settings-appearance-panel__row settings-appearance-panel__row--bordered">
        <span class="settings-appearance-panel__label">
          {{ t('features.appearance.fontSize') }}
        </span>
        <div class="settings-appearance-panel__segmented">
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{ 'settings-appearance-panel__segmented-item--active': uikitTheme.fontSizeScale.value === 1 }"
            @click="setFontSize('normal')"
          >
            {{ t('features.appearance.fontSizeNormal') }}
          </button>
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{ 'settings-appearance-panel__segmented-item--active': uikitTheme.fontSizeScale.value === 1.125 }"
            @click="setFontSize('large')"
          >
            {{ t('features.appearance.fontSizeLarge') }}
          </button>
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{ 'settings-appearance-panel__segmented-item--active': uikitTheme.fontSizeScale.value === 1.25 }"
            @click="setFontSize('xlarge')"
          >
            {{ t('features.appearance.fontSizeXlarge') }}
          </button>
        </div>
      </div>
      <p class="settings-appearance-panel__desc">{{ t('features.appearance.fontSizeDesc') }}</p>

      <div class="settings-appearance-panel__row settings-appearance-panel__row--bordered">
        <span class="settings-appearance-panel__label">
          {{ t('features.appearance.density') }}
        </span>
        <div class="settings-appearance-panel__segmented">
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{ 'settings-appearance-panel__segmented-item--active': uikitTheme.density.value === 'compact' }"
            @click="setDensity('compact')"
          >
            {{ t('features.appearance.densityCompact') }}
          </button>
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{ 'settings-appearance-panel__segmented-item--active': uikitTheme.density.value === 'normal' }"
            @click="setDensity('normal')"
          >
            {{ t('features.appearance.densityNormal') }}
          </button>
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{ 'settings-appearance-panel__segmented-item--active': uikitTheme.density.value === 'comfortable' }"
            @click="setDensity('comfortable')"
          >
            {{ t('features.appearance.densityComfortable') }}
          </button>
        </div>
      </div>
      <p class="settings-appearance-panel__desc">{{ t('features.appearance.densityDesc') }}</p>

      <div class="settings-appearance-panel__row settings-appearance-panel__row--bordered">
        <span class="settings-appearance-panel__label">
          {{ t('features.appearance.animationEnabled') }}
        </span>
        <button
          class="settings-appearance-panel__switch"
          :class="{ 'settings-appearance-panel__switch--active': uikitTheme.animationEnabled.value }"
          @click="setAnimationEnabled(!uikitTheme.animationEnabled.value)"
        >
          <span class="settings-appearance-panel__switch-thumb" />
        </button>
      </div>
      <p class="settings-appearance-panel__desc">{{ t('features.appearance.animationEnabledDesc') }}</p>

      <div class="settings-appearance-panel__row settings-appearance-panel__row--bordered">
        <span class="settings-appearance-panel__label">
          {{ t('features.appearance.animationLevel') }}
        </span>
        <div class="settings-appearance-panel__segmented">
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{ 'settings-appearance-panel__segmented-item--active': uikitTheme.animationLevel.value === 'subtle' }"
            @click="setAnimationLevel('subtle')"
          >
            {{ t('features.appearance.animationLevelSubtle') }}
          </button>
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{ 'settings-appearance-panel__segmented-item--active': uikitTheme.animationLevel.value === 'normal' }"
            @click="setAnimationLevel('normal')"
          >
            {{ t('features.appearance.animationLevelNormal') }}
          </button>
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{ 'settings-appearance-panel__segmented-item--active': uikitTheme.animationLevel.value === 'expressive' }"
            @click="setAnimationLevel('expressive')"
          >
            {{ t('features.appearance.animationLevelExpressive') }}
          </button>
        </div>
      </div>

      <div class="settings-appearance-panel__row settings-appearance-panel__row--bordered">
        <span class="settings-appearance-panel__label">
          {{ t('features.appearance.inputVariant') }}
        </span>
        <select v-model="inputVariant" class="settings-appearance-panel__select">
          <option value="default">default</option>
          <option value="search">search</option>
          <option value="filled">filled</option>
          <option value="ghost">ghost</option>
          <option value="underline">underline</option>
        </select>
      </div>
      <p class="settings-appearance-panel__desc">{{ t('features.appearance.inputVariantDesc') }}</p>
      <div class="settings-appearance-panel__input-preview">
        <EmInput v-model="inputDemoValue" :variant="inputVariant" :placeholder="t('features.appearance.inputPlaceholder')" />
      </div>

      <div class="settings-appearance-panel__row settings-appearance-panel__row--bordered">
        <span class="settings-appearance-panel__label">
          {{ t('features.appearance.language') }}
        </span>
        <div class="settings-appearance-panel__segmented">
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{ 'settings-appearance-panel__segmented-item--active': locale === 'zh-CN' }"
            @click="setLocale('zh-CN')"
          >
            {{ t('features.appearance.langZh') }}
          </button>
          <button
            class="settings-appearance-panel__segmented-item"
            :class="{ 'settings-appearance-panel__segmented-item--active': locale === 'en' }"
            @click="setLocale('en')"
          >
            {{ t('features.appearance.langEn') }}
          </button>
        </div>
      </div>
    </section>

    <!-- ===== 一键重置 ===== -->
    <button class="settings-appearance-panel__reset-all" @click="resetAll">
      {{ t('features.appearance.resetAll') }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.settings-appearance-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;

  &__section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__section-title {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-secondary);
  }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    min-height: 44px;

    &--bordered {
      padding-bottom: 12px;
      border-bottom: 1px solid var(--color-border);
    }
  }

  &__column {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  &__spread {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__label {
    font-size: 15px;
    font-weight: 500;
    color: var(--color-text);
  }

  &__desc {
    margin: -6px 0 0;
    font-size: 12px;
    color: var(--color-text-secondary);
    line-height: 1.5;
  }

  /* 分段按钮 */
  &__segmented {
    display: inline-flex;
    padding: 3px;
    border-radius: 8px;
    background-color: var(--color-bg-secondary);
  }

  &__segmented-item {
    height: 30px;
    padding: 0 14px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--color-text);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;

    &--active {
      background-color: var(--uikit-primary-color, var(--color-primary));
      color: #ffffff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
  }

  /* 2D 色板 */
  &__color-panel {
    position: relative;
    width: 100%;
    height: 180px;
    border-radius: 12px;
    background:
      linear-gradient(to bottom, transparent, #000),
      linear-gradient(to right, #fff, hsl(var(--panel-hue, 203), 100%, 50%));
    cursor: crosshair;
    overflow: hidden;
    touch-action: none;
  }

  &__color-panel-cursor {
    position: absolute;
    width: 18px;
    height: 18px;
    border: 2px solid #ffffff;
    border-radius: 50%;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  /* 滑块行 */
  &__slider-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__color-dot {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: 1px solid var(--color-border);
    flex-shrink: 0;
  }

  &__hue-slider,
  &__lightness-slider {
    position: relative;
    flex: 1;
    height: 18px;
    border-radius: 9px;
    cursor: pointer;
    touch-action: none;
  }

  &__hue-slider {
    background: linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00);
  }

  &__lightness-slider {
    background: linear-gradient(to right, #fff, hsl(var(--panel-hue, 203), 100%, 50%));
  }

  &__slider-thumb {
    position: absolute;
    top: 50%;
    width: 14px;
    height: 28px;
    border: 2px solid #ffffff;
    border-radius: 7px;
    background-color: transparent;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  /* 颜色模式标签页 */
  &__color-modes {
    display: flex;
    padding: 3px;
    border-radius: 8px;
    background-color: var(--color-bg-secondary);
  }

  &__color-modes-item {
    flex: 1;
    height: 30px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--color-text-secondary);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;

    &--active {
      background-color: var(--color-bg);
      color: var(--color-text);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }
  }

  /* 颜色数值 */
  &__color-values {
    display: flex;
    gap: 8px;
  }

  &__color-value {
    display: flex;
    align-items: center;
    gap: 4px;
    flex: 1;
    height: 36px;
    padding: 0 10px;
    border-radius: 8px;
    background-color: var(--color-bg-secondary);

    &--disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &--percent {
      flex: 0.6;
    }
  }

  &__color-value-prefix,
  &__color-value-unit,
  &__color-value-static {
    font-size: 13px;
    color: var(--color-text);
  }

  &__color-value-prefix {
    color: var(--color-text-secondary);
  }

  &__color-value-input {
    flex: 1;
    width: 0;
    min-width: 0;
    border: none;
    background: transparent;
    font-size: 13px;
    color: var(--color-text);
    outline: none;
  }

  /* 行内颜色选择 */
  &__color-input {
    width: 28px;
    height: 28px;
    padding: 0;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    background: none;
    cursor: pointer;

    &::-webkit-color-swatch-wrapper {
      padding: 0;
    }

    &::-webkit-color-swatch {
      border: none;
      border-radius: 5px;
    }
  }

  &__text-btn {
    padding: 0;
    border: none;
    background: transparent;
    color: var(--color-text-secondary);
    font-size: 13px;
    cursor: pointer;
    transition: color 0.15s;

    &:hover {
      color: var(--uikit-primary-color, var(--color-primary));
    }
  }

  /* 文本输入 */
  &__text-input {
    width: 100%;
    height: 36px;
    padding: 0 12px;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    background-color: var(--color-bg);
    color: var(--color-text);
    font-size: 14px;
    outline: none;
    box-sizing: border-box;

    &:focus {
      border-color: var(--uikit-primary-color, var(--color-primary));
    }

    &--full {
      flex: 1;
    }
  }

  /* 滑块 */
  &__range-input {
    flex: 1;
    width: 120px;
    height: 6px;
    -webkit-appearance: none;
    appearance: none;
    border-radius: 3px;
    background: linear-gradient(to right, var(--color-border), var(--uikit-primary-color, var(--color-primary)));
    outline: none;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #ffffff;
      border: 2px solid var(--uikit-primary-color, var(--color-primary));
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    }
  }

  &__range-value {
    min-width: 24px;
    text-align: right;
    font-size: 14px;
    color: var(--color-text-secondary);
  }

  /* Toggle switch */
  &__switch {
    position: relative;
    width: 44px;
    height: 24px;
    padding: 0;
    border: none;
    border-radius: 12px;
    background-color: var(--color-bg-secondary);
    cursor: pointer;
    transition: background-color 0.2s;

    &--active {
      background-color: var(--uikit-primary-color, var(--color-primary));
    }
  }

  &__switch-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    transition: transform 0.2s;
  }

  &__switch--active &__switch-thumb {
    transform: translateX(20px);
  }

  /* 下拉选择 */
  &__select {
    height: 32px;
    padding: 0 28px 0 12px;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    background-color: var(--color-bg);
    color: var(--color-text);
    font-size: 14px;
    cursor: pointer;
    outline: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    background-size: 14px;

    &:focus {
      border-color: var(--uikit-primary-color, var(--color-primary));
    }
  }

  /* Input 预览 */
  &__input-preview {
    margin-top: 4px;
  }

  /* 一键重置 */
  &__reset-all {
    width: 100%;
    height: 40px;
    margin-top: 8px;
    border: none;
    border-radius: 8px;
    background-color: var(--color-bg-secondary);
    color: var(--color-text);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--color-border);
    }
  }
}
</style>
