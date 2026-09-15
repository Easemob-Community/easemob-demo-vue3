<script setup lang="ts">
/**
 * 色相条（0-360°，控制 H）
 *
 * 本地维护拖拽状态，拖动时通过 change 事件向上提交新的 h。
 */
import { ref } from 'vue'

import { clamp } from '@/utils/color'

defineOptions({ name: 'ColorHueSlider' })

const props = defineProps<{ h: number; previewColor: string }>()
const emit = defineEmits<{ (e: 'change', value: number): void }>()

const sliderRef = ref<HTMLElement>()
const isDragging = ref(false)

function hueFromEvent(e: MouseEvent | TouchEvent): number {
  const bar = sliderRef.value
  if (!bar) return props.h
  const rect = bar.getBoundingClientRect()
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const x = clamp(clientX - rect.left, 0, rect.width)
  return Math.round((x / rect.width) * 360)
}

function applyFromEvent(e: MouseEvent | TouchEvent) {
  emit('change', hueFromEvent(e))
}

function onMouseDown(e: MouseEvent) {
  isDragging.value = true
  applyFromEvent(e)
}
function onTouchStart(e: TouchEvent) {
  isDragging.value = true
  applyFromEvent(e)
}
function onMouseMove(e: MouseEvent) {
  if (!isDragging.value) return
  applyFromEvent(e)
}
function onTouchMove(e: TouchEvent) {
  if (!isDragging.value) return
  applyFromEvent(e)
}
function stopDragging() {
  isDragging.value = false
}
</script>

<template>
  <div class="settings-appearance-panel__slider-row">
    <div class="settings-appearance-panel__color-dot" :style="{ backgroundColor: previewColor }" />
    <div
      ref="sliderRef"
      class="settings-appearance-panel__hue-slider"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="stopDragging"
      @mouseleave="stopDragging"
      @touchstart.prevent="onTouchStart"
      @touchmove.prevent="onTouchMove"
      @touchend="stopDragging"
    >
      <div
        class="settings-appearance-panel__slider-thumb"
        :style="{ left: `${(h / 360) * 100}%` }"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.settings-appearance-panel {
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

  &__hue-slider {
    position: relative;
    flex: 1;
    height: 18px;
    border-radius: 9px;
    cursor: pointer;
    touch-action: none;
    background: linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00);
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
}
</style>
