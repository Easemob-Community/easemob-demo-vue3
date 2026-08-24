<script setup lang="ts">
defineOptions({ name: 'NotFoundPage' })
</script>

<template>
  <div class="not-found">
    <h1>404</h1>
    <p>{{ $t('notFound.title') }}</p>
    <router-link to="/">{{ $t('notFound.backHome') }}</router-link>
  </div>
</template>
