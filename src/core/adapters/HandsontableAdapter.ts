import { ProductAdapter } from './ProductAdapter'
import { ProductType } from '@/types'

/**
 * Handsontable 适配器
 */
export class HandsontableAdapter extends ProductAdapter {
  private hotInstance: any = null

  constructor() {
    super(ProductType.HANDSONTABLE)
  }

  async initialize(container: HTMLElement): Promise<void> {
    this.container = container
    // TODO: 初始化 Handsontable
  }

  async destroy(): Promise<void> {
    // TODO: 销毁 Handsontable 实例
    this.hotInstance = null
  }

  async loadData(data: any): Promise<void> {
    // TODO: 加载数据到 Handsontable
  }

  getInstance(): any {
    return this.hotInstance
  }
}
