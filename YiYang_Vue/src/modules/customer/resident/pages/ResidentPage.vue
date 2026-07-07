<template>
  <CrudPageShell
    eyebrow="resident archive"
    title="客户档案"
    description="维护老人基础档案，为入住、护理、膳食和服务信息提供主数据基础。"
    table-title="客户档案列表"
    :full-width="true"
  >
    <template #table-actions>
      <div class="table-toolbar">
        <el-button v-if="canEdit" type="primary" @click="openCreateDialog">新建客户档案</el-button>
      </div>
    </template>

    <template #table>
      <el-table :data="residents" border>
        <el-table-column prop="fullName" label="客户姓名" min-width="120" />
        <el-table-column prop="phone" label="手机号" min-width="140" />
        <el-table-column label="性别/年龄" min-width="120">
          <template #default="{ row }">
            {{ mapGenderLabel(row.gender) }} / {{ row.age }} 岁
          </template>
        </el-table-column>
        <el-table-column label="当前状态" min-width="120">
          <template #default="{ row }">
            <el-tag :type="residentStatusTagMap[row.status as keyof typeof residentStatusTagMap]">
              {{ residentStatusLabelMap[row.status as keyof typeof residentStatusLabelMap] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="床位" min-width="140">
          <template #default="{ row }">
            {{ row.currentBed?.room?.roomNo || '--' }} / {{ row.currentBed?.bedNo || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="护理级别" min-width="120">
          <template #default="{ row }">{{ row.careLevel?.name || '--' }}</template>
        </el-table-column>
        <el-table-column label="更新时间" min-width="160">
          <template #default="{ row }">{{ formatDateTime(row.updatedAt) }}</template>
        </el-table-column>
        <el-table-column v-if="canEdit" label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="startEditResident(row)">编辑</el-button>
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
    <el-form label-position="top" :model="residentForm" @submit.prevent>
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
            <el-input-number v-model="residentForm.age" :min="1" :max="120" class="full-width" />
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
        <el-input v-model="residentForm.note" type="textarea" :rows="4" placeholder="可记录病史、偏好等信息" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="submitResident">
          {{ residentForm.id ? '更新客户档案' : '新建客户档案' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import CrudPageShell from '@/modules/shared/components/CrudPageShell.vue'
import {
  createResident,
  getResidents,
  updateResident,
  type ResidentItem,
} from '@/modules/customer/user/api'
import type { ResidenceStatus } from '@/modules/customer/api/shared.types'
import { getCareLevels, type CareLevelItem } from '@/modules/nursing/api/nursing.api'
import { formatDateTime, mapGenderLabel } from '@/modules/shared/utils/format'
import { validateFieldTypes } from '@/modules/shared/utils/form-validators'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { ROLE_KEYS } from '@/constants/rbac'

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

const authStore = useAuthStore()
const canEdit = computed(() => authStore.profile?.roleKey === ROLE_KEYS.ADMIN)
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
const residents = ref<ResidentItem[]>([])
const careLevels = ref<CareLevelItem[]>([])
const dialogVisible = ref(false)
const residentForm = reactive<ResidentForm>(createResidentForm())
const dialogTitle = computed(() => (residentForm.id ? '编辑客户档案' : '新建客户档案'))

onMounted(loadData)

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

async function loadData() {
  const [residentRes, levelRes] = await Promise.all([getResidents(), getCareLevels()])
  residents.value = residentRes.data
  careLevels.value = levelRes.data
}

function resetForm() {
  Object.assign(residentForm, createResidentForm())
}

function openCreateDialog() {
  resetForm()
  dialogVisible.value = true
}

function closeDialog() {
  dialogVisible.value = false
}

function startEditResident(row: ResidentItem) {
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

async function submitResident() {
  const valid = validateFieldTypes([
    { label: '客户姓名', type: 'string', value: residentForm.fullName },
    { label: '手机号', type: 'string', value: residentForm.phone },
    { label: '身份证号', type: 'string', value: residentForm.idCard, optional: true },
    { label: '年龄', type: 'number', value: residentForm.age },
    { label: '性别', type: 'string', value: residentForm.gender, enumValues: ['MALE', 'FEMALE'] },
    { label: '紧急联系人', type: 'string', value: residentForm.emergencyContactName, optional: true },
    { label: '联系人电话', type: 'string', value: residentForm.emergencyContactPhone, optional: true },
    { label: '默认护理级别', type: 'number', value: residentForm.careLevelId, optional: true },
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
