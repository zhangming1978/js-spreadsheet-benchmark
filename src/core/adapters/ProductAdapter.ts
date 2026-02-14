import { ProductType } from '@/types'

/**
 * 产品适配器基类
 */
export abstract class ProductAdapter {
  protected productType: ProductType
  protected container: HTMLElement | null = null

  constructor(productType: ProductType) {
    this.productType = productType
  }

  /**
   * 初始化产品
   */
  abstract initialize(container: HTMLElement): Promise<void>

  /**
   * 销毁产品实例
   */
  abstract destroy(): Promise<void>

  /**
   * 加载数据
   */
  abstract loadData(data: any): Promise<void>

  /**
   * 获取产品实例
   */
  abstract getInstance(): any
}
