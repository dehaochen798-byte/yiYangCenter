import { createRouter, createWebHistory } from 'vue-router'
import { authRoutes } from './modules/auth.routes'
import { customerRoutes } from './modules/customer.routes'
import { nursingRoutes } from './modules/nursing.routes'
import { setupAuthGuard } from '../guards/authGuard'

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
