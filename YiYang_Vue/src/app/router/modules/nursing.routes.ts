import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

export const nursingRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: 'nursing/care-level',
        name: 'nursing-care-level',
        component: () => import('@/modules/nursing/care-level/pages/CareLevelPage.vue'),
        meta: {
          title: '护理级别',
          menuKey: '/nursing/care-level',
        },
      },
      {
        path: 'nursing/care-item',
        name: 'nursing-care-item',
        component: () => import('@/modules/nursing/care-item/pages/CareItemPage.vue'),
        meta: {
          title: '护理内容',
          menuKey: '/nursing/care-item',
        },
      },
      {
        path: 'nursing/care-record',
        name: 'nursing-care-record',
        component: () =>
          import('@/modules/nursing/care-record/pages/CareRecordPage.vue'),
        meta: {
          title: '护理记录',
          menuKey: '/nursing/care-record',
        },
      },
    ],
  },
]
