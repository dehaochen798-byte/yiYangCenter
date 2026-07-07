<template>
  <el-container class="main-layout">
    <!-- 侧边栏 -->
    <el-aside :width="sidebarCollapsed ? '80px' : '260px'" class="main-layout__aside">
      <div class="brand">
        <div class="brand__badge">YY</div>
        <div v-if="!sidebarCollapsed" class="brand__content">
          <strong>颐养中心</strong>
          <span>养老中心管理系统</span>
        </div>
      </div>

      <el-scrollbar class="main-layout__aside-scroll">
        <el-menu
          :collapse="sidebarCollapsed"
          :default-active="activeMenu"
          class="main-layout__menu"
          @select="handleMenuSelect"
        >
          <template v-for="group in visibleMenuGroups" :key="group.index">
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

    <!-- 右边内容 -->
    <el-container class="main-layout__body">
      <!-- 头部导航 -->
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
                {{
                  authStore.profile?.realName ||
                  authStore.profile?.nickName ||
                  '系统管理员'
                }}
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

      <section class="main-layout__tabs">
        <div class="main-layout__tabs-bar">
          <div
            ref="tabsScrollRef"
            class="main-layout__tabs-scroll"
            @wheel.prevent="handleTabsWheel"
          >
            <el-tabs
              v-model="activeTabName"
              type="card"
              class="main-layout__tabs-card"
              @tab-click="handleTabClick"
            >
              <el-tab-pane v-for="tab in visitedTabs" :key="tab.path" :name="tab.path">
                <template #label>
                  <span class="main-layout__tab-label">
                    <span class="main-layout__tab-text">{{ tab.title }}</span>
                    <button
                      v-if="tab.path !== dashboardTab.path"
                      type="button"
                      class="main-layout__tab-close"
                      aria-label="关闭标签"
                      @click.stop="handleTabCloseClick(tab.path)"
                    >
                      ×
                    </button>
                  </span>
                </template>
              </el-tab-pane>
            </el-tabs>
          </div>

          <el-button
            text
            class="main-layout__tabs-clear"
            :disabled="visitedTabs.length === 0"
            @click="handleClearTabs"
          >
            一键清空
          </el-button>
        </div>
      </section>

      <!-- 内容容器 -->
      <el-main class="main-layout__main">
        <el-scrollbar class="main-layout__main-scroll">
          <router-view />
        </el-scrollbar>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { HomeFilled, House, Management, Memo } from '@element-plus/icons-vue'
import type { TabsPaneContext } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ROLE_KEYS } from '@/constants/rbac'
import { canAccessRoles } from '@/utils/permission'
import { useAuthStore } from '../modules/auth/store/auth.store'
import { useAppStore } from '../stores/app.store'

type MenuItem = {
  index: string
  title: string
  roles?: string[]
}

type MenuGroup = {
  index: string
  title: string
  icon: typeof HomeFilled
  items: MenuItem[]
}

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const tabsScrollRef = ref<HTMLDivElement | null>(null)
const { sidebarCollapsed, visitedTabs, activeTabPath } = storeToRefs(appStore)

const dashboardTab = {
  path: '/dashboard',
  title: '系统首页',
}

const menuGroups: MenuGroup[] = [
  {
    index: 'dashboard',
    title: '工作台',
    icon: HomeFilled,
    items: [{ index: '/dashboard', title: '系统首页', roles: Object.values(ROLE_KEYS) }],
  },
  {
    index: 'customer',
    title: '客户管理',
    icon: House,
    items: [
      { index: '/customer/residents', title: '客户档案', roles: Object.values(ROLE_KEYS) },
      { index: '/customer/users', title: '员工账号', roles: [ROLE_KEYS.ADMIN] },
      { index: '/customer/bed', title: '床位管理', roles: [ROLE_KEYS.ADMIN, ROLE_KEYS.FRONT_DESK] },
      { index: '/customer/check-in', title: '入住登记', roles: [ROLE_KEYS.ADMIN, ROLE_KEYS.FRONT_DESK] },
      { index: '/customer/check-out', title: '退住登记', roles: [ROLE_KEYS.ADMIN, ROLE_KEYS.FRONT_DESK] },
      { index: '/customer/outing', title: '外出登记', roles: [ROLE_KEYS.ADMIN, ROLE_KEYS.FRONT_DESK] },
      { index: '/customer/meal', title: '膳食管理', roles: [ROLE_KEYS.ADMIN, ROLE_KEYS.MEAL_MANAGER] },
      { index: '/customer/meal-calendar', title: '膳食日历', roles: [ROLE_KEYS.ADMIN, ROLE_KEYS.MEAL_MANAGER] },
      { index: '/customer/service-target', title: '服务对象分配', roles: [ROLE_KEYS.ADMIN, ROLE_KEYS.NURSING_SUPERVISOR] },
      { index: '/customer/service-focus', title: '服务关注', roles: [ROLE_KEYS.ADMIN, ROLE_KEYS.NURSING_STAFF] },
    ],
  },
  {
    index: 'nursing',
    title: '护理模块',
    icon: Memo,
    items: [
      { index: '/nursing/care-level', title: '护理级别', roles: [ROLE_KEYS.ADMIN, ROLE_KEYS.NURSING_SUPERVISOR, ROLE_KEYS.NURSING_STAFF] },
      { index: '/nursing/care-item', title: '护理内容', roles: [ROLE_KEYS.ADMIN, ROLE_KEYS.NURSING_SUPERVISOR, ROLE_KEYS.NURSING_STAFF] },
      { index: '/nursing/care-record', title: '护理记录', roles: [ROLE_KEYS.ADMIN, ROLE_KEYS.NURSING_SUPERVISOR, ROLE_KEYS.NURSING_STAFF] },
    ],
  },
]

const visibleMenuGroups = computed(() =>
  menuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccessRoles(authStore.profile, item.roles)),
    }))
    .filter((group) => group.items.length > 0)
)

const menuItemMap = new Map(
  menuGroups.flatMap((group) => group.items.map((item) => [item.index, item.title]))
)

const activeMenu = computed(() => (route.meta.menuKey as string) || route.path)
const activeTabName = computed({
  get: () => activeTabPath.value,
  set: (value: string) => {
    appStore.setActiveTab(value)
  },
})
const pageTitle = computed(() => (route.meta.title as string) || '颐养中心')

watch(
  () => route.fullPath,
  () => {
    syncTabWithRoute()
  },
  {
    immediate: true,
  }
)

function syncTabWithRoute() {
  const path = route.path
  const requiresAuth = route.matched.some((record) => record.meta.requiresAuth)

  if (!requiresAuth) {
    return
  }

  const title = resolveTabTitle(path)
  appStore.addVisitedTab({
    path,
    title,
  })

  scrollActiveTabIntoView(path)
}

function resolveTabTitle(path: string) {
  return menuItemMap.get(path) || (route.meta.title as string) || path
}

function handleMenuSelect(index: string) {
  router.push(index)
}

function handleTabClick(tab: TabsPaneContext) {
  const path = String(tab.paneName || '')

  if (path) {
    appStore.setActiveTab(path)
    router.push(path)
  }
}

function closeTab(path: string) {
  const isCurrentTab = route.path === path

  appStore.removeVisitedTab(path)

  if (isCurrentTab) {
    router.push(activeTabPath.value)
  }
}

function handleTabCloseClick(path: string) {
  closeTab(path)
}

function handleTabsWheel(event: WheelEvent) {
  const container = tabsScrollRef.value

  if (!container) {
    return
  }

  container.scrollLeft += event.deltaY || event.deltaX
}

function scrollActiveTabIntoView(path: string) {
  nextTick(() => {
    const container = tabsScrollRef.value

    if (!container) {
      return
    }

    const activeTab = container.querySelector<HTMLElement>(
      `.el-tabs__item[id="tab-${path}"]`
    )

    if (!activeTab) {
      return
    }

    const containerRect = container.getBoundingClientRect()
    const tabRect = activeTab.getBoundingClientRect()
    const overflowLeft = tabRect.left < containerRect.left
    const overflowRight = tabRect.right > containerRect.right

    if (overflowLeft) {
      container.scrollLeft -= containerRect.left - tabRect.left + 12
    } else if (overflowRight) {
      container.scrollLeft += tabRect.right - containerRect.right + 12
    }
  })
}

function handleClearTabs() {
  appStore.clearVisitedTabs()
  appStore.addVisitedTab(dashboardTab)
  router.push(dashboardTab.path)
}

function toggleSidebar() {
  appStore.toggleSidebar()
}

function handleLogout() {
  authStore.logout()
  appStore.clearVisitedTabs()
  router.push('/auth/login')
}
</script>

<style scoped lang="scss">
.main-layout {
  height: 100vh;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgb(226 239 229 / 95%), transparent 28%),
    linear-gradient(180deg, #f5f8f6 0%, #edf3ef 100%);

  &__aside {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: linear-gradient(180deg, #173a33 0%, #20483f 100%);
    border-right: 1px solid rgb(59 93 73 / 8%);
    transition: width 0.2s ease;
  }

  &__aside-scroll {
    flex: 1;
    min-height: 0;
  }

  &__body {
    min-width: 0;
    height: 100vh;
    overflow: hidden;
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
    padding: 20px 24px 16px;
    background: rgb(255 255 255 / 88%);
    border-bottom: 1px solid rgb(59 93 73 / 8%);
    backdrop-filter: blur(14px);
  }

  &__tabs {
    padding: 0 0 8px;
  }

  &__tabs-bar {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    background: rgb(255 255 255 / 76%);
    border-bottom: 1px solid rgb(59 93 73 / 8%);
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 62%);
  }

  &__tabs-scroll {
    flex: 1;
    min-width: 0;
    overflow: auto hidden;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  &__tabs-card {
    min-width: max-content;
  }

  &__tabs-clear {
    flex-shrink: 0;
    font-weight: 600;
    color: #476d60;
  }

  &__main {
    min-width: 0;
    min-height: 0;
    padding: 0;
    overflow: hidden;
  }

  &__main-scroll {
    height: 100%;
    padding: 24px;
  }
}

.main-layout__tabs-scroll::-webkit-scrollbar {
  display: none;
}

:deep(.main-layout__tabs-card .el-tabs__header) {
  margin: 0;
  border-bottom: none;
}

:deep(.main-layout__tabs-card.el-tabs--card > .el-tabs__header) {
  border-bottom: none;
}

:deep(.main-layout__tabs-card .el-tabs__nav-wrap) {
  padding-bottom: 0;
}

:deep(.main-layout__tabs-card .el-tabs__nav) {
  gap: 8px;
  background: transparent;
  border: none;
}

:deep(.main-layout__tabs-card.el-tabs--card > .el-tabs__header .el-tabs__nav) {
  border: none;
  border-radius: 0;
}

:deep(.main-layout__tabs-card .el-tabs__item) {
  height: 38px;
  padding: 0 18px;
  margin-right: 8px;
  color: #628176;
  background: linear-gradient(180deg, #eef4f1 0%, #e5ede8 100%);
  transition:
    color 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

:deep(.main-layout__tabs-card.el-tabs--card > .el-tabs__header .el-tabs__item) {
  margin-top: 0;
  border: none;
}

:deep(.main-layout__tabs-card .el-tabs__item:hover) {
  color: #173a33;
  background: linear-gradient(180deg, #f7fbf8 0%, #edf4f0 100%);
  box-shadow: 0 6px 16px rgb(64 95 81 / 8%);
}

:deep(.main-layout__tabs-card .el-tabs__item.is-active) {
  font-weight: 700;
  color: #16362f;
  background: linear-gradient(180deg, #fffaf0 0%, #fff 100%);
  box-shadow: 0 10px 24px rgb(64 95 81 / 10%);
}

:deep(.main-layout__tabs-card .el-tabs__content) {
  display: none;
}

.main-layout__tab-label {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  max-width: 100%;
}

.main-layout__tab-text {
  line-height: 1;
  white-space: nowrap;
}

.main-layout__tab-close {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  font-size: 14px;
  line-height: 1;
  color: #93a89f;
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 999px;
  transition:
    color 0.18s ease,
    background-color 0.18s ease,
    box-shadow 0.18s ease;
}

:deep(.main-layout__tabs-card .el-tabs__item:hover) .main-layout__tab-close {
  color: #45675a;
}

:deep(.main-layout__tabs-card .el-tabs__item.is-active) .main-layout__tab-close {
  color: #173a33;
}

.main-layout__tab-close:hover {
  color: #173a33;
  background: rgb(64 95 81 / 12%);
  box-shadow: 0 0 0 1px rgb(64 95 81 / 8%);
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

    &__tabs {
      padding: 0 16px 8px;
    }

    &__tabs-bar {
      flex-direction: column;
      align-items: stretch;
      padding: 12px 12px 0;
    }

    &__main {
      padding: 0;
    }

    &__main-scroll {
      padding: 16px;
    }
  }

  .toolbar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
