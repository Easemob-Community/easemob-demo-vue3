<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { EmIcon, EmPopup } from '@easemob/uikit-im'

interface Props {
  /** 弹窗显隐 */
  show: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'confirm', file: Blob): void
}>()

defineOptions({ name: 'AvatarCropperModal' })

const { t } = useI18n()

/** 裁剪容器尺寸（px） */
const CONTAINER_SIZE = 280
/** 裁剪圆直径（px） */
const CROP_SIZE = 200
/** 输出头像尺寸（px） */
const OUTPUT_SIZE = 200

const fileInputRef = ref<HTMLInputElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)

/** 当前加载的 Image 对象 */
const image = ref<HTMLImageElement | null>(null)
/** 图片缩放比例 */
const scale = ref(1)
/** 图片在容器中的偏移（px） */
const offsetX = ref(0)
const offsetY = ref(0)
/** 是否正在拖动 */
const isDragging = ref(false)
/** 拖动起始坐标 */
const dragStartX = ref(0)
const dragStartY = ref(0)
const dragStartOffsetX = ref(0)
const dragStartOffsetY = ref(0)

/** 是否已选图 */
const hasImage = computed(() => image.value !== null)

/** 最小缩放：保证裁剪圆能完全落在图片内 */
const minScale = computed(() => {
  const img = image.value
  if (!img) return 1
  return Math.max(CROP_SIZE / img.naturalWidth, CROP_SIZE / img.naturalHeight)
})

/** 最大缩放：最小缩放的 3 倍或初始适配缩放的较大值 */
const maxScale = computed(() => {
  const img = image.value
  if (!img) return 3
  const fitScale = Math.min(CONTAINER_SIZE / img.naturalWidth, CONTAINER_SIZE / img.naturalHeight)
  return Math.max(minScale.value * 3, fitScale * 2, 1)
})

function closeModal() {
  emit('update:show', false)
}

function openFilePicker() {
  fileInputRef.value?.click()
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    const dataUrl = reader.result as string
    loadImage(dataUrl)
  }
  reader.readAsDataURL(file)

  // 重置 input，允许重复选择同一张图片
  target.value = ''
}

function loadImage(src: string) {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    image.value = img
    resetTransform()
    nextTick(draw)
  }
  img.onerror = () => {
    image.value = null
  }
  img.src = src
}

/** 根据图片和容器尺寸计算初始缩放与偏移 */
function resetTransform() {
  const img = image.value
  if (!img) return

  const fitScale = Math.min(CONTAINER_SIZE / img.naturalWidth, CONTAINER_SIZE / img.naturalHeight)
  scale.value = Math.max(fitScale, minScale.value)
  offsetX.value = 0
  offsetY.value = 0
}

/** 图片在容器中的绘制尺寸与位置 */
function getImageDrawRect() {
  const img = image.value
  if (!img) return { x: 0, y: 0, width: 0, height: 0 }

  const width = img.naturalWidth * scale.value
  const height = img.naturalHeight * scale.value
  const x = CONTAINER_SIZE / 2 - width / 2 + offsetX.value
  const y = CONTAINER_SIZE / 2 - height / 2 + offsetY.value
  return { x, y, width, height }
}

/** 绘制画布：图片 + 圆形裁剪遮罩 */
function draw() {
  const canvas = canvasRef.value
  const img = image.value
  if (!canvas || !img) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, CONTAINER_SIZE, CONTAINER_SIZE)

  const { x, y, width, height } = getImageDrawRect()
  ctx.drawImage(img, x, y, width, height)

  // 圆形裁剪区外的遮罩
  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.beginPath()
  ctx.rect(0, 0, CONTAINER_SIZE, CONTAINER_SIZE)
  ctx.arc(CONTAINER_SIZE / 2, CONTAINER_SIZE / 2, CROP_SIZE / 2, 0, Math.PI * 2, true)
  ctx.fill()
  ctx.restore()

  // 裁剪圆边框
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(CONTAINER_SIZE / 2, CONTAINER_SIZE / 2, CROP_SIZE / 2, 0, Math.PI * 2)
  ctx.stroke()
}

/** 限制偏移，使裁剪圆始终位于图片内 */
function clampOffset() {
  const img = image.value
  if (!img) return

  const { width, height } = getImageDrawRect()
  const halfCrop = CROP_SIZE / 2

  // 当图片某一边小于裁剪圆时， already constrained by minScale，这里再兜底
  if (width >= CROP_SIZE) {
    const minX = halfCrop - width / 2
    const maxX = width / 2 - halfCrop
    offsetX.value = Math.min(Math.max(offsetX.value, minX), maxX)
  } else {
    offsetX.value = 0
  }

  if (height >= CROP_SIZE) {
    const minY = halfCrop - height / 2
    const maxY = height / 2 - halfCrop
    offsetY.value = Math.min(Math.max(offsetY.value, minY), maxY)
  } else {
    offsetY.value = 0
  }
}

function handlePointerDown(event: PointerEvent) {
  if (!hasImage.value) return
  isDragging.value = true
  dragStartX.value = event.clientX
  dragStartY.value = event.clientY
  dragStartOffsetX.value = offsetX.value
  dragStartOffsetY.value = offsetY.value
  containerRef.value?.setPointerCapture(event.pointerId)
}

function handlePointerMove(event: PointerEvent) {
  if (!isDragging.value) return
  const dx = event.clientX - dragStartX.value
  const dy = event.clientY - dragStartY.value
  offsetX.value = dragStartOffsetX.value + dx
  offsetY.value = dragStartOffsetY.value + dy
  clampOffset()
  draw()
}

function handlePointerUp(event: PointerEvent) {
  if (!isDragging.value) return
  isDragging.value = false
  containerRef.value?.releasePointerCapture(event.pointerId)
}

function handleWheel(event: WheelEvent) {
  if (!hasImage.value) return
  event.preventDefault()
  const delta = event.deltaY > 0 ? -0.05 : 0.05
  scale.value = Math.min(Math.max(scale.value + delta, minScale.value), maxScale.value)
  clampOffset()
  draw()
}

/** 生成裁剪后的头像 JPEG Blob */
function cropToBlob(): Promise<Blob | null> {
  return new Promise((resolve) => {
    const img = image.value
    if (!img) {
      resolve(null)
      return
    }

    const outputCanvas = document.createElement('canvas')
    outputCanvas.width = OUTPUT_SIZE
    outputCanvas.height = OUTPUT_SIZE
    const ctx = outputCanvas.getContext('2d')
    if (!ctx) {
      resolve(null)
      return
    }

    const { x, y } = getImageDrawRect()
    const sourceSize = CROP_SIZE / scale.value
    const sourceX = (CONTAINER_SIZE / 2 - CROP_SIZE / 2 - x) / scale.value
    const sourceY = (CONTAINER_SIZE / 2 - CROP_SIZE / 2 - y) / scale.value

    ctx.drawImage(img, sourceX, sourceY, sourceSize, sourceSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE)
    outputCanvas.toBlob(
      (blob) => {
        resolve(blob)
      },
      'image/jpeg',
      0.92,
    )
  })
}

async function confirmCrop() {
  if (!hasImage.value) return
  const blob = await cropToBlob()
  if (blob) {
    emit('confirm', blob)
  }
  closeModal()
}

// 弹窗打开且无图片时重置状态；关闭时清空图片
watch(
  () => props.show,
  (show) => {
    if (!show) {
      image.value = null
      scale.value = 1
      offsetX.value = 0
      offsetY.value = 0
    }
  },
)

watch([scale, offsetX, offsetY], () => {
  draw()
})
</script>

<template>
  <EmPopup
    :show="show"
    position="center"
    :close-on-click-overlay="false"
    :close-on-esc="false"
    class="avatar-cropper-modal"
    @update:show="emit('update:show', $event)"
  >
    <div class="avatar-cropper-modal__content">
      <div class="avatar-cropper-modal__header">
        <span class="avatar-cropper-modal__title">{{ t('settings.account.editAvatar') }}</span>
      </div>

      <div
        ref="containerRef"
        class="avatar-cropper-modal__canvas-wrapper"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="handlePointerUp"
        @pointerleave="handlePointerUp"
        @wheel.prevent="handleWheel"
      >
        <canvas
          ref="canvasRef"
          :width="CONTAINER_SIZE"
          :height="CONTAINER_SIZE"
          class="avatar-cropper-modal__canvas"
        />

        <div
          v-if="!hasImage"
          class="avatar-cropper-modal__placeholder"
          @click="openFilePicker"
        >
          <EmIcon name="image" :size="40" />
          <span class="avatar-cropper-modal__placeholder-text">
            {{ t('settings.account.selectImage') }}
          </span>
        </div>

        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          class="avatar-cropper-modal__file-input"
          @change="handleFileChange"
        />
      </div>

      <p v-if="hasImage" class="avatar-cropper-modal__hint">
        {{ t('settings.account.avatarCropHint') }}
      </p>

      <div v-if="hasImage" class="avatar-cropper-modal__zoom">
        <span class="avatar-cropper-modal__zoom-label">{{ t('settings.account.zoom') }}</span>
        <input
          v-model.number="scale"
          type="range"
          :min="minScale"
          :max="maxScale"
          :step="0.01"
          class="avatar-cropper-modal__zoom-slider"
        />
      </div>

      <div class="avatar-cropper-modal__footer">
        <button
          type="button"
          class="avatar-cropper-modal__btn avatar-cropper-modal__btn--cancel"
          @click="closeModal"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          v-if="hasImage"
          type="button"
          class="avatar-cropper-modal__btn avatar-cropper-modal__btn--secondary"
          @click="openFilePicker"
        >
          {{ t('settings.account.reselectImage') }}
        </button>
        <button
          v-if="hasImage"
          type="button"
          class="avatar-cropper-modal__btn avatar-cropper-modal__btn--confirm"
          @click="confirmCrop"
        >
          {{ t('common.confirm') }}
        </button>
        <button
          v-else
          type="button"
          class="avatar-cropper-modal__btn avatar-cropper-modal__btn--confirm"
          @click="openFilePicker"
        >
          {{ t('settings.account.selectImage') }}
        </button>
      </div>
    </div>
  </EmPopup>
</template>

<style lang="scss" scoped>
.avatar-cropper-modal {
  :deep(.uikit-popup__content) {
    padding: 0;
    border-radius: 12px;
    background: var(--color-bg);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  &__content {
    width: 320px;
    padding: 20px;
  }

  &__header {
    margin-bottom: 16px;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
  }

  &__canvas-wrapper {
    position: relative;
    width: v-bind('`${CONTAINER_SIZE}px`');
    height: v-bind('`${CONTAINER_SIZE}px`');
    margin: 0 auto;
    border-radius: 8px;
    background: var(--color-bg-secondary);
    overflow: hidden;
    touch-action: none;
  }

  &__canvas {
    display: block;
    width: 100%;
    height: 100%;
    cursor: grab;

    &:active {
      cursor: grabbing;
    }
  }

  &__placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition:
      color 0.2s,
      background-color 0.2s;

    &:hover {
      color: var(--color-primary);
      background: var(--color-bg);
    }
  }

  &__placeholder-text {
    font-size: 14px;
  }

  &__file-input {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
    pointer-events: none;
  }

  &__hint {
    margin: 12px 0 0;
    font-size: 12px;
    text-align: center;
    color: var(--color-text-secondary);
  }

  &__footer {
    display: flex;
    gap: 12px;
    margin-top: 20px;
  }

  &__btn {
    flex: 1;
    min-width: 0;
    height: 36px;
    padding: 0 12px;
    font-size: 14px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition:
      background-color 0.2s,
      opacity 0.2s;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    &--cancel {
      color: var(--color-text);
      background: var(--color-bg-secondary);

      &:hover:not(:disabled) {
        background: var(--color-border);
      }
    }

    &--secondary {
      color: var(--color-text);
      background: var(--color-bg-secondary);

      &:hover:not(:disabled) {
        background: var(--color-border);
      }
    }

    &--confirm {
      color: #ffffff;
      background: var(--color-primary);

      &:hover:not(:disabled) {
        background: var(--color-primary-hover, var(--color-primary));
      }
    }
  }

  &__zoom {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 16px;
    padding: 0 4px;
  }

  &__zoom-label {
    flex-shrink: 0;
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  &__zoom-slider {
    flex: 1;
    min-width: 0;
    height: 6px;
    padding: 0;
    cursor: pointer;
    appearance: none;
    background: transparent;

    &::-webkit-slider-runnable-track {
      height: 6px;
      border-radius: 3px;
      background: var(--color-border);
    }

    &::-moz-range-track {
      height: 6px;
      border-radius: 3px;
      background: var(--color-border);
    }

    &::-webkit-slider-thumb {
      width: 16px;
      height: 16px;
      margin-top: -5px;
      appearance: none;
      background: var(--color-primary);
      border: 2px solid var(--color-bg);
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      transition:
        transform 0.2s,
        box-shadow 0.2s;
    }

    &::-moz-range-thumb {
      width: 16px;
      height: 16px;
      appearance: none;
      background: var(--color-primary);
      border: 2px solid var(--color-bg);
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      transition:
        transform 0.2s,
        box-shadow 0.2s;
    }

    &:hover::-webkit-slider-thumb {
      transform: scale(1.1);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    &:hover::-moz-range-thumb {
      transform: scale(1.1);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    &:active::-webkit-slider-thumb {
      transform: scale(0.95);
    }

    &:active::-moz-range-thumb {
      transform: scale(0.95);
    }
  }
}
</style>
