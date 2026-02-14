import { ProductAdapter } from './ProductAdapter'
import { ProductType } from '@/types'
import { FPSMonitor } from './FPSMonitor'

/**
 * SpreadJS 适配器
 * 将 SpreadJS API 适配到统一接口
 */
export class SpreadJSAdapter extends ProductAdapter {
  private workbook: any = null
  private _sheet: any = null // 保留用于后续实际集成
  private fpsMonitor: FPSMonitor

  constructor() {
    super(ProductType.SPREADJS)
    this.fpsMonitor = new FPSMonitor()
  }

  // ==================== 产品信息 ====================
  getProductName(): string {
    return 'SpreadJS'
  }

  getVersion(): string {
    return '19.0.1'
  }

  // ==================== 生命周期 ====================
  async initialize(container: HTMLElement): Promise<void> {
    this.container = container
    this.fpsMonitor.start()

    // TODO: 实际集成 SpreadJS SDK
    // import GC from '@grapecity-software/spread-sheets'
    // this.workbook = new GC.Spread.Sheets.Workbook(container, { sheetCount: 1 })
    // this._sheet = this.workbook.getActiveSheet()

    console.log('[SpreadJSAdapter] Initialized (placeholder)')
  }

  async destroy(): Promise<void> {
    this.fpsMonitor.stop()

    // TODO: 调用 SpreadJS 销毁方法
    // if (this.workbook) {
    //   this.workbook.destroy()
    // }

    this.workbook = null
    this._sheet = null
    console.log('[SpreadJSAdapter] Destroyed')
  }

  // ==================== 数据操作 ====================
  async loadData(data: any[][]): Promise<void> {
    // TODO: 实际加载数据
    // if (this._sheet) {
    //   this._sheet.setArray(0, 0, data)
    // }
    console.log(`[SpreadJSAdapter] Loading ${data.length} rows (placeholder)`)
  }

  getData(): any[][] {
    // TODO: 实际获取数据
    // if (this._sheet) {
    //   return this._sheet.getArray(0, 0, this._sheet.getRowCount(), this._sheet.getColumnCount())
    // }
    return []
  }

  clearData(): void {
    // TODO: 实际清空数据
    // if (this._sheet) {
    //   this._sheet.clear()
    // }
    console.log('[SpreadJSAdapter] Data cleared (placeholder)')
  }

  // ==================== 编辑操作 ====================
  setCellValue(_row: number, _col: number, _value: any): void {
    // TODO: 实际设置单元格值
    // if (this._sheet) {
    //   this._sheet.setValue(_row, _col, _value)
    // }
  }

  getCellValue(_row: number, _col: number): any {
    // TODO: 实际获取单元格值
    // if (this._sheet) {
    //   return this._sheet.getValue(_row, _col)
    // }
    return null
  }

  setRangeValues(_startRow: number, _startCol: number, _values: any[][]): void {
    // TODO: 实际设置区域值
    // if (this._sheet) {
    //   this._sheet.setArray(_startRow, _startCol, _values)
    // }
  }

  autoFill(_startRow: number, _startCol: number, _endRow: number, _endCol: number): void {
    // TODO: 实际自动填充
    // if (this._sheet) {
    //   const range = new GC.Spread.Sheets.Range(_startRow, _startCol, 1, 1)
    //   const fillRange = new GC.Spread.Sheets.Range(
    //     _startRow, _startCol,
    //     _endRow - _startRow + 1,
    //     _endCol - _startCol + 1
    //   )
    //   this._sheet.fillAuto(range, fillRange, { fillType: GC.Spread.Sheets.Fill.FillType.auto })
    // }
  }

  // ==================== 公式操作 ====================
  setFormula(_row: number, _col: number, _formula: string): void {
    // TODO: 实际设置公式
    // if (this._sheet) {
    //   this._sheet.setFormula(_row, _col, _formula)
    // }
  }

  recalculate(): void {
    // TODO: 实际重新计算
    // if (this.workbook) {
    //   this.workbook.recalcAll()
    // }
  }

  // ==================== 滚动操作 ====================
  scrollTo(_row: number, _col: number): void {
    // TODO: 实际滚动
    // if (this._sheet) {
    //   this._sheet.showRow(_row, GC.Spread.Sheets.VerticalPosition.top)
    //   this._sheet.showColumn(_col, GC.Spread.Sheets.HorizontalPosition.left)
    // }
  }

  getScrollPosition(): { row: number; col: number } {
    // TODO: 实际获取滚动位置
    // if (this._sheet) {
    //   return {
    //     row: this._sheet.getViewportTopRow(0),
    //     col: this._sheet.getViewportLeftColumn(0)
    //   }
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
    return this.workbook
  }
}
