<template>
  <CrudPageShell
    eyebrow="nursing level"
    title="护理级别定义"
    description="定义护理级别编码、名称和启停状态，客户档案和护理内容会直接引用这里的分级。"
    table-title="护理级别列表"
    table-description="建议用编码区分失能等级、护理套餐或园区内部分层。"
    :full-width="true"
  >
    <template #table-actions>
      <div class="table-toolbar">
        <el-button type="primary" @click="openCreateDialog">新建护理级别</el-button>
      </div>
    </template>

    <template #table>
      <el-table :data="careLevels" border>
        <el-table-column prop="code" label="级别编码" min-width="120" />
        <el-table-column prop="name" label="级别名称" min-width="140" />
        <el-table-column prop="description" label="说明" min-width="220" show-overflow-tooltip />
        <el-table-column label="启停" min-width="100">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'">
              {{ row.isActive ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="护理内容数" min-width="110">
          <template #default="{ row }">
            {{ row._count?.items || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="关联客户数" min-width="110">
          <template #default="{ row }">
            {{ row._count?.residents || 0 }}
          </template>
        </el-table-column>
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
    width="640px"
    destroy-on-close
    @closed="resetForm"
  >
    <el-form label-position="top" :model="form" @submit.prevent>
      <el-form-item label="级别编码">
        <el-input v-model="form.code" placeholder="例如 CL-01" />
      </el-form-item>
      <el-form-item label="级别名称">
        <el-input v-model="form.name" placeholder="例如 一级护理" />
      </el-form-item>
      <el-form-item label="级别说明">
        <el-input v-model="form.description" type="textarea" :rows="5" placeholder="描述服务对象、服务强度、适用范围" />
      </el-form-item>
      <el-form-item label="启用状态">
        <el-switch v-model="form.isActive" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="submitForm">
          {{ form.id ? '更新护理级别' : '新建护理级别' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import CrudPageShell from '@/modules/shared/components/CrudPageShell.vue'
import {
  createCareLevel,
  getCareLevels,
  updateCareLevel,
  type CareLevelItem,
} from '@/modules/nursing/api/nursing.api'

type CareLevelForm = {
  id: number | null
  code: string
  name: string
  description: string
  isActive: boolean
}

const careLevels = ref<CareLevelItem[]>([])
const dialogVisible = ref(false)
const form = reactive<CareLevelForm>(createForm())
const dialogTitle = computed(() => (form.id ? '编辑护理级别' : '新建护理级别'))

onMounted(loadData)

function createForm(): CareLevelForm {
  return {
    id: null,
    code: '',
    name: '',
    description: '',
    isActive: true,
  }
}

async function loadData() {
  const response = await getCareLevels()
  careLevels.value = response.data
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

function startEdit(row: CareLevelItem) {
  Object.assign(form, {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description || '',
    isActive: row.isActive,
  })
  dialogVisible.value = true
}

async function submitForm() {
  const payload = {
    code: form.code,
    name: form.name,
    description: form.description,
    isActive: form.isActive,
  }

  if (form.id) {
    await updateCareLevel(form.id, payload)
    ElMessage.success('护理级别更新成功')
  } else {
    await createCareLevel(payload)
    ElMessage.success('护理级别创建成功')
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
