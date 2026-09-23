import { createApp, watch } from 'vue'

import App from './App.vue'
import i18n from './locales'
import router from './router'
import pinia from './store'

import UIKit from '@easemob-community/uikit-im'
// SDK5 默认适配器注册入口（uikit-im 3.x 双 adapter 架构）：import 即注册，Provider 不传 adapter 时使用
import '@easemob-community/uikit-im/websdk5'
import '@easemob-community/uikit-im/theme'

import { applyDemoContainerConfig } from './config/demo'
import { applyUIKitLocaleOverrides } from './config/uikit-locale'
import { useDevMode } from './composables/useDevMode'
import { useTheme } from './composables/useTheme'
import { isMobile } from './utils/env'
import { setupBaiduAnalytics } from './utils/analytics'

import 'nprogress/nprogress.css'
import './styles/index.scss'

// 初始化主题（模块内 watch 注册于 import 时，这里显式调用保证入口即生效）
useTheme()

// 应用 Demo 容器配置（间距 / 圆角 → CSS 变量），与 UIKit demo 的容器间距对齐
applyDemoContainerConfig()

// 覆盖 UIKit 内置文案（添加联系人弹窗输入框支持手机号或用户 ID）
applyUIKitLocaleOverrides()

// 百度统计：仅生产环境加载（import.meta.env.PROD 守卫，见 src/utils/analytics.ts）
setupBaiduAnalytics()

// H5 真机调试面板：移动端跟随开发者模式开关，开启时动态加载、关闭时销毁
if (isMobile) {
  const { devEnabled } = useDevMode()
  let eruda: typeof import('eruda').default | null = null
  watch(
    devEnabled,
    async (enabled) => {
      if (enabled) {
        if (!eruda) eruda = (await import('eruda')).default
        eruda.init()
      } else if (eruda) {
        eruda.destroy()
      }
    },
    { immediate: true },
  )
}

const app = createApp(App)

app.use(pinia)
app.use(UIKit)
app.use(router)
app.use(i18n)

app.mount('#app')

// 挂载后延迟注入拼音适配器（实现见 src/utils/pinyin.ts）：UIKit 调用时才读取 adapter
// （模块级变量，注册时无快照），动态 import 把 pinyin-pro 完整词典移出首屏关键链；
// 注册前 UIKit 自动降级为字符串匹配，注册后拼音搜索 / 分组即恢复。
void import('./utils/pinyin').then((m) => m.setupPinyinAdapter())
