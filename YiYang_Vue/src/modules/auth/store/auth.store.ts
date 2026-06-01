import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { AuthProfile } from '../api/auth.api'

const TOKEN_KEY = 'auth_token'
const PROFILE_KEY = 'auth_profile'

function readProfile() {
  const rawProfile = localStorage.getItem(PROFILE_KEY)

  if (!rawProfile) {
    return null
  }

  try {
    return JSON.parse(rawProfile) as AuthProfile
  } catch {
    localStorage.removeItem(PROFILE_KEY)
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const profile = ref<AuthProfile | null>(readProfile())

  const isLoggedIn = computed(() => Boolean(token.value))

  function setAuth(payload: { token: string; profile: AuthProfile }) {
    token.value = payload.token
    profile.value = payload.profile

    localStorage.setItem(TOKEN_KEY, payload.token)
    localStorage.setItem(PROFILE_KEY, JSON.stringify(payload.profile))
  }

  function logout() {
    token.value = ''
    profile.value = null

    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(PROFILE_KEY)
  }

  return {
    token,
    profile,
    isLoggedIn,
    setAuth,
    logout,
  }
})
