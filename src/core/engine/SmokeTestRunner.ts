import { ProductType, TestScenario } from '../../types'
import { IframeTestManager } from '../iframe/IframeTestManager'

export interface SmokeTestResult {
  product: ProductType
  success: boolean
  error?: string
  duration: number
  details?: string
}

export class SmokeTestRunner {
  /**
   * Run smoke tests for specified products
   */
  async runSmokeTests(products: ProductType[]): Promise<SmokeTestResult[]> {
    const results: SmokeTestResult[] = []

    for (const product of products) {
      const result = await this.testProduct(product)
      results.push(result)
    }

    return results
  }

  /**
   * Test a single product with basic operations
   */
  private async testProduct(product: ProductType): Promise<SmokeTestResult> {
    const startTime = performance.now()
    let iframeManager: IframeTestManager | null = null

    try {
      console.log(`[SmokeTestRunner] 开始测试产品: ${product}`)

      // Get iframe element
      const iframeId = `test-frame-${product}`
      const iframe = document.getElementById(iframeId) as HTMLIFrameElement

      if (!iframe) {
        console.error(`[SmokeTestRunner] 未找到 iframe: ${iframeId}`)
        throw new Error(`未找到产品的 iframe: ${product}`)
      }

      console.log(`[SmokeTestRunner] 找到 iframe: ${iframeId}`)

      // Create iframe manager
      iframeManager = new IframeTestManager(iframe)

      // Wait for iframe ready
      console.log(`[SmokeTestRunner] 等待 iframe 就绪...`)
      await iframeManager.waitForReady()
      console.log(`[SmokeTestRunner] iframe 已就绪`)

      // Initialize product
      console.log(`[SmokeTestRunner] 初始化产品...`)
      const initTime = await iframeManager.initialize(product)
      console.log(`[SmokeTestRunner] 产品初始化完成: ${initTime.toFixed(0)}ms`)

      // Run a quick test with small data (100 rows instead of 10)
      console.log(`[SmokeTestRunner] 运行快速测试...`)
      const testResult = await iframeManager.runTest(TestScenario.DATA_LOADING, 100, 1)
      console.log(`[SmokeTestRunner] 测试完成: ${testResult.executionTime.toFixed(0)}ms`)

      // Cleanup
      console.log(`[SmokeTestRunner] 清理资源...`)
      await iframeManager.cleanup()
      iframeManager.destroy()
      console.log(`[SmokeTestRunner] 清理完成`)

      const duration = performance.now() - startTime

      return {
        product,
        success: true,
        duration,
        details: `初始化: ${initTime.toFixed(0)}ms, 数据加载: ${testResult.executionTime.toFixed(0)}ms`
      }
    } catch (error) {
      const duration = performance.now() - startTime
      console.error(`[SmokeTestRunner] 测试失败 (${product}):`, error)

      // Cleanup on error
      if (iframeManager) {
        try {
          await iframeManager.cleanup()
          iframeManager.destroy()
        } catch (cleanupError) {
          console.error('[SmokeTestRunner] 清理时出错:', cleanupError)
        }
      }

      return {
        product,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration
      }
    }
  }
}
