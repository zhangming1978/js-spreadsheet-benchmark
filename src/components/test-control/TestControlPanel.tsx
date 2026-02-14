import { FC, MutableRefObject, useState } from 'react'
import { Card, Select, Button, Space, Row, Col, Checkbox, message, Tooltip, Modal } from 'antd'
import { PlayCircleOutlined, StopOutlined, QuestionCircleOutlined, ExclamationCircleOutlined, ReloadOutlined } from '@ant-design/icons'
import { TestScenario, ProductType } from '@/types'
import { useTestStore } from '@/stores/useTestStore'
import { TestEngine } from '@/core/engine'
import './TestControlPanel.css'

const { Option } = Select

interface TestControlPanelProps {
  testEngineRef: MutableRefObject<TestEngine | null>
}

const TestControlPanel: FC<TestControlPanelProps> = ({ testEngineRef }) => {
  // 从 store 获取状态和方法
  const {
    selectedScenario,
    dataSize,
    cooldownTime,
    selectedProducts,
    isRunning,
    setSelectedScenario,
    setDataSize,
    setCooldownTime,
    setSelectedProducts,
    reset,
    clearResults
  } = useTestStore()

  // 测试前警告对话框状态
  const [showWarningModal, setShowWarningModal] = useState(false)

  // 测试场景选项
  const scenarioOptions = [
    {
      value: TestScenario.DATA_LOADING,
      label: '数据加载性能',
      description: '测试方法：加载指定规模的数据到表格中。评价标准：加载耗时、首次渲染时间、FPS稳定性。'
    },
    {
      value: TestScenario.SCROLLING,
      label: '滚动性能',
      description: '测试方法：在大数据集中进行快速滚动操作。评价标准：滚动流畅度、FPS、滚动响应延迟。'
    },
    {
      value: TestScenario.EDITING,
      label: '编辑性能',
      description: '测试方法：批量编辑单元格内容、自动填充等操作。评价标准：编辑响应时间、批量操作耗时、界面流畅度。'
    },
    {
      value: TestScenario.FORMULA,
      label: '公式计算性能',
      description: '测试方法：设置复杂公式并触发重新计算。评价标准：公式计算耗时、依赖链更新速度、计算准确性。'
    },
    {
      value: TestScenario.RENDERING,
      label: '渲染性能',
      description: '测试方法：测试大规模数据的初始渲染和重绘性能。评价标准：首屏渲染时间、重绘耗时、FPS。'
    },
    {
      value: TestScenario.MEMORY,
      label: '内存占用',
      description: '测试方法：加载数据后监控内存使用情况。评价标准：初始内存占用、峰值内存、内存释放效率。'
    },
    {
      value: TestScenario.EXCEL_IMPORT,
      label: 'Excel导入性能',
      description: '测试方法：导入标准Excel文件并解析。评价标准：文件解析耗时、数据加载速度、格式还原准确性。'
    }
  ]

  // 数据规模选项
  const dataSizeOptions = [
    { value: 5000, label: '5千行 ' },
    { value: 10000, label: '1万行' },
    { value: 50000, label: '5万行' },
    { value: 100000, label: '10万行' },
    { value: 500000, label: '50万行' }
  ]

  // 冷却时间选项
  const cooldownTimeOptions = [
    { value: 3, label: '3 秒' },
    { value: 5, label: '5 秒' },
    { value: 10, label: '10 秒' },
    { value: 30, label: '30 秒' }
  ]

  // 产品选项
  const productOptions = [
    { value: ProductType.SPREADJS, label: 'SpreadJS' },
    { value: ProductType.HANDSONTABLE, label: 'Handsontable' }
  ]

  // 处理场景选择变化
  const handleScenarioChange = (value: TestScenario) => {
    setSelectedScenario(value)
  }

  // 处理数据规模变化
  const handleDataSizeChange = (value: number) => {
    setDataSize(value)
  }

  // 处理冷却时间变化
  const handleCooldownTimeChange = (value: number) => {
    setCooldownTime(value)
  }

  // 处理产品选择变化
  const handleProductsChange = (checkedValues: ProductType[]) => {
    if (checkedValues.length < 1) {
      message.warning('至少需要选择 1 个产品进行测试')
      return
    }
    setSelectedProducts(checkedValues)
  }

  // 处理开始测试按钮点击
  const handleStartTest = () => {
    if (selectedProducts.length < 1) {
      message.error('请至少选择 1 个产品进行测试')
      return
    }
    // 显示警告对话框
    setShowWarningModal(true)
  }

  // 确认开始测试
  const confirmStartTest = async () => {
    setShowWarningModal(false)

    try {
      // 创建测试引擎
      const engine = new TestEngine({
        scenario: selectedScenario,
        dataSize,
        products: selectedProducts,
        cooldownTime
      })

      testEngineRef.current = engine

      // 开始测试（消息由 TestEngine 内部管理）
      await engine.start()
    } catch (error) {
      console.error('[TestControlPanel] Test failed:', error)
      message.error('测试失败：' + (error instanceof Error ? error.message : String(error)))
    } finally {
      testEngineRef.current = null
    }
  }

  // 处理停止测试
  const handleStopTest = () => {
    if (testEngineRef.current) {
      testEngineRef.current.stop()
      message.info('正在停止测试...')
    }
  }

  // 处理重置
  const handleReset = () => {
    reset()
    clearResults()
    message.success('已重置到初始状态')
  }

  return (
    <Card className="test-control-panel" title="测试控制面板" size="small">
      <Row gutter={[12, 12]} align="middle">
        <Col xs={24} sm={12} md={6} lg={5} xl={4}>
          <div className="control-item">
            <label className="control-label">测试场景</label>
            <Select
              size="middle"
              style={{ width: '100%' }}
              placeholder="选择测试场景"
              value={selectedScenario}
              onChange={handleScenarioChange}
              disabled={isRunning}
              optionLabelProp="label"
              popupMatchSelectWidth={false}
              styles={{ popup: { root: { minWidth: 450 } } }}
            >
              {scenarioOptions.map(option => (
                <Option key={option.value} value={option.value} label={option.label}>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 2 }}>{option.label}</div>
                    <div style={{ fontSize: 11, color: '#666', lineHeight: 1.3, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                      {option.description}
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </div>
        </Col>
        <Col xs={24} sm={12} md={4} lg={3} xl={3}>
          <div className="control-item">
            <label className="control-label">数据规模</label>
            <Select
              size="middle"
              style={{ width: '100%' }}
              value={dataSize}
              onChange={handleDataSizeChange}
              disabled={isRunning}
            >
              {dataSizeOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>
        </Col>
        <Col xs={24} sm={12} md={4} lg={3} xl={2}>
          <div className="control-item">
            <label className="control-label">
              冷却时间
              <Tooltip title="每个产品测试完成后的等待时间，用于释放内存和避免相互影响，确保测试结果准确">
                <QuestionCircleOutlined style={{ marginLeft: 4, color: '#999', fontSize: 12 }} />
              </Tooltip>
            </label>
            <Select
              size="middle"
              style={{ width: '100%' }}
              value={cooldownTime}
              onChange={handleCooldownTimeChange}
              disabled={isRunning}
            >
              {cooldownTimeOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={8}>
          <div className="control-item">
            <label className="control-label">测试产品</label>
            <Checkbox.Group
              options={productOptions}
              value={selectedProducts}
              onChange={handleProductsChange as any}
              disabled={isRunning}
            />
          </div>
        </Col>
        <Col xs={24} sm={24} md={24} lg={7} xl={7}>
          <div className="control-item control-item-buttons">
            <Space size={4}>
              <Button
                type="primary"
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={handleStartTest}
                disabled={isRunning}
              >
                开始测试
              </Button>
              <Button
                danger
                size="small"
                icon={<StopOutlined />}
                onClick={handleStopTest}
                disabled={!isRunning}
              >
                停止
              </Button>
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={handleReset}
                disabled={isRunning}
              >
                重置
              </Button>
            </Space>
          </div>
        </Col>
      </Row>

      {/* 测试前警告对话框 */}
      <Modal
        title={
          <span>
            <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
            测试前重要提示
          </span>
        }
        open={showWarningModal}
        onOk={confirmStartTest}
        onCancel={() => setShowWarningModal(false)}
        okText="我已了解，开始测试"
        cancelText="取消"
        width={500}
        centered
      >
        <div style={{ padding: '16px 0' }}>
          <p style={{ fontSize: 14, marginBottom: 16, color: '#333' }}>
            为确保测试结果的准确性，请在测试期间遵守以下规则：
          </p>
          <ul style={{ paddingLeft: 20, margin: 0, lineHeight: 2 }}>
            <li style={{ color: '#666' }}>
              <strong style={{ color: '#333' }}>请勿操作鼠标和键盘</strong>，避免干扰性能测试
            </li>
            <li style={{ color: '#666' }}>
              <strong style={{ color: '#333' }}>请勿打开其他应用程序</strong>，避免占用系统资源
            </li>
            <li style={{ color: '#666' }}>
              <strong style={{ color: '#333' }}>建议关闭不必要的后台程序</strong>，确保测试环境纯净
            </li>
            <li style={{ color: '#666' }}>
              <strong style={{ color: '#333' }}>请保持浏览器窗口在前台</strong>，避免影响渲染性能
            </li>
          </ul>
          <p style={{ fontSize: 13, marginTop: 16, marginBottom: 0, color: '#999' }}>
            测试过程中会显示实时性能监控窗口，请耐心等待测试完成。
          </p>
        </div>
      </Modal>
    </Card>
  )
}

export default TestControlPanel
