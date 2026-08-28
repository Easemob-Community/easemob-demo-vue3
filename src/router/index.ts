import NProgress from 'nprogress'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import i18n from '@/locales'
import { useUserStore } from '@/store/modules/user'

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

router.afterEach(() => {
  NProgress.done()
})

export default router
