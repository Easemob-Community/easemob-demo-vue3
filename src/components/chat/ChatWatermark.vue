<script setup lang="ts">
/**
 * 聊天区水印组件
 *
 * 配合 UIKit 容器（EmChatContainer）的 #watermark 插槽使用：
 * UIKit 提供铺满聊天区、pointer-events:none 的覆盖层壳，本组件负责平铺水印内容。
 */
interface Props {
  /** 水印文案 */
  text: string
}

const props = defineProps<Props>()

/** 平铺块数量：铺满常见聊天区尺寸足够，溢出由覆盖层 overflow:hidden 裁掉 */
const TILE_COUNT = 24
const tiles = Array.from({ length: TILE_COUNT }, (_, i) => i)
</script>

<template>
  <div class="chat-watermark" aria-hidden="true">
    <span v-for="i in tiles" :key="i" class="chat-watermark__tile">{{ props.text }}</span>
  </div>
</template>

<style scoped>
.chat-watermark {
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  align-content: space-evenly;
  justify-content: space-evenly;
  overflow: hidden;
}

.chat-watermark__tile {
  margin: 32px 48px;
  font-size: calc(14px * var(--demo-font-scale, 1));
  white-space: nowrap;
  color: var(--color-text);
  opacity: 0.08;
  transform: rotate(-20deg);
  user-select: none;
}
</style>
