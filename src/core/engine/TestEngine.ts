import type { ProductType, TestScenario, TestResult } from '@/types'
import { AdapterFactory } from '../adapters/AdapterFactory'
import { TestRunner } from './TestRunner'
import { useTestStore } from '@/stores/useTestStore'
import { message } from 'antd'

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
  private userDecision: 'continue' | 'retest' | 'stop' | null = null
  private userDecisionResolver: ((decision: 'continue' | 'retest' | 'stop') => void) | null = null

  constructor(config: TestConfig) {
    this.config = config
  }

  /**
   * 设置用户决定（由外部调用）
   */
  setUserDecision(decision: 'continue' | 'retest' | 'stop'): void {
    this.userDecision = decision
    if (this.userDecisionResolver) {
      this.userDecisionResolver(decision)
      this.userDecisionResolver = null
    }
  }

  /**
   * 等待用户决定
   */
  private async waitForUserDecision(): Promise<'continue' | 'retest' | 'stop'> {
    return new Promise((resolve) => {
      this.userDecisionResolver = resolve
    })
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
      let i = 0

      while (i < totalProducts) {
        if (this.shouldStop) {
          console.log('[TestEngine] Test stopped by user')
          break
        }

        const productType = this.config.products[i]
        const percentage = Math.floor(((i + 1) / totalProducts) * 100)
        const isLastTest = (i === totalProducts - 1)

        // 更新当前测试产品
        store.setCurrentProduct(productType)
        store.setProgress({
          completedTests: i,
          currentTest: productType,
          percentage
        })

        // 运行单个产品测试
        const result = await this.runProductTest(productType, isLastTest)

        // 如果用户选择重新测试，不增加索引，重新测试当前产品
        if (result === 'retest') {
          console.log(`[TestEngine] Retesting ${productType}`)
          continue // 重新测试当前产品，不增加 i
        }

        // 正常完成，添加结果并继续下一个
        this.results.push(result)
        store.addResult(result)

        // 冷却时间（除了最后一个产品）
        if (i < totalProducts - 1 && !this.shouldStop) {
          await this.cooldown(this.config.cooldownTime)
        }

        i++ // 只有在不是重新测试时才增加索引
      }

      store.setProgress({
        completedTests: totalProducts,
        percentage: 100
      })

      // 所有测试完成
      message.success({ content: '所有测试已完成！', key: 'test-progress', duration: 3 })
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
  private async runProductTest(productType: ProductType, isLastTest: boolean = false): Promise<TestResult | 'retest'> {
    console.log(`[TestEngine] ========== Starting test for ${productType} (isLastTest: ${isLastTest}) ==========`)

    // 显示开始测试的消息
    const productName = productType === 'spreadjs' ? 'SpreadJS' : productType === 'handsontable' ? 'Handsontable' : productType
    message.loading({ content: `正在准备 ${productName} 测试环境...`, key: 'test-progress', duration: 0 })

    // 创建容器（等待容器准备好）
    console.log(`[TestEngine] Step 1: Creating/finding container for ${productType}`)
    const container = await this.createContainer(productType)
    console.log(`[TestEngine] Step 1: Container ready:`, container.id, container.offsetWidth, container.offsetHeight)

    try {
      // 创建适配器
      console.log(`[TestEngine] Step 2: Creating adapter for ${productType}`)
      const adapter = AdapterFactory.create(productType)
      console.log(`[TestEngine] Step 2: Adapter created:`, adapter.getProductName())

      // 创建测试运行器
      console.log(`[TestEngine] Step 3: Creating test runner`)
      const runner = new TestRunner(adapter, container)

      // 运行测试
      message.loading({ content: `正在测试 ${productName}...`, key: 'test-progress', duration: 0 })
      console.log(`[TestEngine] Step 4: Running test scenario: ${this.config.scenario}, dataSize: ${this.config.dataSize}`)
      const testStartTime = performance.now()
      const result = await runner.runTest(this.config.scenario, this.config.dataSize)
      const testEndTime = performance.now()
      console.log(`[TestEngine] Step 4: Test completed in ${(testEndTime - testStartTime).toFixed(2)}ms`)
      console.log(`[TestEngine] Step 4: Test result:`, result)

      // 测试完成消息
      message.success({ content: `${productName} 测试完成！`, key: 'test-progress', duration: 2 })

      const store = useTestStore.getState()

      // 如果是最后一个测试，自动完成不需要用户确认
      if (isLastTest) {
        console.log(`[TestEngine] Step 5: Last test, auto-completing without user confirmation`)
        // 短暂显示结果
        store.setWaitingForConfirmation(true)
        store.setCurrentTestResult(result)
        await new Promise(resolve => setTimeout(resolve, 1500)) // 显示1.5秒
        store.setWaitingForConfirmation(false)
        store.setCurrentTestResult(null)

        // 清理
        console.log(`[TestEngine] Step 6: Cleaning up`)
        await runner.cleanup()
        console.log(`[TestEngine] Step 6: Cleanup complete`)

        console.log(`[TestEngine] ========== Test for ${productType} completed successfully (auto) ==========`)
        return result
      }

      // 非最后一个测试，等待用户确认
      console.log(`[TestEngine] Step 5: Waiting for user confirmation...`)
      store.setWaitingForConfirmation(true)
      store.setCurrentTestResult(result)

      const decision = await this.waitForUserDecision()
      console.log(`[TestEngine] Step 5: User decision: ${decision}`)

      store.setWaitingForConfirmation(false)
      store.setCurrentTestResult(null)

      // 清理
      console.log(`[TestEngine] Step 6: Cleaning up`)
      await runner.cleanup()
      console.log(`[TestEngine] Step 6: Cleanup complete`)

      if (decision === 'retest') {
        console.log(`[TestEngine] User requested retest, returning 'retest' signal`)
        return 'retest'
      }

      if (decision === 'stop') {
        console.log(`[TestEngine] User requested stop`)
        this.shouldStop = true
      }

      console.log(`[TestEngine] ========== Test for ${productType} completed successfully ==========`)
      return result
    } catch (error) {
      console.error(`[TestEngine] ========== Test for ${productType} FAILED ==========`, error)

      // 显示错误消息
      message.error({ content: `${productName} 测试失败`, key: 'test-progress', duration: 3 })

      // 即使失败也要等待用户确认
      const store = useTestStore.getState()
      const errorResult: TestResult = {
        productName: productType,
        scenario: this.config.scenario,
        metrics: {
          productName: productType,
          scenario: this.config.scenario,
          executionTime: 0,
          memoryUsage: 0,
          fps: 0,
          timestamp: Date.now()
        },
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }

      store.setWaitingForConfirmation(true)
      store.setCurrentTestResult(errorResult)

      const decision = await this.waitForUserDecision()
      console.log(`[TestEngine] User decision after error: ${decision}`)

      store.setWaitingForConfirmation(false)
      store.setCurrentTestResult(null)

      if (decision === 'retest') {
        return 'retest'
      }

      if (decision === 'stop') {
        this.shouldStop = true
      }

      return errorResult
    } finally {
      // 移除容器
      console.log(`[TestEngine] Step 7: Removing container`)
      this.removeContainer(container)
      console.log(`[TestEngine] Step 7: Container removed`)
    }
  }

  /**
   * 创建测试容器
   * 优先使用 ProductCard 提供的可见容器，如果不存在则创建隐藏容器
   */
  private async createContainer(productType: ProductType): Promise<HTMLElement> {
    // 尝试查找 ProductCard 提供的可见容器，最多等待 3 秒
    const maxRetries = 30 // 30 次 * 100ms = 3 秒
    let retries = 0

    while (retries < maxRetries) {
      const visibleContainer = document.getElementById(`product-container-${productType}`)

      if (visibleContainer) {
        console.log(`[TestEngine] Using visible container for ${productType}`)
        return visibleContainer
      }

      // 等待 100ms 后重试
      await new Promise(resolve => setTimeout(resolve, 100))
      retries++
    }

    // 如果没有找到可见容器，创建隐藏容器（向后兼容）
    console.log(`[TestEngine] Creating hidden container for ${productType} (visible container not found after ${maxRetries * 100}ms)`)
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
   * 只移除动态创建的隐藏容器，不移除 ProductCard 的可见容器
   */
  private removeContainer(container: HTMLElement): void {
    // 只移除我们创建的隐藏容器，不移除 ProductCard 的容器
    if (container && container.id.startsWith('test-container-') && container.parentNode) {
      container.parentNode.removeChild(container)
    }
    // 如果是 ProductCard 的容器，只清空内容
    else if (container && container.id.startsWith('product-container-')) {
      container.innerHTML = ''
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
