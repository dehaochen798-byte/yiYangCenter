<template>
  <el-container class="main-layout">
    <el-aside :width="sidebarCollapsed ? '80px' : '260px'" class="main-layout__aside">
      <div class="brand">
        <div class="brand__badge">YY</div>
        <div v-if="!sidebarCollapsed" class="brand__content">
          <strong>东软颐养中心</strong>
          <span>养老中心管理系统</span>
        </div>
      </div>

      <el-scrollbar>
        <el-menu
          :collapse="sidebarCollapsed"
          :default-active="activeMenu"
          class="main-layout__menu"
          @select="handleMenuSelect"
        >
          <template v-for="group in menuGroups" :key="group.index">
            <el-sub-menu v-if="group.items.length > 1" :index="group.index">
              <template #title>
                <el-icon><component :is="group.icon" /></el-icon>
                <span>{{ group.title }}</span>
              </template>

              <el-menu-item
                v-for="item in group.items"
                :key="item.index"
                :index="item.index"
              >
                {{ item.title }}
              </el-menu-item>
            </el-sub-menu>

            <el-menu-item v-else :index="group.items[0].index">
              <el-icon><component :is="group.icon" /></el-icon>
              <span>{{ group.items[0].title }}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <el-container>
      <el-header class="main-layout__header">
        <div class="toolbar">
          <div class="toolbar__left">
            <el-button text @click="toggleSidebar">
              {{ sidebarCollapsed ? '展开菜单' : '收起菜单' }}
            </el-button>
            <div class="toolbar__title">
              <h1>{{ pageTitle }}</h1>
              <span>欢迎进入养老中心前端管理台</span>
            </div>
          </div>

          <div class="toolbar__right">
            <el-tag type="success" effect="light">已登录</el-tag>
            <el-dropdown>
              <span class="toolbar__user">
                {{ authStore.profile?.realName || '系统管理员' }}
                <el-icon><Management /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>

      <el-main class="main-layout__main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { HomeFilled, House, Management, Memo } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../modules/auth/store/auth.store'
import { useAppStore } from '../stores/app.store'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const { sidebarCollapsed } = storeToRefs(appStore)

const menuGroups = [
  {
    index: 'dashboard',
    title: '工作台',
    icon: HomeFilled,
    items: [{ index: '/dashboard', title: '系统首页' }],
  },
  {
    index: 'customer',
    title: '客户管理',
    icon: House,
    items: [
      { index: '/customer/bed', title: '床位管理' },
      { index: '/customer/meal', title: '膳食管理' },
      { index: '/customer/meal-calendar', title: '膳食日历' },
      { index: '/customer/check-in', title: '入住登记' },
      { index: '/customer/check-out', title: '退住登记' },
      { index: '/customer/outing', title: '外出登记' },
      { index: '/customer/service-target', title: '设置服务对象' },
      { index: '/customer/service-focus', title: '服务关注' },
      { index: '/customer/user', title: '用户管理' },
    ],
  },
  {
    index: 'nursing',
    title: '护理模块',
    icon: Memo,
    items: [
      { index: '/nursing/care-level', title: '护理级别' },
      { index: '/nursing/care-item', title: '护理内容' },
      { index: '/nursing/care-record', title: '护理记录' },
    ],
  },
]

const activeMenu = computed(() => route.meta.menuKey || route.path)
const pageTitle = computed(() => route.meta.title || '东软颐养中心')

function handleMenuSelect(index) {
  router.push(index)
}

function toggleSidebar() {
  appStore.toggleSidebar()
}

function handleLogout() {
  authStore.logout()
  router.push('/auth/login')
}
</script>

<style scoped lang="scss">
.main-layout {
  min-height: 100vh;
  background: #f5f8f6;

  &__aside {
    overflow: hidden;
    background: linear-gradient(180deg, #173a33 0%, #20483f 100%);
    border-right: 1px solid rgb(59 93 73 / 8%);
    transition: width 0.2s ease;
  }

  &__menu {
    background: transparent;
    border-right: none;
  }

  :deep(.el-menu) {
    background: transparent;
    border-right: none;
  }

  :deep(.el-sub-menu__title),
  :deep(.el-menu-item) {
    color: rgb(236 245 240 / 86%);
  }

  :deep(.el-sub-menu__title:hover),
  :deep(.el-menu-item:hover),
  :deep(.el-menu-item.is-active) {
    color: #fff;
    background: rgb(255 255 255 / 9%);
  }

  &__header {
    display: flex;
    align-items: center;
    height: auto;
    padding: 20px 24px;
    background: rgb(255 255 255 / 88%);
    border-bottom: 1px solid rgb(59 93 73 / 8%);
    backdrop-filter: blur(14px);
  }

  &__main {
    padding: 24px;
  }
}

.brand {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 20px 18px;

  &__badge {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    font-weight: 700;
    color: #1f433a;
    background: linear-gradient(135deg, #d7ecd8 0%, #f8f4d8 100%);
    border-radius: 14px;
  }

  &__content {
    display: grid;
    gap: 2px;
    color: #fff;

    strong {
      font-size: 16px;
    }

    span {
      font-size: 12px;
      color: rgb(223 237 229 / 70%);
    }
  }
}

.toolbar {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  &__left,
  &__right {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  &__title {
    display: grid;
    gap: 4px;

    h1 {
      margin: 0;
      font-size: 22px;
      color: #19352e;
    }

    span {
      font-size: 13px;
      color: #6f867d;
    }
  }

  &__user {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    color: #35594e;
    cursor: pointer;
  }
}

@media (max-width: 900px) {
  .main-layout {
    &__aside {
      position: fixed;
      z-index: 10;
      height: 100vh;
    }

    &__header {
      padding: 16px;
    }

    &__main {
      padding: 16px;
    }
  }

  .toolbar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
