import { FC } from 'react'
import { Tabs, Card } from 'antd'
import ProductCard from './ProductCard'
import { ProductType } from '@/types'
import { useTestStore } from '@/stores/useTestStore'
import './ProductDisplayArea.css'

interface ProductDisplayAreaProps {
  onContinue?: () => void
  onRetest?: () => void
  onStop?: () => void
}

const ProductDisplayArea: FC<ProductDisplayAreaProps> = ({ onContinue, onRetest, onStop }) => {
  const { isRunning, currentProduct } = useTestStore()

  // 只对已完成测试的产品强制渲染，避免不必要的性能开销
  const tabItems = [
    {
      key: ProductType.SPREADJS,
      label: 'SpreadJS',
      children: <ProductCard productType={ProductType.SPREADJS} onContinue={onContinue} onRetest={onRetest} onStop={onStop} />,
      forceRender: true // 始终渲染以确保 iframe 可用
    },
    {
      key: ProductType.UNIVER,
      label: 'Univer',
      children: <ProductCard productType={ProductType.UNIVER} onContinue={onContinue} onRetest={onRetest} onStop={onStop} />,
      forceRender: true // 始终渲染以确保 iframe 可用
    },
    {
      key: ProductType.HANDSONTABLE,
      label: 'Handsontable',
      children: <ProductCard productType={ProductType.HANDSONTABLE} onContinue={onContinue} onRetest={onRetest} onStop={onStop} />,
      forceRender: true // 始终渲染以确保 iframe 可用
    },
    {
      key: ProductType.LUCKYSHEET,
      label: 'Luckysheet',
      children: <ProductCard productType={ProductType.LUCKYSHEET} onContinue={onContinue} onRetest={onRetest} onStop={onStop} />,
      forceRender: true // 始终渲染以确保 iframe 可用
    },
    {
      key: ProductType.X_SPREADSHEET,
      label: 'x-spreadsheet',
      children: <ProductCard productType={ProductType.X_SPREADSHEET} onContinue={onContinue} onRetest={onRetest} onStop={onStop} />,
      forceRender: true // 始终渲染以确保 iframe 可用
    },
    {
      key: ProductType.JSPREADSHEET,
      label: 'jSpreadsheet',
      children: <ProductCard productType={ProductType.JSPREADSHEET} onContinue={onContinue} onRetest={onRetest} onStop={onStop} />,
      forceRender: true // 始终渲染以确保 iframe 可用
    }
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
