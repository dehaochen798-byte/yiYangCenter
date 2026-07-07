<template>
  <CrudPageShell
    eyebrow="nursing item"
    title="护理内容配置"
    description="将护理内容挂到护理级别之下，配置频次、标准时长和执行说明，方便护理记录快速录入。"
    table-title="护理内容列表"
    :full-width="true"
  >
    <template #table-actions>
      <div class="table-toolbar">
        <el-button v-if="canEdit" type="primary" @click="openCreateDialog">新建护理内容</el-button>
      </div>
    </template>

    <template #table>
      <el-table :data="careItems" border>
        <el-table-column label="所属级别" min-width="140">
          <template #default="{ row }">
            {{ row.careLevel?.name || '--' }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="护理内容" min-width="140" />
        <el-table-column prop="frequency" label="频次" min-width="110" />
        <el-table-column label="标准时长" min-width="110">
          <template #default="{ row }">
            {{ row.durationMinutes ? `${row.durationMinutes} 分钟` : '--' }}
          </template>
        </el-table-column>
        <el-table-column prop="instructions" label="执行说明" min-width="220" show-overflow-tooltip />
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'">
              {{ row.isActive ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="记录数" min-width="90">
          <template #default="{ row }">
            {{ row._count?.records || 0 }}
          </template>
        </el-table-column>
        <el-table-column v-if="canEdit" label="操作" width="100" fixed="right">
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
      <el-form-item label="所属护理级别">
        <el-select v-model="form.careLevelId" class="full-width" filterable>
          <el-option
            v-for="level in careLevels"
            :key="level.id"
            :label="`${level.code} / ${level.name}`"
            :value="level.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="护理内容">
        <el-input v-model="form.name" placeholder="例如 晨间生命体征测量" />
      </el-form-item>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="频次">
            <el-input v-model="form.frequency" placeholder="例如 每日 2 次" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="标准时长（分钟）">
            <el-input-number v-model="form.durationMinutes" :min="0" :max="240" class="full-width" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="内容说明">
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="护理内容简介" />
      </el-form-item>
      <el-form-item label="执行说明">
        <el-input v-model="form.instructions" type="textarea" :rows="4" placeholder="记录操作规范、注意事项或异常上报要求" />
      </el-form-item>
      <el-form-item label="启用状态">
        <el-switch v-model="form.isActive" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="submitForm">
          {{ form.id ? '更新护理内容' : '新建护理内容' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { ROLE_KEYS } from '@/constants/rbac'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import {
  createCareItem,
  getCareItems,
  getCareLevels,
  updateCareItem,
  type CareItemItem,
  type CareLevelItem,
} from '@/modules/nursing/api/nursing.api'
import CrudPageShell from '@/modules/shared/components/CrudPageShell.vue'
import { validateFieldTypes } from '@/modules/shared/utils/form-validators'

type CareItemForm = {
  id: number | null
  careLevelId: number | null
  name: string
  description: string
  frequency: string
  durationMinutes: number
  instructions: string
  isActive: boolean
}

const careItems = ref<CareItemItem[]>([])
const careLevels = ref<CareLevelItem[]>([])
const dialogVisible = ref(false)
const form = reactive<CareItemForm>(createForm())
const dialogTitle = computed(() => (form.id ? '编辑护理内容' : '新建护理内容'))
const authStore = useAuthStore()
const canEdit = computed(
  () =>
    authStore.profile?.roleKey === ROLE_KEYS.ADMIN ||
    authStore.profile?.roleKey === ROLE_KEYS.NURSING_SUPERVISOR
)

onMounted(loadData)

function createForm(): CareItemForm {
  return {
    id: null,
    careLevelId: null,
    name: '',
    description: '',
    frequency: '',
    durationMinutes: 15,
    instructions: '',
    isActive: true,
  }
}

async function loadData() {
  const [itemsRes, levelsRes] = await Promise.all([getCareItems(), getCareLevels()])
  careItems.value = itemsRes.data
  careLevels.value = levelsRes.data
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

function startEdit(row: CareItemItem) {
  Object.assign(form, {
    id: row.id,
    careLevelId: row.careLevelId,
    name: row.name,
    description: row.description || '',
    frequency: row.frequency || '',
    durationMinutes: row.durationMinutes || 0,
    instructions: row.instructions || '',
    isActive: row.isActive,
  })
  dialogVisible.value = true
}

async function submitForm() {
  const valid = validateFieldTypes([
    { label: '所属护理级别', type: 'number', value: form.careLevelId },
    { label: '护理内容', type: 'string', value: form.name },
    { label: '频次', type: 'string', value: form.frequency, optional: true },
    { label: '标准时长', type: 'number', value: form.durationMinutes },
    { label: '内容说明', type: 'string', value: form.description, optional: true },
    { label: '执行说明', type: 'string', value: form.instructions, optional: true },
    { label: '启用状态', type: 'boolean', value: form.isActive },
  ])

  if (!valid) {
    return
  }

  const payload = {
    careLevelId: form.careLevelId || undefined,
    name: form.name,
    description: form.description,
    frequency: form.frequency,
    durationMinutes: form.durationMinutes,
    instructions: form.instructions,
    isActive: form.isActive,
  }

  if (form.id) {
    await updateCareItem(form.id, payload)
    ElMessage.success('护理内容更新成功')
  } else {
    await createCareItem(payload)
    ElMessage.success('护理内容创建成功')
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
