import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface VisitedTab {
  path: string
  title: string
}

const DEFAULT_TAB: VisitedTab = {
  path: '/dashboard',
  title: '系统首页',
}

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const activeTabPath = ref(DEFAULT_TAB.path)
  const visitedTabs = ref<VisitedTab[]>([DEFAULT_TAB])

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function addVisitedTab(tab: VisitedTab) {
    if (tab.path === DEFAULT_TAB.path) {
      visitedTabs.value = [
        DEFAULT_TAB,
        ...visitedTabs.value.filter((item) => item.path !== DEFAULT_TAB.path),
      ]
      activeTabPath.value = DEFAULT_TAB.path
      return
    }

    const exists = visitedTabs.value.some((item) => item.path === tab.path)

    if (!exists) {
      visitedTabs.value = [DEFAULT_TAB, ...visitedTabs.value.slice(1), tab]
    } else {
      visitedTabs.value = [
        DEFAULT_TAB,
        ...visitedTabs.value.slice(1).filter((item) => item.path !== tab.path),
        tab,
      ]
    }

    activeTabPath.value = tab.path
  }

  function removeVisitedTab(path: string) {
    if (path === DEFAULT_TAB.path) {
      return
    }

    const index = visitedTabs.value.findIndex((item) => item.path === path)

    if (index === -1) {
      return
    }

    visitedTabs.value.splice(index, 1)

    if (activeTabPath.value === path) {
      const fallback = visitedTabs.value[index - 1] || visitedTabs.value[index] || DEFAULT_TAB
      activeTabPath.value = fallback.path
    }

    visitedTabs.value = [
      DEFAULT_TAB,
      ...visitedTabs.value.filter((item) => item.path !== DEFAULT_TAB.path),
    ]
  }

  function clearVisitedTabs() {
    visitedTabs.value = [DEFAULT_TAB]
    activeTabPath.value = DEFAULT_TAB.path
  }

  function setActiveTab(path: string) {
    activeTabPath.value = path
  }

  return {
    sidebarCollapsed,
    activeTabPath,
    visitedTabs,
    toggleSidebar,
    addVisitedTab,
    removeVisitedTab,
    clearVisitedTabs,
    setActiveTab,
  }
})
