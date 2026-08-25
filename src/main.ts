import { createApp } from 'vue'

import App from './App.vue'
import i18n from './locales'
import router from './router'
import pinia from './store'

import UIKit from '@easemob/uikit-im'
import '@easemob/uikit-im/theme'

import { useTheme } from './composables/useTheme'
import { isMobile } from './utils/env'

import 'nprogress/nprogress.css'
import './styles/index.scss'

// 初始化主题（模块内 watch 注册于 import 时，这里显式调用保证入口即生效）
useTheme()

// H5 真机调试面板：仅开发环境且移动端加载，生产构建会被 tree-shake
if (import.meta.env.DEV && isMobile) {
  const { default: eruda } = await import('eruda')
  eruda.init()
}

const app = createApp(App)

app.use(pinia)
app.use(UIKit)
app.use(router)
app.use(i18n)

app.mount('#app')
