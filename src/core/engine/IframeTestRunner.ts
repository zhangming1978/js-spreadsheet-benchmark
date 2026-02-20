import { TestScenario, ProductType, type TestResult, type RunResult } from '@/types'
import { useTestStore } from '@/stores/useTestStore'
import { IframeTestManager } from '../iframe/IframeTestManager'

/**
 * 基于 iframe 的测试运行器
 * 使用 iframe 隔离测试环境，确保测试结果互不影响
 */
export class IframeTestRunner {
  private productType: ProductType
  private iframeManager: IframeTestManager | null = null

  constructor(productType: ProductType) {
    this.productType = productType
  }

  /**
   * 运行测试
   */
  async runTest(scenario: TestScenario, dataSize: number): Promise<TestResult> {
    console.log(`[IframeTestRunner] 开始测试 - 产品: ${this.productType}, 场景: ${scenario}, 数据规模: ${dataSize}`)

    let success = false
    let error: string | undefined
    let initializationTime = 0
    const runs: RunResult[] = []
    const numRuns = 3

    try {
      // 获取 iframe 元素
      const iframeId = `test-frame-${this.productType}`
      console.log(`[IframeTestRunner] 查找 iframe，id: ${iframeId}`)
      const iframe = document.getElementById(iframeId) as HTMLIFrameElement

      if (!iframe) {
        // 调试：列出所有 iframe 元素
        const allIframes = document.querySelectorAll('iframe')
        console.error(`[IframeTestRunner] 未找到 iframe！可用的 iframes:`,
          Array.from(allIframes).map(f => f.id || 'no-id'))
        throw new Error(`未找到产品的 iframe: ${this.productType}`)
      }

      console.log(`[IframeTestRunner] 找到 iframe:`, iframe)

      // 创建 iframe 管理器
      this.iframeManager = new IframeTestManager(iframe)

      // 等待 iframe 就绪
      await this.iframeManager.waitForReady()

      // 设置性能监控处理器
      const store = useTestStore.getState()
      this.iframeManager.on('performance', (data) => {
        store.setCurrentFPS(data.fps)
        store.setCurrentMemory(data.memory)
      })

      // 步骤1: 初始化产品
      console.log(`[IframeTestRunner] 正在初始化产品: ${this.productType}`)
      store.setTestStage('初始化中...')
      store.setTotalRuns(numRuns)

      await this.sleep(800) // 让用户看到提示

      initializationTime = await this.iframeManager.initialize(this.productType)
      console.log(`[IframeTestRunner] 产品初始化完成，耗时 ${initializationTime.toFixed(2)}ms`)

      await this.sleep(500) // 初始化完成后延迟

      // 步骤2: 运行测试3次
      for (let runNumber = 1; runNumber <= numRuns; runNumber++) {
        console.log(`[IframeTestRunner] ========== 第 ${runNumber}/${numRuns} 轮 ==========`)
        store.setCurrentRun(runNumber)
        store.setTestStage(`运行测试 ${runNumber}/${numRuns}`)

        await this.sleep(600) // 让用户看到提示

        // 执行测试
        const result = await this.iframeManager.runTest(scenario, dataSize, runNumber)
        console.log(`[IframeTestRunner] 第 ${runNumber} 轮完成:`, result)

        runs.push({
          runNumber: result.runNumber,
          executionTime: result.executionTime,
          memoryUsage: result.memoryUsage,
          fps: result.fps
        })

        // 每次运行后延迟，让用户看到结果
        console.log(`[IframeTestRunner] 第 ${runNumber} 轮完成，等待下一轮...`)
        await this.sleep(1000) // 增加延迟到 1 秒，让用户看到每轮结果

        // 只在非最后一次运行时清理数据，最后一次保留数据以便查看
        if (runNumber < numRuns) {
          console.log(`[IframeTestRunner] 下一轮前清空数据...`)
          await this.iframeManager.clearData()
          await this.sleep(500) // 清理后再延迟一下
        }
      }

      success = true
      console.log(`[IframeTestRunner] 全部 ${numRuns} 轮测试成功完成`)

      // 所有测试完成后，延迟一下让用户看到最终结果
      console.log(`[IframeTestRunner] 所有测试完成，显示最终结果...`)
      await this.sleep(1500) // 延迟 1.5 秒让用户看到最终结果

      // 停止性能监控，避免持续占用 CPU
      console.log(`[IframeTestRunner] 停止性能监控...`)
      await this.iframeManager.stopMonitoring()
    } catch (err) {
      success = false
      error = err instanceof Error ? err.message : String(err)
      console.error(`[IframeTestRunner] ${this.productType} 测试失败:`, err)
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
      productName: this.productType,
      scenario,
      dataSize,
      metrics: {
        productName: this.productType,
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

    console.log(`[IframeTestRunner] 最终结果（${runs.length} 轮平均值）:`, result)
    return result
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    if (this.iframeManager) {
      await this.iframeManager.cleanup()
      this.iframeManager.destroy()
      this.iframeManager = null
    }
  }

  /**
   * 辅助方法：延迟
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
