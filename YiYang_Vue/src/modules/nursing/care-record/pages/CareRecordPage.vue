<template>
  <CrudPageShell
    eyebrow="nursing record"
    title="护理记录录入"
    description="记录护理项目、执行人和执行时间，形成护理闭环。数据直接关联客户、护理内容和员工账号。"
    table-title="护理执行记录"
    table-description="适合日常补录或柜台录入，后续可继续扩展移动端打卡。"
    :full-width="true"
  >
    <template #table-actions>
      <div class="table-toolbar">
        <el-button type="primary" @click="openCreateDialog">新建护理记录</el-button>
      </div>
    </template>

    <template #table>
      <el-table :data="careRecords" border>
        <el-table-column label="客户" min-width="120">
          <template #default="{ row }">
            {{ row.resident?.fullName || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="护理项目" min-width="180">
          <template #default="{ row }">
            {{ row.careItem?.name || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="护理级别" min-width="140">
          <template #default="{ row }">
            {{ row.careItem?.careLevel?.name || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="执行人" min-width="120">
          <template #default="{ row }">
            {{ row.operator?.realName || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="执行时间" min-width="170">
          <template #default="{ row }">
            {{ formatDateTime(row.executedAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="note" label="备注" min-width="220" show-overflow-tooltip />
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
      <el-form-item label="护理项目">
        <el-select v-model="form.careItemId" class="full-width" filterable>
          <el-option
            v-for="item in careItems"
            :key="item.id"
            :label="`${item.name} / ${item.careLevel?.name || '未分级'}`"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="执行人">
        <el-select v-model="form.operatorId" class="full-width" filterable>
          <el-option
            v-for="user in users"
            :key="user.id"
            :label="`${user.realName} / ${user.roleName || '未设置岗位'}`"
            :value="user.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="执行时间">
        <el-date-picker
          v-model="form.executedAt"
          type="datetime"
          value-format="YYYY-MM-DDTHH:mm:ss"
          class="full-width"
        />
      </el-form-item>
      <el-form-item label="执行备注">
        <el-input v-model="form.note" type="textarea" :rows="4" placeholder="记录客户状态、异常情况或补充说明" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="submitForm">
          {{ form.id ? '更新护理记录' : '新增护理记录' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { getResidents, getUsers, type ResidentItem, type UserItem } from '@/modules/customer/api/customer.api'
import {
  createCareRecord,
  getCareItems,
  getCareRecords,
  updateCareRecord,
  type CareItemItem,
  type CareRecordItem,
} from '@/modules/nursing/api/nursing.api'
import CrudPageShell from '@/modules/shared/components/CrudPageShell.vue'
import { formatDateTime } from '@/modules/shared/utils/format'

type CareRecordForm = {
  id: number | null
  residentId: number | null
  careItemId: number | null
  operatorId: number | null
  executedAt: string
  note: string
}

const careRecords = ref<CareRecordItem[]>([])
const residents = ref<ResidentItem[]>([])
const careItems = ref<CareItemItem[]>([])
const users = ref<UserItem[]>([])
const dialogVisible = ref(false)
const form = reactive<CareRecordForm>(createForm())
const dialogTitle = computed(() => (form.id ? '编辑护理记录' : '新建护理记录'))

onMounted(loadData)

function createForm(): CareRecordForm {
  return {
    id: null,
    residentId: null,
    careItemId: null,
    operatorId: null,
    executedAt: new Date().toISOString().slice(0, 19),
    note: '',
  }
}

async function loadData() {
  const [recordsRes, residentsRes, itemsRes, usersRes] = await Promise.all([
    getCareRecords(),
    getResidents(),
    getCareItems(),
    getUsers(),
  ])

  careRecords.value = recordsRes.data
  residents.value = residentsRes.data
  careItems.value = itemsRes.data
  users.value = usersRes.data.filter((item) => item.status === 'ACTIVE')
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

function startEdit(row: CareRecordItem) {
  Object.assign(form, {
    id: row.id,
    residentId: row.residentId,
    careItemId: row.careItemId,
    operatorId: row.operatorId,
    executedAt: row.executedAt.slice(0, 19),
    note: row.note || '',
  })
  dialogVisible.value = true
}

async function submitForm() {
  const payload = {
    residentId: form.residentId || undefined,
    careItemId: form.careItemId || undefined,
    operatorId: form.operatorId || undefined,
    executedAt: form.executedAt,
    note: form.note,
  }

  if (form.id) {
    await updateCareRecord(form.id, payload)
    ElMessage.success('护理记录更新成功')
  } else {
    await createCareRecord(payload)
    ElMessage.success('护理记录创建成功')
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
