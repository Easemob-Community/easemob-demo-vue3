<script setup lang="ts">
/**
 * Markdown 流式消息气泡（插件形态）。
 *
 * 通过 `#message-txt` 插槽接管 `stream.customType === 'markdown'` 的文本消息：
 * - markdown 渲染（代码块 / 表格 / 引用 / 列表），不引入代码高亮等重依赖；
 * - 流式传输中尾部打字机光标、终态收敛、异常提示（与内核纯文本流式语义一致）；
 * - 非 markdown 文本（普通文本 / 纯文本流式）回落内核 `EmTextMessage`。
 *
 * 接入方式：在 `<EmChatContainer>` 上写 `#message-txt` 插槽即可。
 */
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import { EmTextMessage, STREAM_MESSAGE_STATUS } from '@easemob-community/uikit-im'
import type { TextMessageType, UiMessage } from '@easemob-community/uikit-im'

export interface MarkdownStreamMessageProps {
  message: UiMessage
}

const props = defineProps<MarkdownStreamMessageProps>()

const MARKDOWN_CUSTOM_TYPE = 'markdown'

/** 是否为本组件接管的 markdown 流式消息 */
const isMarkdownStream = computed(() =>
  (props.message as { stream?: { customType?: string } }).stream?.customType === MARKDOWN_CUSTOM_TYPE,
)

/** 流式是否处于传输中（未到终态） */
const isStreaming = computed(() => {
  const status = (props.message as { stream?: { status?: string } }).stream?.status
  return status === STREAM_MESSAGE_STATUS.START || status === STREAM_MESSAGE_STATUS.IN_PROGRESS
})

/** 流式是否异常结束 */
const isStreamError = computed(() =>
  (props.message as { stream?: { status?: string } }).stream?.status === STREAM_MESSAGE_STATUS.ERROR,
)

/** markdown-it 实例：html 关闭（防 XSS），linkify 开启 URL 识别，breaks 开启换行。 */
const md = new MarkdownIt({ html: false, linkify: true, breaks: true })

// 过滤危险 URL 协议（javascript:、data:、vbscript: 等），防止钓鱼/脚本注入
const safeLinkValidator = (url: string) => {
  const normalized = url.trim().toLowerCase()
  return !normalized.startsWith('javascript:') && !normalized.startsWith('data:') && !normalized.startsWith('vbscript:')
}
md.validateLink = safeLinkValidator

/** 渲染后的 markdown HTML */
const renderedHtml = computed(() => {
  const content = (props.message.body as { content?: string }).content || ''
  return md.render(content)
})
</script>

<template>
  <!-- 非 markdown 流式消息：回落内核文本气泡 -->
  <EmTextMessage
    v-if="!isMarkdownStream && props.message.type === 'text'"
    :message="props.message as TextMessageType"
  />

  <!-- markdown 流式气泡（插件接管渲染） -->
  <div v-else class="md-stream-msg" :class="{ 'md-stream-msg--self': message.isSelf }">
    <div class="md-stream-msg__bubble">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="md-stream-msg__body" v-html="renderedHtml" />
      <span v-if="isStreaming" class="md-stream-msg__cursor" aria-hidden="true" />
    </div>
    <div v-if="isStreamError" class="md-stream-msg__error">
      内容生成异常
    </div>
  </div>
</template>

<style lang="scss" scoped>
.md-stream-msg {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;

  &--self {
    align-items: flex-end;
  }

  &__bubble {
    max-width: 100%;
    padding: 10px 14px;
    border-radius: 12px;
    background-color: var(--uikit-bubble-bg-other);
    color: var(--uikit-bubble-text-other);
    font-size: var(--uikit-font-size-14, 14px);
    overflow-wrap: break-word;
    word-break: normal;
  }

  &--self &__bubble {
    background-color: var(--uikit-bubble-bg-self);
    color: var(--uikit-bubble-text-self);
  }

  &__cursor {
    display: inline-block;
    width: 8px;
    height: 1em;
    margin-left: 2px;
    border-radius: 2px;
    background-color: currentColor;
    vertical-align: text-bottom;
    opacity: 0.85;
    animation: md-stream-cursor-blink 1s step-end infinite;
  }

  @keyframes md-stream-cursor-blink {
    0%,
    100% {
      opacity: 0.85;
    }
    50% {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &__cursor {
      animation: none;
      opacity: 0.5;
    }
  }

  &__error {
    font-size: var(--uikit-font-size-12, 12px);
    color: var(--uikit-text-secondary);
    opacity: 0.75;
    user-select: none;
  }

  &--self &__error {
    color: var(--uikit-bubble-text-self);
    opacity: 0.75;
  }

  &__body {
    line-height: 1.55;
    word-break: break-word;

    :deep(p) {
      margin: 4px 0;
    }

    :deep(p:first-child) {
      margin-top: 0;
    }

    :deep(p:last-child) {
      margin-bottom: 0;
    }

    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4) {
      margin: 10px 0 6px;
      font-size: 1.1em;
      line-height: 1.3;
    }

    :deep(ul),
    :deep(ol) {
      margin: 6px 0;
      padding-left: 22px;
    }

    :deep(li) {
      margin: 2px 0;
    }

    :deep(blockquote) {
      margin: 6px 0;
      padding: 2px 0 2px 10px;
      border-left: 3px solid var(--uikit-primary-color, currentColor);
      opacity: 0.85;
    }

    :deep(code) {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 0.92em;
      padding: 1px 4px;
      border-radius: 4px;
      background-color: var(--uikit-bg-secondary, rgba(127, 127, 127, 0.18));
    }

    :deep(pre) {
      margin: 6px 0;
      padding: 10px 12px;
      border-radius: 8px;
      overflow-x: auto;
      background-color: #282c34;
      color: #abb2bf;
      font-size: var(--uikit-font-size-13, 13px);
      line-height: 1.5;
    }

    :deep(pre code) {
      padding: 0;
      background: none;
      color: inherit;
    }

    :deep(table) {
      margin: 6px 0;
      border-collapse: collapse;
      font-size: var(--uikit-font-size-13, 13px);
    }

    :deep(th),
    :deep(td) {
      padding: 4px 10px;
      border: 1px solid var(--uikit-border-color, currentColor);
    }

    :deep(hr) {
      margin: 8px 0;
      border: none;
      border-top: 1px solid var(--uikit-border-color, currentColor);
    }

    :deep(a) {
      color: var(--uikit-primary-color);
      text-decoration: underline;
      text-underline-offset: 2px;
      word-break: break-all;
    }
  }
}
</style>
