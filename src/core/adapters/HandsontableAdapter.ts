import { ProductAdapter } from './ProductAdapter'
import { ProductType } from '@/types'
import { FPSMonitor } from './FPSMonitor'
import Handsontable from 'handsontable'

/**
 * Handsontable 适配器
 * 将 Handsontable API 适配到统一接口
 */
export class HandsontableAdapter extends ProductAdapter {
  private hotInstance: Handsontable | null = null
  private fpsMonitor: FPSMonitor

  constructor() {
    super(ProductType.HANDSONTABLE)
    this.fpsMonitor = new FPSMonitor()
  }

  // ==================== 产品信息 ====================
  getProductName(): string {
    return 'Handsontable'
  }

  getVersion(): string {
    // 获取 Handsontable 实际版本
    return Handsontable.version || '16.2.0'
  }

  // ==================== 生命周期 ====================
  async initialize(container: HTMLElement): Promise<void> {
    this.container = container
    this.fpsMonitor.start()

    // 初始化 Handsontable 实例
    this.hotInstance = new Handsontable(container, {
      data: [],
      licenseKey: 'non-commercial-and-evaluation',
      colHeaders: true,
      rowHeaders: true,
      width: '100%',
      height: '100%',
      stretchH: 'all'
    })

    console.log('[HandsontableAdapter] 已使用 Handsontable 初始化', this.getVersion())
  }

  async destroy(): Promise<void> {
    this.fpsMonitor.stop()

    // 销毁 Handsontable 实例
    if (this.hotInstance) {
      this.hotInstance.destroy()
    }

    this.hotInstance = null
    console.log('[HandsontableAdapter] 已销毁')
  }

  // ==================== 数据操作 ====================
  async loadData(data: any[][]): Promise<void> {
    if (this.hotInstance && data.length > 0) {
      console.log(`[HandsontableAdapter] 开始加载数据: ${data.length} 行 (含表头)`)

      // 使用 loadData 批量加载数据（包括表头）
      this.hotInstance.loadData(data)

      // 验证实际加载的行数
      const actualRowCount = this.hotInstance.countRows()
      console.log(`[HandsontableAdapter] 数据加载完成: 请求 ${data.length} 行, 实际加载 ${actualRowCount} 行`)
    }
  }

  getData(): any[][] {
    if (this.hotInstance) {
      return this.hotInstance.getData()
    }
    return []
  }

  clearData(): void {
    if (this.hotInstance) {
      this.hotInstance.loadData([])
    }
    console.log('[HandsontableAdapter] 数据已清空')
  }

  // ==================== 编辑操作 ====================
  setCellValue(row: number, col: number, value: any): void {
    if (this.hotInstance) {
      this.hotInstance.setDataAtCell(row, col, value)
    }
  }

  getCellValue(row: number, col: number): any {
    if (this.hotInstance) {
      return this.hotInstance.getDataAtCell(row, col)
    }
    return null
  }

  setRangeValues(startRow: number, startCol: number, values: any[][]): void {
    if (this.hotInstance) {
      this.hotInstance.populateFromArray(startRow, startCol, values)
    }
  }

  autoFill(startRow: number, startCol: number, endRow: number, endCol: number): void {
    if (this.hotInstance) {
      // Handsontable 的 autofill 需要使用 populateFromArray
      const sourceValue = this.hotInstance.getDataAtCell(startRow, startCol)
      const fillData: any[][] = []
      for (let r = startRow; r <= endRow; r++) {
        const row: any[] = []
        for (let c = startCol; c <= endCol; c++) {
          row.push(sourceValue)
        }
        fillData.push(row)
      }
      this.hotInstance.populateFromArray(startRow, startCol, fillData)
    }
  }

  // ==================== 公式操作 ====================
  setFormula(row: number, col: number, formula: string): void {
    if (this.hotInstance) {
      // Handsontable 需要 HyperFormula 插件支持公式
      // 这里简单地将公式作为文本设置
      this.hotInstance.setDataAtCell(row, col, formula)
    }
  }

  recalculate(): void {
    if (this.hotInstance) {
      // 强制重新渲染
      this.hotInstance.render()
    }
  }

  // ==================== 滚动操作 ====================
  scrollTo(row: number, col: number): void {
    if (this.hotInstance) {
      this.hotInstance.scrollViewportTo(row, col)
    }
  }

  getScrollPosition(): { row: number; col: number } {
    if (this.hotInstance) {
      // Handsontable 没有直接获取滚动位置的 API
      // 使用 getFirstVisibleRow/Column 作为替代
      return {
        row: (this.hotInstance as any).rowOffset?.() || 0,
        col: (this.hotInstance as any).colOffset?.() || 0
      }
    }
    return { row: 0, col: 0 }
  }

  // ==================== 性能监控 ====================
  getMemoryUsage(): number {
    // 使用浏览器 Performance API 获取内存占用（返回 MB）
    const memory = (performance as any).memory
    return memory ? memory.usedJSHeapSize / (1024 * 1024) : 0
  }

  getFPS(): number {
    return this.fpsMonitor.getCurrentFPS()
  }

  // ==================== 实例访问 ====================
  getInstance(): any {
    return this.hotInstance
  }
}
