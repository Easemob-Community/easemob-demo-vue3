<script setup lang="ts">
/**
 * 主题色取色器面板
 *
 * 组合 2D 饱和度×亮度面板（ColorSaturationPanel）、色相条（ColorHueSlider）、
 * 明度条（ColorLightnessSlider）与 Hex/RGB/HSL/HSB 数值标签页。
 *
 * HSL 为唯一数据源：color 属性作为输入，change 事件向上提交新颜色（由父级写入主题）；
 * 外部（如一键重置、其他面板）修改主题色时通过 watch 同步回本地。
 */
import { computed, ref, watch } from 'vue'

import type { HslColor } from '@/utils/color'
import { hexToHsl, hslToHex, hslToHsb, hslToRgb, hsbToHsl, rgbToHsl } from '@/utils/color'

import ColorHueSlider from './ColorHueSlider.vue'
import ColorLightnessSlider from './ColorLightnessSlider.vue'
import ColorSaturationPanel from './ColorSaturationPanel.vue'

defineOptions({ name: 'ColorPickerPanel' })

type ColorMode = 'hex' | 'rgb' | 'hsl' | 'hsb'

const props = defineProps<{ color: HslColor }>()
const emit = defineEmits<{ (e: 'change', value: HslColor): void }>()

/* ===== 取色器状态（HSL 为唯一数据源） ===== */
const hsl = ref<HslColor>({ ...props.color })

// 同步外部（如一键重置、其他面板）对主题色的修改
watch(
  () => props.color,
  (value) => {
    hsl.value = { ...value }
  },
  { deep: true },
)

function applyHsl(value: HslColor) {
  hsl.value = value
  emit('change', value)
}

function onPanelChange({ s, l }: { s: number; l: number }) {
  applyHsl({ h: hsl.value.h, s, l })
}

function onHueChange(h: number) {
  applyHsl({ ...hsl.value, h })
}

function onLightnessChange(l: number) {
  applyHsl({ ...hsl.value, l })
}

/* ===== 当前颜色预览（色点） ===== */
const previewColor = computed(() => `hsl(${hsl.value.h}, ${hsl.value.s}%, ${hsl.value.l}%)`)

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

/* ===== 颜色模式标签页 ===== */
const colorMode = ref<ColorMode>('hsl')

const colorModes: { key: ColorMode; label: string }[] = [
  { key: 'hex', label: 'Hex' },
  { key: 'rgb', label: 'RGB' },
  { key: 'hsl', label: 'HSL' },
  { key: 'hsb', label: 'HSB' },
]
</script>

<template>
  <div class="settings-appearance-panel__color-picker">
    <ColorSaturationPanel :h="hsl.h" :s="hsl.s" :l="hsl.l" @change="onPanelChange" />
    <ColorHueSlider :h="hsl.h" :preview-color="previewColor" @change="onHueChange" />
    <ColorLightnessSlider
      :h="hsl.h"
      :l="hsl.l"
      :preview-color="previewColor"
      @change="onLightnessChange"
    />

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
          @input="
            (e: Event) => applyHsl({ ...hsl, h: Number((e.target as HTMLInputElement).value) })
          "
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
          @input="
            (e: Event) => applyHsl({ ...hsl, s: Number((e.target as HTMLInputElement).value) })
          "
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
          @input="
            (e: Event) => applyHsl({ ...hsl, l: Number((e.target as HTMLInputElement).value) })
          "
        />
      </div>
      <div
        class="settings-appearance-panel__color-value settings-appearance-panel__color-value--percent settings-appearance-panel__color-value--disabled"
      >
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
          @input="
            (e: Event) =>
              (rgbValue = { ...rgbValue, r: Number((e.target as HTMLInputElement).value) })
          "
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
          @input="
            (e: Event) =>
              (rgbValue = { ...rgbValue, g: Number((e.target as HTMLInputElement).value) })
          "
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
          @input="
            (e: Event) =>
              (rgbValue = { ...rgbValue, b: Number((e.target as HTMLInputElement).value) })
          "
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
          @input="
            (e: Event) =>
              (hsbValue = { ...hsbValue, h: Number((e.target as HTMLInputElement).value) })
          "
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
          @input="
            (e: Event) =>
              (hsbValue = { ...hsbValue, s: Number((e.target as HTMLInputElement).value) })
          "
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
          @input="
            (e: Event) =>
              (hsbValue = { ...hsbValue, b: Number((e.target as HTMLInputElement).value) })
          "
        />
      </div>
      <div
        class="settings-appearance-panel__color-value settings-appearance-panel__color-value--percent settings-appearance-panel__color-value--disabled"
      >
        <span class="settings-appearance-panel__color-value-static">{{
          Math.round(hsbValue.b)
        }}</span>
        <span class="settings-appearance-panel__color-value-unit">%</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.settings-appearance-panel {
  /* 取色器容器（替代原 column 直接子元素的 10px 间距） */
  &__color-picker {
    display: flex;
    flex-direction: column;
    gap: 10px;
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

  /* 文本输入（Hex 标签页使用，样式与原面板保持一致） */
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
}
</style>
