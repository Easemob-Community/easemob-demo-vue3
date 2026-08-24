import NProgress from 'nprogress'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

NProgress.configure({ showSpinner: false })

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/chat',
    children: [
      {
        path: 'chat',
        name: 'Chat',
        component: () => import('@/views/chat/index.vue'),
        meta: { title: '会话' },
      },
      {
        path: 'contacts',
        name: 'Contacts',
        component: () => import('@/views/contacts/index.vue'),
        meta: { title: '通讯录' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '页面不存在' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  NProgress.start()
  document.title = to.meta.title ? `${to.meta.title} - 环信 IM Demo` : '环信 IM Demo'
  // TODO: 登录态校验，未登录跳转 /login
  return true
})

router.afterEach(() => {
  NProgress.done()
})

export default router
