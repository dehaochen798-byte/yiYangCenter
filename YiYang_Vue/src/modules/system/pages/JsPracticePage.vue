<template>
  <div class="box-button">
    <RouterLink v-for="page in buttons" :key="page.key" :to="page.url" class="buttons">
      {{ page.label }}
    </RouterLink>
  </div>
</template>
<script setup lang="ts">
import { RouterLink } from 'vue-router'

interface buttonItem {
  key: number
  url: string
  label?: string
}
let buttons: buttonItem[] = [
  { key: 1, url: '/auth/text1', label: '进入‘简单事件’' },
  { key: 12, url: '', label: '第一个按钮' },
  { key: 122, url: '', label: '第一个按钮' },
  { key: 1222, url: '', label: '第一个按钮' },
  { key: 12222, url: '', label: '第一个按钮' },
  { key: 122222, url: '', label: '第一个按钮' },
  { key: 11, url: '', label: '第一个按钮' },
  { key: 111, url: '', label: '第一个按钮' },
  { key: 1111, url: '', label: '第一个按钮' },
  { key: 11111, url: '', label: '第一个按钮' },
  { key: 111111, url: '', label: '第一个按钮' },
  { key: 13, url: '', label: '第一个按钮' },
  { key: 1123, url: '', label: '第一个按钮' },
  { key: 1123, url: '', label: '第一个按钮' },
  { key: 11231, url: '', label: '第一个按钮' },
  { key: 123, url: '', label: '第一个按钮' },
  { key: 1123123, url: '', label: '第一个按钮' },
  { key: 1312313, url: '', label: '第一个按钮' },
  { key: 1131, url: '', label: '第一个按钮' },
]
</script>
<style scoped lang="scss">
.box-button {
  display: grid;
  grid-template-rows: repeat(5, 1fr);
  grid-template-columns: repeat(6, 1fr);
  width: 100%;
  height: 80vh;

  .buttons {
    display: flex;
    align-items: center;
    width: 100%;
  }
}
</style>
