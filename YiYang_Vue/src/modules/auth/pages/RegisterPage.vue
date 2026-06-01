<template>
  <div class="register-page">
    <el-card shadow="never" class="register-page__card">
      <template #header>
        <div class="register-page__header">
          <div>
            <h1>用户注册</h1>
            <p>按要求填写手机号、密码、昵称、年龄和性别。</p>
          </div>
          <el-button link @click="router.push('/auth/login')">返回登录</el-button>
        </div>
      </template>

      <el-form label-position="top" :model="form">
        <el-row :gutter="16">
          <el-col :xs="24" :md="12">
            <el-form-item label="手机号码">
              <el-input v-model="form.mobile" placeholder="请输入手机号码" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="12">
            <el-form-item label="登录密码">
              <el-input
                v-model="form.password"
                type="password"
                show-password
                placeholder="请输入登录密码"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :xs="24" :md="12">
            <el-form-item label="昵称">
              <el-input v-model="form.nickName" placeholder="请输入昵称" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="6">
            <el-form-item label="年龄">
              <el-input-number v-model="form.age" :min="18" :max="120" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="6">
            <el-form-item label="性别">
              <el-select v-model="form.gender" placeholder="请选择">
                <el-option label="男" value="MALE" />
                <el-option label="女" value="FEMALE" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-button type="primary" @click="handleRegister">完成注册</el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
  mobile: '',
  password: '',
  nickName: '',
  age: 60,
  gender: 'MALE' as 'MALE' | 'FEMALE',
})

function handleRegister() {
  ElMessage.success('注册表单骨架已就绪，可继续接后端接口')
  router.push('/auth/login')
}
</script>

<style scoped lang="scss">
.register-page {
  display: flex;
  justify-content: center;

  &__card {
    width: min(100%, 920px);
    border-radius: 24px;
  }

  &__header {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    justify-content: space-between;

    h1 {
      margin: 0 0 8px;
      font-size: 28px;
      color: #193a33;
    }

    p {
      margin: 0;
      color: #758c84;
    }
  }
}
</style>
