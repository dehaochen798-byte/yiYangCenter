<template>
  <div class="dashboard-page">
    <el-row :gutter="20">
      <el-col
        v-for="card in summaryCards"
        :key="card.title"
        :xs="24"
        :sm="12"
        :xl="6"
      >
        <el-card shadow="hover" class="dashboard-page__summary-card">
          <p>{{ card.title }}</p>
          <strong>{{ card.value }}</strong>
          <span>{{ card.trend }}</span>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="dashboard-page__content">
      <el-col :xs="24" :xl="14">
        <el-card shadow="never">
          <template #header>
            <div class="dashboard-page__section-title">
              <h2>项目起步建议</h2>
              <el-tag type="success" effect="light">推荐先做登录和首页</el-tag>
            </div>
          </template>

          <el-timeline>
            <el-timeline-item timestamp="第 1 阶段" placement="top">
              完成注册、登录、权限守卫和主布局。
            </el-timeline-item>
            <el-timeline-item timestamp="第 2 阶段" placement="top">
              优先打通客户管理中的入住登记、床位管理、用户管理。
            </el-timeline-item>
            <el-timeline-item timestamp="第 3 阶段" placement="top">
              继续补护理级别、护理内容、护理记录，并和客户建立关联。
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>

      <el-col :xs="24" :xl="10">
        <el-card shadow="never">
          <template #header>
            <div class="dashboard-page__section-title">
              <h2>快捷入口建议</h2>
              <span>后续可替换为真实菜单卡片</span>
            </div>
          </template>

          <div class="dashboard-page__quick-grid">
            <div
              v-for="item in quickModules"
              :key="item"
              class="dashboard-page__quick-item"
            >
              {{ item }}
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
const summaryCards = [
  { title: '入住客户', value: '128', trend: '+12' },
  { title: '空闲床位', value: '36', trend: '-4' },
  { title: '今日护理记录', value: '82', trend: '+18' },
  { title: '待处理外出登记', value: '7', trend: '+2' },
]

const quickModules = [
  '客户入住登记',
  '床位分配维护',
  '膳食方案配置',
  '护理记录录入',
  '外出登记审批',
  '服务关系维护',
]
</script>

<style scoped lang="scss">
.dashboard-page {
  &__summary-card {
    margin-bottom: 20px;
    border-radius: 20px;

    p {
      margin: 0 0 12px;
      color: #678178;
    }

    strong {
      display: block;
      margin-bottom: 8px;
      font-size: 30px;
      color: #18362f;
    }

    span {
      font-size: 13px;
      font-weight: 600;
      color: #4b8f6b;
    }
  }

  &__content {
    margin-top: 4px;
  }

  &__section-title {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;

    h2 {
      margin: 0;
      font-size: 20px;
      color: #1f3a33;
    }

    span {
      font-size: 13px;
      color: #7a9288;
    }
  }

  &__quick-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  &__quick-item {
    padding: 18px;
    color: #33554a;
    background: linear-gradient(180deg, #fbfdfb 0%, #f1f7f3 100%);
    border: 1px solid rgb(90 133 110 / 14%);
    border-radius: 18px;
  }
}

@media (max-width: 900px) {
  .dashboard-page {
    &__quick-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
