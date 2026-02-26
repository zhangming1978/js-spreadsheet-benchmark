import { ProductAdapter } from './ProductAdapter'
import { ProductType } from '@/types'
import { FPSMonitor } from './FPSMonitor'
import * as GC from '@grapecity-software/spread-sheets'
import type { FormulaDataSet } from '../engine/DataGenerator'

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

    // 设置 SpreadJS 授权码
    GC.Spread.Sheets.LicenseKey = 'js-spreadsheet-benchmark.vercel.app,E758949123491674#B14MZ3UOF5WTUxGSBNTZSRmc8Ijd7cjZt3SR6dFUDFzNuFmYupXdQRUSmJXSzMGe9MFT5F4a8o4a4ljYGNzdjhUZ6o4QKBXQykjNKlnMKllRxYncR9UWwxmQGVzcxV4Y5RVNkx6LShkaKl4NqR6d8siMz9GVPtkQz86bsNVb4EFTvFkQr8WQYBnV9ITMqpUaK96SDlHe7cWWRpFSkhkasxmUxd6dwMDcRpESSF5Z6ZFa4lHTYVEd6NGbsNEOw9WWHVneuF5NhNTQjJ7asFmRtZ5RwtmWwE6djdjY8oVdzdGUadzaUNWapBzTKZETzc5LINmY9hkN4JmWwoFZEN5YjdzdFF7dvJHbvFkI0IyUiwiIxYzNzITQDZjI0ICSiwSO4gTNxczM5AjM0IicfJye=#Qf35VfiEzQRdlI0IyQiwiI9EjL6BSKONEKTpEIkFWZyB7UiojIOJyebpjIkJHUiwiI9UTOzkDMgUjMyAjNyAjMiojI4J7QiwiI7IzMwcjMwIjI0ICc8VkIsICcwFmLsV6YyVmdusmch5Gaj9WZi5CdlVGazRWYlJHcz5ycqJiOiMXbEJCLikHdpNWZwFmcnJiOiEmTDJCLlVnc4pjIsZXRiwiI4cjNxkDNzITM9QTO8UzNiojIklkIs4XXbpjInxmZiwSZzxWYmpjIyNHZisnOiwmbBJye0ICRiwiI34TQzE5cxsCSHZ7dOdkNrQVa0lmS7EXczB5YuZFeTdlSrQjdV5UMCFTZyo4ZRp5QzY7dwkEWthWcUxUdClzSzlVb4smemRWQJZ5cMJ3VZR'

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
      console.log(`[SpreadJSAdapter] 开始加载数据: ${data.length} 行 (含表头)`)

      // 普通数据：将二维数组转为对象数组，使用 setDataSource 数据绑定
      const headers = data[0]
      const rows = data.slice(1)
      const dataSource = rows.map(row => {
        const obj: any = {}
        headers.forEach((header: any, index: number) => {
          obj[header] = row[index]
        })
        return obj
      })

      this.workbook.suspendPaint()
      try {
        this.sheet.setDataSource(dataSource)
      } finally {
        this.workbook.resumePaint()
      }

      console.log(`[SpreadJSAdapter] 数据加载完成: ${rows.length} 行`)
    }
  }

  async loadFormulaData(dataset: FormulaDataSet): Promise<void> {
    if (this.sheet && this.workbook) {
      console.log(`[SpreadJSAdapter] 开始加载公式数据: ${dataset.values.length} 行`)

      this.workbook.suspendPaint()
      this.sheet.suspendCalcService(false)
      try {
        // 第一步：setArray(false) 设置所有值
        this.sheet.setArray(0, 0, dataset.values, false)
        // 第二步：setArray(true) 设置公式（非公式格为 null，会被跳过）
        this.sheet.setArray(0, 0, dataset.formulas, true)
      } finally {
        this.sheet.resumeCalcService(false)
        this.workbook.resumePaint()
      }

      console.log(`[SpreadJSAdapter] 公式数据加载完成`)
    }
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
    if (this.sheet && this.workbook) {
      console.log(`[SpreadJSAdapter] 滚动到行 ${row}, 列 ${col}`)
      // 确保绘制已完成
      this.workbook.resumePaint()
      // 执行滚动
      this.sheet.showRow(row, GC.Spread.Sheets.VerticalPosition.top)
      this.sheet.showColumn(col, GC.Spread.Sheets.HorizontalPosition.left)
      console.log(`[SpreadJSAdapter] 滚动完成，当前视口顶部行: ${this.sheet.getViewportTopRow(0)}`)
    } else {
      console.warn('[SpreadJSAdapter] 无法滚动：sheet 或 workbook 实例不存在')
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
