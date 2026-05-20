import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useDictStore = defineStore('dict', () => {
  const genders = ref([
    { label: '男', value: '男' },
    { label: '女', value: '女' },
  ])

  return {
    genders,
  }
})
