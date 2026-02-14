import { ProductAdapter } from './ProductAdapter'
import { ProductType } from '@/types'

/**
 * Univer 适配器
 */
export class UniverAdapter extends ProductAdapter {
  private univerInstance: any = null

  constructor() {
    super(ProductType.UNIVER)
  }

  async initialize(container: HTMLElement): Promise<void> {
    this.container = container
    // TODO: 初始化 Univer
  }

  async destroy(): Promise<void> {
    // TODO: 销毁 Univer 实例
    this.univerInstance = null
  }

  async loadData(data: any): Promise<void> {
    // TODO: 加载数据到 Univer
  }

  getInstance(): any {
    return this.univerInstance
  }
}
