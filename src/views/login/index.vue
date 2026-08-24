<script setup lang="ts">
defineOptions({ name: 'LoginPage' })
</script>

<template>
  <div class="login-page">
    <h1>{{ $t('login.title') }}</h1>
    <p>{{ $t('login.placeholder') }}</p>
  </div>
</template>
