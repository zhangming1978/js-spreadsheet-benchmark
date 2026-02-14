import { FC, useEffect, useRef, useState } from 'react'
import { Card, Badge, Spin, Empty } from 'antd'
import { ProductType } from '@/types'
import { useTestStore } from '@/stores/useTestStore'
import { AdapterFactory } from '@/core/adapters/AdapterFactory'
import type { ProductAdapter } from '@/core/adapters/ProductAdapter'
import './ProductCard.css'

interface ProductCardProps {
  productType: ProductType
}

const ProductCard: FC<ProductCardProps> = ({ productType }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const adapterRef = useRef<ProductAdapter | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const { currentProduct, isRunning } = useTestStore()

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

  // 当前产品正在测试
  const isCurrentlyTesting = isRunning && currentProduct === productType

  useEffect(() => {
    // 当当前产品开始测试时，初始化实例
    if (isCurrentlyTesting && containerRef.current && !adapterRef.current) {
      const initProduct = async () => {
        try {
          const adapter = AdapterFactory.create(productType)
          adapterRef.current = adapter
          await adapter.initialize(containerRef.current!)
          setIsInitialized(true)
          console.log(`[ProductCard] ${productType} initialized for display`)
        } catch (error) {
          console.error(`[ProductCard] Failed to initialize ${productType}:`, error)
        }
      }
      initProduct()
    }

    // 当测试结束时，清理实例
    if (!isRunning && adapterRef.current) {
      const cleanup = async () => {
        try {
          await adapterRef.current!.destroy()
          adapterRef.current = null
          setIsInitialized(false)
          console.log(`[ProductCard] ${productType} destroyed`)
        } catch (error) {
          console.error(`[ProductCard] Failed to destroy ${productType}:`, error)
        }
      }
      cleanup()
    }
  }, [isCurrentlyTesting, isRunning, productType])

  return (
    <Card
      className="product-card"
      title={
        <div className="product-card-title">
          <Badge color={getProductColor(productType)} />
          <span>{productType}</span>
          {isCurrentlyTesting && <Badge status="processing" text="测试中" style={{ marginLeft: 8 }} />}
        </div>
      }
    >
      <div className="product-container">
        {!isRunning && !isInitialized && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="等待测试"
            style={{ padding: '40px 0' }}
          />
        )}
        {isRunning && !isCurrentlyTesting && !isInitialized && (
          <div className="product-placeholder">
            <Spin tip="等待测试...">
              <div style={{ minHeight: 100 }} />
            </Spin>
          </div>
        )}
        <div
          ref={containerRef}
          className="product-instance"
          style={{
            width: '100%',
            height: isInitialized ? '400px' : '0',
            overflow: 'hidden',
            display: isInitialized ? 'block' : 'none'
          }}
        />
      </div>
    </Card>
  )
}

export default ProductCard
