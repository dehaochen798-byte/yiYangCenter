import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface VisitedTab {
  path: string
  title: string
}

const DEFAULT_TAB_PATH = '/dashboard'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const activeTabPath = ref(DEFAULT_TAB_PATH)
  const visitedTabs = ref<VisitedTab[]>([])

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function addVisitedTab(tab: VisitedTab) {
    const exists = visitedTabs.value.some((item) => item.path === tab.path)

    if (!exists) {
      visitedTabs.value.push(tab)
    }

    activeTabPath.value = tab.path
  }

  function removeVisitedTab(path: string) {
    const index = visitedTabs.value.findIndex((item) => item.path === path)

    if (index === -1) {
      return
    }

    visitedTabs.value.splice(index, 1)

    if (activeTabPath.value === path) {
      const fallback = visitedTabs.value[index - 1] || visitedTabs.value[index] || null
      activeTabPath.value = fallback?.path || DEFAULT_TAB_PATH
    }
  }

  function clearVisitedTabs() {
    visitedTabs.value = []
    activeTabPath.value = DEFAULT_TAB_PATH
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
