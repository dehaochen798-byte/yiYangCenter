<template>
  <CrudPageShell
    eyebrow="weekly menu"
    title="每周伙食菜单"
    description="维护园区维度的每周菜单，支持周起始日期和每天菜单录入，为膳食公示和后续打印留基础数据。"
    table-title="周菜单列表"
    table-description="当前按一周七天维护，可后续扩展到早餐/午餐/晚餐拆分。"
    :full-width="true"
  >
    <template #table-actions>
      <div class="table-toolbar">
        <el-button type="primary" @click="openCreateDialog">新建周菜单</el-button>
      </div>
    </template>

    <template #table>
      <el-table :data="mealCalendars" border>
        <el-table-column prop="campus" label="园区" min-width="120" />
        <el-table-column prop="weekLabel" label="周标识" min-width="140" />
        <el-table-column label="周起始日期" min-width="130">
          <template #default="{ row }">{{ formatDate(row.weekStartDate) }}</template>
        </el-table-column>
        <el-table-column prop="monday" label="周一" min-width="160" show-overflow-tooltip />
        <el-table-column prop="tuesday" label="周二" min-width="160" show-overflow-tooltip />
        <el-table-column prop="wednesday" label="周三" min-width="160" show-overflow-tooltip />
        <el-table-column prop="thursday" label="周四" min-width="160" show-overflow-tooltip />
        <el-table-column prop="friday" label="周五" min-width="160" show-overflow-tooltip />
        <el-table-column prop="saturday" label="周六" min-width="160" show-overflow-tooltip />
        <el-table-column prop="sunday" label="周日" min-width="160" show-overflow-tooltip />
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
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="园区">
            <el-input v-model="form.campus" placeholder="例如 东区园区" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="周标识">
            <el-input v-model="form.weekLabel" placeholder="例如 2026 年第 23 周" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="周起始日期">
        <el-date-picker v-model="form.weekStartDate" type="date" value-format="YYYY-MM-DDT00:00:00" class="full-width" />
      </el-form-item>
      <el-form-item v-for="day in dayFields" :key="day.key" :label="day.label">
        <el-input v-model="form[day.key]" placeholder="例如 红枣粥 / 清炒西兰花 / 番茄牛腩" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="submitForm">
          {{ form.id ? '更新周菜单' : '新建周菜单' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import CrudPageShell from '@/modules/shared/components/CrudPageShell.vue'
import {
  createMealCalendar,
  getMealCalendars,
  updateMealCalendar,
  type MealCalendarItem,
} from '@/modules/customer/api/customer.api'
import { formatDate } from '@/modules/shared/utils/format'
import { validateFieldTypes } from '@/modules/shared/utils/form-validators'

type DayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

type MealCalendarForm = {
  id: number | null
  campus: string
  weekLabel: string
  weekStartDate: string
} & Record<DayKey, string>

const dayFields: Array<{ key: DayKey; label: string }> = [
  { key: 'monday', label: '周一菜单' },
  { key: 'tuesday', label: '周二菜单' },
  { key: 'wednesday', label: '周三菜单' },
  { key: 'thursday', label: '周四菜单' },
  { key: 'friday', label: '周五菜单' },
  { key: 'saturday', label: '周六菜单' },
  { key: 'sunday', label: '周日菜单' },
]

const mealCalendars = ref<MealCalendarItem[]>([])
const dialogVisible = ref(false)
const form = reactive<MealCalendarForm>(createForm())
const dialogTitle = computed(() => (form.id ? '编辑周菜单' : '新建周菜单'))

onMounted(loadData)

function createForm(): MealCalendarForm {
  return {
    id: null,
    campus: '',
    weekLabel: '',
    weekStartDate: '',
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
    sunday: '',
  }
}

async function loadData() {
  const response = await getMealCalendars()
  mealCalendars.value = response.data
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

function startEdit(row: MealCalendarItem) {
  Object.assign(form, {
    id: row.id,
    campus: row.campus || '',
    weekLabel: row.weekLabel,
    weekStartDate: row.weekStartDate,
    monday: row.monday || '',
    tuesday: row.tuesday || '',
    wednesday: row.wednesday || '',
    thursday: row.thursday || '',
    friday: row.friday || '',
    saturday: row.saturday || '',
    sunday: row.sunday || '',
  })
  dialogVisible.value = true
}

async function submitForm() {
  const valid = validateFieldTypes([
    { label: '园区', type: 'string', value: form.campus, optional: true },
    { label: '周标识', type: 'string', value: form.weekLabel },
    { label: '周起始日期', type: 'datetime', value: form.weekStartDate },
    ...dayFields.map((day) => ({
      label: day.label,
      type: 'string' as const,
      value: form[day.key],
      optional: true,
    })),
  ])

  if (!valid) {
    return
  }

  const payload = {
    campus: form.campus,
    weekLabel: form.weekLabel,
    weekStartDate: form.weekStartDate,
    monday: form.monday,
    tuesday: form.tuesday,
    wednesday: form.wednesday,
    thursday: form.thursday,
    friday: form.friday,
    saturday: form.saturday,
    sunday: form.sunday,
  }

  if (form.id) {
    await updateMealCalendar(form.id, payload)
    ElMessage.success('周菜单更新成功')
  } else {
    await createMealCalendar(payload)
    ElMessage.success('周菜单创建成功')
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
