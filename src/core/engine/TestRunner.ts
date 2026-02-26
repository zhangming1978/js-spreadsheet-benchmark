import type { ProductAdapter } from '../adapters/ProductAdapter'
import { TestScenario, ProductType, type TestResult, type RunResult } from '@/types'
import { DataGenerator } from './DataGenerator'
import { useTestStore } from '@/stores/useTestStore'

/**
 * 单个产品的测试运行器
 * 负责执行具体的测试场景
 */
export class TestRunner {
  private adapter: ProductAdapter
  private container: HTMLElement

  constructor(adapter: ProductAdapter, container: HTMLElement) {
    this.adapter = adapter
    this.container = container
  }

  /**
   * 运行测试
   * @param scenario - 测试场景
   * @param dataSize - 数据规模
   * @returns 测试结果
   */
  async runTest(scenario: TestScenario, dataSize: number): Promise<TestResult> {
    console.log(`[TestRunner] Starting test - Scenario: ${scenario}, DataSize: ${dataSize}`)

    let success = false
    let error: string | undefined
    let initializationTime = 0
    const runs: RunResult[] = []
    const numRuns = 3 // 运行3次

    try {
      // 步骤1: 初始化产品(只初始化一次,不计入测试时间)
      console.log(`[TestRunner] Initializing adapter: ${this.adapter.getProductName()}`)
      const store = useTestStore.getState()
      store.setTestStage('初始化中...')
      store.setTotalRuns(numRuns)

      // 延迟一下，让用户看到"初始化中..."的提示
      await this.sleep(800)

      const initStartTime = performance.now()
      await this.adapter.initialize(this.container)
      const initEndTime = performance.now()
      initializationTime = initEndTime - initStartTime
      console.log(`[TestRunner] Adapter initialized in ${initializationTime.toFixed(2)}ms`)

      // 初始化完成后，延迟一下再开始测试
      await this.sleep(500)

      // 步骤2: 预生成测试数据（不计入测试时间）
      let tableData: any[][] | null = null
      let formulaDataset: ReturnType<typeof DataGenerator.generateFormulaData> | null = null
      if (scenario === TestScenario.FORMULA) {
        formulaDataset = DataGenerator.generateFormulaData(dataSize)
      } else {
        tableData = DataGenerator.generateTableData(dataSize)
      }

      // 步骤3: 运行测试3次
      for (let runNumber = 1; runNumber <= numRuns; runNumber++) {
        console.log(`[TestRunner] ========== Run ${runNumber}/${numRuns} ==========`)
        store.setCurrentRun(runNumber)
        store.setTestStage(`运行测试 ${runNumber}/${numRuns}`)

        // 延迟一下，让用户看到当前运行的提示
        await this.sleep(600)

        // 执行测试场景
        console.log(`[TestRunner] Executing test scenario: ${scenario}`)
        const testStartTime = performance.now()

        // 启动性能监控
        const monitorInterval = setInterval(() => {
          const store = useTestStore.getState()
          store.setCurrentFPS(this.adapter.getFPS())
          store.setCurrentMemory(this.adapter.getMemoryUsage())
        }, 200) // 每200ms更新一次

        try {
          switch (scenario) {
            case TestScenario.DATA_LOADING:
              await this.testDataLoading(tableData!)
              break
            case TestScenario.SCROLLING:
              await this.testScrolling(tableData!, dataSize)
              break
            case TestScenario.EDITING:
              await this.testEditing(tableData!)
              break
            case TestScenario.FORMULA:
              await this.testFormula(formulaDataset!)
              break
            case TestScenario.RENDERING:
              await this.testRendering(tableData!)
              break
            case TestScenario.MEMORY:
              await this.testMemory(tableData!)
              break
            default:
              throw new Error(`Unknown test scenario: ${scenario}`)
          }
        } finally {
          // 停止性能监控
          clearInterval(monitorInterval)
        }

        const testEndTime = performance.now()
        const executionTime = testEndTime - testStartTime

        // 获取性能指标
        const memoryUsage = this.adapter.getMemoryUsage()
        const fps = this.adapter.getFPS()

        console.log(`[TestRunner] Run ${runNumber} completed in ${executionTime.toFixed(2)}ms (FPS: ${fps}, Memory: ${memoryUsage}MB)`)

        // 保存本次运行结果
        runs.push({
          runNumber,
          executionTime,
          memoryUsage,
          fps
        })

        // 每次运行后都清理数据，确保测试环境一致
        console.log(`[TestRunner] Cleaning up after run ${runNumber}...`)
        await this.adapter.loadData([[]])

        // 如果不是最后一次运行，延迟一下让用户看到结果
        if (runNumber < numRuns) {
          await this.sleep(800)
        }
      }

      success = true
      console.log(`[TestRunner] All ${numRuns} runs completed successfully`)
    } catch (err) {
      success = false
      error = err instanceof Error ? err.message : String(err)
      console.error(`[TestRunner] Test failed for ${this.adapter.getProductName()}:`, err)
    } finally {
      // 清除实时性能数据
      const store = useTestStore.getState()
      store.setCurrentFPS(0)
      store.setCurrentMemory(0)
      store.setCurrentRun(0)
      store.setTestStage('')
    }

    // 计算平均值
    const avgExecutionTime = runs.length > 0
      ? runs.reduce((sum, r) => sum + r.executionTime, 0) / runs.length
      : 0
    const avgMemoryUsage = runs.length > 0
      ? runs.reduce((sum, r) => sum + r.memoryUsage, 0) / runs.length
      : 0
    const avgFps = runs.length > 0
      ? runs.reduce((sum, r) => sum + r.fps, 0) / runs.length
      : 0

    const result: TestResult = {
      productName: this.adapter.getProductType() as ProductType,
      scenario,
      dataSize,
      metrics: {
        productName: this.adapter.getProductType() as ProductType,
        scenario,
        executionTime: avgExecutionTime,
        memoryUsage: avgMemoryUsage,
        fps: avgFps,
        timestamp: Date.now()
      },
      runs,
      initializationTime,
      success,
      error
    }

    console.log(`[TestRunner] Final result (avg of ${runs.length} runs):`, result)
    return result
  }

  /**
   * 测试数据加载性能
   */
  private async testDataLoading(data: any[][]): Promise<void> {
    await this.adapter.loadData(data)
  }

  /**
   * 测试滚动性能
   */
  private async testScrolling(data: any[][], dataSize: number): Promise<void> {
    await this.adapter.loadData(data)

    const scrollSteps = 10
    for (let i = 0; i < scrollSteps; i++) {
      const targetRow = Math.floor((dataSize / scrollSteps) * i)
      this.adapter.scrollTo(targetRow, 0)
      await this.sleep(50)
    }
  }

  /**
   * 测试编辑性能
   */
  private async testEditing(data: any[][]): Promise<void> {
    await this.adapter.loadData(data)

    const editCount = Math.min(100, data.length - 1)
    const values = Array.from({ length: editCount }, (_, i) => [`编辑${i}`])
    this.adapter.setRangeValues(0, 1, values)
  }

  /**
   * 测试公式计算性能
   */
  private async testFormula(dataset: ReturnType<typeof DataGenerator.generateFormulaData>): Promise<void> {
    await this.adapter.loadFormulaData(dataset)
    this.adapter.recalculate()
  }

  /**
   * 测试渲染性能
   */
  private async testRendering(data: any[][]): Promise<void> {
    await this.adapter.loadData(data)
    await this.sleep(100)
  }

  /**
   * 测试内存占用
   */
  private async testMemory(data: any[][]): Promise<void> {
    await this.adapter.loadData(data)
    await this.sleep(500)
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    await this.adapter.destroy()
  }

  /**
   * 辅助方法：延迟
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
