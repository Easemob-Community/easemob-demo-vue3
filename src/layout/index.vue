<script setup lang="ts">
import { useMobileView } from '@/composables/useMobileView'

defineOptions({ name: 'AppLayout' })

const isMobileView = useMobileView()
</script>

<template>
  <div class="app-layout" :class="{ 'app-layout--mobile': isMobileView }">
    <!-- PC：左侧边栏导航 -->
    <aside v-if="!isMobileView" class="app-layout__aside">
      <router-link to="/chat">会话</router-link>
      <router-link to="/contacts">通讯录</router-link>
    </aside>

    <main class="app-layout__main">
      <router-view />
    </main>

    <!-- H5：底部 tabbar 导航，适配底部安全区 -->
    <nav v-if="isMobileView" class="app-layout__tabbar safe-area-bottom">
      <router-link class="app-layout__tab" to="/chat">会话</router-link>
      <router-link class="app-layout__tab" to="/contacts">通讯录</router-link>
    </nav>
  </div>
</template>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  height: 100vh;

  &--mobile {
    flex-direction: column;
  }

  &__aside {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 72px;
    padding: 24px 0;
    align-items: center;
    border-right: 1px solid #e5e6eb;
  }

  &__main {
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow: auto;
  }

  &__tabbar {
    display: flex;
    border-top: 1px solid #e5e6eb;
    background: #fff;
  }

  &__tab {
    flex: 1;
    padding: 10px 0;
    text-align: center;
    font-size: 14px;

    &.router-link-active {
      color: #2563eb;
    }
  }
}
</style>
