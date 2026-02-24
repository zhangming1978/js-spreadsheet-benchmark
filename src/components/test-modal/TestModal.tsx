import { FC } from 'react'
import { Modal, Space, Badge, Progress, Tag, Row, Col, Card } from 'antd'
import { useTestStore } from '@/stores/useTestStore'
import { ProductType } from '@/types'
import './TestModal.css'

const TestModal: FC = () => {
  const {
    isRunning,
    currentProduct,
    selectedProducts,
    progress
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

  const getProductName = (type: ProductType) => {
    switch (type) {
      case ProductType.SPREADJS:
        return 'SpreadJS'
      case ProductType.UNIVER:
        return 'Univer'
      case ProductType.HANDSONTABLE:
        return 'Handsontable'
      default:
        return type
    }
  }

  // 计算总体进度
  const overallProgress = progress.totalTests > 0
    ? Math.round((progress.completedTests / progress.totalTests) * 100)
    : 0

  return (
    <Modal
      open={isRunning}
      width="90vw"
      style={{ top: 20 }}
      title={
        <Space size="large">
          <Space>
            <Badge color={currentProduct ? getProductColor(currentProduct) : '#666'} />
            <span style={{ fontSize: 18, fontWeight: 600 }}>
              正在测试: {currentProduct ? getProductName(currentProduct) : '准备中...'}
            </span>
          </Space>
          <Progress
            percent={overallProgress}
            size="small"
            style={{ width: 200 }}
            status="active"
          />
          <span style={{ fontSize: 14, color: '#666' }}>
            {progress.completedTests} / {progress.totalTests} 测试项
          </span>
        </Space>
      }
      footer={null}
      closable={false}
      maskClosable={false}
      keyboard={false}
      destroyOnClose
    >
      <div className="test-modal-content">
        {/* 实时性能指标 - 放在最上面 */}
        <Card title="实时性能指标" bordered={false} style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>当前测试</div>
                <Tag color={currentProduct ? getProductColor(currentProduct) : 'default'} style={{ fontSize: 16, padding: '4px 12px' }}>
                  {currentProduct ? getProductName(currentProduct) : '准备中'}
                </Tag>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>测试产品</div>
                <Space>
                  {selectedProducts.map(product => (
                    <Tag
                      key={product}
                      color={product === currentProduct ? getProductColor(product) : 'default'}
                    >
                      {getProductName(product)}
                    </Tag>
                  ))}
                </Space>
              </div>
            </Col>
          </Row>
        </Card>

        {/* 产品实例容器 */}
        <Card
          className="product-instance-card"
          title="产品实例"
          bordered={false}
        >
          <div
            id="test-modal-product-container"
            className="product-instance-container"
            style={{
              width: '100%',
              height: '500px',
              border: '2px solid ' + (currentProduct ? getProductColor(currentProduct) : '#d9d9d9'),
              borderRadius: 4,
              overflow: 'hidden',
              backgroundColor: '#fafafa'
            }}
          >
            {!currentProduct && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                textAlign: 'center',
                color: '#999'
              }}>
                <div>
                  <div style={{ fontSize: 16, marginBottom: 8 }}>等待测试开始...</div>
                  <div style={{ fontSize: 12 }}>产品实例将在此处显示</div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </Modal>
  )
}

export default TestModal
