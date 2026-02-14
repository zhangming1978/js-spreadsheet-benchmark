import type { ProductType, TestScenario, TestResult } from '@/types'
import { AdapterFactory } from '../adapters/AdapterFactory'
import { TestRunner } from './TestRunner'
import { useTestStore } from '@/stores/useTestStore'

/**
 * 测试配置接口
 */
export interface TestConfig {
  scenario: TestScenario
  dataSize: number
  products: ProductType[]
  cooldownTime: number
}

/**
 * 性能测试引擎
 * 负责协调整个测试流程
 */
export class TestEngine {
  private config: TestConfig
  private results: TestResult[] = []
  private isRunning: boolean = false
  private shouldStop: boolean = false

  constructor(config: TestConfig) {
    this.config = config
  }

  /**
   * 开始测试
   */
  async start(): Promise<TestResult[]> {
    if (this.isRunning) {
      throw new Error('Test is already running')
    }

    this.isRunning = true
    this.shouldStop = false
    this.results = []

    const store = useTestStore.getState()
    store.setIsRunning(true)
    store.setCurrentProduct(null)
    store.setProgress({
      totalTests: this.config.products.length,
      completedTests: 0,
      currentTest: '',
      percentage: 0
    })

    try {
      const totalProducts = this.config.products.length

      for (let i = 0; i < totalProducts; i++) {
        if (this.shouldStop) {
          console.log('[TestEngine] Test stopped by user')
          break
        }

        const productType = this.config.products[i]
        const percentage = Math.floor(((i + 1) / totalProducts) * 100)

        // 更新当前测试产品
        store.setCurrentProduct(productType)
        store.setProgress({
          completedTests: i,
          currentTest: productType,
          percentage
        })

        // 运行单个产品测试
        const result = await this.runProductTest(productType)
        this.results.push(result)

        // 更新测试结果到 store
        store.addResult(result)

        // 冷却时间（除了最后一个产品）
        if (i < totalProducts - 1) {
          await this.cooldown(this.config.cooldownTime)
        }
      }

      store.setProgress({
        completedTests: totalProducts,
        percentage: 100
      })
      console.log('[TestEngine] All tests completed')
    } catch (error) {
      console.error('[TestEngine] Test failed:', error)
      throw error
    } finally {
      this.isRunning = false
      store.setIsRunning(false)
      store.setCurrentProduct(null)
    }

    return this.results
  }

  /**
   * 停止测试
   */
  stop(): void {
    if (!this.isRunning) {
      return
    }

    console.log('[TestEngine] Stopping test...')
    this.shouldStop = true
  }

  /**
   * 运行单个产品的测试
   */
  private async runProductTest(productType: ProductType): Promise<TestResult> {
    // 创建容器
    const container = this.createContainer(productType)

    try {
      // 创建适配器
      const adapter = AdapterFactory.create(productType)

      // 创建测试运行器
      const runner = new TestRunner(adapter, container)

      // 运行测试
      const result = await runner.runTest(this.config.scenario, this.config.dataSize)

      // 清理
      await runner.cleanup()

      return result
    } finally {
      // 移除容器
      this.removeContainer(container)
    }
  }

  /**
   * 创建测试容器
   */
  private createContainer(productType: ProductType): HTMLElement {
    const container = document.createElement('div')
    container.id = `test-container-${productType}`
    container.style.cssText = `
      position: absolute;
      top: -10000px;
      left: -10000px;
      width: 800px;
      height: 600px;
      visibility: hidden;
    `
    document.body.appendChild(container)
    return container
  }

  /**
   * 移除测试容器
   */
  private removeContainer(container: HTMLElement): void {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
  }

  /**
   * 冷却时间
   */
  private async cooldown(seconds: number): Promise<void> {
    // 强制垃圾回收（如果浏览器支持）
    if (typeof (window as any).gc === 'function') {
      (window as any).gc()
    }

    // 等待指定时间
    await new Promise(resolve => setTimeout(resolve, seconds * 1000))
  }

  /**
   * 获取测试结果
   */
  getResults(): TestResult[] {
    return this.results
  }

  /**
   * 是否正在运行
   */
  isTestRunning(): boolean {
    return this.isRunning
  }
}
