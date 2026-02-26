import { ProductAdapter } from './ProductAdapter'
import { ProductType } from '@/types'
import { FPSMonitor } from './FPSMonitor'

/**
 * Luckysheet 适配器
 * 将 Luckysheet API 适配到统一接口
 */
export class LuckysheetAdapter extends ProductAdapter {
  private fpsMonitor: FPSMonitor

  constructor() {
    super(ProductType.LUCKYSHEET)
    this.fpsMonitor = new FPSMonitor()
  }

  // ==================== 产品信息 ====================
  getProductName(): string {
    return 'Luckysheet'
  }

  getVersion(): string {
    return '2.1.13'
  }

  // ==================== 生命周期 ====================
  async initialize(container: HTMLElement): Promise<void> {
    this.container = container
    this.fpsMonitor.start()

    // 等待 jQuery mousewheel 插件加载（最多等待 3 秒）
    const maxWaitTime = 3000
    const checkInterval = 100
    let waited = 0

    console.log('[LuckysheetAdapter] 检查 jQuery mousewheel 插件...')

    while (waited < maxWaitTime) {
      // @ts-ignore
      if (window.$ && window.$.fn && window.$.fn.mousewheel) {
        console.log('[LuckysheetAdapter] jQuery mousewheel 插件已就绪')
        break
      }

      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, checkInterval))
      waited += checkInterval

      if (waited >= maxWaitTime) {
        // 超时后提供详细的诊断信息
        console.error('[LuckysheetAdapter] jQuery mousewheel 插件加载超时')
        console.error('[LuckysheetAdapter] 诊断信息:')
        console.error('  - window.$ 存在:', !!window.$)
        console.error('  - window.$.fn 存在:', !!(window.$ && (window.$ as any).fn))
        console.error('  - window.$.fn.mousewheel 存在:', !!(window.$ && (window.$ as any).fn && (window.$ as any).fn.mousewheel))
        console.error('  - window.jQuery 存在:', !!window.jQuery)

        throw new Error(
          'jQuery mousewheel plugin is not loaded. Luckysheet requires this plugin. ' +
          'Please check the browser console for diagnostic information.'
        )
      }
    }

    // 初始化 Luckysheet
    // @ts-ignore
    if (typeof window.luckysheet !== 'undefined') {
      // @ts-ignore
      window.luckysheet.create({
        container: container.id || 'luckysheet',
        showinfobar: false,
        showsheetbar: false,
        showstatisticBar: false,
        sheetFormulaBar: false,
        enableAddRow: false,
        enableAddCol: false,
        userInfo: false,
        myFolderUrl: '',
        title: 'Performance Test',
        data: [{
          name: 'Sheet1',
          color: '',
          status: 1,
          order: 0,
          data: [],
          config: {},
          index: 0
        }]
      })
      console.log('[LuckysheetAdapter] 已初始化 Luckysheet', this.getVersion())
    } else {
      throw new Error('Luckysheet library not loaded')
    }
  }

  async destroy(): Promise<void> {
    this.fpsMonitor.stop()

    // @ts-ignore
    if (typeof window.luckysheet !== 'undefined') {
      try {
        // @ts-ignore
        window.luckysheet.destroy()
      } catch (e) {
        console.warn('[LuckysheetAdapter] Destroy failed:', e)
      }
    }

    if (this.container) {
      this.container.innerHTML = ''
    }

    console.log('[LuckysheetAdapter] 已销毁')
  }

  // ==================== 数据操作 ====================
  async loadData(data: any[][]): Promise<void> {
    // @ts-ignore
    if (typeof window.luckysheet !== 'undefined' && data.length > 0) {
      console.log(`[LuckysheetAdapter] 开始加载数据: ${data.length} 行`)

      // Luckysheet 使用二维数组格式，每个单元格是一个对象
      // 转换数据格式为 Luckysheet 的二维数组格式
      const luckysheetData: any[][] = []

      data.forEach((row) => {
        const luckysheetRow: any[] = []
        row.forEach((cell) => {
          const isFormula = typeof cell === 'string' && cell.startsWith('=')
          luckysheetRow.push(isFormula ? {
            f: cell,
            ct: { fa: 'General', t: 'f' }
          } : {
            v: cell,
            m: String(cell),
            ct: { fa: 'General', t: 'g' }
          })
        })
        luckysheetData.push(luckysheetRow)
      })

      // Luckysheet 需要先销毁再重新创建才能正确加载数据
      try {
        // @ts-ignore
        window.luckysheet.destroy()
      } catch (e) {
        console.warn('[LuckysheetAdapter] Destroy before reload failed:', e)
      }

      // 等待销毁完成
      await new Promise(resolve => setTimeout(resolve, 100))

      // 重新创建 Luckysheet 实例并加载数据
      // @ts-ignore
      window.luckysheet.create({
        container: this.container?.id || 'luckysheet',
        showinfobar: false,
        showsheetbar: false,
        showstatisticBar: false,
        sheetFormulaBar: false,
        enableAddRow: false,
        enableAddCol: false,
        userInfo: false,
        myFolderUrl: '',
        title: 'Performance Test',
        data: [{
          name: 'Sheet1',
          color: '',
          status: 1,
          order: 0,
          data: luckysheetData,  // 使用转换后的数据
          config: {},
          index: 0
        }]
      })

      console.log(`[LuckysheetAdapter] 数据加载完成: 请求 ${data.length} 行, 实际加载 ${luckysheetData.length} 行`)
    }
  }

  getData(): any[][] {
    // @ts-ignore
    if (typeof window.luckysheet !== 'undefined') {
      try {
        // @ts-ignore
        const currentSheet = window.luckysheet.getSheet()
        if (currentSheet && currentSheet.data && Array.isArray(currentSheet.data)) {
          return currentSheet.data.map((row: any[]) =>
            Array.isArray(row) ? row.map(cell => cell?.v || '') : []
          )
        }
      } catch (e) {
        console.warn('[LuckysheetAdapter] getData failed:', e)
      }
    }
    return []
  }

  clearData(): void {
    // @ts-ignore
    if (typeof window.luckysheet !== 'undefined') {
      // @ts-ignore
      const currentSheet = window.luckysheet.getSheet()
      if (currentSheet) {
        currentSheet.data = []
        // @ts-ignore
        window.luckysheet.refresh()
      }
    }
  }

  // ==================== 编辑操作 ====================
  setCellValue(row: number, col: number, value: any): void {
    // @ts-ignore
    if (typeof window.luckysheet !== 'undefined') {
      try {
        // @ts-ignore
        const currentSheet = window.luckysheet.getSheet()
        if (currentSheet && currentSheet.data && Array.isArray(currentSheet.data)) {
          // 确保行存在
          if (!currentSheet.data[row]) {
            currentSheet.data[row] = []
          }
          // 设置单元格值
          currentSheet.data[row][col] = {
            v: value,
            m: String(value),
            ct: { fa: 'General', t: 'g' }
          }
          // Luckysheet 会自动更新显示，不需要手动 refresh
        }
      } catch (e) {
        console.warn('[LuckysheetAdapter] setCellValue failed:', e)
      }
    }
  }

  getCellValue(row: number, col: number): any {
    // @ts-ignore
    if (typeof window.luckysheet !== 'undefined') {
      try {
        // @ts-ignore
        const cell = window.luckysheet.getCellValue(row, col)
        return cell?.v || ''
      } catch (e) {
        return ''
      }
    }
    return ''
  }

  setRangeValues(startRow: number, startCol: number, values: any[][]): void {
    // @ts-ignore
    if (typeof window.luckysheet !== 'undefined') {
      values.forEach((row, rowOffset) => {
        row.forEach((value, colOffset) => {
          this.setCellValue(startRow + rowOffset, startCol + colOffset, value)
        })
      })
    }
  }

  autoFill(startRow: number, startCol: number, endRow: number, endCol: number): void {
    // Luckysheet 支持 autoFill，但API可能不同
    // @ts-ignore
    if (typeof window.luckysheet !== 'undefined') {
      const sourceValue = this.getCellValue(startRow, startCol)
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          this.setCellValue(row, col, sourceValue)
        }
      }
    }
  }

  // ==================== 公式操作 ====================
  setFormula(row: number, col: number, formula: string): void {
    // @ts-ignore
    if (typeof window.luckysheet !== 'undefined') {
      // @ts-ignore
      window.luckysheet.setCellValue(row, col, formula)
    }
  }

  recalculate(): void {
    // Luckysheet 自动计算公式，不需要手动刷新
    // 避免调用 refresh() 导致内部状态错误
  }

  // ==================== 滚动操作 ====================
  scrollTo(row: number, col: number): void {
    // @ts-ignore
    if (typeof window.luckysheet !== 'undefined') {
      try {
        // Luckysheet 通过 scrollToCell 滚动到指定单元格
        // @ts-ignore
        if (typeof window.luckysheet.scrollToCell === 'function') {
          // @ts-ignore
          window.luckysheet.scrollToCell({ row, column: col })
        } else {
          // 降级：找到 Luckysheet 的滚动容器直接设置 scrollTop
          const container = document.getElementById('luckysheet-scrollbar-y')
            || document.querySelector('.luckysheet-scrollbar-y') as HTMLElement
          if (container) {
            const rowHeight = 19 // Luckysheet 默认行高
            container.scrollTop = row * rowHeight
          }
        }
      } catch (e) {
        console.warn('[LuckysheetAdapter] Scroll failed:', e)
      }
    }
  }

  getScrollPosition(): { row: number; col: number } {
    // Luckysheet 没有直接获取滚动位置的API
    return { row: 0, col: 0 }
  }

  // ==================== 性能监控 ====================
  getMemoryUsage(): number {
    if (performance && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024
    }
    return 0
  }

  getFPS(): number {
    return this.fpsMonitor.getCurrentFPS()
  }

  // ==================== 实例访问 ====================
  getInstance(): any {
    // @ts-ignore
    return typeof window.luckysheet !== 'undefined' ? window.luckysheet : null
  }
}
