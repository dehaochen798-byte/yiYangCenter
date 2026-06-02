<template>
  <CrudPageShell
    eyebrow="service target"
    title="客户与健康管家关系"
    description="建立客户与服务人员的绑定关系，支持直接绑定员工账号，也保留姓名和手机号字段兼容线下录入场景。"
    table-title="服务对象关系"
    table-description="建议优先选择系统内员工账号，形成更稳定的业务关联。"
    :full-width="true"
  >
    <template #table-actions>
      <div class="table-toolbar">
        <el-button type="primary" @click="openCreateDialog">新建服务对象关系</el-button>
      </div>
    </template>

    <template #table>
      <el-table :data="serviceTargets" border>
        <el-table-column label="客户" min-width="120">
          <template #default="{ row }">{{ row.resident?.fullName || '--' }}</template>
        </el-table-column>
        <el-table-column label="健康管家" min-width="140">
          <template #default="{ row }">{{ row.managerUser?.realName || row.managerName }}</template>
        </el-table-column>
        <el-table-column prop="managerMobile" label="联系电话" min-width="140" />
        <el-table-column label="服务周期" min-width="190">
          <template #default="{ row }">
            {{ formatDate(row.startDate) }} - {{ formatDate(row.endDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="relationNote" label="关系说明" min-width="220" show-overflow-tooltip />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="startEdit(row)">编辑</el-button>
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
    <el-form label-position="top" :model="form" @submit.prevent>
      <el-form-item label="客户">
        <el-select v-model="form.residentId" class="full-width" filterable>
          <el-option
            v-for="resident in residents"
            :key="resident.id"
            :label="`${resident.fullName} / ${resident.phone}`"
            :value="resident.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="系统内健康管家">
        <el-select v-model="form.managerUserId" class="full-width" clearable filterable @change="fillManagerFromUser">
          <el-option
            v-for="user in users"
            :key="user.id"
            :label="`${user.realName} / ${user.roleName || '未设置岗位'}`"
            :value="user.id"
          />
        </el-select>
      </el-form-item>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="健康管家姓名">
            <el-input v-model="form.managerName" placeholder="可手工录入" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系电话">
            <el-input v-model="form.managerMobile" placeholder="请输入手机号" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="开始日期">
            <el-date-picker v-model="form.startDate" type="date" value-format="YYYY-MM-DDT00:00:00" class="full-width" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束日期">
            <el-date-picker v-model="form.endDate" type="date" value-format="YYYY-MM-DDT00:00:00" class="full-width" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="关系说明">
        <el-input v-model="form.relationNote" type="textarea" :rows="4" placeholder="例如 一对一健康随访、康复陪护主责人" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="submitForm">
          {{ form.id ? '更新服务对象关系' : '新建服务对象关系' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import CrudPageShell from '@/modules/shared/components/CrudPageShell.vue'
import {
  createServiceTarget,
  getResidents,
  getServiceTargets,
  getUsers,
  updateServiceTarget,
  type ResidentItem,
  type ServiceTargetItem,
  type UserItem,
} from '@/modules/customer/api/customer.api'
import { formatDate } from '@/modules/shared/utils/format'

type ServiceTargetForm = {
  id: number | null
  residentId: number | null
  managerUserId: number | null
  managerName: string
  managerMobile: string
  startDate: string
  endDate: string
  relationNote: string
}

const serviceTargets = ref<ServiceTargetItem[]>([])
const residents = ref<ResidentItem[]>([])
const users = ref<UserItem[]>([])
const dialogVisible = ref(false)
const form = reactive<ServiceTargetForm>(createForm())
const dialogTitle = computed(() => (form.id ? '编辑服务对象关系' : '新建服务对象关系'))

onMounted(loadData)

function createForm(): ServiceTargetForm {
  return {
    id: null,
    residentId: null,
    managerUserId: null,
    managerName: '',
    managerMobile: '',
    startDate: '',
    endDate: '',
    relationNote: '',
  }
}

async function loadData() {
  const [targetRes, residentRes, userRes] = await Promise.all([
    getServiceTargets(),
    getResidents(),
    getUsers(),
  ])
  serviceTargets.value = targetRes.data
  residents.value = residentRes.data
  users.value = userRes.data.filter((item) => item.status === 'ACTIVE')
}

function resetForm() {
  Object.assign(form, createForm())
}

function openCreateDialog() {
  resetForm()
  dialogVisible.value = true
}

function closeDialog() {
  dialogVisible.value = false
}

function fillManagerFromUser(userId: number | null) {
  const user = users.value.find((item) => item.id === userId)

  if (!user) {
    return
  }

  form.managerName = user.realName
  form.managerMobile = user.mobile
}

function startEdit(row: ServiceTargetItem) {
  Object.assign(form, {
    id: row.id,
    residentId: row.residentId,
    managerUserId: row.managerUserId || null,
    managerName: row.managerName,
    managerMobile: row.managerMobile,
    startDate: row.startDate || '',
    endDate: row.endDate || '',
    relationNote: row.relationNote || '',
  })
  dialogVisible.value = true
}

async function submitForm() {
  const payload = {
    residentId: form.residentId || undefined,
    managerUserId: form.managerUserId || undefined,
    managerName: form.managerName,
    managerMobile: form.managerMobile,
    startDate: form.startDate,
    endDate: form.endDate,
    relationNote: form.relationNote,
  }

  if (form.id) {
    await updateServiceTarget(form.id, payload)
    ElMessage.success('服务对象关系更新成功')
  } else {
    await createServiceTarget(payload)
    ElMessage.success('服务对象关系创建成功')
  }

  closeDialog()
  resetForm()
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
