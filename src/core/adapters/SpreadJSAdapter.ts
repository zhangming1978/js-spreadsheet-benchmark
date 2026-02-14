import { ProductAdapter } from './ProductAdapter'
import { ProductType } from '@/types'
import { FPSMonitor } from './FPSMonitor'
import * as GC from '@grapecity-software/spread-sheets'

/**
 * SpreadJS 适配器
 * 将 SpreadJS API 适配到统一接口
 */
export class SpreadJSAdapter extends ProductAdapter {
  private workbook: GC.Spread.Sheets.Workbook | null = null
  private sheet: GC.Spread.Sheets.Worksheet | null = null
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
    // 获取 SpreadJS 实际版本
    return GC.Spread.Sheets.VERSION || '18.2.5'
  }

  // ==================== 生命周期 ====================
  async initialize(container: HTMLElement): Promise<void> {
    this.container = container
    this.fpsMonitor.start()

    // 初始化 SpreadJS 工作簿
    this.workbook = new GC.Spread.Sheets.Workbook(container, {
      sheetCount: 1,
      newTabVisible: false
    })

    this.sheet = this.workbook.getActiveSheet()

    // 设置工作表名称
    if (this.sheet) {
      this.sheet.name('Performance Test')
    }

    console.log('[SpreadJSAdapter] Initialized with SpreadJS', this.getVersion())
  }

  async destroy(): Promise<void> {
    this.fpsMonitor.stop()

    // 销毁 SpreadJS 工作簿
    if (this.workbook) {
      this.workbook.destroy()
    }

    this.workbook = null
    this.sheet = null
    console.log('[SpreadJSAdapter] Destroyed')
  }

  // ==================== 数据操作 ====================
  async loadData(data: any[][]): Promise<void> {
    if (this.sheet) {
      // 使用 setArray 批量设置数据以提高性能
      this.sheet.setArray(0, 0, data)
    }
    console.log(`[SpreadJSAdapter] Loaded ${data.length} rows`)
  }

  getData(): any[][] {
    if (this.sheet) {
      const rowCount = this.sheet.getRowCount()
      const colCount = this.sheet.getColumnCount()
      return this.sheet.getArray(0, 0, rowCount, colCount)
    }
    return []
  }

  clearData(): void {
    if (this.sheet) {
      const rowCount = this.sheet.getRowCount()
      const colCount = this.sheet.getColumnCount()
      this.sheet.clear(0, 0, rowCount, colCount, GC.Spread.Sheets.SheetArea.viewport, GC.Spread.Sheets.StorageType.data)
    }
    console.log('[SpreadJSAdapter] Data cleared')
  }

  // ==================== 编辑操作 ====================
  setCellValue(row: number, col: number, value: any): void {
    if (this.sheet) {
      this.sheet.setValue(row, col, value)
    }
  }

  getCellValue(row: number, col: number): any {
    if (this.sheet) {
      return this.sheet.getValue(row, col)
    }
    return null
  }

  setRangeValues(startRow: number, startCol: number, values: any[][]): void {
    if (this.sheet) {
      this.sheet.setArray(startRow, startCol, values)
    }
  }

  autoFill(startRow: number, startCol: number, endRow: number, endCol: number): void {
    if (this.sheet) {
      const range = new GC.Spread.Sheets.Range(startRow, startCol, 1, 1)
      const fillRange = new GC.Spread.Sheets.Range(
        startRow, startCol,
        endRow - startRow + 1,
        endCol - startCol + 1
      )
      this.sheet.fillAuto(range, fillRange, { fillType: GC.Spread.Sheets.Fill.FillType.auto })
    }
  }

  // ==================== 公式操作 ====================
  setFormula(row: number, col: number, formula: string): void {
    if (this.sheet) {
      this.sheet.setFormula(row, col, formula)
    }
  }

  recalculate(): void {
    if (this.workbook) {
      this.workbook.recalcAll()
    }
  }

  // ==================== 滚动操作 ====================
  scrollTo(row: number, col: number): void {
    if (this.sheet) {
      this.sheet.showRow(row, GC.Spread.Sheets.VerticalPosition.top)
      this.sheet.showColumn(col, GC.Spread.Sheets.HorizontalPosition.left)
    }
  }

  getScrollPosition(): { row: number; col: number } {
    if (this.sheet) {
      return {
        row: this.sheet.getViewportTopRow(0),
        col: this.sheet.getViewportLeftColumn(0)
      }
    }
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
