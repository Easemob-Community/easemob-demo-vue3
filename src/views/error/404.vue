<script setup lang="ts">
defineOptions({ name: 'NotFoundPage' })
</script>

<template>
  <div class="not-found">
    <h1 class="not-found__code">404</h1>
    <p class="not-found__title">{{ $t('notFound.title') }}</p>
    <router-link to="/" class="not-found__back">{{ $t('notFound.backHome') }}</router-link>
  </div>
</template>

<style lang="scss" scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  background: var(--color-bg);

  /* 全局 reset 收敛后标题与段落恢复浏览器默认外边距，此处显式清零 */
  h1,
  p {
    margin: 0;
    padding: 0;
  }

  &__code {
    margin-bottom: 16px;
    font-size: calc(72px * var(--demo-font-scale, 1));
    font-weight: 600;
    line-height: 1;
    color: var(--color-text-quaternary);
  }

  &__title {
    margin-bottom: 32px;
    font-size: calc(24px * var(--demo-font-scale, 1));
    font-weight: 500;
    color: var(--color-text);
  }

  &__back {
    padding: 10px 24px;
    font-size: calc(14px * var(--demo-font-scale, 1));
    color: #ffffff;
    text-decoration: none;
    background: var(--color-primary);
    border-radius: var(--demo-component-radius, 8px);
    transition: background-color 0.2s;

    &:hover {
      background: var(--color-primary-hover, var(--color-primary));
    }
  }
}
</style>
