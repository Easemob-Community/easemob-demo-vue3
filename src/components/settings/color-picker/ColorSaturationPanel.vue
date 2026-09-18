<script setup lang="ts">
/**
 * 主题色 2D 色板（饱和度×亮度平面，hue 由色相条控制）
 *
 * 本地维护拖拽状态，拖动时通过 change 事件向上提交新的 s / l。
 */
import { ref } from 'vue'

import { clamp } from '@/utils/color'

defineOptions({ name: 'ColorSaturationPanel' })

const props = defineProps<{ h: number; s: number; l: number }>()
const emit = defineEmits<{ (e: 'change', value: { s: number; l: number }): void }>()

const panelRef = ref<HTMLElement>()
const isDragging = ref(false)

function colorFromEvent(e: MouseEvent | TouchEvent): { s: number; l: number } {
  const panel = panelRef.value
  if (!panel) return { s: props.s, l: props.l }
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

function applyFromEvent(e: MouseEvent | TouchEvent) {
  emit('change', colorFromEvent(e))
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
  <div
    ref="panelRef"
    class="settings-appearance-panel__color-panel"
    :style="{ '--panel-hue': h }"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="stopDragging"
    @mouseleave="stopDragging"
    @touchstart.prevent="onTouchStart"
    @touchmove.prevent="onTouchMove"
    @touchend="stopDragging"
  >
    <div
      class="settings-appearance-panel__color-panel-cursor"
      :style="{ left: `${s}%`, top: `${100 - l}%` }"
    />
  </div>
</template>

<style lang="scss" scoped>
.settings-appearance-panel {
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
    box-sizing: border-box;
    border: 2px solid #ffffff;
    border-radius: 50%;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
}
</style>
