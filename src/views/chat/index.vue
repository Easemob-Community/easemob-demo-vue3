<script setup lang="ts">
import { EmChatContainer, EmConversationContainer } from '@easemob/uikit-im'

defineOptions({ name: 'ChatPage' })
</script>

<template>
  <div class="chat-page">
    <em-conversation-container class="chat-page__conversation" />
    <em-chat-container class="chat-page__chat" />
  </div>
</template>

<style lang="scss" scoped>
.chat-page {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;

  &__conversation {
    width: 300px;
    flex-shrink: 0;
    border-right: 1px solid var(--color-border);
  }

  &__chat {
    flex: 1;
    min-width: 0;
  }
}
</style>
