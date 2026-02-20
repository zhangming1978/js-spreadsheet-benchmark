import type { ProductType, TestScenario, TestResult } from '@/types'
import { IframeTestRunner } from './IframeTestRunner'
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
  private userDecisionResolver: ((decision: 'continue' | 'retest' | 'stop') => void) | null = null
  private countdownTimer: number | null = null
  private readonly AUTO_CONTINUE_SECONDS = 10

  constructor(config: TestConfig) {
    this.config = config
  }

  /**
   * 设置用户决定（由外部调用）
   */
  setUserDecision(decision: 'continue' | 'retest' | 'stop'): void {
    // 清除倒计时
    if (this.countdownTimer !== null) {
      clearInterval(this.countdownTimer)
      this.countdownTimer = null
    }

    if (this.userDecisionResolver) {
      this.userDecisionResolver(decision)
      this.userDecisionResolver = null
    }
  }

  /**
   * 等待用户决定
   */
  private async waitForUserDecision(): Promise<'continue' | 'retest' | 'stop'> {
    const store = useTestStore.getState()

    // 检查是否启用自动继续
    if (store.autoContinueEnabled) {
      // 启动倒计时
      let countdown = this.AUTO_CONTINUE_SECONDS
      store.setAutoContinueCountdown(countdown)

      this.countdownTimer = window.setInterval(() => {
        countdown--
        store.setAutoContinueCountdown(countdown)

        if (countdown <= 0) {
          // 倒计时结束，自动继续
          if (this.countdownTimer !== null) {
            clearInterval(this.countdownTimer)
            this.countdownTimer = null
          }
          store.setAutoContinueCountdown(0)

          // 自动触发继续
          if (this.userDecisionResolver) {
            this.userDecisionResolver('continue')
            this.userDecisionResolver = null
          }
        }
      }, 1000)
    }

    return new Promise((resolve) => {
      this.userDecisionResolver = resolve
    })
  }

  /**
   * 开始测试
   */
  async start(): Promise<TestResult[]> {
    if (this.isRunning) {
      throw new Error('测试已在运行中')
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
          console.log('[TestEngine] 测试已被用户停止')
          break
        }

        const productType = this.config.products[i]
        const percentage = Math.floor(((i + 1) / totalProducts) * 100)
        const isLastTest = (i === totalProducts - 1)
        const nextProduct = i < totalProducts - 1 ? this.config.products[i + 1] : null

        // 更新当前测试产品
        store.setCurrentProduct(productType)
        store.setProgress({
          completedTests: i,
          currentTest: productType,
          percentage
        })

        // 运行单个产品测试
        const result = await this.runProductTest(productType, isLastTest, nextProduct)

        // 如果用户选择重新测试，不增加索引，重新测试当前产品
        if (result === 'retest') {
          console.log(`[TestEngine] 正在重新测试 ${productType}`)
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
      console.log('[TestEngine] 所有测试已完成')
    } catch (error) {
      console.error('[TestEngine] 测试失败:', error)
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

    console.log('[TestEngine] 正在停止测试...')
    this.shouldStop = true
  }

  /**
   * 运行单个产品的测试
   */
  private async runProductTest(productType: ProductType, isLastTest: boolean = false, nextProduct: ProductType | null = null): Promise<TestResult | 'retest'> {
    console.log(`[TestEngine] ========== 开始测试 ${productType} (最后一个测试: ${isLastTest}) ==========`)

    // 显示开始测试的消息
    const productName = productType === 'spreadjs' ? 'SpreadJS' : productType === 'handsontable' ? 'Handsontable' : productType
    message.loading({ content: `正在准备 ${productName} 测试环境...`, key: 'test-progress', duration: 0 })

    try {
      // 创建 iframe 测试运行器
      console.log(`[TestEngine] 步骤 1: 为 ${productType} 创建 iframe 测试运行器`)
      const runner = new IframeTestRunner(productType)

      // 运行测试
      message.loading({ content: `正在测试 ${productName}...`, key: 'test-progress', duration: 0 })
      console.log(`[TestEngine] 步骤 2: 运行测试场景: ${this.config.scenario}, 数据规模: ${this.config.dataSize}`)
      const testStartTime = performance.now()
      const result = await runner.runTest(this.config.scenario, this.config.dataSize)
      const testEndTime = performance.now()
      console.log(`[TestEngine] 步骤 2: 测试完成，耗时 ${(testEndTime - testStartTime).toFixed(2)}ms`)
      console.log(`[TestEngine] 步骤 2: 测试结果:`, result)

      // 测试完成消息
      message.success({ content: `${productName} 测试完成！`, key: 'test-progress', duration: 2 })

      const store = useTestStore.getState()

      // 所有测试（包括最后一个）都等待用户确认
      console.log(`[TestEngine] 步骤 3: 等待用户确认... (最后一个测试: ${isLastTest})`)
      store.setIsLastTest(isLastTest)
      store.setWaitingForConfirmation(true)
      store.setCurrentTestResult(result)

      const decision = await this.waitForUserDecision()
      console.log(`[TestEngine] 步骤 3: 用户决定: ${decision}`)

      store.setWaitingForConfirmation(false)
      store.setCurrentTestResult(null)
      store.setAutoContinueCountdown(0)

      // 测试完成后立即清理资源，释放内存（在切换产品之前）
      if (decision === 'continue' || decision === 'stop') {
        console.log(`[TestEngine] 步骤 4: 测试完成后清理资源`)
        await runner.cleanup()
        console.log(`[TestEngine] 步骤 4: 清理完成`)
      }

      // 清理完成后再切换到下一个产品
      if (decision === 'continue') {
        store.setCurrentProduct(nextProduct)
      }

      // 只在重新测试时需要返回 retest 信号
      if (decision === 'retest') {
        console.log(`[TestEngine] 步骤 4: 为重新测试清理资源`)
        await runner.cleanup()
        console.log(`[TestEngine] 步骤 4: 清理完成`)
        console.log(`[TestEngine] 用户请求重新测试，返回 'retest' 信号`)
        return 'retest'
      }

      if (decision === 'stop') {
        console.log(`[TestEngine] 用户请求停止`)
        this.shouldStop = true
      }

      console.log(`[TestEngine] ========== 测试 ${productType} 成功完成 ==========`)
      return result
    } catch (error) {
      console.error(`[TestEngine] ========== 测试 ${productType} 失败 ==========`, error)

      // 显示错误消息
      message.error({ content: `${productName} 测试失败`, key: 'test-progress', duration: 3 })

      // 即使失败也要等待用户确认
      const store = useTestStore.getState()
      const errorResult: TestResult = {
        productName: productType,
        scenario: this.config.scenario,
        dataSize: this.config.dataSize,
        metrics: {
          productName: productType,
          scenario: this.config.scenario,
          executionTime: 0,
          memoryUsage: 0,
          fps: 0,
          timestamp: Date.now()
        },
        runs: [],
        initializationTime: 0,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }

      store.setWaitingForConfirmation(true)
      store.setCurrentTestResult(errorResult)

      const decision = await this.waitForUserDecision()
      console.log(`[TestEngine] 错误后的用户决定: ${decision}`)

      store.setWaitingForConfirmation(false)
      store.setCurrentTestResult(null)
      store.setAutoContinueCountdown(0)

      if (decision === 'retest') {
        return 'retest'
      }

      if (decision === 'stop') {
        this.shouldStop = true
      }

      return errorResult
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

    // 显示冷却倒计时
    for (let remaining = seconds; remaining > 0; remaining--) {
      message.loading({
        content: `冷却中... 还剩 ${remaining} 秒`,
        key: 'cooldown-progress',
        duration: 0
      })
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // 清除冷却消息
    message.destroy('cooldown-progress')
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
