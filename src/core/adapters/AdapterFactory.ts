import { ProductType } from '@/types'
import type { ProductAdapter } from './ProductAdapter'
import { SpreadJSAdapter } from './SpreadJSAdapter'
import { UniverAdapter } from './UniverAdapter'
import { HandsontableAdapter } from './HandsontableAdapter'
import { XSpreadsheetAdapter } from './XSpreadsheetAdapter'
import { LuckysheetAdapter } from './LuckysheetAdapter'
import { JSpreadsheetAdapter } from './JSpreadsheetAdapter'

/**
 * 适配器工厂
 * 根据产品类型创建对应的适配器实例
 */
export class AdapterFactory {
  /**
   * 创建产品适配器
   * @param productType - 产品类型
   * @returns 产品适配器实例
   * @throws 如果产品类型未知则抛出错误
   */
  static create(productType: ProductType): ProductAdapter {
    switch (productType) {
      case ProductType.SPREADJS:
        return new SpreadJSAdapter()

      case ProductType.UNIVER:
        return new UniverAdapter()

      case ProductType.HANDSONTABLE:
        return new HandsontableAdapter()

      case ProductType.X_SPREADSHEET:
        return new XSpreadsheetAdapter()

      case ProductType.LUCKYSHEET:
        return new LuckysheetAdapter()

      case ProductType.JSPREADSHEET:
        return new JSpreadsheetAdapter()

      default:
        throw new Error(`Unknown product type: ${productType}`)
    }
  }

  /**
   * 获取所有支持的产品类型
   * @returns 产品类型数组
   */
  static getSupportedProducts(): ProductType[] {
    return [
      ProductType.SPREADJS,
      ProductType.UNIVER,
      ProductType.HANDSONTABLE,
      ProductType.X_SPREADSHEET,
      ProductType.LUCKYSHEET,
      ProductType.JSPREADSHEET
    ]
  }
}
