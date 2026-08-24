import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import pinia from './store'

import { isMobile } from './utils/env'

import 'nprogress/nprogress.css'
import './styles/index.scss'

// H5 真机调试面板：仅开发环境且移动端加载，生产构建会被 tree-shake
if (import.meta.env.DEV && isMobile) {
  const { default: eruda } = await import('eruda')
  eruda.init()
}

const app = createApp(App)

app.use(pinia)
app.use(router)

app.mount('#app')
