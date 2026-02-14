import { ProductAdapter } from './ProductAdapter'
import { ProductType } from '@/types'

/**
 * SpreadJS 适配器
 */
export class SpreadJSAdapter extends ProductAdapter {
  private workbook: any = null

  constructor() {
    super(ProductType.SPREADJS)
  }

  async initialize(container: HTMLElement): Promise<void> {
    this.container = container
    // TODO: 初始化 SpreadJS
  }

  async destroy(): Promise<void> {
    // TODO: 销毁 SpreadJS 实例
    this.workbook = null
  }

  async loadData(data: any): Promise<void> {
    // TODO: 加载数据到 SpreadJS
  }

  getInstance(): any {
    return this.workbook
  }
}
