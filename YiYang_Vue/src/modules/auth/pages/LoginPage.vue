<template>
  <div class="auth-page">
    <el-button
      class="auth-page__entry"
      plain
      round
      @click="router.push('/auth/js-lab')"
    >
      进入测试页
    </el-button>

    <section class="auth-page__intro">
      <p class="auth-page__eyebrow">YiYang Center</p>
      <h1>东软颐养中心管理后台</h1>
      <p>
        当前已接入 Vue Router、Pinia、Element Plus、SCSS 及基础规范配置，适合作为正式项目起步模板。
      </p>
      <el-space wrap>
        <el-tag>注册</el-tag>
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

      <el-form label-position="top" :model="form">
        <el-form-item label="手机号码">
          <el-input v-model="form.mobile" placeholder="请输入手机号码" />
        </el-form-item>

        <el-form-item label="登录密码">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="请输入登录密码"
          />
        </el-form-item>

        <el-button type="primary" class="auth-page__submit" @click="handleLogin">
          登录
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth.store'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  mobile: '13800138000',
  password: '123456',
})

function handleLogin() {
  authStore.login({
    mobile: form.mobile,
    realName: '演示用户',
  })

  ElMessage.success('登录成功')
  router.push(route.query.redirect || '/dashboard')
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
