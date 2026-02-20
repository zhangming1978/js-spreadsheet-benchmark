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
    // 返回 SpreadJS 版本
    return '19.0.1'
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

    console.log('[SpreadJSAdapter] 已使用 SpreadJS 初始化', this.getVersion())
  }

  async destroy(): Promise<void> {
    this.fpsMonitor.stop()

    // 销毁 SpreadJS 工作簿
    if (this.workbook) {
      this.workbook.destroy()
    }

    this.workbook = null
    this.sheet = null
    console.log('[SpreadJSAdapter] 已销毁')
  }

  // ==================== 数据操作 ====================
  async loadData(data: any[][]): Promise<void> {
    if (this.sheet && this.workbook && data.length > 0) {
      // 使用表单绑定方式加载数据，性能更好且更省内存
      // 将二维数组转换为对象数组
      const headers = data[0] // 第一行是表头
      const rows = data.slice(1) // 剩余行是数据

      // 转换为对象数组格式
      const dataSource = rows.map(row => {
        const obj: any = {}
        headers.forEach((header, index) => {
          obj[header] = row[index]
        })
        return obj
      })

      // 性能优化：挂起绘制和计算，批量加载数据后再恢复
      this.workbook.suspendPaint()
      this.sheet.suspendCalcService(false) // false: 不忽略脏数据

      try {
        // 使用 setDataSource 进行数据绑定
        this.sheet.setDataSource(dataSource)
      } finally {
        // 恢复计算和绘制
        this.sheet.resumeCalcService(false) // false: 只计算变化的公式
        this.workbook.resumePaint()
      }
    }
    console.log(`[SpreadJSAdapter] 使用数据绑定和性能优化加载了 ${data.length - 1} 行数据`)
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
    console.log('[SpreadJSAdapter] 数据已清空')
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
    if (this.sheet && this.workbook) {
      // 性能优化：挂起绘制，批量设置后再恢复
      this.workbook.suspendPaint()
      try {
        this.sheet.setArray(startRow, startCol, values)
      } finally {
        this.workbook.resumePaint()
      }
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
      this.sheet.fillAuto(range, fillRange, {
        fillType: GC.Spread.Sheets.Fill.FillType.auto,
        series: GC.Spread.Sheets.Fill.FillSeries.column
      })
    }
  }

  // ==================== 公式操作 ====================
  setFormula(row: number, col: number, formula: string): void {
    if (this.sheet) {
      this.sheet.setFormula(row, col, formula)
    }
  }

  recalculate(): void {
    if (this.sheet) {
      // 触发工作表重新计算
      this.sheet.recalcAll()
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
    // 使用浏览器 Performance API 获取内存占用（返回 MB）
    const memory = (performance as any).memory
    return memory ? memory.usedJSHeapSize / (1024 * 1024) : 0
  }

  getFPS(): number {
    return this.fpsMonitor.getCurrentFPS()
  }

  // ==================== 实例访问 ====================
  getInstance(): any {
    return this.workbook
  }
}
