<template>
  <div class="auth-page">
    <el-button
      class="auth-page__entry"
      plain
      round
      @click="router.push('/auth/js-lab')"
    >
      进入练习页
    </el-button>

    <section class="auth-page__intro">
      <p class="auth-page__eyebrow">YiYang Center</p>
      <h1>颐养中心管理后台</h1>
      <el-space wrap>
        <el-tag>登录注册</el-tag>
        <el-tag>客户管理</el-tag>
        <el-tag>护理模块</el-tag>
      </el-space>
    </section>

    <el-card shadow="never" class="auth-page__card">
      <template #header>
        <div class="auth-page__card-header">
          <div>
            <h2>登录系统</h2>
            <span>使用手机号和密码进入管理台</span>
          </div>
          <el-button link @click="router.push('/auth/register')">前往注册</el-button>
        </div>
      </template>

      <el-form label-position="top" :model="form" @submit.prevent="handleLogin">
        <el-form-item label="手机号码">
          <el-input v-model="form.mobile" placeholder="请输入手机号码" />
        </el-form-item>

        <el-form-item label="登录密码">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="请输入登录密码"
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-button
          type="primary"
          class="auth-page__submit"
          :loading="submitting"
          @click="handleLogin"
        >
          登录
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loginApi } from '../api/auth.api'
import { useAuthStore } from '../store/auth.store'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const submitting = ref(false)

const form = reactive({
  mobile: '13800138000',
  password: '123456',
})

watch(
  () => route.query.mobile,
  (mobile) => {
    if (typeof mobile === 'string' && mobile.trim()) {
      form.mobile = mobile.trim()
      form.password = ''
    }
  },
  {
    immediate: true,
  }
)

function getRedirectPath() {
  const redirect = route.query.redirect
  return typeof redirect === 'string' ? redirect : '/dashboard'
}

function validateForm() {
  if (!form.mobile.trim()) {
    ElMessage.warning('请输入手机号码')
    return false
  }

  if (!form.password.trim()) {
    ElMessage.warning('请输入登录密码')
    return false
  }

  return true
}

async function handleLogin() {
  if (submitting.value || !validateForm()) {
    return
  }

  submitting.value = true

  try {
    const response = await loginApi({
      mobile: form.mobile.trim(),
      password: form.password,
    })

    authStore.setAuth(response.data)
    ElMessage.success(response.message || '登录成功')
    router.push(getRedirectPath())
  } catch (error) {
    const message = error instanceof Error ? error.message : '登录失败'
    ElMessage.error(message)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.auth-page {
  position: relative;
  display: grid;
  grid-template-columns: 1.1fr 440px;
  gap: 24px;
  align-items: center;

  &__entry {
    position: absolute;
    top: -4px;
    left: 0;
    z-index: 2;
  }

  &__intro {
    padding: 40px;
    background: rgb(255 255 255 / 86%);
    border: 1px solid rgb(94 136 113 / 14%);
    border-radius: 28px;
    box-shadow: 0 28px 60px rgb(74 115 94 / 10%);

    h1 {
      margin: 0 0 16px;
      font-size: clamp(36px, 5vw, 52px);
      line-height: 1.1;
      color: #17352f;
    }

    p {
      max-width: 680px;
      margin: 0 0 20px;
      font-size: 16px;
      color: #60786f;
    }
  }

  &__eyebrow {
    margin: 0 0 12px;
    font-size: 13px;
    font-weight: 700;
    color: #5a806e;
    text-transform: uppercase;
    letter-spacing: 0.16em;
  }

  &__card {
    border-radius: 24px;
  }

  &__card-header {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    justify-content: space-between;

    h2 {
      margin: 0 0 6px;
      color: #1d3f37;
    }

    span {
      font-size: 13px;
      color: #748b82;
    }
  }

  &__submit {
    width: 100%;
  }
}

@media (max-width: 960px) {
  .auth-page {
    grid-template-columns: 1fr;

    &__entry {
      position: static;
      justify-self: flex-start;
    }

    &__intro,
    &__card {
      padding: 24px;
    }
  }
}
</style>
