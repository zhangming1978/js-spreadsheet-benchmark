import { FC, memo } from 'react'
import { Card, Badge, Spin, Empty } from 'antd'
import { ProductType } from '@/types'
import { useTestStore } from '@/stores/useTestStore'
import './ProductCard.css'

interface ProductCardProps {
  productType: ProductType
}

const ProductCard: FC<ProductCardProps> = ({ productType }) => {
  const {
    currentProduct,
    isRunning,
    waitingForConfirmation,
    currentTestResult,
    selectedScenario,
    results,
  } = useTestStore()

  const getProductColor = (type: ProductType) => {
    switch (type) {
      case ProductType.SPREADJS:
        return '#1890ff'
      case ProductType.UNIVER:
        return '#52c41a'
      case ProductType.HANDSONTABLE:
        return '#fa8c16'
      case ProductType.X_SPREADSHEET:
        return '#722ed1'
      case ProductType.LUCKYSHEET:
        return '#eb2f96'
      case ProductType.JSPREADSHEET:
        return '#13c2c2'
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
      case ProductType.X_SPREADSHEET:
        return 'v1.1.9'
      case ProductType.LUCKYSHEET:
        return 'v2.1.13'
      case ProductType.JSPREADSHEET:
        return 'v4.13.1'
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
      'memory': '内存占用'
    }
    return scenarioMap[scenario] || scenario
  }

  const getScenarioMethods = (scenario: string, product: ProductType) => {
    const methodsMap: Record<string, Record<ProductType, string>> = {
      'data-loading': {
        [ProductType.SPREADJS]: 'setDataSource()',
        [ProductType.UNIVER]: 'getRange().setValues()',
        [ProductType.HANDSONTABLE]: 'loadData()',
        [ProductType.X_SPREADSHEET]: 'loadData()',
        [ProductType.LUCKYSHEET]: 'create() with data',
        [ProductType.JSPREADSHEET]: 'setData()'
      },
      'scrolling': {
        [ProductType.SPREADJS]: 'setDataSource(), showRow(), showColumn()',
        [ProductType.UNIVER]: 'getRange().setValues(), getRange().activate()',
        [ProductType.HANDSONTABLE]: 'loadData(), scrollViewportTo()',
        [ProductType.X_SPREADSHEET]: 'loadData(), scroll.set()',
        [ProductType.LUCKYSHEET]: 'create(), scrollTo()',
        [ProductType.JSPREADSHEET]: 'setData(), updateScroll()'
      },
      'editing': {
        [ProductType.SPREADJS]: 'setDataSource(), setArray()',
        [ProductType.UNIVER]: 'getRange().setValues() ×2',
        [ProductType.HANDSONTABLE]: 'loadData(), populateFromArray()',
        [ProductType.X_SPREADSHEET]: 'loadData(), cellText()',
        [ProductType.LUCKYSHEET]: 'create(), setCellValue()',
        [ProductType.JSPREADSHEET]: 'setData(), setValueFromCoords()'
      },
      'formula': {
        [ProductType.SPREADJS]: 'setDataSource(), setFormula(), recalcAll()',
        [ProductType.UNIVER]: 'getRange().setValues(), getRange().setFormula()',
        [ProductType.HANDSONTABLE]: 'loadData(), setDataAtCell(), render()',
        [ProductType.X_SPREADSHEET]: 'loadData(), cellText() with formula',
        [ProductType.LUCKYSHEET]: 'create(), setCellValue() with formula',
        [ProductType.JSPREADSHEET]: 'setData(), setValueFromCoords() with formula'
      },
      'rendering': {
        [ProductType.SPREADJS]: 'setDataSource()',
        [ProductType.UNIVER]: 'getRange().setValues()',
        [ProductType.HANDSONTABLE]: 'loadData()',
        [ProductType.X_SPREADSHEET]: 'loadData()',
        [ProductType.LUCKYSHEET]: 'create() with data',
        [ProductType.JSPREADSHEET]: 'setData()'
      },
      'memory': {
        [ProductType.SPREADJS]: 'setDataSource()',
        [ProductType.UNIVER]: 'getRange().setValues()',
        [ProductType.HANDSONTABLE]: 'loadData()',
        [ProductType.X_SPREADSHEET]: 'loadData()',
        [ProductType.LUCKYSHEET]: 'create() with data',
        [ProductType.JSPREADSHEET]: 'setData()'
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
