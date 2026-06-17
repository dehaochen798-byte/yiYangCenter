import type { RouteRecordRaw } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'

export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/auth',
    component: AuthLayout,
    redirect: '/auth/login',
    meta: {
      requiresAuth: false,
      title: '认证',
    },
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('@/modules/auth/pages/LoginPage.vue'),
        meta: {
          title: '登录',
        },
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('@/modules/auth/pages/RegisterPage.vue'),
        meta: {
          title: '注册',
        },
      },
      {
        path: 'js-lab',
        name: 'js-lab',
        component: () => import('@/modules/system/pages/JsPracticePage.vue'),
        meta: {
          title: 'JS 测试页',
        },
      },
      {
        path: 'text1',
        name: 'text1',
        component: () => import('@/modules/system/pages/text1.vue'),
        meta: {
          title: '手搓简单事件',
        },
      },
    ],
  },
]
