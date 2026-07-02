<template>
  <div v-loading="loading" class="dashboard-page">
    <el-card shadow="never" class="dashboard-page__hero">
      <div class="dashboard-page__hero-content">
        <div>
          <p class="dashboard-page__eyebrow">realtime overview</p>
          <h2>东软颐养中心运营看板</h2>
          <span>
            首页数据直接来自当前系统业务表，覆盖客户入住、床位使用、外出状态、护理执行和服务开展情况。
          </span>
        </div>

        <div class="dashboard-page__hero-badges">
          <div class="dashboard-page__badge">
            <strong>{{ summary.activeResidentCount }}</strong>
            <span>当前在住</span>
          </div>
          <div class="dashboard-page__badge">
            <strong>{{ summary.availableBeds }}</strong>
            <span>可分配空床</span>
          </div>
          <div class="dashboard-page__badge">
            <strong>{{ summary.careRecordsToday }}</strong>
            <span>今日护理记录</span>
          </div>
        </div>
      </div>
    </el-card>

    <el-row :gutter="18">
      <el-col v-for="card in summaryCards" :key="card.title" :xs="24" :sm="12" :xl="6">
        <el-card shadow="never" class="dashboard-page__metric-card">
          <span>{{ card.title }}</span>
          <strong>{{ card.value }}</strong>
          <p>{{ card.description }}</p>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="18" class="dashboard-page__section-row">
      <el-col :xs="24" :xl="8">
        <el-card shadow="never" class="dashboard-page__card dashboard-page__chart-card">
          <template #header>
            <div class="dashboard-page__section-title">
              <div>
                <h3>客户状态构成</h3>
              </div>
            </div>
          </template>

          <VChartPanel :spec="residentStatusSpec" />
        </el-card>
      </el-col>

      <el-col :xs="24" :xl="14">
        <el-card shadow="never" class="dashboard-page__card">
          <template #header>
            <div class="dashboard-page__section-title">
              <div>
                <h3>待关注事项</h3>
              </div>
            </div>
          </template>

          <div class="dashboard-page__attention-list">
            <div
              v-for="item in attentionItems"
              :key="item.title"
              class="dashboard-page__attention-item"
            >
              <div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.description }}</p>
              </div>
              <el-tag :type="item.type">{{ item.value }}</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :xl="10">
        <el-card shadow="never" class="dashboard-page__card">
          <template #header>
            <div class="dashboard-page__section-title">
              <div>
                <h3>快捷入口</h3>
              </div>
            </div>
          </template>

          <div class="dashboard-page__quick-grid">
            <button
              v-for="item in quickActions"
              :key="item.title"
              type="button"
              class="dashboard-page__quick-item"
              @click="router.push(item.path)"
            >
              <strong>{{ item.title }}</strong>
              <span>{{ item.description }}</span>
            </button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="18" class="dashboard-page__section-row">
      <el-col :xs="24" :xl="12">
        <el-card shadow="never" class="dashboard-page__card dashboard-page__chart-card">
          <template #header>
            <div class="dashboard-page__section-title">
              <div>
                <h3>护理级别分布</h3>
              </div>
            </div>
          </template>

          <VChartPanel :spec="careLevelSpec" />
        </el-card>
      </el-col>

      <el-col :xs="24" :xl="12">
        <el-card shadow="never" class="dashboard-page__card dashboard-page__chart-card">
          <template #header>
            <div class="dashboard-page__section-title">
              <div>
                <h3>房间占用概览</h3>
              </div>
            </div>
          </template>

          <VChartPanel :spec="roomOccupancySpec" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="18" class="dashboard-page__section-row">
      <el-col :xs="24" :xl="8">
        <el-card shadow="never" class="dashboard-page__card">
          <template #header>
            <div class="dashboard-page__section-title">
              <div>
                <h3>最近入住</h3>
                <p>最新 5 条入住登记。</p>
              </div>
            </div>
          </template>

          <el-timeline>
            <el-timeline-item
              v-for="item in dashboardData.latestCheckIns"
              :key="item.id"
              :timestamp="formatDateTime(item.checkInAt)"
              placement="top"
            >
              {{ item.resident?.fullName || '--' }} 入住
              {{ item.bed?.room?.roomNo || '--' }} / {{ item.bed?.bedNo || '--' }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>

      <el-col :xs="24" :xl="8">
        <el-card shadow="never" class="dashboard-page__card">
          <template #header>
            <div class="dashboard-page__section-title">
              <div>
                <h3>最近外出</h3>
                <p>最新 5 条外出动态。</p>
              </div>
            </div>
          </template>

          <el-timeline>
            <el-timeline-item
              v-for="item in dashboardData.latestOutings"
              :key="item.id"
              :timestamp="formatDateTime(item.startAt)"
              placement="top"
            >
              {{ item.resident?.fullName || '--' }}
              {{ item.status === 'RETURNED' ? '已归院' : '外出中' }}
              <span v-if="item.destination">，去向：{{ item.destination }}</span>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>

      <el-col :xs="24" :xl="8">
        <el-card shadow="never" class="dashboard-page__card">
          <template #header>
            <div class="dashboard-page__section-title">
              <div>
                <h3>最近护理</h3>
                <p>最新 5 条护理执行记录。</p>
              </div>
            </div>
          </template>

          <el-timeline>
            <el-timeline-item
              v-for="item in dashboardData.latestCareRecords"
              :key="item.id"
              :timestamp="formatDateTime(item.executedAt)"
              placement="top"
            >
              {{ item.operator?.realName || '--' }} 为
              {{ item.resident?.fullName || '--' }} 执行
              {{ item.careItem?.name || '--' }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { ISpec } from '@visactor/vchart'
import {
  getDashboardSummary,
  type DashboardData,
} from '@/modules/dashboard/api/dashboard.api'
import VChartPanel from '@/modules/dashboard/components/VChartPanel.vue'
import { formatDateTime } from '@/modules/shared/utils/format'

type TagType = 'primary' | 'success' | 'warning' | 'info' | 'danger'

const router = useRouter()
const loading = ref(false)
const dashboardData = reactive<DashboardData>({
  summary: {
    residentCount: 0,
    activeResidentCount: 0,
    pendingResidentCount: 0,
    checkedOutResidentCount: 0,
    availableBeds: 0,
    occupiedBeds: 0,
    disabledBeds: 0,
    careRecordsToday: 0,
    activeOutings: 0,
    activeServices: 0,
  },
  latestCheckIns: [],
  latestOutings: [],
  latestCareRecords: [],
  careLevelStats: [],
  roomStats: [],
})

const summary = computed(() => dashboardData.summary)

const summaryCards = computed(() => [
  {
    title: '客户总数',
    value: summary.value.residentCount,
    description: `在住 ${summary.value.activeResidentCount}，待入住 ${summary.value.pendingResidentCount}，已退住 ${summary.value.checkedOutResidentCount}`,
  },
  {
    title: '空床资源',
    value: summary.value.availableBeds,
    description: `占床 ${summary.value.occupiedBeds}，停用 ${summary.value.disabledBeds}`,
  },
  {
    title: '今日护理记录',
    value: summary.value.careRecordsToday,
    description: '按护理记录执行时间实时统计',
  },
  {
    title: '服务与外出',
    value: `${summary.value.activeServices} / ${summary.value.activeOutings}`,
    description: '进行中服务 / 外出中客户',
  },
])

const attentionItems = computed(() => [
  {
    title: '待入住客户',
    description: '这些客户已经建档，但还没有完成床位分配和入住登记。',
    value: `${summary.value.pendingResidentCount} 人`,
    type: (summary.value.pendingResidentCount > 0 ? 'warning' : 'success') as TagType,
  },
  {
    title: '外出中客户',
    description: '客户仍在外出状态，建议关注预计归院时间和归院登记。',
    value: `${summary.value.activeOutings} 人`,
    type: (summary.value.activeOutings > 0 ? 'warning' : 'success') as TagType,
  },
  {
    title: '可分配空床',
    description: '当前还能继续安排入住的床位数量。',
    value: `${summary.value.availableBeds} 张`,
    type: (summary.value.availableBeds > 0 ? 'success' : 'danger') as TagType,
  },
  {
    title: '进行中服务',
    description: '当前仍处于有效期内的客户服务项目数量。',
    value: `${summary.value.activeServices} 项`,
    type: 'primary' as TagType,
  },
])

const residentStatusSpec = computed<ISpec>(() => ({
  type: 'pie',
  data: [
    {
      id: 'resident-status',
      values: [
        { type: '在住', value: summary.value.activeResidentCount },
        { type: '待入住', value: summary.value.pendingResidentCount },
        { type: '已退住', value: summary.value.checkedOutResidentCount },
      ],
    },
  ],
  outerRadius: 0.78,
  innerRadius: 0.56,
  valueField: 'value',
  categoryField: 'type',
  padAngle: 0.6,
  legends: {
    visible: true,
    orient: 'bottom',
  },
  label: {
    visible: true,
    position: 'outside',
    style: {
      fontSize: 12,
      fill: '#48655b',
    },
  },
  tooltip: {
    mark: {
      title: {
        value: '客户状态',
      },
    },
  },
  color: ['#3f7c66', '#e6a93d', '#9aa9a2'],
  pie: {
    style: {
      cornerRadius: 8,
    },
  },
  background: 'transparent',
}))

const careLevelSpec = computed<ISpec>(() => ({
  type: 'bar',
  data: [
    {
      id: 'care-level',
      values: dashboardData.careLevelStats.flatMap((item) => [
        {
          level: item.name,
          metric: '客户数',
          value: item._count.residents,
        },
        {
          level: item.name,
          metric: '护理内容数',
          value: item._count.items,
        },
      ]),
    },
  ],
  direction: 'horizontal',
  xField: 'value',
  yField: 'level',
  seriesField: 'metric',
  legends: {
    visible: true,
    orient: 'bottom',
  },
  axes: [
    {
      orient: 'left',
      label: {
        style: {
          fill: '#3f564d',
        },
      },
    },
    {
      orient: 'bottom',
      grid: {
        visible: true,
        style: {
          stroke: 'rgba(63, 124, 102, 0.12)',
        },
      },
      label: {
        style: {
          fill: '#72877f',
        },
      },
    },
  ],
  bar: {
    style: {
      cornerRadius: [0, 10, 10, 0],
    },
  },
  color: ['#3f7c66', '#f2b24f'],
  background: 'transparent',
}))

const roomOccupancySpec = computed<ISpec>(() => ({
  type: 'bar',
  data: [
    {
      id: 'room-occupancy',
      values: dashboardData.roomStats.flatMap((item) => [
        {
          room: `${item.roomNo}`,
          status: '占床',
          value: item.occupiedCount,
        },
        {
          room: `${item.roomNo}`,
          status: '空床',
          value: item.vacantCount,
        },
        {
          room: `${item.roomNo}`,
          status: '停用',
          value: item.disabledCount,
        },
      ]),
    },
  ],
  xField: 'room',
  yField: 'value',
  seriesField: 'status',
  stack: true,
  legends: {
    visible: true,
    orient: 'bottom',
  },
  axes: [
    {
      orient: 'bottom',
      label: {
        style: {
          fill: '#3f564d',
        },
      },
    },
    {
      orient: 'left',
      grid: {
        visible: true,
        style: {
          stroke: 'rgba(63, 124, 102, 0.12)',
        },
      },
      label: {
        style: {
          fill: '#72877f',
        },
      },
    },
  ],
  bar: {
    style: {
      cornerRadius: 8,
    },
  },
  color: ['#d78f27', '#4a9b7f', '#a8b5ae'],
  background: 'transparent',
}))

const quickActions = [
  {
    title: '办理入住',
    description: '客户分配床位并登记入住',
    path: '/customer/check-in',
  },
  {
    title: '床位管理',
    description: '维护房间和床位配置',
    path: '/customer/bed',
  },
  {
    title: '膳食方案',
    description: '为客户定制膳食安排',
    path: '/customer/meal',
  },
  {
    title: '护理记录',
    description: '录入护理项目执行情况',
    path: '/nursing/care-record',
  },
  {
    title: '外出登记',
    description: '登记客户外出与归院',
    path: '/customer/outing',
  },
  {
    title: '服务关系',
    description: '维护客户与健康管家绑定',
    path: '/customer/service-target',
  },
]

onMounted(async () => {
  loading.value = true

  try {
    const response = await getDashboardSummary()
    Object.assign(dashboardData, response.data)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.dashboard-page {
  display: grid;
  gap: 18px;

  &__hero,
  &__card,
  &__metric-card {
    background: var(--yy-color-surface);
    border: 1px solid var(--yy-color-border);
    border-radius: var(--yy-radius-lg);
    box-shadow: var(--yy-shadow-card);
  }

  &__hero {
    overflow: hidden;
    background:
      radial-gradient(circle at top right, rgb(250 236 194 / 52%), transparent 28%),
      linear-gradient(135deg, rgb(239 247 242 / 96%), rgb(255 255 255 / 96%));
  }

  &__hero-content {
    display: flex;
    gap: 20px;
    align-items: flex-start;
    justify-content: space-between;

    h2 {
      margin: 0 0 12px;
      font-size: 30px;
      color: var(--yy-color-text);
    }

    span {
      display: block;
      max-width: 700px;
      line-height: 1.7;
      color: var(--yy-color-text-secondary);
    }
  }

  &__eyebrow {
    margin: 0 0 10px;
    font-size: 12px;
    font-weight: 700;
    color: var(--yy-color-primary);
    text-transform: uppercase;
    letter-spacing: 0.14em;
  }

  &__hero-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  &__badge {
    min-width: 118px;
    padding: 14px 16px;
    background: rgb(255 255 255 / 74%);
    border: 1px solid var(--yy-color-border);
    border-radius: 18px;

    strong {
      display: block;
      margin-bottom: 6px;
      font-size: 26px;
      color: var(--yy-color-text);
    }

    span {
      font-size: 12px;
      color: var(--yy-color-text-secondary);
    }
  }

  &__metric-card {
    margin-bottom: 0;

    span {
      display: block;
      margin-bottom: 12px;
      color: var(--yy-color-text-secondary);
    }

    strong {
      display: block;
      margin-bottom: 8px;
      font-size: 32px;
      color: var(--yy-color-text);
    }

    p {
      margin: 0;
      line-height: 1.6;
      color: var(--yy-color-primary);
    }
  }

  &__section-row {
    margin: 0;
  }

  &__section-title {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;

    h3 {
      margin: 0 0 6px;
      font-size: 18px;
      color: var(--yy-color-text);
    }

    p {
      margin: 0;
      font-size: 13px;
      color: var(--yy-color-text-secondary);
    }
  }

  &__attention-list {
    display: grid;
    gap: 12px;
  }

  &__attention-item {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    padding: 16px 18px;
    background: linear-gradient(180deg, #fbfdfb 0%, #f2f7f4 100%);
    border: 1px solid var(--yy-color-border);
    border-radius: 18px;

    strong {
      display: block;
      margin-bottom: 6px;
      color: var(--yy-color-text);
    }

    p {
      margin: 0;
      line-height: 1.6;
      color: var(--yy-color-text-secondary);
    }
  }

  &__quick-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  &__quick-item {
    display: grid;
    gap: 8px;
    padding: 18px;
    text-align: left;
    cursor: pointer;
    background: linear-gradient(180deg, #fbfdfb 0%, #f1f7f3 100%);
    border: 1px solid rgb(90 133 110 / 14%);
    border-radius: 18px;
    transition:
      transform 0.18s ease,
      box-shadow 0.18s ease,
      border-color 0.18s ease;

    strong {
      color: var(--yy-color-text);
    }

    span {
      line-height: 1.6;
      color: var(--yy-color-text-secondary);
    }

    &:hover {
      border-color: rgb(63 124 102 / 24%);
      box-shadow: 0 14px 30px rgb(74 115 94 / 10%);
      transform: translateY(-2px);
    }
  }

  &__chart-card {
    :deep(.el-card__body) {
      padding-top: 10px;
    }
  }
}

@media (max-width: 900px) {
  .dashboard-page {
    &__hero-content {
      flex-direction: column;
    }

    &__quick-grid {
      grid-template-columns: 1fr;
    }

    &__attention-item {
      flex-direction: column;
      align-items: flex-start;
    }
  }
}
</style>
