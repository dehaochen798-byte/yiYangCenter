<template>
  <CrudPageShell
    eyebrow="outing"
    title="外出登记"
    description="登记在住客户的外出与归院情况，支持预计归院时间、去向和原因维护。"
    table-title="外出记录"
    :full-width="true"
  >
    <template #table-actions>
      <div class="table-toolbar">
        <el-button type="primary" @click="openCreateDialog">新增外出</el-button>
      </div>
    </template>

    <template #table>
      <el-table :data="outings" border>
        <el-table-column label="客户" min-width="120">
          <template #default="{ row }">{{ row.resident?.fullName || '--' }}</template>
        </el-table-column>
        <el-table-column label="外出时间" min-width="170">
          <template #default="{ row }">{{ formatDateTime(row.startAt) }}</template>
        </el-table-column>
        <el-table-column label="预计归院" min-width="170">
          <template #default="{ row }">{{ formatDateTime(row.expectedReturnAt) }}</template>
        </el-table-column>
        <el-table-column label="实际归院" min-width="170">
          <template #default="{ row }">{{ formatDateTime(row.actualReturnAt) }}</template>
        </el-table-column>
        <el-table-column prop="destination" label="去向" min-width="160" />
        <el-table-column prop="reason" label="原因" min-width="160" />
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'RETURNED' ? 'success' : 'warning'">
              {{ row.status === 'RETURNED' ? '已归院' : '外出中' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              text
              type="primary"
              :disabled="row.status === 'RETURNED'"
              @click="markReturned(row.id)"
            >
              归院登记
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>

  </CrudPageShell>

  <el-dialog
    v-model="dialogVisible"
    title="新增外出"
    width="680px"
    destroy-on-close
    @closed="resetForm"
  >
    <el-form label-position="top" :model="form" @submit.prevent>
      <el-form-item label="客户">
        <el-select v-model="form.residentId" class="full-width" filterable>
          <el-option
            v-for="resident in activeResidents"
            :key="resident.id"
            :label="`${resident.fullName} / ${resident.phone}`"
            :value="resident.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="外出时间">
        <el-date-picker
          v-model="form.startAt"
          type="datetime"
          value-format="YYYY-MM-DDTHH:mm:ss"
          class="full-width"
        />
      </el-form-item>
      <el-form-item label="预计归院时间">
        <el-date-picker
          v-model="form.expectedReturnAt"
          type="datetime"
          value-format="YYYY-MM-DDTHH:mm:ss"
          class="full-width"
        />
      </el-form-item>
      <el-form-item label="去向">
        <el-input v-model="form.destination" placeholder="例如 医院 / 家属家中" />
      </el-form-item>
      <el-form-item label="外出原因">
        <el-input v-model="form.reason" placeholder="例如 复诊 / 探亲" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="submitForm">提交外出登记</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import CrudPageShell from '@/modules/shared/components/CrudPageShell.vue'
import {
  createOuting,
  getOutings,
  returnOuting,
  type OutingItem,
} from '@/modules/customer/outing/api'
import { getResidents, type ResidentItem } from '@/modules/customer/user/api'
import { formatDateTime } from '@/modules/shared/utils/format'
import { validateFieldTypes } from '@/modules/shared/utils/form-validators'

const outings = ref<OutingItem[]>([])
const residents = ref<ResidentItem[]>([])
const dialogVisible = ref(false)
const form = reactive({
  residentId: null as number | null,
  startAt: new Date().toISOString().slice(0, 19),
  expectedReturnAt: '',
  destination: '',
  reason: '',
})

const activeResidents = computed(() => residents.value.filter((item) => item.status === 'ACTIVE'))

onMounted(loadData)

function resetForm() {
  Object.assign(form, {
    residentId: null,
    startAt: new Date().toISOString().slice(0, 19),
    expectedReturnAt: '',
    destination: '',
    reason: '',
  })
}

function openCreateDialog() {
  resetForm()
  dialogVisible.value = true
}

function closeDialog() {
  dialogVisible.value = false
}

async function loadData() {
  const [outingRes, residentRes] = await Promise.all([getOutings(), getResidents()])
  outings.value = outingRes.data
  residents.value = residentRes.data
}

async function submitForm() {
  const valid = validateFieldTypes([
    { label: '客户', type: 'number', value: form.residentId },
    { label: '外出时间', type: 'datetime', value: form.startAt },
    { label: '预计归院时间', type: 'datetime', value: form.expectedReturnAt, optional: true },
    { label: '去向', type: 'string', value: form.destination, optional: true },
    { label: '外出原因', type: 'string', value: form.reason, optional: true },
  ])

  if (!valid) {
    return
  }

  await createOuting({
    residentId: form.residentId || undefined,
    startAt: form.startAt,
    expectedReturnAt: form.expectedReturnAt,
    destination: form.destination,
    reason: form.reason,
  })
  ElMessage.success('外出登记成功')
  closeDialog()
  resetForm()
  await loadData()
}

async function markReturned(id: number) {
  await returnOuting(id, {
    actualReturnAt: new Date().toISOString().slice(0, 19),
  })
  ElMessage.success('归院登记成功')
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
