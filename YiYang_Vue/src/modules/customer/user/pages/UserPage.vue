<template>
  <CrudPageShell
    eyebrow="customer archive"
    title="用户与客户档案"
    description="统一维护员工账号和养老客户档案。客户档案是入住、膳食、护理记录的基础主数据，员工账号则用于健康管家和护理执行人的绑定。"
    table-title="当前档案列表"
    :full-width="true"
  >
    <template #table-actions>
      <div class="table-toolbar">
        <el-segmented
          v-model="activeTab"
          :options="tabOptions"
          @change="handleTabChange"
        />
        <el-button type="primary" @click="openCreateDialog">
          新建{{ activeTab === 'resident' ? '客户档案' : '员工账号' }}
        </el-button>
      </div>
    </template>

    <template #table>
      <el-table v-if="activeTab === 'resident'" :data="residents" border>
        <el-table-column prop="fullName" label="客户姓名" min-width="120" />
        <el-table-column prop="phone" label="手机号" min-width="140" />
        <el-table-column label="性别/年龄" min-width="120">
          <template #default="{ row }">
            {{ mapGenderLabel(row.gender) }} / {{ row.age }} 岁
          </template>
        </el-table-column>
        <el-table-column label="当前状态" min-width="120">
          <template #default="{ row }">
            <el-tag
              :type="
                residentStatusTagMap[row.status as keyof typeof residentStatusTagMap]
              "
            >
              {{
                residentStatusLabelMap[row.status as keyof typeof residentStatusLabelMap]
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="床位" min-width="140">
          <template #default="{ row }">
            {{ row.currentBed?.room?.roomNo || '--' }} /
            {{ row.currentBed?.bedNo || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="护理级别" min-width="120">
          <template #default="{ row }">
            {{ row.careLevel?.name || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" min-width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="startEditResident(row)"
              >编辑</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <el-table v-else :data="users" border>
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
          <template #default="{ row }">
            {{ formatDateTime(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="startEditUser(row)">编辑</el-button>
            <el-button text type="warning" @click="handleResetPassword(row)">
              重置密码
            </el-button>
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
    @closed="resetCurrentForm"
  >
    <el-form
      v-if="activeTab === 'resident'"
      label-position="top"
      :model="residentForm"
      @submit.prevent
    >
      <el-form-item label="客户姓名">
        <el-input v-model="residentForm.fullName" placeholder="请输入客户姓名" />
      </el-form-item>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="手机号">
            <el-input v-model="residentForm.phone" placeholder="请输入手机号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="身份证号">
            <el-input v-model="residentForm.idCard" placeholder="可选" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="年龄">
            <el-input-number
              v-model="residentForm.age"
              :min="1"
              :max="120"
              class="full-width"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="性别">
            <el-select v-model="residentForm.gender" class="full-width">
              <el-option label="男" value="MALE" />
              <el-option label="女" value="FEMALE" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="紧急联系人">
            <el-input v-model="residentForm.emergencyContactName" placeholder="可选" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系人电话">
            <el-input v-model="residentForm.emergencyContactPhone" placeholder="可选" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="默认护理级别">
        <el-select v-model="residentForm.careLevelId" clearable class="full-width">
          <el-option
            v-for="item in careLevels"
            :key="item.id"
            :label="`${item.code} / ${item.name}`"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model="residentForm.note"
          type="textarea"
          :rows="4"
          placeholder="可记录病史、偏好等信息"
        />
      </el-form-item>
    </el-form>

    <el-form v-else label-position="top" :model="userForm" @submit.prevent>
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
            <el-input-number
              v-model="userForm.age"
              :min="18"
              :max="80"
              class="full-width"
            />
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
            <el-input v-model="userForm.roleName" placeholder="例如 护理员 / 健康管家" />
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
        <el-button v-if="activeTab === 'resident'" type="primary" @click="submitResident">
          {{ residentForm.id ? '更新客户档案' : '新建客户档案' }}
        </el-button>
        <el-button v-else type="primary" @click="submitUser">
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
  createResident,
  createUser,
  getResidents,
  getUsers,
  resetUserPassword,
  updateResident,
  updateUser,
  type ResidentItem,
  type UserItem,
} from '@/modules/customer/user/api'
import type { ResidenceStatus } from '@/modules/customer/api/shared.types'
import { getCareLevels, type CareLevelItem } from '@/modules/nursing/api/nursing.api'
import { formatDateTime, mapGenderLabel } from '@/modules/shared/utils/format'
import { validateFieldTypes } from '@/modules/shared/utils/form-validators'

type ResidentForm = {
  id: number | null
  fullName: string
  phone: string
  idCard: string
  age: number
  gender: 'MALE' | 'FEMALE'
  emergencyContactName: string
  emergencyContactPhone: string
  careLevelId: number | null
  note: string
}

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

const tabOptions = [
  { label: '客户档案', value: 'resident' },
  { label: '员工账号', value: 'user' },
]

const residentStatusLabelMap: Record<ResidenceStatus, string> = {
  PENDING: '待入住',
  ACTIVE: '在住',
  CHECKED_OUT: '已退住',
}

const residentStatusTagMap: Record<ResidenceStatus, 'warning' | 'success' | 'info'> = {
  PENDING: 'warning',
  ACTIVE: 'success',
  CHECKED_OUT: 'info',
}

const activeTab = ref<'resident' | 'user'>('resident')
const residents = ref<ResidentItem[]>([])
const users = ref<UserItem[]>([])
const careLevels = ref<CareLevelItem[]>([])
const dialogVisible = ref(false)
const residentForm = reactive<ResidentForm>(createResidentForm())
const userForm = reactive<UserForm>(createUserForm())
const dialogTitle = computed(() => {
  if (activeTab.value === 'resident') {
    return residentForm.id ? '编辑客户档案' : '新建客户档案'
  }

  return userForm.id ? '编辑员工账号' : '新建员工账号'
})

onMounted(() => {
  loadData()
})

function handleTabChange() {
  closeDialog()
  resetCurrentForm()
}

async function loadData() {
  const [residentRes, userRes, levelRes] = await Promise.all([
    getResidents(),
    getUsers(),
    getCareLevels(),
  ])

  residents.value = residentRes.data
  users.value = userRes.data
  careLevels.value = levelRes.data
}

function createResidentForm(): ResidentForm {
  return {
    id: null,
    fullName: '',
    phone: '',
    idCard: '',
    age: 70,
    gender: 'MALE',
    emergencyContactName: '',
    emergencyContactPhone: '',
    careLevelId: null,
    note: '',
  }
}

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

function resetCurrentForm() {
  if (activeTab.value === 'resident') {
    Object.assign(residentForm, createResidentForm())
    return
  }

  Object.assign(userForm, createUserForm())
}

function openCreateDialog() {
  resetCurrentForm()
  dialogVisible.value = true
}

function closeDialog() {
  dialogVisible.value = false
}

function startEditResident(row: ResidentItem) {
  activeTab.value = 'resident'
  Object.assign(residentForm, {
    id: row.id,
    fullName: row.fullName,
    phone: row.phone,
    idCard: row.idCard || '',
    age: row.age,
    gender: row.gender,
    emergencyContactName: row.emergencyContactName || '',
    emergencyContactPhone: row.emergencyContactPhone || '',
    careLevelId: row.careLevelId || null,
    note: row.note || '',
  })
  dialogVisible.value = true
}

function startEditUser(row: UserItem) {
  activeTab.value = 'user'
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

async function submitResident() {
  const valid = validateFieldTypes([
    { label: '客户姓名', type: 'string', value: residentForm.fullName },
    { label: '手机号', type: 'string', value: residentForm.phone },
    { label: '身份证号', type: 'string', value: residentForm.idCard, optional: true },
    { label: '年龄', type: 'number', value: residentForm.age },
    {
      label: '性别',
      type: 'string',
      value: residentForm.gender,
      enumValues: ['MALE', 'FEMALE'],
    },
    {
      label: '紧急联系人',
      type: 'string',
      value: residentForm.emergencyContactName,
      optional: true,
    },
    {
      label: '联系人电话',
      type: 'string',
      value: residentForm.emergencyContactPhone,
      optional: true,
    },
    {
      label: '默认护理级别',
      type: 'number',
      value: residentForm.careLevelId,
      optional: true,
    },
    { label: '备注', type: 'string', value: residentForm.note, optional: true },
  ])

  if (!valid) {
    return
  }

  const payload = {
    fullName: residentForm.fullName,
    phone: residentForm.phone,
    idCard: residentForm.idCard,
    age: residentForm.age,
    gender: residentForm.gender,
    emergencyContactName: residentForm.emergencyContactName,
    emergencyContactPhone: residentForm.emergencyContactPhone,
    careLevelId: residentForm.careLevelId,
    note: residentForm.note,
  }

  if (residentForm.id) {
    await updateResident(residentForm.id, payload)
    ElMessage.success('客户档案更新成功')
  } else {
    await createResident(payload)
    ElMessage.success('客户档案创建成功')
  }

  closeDialog()
  resetCurrentForm()
  await loadData()
}

async function submitUser() {
  const valid = validateFieldTypes([
    { label: '姓名', type: 'string', value: userForm.realName },
    { label: '手机号', type: 'string', value: userForm.mobile },
    { label: '年龄', type: 'number', value: userForm.age },
    {
      label: '性别',
      type: 'string',
      value: userForm.gender,
      enumValues: ['MALE', 'FEMALE'],
    },
    {
      label: '状态',
      type: 'string',
      value: userForm.status,
      enumValues: ['ACTIVE', 'DISABLED'],
    },
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
  resetCurrentForm()
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

@media (max-width: 768px) {
  .table-toolbar {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }
}
</style>
