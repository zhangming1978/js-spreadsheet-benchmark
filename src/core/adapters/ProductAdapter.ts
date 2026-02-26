import { ProductType } from '@/types'
import type { FormulaDataSet } from '../engine/DataGenerator'

/**
 * 产品适配器基类
 * 定义所有产品适配器必须实现的接口
 */
export abstract class ProductAdapter {
  protected productType: ProductType
  protected container: HTMLElement | null = null

  constructor(productType: ProductType) {
    this.productType = productType
  }

  // ==================== 产品信息 ====================
  /**
   * 获取产品类型
   */
  getProductType(): ProductType {
    return this.productType
  }

  /**
   * 获取产品名称
   */
  abstract getProductName(): string

  /**
   * 获取产品版本
   */
  abstract getVersion(): string

  // ==================== 生命周期 ====================
  /**
   * 初始化产品
   */
  abstract initialize(container: HTMLElement): Promise<void>

  /**
   * 销毁产品实例
   */
  abstract destroy(): Promise<void>

  // ==================== 数据操作 ====================
  /**
   * 加载数据
   */
  abstract loadData(data: any[][]): Promise<void>

  /**
   * 加载公式数据（测试前已预处理好的 values + formulas）
   * 默认实现：重建 raw 数组后调 loadData，子类可覆写以直接调用 API
   */
  async loadFormulaData(dataset: FormulaDataSet): Promise<void> {
    const raw = dataset.values.map((row, r) =>
      row.map((cell, c) => dataset.formulas[r][c] || cell)
    )
    await this.loadData(raw)
  }

  /**
   * 获取数据
   */
  abstract getData(): any[][]

  /**
   * 清空数据
   */
  abstract clearData(): void

  // ==================== 编辑操作 ====================
  /**
   * 设置单元格值
   */
  abstract setCellValue(row: number, col: number, value: any): void

  /**
   * 获取单元格值
   */
  abstract getCellValue(row: number, col: number): any

  /**
   * 批量设置区域值
   */
  abstract setRangeValues(startRow: number, startCol: number, values: any[][]): void

  /**
   * 自动填充
   */
  abstract autoFill(startRow: number, startCol: number, endRow: number, endCol: number): void

  // ==================== 公式操作 ====================
  /**
   * 设置公式
   */
  abstract setFormula(row: number, col: number, formula: string): void

  /**
   * 重新计算公式
   */
  abstract recalculate(): void

  // ==================== 滚动操作 ====================
  /**
   * 滚动到指定位置
   */
  abstract scrollTo(row: number, col: number): void

  /**
   * 获取滚动位置
   */
  abstract getScrollPosition(): { row: number; col: number }

  // ==================== 性能监控 ====================
  /**
   * 获取内存占用 (字节)
   */
  abstract getMemoryUsage(): number

  /**
   * 获取当前 FPS
   */
  abstract getFPS(): number

  // ==================== 实例访问 ====================
  /**
   * 获取产品实例
   */
  abstract getInstance(): any
}
