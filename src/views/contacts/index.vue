<script setup lang="ts">
defineOptions({ name: 'ContactsPage' })
</script>

<template>
  <div class="contacts-page">
    <h1>{{ $t('nav.contacts') }}</h1>
    <p>{{ $t('contacts.placeholder') }}</p>
  </div>
</template>
