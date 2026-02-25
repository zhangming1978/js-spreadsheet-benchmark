import { FC, MutableRefObject, useState, useMemo, useEffect } from 'react'
import { Card, Select, Button, Space, Row, Col, Checkbox, message, Tooltip, Modal, Alert } from 'antd'
import { PlayCircleOutlined, StopOutlined, QuestionCircleOutlined, ExclamationCircleOutlined, ReloadOutlined, InfoCircleOutlined } from '@ant-design/icons'
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
  const [modalCountdown, setModalCountdown] = useState(5)
  const [isStarting, setIsStarting] = useState(false)

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
      description: '测试方法：加载数据后进行10步滚动操作，每步间隔50ms。评价标准：滚动流畅度、FPS、滚动响应延迟。'
    },
    {
      value: TestScenario.EDITING,
      label: '编辑性能',
      description: '测试方法：加载数据后批量编辑100个单元格内容。评价标准：编辑响应时间、批量操作耗时、界面流畅度。'
    },
    {
      value: TestScenario.FORMULA,
      label: '公式计算性能',
      description: '测试方法：加载包含公式的数据并触发重新计算。评价标准：公式计算耗时、依赖链更新速度、计算准确性。'
    },
    {
      value: TestScenario.RENDERING,
      label: '渲染性能',
      description: '测试方法：加载大规模数据并测试初始渲染性能。评价标准：首屏渲染时间、渲染完成耗时、FPS。'
    },
    {
      value: TestScenario.MEMORY,
      label: '内存占用',
      description: '测试方法：加载数据后等待500ms监控内存使用情况。评价标准：初始内存占用、峰值内存、内存稳定性。'
    },
    {
      value: TestScenario.EXCEL_IMPORT,
      label: 'Excel导入性能',
      description: '测试方法：使用模拟数据测试数据加载性能（注：当前版本使用模拟数据，未实现真实Excel文件导入）。评价标准：数据加载速度、渲染性能。'
    }
  ]

  // 数据规模选项
  const allDataSizeOptions = [
    { value: 5000, label: '5千行 ' },
    { value: 10000, label: '1万行' },
    { value: 50000, label: '5万行' },
    { value: 100000, label: '10万行' },
    { value: 500000, label: '50万行' },
    { value: 1000000, label: '100万行' }
  ]

  // 每个测试场景推荐的数据规模
  const scenarioDataSizeMap: Record<TestScenario, { sizes: number[], default: number, reason: string }> = {
    [TestScenario.DATA_LOADING]: {
      sizes: [10000, 100000, 500000, 1000000],
      default: 10000,
      reason: '数据加载测试适合大规模数据集以充分测试加载性能'
    },
    [TestScenario.SCROLLING]: {
      sizes: [10000, 50000, 100000, 500000],
      default: 50000,
      reason: '滚动性能测试需要大规模数据集以充分测试滚动流畅度'
    },
    [TestScenario.EDITING]: {
      sizes: [5000, 10000, 50000],
      default: 10000,
      reason: '编辑性能测试适合小到中规模数据集，编辑操作较为密集'
    },
    [TestScenario.FORMULA]: {
      sizes: [5000, 10000, 50000],
      default: 10000,
      reason: '公式计算测试适合小到中规模数据集，计算密集型操作'
    },
    [TestScenario.RENDERING]: {
      sizes: [10000, 50000, 100000, 500000],
      default: 50000,
      reason: '渲染性能测试适合中到大规模数据集以测试渲染能力'
    },
    [TestScenario.MEMORY]: {
      sizes: [50000, 100000, 500000],
      default: 100000,
      reason: '内存占用测试需要大规模数据集以充分测试内存使用情况'
    },
    [TestScenario.EXCEL_IMPORT]: {
      sizes: [5000, 10000, 50000, 100000],
      default: 10000,
      reason: 'Excel导入测试适合中等规模数据集，模拟典型Excel文件大小'
    }
  }

  // 根据当前场景获取可用的数据规模选项
  const dataSizeOptions = useMemo(() => {
    const scenarioConfig = scenarioDataSizeMap[selectedScenario]
    return allDataSizeOptions.filter(option => scenarioConfig.sizes.includes(option.value))
  }, [selectedScenario])

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
    { value: ProductType.HANDSONTABLE, label: 'Handsontable' },
    { value: ProductType.LUCKYSHEET, label: 'Luckysheet' },
    { value: ProductType.X_SPREADSHEET, label: 'x-spreadsheet' },
    { value: ProductType.JSPREADSHEET, label: 'jSpreadsheet' }
  ]

  // 处理场景选择变化
  const handleScenarioChange = (value: TestScenario) => {
    setSelectedScenario(value)

    // 自动调整数据规模到推荐值
    const scenarioConfig = scenarioDataSizeMap[value]
    if (!scenarioConfig.sizes.includes(dataSize)) {
      setDataSize(scenarioConfig.default)
      message.info(`已自动调整数据规模为 ${scenarioConfig.default.toLocaleString()} 行（${scenarioConfig.reason}）`, 3)
    }
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

    // 自动冒烟测试功能已禁用
    // 用户可以通过"冒烟测试"按钮手动触发
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
    // 防止重复启动
    if (isStarting) {
      return
    }

    setIsStarting(true)
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
      console.error('[TestControlPanel] 测试失败:', error)
      message.error('测试失败：' + (error instanceof Error ? error.message : String(error)))
    } finally {
      testEngineRef.current = null
      setIsStarting(false)
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

  // 处理冒烟测试（手动触发）

  // 获取当前选中场景的描述
  const currentScenarioDescription = useMemo(() => {
    const scenario = scenarioOptions.find(opt => opt.value === selectedScenario)
    return scenario?.description || ''
  }, [selectedScenario])

  // 处理警告对话框倒计时
  useEffect(() => {
    if (showWarningModal) {
      // 重置倒计时
      setModalCountdown(5)

      // 启动倒计时
      const timer = window.setInterval(() => {
        setModalCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            // 倒计时结束，自动开始测试
            confirmStartTest()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      // 清理定时器
      return () => {
        clearInterval(timer)
      }
    }
  }, [showWarningModal])

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
            <label className="control-label">
              数据规模
              <Tooltip title={scenarioDataSizeMap[selectedScenario].reason}>
                <QuestionCircleOutlined style={{ marginLeft: 4, color: '#999', fontSize: 12 }} />
              </Tooltip>
            </label>
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
                  {option.value === scenarioDataSizeMap[selectedScenario].default && ' (推荐)'}
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
            <Space size={4} wrap>
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

      {/* 当前场景测试方法说明 */}
      {currentScenarioDescription && (
        <Alert
          description={currentScenarioDescription}
          type="info"
          showIcon
          style={{
            marginTop: 12,
            padding: '8px 12px',
            fontSize: 12,
            lineHeight: 1.4
          }}
          icon={<InfoCircleOutlined style={{ fontSize: 14 }} />}
        />
      )}

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
        onCancel={() => {
          setShowWarningModal(false)
          setIsStarting(false)
        }}
        okText={modalCountdown > 0 ? `我已了解，开始测试 (${modalCountdown})` : '我已了解，开始测试'}
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
