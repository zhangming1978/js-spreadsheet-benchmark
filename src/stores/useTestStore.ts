import { create } from 'zustand'
import { TestScenario, TestStatus, ProductType, TestConfig, TestResult } from '@/types'

interface TestState {
  // 测试状态
  status: TestStatus
  currentScenario: TestScenario | null
  currentProduct: ProductType | null

  // 测试配置
  config: TestConfig | null
  selectedProducts: ProductType[]

  // 测试结果
  results: TestResult[]

  // Actions
  setStatus: (status: TestStatus) => void
  setCurrentScenario: (scenario: TestScenario | null) => void
  setCurrentProduct: (product: ProductType | null) => void
  setConfig: (config: TestConfig) => void
  setSelectedProducts: (products: ProductType[]) => void
  addResult: (result: TestResult) => void
  clearResults: () => void
  reset: () => void
}

export const useTestStore = create<TestState>((set) => ({
  // Initial state
  status: TestStatus.IDLE,
  currentScenario: null,
  currentProduct: null,
  config: null,
  selectedProducts: [ProductType.SPREADJS, ProductType.UNIVER, ProductType.HANDSONTABLE],
  results: [],

  // Actions
  setStatus: (status) => set({ status }),
  setCurrentScenario: (scenario) => set({ currentScenario: scenario }),
  setCurrentProduct: (product) => set({ currentProduct: product }),
  setConfig: (config) => set({ config }),
  setSelectedProducts: (products) => set({ selectedProducts: products }),
  addResult: (result) => set((state) => ({ results: [...state.results, result] })),
  clearResults: () => set({ results: [] }),
  reset: () => set({
    status: TestStatus.IDLE,
    currentScenario: null,
    currentProduct: null,
    config: null,
    results: []
  })
}))
