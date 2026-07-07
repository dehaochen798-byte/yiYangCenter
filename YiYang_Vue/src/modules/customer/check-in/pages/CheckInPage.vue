<template>
  <CrudPageShell
    eyebrow="check in"
    title="入住登记"
    description="为待入住客户分配床位，登记入住时间和备注。提交后客户状态会改为在住，床位自动变为占床。"
    table-title="入住记录"
    :full-width="true"
  >
    <template #table-actions>
      <div class="table-toolbar">
        <el-button type="primary" @click="openCreateDialog">办理入住</el-button>
      </div>
    </template>

    <template #table>
      <el-table :data="checkIns" border>
        <el-table-column label="客户" min-width="120">
          <template #default="{ row }">{{ row.resident?.fullName || '--' }}</template>
        </el-table-column>
        <el-table-column label="床位" min-width="180">
          <template #default="{ row }">
            {{ row.bed?.room?.roomNo || '--' }} / {{ row.bed?.bedNo || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="入住时间" min-width="170">
          <template #default="{ row }">{{ formatDateTime(row.checkInAt) }}</template>
        </el-table-column>
        <el-table-column prop="note" label="备注" min-width="220" show-overflow-tooltip />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="startEdit(row)">编辑</el-button>
            <el-button text type="danger" @click="handleDelete(row)">删除</el-button>
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
        <el-select v-model="form.residentId" class="full-width" filterable :disabled="Boolean(form.id)">
          <el-option
            v-for="resident in availableResidents"
            :key="resident.id"
            :label="`${resident.fullName} / ${resident.phone}`"
            :value="resident.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="分配床位">
        <el-select v-model="form.bedId" class="full-width" filterable>
          <el-option
            v-for="bed in availableBeds"
            :key="bed.id"
            :label="`${bed.room?.roomNo || '--'} / ${bed.bedNo}`"
            :value="bed.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="入住时间">
        <el-date-picker
          v-model="form.checkInAt"
          type="datetime"
          value-format="YYYY-MM-DDTHH:mm:ss"
          class="full-width"
        />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.note" type="textarea" :rows="4" placeholder="可记录押金、合同或入住说明" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="submitForm">
          {{ form.id ? '更新入住登记' : '提交入住登记' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import CrudPageShell from '@/modules/shared/components/CrudPageShell.vue'
import { getBeds, type BedItem } from '@/modules/customer/bed/api'
import {
  createCheckIn,
  deleteCheckIn,
  getCheckIns,
  updateCheckIn,
  type CheckInItem,
} from '@/modules/customer/check-in/api'
import { getResidents, type ResidentItem } from '@/modules/customer/user/api'
import { formatDateTime } from '@/modules/shared/utils/format'
import { validateFieldTypes } from '@/modules/shared/utils/form-validators'

type CheckInForm = {
  id: number | null
  residentId: number | null
  bedId: number | null
  checkInAt: string
  note: string
}

const checkIns = ref<CheckInItem[]>([])
const residents = ref<ResidentItem[]>([])
const beds = ref<BedItem[]>([])
const dialogVisible = ref(false)
const form = reactive<CheckInForm>(createForm())
const dialogTitle = computed(() => (form.id ? '编辑入住登记' : '办理入住'))

const availableResidents = computed(() =>
  residents.value.filter(
    (item) => item.id === form.residentId || (!item.currentBedId && item.status !== 'ACTIVE')
  )
)
const availableBeds = computed(() =>
  beds.value.filter((item) => item.id === form.bedId || item.status === 'VACANT')
)

onMounted(loadData)

function createForm(): CheckInForm {
  return {
    id: null,
    residentId: null,
    bedId: null,
    checkInAt: new Date().toISOString().slice(0, 19),
    note: '',
  }
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

async function loadData() {
  const [checkInRes, residentRes, bedRes] = await Promise.all([
    getCheckIns(),
    getResidents(),
    getBeds(),
  ])
  checkIns.value = checkInRes.data
  residents.value = residentRes.data
  beds.value = bedRes.data
}

function startEdit(row: CheckInItem) {
  Object.assign(form, {
    id: row.id,
    residentId: row.residentId,
    bedId: row.bedId,
    checkInAt: row.checkInAt,
    note: row.note || '',
  })
  dialogVisible.value = true
}

async function handleDelete(row: CheckInItem) {
  try {
    await ElMessageBox.confirm(
      `确定删除「${row.resident?.fullName || '该客户'}」这条入住登记吗？删除后会同步释放床位并将客户恢复为待入住。`,
      '删除入住登记',
      {
        type: 'warning',
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
      }
    )
  } catch {
    return
  }

  await deleteCheckIn(row.id)
  ElMessage.success('入住登记删除成功')
  await loadData()
}

async function submitForm() {
  const valid = validateFieldTypes([
    { label: '客户', type: 'number', value: form.residentId },
    { label: '分配床位', type: 'number', value: form.bedId },
    { label: '入住时间', type: 'datetime', value: form.checkInAt },
    { label: '备注', type: 'string', value: form.note, optional: true },
  ])

  if (!valid) {
    return
  }

  if (form.id) {
    await updateCheckIn(form.id, {
      bedId: form.bedId || undefined,
      checkInAt: form.checkInAt,
      note: form.note,
    })
    ElMessage.success('入住登记更新成功')
  } else {
    await createCheckIn({
      residentId: form.residentId || undefined,
      bedId: form.bedId || undefined,
      checkInAt: form.checkInAt,
      note: form.note,
    })
    ElMessage.success('入住登记成功')
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
