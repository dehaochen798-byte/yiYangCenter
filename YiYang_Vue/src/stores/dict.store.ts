import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface DictOption {
  label: string
  value: string
}

export const useDictStore = defineStore('dict', () => {
  const genders = ref<DictOption[]>([
    { label: '男', value: 'MALE' },
    { label: '女', value: 'FEMALE' },
  ])

  return {
    genders,
  }
})
