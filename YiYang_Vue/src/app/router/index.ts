import { createRouter, createWebHistory } from 'vue-router'
import { setupAuthGuard } from '@/app/guards/authGuard'
import { authRoutes } from './modules/auth.routes'
import { customerRoutes } from './modules/customer.routes'
import { nursingRoutes } from './modules/nursing.routes'

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  ...authRoutes,
  ...customerRoutes,
  ...nursingRoutes,
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

setupAuthGuard(router)
