import { FC, useState, useMemo } from 'react'
import { Card, Table, Tag, Space, Statistic, Row, Col, Select } from 'antd'
import { TrophyOutlined, ThunderboltOutlined, DatabaseOutlined, ClockCircleOutlined } from '@ant-design/icons'
import type { TestResult, TestScenario } from '@/types'
import './ResultsComparison.css'

interface ResultsComparisonProps {
  results: TestResult[]
}

const ResultsComparison: FC<ResultsComparisonProps> = ({ results }) => {
  const [selectedScenario, setSelectedScenario] = useState<TestScenario | 'all'>('all')

  if (results.length === 0) {
    return null
  }

  // 获取所有唯一的场景
  const scenarios = useMemo(() => {
    const uniqueScenarios = Array.from(new Set(results.map(r => r.scenario)))
    return uniqueScenarios
  }, [results])

  // 根据选择的场景筛选结果
  const filteredResults = useMemo(() => {
    if (selectedScenario === 'all') {
      return results
    }
    return results.filter(r => r.scenario === selectedScenario)
  }, [results, selectedScenario])

  // 获取场景名称
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

  // 计算最佳性能（基于筛选后的结果）
  const bestExecutionTime = Math.min(...filteredResults.map(r => r.metrics.executionTime))
  const bestFPS = Math.max(...filteredResults.map(r => r.metrics.fps || 0))
  const bestMemory = Math.min(...filteredResults.map(r => r.metrics.memoryUsage))

  // 获取产品名称
  const getProductName = (productType: string) => {
    const names: Record<string, string> = {
      'spreadjs': 'SpreadJS',
      'handsontable': 'Handsontable',
      'univer': 'Univer'
    }
    return names[productType] || productType
  }

  // 获取产品颜色
  const getProductColor = (productType: string) => {
    const colors: Record<string, string> = {
      'spreadjs': '#1890ff',
      'handsontable': '#fa8c16',
      'univer': '#52c41a'
    }
    return colors[productType] || '#666'
  }

  // 计算性能差异百分比
  const getPercentageDiff = (value: number, best: number, isLowerBetter: boolean = true) => {
    if (value === best) return 0
    if (isLowerBetter) {
      return ((value - best) / best * 100)
    } else {
      return ((best - value) / value * 100)
    }
  }

  // 表格列定义
  const columns = [
    {
      title: '产品',
      dataIndex: 'productName',
      key: 'productName',
      render: (productName: string) => (
        <Space>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: getProductColor(productName)
          }} />
          <strong>{getProductName(productName)}</strong>
        </Space>
      )
    },
    {
      title: '测试场景',
      dataIndex: 'scenario',
      key: 'scenario',
      render: (scenario: string) => (
        <Tag color="blue">{getScenarioName(scenario)}</Tag>
      )
    },
    {
      title: '数据集大小',
      dataIndex: 'dataSize',
      key: 'dataSize',
      render: (dataSize: number) => (
        <Tag color="green">{dataSize.toLocaleString()} 行</Tag>
      )
    },
    {
      title: '执行时间 (平均)',
      dataIndex: 'executionTime',
      key: 'executionTime',
      render: (_: any, record: TestResult) => {
        const time = record.metrics.executionTime
        const isBest = time === bestExecutionTime
        const diff = getPercentageDiff(time, bestExecutionTime, true)

        return (
          <Space direction="vertical" size={0}>
            <Space>
              <span style={{ fontWeight: isBest ? 'bold' : 'normal' }}>
                {time.toFixed(0)}ms
              </span>
              {isBest && <TrophyOutlined style={{ color: '#faad14' }} />}
            </Space>
            {!isBest && diff > 0 && (
              <span style={{ fontSize: 12, color: '#999' }}>
                +{diff.toFixed(1)}%
              </span>
            )}
          </Space>
        )
      },
      sorter: (a: TestResult, b: TestResult) => a.metrics.executionTime - b.metrics.executionTime
    },
    {
      title: 'FPS (平均)',
      dataIndex: 'fps',
      key: 'fps',
      render: (_: any, record: TestResult) => {
        const fps = record.metrics.fps || 0
        const isBest = fps === bestFPS
        const diff = getPercentageDiff(fps, bestFPS, false)

        return (
          <Space direction="vertical" size={0}>
            <Space>
              <span style={{ fontWeight: isBest ? 'bold' : 'normal' }}>
                {fps.toFixed(0)}
              </span>
              {isBest && <TrophyOutlined style={{ color: '#faad14' }} />}
            </Space>
            {!isBest && diff > 0 && (
              <span style={{ fontSize: 12, color: '#999' }}>
                -{diff.toFixed(1)}%
              </span>
            )}
          </Space>
        )
      },
      sorter: (a: TestResult, b: TestResult) => (b.metrics.fps || 0) - (a.metrics.fps || 0)
    },
    {
      title: '内存占用 (平均)',
      dataIndex: 'memory',
      key: 'memory',
      render: (_: any, record: TestResult) => {
        const memory = record.metrics.memoryUsage
        const isBest = memory === bestMemory
        const diff = getPercentageDiff(memory, bestMemory, true)

        return (
          <Space direction="vertical" size={0}>
            <Space>
              <span style={{ fontWeight: isBest ? 'bold' : 'normal' }}>
                {memory.toFixed(0)}MB
              </span>
              {isBest && <TrophyOutlined style={{ color: '#faad14' }} />}
            </Space>
            {!isBest && diff > 0 && (
              <span style={{ fontSize: 12, color: '#999' }}>
                +{diff.toFixed(1)}%
              </span>
            )}
          </Space>
        )
      },
      sorter: (a: TestResult, b: TestResult) => a.metrics.memoryUsage - b.metrics.memoryUsage
    },
    {
      title: '测试轮数',
      dataIndex: 'runs',
      key: 'runs',
      render: (_: any, record: TestResult) => (
        <Tag color="blue">{record.runs?.length || 0} 轮</Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'success',
      key: 'success',
      render: (success: boolean) => (
        <Tag color={success ? 'success' : 'error'}>
          {success ? '成功' : '失败'}
        </Tag>
      )
    }
  ]

  return (
    <div className="results-comparison">
      <Card
        title="性能对比结果"
        variant="borderless"
        extra={
          scenarios.length > 1 && (
            <Space>
              <span>测试场景:</span>
              <Select
                value={selectedScenario}
                onChange={setSelectedScenario}
                style={{ width: 150 }}
                options={[
                  { label: '全部场景', value: 'all' },
                  ...scenarios.map(s => ({
                    label: getScenarioName(s),
                    value: s
                  }))
                ]}
              />
            </Space>
          )
        }
      >
        {/* 概览统计 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="最快执行时间 (平均)"
                value={bestExecutionTime.toFixed(0)}
                suffix="ms"
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                {getProductName(filteredResults.find(r => r.metrics.executionTime === bestExecutionTime)?.productName || '')}
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="最高 FPS (平均)"
                value={bestFPS.toFixed(0)}
                prefix={<ThunderboltOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                {getProductName(filteredResults.find(r => r.metrics.fps === bestFPS)?.productName || '')}
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="最低内存 (平均)"
                value={bestMemory.toFixed(0)}
                suffix="MB"
                prefix={<DatabaseOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                {getProductName(filteredResults.find(r => r.metrics.memoryUsage === bestMemory)?.productName || '')}
              </div>
            </Card>
          </Col>
        </Row>

        {/* 详细对比表格 */}
        <Table
          columns={columns}
          dataSource={filteredResults}
          rowKey={(record) => `${record.productName}-${record.scenario}`}
          pagination={false}
        />

        {/* 详细运行数据 */}
        <div style={{ marginTop: 24 }}>
          <h3>详细运行数据</h3>
          {filteredResults.map(result => (
            <Card
              key={`${result.productName}-${result.scenario}`}
              size="small"
              title={
                <Space>
                  <span>{getProductName(result.productName)}</span>
                  <Tag color="blue">{getScenarioName(result.scenario)}</Tag>
                  <Tag color="green">{result.dataSize.toLocaleString()} 行</Tag>
                </Space>
              }
              style={{ marginBottom: 16 }}
            >
              {result.runs && result.runs.length > 0 ? (
                <Table
                  size="small"
                  columns={[
                    { title: '轮次', dataIndex: 'runNumber', key: 'runNumber' },
                    {
                      title: '执行时间',
                      dataIndex: 'executionTime',
                      key: 'executionTime',
                      render: (time: number) => `${time.toFixed(0)}ms`
                    },
                    {
                      title: 'FPS',
                      dataIndex: 'fps',
                      key: 'fps',
                      render: (fps: number) => fps.toFixed(0)
                    },
                    {
                      title: '内存',
                      dataIndex: 'memoryUsage',
                      key: 'memoryUsage',
                      render: (memory: number) => `${memory.toFixed(0)}MB`
                    }
                  ]}
                  dataSource={result.runs}
                  rowKey="runNumber"
                  pagination={false}
                />
              ) : (
                <div style={{ color: '#999' }}>无详细数据</div>
              )}
            </Card>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default ResultsComparison
