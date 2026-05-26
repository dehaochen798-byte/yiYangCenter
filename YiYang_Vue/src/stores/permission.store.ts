import { ref } from 'vue'
import { defineStore } from 'pinia'

export const usePermissionStore = defineStore('permission', () => {
  const permissions = ref<string[]>([])

  return {
    permissions,
  }
})
