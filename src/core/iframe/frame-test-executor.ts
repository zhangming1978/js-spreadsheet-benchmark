import { SpreadJSAdapter } from '../adapters/SpreadJSAdapter'
import { UniverAdapter } from '../adapters/UniverAdapter'
import { HandsontableAdapter } from '../adapters/HandsontableAdapter'
import { DataGenerator } from '../engine/DataGenerator'
import type { ProductAdapter } from '../adapters/ProductAdapter'
import { TestScenario, ProductType } from '@/types'

/**
 * iframe 内部的测试执行器
 * 负责接收父窗口的消息，执行测试，并返回性能数据
 */
class FrameTestExecutor {
  private adapter: ProductAdapter | null = null
  private container: HTMLElement
  private fpsInterval: number | null = null

  constructor() {
    this.container = document.getElementById('test-container')!
    console.log('[FrameTestExecutor] 构造函数已调用，容器:', this.container)

    // 添加视觉指示器，帮助调试
    if (this.container) {
      this.container.style.border = '2px solid #1890ff'
      this.container.style.background = '#fff'
    }

    this.setupMessageListener()
  }

  private setupMessageListener() {
    console.log('[FrameTestExecutor] 正在设置消息监听器')
    window.addEventListener('message', async (event) => {
      const { action, data } = event.data
      console.log('[FrameTestExecutor] 收到消息:', action, data)

      try {
        switch (action) {
          case 'ping':
            // 响应 ping 请求，告知父窗口已准备就绪
            console.log('[FrameTestExecutor] 收到 ping，发送就绪响应')
            this.sendMessage('ready', {})
            break
          case 'initialize':
            await this.handleInitialize(data)
            break
          case 'runTest':
            await this.handleRunTest(data)
            break
          case 'stopMonitoring':
            this.handleStopMonitoring()
            break
          case 'cleanup':
            await this.handleCleanup()
            break
          case 'clearData':
            await this.handleClearData()
            break
        }
      } catch (error) {
        console.error('[FrameTestExecutor] 处理消息时出错:', error)
        this.sendMessage('error', {
          message: error instanceof Error ? error.message : String(error)
        })
      }
    })

    console.log('[FrameTestExecutor] 消息监听器已就绪，等待父窗口的 ping')
  }

  private async handleInitialize(data: { productType: ProductType }) {
    const { productType } = data
    console.log('[FrameTestExecutor] 正在初始化适配器:', productType)

    // 清理旧的适配器和监控（如果存在）
    if (this.adapter) {
      console.log('[FrameTestExecutor] 重新初始化前清理现有适配器')
      this.stopPerformanceMonitoring()
      await this.adapter.destroy()
      this.adapter = null
    }

    // 创建适配器
    if (productType === ProductType.SPREADJS) {
      this.adapter = new SpreadJSAdapter()
    } else if (productType === ProductType.UNIVER) {
      this.adapter = new UniverAdapter()
    } else if (productType === ProductType.HANDSONTABLE) {
      this.adapter = new HandsontableAdapter()
    } else {
      throw new Error(`不支持的产品类型: ${productType}`)
    }

    // 初始化适配器
    const startTime = performance.now()
    console.log('[FrameTestExecutor] 使用容器调用 adapter.initialize:', this.container)
    await this.adapter.initialize(this.container)
    const endTime = performance.now()
    console.log('[FrameTestExecutor] 适配器初始化完成，耗时', endTime - startTime, 'ms')

    // 开始性能监控
    this.startPerformanceMonitoring()

    this.sendMessage('initialized', {
      initializationTime: endTime - startTime
    })
  }

  private async handleRunTest(data: { scenario: TestScenario; dataSize: number; runNumber: number }) {
    if (!this.adapter) {
      throw new Error('适配器未初始化')
    }

    const { scenario, dataSize, runNumber } = data
    const startTime = performance.now()

    // 执行测试场景
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
        throw new Error(`未知的测试场景: ${scenario}`)
    }

    const endTime = performance.now()
    const executionTime = endTime - startTime

    // 获取性能指标
    const memoryUsage = this.adapter.getMemoryUsage()
    const fps = this.adapter.getFPS()

    this.sendMessage('testCompleted', {
      runNumber,
      executionTime,
      memoryUsage,
      fps
    })
  }

  private async handleCleanup() {
    this.stopPerformanceMonitoring()

    if (this.adapter) {
      await this.adapter.destroy()
      this.adapter = null
    }

    this.sendMessage('cleanedUp', {})
  }

  private handleStopMonitoring() {
    console.log('[FrameTestExecutor] 停止性能监控')
    this.stopPerformanceMonitoring()
    this.sendMessage('monitoringStopped', {})
  }

  private async handleClearData() {
    if (this.adapter) {
      await this.adapter.loadData([[]])
    }
    this.sendMessage('dataCleared', {})
  }

  private startPerformanceMonitoring() {
    // 确保先停止任何现有的监控
    this.stopPerformanceMonitoring()

    this.fpsInterval = window.setInterval(() => {
      if (this.adapter) {
        this.sendMessage('performance', {
          fps: this.adapter.getFPS(),
          memory: this.adapter.getMemoryUsage()
        })
      }
    }, 200)

    console.log('[FrameTestExecutor] 性能监控已启动')
  }

  private stopPerformanceMonitoring() {
    if (this.fpsInterval !== null) {
      console.log('[FrameTestExecutor] 停止性能监控间隔:', this.fpsInterval)
      clearInterval(this.fpsInterval)
      this.fpsInterval = null
      console.log('[FrameTestExecutor] 性能监控已停止')
    } else {
      console.log('[FrameTestExecutor] 没有需要停止的性能监控间隔')
    }
  }

  private sendMessage(type: string, data: any) {
    window.parent.postMessage({ type, data }, '*')
  }

  // 测试场景实现
  private async testDataLoading(dataSize: number): Promise<void> {
    const data = DataGenerator.generateTableData(dataSize)
    await this.adapter!.loadData(data)
  }

  private async testScrolling(dataSize: number): Promise<void> {
    const data = DataGenerator.generateTableData(dataSize)
    await this.adapter!.loadData(data)

    const scrollSteps = 10
    for (let i = 0; i < scrollSteps; i++) {
      const targetRow = Math.floor((dataSize / scrollSteps) * i)
      this.adapter!.scrollTo(targetRow, 0)
      await this.sleep(50)
    }
  }

  private async testEditing(dataSize: number): Promise<void> {
    const data = DataGenerator.generateTableData(dataSize)
    await this.adapter!.loadData(data)

    const editCount = Math.min(100, dataSize)
    for (let i = 0; i < editCount; i++) {
      this.adapter!.setCellValue(i, 1, `编辑${i}`)
    }
  }

  private async testFormula(dataSize: number): Promise<void> {
    const data = DataGenerator.generateFormulaData(dataSize)
    await this.adapter!.loadData(data)
    this.adapter!.recalculate()
  }

  private async testRendering(dataSize: number): Promise<void> {
    const data = DataGenerator.generateTableData(dataSize)
    await this.adapter!.loadData(data)
    await this.sleep(100)
  }

  private async testMemory(dataSize: number): Promise<void> {
    const data = DataGenerator.generateTableData(dataSize)
    await this.adapter!.loadData(data)
    await this.sleep(500)
  }

  private async testExcelImport(dataSize: number): Promise<void> {
    const data = DataGenerator.generateTableData(dataSize)
    await this.adapter!.loadData(data)
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// 创建执行器实例
new FrameTestExecutor()
