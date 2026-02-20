import { ProductType, TestScenario } from '@/types'

export interface IframeTestMessage {
  type: string
  data: any
}

export interface TestRunResult {
  runNumber: number
  executionTime: number
  memoryUsage: number
  fps: number
}

/**
 * iframe 通信管理器
 * 负责父窗口与 iframe 之间的通信
 */
export class IframeTestManager {
  private iframe: HTMLIFrameElement
  private messageHandlers: Map<string, (data: any) => void> = new Map()
  private readyPromise: Promise<void>
  private readyResolve: (() => void) | null = null

  constructor(iframe: HTMLIFrameElement) {
    this.iframe = iframe
    console.log('[IframeTestManager] 构造函数已调用，iframe:', iframe)

    // 创建就绪 Promise
    this.readyPromise = new Promise((resolve) => {
      this.readyResolve = resolve
    })

    this.setupMessageListener()
  }

  private setupMessageListener() {
    console.log('[IframeTestManager] 正在设置消息监听器')
    window.addEventListener('message', (event) => {
      // 验证消息来源
      if (event.source !== this.iframe.contentWindow) {
        return
      }

      const { type, data } = event.data as IframeTestMessage
      console.log('[IframeTestManager] 收到来自 iframe 的消息:', type, data)

      // 处理就绪消息
      if (type === 'ready' && this.readyResolve) {
        console.log('[IframeTestManager] iframe 已就绪')
        this.readyResolve()
        this.readyResolve = null
        return
      }

      // 调用注册的处理器
      const handler = this.messageHandlers.get(type)
      if (handler) {
        handler(data)
      }
    })
  }

  /**
   * 等待 iframe 就绪
   */
  async waitForReady(): Promise<void> {
    console.log('[IframeTestManager] 发送 ping 到 iframe 检查是否就绪')
    // 发送 ping 消息，让 iframe 响应 ready
    this.sendMessage('ping', {})

    // 添加超时保护
    const timeout = new Promise<void>((_, reject) => {
      setTimeout(() => reject(new Error('iframe 就绪超时（5秒后）')), 5000)
    })

    return Promise.race([this.readyPromise, timeout])
  }

  /**
   * 注册消息处理器
   */
  on(type: string, handler: (data: any) => void) {
    this.messageHandlers.set(type, handler)
  }

  /**
   * 移除消息处理器
   */
  off(type: string) {
    this.messageHandlers.delete(type)
  }

  /**
   * 发送消息到 iframe
   */
  private sendMessage(action: string, data: any) {
    console.log('[IframeTestManager] 发送消息到 iframe:', action, data)
    if (!this.iframe.contentWindow) {
      throw new Error('iframe contentWindow 不可用')
    }
    this.iframe.contentWindow.postMessage({ action, data }, '*')
  }

  /**
   * 初始化产品
   */
  async initialize(productType: ProductType): Promise<number> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Initialize timeout'))
      }, 30000)

      this.on('initialized', (data) => {
        clearTimeout(timeout)
        this.off('initialized')
        resolve(data.initializationTime)
      })

      this.on('error', (data) => {
        clearTimeout(timeout)
        this.off('error')
        reject(new Error(data.message))
      })

      this.sendMessage('initialize', { productType })
    })
  }

  /**
   * 运行测试
   */
  async runTest(scenario: TestScenario, dataSize: number, runNumber: number): Promise<TestRunResult> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Test timeout'))
      }, 60000)

      this.on('testCompleted', (data) => {
        clearTimeout(timeout)
        this.off('testCompleted')
        resolve(data as TestRunResult)
      })

      this.on('error', (data) => {
        clearTimeout(timeout)
        this.off('error')
        reject(new Error(data.message))
      })

      this.sendMessage('runTest', { scenario, dataSize, runNumber })
    })
  }

  /**
   * 清理数据
   */
  async clearData(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Clear data timeout'))
      }, 5000)

      this.on('dataCleared', () => {
        clearTimeout(timeout)
        this.off('dataCleared')
        resolve()
      })

      this.on('error', (data) => {
        clearTimeout(timeout)
        this.off('error')
        reject(new Error(data.message))
      })

      this.sendMessage('clearData', {})
    })
  }

  /**
   * 停止性能监控
   */
  async stopMonitoring(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Stop monitoring timeout'))
      }, 5000)

      this.on('monitoringStopped', () => {
        clearTimeout(timeout)
        this.off('monitoringStopped')
        resolve()
      })

      this.on('error', (data) => {
        clearTimeout(timeout)
        this.off('error')
        reject(new Error(data.message))
      })

      this.sendMessage('stopMonitoring', {})
    })
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Cleanup timeout'))
      }, 5000)

      this.on('cleanedUp', () => {
        clearTimeout(timeout)
        this.off('cleanedUp')
        resolve()
      })

      this.on('error', (data) => {
        clearTimeout(timeout)
        this.off('error')
        reject(new Error(data.message))
      })

      this.sendMessage('cleanup', {})
    })
  }

  /**
   * 销毁管理器
   */
  destroy() {
    this.messageHandlers.clear()
  }
}
