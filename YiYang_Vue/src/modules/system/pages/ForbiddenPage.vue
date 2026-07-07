<template>
  <section class="forbidden-page">
    <el-card shadow="never" class="forbidden-page__card">
      <p class="forbidden-page__eyebrow">403</p>
      <h1>当前账号无权访问此页面</h1>
      <p>请切换有权限的角色账号，或返回你当前可用的工作区域。</p>
      <div class="forbidden-page__actions">
        <el-button type="primary" @click="router.push('/dashboard')">返回工作台</el-button>
        <el-button @click="router.back()">返回上一页</el-button>
      </div>
    </el-card>
  </section>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped lang="scss">
.forbidden-page {
  display: grid;
  place-items: center;
  min-height: 60vh;

  &__card {
    width: min(560px, 100%);
    text-align: center;
    border-radius: 24px;
  }

  &__eyebrow {
    margin: 0 0 12px;
    font-size: 14px;
    font-weight: 700;
    color: #7b8f86;
    letter-spacing: 0.16em;
  }

  h1 {
    margin: 0 0 12px;
    color: #16362f;
  }

  p {
    margin: 0;
    line-height: 1.7;
    color: #6b8178;
  }

  &__actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 24px;
  }
}
</style>
