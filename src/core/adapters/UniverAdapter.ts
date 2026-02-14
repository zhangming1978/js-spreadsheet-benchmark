import { ProductAdapter } from './ProductAdapter'
import { ProductType } from '@/types'
import { FPSMonitor } from './FPSMonitor'
import { Univer, IWorkbookData, LocaleType } from '@univerjs/core'
import { defaultTheme } from '@univerjs/design'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverSheetsPlugin } from '@univerjs/sheets'
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui'
import { UniverUIPlugin } from '@univerjs/ui'
import { FUniver } from '@univerjs/core/facade'
import type { FWorkbook, FWorksheet } from '@univerjs/core/facade'
// Import facade side effects to register facade methods
import '@univerjs/sheets/facade'
import '@univerjs/sheets-ui/facade'

/**
 * Univer 适配器
 * 将 Univer API 适配到统一接口
 */
export class UniverAdapter extends ProductAdapter {
  private univer: Univer | null = null
  private univerAPI: FUniver | null = null
  private workbook: FWorkbook | null = null
  private worksheet: FWorksheet | null = null
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

    // 初始化 Univer 实例
    this.univer = new Univer({
      theme: defaultTheme,
      locale: LocaleType.ZH_CN,
    })

    // 注册核心插件和 UI 插件
    this.univer.registerPlugin(UniverRenderEnginePlugin)
    this.univer.registerPlugin(UniverUIPlugin, {
      container: container,
    })
    this.univer.registerPlugin(UniverSheetsPlugin)
    this.univer.registerPlugin(UniverSheetsUIPlugin)

    // 创建 Facade API
    this.univerAPI = FUniver.newAPI(this.univer)

    // 创建工作簿，指定足够大的行列数以支持性能测试
    const workbookData: IWorkbookData = {
      id: 'performance-test-workbook',
      name: 'Performance Test',
      locale: LocaleType.ZH_CN,
      sheetOrder: ['sheet1'],
      sheets: {
        sheet1: {
          id: 'sheet1',
          name: 'Sheet1',
          rowCount: 1000000,  // 支持最大 100 万行
          columnCount: 100,    // 支持 100 列
          cellData: {},
          defaultColumnWidth: 100,
          defaultRowHeight: 20
        }
      }
    }

    this.workbook = this.univerAPI.createWorkbook(workbookData)

    // 获取活动工作表
    this.worksheet = this.workbook.getActiveSheet()

    console.log('[UniverAdapter] Initialized with Univer', this.getVersion())
  }

  async destroy(): Promise<void> {
    this.fpsMonitor.stop()

    // 销毁 Univer 实例
    if (this.univer) {
      this.univer.dispose()
    }

    this.univer = null
    this.univerAPI = null
    this.workbook = null
    this.worksheet = null
    console.log('[UniverAdapter] Destroyed')
  }

  // ==================== 数据操作 ====================
  async loadData(data: any[][]): Promise<void> {
    if (this.worksheet) {
      // 使用 setValues 批量设置数据
      const range = this.worksheet.getRange(0, 0, data.length, data[0]?.length || 0)
      await range.setValues(data)
    }
    console.log(`[UniverAdapter] Loaded ${data.length} rows`)
  }

  getData(): any[][] {
    if (this.worksheet) {
      // 获取已使用的范围
      const maxRow = 1000 // 假设最大行数
      const maxCol = 26 // 假设最大列数
      const range = this.worksheet.getRange(0, 0, maxRow, maxCol)
      return range.getValues() as any[][]
    }
    return []
  }

  clearData(): void {
    if (this.worksheet) {
      // 清空数据
      const maxRow = 1000
      const maxCol = 26
      const range = this.worksheet.getRange(0, 0, maxRow, maxCol)
      range.clear()
    }
    console.log('[UniverAdapter] Data cleared')
  }

  // ==================== 编辑操作 ====================
  setCellValue(row: number, col: number, value: any): void {
    if (this.worksheet) {
      const range = this.worksheet.getRange(row, col)
      range.setValue(value)
    }
  }

  getCellValue(row: number, col: number): any {
    if (this.worksheet) {
      const range = this.worksheet.getRange(row, col)
      return range.getValue()
    }
    return null
  }

  setRangeValues(startRow: number, startCol: number, values: any[][]): void {
    if (this.worksheet) {
      const range = this.worksheet.getRange(startRow, startCol, values.length, values[0]?.length || 0)
      range.setValues(values)
    }
  }

  autoFill(startRow: number, startCol: number, endRow: number, endCol: number): void {
    if (this.worksheet) {
      // Univer 的自动填充功能可能需要通过命令实现
      // 这里提供一个简单的实现：复制第一个单元格的值到整个范围
      const sourceRange = this.worksheet.getRange(startRow, startCol)
      const sourceValue = sourceRange.getValue()
      const targetRange = this.worksheet.getRange(startRow, startCol, endRow - startRow + 1, endCol - startCol + 1)
      targetRange.setValue(sourceValue)
    }
  }

  // ==================== 公式操作 ====================
  setFormula(row: number, col: number, formula: string): void {
    if (this.worksheet) {
      const range = this.worksheet.getRange(row, col)
      range.setValue(formula)
    }
  }

  recalculate(): void {
    // Univer 会自动重新计算公式
    // 如果需要手动触发，可能需要通过命令系统
    console.log('[UniverAdapter] Recalculate (auto)')
  }

  // ==================== 滚动操作 ====================
  scrollTo(row: number, col: number): void {
    if (this.worksheet) {
      // 激活指定单元格（会自动滚动到该位置）
      const range = this.worksheet.getRange(row, col)
      range.activate()
    }
  }

  getScrollPosition(): { row: number; col: number } {
    if (this.worksheet) {
      // 获取当前选中的单元格位置
      const selection = this.worksheet.getSelection()
      if (selection) {
        const currentCell = selection.getCurrentCell()
        return {
          row: currentCell.actualRow,
          col: currentCell.actualColumn
        }
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
    return this.univer
  }
}
