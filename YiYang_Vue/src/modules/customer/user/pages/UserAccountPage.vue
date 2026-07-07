<template>
  <CrudPageShell
    eyebrow="account admin"
    title="员工账号"
    description="维护系统员工账号、岗位与启停状态，管理员可重置初始密码。"
    table-title="员工账号列表"
    :full-width="true"
  >
    <template #table-actions>
      <div class="table-toolbar">
        <el-button type="primary" @click="openCreateDialog">新建员工账号</el-button>
      </div>
    </template>

    <template #table>
      <el-table :data="users" border>
        <el-table-column prop="realName" label="姓名" min-width="120" />
        <el-table-column prop="mobile" label="手机号" min-width="140" />
        <el-table-column prop="roleName" label="岗位" min-width="120" />
        <el-table-column prop="departmentName" label="部门" min-width="120" />
        <el-table-column label="性别/年龄" min-width="120">
          <template #default="{ row }">
            {{ mapGenderLabel(row.gender) }} / {{ row.age }} 岁
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'">
              {{ row.status === 'ACTIVE' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" min-width="160">
          <template #default="{ row }">{{ formatDateTime(row.updatedAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="startEditUser(row)">编辑</el-button>
            <el-button text type="warning" @click="handleResetPassword(row)">重置密码</el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>
  </CrudPageShell>

  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="680px"
    destroy-on-close
    @closed="resetForm"
  >
    <el-form label-position="top" :model="userForm" @submit.prevent>
      <el-form-item label="姓名">
        <el-input v-model="userForm.realName" placeholder="请输入员工姓名" />
      </el-form-item>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="手机号">
            <el-input v-model="userForm.mobile" placeholder="请输入手机号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="年龄">
            <el-input-number v-model="userForm.age" :min="18" :max="80" class="full-width" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="性别">
            <el-select v-model="userForm.gender" class="full-width">
              <el-option label="男" value="MALE" />
              <el-option label="女" value="FEMALE" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态">
            <el-select v-model="userForm.status" class="full-width">
              <el-option label="启用" value="ACTIVE" />
              <el-option label="停用" value="DISABLED" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="岗位">
            <el-select v-model="userForm.roleName" class="full-width" clearable>
              <el-option label="管理员" value="管理员" />
              <el-option label="护理主管" value="护理主管" />
              <el-option label="护理人员" value="护理人员" />
              <el-option label="前台人员" value="前台人员" />
              <el-option label="膳食管理员" value="膳食管理员" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="部门">
            <el-input v-model="userForm.departmentName" placeholder="例如 护理部" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-alert
        title="新增员工账号默认密码为 123456，忘记密码时可在列表中重置。"
        type="info"
        :closable="false"
        show-icon
      />
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="submitUser">
          {{ userForm.id ? '更新员工账号' : '新建员工账号' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import CrudPageShell from '@/modules/shared/components/CrudPageShell.vue'
import {
  createUser,
  getUsers,
  resetUserPassword,
  updateUser,
  type UserItem,
} from '@/modules/customer/user/api'
import { formatDateTime, mapGenderLabel } from '@/modules/shared/utils/format'
import { validateFieldTypes } from '@/modules/shared/utils/form-validators'

type UserForm = {
  id: number | null
  realName: string
  mobile: string
  age: number
  gender: 'MALE' | 'FEMALE'
  status: 'ACTIVE' | 'DISABLED'
  roleName: string
  departmentName: string
}

const users = ref<UserItem[]>([])
const dialogVisible = ref(false)
const userForm = reactive<UserForm>(createUserForm())
const dialogTitle = computed(() => (userForm.id ? '编辑员工账号' : '新建员工账号'))

onMounted(loadData)

function createUserForm(): UserForm {
  return {
    id: null,
    realName: '',
    mobile: '',
    age: 30,
    gender: 'MALE',
    status: 'ACTIVE',
    roleName: '',
    departmentName: '',
  }
}

async function loadData() {
  const userRes = await getUsers()
  users.value = userRes.data
}

function resetForm() {
  Object.assign(userForm, createUserForm())
}

function openCreateDialog() {
  resetForm()
  dialogVisible.value = true
}

function closeDialog() {
  dialogVisible.value = false
}

function startEditUser(row: UserItem) {
  Object.assign(userForm, {
    id: row.id,
    realName: row.realName,
    mobile: row.mobile,
    age: row.age,
    gender: row.gender,
    status: row.status,
    roleName: row.roleName || '',
    departmentName: row.departmentName || '',
  })
  dialogVisible.value = true
}

async function submitUser() {
  const valid = validateFieldTypes([
    { label: '姓名', type: 'string', value: userForm.realName },
    { label: '手机号', type: 'string', value: userForm.mobile },
    { label: '年龄', type: 'number', value: userForm.age },
    { label: '性别', type: 'string', value: userForm.gender, enumValues: ['MALE', 'FEMALE'] },
    { label: '状态', type: 'string', value: userForm.status, enumValues: ['ACTIVE', 'DISABLED'] },
    { label: '岗位', type: 'string', value: userForm.roleName, optional: true },
    { label: '部门', type: 'string', value: userForm.departmentName, optional: true },
  ])

  if (!valid) {
    return
  }

  const payload = {
    realName: userForm.realName,
    mobile: userForm.mobile,
    age: userForm.age,
    gender: userForm.gender,
    status: userForm.status,
    roleName: userForm.roleName,
    departmentName: userForm.departmentName,
  }

  if (userForm.id) {
    await updateUser(userForm.id, payload)
    ElMessage.success('员工账号更新成功')
  } else {
    await createUser(payload)
    ElMessage.success('员工账号创建成功')
  }

  closeDialog()
  resetForm()
  await loadData()
}

async function handleResetPassword(row: UserItem) {
  try {
    await ElMessageBox.confirm(
      `确定将「${row.realName}」的登录密码重置为 123456 吗？`,
      '重置密码',
      {
        type: 'warning',
        confirmButtonText: '确认重置',
        cancelButtonText: '取消',
      }
    )
  } catch {
    return
  }

  await resetUserPassword(row.id)
  ElMessage.success('密码已重置为 123456')
  await loadData()
}
</script>

<style scoped lang="scss">
.full-width {
  width: 100%;
}

.table-toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
