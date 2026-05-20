import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const token = ref('')
  const profile = ref(null)

  const isLoggedIn = computed(() => Boolean(token.value))

  function login(payload) {
    token.value = 'demo-token'
    profile.value = {
      realName: payload.realName || '演示用户',
      mobile: payload.mobile,
    }
  }

  function logout() {
    token.value = ''
    profile.value = null
  }

  return {
    token,
    profile,
    isLoggedIn,
    login,
    logout,
  }
})
