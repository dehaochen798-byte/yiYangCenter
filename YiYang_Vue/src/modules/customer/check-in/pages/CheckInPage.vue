<template>
  <CrudPageShell
    eyebrow="check in"
    title="入住登记"
    description="为待入住客户分配床位，登记入住时间和备注。提交后客户状态会改为在住，床位自动变为占床。"
    table-title="入住记录"
    table-description="仅可选择当前未分配床位的客户与空床，避免重复入住。"
    form-title="办理入住"
    form-description="办理完成后，床位和客户状态会实时联动。"
  >
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
      </el-table>
    </template>

    <template #form>
      <el-form label-position="top" :model="form" @submit.prevent>
        <el-form-item label="客户">
          <el-select v-model="form.residentId" class="full-width" filterable>
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
        <el-button type="primary" class="full-width" @click="submitForm">提交入住登记</el-button>
      </el-form>
    </template>
  </CrudPageShell>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import CrudPageShell from '@/modules/shared/components/CrudPageShell.vue'
import {
  createCheckIn,
  getBeds,
  getCheckIns,
  getResidents,
  type BedItem,
  type CheckInItem,
  type ResidentItem,
} from '@/modules/customer/api/customer.api'
import { formatDateTime } from '@/modules/shared/utils/format'

const checkIns = ref<CheckInItem[]>([])
const residents = ref<ResidentItem[]>([])
const beds = ref<BedItem[]>([])
const form = reactive({
  residentId: null as number | null,
  bedId: null as number | null,
  checkInAt: new Date().toISOString().slice(0, 19),
  note: '',
})

const availableResidents = computed(() =>
  residents.value.filter((item) => !item.currentBedId && item.status !== 'ACTIVE')
)
const availableBeds = computed(() => beds.value.filter((item) => item.status === 'VACANT'))

onMounted(loadData)

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

async function submitForm() {
  await createCheckIn({
    residentId: form.residentId || undefined,
    bedId: form.bedId || undefined,
    checkInAt: form.checkInAt,
    note: form.note,
  })
  ElMessage.success('入住登记成功')
  Object.assign(form, {
    residentId: null,
    bedId: null,
    checkInAt: new Date().toISOString().slice(0, 19),
    note: '',
  })
  await loadData()
}
</script>

<style scoped lang="scss">
.full-width {
  width: 100%;
}
</style>
