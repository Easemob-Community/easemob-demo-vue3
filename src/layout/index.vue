<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { useMobileView } from '@/composables/useMobileView'
import { useTheme, type ThemeMode } from '@/composables/useTheme'
import { SUPPORT_LOCALES, type AppLocale } from '@/locales'

defineOptions({ name: 'AppLayout' })

const isMobileView = useMobileView()
const { t, locale } = useI18n()
const { mode, setMode } = useTheme()

const THEME_MODES: ThemeMode[] = ['light', 'dark', 'auto']

function switchLocale(value: AppLocale) {
  locale.value = value
}
</script>

<template>
  <div class="app-layout" :class="{ 'app-layout--mobile': isMobileView }">
    <!-- PC：左侧边栏导航 -->
    <aside v-if="!isMobileView" class="app-layout__aside">
      <router-link to="/chat">{{ t('nav.chat') }}</router-link>
      <router-link to="/contacts">{{ t('nav.contacts') }}</router-link>
    </aside>

    <main class="app-layout__main">
      <!-- 语言 / 主题切换示例，后续可挪到设置页 -->
      <div class="app-layout__toolbar">
        <button
          v-for="item in SUPPORT_LOCALES"
          :key="item.value"
          :class="{ active: locale === item.value }"
          @click="switchLocale(item.value)"
        >
          {{ item.label }}
        </button>
        <button
          v-for="item in THEME_MODES"
          :key="item"
          :class="{ active: mode === item }"
          @click="setMode(item)"
        >
          {{ t(`theme.${item}`) }}
        </button>
      </div>
      <router-view />
    </main>

    <!-- H5：底部 tabbar 导航，适配底部安全区 -->
    <nav v-if="isMobileView" class="app-layout__tabbar safe-area-bottom">
      <router-link class="app-layout__tab" to="/chat">{{ t('nav.chat') }}</router-link>
      <router-link class="app-layout__tab" to="/contacts">{{ t('nav.contacts') }}</router-link>
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
    border-right: 1px solid var(--color-border);
  }

  &__main {
    position: relative;
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow: auto;
  }

  &__toolbar {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 10;
    display: flex;
    gap: 8px;

    button {
      padding: 4px 10px;
      font-size: 12px;
      color: var(--color-text);
      border: 1px solid var(--color-border);
      border-radius: 4px;
      background: var(--color-bg);
      cursor: pointer;

      &.active {
        color: #fff;
        background: var(--color-primary);
        border-color: var(--color-primary);
      }
    }
  }

  &__tabbar {
    display: flex;
    border-top: 1px solid var(--color-border);
    background: var(--color-bg);
  }

  &__tab {
    flex: 1;
    padding: 10px 0;
    text-align: center;
    font-size: 14px;

    &.router-link-active {
      color: var(--color-primary);
    }
  }
}
</style>
