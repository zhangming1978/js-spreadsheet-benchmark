import { FC } from 'react'
import { Card, Badge, Spin } from 'antd'
import { ProductType } from '@/types'
import './ProductCard.css'

interface ProductCardProps {
  productType: ProductType
}

const ProductCard: FC<ProductCardProps> = ({ productType }) => {
  const getProductColor = (type: ProductType) => {
    switch (type) {
      case ProductType.SPREADJS:
        return '#1890ff'
      case ProductType.UNIVER:
        return '#52c41a'
      case ProductType.HANDSONTABLE:
        return '#fa8c16'
      default:
        return '#666'
    }
  }

  return (
    <Card
      className="product-card"
      title={
        <div className="product-card-title">
          <Badge color={getProductColor(productType)} />
          <span>{productType}</span>
        </div>
      }
    >
      <div className="product-container">
        <div className="product-placeholder">
          <Spin tip="等待测试..." />
        </div>
      </div>
    </Card>
  )
}

export default ProductCard
