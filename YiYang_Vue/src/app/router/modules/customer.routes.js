import MainLayout from '../../../layouts/MainLayout.vue'

export const customerRoutes = [
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
        component: () => import('../../../modules/dashboard/pages/DashboardPage.vue'),
        meta: {
          title: '工作台',
          menuKey: '/dashboard',
        },
      },
      {
        path: 'customer/bed',
        name: 'customer-bed',
        component: () => import('../../../modules/customer/bed/pages/BedPage.vue'),
        meta: {
          title: '床位管理',
          menuKey: '/customer/bed',
        },
      },
      {
        path: 'customer/meal',
        name: 'customer-meal',
        component: () => import('../../../modules/customer/meal/pages/MealPage.vue'),
        meta: {
          title: '膳食管理',
          menuKey: '/customer/meal',
        },
      },
      {
        path: 'customer/meal-calendar',
        name: 'customer-meal-calendar',
        component: () =>
          import('../../../modules/customer/meal-calendar/pages/MealCalendarPage.vue'),
        meta: {
          title: '膳食日历',
          menuKey: '/customer/meal-calendar',
        },
      },
      {
        path: 'customer/check-in',
        name: 'customer-check-in',
        component: () => import('../../../modules/customer/check-in/pages/CheckInPage.vue'),
        meta: {
          title: '入住登记',
          menuKey: '/customer/check-in',
        },
      },
      {
        path: 'customer/check-out',
        name: 'customer-check-out',
        component: () => import('../../../modules/customer/check-out/pages/CheckOutPage.vue'),
        meta: {
          title: '退住登记',
          menuKey: '/customer/check-out',
        },
      },
      {
        path: 'customer/outing',
        name: 'customer-outing',
        component: () => import('../../../modules/customer/outing/pages/OutingPage.vue'),
        meta: {
          title: '外出登记',
          menuKey: '/customer/outing',
        },
      },
      {
        path: 'customer/service-target',
        name: 'customer-service-target',
        component: () =>
          import('../../../modules/customer/service-target/pages/ServiceTargetPage.vue'),
        meta: {
          title: '设置服务对象',
          menuKey: '/customer/service-target',
        },
      },
      {
        path: 'customer/service-focus',
        name: 'customer-service-focus',
        component: () =>
          import('../../../modules/customer/service-focus/pages/ServiceFocusPage.vue'),
        meta: {
          title: '服务关注',
          menuKey: '/customer/service-focus',
        },
      },
      {
        path: 'customer/user',
        name: 'customer-user',
        component: () => import('../../../modules/customer/user/pages/UserPage.vue'),
        meta: {
          title: '用户管理',
          menuKey: '/customer/user',
        },
      },
    ],
  },
]
