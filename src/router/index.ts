import NProgress from 'nprogress'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import i18n from '@/locales'
import { useUserStore } from '@/store/modules/user'
import { trackPageview } from '@/utils/analytics'

NProgress.configure({ showSpinner: false })

// meta.title 存 i18n 语言包 key，守卫内统一解析，切换语言后标题随之更新
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: 'login.title', requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/chat',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'chat',
        name: 'Chat',
        component: () => import('@/views/chat/index.vue'),
        meta: { title: 'nav.chat' },
      },
      {
        path: 'contacts',
        name: 'Contacts',
        component: () => import('@/views/contacts/index.vue'),
        meta: { title: 'nav.contacts' },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/index.vue'),
        meta: { title: 'nav.settings' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: 'notFound.title', requiresAuth: false },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  NProgress.start()

  const userStore = useUserStore()
  // 刷新页面后从 sessionStorage 恢复登录态，与 React Demo 保持一致
  userStore.restoreFromStorage()

  const appTitle = i18n.global.t('app.title')

  // 未登录访问受保护页面 → 登录页，携带来源路径便于登录后回跳
  if (to.meta.requiresAuth && !userStore.token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  // 已登录访问登录页 → 直接进入会话页
  if (to.path === '/login' && userStore.token) {
    return { path: '/chat' }
  }

  document.title = to.meta.title
    ? `${i18n.global.t(to.meta.title as string)} - ${appTitle}`
    : appTitle
  return true
})

router.afterEach((to, from) => {
  NProgress.done()
  // 百度统计 SPA pageview：首次加载由 hm.js 自动上报，这里只报后续路由切换
  // （初始导航 from.name 为 undefined，跳过避免与自动上报重复计数；
  //  用 to.path 而非 fullPath，避免 ?redirect=... 等 query 把同一页面拆成多条统计）
  if (from.name) trackPageview(to.path)
})

export default router
