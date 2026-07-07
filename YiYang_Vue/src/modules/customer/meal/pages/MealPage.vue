<template>
  <CrudPageShell
    eyebrow="meal plan"
    title="客户膳食方案"
    description="为每位客户定制膳食方案，记录忌口、过敏源、营养标签与适用周期。"
    table-title="膳食方案列表"
    :full-width="true"
  >
    <template #table-actions>
      <div class="table-toolbar">
        <el-button v-if="canEdit" type="primary" @click="openCreateDialog">新建膳食方案</el-button>
      </div>
    </template>

    <template #table>
      <el-table :data="mealPlans" border>
        <el-table-column label="客户" min-width="120">
          <template #default="{ row }">{{ row.resident?.fullName || '--' }}</template>
        </el-table-column>
        <el-table-column prop="title" label="方案名称" min-width="160" />
        <el-table-column prop="dietaryRestrictions" label="忌口" min-width="160" />
        <el-table-column prop="allergens" label="过敏源" min-width="160" />
        <el-table-column prop="nutritionTags" label="营养标签" min-width="160" />
        <el-table-column label="适用周期" min-width="190">
          <template #default="{ row }">
            {{ formatDate(row.startDate) }} - {{ formatDate(row.endDate) }}
          </template>
        </el-table-column>
        <el-table-column v-if="canEdit" label="操作" width="160" fixed="right">
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
        <el-select v-model="form.residentId" class="full-width" filterable>
          <el-option
            v-for="resident in residents"
            :key="resident.id"
            :label="`${resident.fullName} / ${resident.phone}`"
            :value="resident.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="方案名称">
        <el-input v-model="form.title" placeholder="例如 糖尿病低糖餐" />
      </el-form-item>
      <el-form-item label="方案说明">
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="说明方案目的和适用条件" />
      </el-form-item>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="忌口">
            <el-input v-model="form.dietaryRestrictions" placeholder="例如 辛辣、生冷" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="过敏源">
            <el-input v-model="form.allergens" placeholder="例如 花生、海鲜" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="营养标签">
        <el-input v-model="form.nutritionTags" placeholder="例如 低盐 / 高蛋白" />
      </el-form-item>
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
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="submitForm">
          {{ form.id ? '更新膳食方案' : '新建膳食方案' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { ROLE_KEYS } from '@/constants/rbac'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import CrudPageShell from '@/modules/shared/components/CrudPageShell.vue'
import {
  createMealPlan,
  deleteMealPlan,
  getMealPlans,
  updateMealPlan,
  type MealPlanItem,
} from '@/modules/customer/meal/api'
import { getResidents, type ResidentItem } from '@/modules/customer/user/api'
import { formatDate } from '@/modules/shared/utils/format'
import { validateFieldTypes } from '@/modules/shared/utils/form-validators'

type MealPlanForm = {
  id: number | null
  residentId: number | null
  title: string
  description: string
  dietaryRestrictions: string
  allergens: string
  nutritionTags: string
  startDate: string
  endDate: string
}

const mealPlans = ref<MealPlanItem[]>([])
const residents = ref<ResidentItem[]>([])
const dialogVisible = ref(false)
const form = reactive<MealPlanForm>(createForm())
const dialogTitle = computed(() => (form.id ? '编辑膳食方案' : '新建膳食方案'))
const authStore = useAuthStore()
const canEdit = computed(
  () =>
    authStore.profile?.roleKey === ROLE_KEYS.ADMIN ||
    authStore.profile?.roleKey === ROLE_KEYS.MEAL_MANAGER
)

onMounted(loadData)

function createForm(): MealPlanForm {
  return {
    id: null,
    residentId: null,
    title: '',
    description: '',
    dietaryRestrictions: '',
    allergens: '',
    nutritionTags: '',
    startDate: '',
    endDate: '',
  }
}

async function loadData() {
  const [planRes, residentRes] = await Promise.all([getMealPlans(), getResidents()])
  mealPlans.value = planRes.data
  residents.value = residentRes.data
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

function startEdit(row: MealPlanItem) {
  Object.assign(form, {
    id: row.id,
    residentId: row.residentId,
    title: row.title,
    description: row.description || '',
    dietaryRestrictions: row.dietaryRestrictions || '',
    allergens: row.allergens || '',
    nutritionTags: row.nutritionTags || '',
    startDate: row.startDate || '',
    endDate: row.endDate || '',
  })
  dialogVisible.value = true
}

async function handleDelete(row: MealPlanItem) {
  try {
    await ElMessageBox.confirm(
      `确定删除「${row.resident?.fullName || '该客户'} / ${row.title}」这条膳食方案吗？`,
      '删除膳食方案',
      {
        type: 'warning',
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
      }
    )
  } catch {
    return
  }

  await deleteMealPlan(row.id)
  ElMessage.success('膳食方案删除成功')
  await loadData()
}

async function submitForm() {
  const valid = validateFieldTypes([
    { label: '客户', type: 'number', value: form.residentId },
    { label: '方案名称', type: 'string', value: form.title },
    { label: '方案说明', type: 'string', value: form.description, optional: true },
    { label: '忌口', type: 'string', value: form.dietaryRestrictions, optional: true },
    { label: '过敏源', type: 'string', value: form.allergens, optional: true },
    { label: '营养标签', type: 'string', value: form.nutritionTags, optional: true },
    { label: '开始日期', type: 'datetime', value: form.startDate, optional: true },
    { label: '结束日期', type: 'datetime', value: form.endDate, optional: true },
  ])

  if (!valid) {
    return
  }

  const payload = {
    residentId: form.residentId || undefined,
    title: form.title,
    description: form.description,
    dietaryRestrictions: form.dietaryRestrictions,
    allergens: form.allergens,
    nutritionTags: form.nutritionTags,
    startDate: form.startDate,
    endDate: form.endDate,
  }

  if (form.id) {
    await updateMealPlan(form.id, payload)
    ElMessage.success('膳食方案更新成功')
  } else {
    await createMealPlan(payload)
    ElMessage.success('膳食方案创建成功')
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
