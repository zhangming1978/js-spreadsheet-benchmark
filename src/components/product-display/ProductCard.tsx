import { FC, memo } from 'react'
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
  const {
    currentProduct,
    isRunning,
    waitingForConfirmation,
    currentTestResult,
    selectedScenario,
    currentFPS,
    currentMemory,
    isLastTest,
    currentRun,
    totalRuns,
    testStage,
    results,
    autoContinueCountdown
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

  const getScenarioMethods = (scenario: string, product: ProductType) => {
    const methodsMap: Record<string, Record<ProductType, string>> = {
      'data-loading': {
        [ProductType.SPREADJS]: 'setDataSource()',
        [ProductType.UNIVER]: 'getRange().setValues()',
        [ProductType.HANDSONTABLE]: 'loadData()'
      },
      'scrolling': {
        [ProductType.SPREADJS]: 'setDataSource(), showRow(), showColumn()',
        [ProductType.UNIVER]: 'getRange().setValues(), getRange().activate()',
        [ProductType.HANDSONTABLE]: 'loadData(), scrollViewportTo()'
      },
      'editing': {
        [ProductType.SPREADJS]: 'setDataSource(), setArray()',
        [ProductType.UNIVER]: 'getRange().setValues() ×2',
        [ProductType.HANDSONTABLE]: 'loadData(), populateFromArray()'
      },
      'formula': {
        [ProductType.SPREADJS]: 'setDataSource(), setFormula(), recalcAll()',
        [ProductType.UNIVER]: 'getRange().setValues(), getRange().setFormula()',
        [ProductType.HANDSONTABLE]: 'loadData(), setDataAtCell(), render()'
      },
      'rendering': {
        [ProductType.SPREADJS]: 'setDataSource()',
        [ProductType.UNIVER]: 'getRange().setValues()',
        [ProductType.HANDSONTABLE]: 'loadData()'
      },
      'memory': {
        [ProductType.SPREADJS]: 'setDataSource()',
        [ProductType.UNIVER]: 'getRange().setValues()',
        [ProductType.HANDSONTABLE]: 'loadData()'
      },
      'excel-import': {
        [ProductType.SPREADJS]: 'setDataSource()',
        [ProductType.UNIVER]: 'getRange().setValues()',
        [ProductType.HANDSONTABLE]: 'loadData()'
      }
    }
    return methodsMap[scenario]?.[product] || ''
  }

  // 当前产品正在测试
  const isCurrentlyTesting = isRunning && currentProduct === productType
  // 当前产品等待确认
  const isWaitingConfirmation = waitingForConfirmation && currentProduct === productType && currentTestResult
  // 当前产品是否有已完成的测试结果
  const hasCompletedTest = results.some(result => result.productName === productType)
  // 是否应该显示 iframe（正在测试、等待确认或已有测试结果时显示）
  const shouldShowIframe = isCurrentlyTesting || isWaitingConfirmation || hasCompletedTest

  return (
    <Card
      className="product-card"
      title={
        <div className="product-card-header">
          <div className="product-info">
            <Badge color={getProductColor(productType)} />
            <span className="product-version">{getProductVersion(productType)}</span>
            {selectedScenario && (
              <>
                <span className="product-scenario">场景: {getScenarioName(selectedScenario)}</span>
                <span className="product-methods">方法: {getScenarioMethods(selectedScenario, productType)}</span>
              </>
            )}
          </div>

          {isCurrentlyTesting && !isWaitingConfirmation && (
            <div className="performance-stats">
              <Space size="middle" direction="vertical" style={{ alignItems: 'flex-end' }}>
                {testStage && (
                  <div style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#1890ff',
                    padding: '4px 12px',
                    background: '#e6f7ff',
                    borderRadius: 4,
                    border: '1px solid #91d5ff'
                  }}>
                    {testStage}
                  </div>
                )}
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
              </Space>
            </div>
          )}

          {isWaitingConfirmation && currentTestResult && (
            <div className="control-buttons">
              <Space size="small" direction="vertical" style={{ width: '100%' }}>
                {currentTestResult.success && (
                  <div className="test-result-info" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 4 }} />
                      <strong>执行时间：</strong>
                      <span style={{ marginLeft: 4 }}>平均 {currentTestResult.metrics.executionTime.toFixed(0)}ms</span>
                      {currentTestResult.runs && currentTestResult.runs.length > 0 && (
                        <span style={{ marginLeft: 6, fontSize: 12, color: '#666' }}>
                          ({currentTestResult.runs.map(r => r.executionTime.toFixed(0)).join(', ')}ms)
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <strong>FPS：</strong>
                      <span style={{ marginLeft: 4 }}>平均 {currentTestResult.metrics.fps?.toFixed(0) || 0}</span>
                      {currentTestResult.runs && currentTestResult.runs.length > 0 && (
                        <span style={{ marginLeft: 6, fontSize: 12, color: '#666' }}>
                          ({currentTestResult.runs.map(r => r.fps.toFixed(0)).join(', ')})
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <strong>内存：</strong>
                      <span style={{ marginLeft: 4 }}>平均 {currentTestResult.metrics.memoryUsage.toFixed(0)}MB</span>
                      {currentTestResult.runs && currentTestResult.runs.length > 0 && (
                        <span style={{ marginLeft: 6, fontSize: 12, color: '#666' }}>
                          ({currentTestResult.runs.map(r => r.memoryUsage.toFixed(0)).join(', ')}MB)
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <Space size="small">
                  {currentTestResult.success && (
                    <>
                      <Button
                        type="primary"
                        size="small"
                        icon={<CheckCircleOutlined />}
                        onClick={onContinue}
                      >
                        {isLastTest ? '查看结果' : '继续下一个'}
                        {autoContinueCountdown > 0 && ` (${autoContinueCountdown})`}
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
              </Space>
            </div>
          )}
        </div>
      }
    >
      <div className="product-container">
        {!isRunning && !hasCompletedTest && (
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
        {/* 使用 iframe 进行测试，保持测试结果可见且互不影响 */}
        <iframe
          id={`test-frame-${productType}`}
          src="/test-frame.html"
          style={{
            width: '100%',
            height: '400px',
            border: 'none',
            display: shouldShowIframe ? 'block' : 'none'
          }}
        />
      </div>
    </Card>
  )
}

export default memo(ProductCard)
