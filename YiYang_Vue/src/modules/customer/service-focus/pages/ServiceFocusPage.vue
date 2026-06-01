<template>
  <CrudPageShell
    eyebrow="service focus"
    title="客户购买服务信息"
    description="记录客户购买或正在享受的服务内容，支持开始结束时间、状态和备注维护。"
    table-title="服务关注列表"
    table-description="适合登记康复护理、专项陪护、营养管理等有周期的服务。"
    form-title="服务信息维护"
    form-description="可用于后续扩展续费提醒、到期提醒和套餐管理。"
  >
    <template #table>
      <el-table :data="serviceFocuses" border>
        <el-table-column label="客户" min-width="120">
          <template #default="{ row }">{{ row.resident?.fullName || '--' }}</template>
        </el-table-column>
        <el-table-column prop="serviceName" label="服务名称" min-width="160" />
        <el-table-column label="服务周期" min-width="190">
          <template #default="{ row }">
            {{ formatDate(row.serviceStartAt) }} - {{ formatDate(row.serviceEndAt) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="statusTypeMap[row.status as keyof typeof statusTypeMap]">
              {{ statusLabelMap[row.status as keyof typeof statusLabelMap] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="detail" label="服务说明" min-width="240" show-overflow-tooltip />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="startEdit(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>

    <template #form-actions>
      <el-button text @click="resetForm">重置</el-button>
    </template>

    <template #form>
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
        <el-form-item label="服务名称">
          <el-input v-model="form.serviceName" placeholder="例如 专项康复护理包" />
        </el-form-item>
        <el-form-item label="服务说明">
          <el-input v-model="form.detail" type="textarea" :rows="4" placeholder="记录服务内容、次数或关键承诺" />
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="开始日期">
              <el-date-picker v-model="form.serviceStartAt" type="date" value-format="YYYY-MM-DDT00:00:00" class="full-width" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束日期">
              <el-date-picker v-model="form.serviceEndAt" type="date" value-format="YYYY-MM-DDT00:00:00" class="full-width" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="状态">
          <el-select v-model="form.status" class="full-width">
            <el-option label="进行中" value="ACTIVE" />
            <el-option label="暂停" value="PAUSED" />
            <el-option label="结束" value="ENDED" />
          </el-select>
        </el-form-item>
        <el-button type="primary" class="full-width" @click="submitForm">
          {{ form.id ? '更新服务信息' : '新建服务信息' }}
        </el-button>
      </el-form>
    </template>
  </CrudPageShell>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import CrudPageShell from '@/modules/shared/components/CrudPageShell.vue'
import {
  createServiceFocus,
  getResidents,
  getServiceFocuses,
  updateServiceFocus,
  type ResidentItem,
  type ServiceFocusItem,
} from '@/modules/customer/api/customer.api'
import { formatDate } from '@/modules/shared/utils/format'

type ServiceFocusForm = {
  id: number | null
  residentId: number | null
  serviceName: string
  detail: string
  serviceStartAt: string
  serviceEndAt: string
  status: 'ACTIVE' | 'PAUSED' | 'ENDED'
}

const statusLabelMap = {
  ACTIVE: '进行中',
  PAUSED: '暂停',
  ENDED: '结束',
}

const statusTypeMap = {
  ACTIVE: 'success',
  PAUSED: 'warning',
  ENDED: 'info',
} as const

const serviceFocuses = ref<ServiceFocusItem[]>([])
const residents = ref<ResidentItem[]>([])
const form = reactive<ServiceFocusForm>(createForm())

onMounted(loadData)

function createForm(): ServiceFocusForm {
  return {
    id: null,
    residentId: null,
    serviceName: '',
    detail: '',
    serviceStartAt: '',
    serviceEndAt: '',
    status: 'ACTIVE',
  }
}

async function loadData() {
  const [focusRes, residentRes] = await Promise.all([getServiceFocuses(), getResidents()])
  serviceFocuses.value = focusRes.data
  residents.value = residentRes.data
}

function resetForm() {
  Object.assign(form, createForm())
}

function startEdit(row: ServiceFocusItem) {
  Object.assign(form, {
    id: row.id,
    residentId: row.residentId,
    serviceName: row.serviceName,
    detail: row.detail || '',
    serviceStartAt: row.serviceStartAt || '',
    serviceEndAt: row.serviceEndAt || '',
    status: row.status,
  })
}

async function submitForm() {
  const payload = {
    residentId: form.residentId || undefined,
    serviceName: form.serviceName,
    detail: form.detail,
    serviceStartAt: form.serviceStartAt,
    serviceEndAt: form.serviceEndAt,
    status: form.status,
  }

  if (form.id) {
    await updateServiceFocus(form.id, payload)
    ElMessage.success('服务信息更新成功')
  } else {
    await createServiceFocus(payload)
    ElMessage.success('服务信息创建成功')
  }

  resetForm()
  await loadData()
}
</script>

<style scoped lang="scss">
.full-width {
  width: 100%;
}
</style>
