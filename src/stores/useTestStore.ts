import { create } from 'zustand'
import { TestScenario, TestStatus, ProductType, TestConfig, TestResult } from '@/types'

// 产品测试状态
export interface ProductTestStatus {
  product: ProductType
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  currentTime?: number
  error?: string
}

// 测试进度信息
export interface TestProgress {
  totalTests: number
  completedTests: number
  currentTest: string
  percentage: number
  estimatedTimeRemaining?: number
}

interface TestState {
  // 测试状态
  status: TestStatus
  currentScenario: TestScenario | null
  currentProduct: ProductType | null
  isRunning: boolean

  // 测试配置
  config: TestConfig | null
  selectedProducts: ProductType[]
  selectedScenario: TestScenario
  dataSize: number
  cooldownTime: number

  // 测试进度
  progress: TestProgress
  productStatuses: Map<ProductType, ProductTestStatus>

  // 测试结果
  results: TestResult[]

  // 实时性能指标
  currentFPS: number
  currentMemory: number

  // 测试运行进度
  currentRun: number
  totalRuns: number
  testStage: string

  // 测试确认状态
  waitingForConfirmation: boolean
  currentTestResult: TestResult | null
  isLastTest: boolean

  // Actions
  setStatus: (status: TestStatus) => void
  setCurrentScenario: (scenario: TestScenario | null) => void
  setCurrentProduct: (product: ProductType | null) => void
  setIsRunning: (isRunning: boolean) => void
  setConfig: (config: TestConfig) => void
  setSelectedProducts: (products: ProductType[]) => void
  setSelectedScenario: (scenario: TestScenario) => void
  setDataSize: (size: number) => void
  setCooldownTime: (time: number) => void
  setProgress: (progress: Partial<TestProgress>) => void
  updateProductStatus: (product: ProductType, status: Partial<ProductTestStatus>) => void
  addResult: (result: TestResult) => void
  clearResults: () => void
  setCurrentFPS: (fps: number) => void
  setCurrentMemory: (memory: number) => void
  setCurrentRun: (run: number) => void
  setTotalRuns: (total: number) => void
  setTestStage: (stage: string) => void
  setWaitingForConfirmation: (waiting: boolean) => void
  setCurrentTestResult: (result: TestResult | null) => void
  setIsLastTest: (isLast: boolean) => void
  reset: () => void
}

export const useTestStore = create<TestState>((set) => ({
  // Initial state
  status: TestStatus.IDLE,
  currentScenario: null,
  currentProduct: null,
  isRunning: false,
  config: null,
  selectedProducts: [ProductType.SPREADJS, ProductType.UNIVER, ProductType.HANDSONTABLE],
  selectedScenario: TestScenario.DATA_LOADING,
  dataSize: 5000,
  cooldownTime: 5,
  progress: {
    totalTests: 0,
    completedTests: 0,
    currentTest: '',
    percentage: 0
  },
  productStatuses: new Map(),
  results: [],
  currentFPS: 0,
  currentMemory: 0,
  currentRun: 0,
  totalRuns: 3,
  testStage: '',
  waitingForConfirmation: false,
  currentTestResult: null,
  isLastTest: false,

  // Actions
  setStatus: (status) => set({ status }),
  setCurrentScenario: (scenario) => set({ currentScenario: scenario }),
  setCurrentProduct: (product) => set({ currentProduct: product }),
  setIsRunning: (isRunning) => set({ isRunning }),
  setConfig: (config) => set({ config }),
  setSelectedProducts: (products) => set({ selectedProducts: products }),
  setSelectedScenario: (scenario) => set({ selectedScenario: scenario }),
  setDataSize: (size) => set({ dataSize: size }),
  setCooldownTime: (time) => set({ cooldownTime: time }),
  setProgress: (progress) => set((state) => ({
    progress: { ...state.progress, ...progress }
  })),
  updateProductStatus: (product, status) => set((state) => {
    const newStatuses = new Map(state.productStatuses)
    const currentStatus = newStatuses.get(product) || {
      product,
      status: 'pending',
      progress: 0
    }
    newStatuses.set(product, { ...currentStatus, ...status })
    return { productStatuses: newStatuses }
  }),
  addResult: (result) => set((state) => ({ results: [...state.results, result] })),
  clearResults: () => set({ results: [], productStatuses: new Map() }),
  setCurrentFPS: (fps) => set({ currentFPS: fps }),
  setCurrentMemory: (memory) => set({ currentMemory: memory }),
  setCurrentRun: (run) => set({ currentRun: run }),
  setTotalRuns: (total) => set({ totalRuns: total }),
  setTestStage: (stage) => set({ testStage: stage }),
  setWaitingForConfirmation: (waiting) => set({ waitingForConfirmation: waiting }),
  setCurrentTestResult: (result) => set({ currentTestResult: result }),
  setIsLastTest: (isLast) => set({ isLastTest: isLast }),
  reset: () => set({
    status: TestStatus.IDLE,
    currentScenario: null,
    currentProduct: null,
    isRunning: false,
    config: null,
    results: [],
    productStatuses: new Map(),
    progress: {
      totalTests: 0,
      completedTests: 0,
      currentTest: '',
      percentage: 0
    },
    currentFPS: 0,
    currentMemory: 0,
    currentRun: 0,
    totalRuns: 3,
    testStage: '',
    waitingForConfirmation: false,
    currentTestResult: null,
    isLastTest: false
  })
}))
