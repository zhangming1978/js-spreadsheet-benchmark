import { FC } from 'react'
import { Card, Select, Button, Space, Row, Col, Checkbox, message, Tooltip } from 'antd'
import { PlayCircleOutlined, StopOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { TestScenario, ProductType } from '@/types'
import { useTestStore } from '@/stores/useTestStore'
import './TestControlPanel.css'

const { Option } = Select

const TestControlPanel: FC = () => {
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
    setSelectedProducts
  } = useTestStore()

  // 测试场景选项
  const scenarioOptions = [
    { value: TestScenario.DATA_LOADING, label: '数据加载性能' },
    { value: TestScenario.SCROLLING, label: '滚动性能' },
    { value: TestScenario.EDITING, label: '编辑性能' },
    { value: TestScenario.FORMULA, label: '公式计算性能' },
    { value: TestScenario.RENDERING, label: '渲染性能' },
    { value: TestScenario.MEMORY, label: '内存占用' },
    { value: TestScenario.EXCEL_IMPORT, label: 'Excel导入性能' }
  ]

  // 数据规模选项
  const dataSizeOptions = [
    { value: 1000, label: '1,000 行 (小规模)' },
    { value: 10000, label: '10,000 行 (中规模)' },
    { value: 50000, label: '50,000 行 (大规模)' },
    { value: 100000, label: '100,000 行 (超大规模)' }
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
    { value: ProductType.UNIVER, label: 'Univer' },
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
    if (checkedValues.length < 2) {
      message.warning('至少需要选择 2 个产品进行对比')
      return
    }
    setSelectedProducts(checkedValues)
  }

  // 处理开始测试
  const handleStartTest = () => {
    if (selectedProducts.length < 2) {
      message.error('请至少选择 2 个产品进行对比')
      return
    }
    // TODO: 启动测试流程
    message.info('测试功能正在开发中...')
  }

  // 处理停止测试
  const handleStopTest = () => {
    // TODO: 停止测试流程
    message.info('停止测试')
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
            >
              {scenarioOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
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
        <Col xs={24} sm={12} md={4} lg={3} xl={3}>
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
        <Col xs={24} sm={12} md={6} lg={7} xl={8}>
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
        <Col xs={24} sm={24} md={24} lg={6} xl={6}>
          <div className="control-item control-item-buttons">
            <Space size="small">
              <Button
                type="primary"
                size="middle"
                icon={<PlayCircleOutlined />}
                onClick={handleStartTest}
                disabled={isRunning}
              >
                开始测试
              </Button>
              <Button
                danger
                size="middle"
                icon={<StopOutlined />}
                onClick={handleStopTest}
                disabled={!isRunning}
              >
                停止
              </Button>
            </Space>
          </div>
        </Col>
      </Row>
    </Card>
  )
}

export default TestControlPanel
