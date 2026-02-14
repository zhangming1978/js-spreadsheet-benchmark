import { create } from 'zustand'

interface UIState {
  // UI 状态
  sidebarCollapsed: boolean
  activeTab: string

  // Actions
  setSidebarCollapsed: (collapsed: boolean) => void
  setActiveTab: (tab: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  sidebarCollapsed: false,
  activeTab: 'chart',

  // Actions
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setActiveTab: (tab) => set({ activeTab: tab })
}))
