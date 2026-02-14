import { FC } from 'react'
import { Row, Col } from 'antd'
import ProductCard from './ProductCard'
import { ProductType } from '@/types'
import './ProductDisplayArea.css'

const ProductDisplayArea: FC = () => {
  return (
    <div className="product-display-area">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={24} lg={8} xl={8} xxl={8}>
          <ProductCard productType={ProductType.SPREADJS} />
        </Col>
        <Col xs={24} sm={24} md={24} lg={8} xl={8} xxl={8}>
          <ProductCard productType={ProductType.UNIVER} />
        </Col>
        <Col xs={24} sm={24} md={24} lg={8} xl={8} xxl={8}>
          <ProductCard productType={ProductType.HANDSONTABLE} />
        </Col>
      </Row>
    </div>
  )
}

export default ProductDisplayArea
