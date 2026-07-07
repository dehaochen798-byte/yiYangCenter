import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import { ROLE_KEYS } from '@/constants/rbac'

export const customerRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/modules/dashboard/pages/DashboardPage.vue'),
        meta: {
          title: '工作台',
          menuKey: '/dashboard',
          roles: Object.values(ROLE_KEYS),
        },
      },
      {
        path: 'customer/residents',
        name: 'customer-residents',
        component: () => import('@/modules/customer/resident/pages/ResidentPage.vue'),
        meta: {
          title: '客户档案',
          menuKey: '/customer/residents',
          roles: Object.values(ROLE_KEYS),
        },
      },
      {
        path: 'customer/users',
        name: 'customer-users',
        component: () => import('@/modules/customer/user/pages/UserAccountPage.vue'),
        meta: {
          title: '员工账号',
          menuKey: '/customer/users',
          roles: [ROLE_KEYS.ADMIN],
        },
      },
      {
        path: 'customer/bed',
        name: 'customer-bed',
        component: () => import('@/modules/customer/bed/pages/BedPage.vue'),
        meta: {
          title: '床位管理',
          menuKey: '/customer/bed',
          roles: [ROLE_KEYS.ADMIN, ROLE_KEYS.FRONT_DESK],
        },
      },
      {
        path: 'customer/meal',
        name: 'customer-meal',
        component: () => import('@/modules/customer/meal/pages/MealPage.vue'),
        meta: {
          title: '膳食管理',
          menuKey: '/customer/meal',
          roles: [ROLE_KEYS.ADMIN, ROLE_KEYS.MEAL_MANAGER],
        },
      },
      {
        path: 'customer/meal-calendar',
        name: 'customer-meal-calendar',
        component: () =>
          import('@/modules/customer/meal-calendar/pages/MealCalendarPage.vue'),
        meta: {
          title: '膳食日历',
          menuKey: '/customer/meal-calendar',
          roles: [ROLE_KEYS.ADMIN, ROLE_KEYS.MEAL_MANAGER],
        },
      },
      {
        path: 'customer/check-in',
        name: 'customer-check-in',
        component: () => import('@/modules/customer/check-in/pages/CheckInPage.vue'),
        meta: {
          title: '入住登记',
          menuKey: '/customer/check-in',
          roles: [ROLE_KEYS.ADMIN, ROLE_KEYS.FRONT_DESK],
        },
      },
      {
        path: 'customer/check-out',
        name: 'customer-check-out',
        component: () => import('@/modules/customer/check-out/pages/CheckOutPage.vue'),
        meta: {
          title: '退住登记',
          menuKey: '/customer/check-out',
          roles: [ROLE_KEYS.ADMIN, ROLE_KEYS.FRONT_DESK],
        },
      },
      {
        path: 'customer/outing',
        name: 'customer-outing',
        component: () => import('@/modules/customer/outing/pages/OutingPage.vue'),
        meta: {
          title: '外出登记',
          menuKey: '/customer/outing',
          roles: [ROLE_KEYS.ADMIN, ROLE_KEYS.FRONT_DESK],
        },
      },
      {
        path: 'customer/service-target',
        name: 'customer-service-target',
        component: () =>
          import('@/modules/customer/service-target/pages/ServiceTargetPage.vue'),
        meta: {
          title: '服务对象分配',
          menuKey: '/customer/service-target',
          roles: [ROLE_KEYS.ADMIN, ROLE_KEYS.NURSING_SUPERVISOR],
        },
      },
      {
        path: 'customer/service-focus',
        name: 'customer-service-focus',
        component: () =>
          import('@/modules/customer/service-focus/pages/ServiceFocusPage.vue'),
        meta: {
          title: '服务关注',
          menuKey: '/customer/service-focus',
          roles: [ROLE_KEYS.ADMIN, ROLE_KEYS.NURSING_STAFF],
        },
      },
    ],
  },
]
