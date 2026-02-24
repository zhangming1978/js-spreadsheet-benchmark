import { ProductAdapter } from './ProductAdapter'
import { ProductType } from '@/types'
import { FPSMonitor } from './FPSMonitor'

/**
 * jSpreadsheet 适配器
 * 将 jSpreadsheet API 适配到统一接口
 */
export class JSpreadsheetAdapter extends ProductAdapter {
  private spreadsheet: any = null
  private fpsMonitor: FPSMonitor

  constructor() {
    super(ProductType.JSPREADSHEET)
    this.fpsMonitor = new FPSMonitor()
  }

  // ==================== 产品信息 ====================
  getProductName(): string {
    return 'jSpreadsheet'
  }

  getVersion(): string {
    return '4.13.1'
  }

  // ==================== 生命周期 ====================
  async initialize(container: HTMLElement): Promise<void> {
    this.container = container
    this.fpsMonitor.start()

    // 初始化 jSpreadsheet with worksheets configuration
    // @ts-ignore
    if (typeof window.jspreadsheet !== 'undefined') {
      // jSpreadsheet-ce requires worksheets configuration
      // @ts-ignore
      this.spreadsheet = window.jspreadsheet(container, {
        worksheets: [{
          data: [[]], // Empty initial data
          minDimensions: [10, 100]
        }],
        tableOverflow: true,
        tableWidth: '100%',
        tableHeight: '100%',
        toolbar: false,
        search: false,
        pagination: false,
        freezeColumns: 0,
        columnSorting: false,
        contextMenu: false
      })
      console.log('[JSpreadsheetAdapter] 已初始化 jSpreadsheet', this.getVersion())
    } else {
      throw new Error('jSpreadsheet library not loaded')
    }
  }

  async destroy(): Promise<void> {
    this.fpsMonitor.stop()

    if (this.spreadsheet) {
      try {
        // jSpreadsheet 有 destroy 方法
        const worksheets = Array.isArray(this.spreadsheet) ? this.spreadsheet : [this.spreadsheet]
        worksheets.forEach(worksheet => {
          if (worksheet && typeof worksheet.destroy === 'function') {
            worksheet.destroy()
          }
        })
      } catch (e) {
        console.warn('[JSpreadsheetAdapter] Destroy failed:', e)
      }
    }

    if (this.container) {
      this.container.innerHTML = ''
    }

    this.spreadsheet = null
    console.log('[JSpreadsheetAdapter] 已销毁')
  }

  // ==================== 数据操作 ====================
  async loadData(data: any[][]): Promise<void> {
    if (this.spreadsheet && data.length > 0) {
      console.log(`[JSpreadsheetAdapter] 开始加载数据: ${data.length} 行`)

      try {
        // jSpreadsheet-ce returns an array of worksheet instances
        // Access the first worksheet if it's an array
        const worksheet = Array.isArray(this.spreadsheet) ? this.spreadsheet[0] : this.spreadsheet

        if (worksheet && typeof worksheet.setData === 'function') {
          worksheet.setData(data)

          // 验证实际加载的数据
          const loadedData = worksheet.getData()
          console.log(`[JSpreadsheetAdapter] 数据加载完成: 请求 ${data.length} 行, 实际加载 ${loadedData.length} 行`)
        } else {
          console.warn('[JSpreadsheetAdapter] setData method not available, trying alternative approach')
          // Alternative: destroy and recreate with new data
          if (this.container) {
            this.container.innerHTML = ''
            // @ts-ignore
            this.spreadsheet = window.jspreadsheet(this.container, {
              worksheets: [{
                data: data,
                minDimensions: [10, 100]
              }],
              tableOverflow: true,
              tableWidth: '100%',
              tableHeight: '100%',
              toolbar: false,
              search: false,
              pagination: false,
              freezeColumns: 0,
              columnSorting: false,
              contextMenu: false
            })

            // 验证重新初始化后的数据
            const newWorksheet = Array.isArray(this.spreadsheet) ? this.spreadsheet[0] : this.spreadsheet
            const loadedData = newWorksheet.getData()
            console.log(`[JSpreadsheetAdapter] 重新初始化完成: 请求 ${data.length} 行, 实际加载 ${loadedData.length} 行`)
          }
        }
      } catch (e) {
        console.error('[JSpreadsheetAdapter] loadData failed:', e)
        throw e
      }
    }
  }

  getData(): any[][] {
    if (this.spreadsheet) {
      try {
        const worksheet = Array.isArray(this.spreadsheet) ? this.spreadsheet[0] : this.spreadsheet
        return worksheet.getData() || []
      } catch (e) {
        console.warn('[JSpreadsheetAdapter] getData failed:', e)
        return []
      }
    }
    return []
  }

  clearData(): void {
    if (this.spreadsheet) {
      const worksheet = Array.isArray(this.spreadsheet) ? this.spreadsheet[0] : this.spreadsheet
      if (worksheet && typeof worksheet.setData === 'function') {
        worksheet.setData([[]])
      }
    }
  }

  // ==================== 编辑操作 ====================
  setCellValue(row: number, col: number, value: any): void {
    if (this.spreadsheet) {
      try {
        const worksheet = Array.isArray(this.spreadsheet) ? this.spreadsheet[0] : this.spreadsheet
        // jSpreadsheet 使用列字母和行号
        const colName = this.getColumnName(col)
        const cellName = `${colName}${row + 1}`
        if (worksheet && typeof worksheet.setValue === 'function') {
          worksheet.setValue(cellName, value)
        }
      } catch (e) {
        console.warn('[JSpreadsheetAdapter] setCellValue failed:', e)
      }
    }
  }

  getCellValue(row: number, col: number): any {
    if (this.spreadsheet) {
      try {
        const worksheet = Array.isArray(this.spreadsheet) ? this.spreadsheet[0] : this.spreadsheet
        const colName = this.getColumnName(col)
        const cellName = `${colName}${row + 1}`
        if (worksheet && typeof worksheet.getValue === 'function') {
          return worksheet.getValue(cellName) || ''
        }
        return ''
      } catch (e) {
        return ''
      }
    }
    return ''
  }

  setRangeValues(startRow: number, startCol: number, values: any[][]): void {
    if (this.spreadsheet) {
      values.forEach((row, rowOffset) => {
        row.forEach((value, colOffset) => {
          this.setCellValue(startRow + rowOffset, startCol + colOffset, value)
        })
      })
    }
  }

  autoFill(startRow: number, startCol: number, endRow: number, endCol: number): void {
    if (this.spreadsheet) {
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
    if (this.spreadsheet) {
      this.setCellValue(row, col, formula)
    }
  }

  recalculate(): void {
    // jSpreadsheet 自动计算公式
    if (this.spreadsheet) {
      const worksheet = Array.isArray(this.spreadsheet) ? this.spreadsheet[0] : this.spreadsheet
      if (worksheet && typeof worksheet.refresh === 'function') {
        worksheet.refresh()
      }
    }
  }

  // ==================== 滚动操作 ====================
  scrollTo(row: number, col: number): void {
    if (this.spreadsheet) {
      try {
        // jSpreadsheet 可能没有直接的 scrollTo 方法
        // 尝试使用 DOM 滚动
        const colName = this.getColumnName(col)
        const cellName = `${colName}${row + 1}`
        const cell = this.container?.querySelector(`[data-cell="${cellName}"]`)
        if (cell) {
          cell.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      } catch (e) {
        console.warn('[JSpreadsheetAdapter] Scroll not supported')
      }
    }
  }

  getScrollPosition(): { row: number; col: number } {
    // jSpreadsheet 没有直接获取滚动位置的API
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
    // Return the first worksheet if it's an array
    return Array.isArray(this.spreadsheet) ? this.spreadsheet[0] : this.spreadsheet
  }

  // ==================== 辅助方法 ====================
  /**
   * 将列索引转换为列名 (0 -> A, 1 -> B, ..., 26 -> AA)
   */
  private getColumnName(col: number): string {
    let name = ''
    let num = col + 1
    while (num > 0) {
      const remainder = (num - 1) % 26
      name = String.fromCharCode(65 + remainder) + name
      num = Math.floor((num - 1) / 26)
    }
    return name
  }
}
