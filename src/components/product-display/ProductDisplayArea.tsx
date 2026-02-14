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
  const { currentProduct, isRunning } = useTestStore()

  const tabItems = [
    {
      key: ProductType.SPREADJS,
      label: 'SpreadJS',
      children: <ProductCard productType={ProductType.SPREADJS} onContinue={onContinue} onRetest={onRetest} onStop={onStop} />
    },
    {
      key: ProductType.HANDSONTABLE,
      label: 'Handsontable',
      children: <ProductCard productType={ProductType.HANDSONTABLE} onContinue={onContinue} onRetest={onRetest} onStop={onStop} />
    }
  ]

  return (
    <div className="product-display-area">
      <Card>
        <Tabs
          activeKey={isRunning && currentProduct ? currentProduct : ProductType.SPREADJS}
          items={tabItems}
          size="large"
        />
      </Card>
    </div>
  )
}

export default ProductDisplayArea
