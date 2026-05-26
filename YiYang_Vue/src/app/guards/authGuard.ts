import type { Router } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/auth.store'

export function setupAuthGuard(router: Router) {
  router.beforeEach((to) => {
    const authStore = useAuthStore()
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

    if (requiresAuth && !authStore.isLoggedIn) {
      return {
        path: '/auth/login',
        query: {
          redirect: to.fullPath,
        },
      }
    }

    if (
      authStore.isLoggedIn &&
      (to.path === '/auth/login' || to.path === '/auth/register')
    ) {
      return '/dashboard'
    }

    return true
  })
}
