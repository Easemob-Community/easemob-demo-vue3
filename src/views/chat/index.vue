<script setup lang="ts">
defineOptions({ name: 'ChatPage' })
</script>

<template>
  <div class="chat-page">
    <h1>{{ $t('nav.chat') }}</h1>
    <p>{{ $t('chat.placeholder') }}</p>
  </div>
</template>
