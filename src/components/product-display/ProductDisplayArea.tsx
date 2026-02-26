import { FC } from 'react'
import { Tabs, Card } from 'antd'
import ProductCard from './ProductCard'
import { ProductType } from '@/types'
import { useTestStore } from '@/stores/useTestStore'
import './ProductDisplayArea.css'

const ProductDisplayArea: FC = () => {
  const { isRunning, currentProduct } = useTestStore()

  const tabItems = [
    { key: ProductType.SPREADJS, label: 'SpreadJS', children: <ProductCard productType={ProductType.SPREADJS} />, forceRender: true },
    { key: ProductType.UNIVER, label: 'Univer', children: <ProductCard productType={ProductType.UNIVER} />, forceRender: true },
    { key: ProductType.HANDSONTABLE, label: 'Handsontable', children: <ProductCard productType={ProductType.HANDSONTABLE} />, forceRender: true },
    { key: ProductType.LUCKYSHEET, label: 'Luckysheet', children: <ProductCard productType={ProductType.LUCKYSHEET} />, forceRender: true },
    { key: ProductType.X_SPREADSHEET, label: 'x-spreadsheet', children: <ProductCard productType={ProductType.X_SPREADSHEET} />, forceRender: true },
    { key: ProductType.JSPREADSHEET, label: 'jSpreadsheet', children: <ProductCard productType={ProductType.JSPREADSHEET} />, forceRender: true },
  ]

  return (
    <div className="product-display-area">
      <Card>
        <Tabs
          activeKey={isRunning && currentProduct ? currentProduct : undefined}
          defaultActiveKey={ProductType.SPREADJS}
          items={tabItems}
          size="large"
        />
      </Card>
    </div>
  )
}

export default ProductDisplayArea
