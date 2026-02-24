import { ProductAdapter } from './ProductAdapter'
import { ProductType } from '@/types'
import { FPSMonitor } from './FPSMonitor'

/**
 * x-spreadsheet 适配器
 * 将 x-spreadsheet API 适配到统一接口
 */
export class XSpreadsheetAdapter extends ProductAdapter {
  private spreadsheet: any = null
  private fpsMonitor: FPSMonitor

  constructor() {
    super(ProductType.X_SPREADSHEET)
    this.fpsMonitor = new FPSMonitor()
  }

  // ==================== 产品信息 ====================
  getProductName(): string {
    return 'x-spreadsheet'
  }

  getVersion(): string {
    return '1.1.9'
  }

  // ==================== 生命周期 ====================
  async initialize(container: HTMLElement): Promise<void> {
    this.container = container
    this.fpsMonitor.start()

    // 初始化 x-spreadsheet
    // @ts-ignore
    if (typeof window.x !== 'undefined' && window.x.spreadsheet) {
      // @ts-ignore
      this.spreadsheet = new window.x.spreadsheet(container, {
        mode: 'edit',
        showToolbar: false,
        showGrid: true,
        showContextmenu: false,
        view: {
          height: () => container.clientHeight,
          width: () => container.clientWidth
        },
        row: {
          len: 100000,  // 支持大数据集
          height: 25
        },
        col: {
          len: 26,
          width: 100,
          indexWidth: 60,
          minWidth: 60
        }
      })
      console.log('[XSpreadsheetAdapter] 已初始化 x-spreadsheet', this.getVersion())
    } else {
      throw new Error('x-spreadsheet library not loaded')
    }
  }

  async destroy(): Promise<void> {
    this.fpsMonitor.stop()

    if (this.spreadsheet) {
      // x-spreadsheet 没有明确的 destroy 方法，清空容器
      if (this.container) {
        this.container.innerHTML = ''
      }
    }

    this.spreadsheet = null
    console.log('[XSpreadsheetAdapter] 已销毁')
  }

  // ==================== 数据操作 ====================
  async loadData(data: any[][]): Promise<void> {
    if (this.spreadsheet && data.length > 0) {
      console.log(`[XSpreadsheetAdapter] 开始加载数据: ${data.length} 行`)

      // 转换数据格式为 x-spreadsheet 格式
      // x-spreadsheet 期望的格式: { rows: { 0: { cells: { 0: { text: 'value' } } } } }
      const rows: any = {}
      data.forEach((row, rowIndex) => {
        const cells: any = {}
        row.forEach((cell, colIndex) => {
          cells[colIndex] = { text: String(cell) }
        })
        rows[rowIndex] = { cells }
      })

      // 获取当前数据以保留其他配置
      const currentData = this.spreadsheet.getData()
      console.log(`[XSpreadsheetAdapter] 当前数据结构:`, JSON.stringify(currentData).substring(0, 200))

      // 加载数据 - 合并到现有数据结构
      const newData = {
        ...currentData,
        name: currentData.name || 'sheet1',
        rows
      }

      this.spreadsheet.loadData(newData)

      // 强制重新渲染
      this.spreadsheet.reRender()

      // 等待渲染完成
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证实际加载的数据
      const loadedData = this.spreadsheet.getData()
      // getData() 返回数组，第一个元素是当前 sheet
      const sheetData = Array.isArray(loadedData) ? loadedData[0] : loadedData
      const rowKeys = Object.keys(sheetData.rows || {}).filter(key => key !== 'len')
      const loadedRowCount = rowKeys.length
      console.log(`[XSpreadsheetAdapter] 加载后数据结构:`, JSON.stringify(loadedData).substring(0, 200))
      console.log(`[XSpreadsheetAdapter] 数据加载完成: 请求 ${data.length} 行, 实际加载 ${loadedRowCount} 行`)
    }
  }

  getData(): any[][] {
    if (this.spreadsheet) {
      const data = this.spreadsheet.getData()
      // getData() 返回数组，第一个元素是当前 sheet
      const sheetData = Array.isArray(data) ? data[0] : data
      const rows = sheetData.rows || {}
      const result: any[][] = []

      Object.keys(rows).forEach(rowIndex => {
        if (rowIndex === 'len') return // 跳过 len 属性

        const row = rows[rowIndex]
        const cells = row.cells || {}
        const rowData: any[] = []

        Object.keys(cells).forEach(colIndex => {
          rowData[parseInt(colIndex)] = cells[colIndex].text || ''
        })

        result[parseInt(rowIndex)] = rowData
      })

      return result
    }
    return []
  }

  clearData(): void {
    if (this.spreadsheet) {
      this.spreadsheet.loadData({ name: 'sheet1', rows: {} })
    }
  }

  // ==================== 编辑操作 ====================
  setCellValue(row: number, col: number, value: any): void {
    if (this.spreadsheet) {
      this.spreadsheet.cellText(row, col, String(value))
    }
  }

  getCellValue(row: number, col: number): any {
    if (this.spreadsheet) {
      const data = this.spreadsheet.getData()
      // getData() 返回数组，第一个元素是当前 sheet
      const sheetData = Array.isArray(data) ? data[0] : data
      return sheetData.rows?.[row]?.cells?.[col]?.text || ''
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
    // x-spreadsheet 不直接支持 autoFill，使用简单的复制实现
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
      this.spreadsheet.cellText(row, col, formula)
    }
  }

  recalculate(): void {
    // x-spreadsheet 自动计算公式
    if (this.spreadsheet) {
      this.spreadsheet.reRender()
    }
  }

  // ==================== 滚动操作 ====================
  scrollTo(row: number, col: number): void {
    if (this.spreadsheet) {
      // x-spreadsheet 的滚动API有限，尝试使用 scroll 方法
      try {
        this.spreadsheet.scroll(row, col)
      } catch (e) {
        console.warn('[XSpreadsheetAdapter] Scroll not supported')
      }
    }
  }

  getScrollPosition(): { row: number; col: number } {
    // x-spreadsheet 没有直接获取滚动位置的API
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
    return this.spreadsheet
  }
}
