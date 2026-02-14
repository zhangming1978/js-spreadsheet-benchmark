import { FC, useEffect, useState } from 'react'
import { Modal, Button, Space, Statistic, Row, Col, Tag, Progress, Card } from 'antd'
import { CheckCircleOutlined, ReloadOutlined, StopOutlined, CloseCircleOutlined, ThunderboltOutlined, DatabaseOutlined, DashboardOutlined } from '@ant-design/icons'
import { useTestStore } from '@/stores/useTestStore'
import { ProductType } from '@/types'

interface TestConfirmationModalProps {
  onContinue: () => void
  onRetest: () => void
  onStop: () => void
}

const TestConfirmationModal: FC<TestConfirmationModalProps> = ({ onContinue, onRetest, onStop }) => {
  const { waitingForConfirmation, currentTestResult, currentProduct, isRunning } = useTestStore()
  const [fps, setFps] = useState<number>(0)
  const [memory, setMemory] = useState<number>(0)
  const [memoryLimit, setMemoryLimit] = useState<number>(0)

  // 实时性能监控
  useEffect(() => {
    if (!isRunning) {
      setFps(0)
      setMemory(0)
      return
    }

    // FPS 监控
    let frameCount = 0
    let lastTime = performance.now()
    let animationFrameId: number

    const measureFPS = () => {
      frameCount++
      const currentTime = performance.now()
      const elapsed = currentTime - lastTime

      if (elapsed >= 1000) {
        const currentFps = Math.round((frameCount * 1000) / elapsed)
        setFps(currentFps)
        frameCount = 0
        lastTime = currentTime
      }

      animationFrameId = requestAnimationFrame(measureFPS)
    }

    animationFrameId = requestAnimationFrame(measureFPS)

    // 内存监控
    const memoryInterval = setInterval(() => {
      if ((performance as any).memory) {
        const memoryInfo = (performance as any).memory
        const usedMemory = memoryInfo.usedJSHeapSize / (1024 * 1024)
        const totalMemory = memoryInfo.jsHeapSizeLimit / (1024 * 1024)
        setMemory(Math.round(usedMemory))
        setMemoryLimit(Math.round(totalMemory))
      }
    }, 500)

    return () => {
      cancelAnimationFrame(animationFrameId)
      clearInterval(memoryInterval)
    }
  }, [isRunning])

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

  const memoryPercent = memoryLimit > 0 ? Math.round((memory / memoryLimit) * 100) : 0

  const getFpsStatus = (fps: number): 'success' | 'normal' | 'exception' => {
    if (fps >= 50) return 'success'
    if (fps >= 30) return 'normal'
    return 'exception'
  }

  const getMemoryStatus = (percent: number): 'success' | 'normal' | 'exception' => {
    if (percent < 60) return 'success'
    if (percent < 80) return 'normal'
    return 'exception'
  }

  // 如果不在运行且不在等待确认，不显示对话框
  if (!isRunning && !waitingForConfirmation) {
    return null
  }

  // 测试运行中 - 显示实时性能监控
  if (isRunning && !waitingForConfirmation) {
    return (
      <Modal
        open={true}
        title={
          <span>
            <DashboardOutlined style={{ marginRight: 8 }} />
            实时性能监控
            {currentProduct && (
              <span style={{ marginLeft: 16, fontWeight: 'normal', fontSize: 14 }}>
                正在测试: <Tag color={getProductColor(currentProduct)}>{getProductName(currentProduct)}</Tag>
              </span>
            )}
          </span>
        }
        footer={null}
        closable={false}
        maskClosable={false}
        width={700}
        style={{ top: 20 }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Card size="small">
              <Statistic
                title={
                  <span>
                    <ThunderboltOutlined style={{ marginRight: 4 }} />
                    帧率 (FPS)
                  </span>
                }
                value={fps}
                suffix="fps"
                valueStyle={{
                  color: fps >= 50 ? '#3f8600' : fps >= 30 ? '#faad14' : '#cf1322',
                  fontSize: '28px'
                }}
              />
              <Progress
                percent={Math.min(100, (fps / 60) * 100)}
                status={getFpsStatus(fps)}
                showInfo={false}
                strokeWidth={8}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                {fps >= 50 && '流畅'}
                {fps >= 30 && fps < 50 && '一般'}
                {fps < 30 && '卡顿'}
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12}>
            <Card size="small">
              <Statistic
                title={
                  <span>
                    <DatabaseOutlined style={{ marginRight: 4 }} />
                    内存使用
                  </span>
                }
                value={memory}
                suffix={`MB / ${memoryLimit} MB`}
                valueStyle={{
                  color: memoryPercent < 60 ? '#3f8600' : memoryPercent < 80 ? '#faad14' : '#cf1322',
                  fontSize: '28px'
                }}
              />
              <Progress
                percent={memoryPercent}
                status={getMemoryStatus(memoryPercent)}
                showInfo={false}
                strokeWidth={8}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                {memoryPercent < 60 && '正常'}
                {memoryPercent >= 60 && memoryPercent < 80 && '偏高'}
                {memoryPercent >= 80 && '过高'}
              </div>
            </Card>
          </Col>
        </Row>
      </Modal>
    )
  }

  // 等待用户确认 - 显示测试结果和确认按钮
  if (!currentTestResult || !currentProduct) {
    return null
  }

  return (
    <Modal
      open={waitingForConfirmation}
      title={
        <Space>
          {currentTestResult.success ? (
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
          ) : (
            <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
          )}
          <span style={{ fontSize: 18 }}>
            {getProductName(currentProduct)} 测试{currentTestResult.success ? '完成' : '失败'}
          </span>
        </Space>
      }
      width={700}
      closable={false}
      maskClosable={false}
      keyboard={false}
      style={{ top: 20 }}
      footer={
        <Space size="middle">
          <Button
            icon={<StopOutlined />}
            onClick={onStop}
          >
            停止测试
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={onRetest}
          >
            重新测试
          </Button>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={onContinue}
          >
            继续下一个
          </Button>
        </Space>
      }
    >
      <div style={{ padding: '16px 0' }}>
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <Tag color={getProductColor(currentProduct)} style={{ fontSize: 16, padding: '8px 16px' }}>
            {getProductName(currentProduct)}
          </Tag>
        </div>

        {currentTestResult.success ? (
          <>
            <div style={{ marginBottom: 16, fontSize: 14, color: '#666' }}>
              测试已成功完成，您可以在下方看到表格实例。请确认测试结果后选择下一步操作：
            </div>

            <Row gutter={16} style={{ marginTop: 24 }}>
              <Col span={8}>
                <Statistic
                  title="执行时间"
                  value={currentTestResult.metrics.executionTime.toFixed(2)}
                  suffix="ms"
                  valueStyle={{ fontSize: 20 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="FPS"
                  value={currentTestResult.metrics.fps.toFixed(1)}
                  valueStyle={{ fontSize: 20 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="内存占用"
                  value={currentTestResult.metrics.memoryUsage.toFixed(2)}
                  suffix="MB"
                  valueStyle={{ fontSize: 20 }}
                />
              </Col>
            </Row>
          </>
        ) : (
          <div style={{ marginBottom: 16, fontSize: 14, color: '#ff4d4f' }}>
            <div style={{ marginBottom: 8 }}>测试失败：</div>
            <div style={{ padding: 12, background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 4 }}>
              {currentTestResult.error || '未知错误'}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default TestConfirmationModal
