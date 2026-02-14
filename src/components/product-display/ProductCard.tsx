import { FC, useRef } from 'react'
import { Card, Badge, Spin, Empty, Space, Button } from 'antd'
import { CheckCircleOutlined, ReloadOutlined, StopOutlined, ThunderboltOutlined, DatabaseOutlined } from '@ant-design/icons'
import { ProductType } from '@/types'
import { useTestStore } from '@/stores/useTestStore'
import './ProductCard.css'

interface ProductCardProps {
  productType: ProductType
  onContinue?: () => void
  onRetest?: () => void
  onStop?: () => void
}

const ProductCard: FC<ProductCardProps> = ({ productType, onContinue, onRetest, onStop }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const {
    currentProduct,
    isRunning,
    waitingForConfirmation,
    currentTestResult,
    selectedScenario,
    currentFPS,
    currentMemory
  } = useTestStore()

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

  const getProductVersion = (type: ProductType) => {
    switch (type) {
      case ProductType.SPREADJS:
        return 'v19.0.1'
      case ProductType.UNIVER:
        return 'v0.15.5'
      case ProductType.HANDSONTABLE:
        return 'v16.2.0'
      default:
        return ''
    }
  }

  const getScenarioName = (scenario: string) => {
    const scenarioMap: Record<string, string> = {
      'data-loading': '数据加载',
      'scrolling': '滚动性能',
      'editing': '编辑性能',
      'formula': '公式计算',
      'rendering': '渲染性能',
      'memory': '内存占用',
      'excel-import': 'Excel导入'
    }
    return scenarioMap[scenario] || scenario
  }

  // 当前产品正在测试
  const isCurrentlyTesting = isRunning && currentProduct === productType
  // 当前产品等待确认
  const isWaitingConfirmation = waitingForConfirmation && currentProduct === productType && currentTestResult

  return (
    <Card
      className="product-card"
      title={
        <div className="product-card-header">
          <div className="product-info">
            <Badge color={getProductColor(productType)} />            
            <span className="product-version">{getProductVersion(productType)}</span>
            {selectedScenario && (
              <span className="product-scenario">场景: {getScenarioName(selectedScenario)}</span>
            )}
          </div>

          {isCurrentlyTesting && !isWaitingConfirmation && (
            <div className="performance-stats">
              <Space size="middle">
                <div className="stat-item">
                  <ThunderboltOutlined style={{ color: currentFPS >= 50 ? '#52c41a' : currentFPS >= 30 ? '#faad14' : '#ff4d4f' }} />
                  <span className="stat-value">{currentFPS}</span>
                  <span className="stat-unit">fps</span>
                </div>
                <div className="stat-item">
                  <DatabaseOutlined style={{ color: '#1890ff' }} />
                  <span className="stat-value">{currentMemory.toFixed(0)}</span>
                  <span className="stat-unit">MB</span>
                </div>
              </Space>
            </div>
          )}

          {isWaitingConfirmation && currentTestResult && (
            <div className="control-buttons">
              <Space size="small">
                {currentTestResult.success && (
                  <>
                    <span className="test-result-info">
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 4 }} />
                      平均: {currentTestResult.metrics.executionTime.toFixed(0)}ms
                      {currentTestResult.runs && currentTestResult.runs.length > 0 && (
                        <span style={{ marginLeft: 8, fontSize: 12, color: '#666' }}>
                          ({currentTestResult.runs.map(r => r.executionTime.toFixed(0)).join(', ')}ms)
                        </span>
                      )}
                    </span>
                    <Button
                      type="primary"
                      size="small"
                      icon={<CheckCircleOutlined />}
                      onClick={onContinue}
                    >
                      继续下一个
                    </Button>
                    <Button
                      size="small"
                      icon={<ReloadOutlined />}
                      onClick={onRetest}
                    >
                      重测
                    </Button>
                  </>
                )}
                <Button
                  danger
                  size="small"
                  icon={<StopOutlined />}
                  onClick={onStop}
                >
                  停止
                </Button>
              </Space>
            </div>
          )}
        </div>
      }
    >
      <div className="product-container">
        {!isRunning && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="等待测试"
            style={{ padding: '40px 0' }}
          />
        )}
        {isRunning && !isCurrentlyTesting && (
          <div className="product-placeholder">
            <Spin tip="等待测试...">
              <div style={{ minHeight: 100 }} />
            </Spin>
          </div>
        )}
        <div
          ref={containerRef}
          id={`product-container-${productType}`}
          className="product-instance"
          style={{
            width: '100%',
            height: isCurrentlyTesting ? '400px' : '0',
            overflow: 'hidden',
            display: isCurrentlyTesting ? 'block' : 'none'
          }}
        />
      </div>
    </Card>
  )
}

export default ProductCard
