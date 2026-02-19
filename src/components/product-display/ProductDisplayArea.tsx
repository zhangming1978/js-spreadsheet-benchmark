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
  const { currentProduct, isRunning, results } = useTestStore()

  // 只对已完成测试的产品强制渲染，避免不必要的性能开销
  const hasSpreadJSResult = results.some(r => r.productName === ProductType.SPREADJS)
  const hasUniverResult = results.some(r => r.productName === ProductType.UNIVER)
  const hasHandsontableResult = results.some(r => r.productName === ProductType.HANDSONTABLE)

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
    }
  ]

  return (
    <div className="product-display-area">
      <Card>
        <Tabs
          activeKey={isRunning && currentProduct ? currentProduct : undefined}
          items={tabItems}
          size="large"
        />
      </Card>
    </div>
  )
}

export default ProductDisplayArea
