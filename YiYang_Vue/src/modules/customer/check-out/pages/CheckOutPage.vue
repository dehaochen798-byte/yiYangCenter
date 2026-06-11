<template>
  <CrudPageShell
    eyebrow="check out"
    title="退住登记"
    description="为当前在住客户办理退住，记录退住原因和交接说明。提交后系统自动释放床位并更新客户状态。"
    table-title="退住记录"
    table-description="退住后床位立即回到空床池，可继续用于下一位客户入住。"
    :full-width="true"
  >
    <template #table-actions>
      <div class="table-toolbar">
        <el-button type="primary" @click="openCreateDialog">办理退住</el-button>
      </div>
    </template>

    <template #table>
      <el-table :data="checkOuts" border>
        <el-table-column label="客户" min-width="120">
          <template #default="{ row }">{{ row.resident?.fullName || '--' }}</template>
        </el-table-column>
        <el-table-column label="退住床位" min-width="180">
          <template #default="{ row }">
            {{ row.bed?.room?.roomNo || '--' }} / {{ row.bed?.bedNo || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="退住时间" min-width="170">
          <template #default="{ row }">{{ formatDateTime(row.checkOutAt) }}</template>
        </el-table-column>
        <el-table-column prop="reason" label="退住原因" min-width="180" show-overflow-tooltip />
        <el-table-column prop="handoverNote" label="交接说明" min-width="220" show-overflow-tooltip />
      </el-table>
    </template>

  </CrudPageShell>

  <el-dialog
    v-model="dialogVisible"
    title="办理退住"
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
            :label="`${resident.fullName} / ${resident.currentBed?.room?.roomNo || '--'}-${resident.currentBed?.bedNo || '--'}`"
            :value="resident.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="退住时间">
        <el-date-picker
          v-model="form.checkOutAt"
          type="datetime"
          value-format="YYYY-MM-DDTHH:mm:ss"
          class="full-width"
        />
      </el-form-item>
      <el-form-item label="退住原因">
        <el-input v-model="form.reason" placeholder="例如 回家休养 / 转院" />
      </el-form-item>
      <el-form-item label="交接说明">
        <el-input v-model="form.handoverNote" type="textarea" :rows="4" placeholder="填写随身物品、药品、房间检查等交接内容" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="submitForm">提交退住登记</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import CrudPageShell from '@/modules/shared/components/CrudPageShell.vue'
import {
  createCheckOut,
  getCheckOuts,
  type CheckOutItem,
} from '@/modules/customer/check-out/api'
import { getResidents, type ResidentItem } from '@/modules/customer/user/api'
import { formatDateTime } from '@/modules/shared/utils/format'
import { validateFieldTypes } from '@/modules/shared/utils/form-validators'

const checkOuts = ref<CheckOutItem[]>([])
const residents = ref<ResidentItem[]>([])
const dialogVisible = ref(false)
const form = reactive({
  residentId: null as number | null,
  checkOutAt: new Date().toISOString().slice(0, 19),
  reason: '',
  handoverNote: '',
})

const activeResidents = computed(() => residents.value.filter((item) => item.status === 'ACTIVE'))

onMounted(loadData)

function resetForm() {
  Object.assign(form, {
    residentId: null,
    checkOutAt: new Date().toISOString().slice(0, 19),
    reason: '',
    handoverNote: '',
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
  const [checkOutRes, residentRes] = await Promise.all([getCheckOuts(), getResidents()])
  checkOuts.value = checkOutRes.data
  residents.value = residentRes.data
}

async function submitForm() {
  const valid = validateFieldTypes([
    { label: '客户', type: 'number', value: form.residentId },
    { label: '退住时间', type: 'datetime', value: form.checkOutAt },
    { label: '退住原因', type: 'string', value: form.reason, optional: true },
    { label: '交接说明', type: 'string', value: form.handoverNote, optional: true },
  ])

  if (!valid) {
    return
  }

  await createCheckOut({
    residentId: form.residentId || undefined,
    checkOutAt: form.checkOutAt,
    reason: form.reason,
    handoverNote: form.handoverNote,
  })
  ElMessage.success('退住登记成功')
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
