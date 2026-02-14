import { FC } from 'react'
import { Card, Select, InputNumber, Button, Space, Row, Col, Checkbox } from 'antd'
import { PlayCircleOutlined, StopOutlined } from '@ant-design/icons'
import { TestScenario, ProductType } from '@/types'
import './TestControlPanel.css'

const { Option } = Select

const TestControlPanel: FC = () => {
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

  // 产品选项
  const productOptions = [
    { value: ProductType.SPREADJS, label: 'SpreadJS' },
    { value: ProductType.UNIVER, label: 'Univer' },
    { value: ProductType.HANDSONTABLE, label: 'Handsontable' }
  ]

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
              defaultValue={TestScenario.DATA_LOADING}
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
            <InputNumber
              size="middle"
              style={{ width: '100%' }}
              min={100}
              max={1000000}
              step={100}
              defaultValue={10000}
              formatter={value => `${value} 行`}
            />
          </div>
        </Col>
        <Col xs={24} sm={12} md={4} lg={3} xl={2}>
          <div className="control-item">
            <label className="control-label">冷却时间</label>
            <InputNumber
              size="middle"
              style={{ width: '100%' }}
              min={1}
              max={60}
              defaultValue={5}
              addonAfter="秒"
            />
          </div>
        </Col>
        <Col xs={24} sm={12} md={6} lg={7} xl={8}>
          <div className="control-item">
            <label className="control-label">测试产品</label>
            <Checkbox.Group
              options={productOptions}
              defaultValue={[ProductType.SPREADJS, ProductType.UNIVER, ProductType.HANDSONTABLE]}
            />
          </div>
        </Col>
        <Col xs={24} sm={24} md={24} lg={6} xl={7}>
          <div className="control-item control-item-buttons">
            <Space size="small">
              <Button
                type="primary"
                size="middle"
                icon={<PlayCircleOutlined />}
              >
                开始测试
              </Button>
              <Button
                danger
                size="middle"
                icon={<StopOutlined />}
                disabled
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
