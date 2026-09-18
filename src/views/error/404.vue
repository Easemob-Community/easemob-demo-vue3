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

<style lang="scss" scoped>
.not-found {
  /* 全局 reset 收敛后标题与段落恢复浏览器默认外边距，此处显式清零 */
  h1,
  p {
    margin: 0;
    padding: 0;
  }
}
</style>
