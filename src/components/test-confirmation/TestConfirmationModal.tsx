import { FC } from 'react'
import { Modal, Button, Space, Statistic, Row, Col, Tag, Progress, Table } from 'antd'
import {
  CheckCircleOutlined, ReloadOutlined, StopOutlined, CloseCircleOutlined,
  ThunderboltOutlined, DatabaseOutlined, LoadingOutlined
} from '@ant-design/icons'
import { useTestStore } from '@/stores/useTestStore'
import { ProductType } from '@/types'

interface TestConfirmationModalProps {
  onContinue: () => void
  onRetest: () => void
  onStop: () => void
}

const PRODUCT_COLORS: Record<string, string> = {
  [ProductType.SPREADJS]: '#1890ff',
  [ProductType.UNIVER]: '#52c41a',
  [ProductType.HANDSONTABLE]: '#fa8c16',
  [ProductType.LUCKYSHEET]: '#eb2f96',
  [ProductType.X_SPREADSHEET]: '#722ed1',
  [ProductType.JSPREADSHEET]: '#13c2c2',
}

const PRODUCT_NAMES: Record<string, string> = {
  [ProductType.SPREADJS]: 'SpreadJS',
  [ProductType.UNIVER]: 'Univer',
  [ProductType.HANDSONTABLE]: 'Handsontable',
  [ProductType.LUCKYSHEET]: 'Luckysheet',
  [ProductType.X_SPREADSHEET]: 'x-spreadsheet',
  [ProductType.JSPREADSHEET]: 'jSpreadsheet',
}

const TestConfirmationModal: FC<TestConfirmationModalProps> = ({ onContinue, onRetest, onStop }) => {
  const {
    waitingForConfirmation, currentTestResult, currentProduct, isRunning,
    isLastTest, autoContinueEnabled, autoContinueCountdown,
    currentFPS, currentMemory, testStage, currentRun, totalRuns
  } = useTestStore()

  if (!isRunning && !waitingForConfirmation) return null

  const productName = currentProduct ? (PRODUCT_NAMES[currentProduct] ?? currentProduct) : ''
  const productColor = currentProduct ? (PRODUCT_COLORS[currentProduct] ?? '#666') : '#666'
  const isConfirming = waitingForConfirmation && !!currentTestResult && !!currentProduct

  const fpsColor = currentFPS >= 50 ? '#3f8600' : currentFPS >= 30 ? '#faad14' : '#cf1322'
  const fpsStatus: 'success' | 'normal' | 'exception' = currentFPS >= 50 ? 'success' : currentFPS >= 30 ? 'normal' : 'exception'

  const memoryPercent = currentMemory > 0 ? Math.min(100, Math.round((currentMemory / 2048) * 100)) : 0
  const memoryColor = memoryPercent < 60 ? '#3f8600' : memoryPercent < 80 ? '#faad14' : '#cf1322'
  const memoryStatus: 'success' | 'normal' | 'exception' = memoryPercent < 60 ? 'success' : memoryPercent < 80 ? 'normal' : 'exception'

  // 三轮结果表格列
  const runColumns = [
    { title: '轮次', dataIndex: 'runNumber', key: 'run', width: 60, render: (v: number) => `第 ${v} 轮` },
    { title: '执行时间', dataIndex: 'executionTime', key: 'time', render: (v: number) => `${v.toFixed(0)} ms` },
    { title: 'FPS', dataIndex: 'fps', key: 'fps', render: (v: number) => v.toFixed(1) },
    { title: '内存', dataIndex: 'memoryUsage', key: 'mem', render: (v: number) => `${v.toFixed(0)} MB` },
  ]

  return (
    <Modal
      open={true}
      title={
        <Space>
          {isConfirming
            ? (currentTestResult!.success
              ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
              : <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />)
            : <LoadingOutlined style={{ color: '#1890ff', fontSize: 18 }} />
          }
          <span style={{ fontSize: 16 }}>
            {isConfirming
              ? `${productName} 测试${currentTestResult!.success ? '完成' : '失败'}`
              : '测试监控'}
          </span>
          {currentProduct && (
            <Tag color={productColor} style={{ marginLeft: 4 }}>{productName}</Tag>
          )}
        </Space>
      }
      width={680}
      closable={false}
      maskClosable={false}
      keyboard={false}
      style={{ top: 20 }}
      footer={
        isConfirming ? (
          <Space size="middle">
            <Button icon={<StopOutlined />} onClick={onStop}>停止测试</Button>
            <Button icon={<ReloadOutlined />} onClick={onRetest}>重新测试</Button>
            <Button type="primary" icon={<CheckCircleOutlined />} onClick={onContinue}>
              {isLastTest ? '查看结果' : '继续下一个'}
              {autoContinueEnabled && autoContinueCountdown > 0 && ` (${autoContinueCountdown})`}
            </Button>
          </Space>
        ) : (
          <Button danger icon={<StopOutlined />} onClick={onStop}>停止测试</Button>
        )
      }
    >
      {/* 测试中：实时指标 */}
      {!isConfirming && (
        <div style={{ padding: '8px 0' }}>
          <Row gutter={[12, 12]}>
            <Col span={12}>
              <div style={{ padding: '12px 16px', background: '#fafafa', borderRadius: 6, border: '1px solid #f0f0f0' }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>
                  <ThunderboltOutlined style={{ marginRight: 4 }} />帧率 (FPS)
                </div>
                <div style={{ fontSize: 28, fontWeight: 600, color: fpsColor, lineHeight: 1 }}>
                  {currentFPS}
                </div>
                <Progress percent={Math.min(100, (currentFPS / 60) * 100)} status={fpsStatus} showInfo={false} strokeWidth={6} style={{ marginTop: 8 }} />
                <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                  {currentFPS >= 50 ? '流畅' : currentFPS >= 30 ? '一般' : currentFPS > 0 ? '卡顿' : '等待中...'}
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ padding: '12px 16px', background: '#fafafa', borderRadius: 6, border: '1px solid #f0f0f0' }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>
                  <DatabaseOutlined style={{ marginRight: 4 }} />内存占用
                </div>
                <div style={{ fontSize: 28, fontWeight: 600, color: memoryColor, lineHeight: 1 }}>
                  {currentMemory > 0 ? `${currentMemory.toFixed(0)}` : '—'}
                </div>
                <Progress percent={memoryPercent} status={memoryStatus} showInfo={false} strokeWidth={6} style={{ marginTop: 8 }} />
                <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                  {currentMemory > 0 ? `${currentMemory.toFixed(0)} MB` : '等待中...'}
                </div>
              </div>
            </Col>
          </Row>

          {testStage && (
            <div style={{ marginTop: 12, padding: '8px 12px', background: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: 4, fontSize: 13, color: '#1890ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span><LoadingOutlined style={{ marginRight: 6 }} />{testStage}</span>
              {currentRun > 0 && <span style={{ fontSize: 12, color: '#69b1ff' }}>第 {currentRun} / {totalRuns} 轮</span>}
            </div>
          )}
        </div>
      )}

      {/* 测试完成：结果汇总 */}
      {isConfirming && currentTestResult && (
        <div style={{ padding: '8px 0' }}>
          {currentTestResult.success ? (
            <>
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={8}>
                  <Statistic title="平均执行时间" value={currentTestResult.metrics.executionTime.toFixed(0)} suffix="ms" valueStyle={{ fontSize: 22 }} />
                </Col>
                <Col span={8}>
                  <Statistic title="平均 FPS" value={currentTestResult.metrics.fps?.toFixed(1) ?? '0'} valueStyle={{ fontSize: 22 }} />
                </Col>
                <Col span={8}>
                  <Statistic title="平均内存" value={currentTestResult.metrics.memoryUsage.toFixed(0)} suffix="MB" valueStyle={{ fontSize: 22 }} />
                </Col>
              </Row>
              {currentTestResult.runs && currentTestResult.runs.length > 0 && (
                <Table
                  dataSource={currentTestResult.runs}
                  columns={runColumns}
                  rowKey="runNumber"
                  size="small"
                  pagination={false}
                  style={{ marginTop: 8 }}
                />
              )}
            </>
          ) : (
            <div style={{ fontSize: 14, color: '#ff4d4f' }}>
              <div style={{ marginBottom: 8 }}>测试失败：</div>
              <div style={{ padding: 12, background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 4 }}>
                {currentTestResult.error || '未知错误'}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

export default TestConfirmationModal
