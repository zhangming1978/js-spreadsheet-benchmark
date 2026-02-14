import type { ProductAdapter } from '../adapters/ProductAdapter'
import { TestScenario, ProductType, type TestResult } from '@/types'
import { DataGenerator } from './DataGenerator'

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
    const startTime = performance.now()
    let endTime = 0
    let success = false
    let error: string | undefined

    try {
      // 初始化产品
      await this.adapter.initialize(this.container)

      // 根据场景执行不同的测试
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

      endTime = performance.now()
      success = true
    } catch (err) {
      endTime = performance.now()
      success = false
      error = err instanceof Error ? err.message : String(err)
      console.error(`[TestRunner] Test failed for ${this.adapter.getProductName()}:`, err)
    }

    const result: TestResult = {
      productName: this.adapter.getProductType() as ProductType,
      scenario,
      metrics: {
        productName: this.adapter.getProductType() as ProductType,
        scenario,
        executionTime: endTime - startTime,
        memoryUsage: this.adapter.getMemoryUsage(),
        fps: this.adapter.getFPS(),
        timestamp: Date.now()
      },
      success,
      error
    }

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
