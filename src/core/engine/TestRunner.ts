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
      // 步骤1: 初始化产品（只初始化一次，不计入测试时间）
      console.log(`[TestRunner] Initializing adapter: ${this.adapter.getProductName()}`)
      const initStartTime = performance.now()
      await this.adapter.initialize(this.container)
      const initEndTime = performance.now()
      initializationTime = initEndTime - initStartTime
      console.log(`[TestRunner] Adapter initialized in ${initializationTime.toFixed(2)}ms`)

      // 步骤2: 运行测试3次
      for (let runNumber = 1; runNumber <= numRuns; runNumber++) {
        console.log(`[TestRunner] ========== Run ${runNumber}/${numRuns} ==========`)

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
              await this.testDataLoading(dataSize)
              break
            case TestScenario.SCROLLING:
              await this.testScrolling(dataSize)
              break
            case TestScenario.EDITING:
              await this.testEditing(dataSize)
              break
            case TestScenario.FORMULA:
              await this.testFormula(dataSize)
              break
            case TestScenario.RENDERING:
              await this.testRendering(dataSize)
              break
            case TestScenario.MEMORY:
              await this.testMemory(dataSize)
              break
            case TestScenario.EXCEL_IMPORT:
              await this.testExcelImport(dataSize)
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

        // 如果不是最后一次运行，清理数据准备下一次
        if (runNumber < numRuns) {
          console.log(`[TestRunner] Cleaning up for next run...`)
          // 清空数据但不销毁适配器
          await this.adapter.loadData([[]])
          await this.sleep(500) // 短暂等待，让内存稳定
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
  private async testDataLoading(dataSize: number): Promise<void> {
    const data = DataGenerator.generateTableData(dataSize)
    await this.adapter.loadData(data)
  }

  /**
   * 测试滚动性能
   */
  private async testScrolling(dataSize: number): Promise<void> {
    // 先加载数据
    const data = DataGenerator.generateTableData(dataSize)
    await this.adapter.loadData(data)

    // 模拟滚动操作
    const scrollSteps = 10
    for (let i = 0; i < scrollSteps; i++) {
      const targetRow = Math.floor((dataSize / scrollSteps) * i)
      this.adapter.scrollTo(targetRow, 0)
      await this.sleep(50) // 等待渲染
    }
  }

  /**
   * 测试编辑性能
   */
  private async testEditing(dataSize: number): Promise<void> {
    // 先加载数据
    const data = DataGenerator.generateTableData(dataSize)
    await this.adapter.loadData(data)

    // 批量编辑单元格
    const editCount = Math.min(100, dataSize)
    for (let i = 0; i < editCount; i++) {
      this.adapter.setCellValue(i, 1, `编辑${i}`)
    }
  }

  /**
   * 测试公式计算性能
   */
  private async testFormula(dataSize: number): Promise<void> {
    // 加载包含公式的数据
    const data = DataGenerator.generateFormulaData(dataSize)
    await this.adapter.loadData(data)
    this.adapter.recalculate()
  }

  /**
   * 测试渲染性能
   */
  private async testRendering(dataSize: number): Promise<void> {
    const data = DataGenerator.generateTableData(dataSize)
    await this.adapter.loadData(data)
    // 等待渲染完成
    await this.sleep(100)
  }

  /**
   * 测试内存占用
   */
  private async testMemory(dataSize: number): Promise<void> {
    const data = DataGenerator.generateTableData(dataSize)
    await this.adapter.loadData(data)
    await this.sleep(500) // 等待内存稳定
  }

  /**
   * 测试Excel导入性能
   */
  private async testExcelImport(dataSize: number): Promise<void> {
    // TODO: 实际实现需要导入真实的Excel文件
    // 目前使用模拟数据
    const data = DataGenerator.generateTableData(dataSize)
    await this.adapter.loadData(data)
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
