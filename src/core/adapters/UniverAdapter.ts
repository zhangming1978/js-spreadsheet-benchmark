import { ProductAdapter } from './ProductAdapter'
import { ProductType } from '@/types'
import { FPSMonitor } from './FPSMonitor'

/**
 * Univer 适配器
 * 将 Univer API 适配到统一接口
 */
export class UniverAdapter extends ProductAdapter {
  private univerInstance: any = null
  private fpsMonitor: FPSMonitor

  constructor() {
    super(ProductType.UNIVER)
    this.fpsMonitor = new FPSMonitor()
  }

  // ==================== 产品信息 ====================
  getProductName(): string {
    return 'Univer'
  }

  getVersion(): string {
    return '0.15.5'
  }

  // ==================== 生命周期 ====================
  async initialize(container: HTMLElement): Promise<void> {
    this.container = container
    this.fpsMonitor.start()

    // TODO: 实际集成 Univer SDK
    // import { Univer } from '@univerjs/core'
    // this.univerInstance = new Univer({ container })

    console.log('[UniverAdapter] Initialized (placeholder)')
  }

  async destroy(): Promise<void> {
    this.fpsMonitor.stop()

    // TODO: 调用 Univer 销毁方法
    // if (this.univerInstance) {
    //   this.univerInstance.dispose()
    // }

    this.univerInstance = null
    console.log('[UniverAdapter] Destroyed')
  }

  // ==================== 数据操作 ====================
  async loadData(data: any[][]): Promise<void> {
    // TODO: 实际加载数据
    // if (this.univerInstance) {
    //   this.univerInstance.setSheetData(data)
    // }
    console.log(`[UniverAdapter] Loading ${data.length} rows (placeholder)`)
  }

  getData(): any[][] {
    // TODO: 实际获取数据
    // if (this.univerInstance) {
    //   return this.univerInstance.getSheetData()
    // }
    return []
  }

  clearData(): void {
    // TODO: 实际清空数据
    // if (this.univerInstance) {
    //   this.univerInstance.clearSheet()
    // }
    console.log('[UniverAdapter] Data cleared (placeholder)')
  }

  // ==================== 编辑操作 ====================
  setCellValue(_row: number, _col: number, _value: any): void {
    // TODO: 实际设置单元格值
    // if (this.univerInstance) {
    //   this.univerInstance.setCellValue(_row, _col, _value)
    // }
  }

  getCellValue(_row: number, _col: number): any {
    // TODO: 实际获取单元格值
    // if (this.univerInstance) {
    //   return this.univerInstance.getCellValue(_row, _col)
    // }
    return null
  }

  setRangeValues(_startRow: number, _startCol: number, _values: any[][]): void {
    // TODO: 实际设置区域值
    // if (this.univerInstance) {
    //   this.univerInstance.setRangeValues(_startRow, _startCol, _values)
    // }
  }

  autoFill(_startRow: number, _startCol: number, _endRow: number, _endCol: number): void {
    // TODO: 实际自动填充
    // if (this.univerInstance) {
    //   this.univerInstance.autoFill({ startRow: _startRow, startCol: _startCol, endRow: _endRow, endCol: _endCol })
    // }
  }

  // ==================== 公式操作 ====================
  setFormula(_row: number, _col: number, _formula: string): void {
    // TODO: 实际设置公式
    // if (this.univerInstance) {
    //   this.univerInstance.setFormula(_row, _col, _formula)
    // }
  }

  recalculate(): void {
    // TODO: 实际重新计算
    // if (this.univerInstance) {
    //   this.univerInstance.recalculate()
    // }
  }

  // ==================== 滚动操作 ====================
  scrollTo(_row: number, _col: number): void {
    // TODO: 实际滚动
    // if (this.univerInstance) {
    //   this.univerInstance.scrollTo(_row, _col)
    // }
  }

  getScrollPosition(): { row: number; col: number } {
    // TODO: 实际获取滚动位置
    // if (this.univerInstance) {
    //   return this.univerInstance.getScrollPosition()
    // }
    return { row: 0, col: 0 }
  }

  // ==================== 性能监控 ====================
  getMemoryUsage(): number {
    // 使用浏览器 Performance API 获取内存占用
    const memory = (performance as any).memory
    return memory ? memory.usedJSHeapSize : 0
  }

  getFPS(): number {
    return this.fpsMonitor.getCurrentFPS()
  }

  // ==================== 实例访问 ====================
  getInstance(): any {
    return this.univerInstance
  }
}
