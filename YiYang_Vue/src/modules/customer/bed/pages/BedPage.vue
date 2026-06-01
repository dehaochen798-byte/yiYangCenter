<template>
  <CrudPageShell
    eyebrow="bed management"
    title="房间与床位管理"
    description="在同一页面维护房间和床位，支持空床/占床状态查看，为入住登记提供即时可选床位。"
    table-title="床位总览"
    table-description="按房间展示床位状态，已入住客户会直接显示在对应床位上。"
    form-title="房间/床位配置"
    form-description="先建房间，再为房间补充床位。页面会自动维护房间床位数量。"
  >
    <template #hero-extra>
      <div class="bed-stats">
        <div class="bed-stats__item">
          <strong>{{ beds.filter((item) => item.status === 'VACANT').length }}</strong>
          <span>空床</span>
        </div>
        <div class="bed-stats__item">
          <strong>{{ beds.filter((item) => item.status === 'OCCUPIED').length }}</strong>
          <span>占床</span>
        </div>
      </div>
    </template>

    <template #table-actions>
      <el-segmented v-model="activeTab" :options="tabOptions" />
    </template>

    <template #table>
      <el-table v-if="activeTab === 'bed'" :data="beds" border>
        <el-table-column label="房间" min-width="180">
          <template #default="{ row }">
            {{ row.room?.building || '默认楼栋' }} / {{ row.room?.roomNo }}
          </template>
        </el-table-column>
        <el-table-column prop="bedNo" label="床位编号" min-width="120" />
        <el-table-column prop="label" label="床位标签" min-width="120" />
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="bedStatusTagMap[row.status as keyof typeof bedStatusTagMap]">
              {{ bedStatusLabelMap[row.status as keyof typeof bedStatusLabelMap] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="入住客户" min-width="120">
          <template #default="{ row }">
            {{ row.currentResident?.fullName || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="楼层/房型" min-width="140">
          <template #default="{ row }">
            {{ row.room?.floor || '--' }} 层 / {{ row.room?.roomType || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="startEditBed(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-table v-else :data="rooms" border>
        <el-table-column label="楼栋" prop="building" min-width="120" />
        <el-table-column label="房间号" prop="roomNo" min-width="120" />
        <el-table-column label="楼层" prop="floor" min-width="90" />
        <el-table-column label="房型" prop="roomType" min-width="120" />
        <el-table-column label="床位数" prop="bedCount" min-width="90" />
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'">
              {{ row.isActive ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="说明" prop="description" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="startEditRoom(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>

    <template #form-actions>
      <el-button text @click="resetCurrentForm">重置</el-button>
    </template>

    <template #form>
      <el-form v-if="activeTab === 'room'" label-position="top" :model="roomForm" @submit.prevent>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="楼栋">
              <el-input v-model="roomForm.building" placeholder="例如 A 栋" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="房间号">
              <el-input v-model="roomForm.roomNo" placeholder="例如 201" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="楼层">
              <el-input-number v-model="roomForm.floor" :min="1" :max="30" class="full-width" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="房型">
              <el-input v-model="roomForm.roomType" placeholder="例如 双人间" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="房间说明">
          <el-input v-model="roomForm.description" type="textarea" :rows="4" placeholder="可记录朝向、护理专区等信息" />
        </el-form-item>
        <el-form-item label="启用状态">
          <el-switch v-model="roomForm.isActive" />
        </el-form-item>
        <el-button type="primary" class="full-width" @click="submitRoom">
          {{ roomForm.id ? '更新房间' : '新建房间' }}
        </el-button>
      </el-form>

      <el-form v-else label-position="top" :model="bedForm" @submit.prevent>
        <el-form-item label="所属房间">
          <el-select v-model="bedForm.roomId" class="full-width" filterable>
            <el-option
              v-for="room in rooms"
              :key="room.id"
              :label="`${room.building || '默认楼栋'} / ${room.roomNo}`"
              :value="room.id"
            />
          </el-select>
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="床位编号">
              <el-input v-model="bedForm.bedNo" placeholder="例如 A 床" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="床位标签">
              <el-input v-model="bedForm.label" placeholder="例如 靠窗 / 护理床" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="床位状态">
          <el-select v-model="bedForm.status" class="full-width">
            <el-option label="空床" value="VACANT" />
            <el-option label="占床" value="OCCUPIED" />
            <el-option label="停用" value="DISABLED" />
          </el-select>
        </el-form-item>
        <el-button type="primary" class="full-width" @click="submitBed">
          {{ bedForm.id ? '更新床位' : '新建床位' }}
        </el-button>
      </el-form>
    </template>
  </CrudPageShell>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import CrudPageShell from '@/modules/shared/components/CrudPageShell.vue'
import {
  createBed,
  createRoom,
  getBeds,
  getRooms,
  updateBed,
  updateRoom,
  type BedItem,
  type RoomItem,
} from '@/modules/customer/api/customer.api'

type RoomForm = {
  id: number | null
  building: string
  roomNo: string
  floor: number
  roomType: string
  description: string
  isActive: boolean
}

type BedForm = {
  id: number | null
  roomId: number | null
  bedNo: string
  label: string
  status: 'VACANT' | 'OCCUPIED' | 'DISABLED'
}

const activeTab = ref<'bed' | 'room'>('bed')
const tabOptions = [
  { label: '床位列表', value: 'bed' },
  { label: '房间列表', value: 'room' },
]
const bedStatusLabelMap = {
  VACANT: '空床',
  OCCUPIED: '占床',
  DISABLED: '停用',
}
const bedStatusTagMap = {
  VACANT: 'success',
  OCCUPIED: 'warning',
  DISABLED: 'info',
} as const

const rooms = ref<RoomItem[]>([])
const beds = ref<BedItem[]>([])
const roomForm = reactive<RoomForm>(createRoomForm())
const bedForm = reactive<BedForm>(createBedForm())

onMounted(loadData)

watch(activeTab, () => {
  resetCurrentForm()
})

function createRoomForm(): RoomForm {
  return {
    id: null,
    building: '',
    roomNo: '',
    floor: 1,
    roomType: '',
    description: '',
    isActive: true,
  }
}

function createBedForm(): BedForm {
  return {
    id: null,
    roomId: null,
    bedNo: '',
    label: '',
    status: 'VACANT',
  }
}

async function loadData() {
  const [roomRes, bedRes] = await Promise.all([getRooms(), getBeds()])
  rooms.value = roomRes.data
  beds.value = bedRes.data
}

function resetCurrentForm() {
  if (activeTab.value === 'room') {
    Object.assign(roomForm, createRoomForm())
    return
  }

  Object.assign(bedForm, createBedForm())
}

function startEditRoom(row: RoomItem) {
  activeTab.value = 'room'
  Object.assign(roomForm, {
    id: row.id,
    building: row.building || '',
    roomNo: row.roomNo,
    floor: row.floor,
    roomType: row.roomType || '',
    description: row.description || '',
    isActive: row.isActive,
  })
}

function startEditBed(row: BedItem) {
  activeTab.value = 'bed'
  Object.assign(bedForm, {
    id: row.id,
    roomId: row.roomId,
    bedNo: row.bedNo,
    label: row.label || '',
    status: row.status,
  })
}

async function submitRoom() {
  const payload = {
    building: roomForm.building,
    roomNo: roomForm.roomNo,
    floor: roomForm.floor,
    roomType: roomForm.roomType,
    description: roomForm.description,
    isActive: roomForm.isActive,
  }

  if (roomForm.id) {
    await updateRoom(roomForm.id, payload)
    ElMessage.success('房间更新成功')
  } else {
    await createRoom(payload)
    ElMessage.success('房间创建成功')
  }

  resetCurrentForm()
  await loadData()
}

async function submitBed() {
  const payload = {
    roomId: bedForm.roomId || undefined,
    bedNo: bedForm.bedNo,
    label: bedForm.label,
    status: bedForm.status,
  }

  if (bedForm.id) {
    await updateBed(bedForm.id, payload)
    ElMessage.success('床位更新成功')
  } else {
    await createBed(payload)
    ElMessage.success('床位创建成功')
  }

  resetCurrentForm()
  await loadData()
}
</script>

<style scoped lang="scss">
.full-width {
  width: 100%;
}

.bed-stats {
  display: flex;
  gap: 12px;

  &__item {
    min-width: 92px;
    padding: 14px 16px;
    text-align: center;
    background: rgb(255 255 255 / 72%);
    border: 1px solid var(--yy-color-border);
    border-radius: 16px;

    strong {
      display: block;
      margin-bottom: 6px;
      font-size: 24px;
      color: var(--yy-color-text);
    }

    span {
      font-size: 12px;
      color: var(--yy-color-text-secondary);
    }
  }
}
</style>
