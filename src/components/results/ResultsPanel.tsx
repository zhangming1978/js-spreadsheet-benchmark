import { FC } from 'react'
import { Card, Tabs } from 'antd'
import { BarChartOutlined, LineChartOutlined, TableOutlined } from '@ant-design/icons'
import PerformanceChart from '../charts/PerformanceChart'
import ComparisonTable from './ComparisonTable'
import './ResultsPanel.css'

const ResultsPanel: FC = () => {
  const items = [
    {
      key: 'chart',
      label: (
        <span>
          <BarChartOutlined />
          性能对比图表
        </span>
      ),
      children: <PerformanceChart />
    },
    {
      key: 'trend',
      label: (
        <span>
          <LineChartOutlined />
          趋势分析
        </span>
      ),
      children: <div className="chart-placeholder">趋势分析图表</div>
    },
    {
      key: 'table',
      label: (
        <span>
          <TableOutlined />
          数据表格
        </span>
      ),
      children: <ComparisonTable />
    }
  ]

  return (
    <Card className="results-panel" title="测试结果">
      <Tabs defaultActiveKey="chart" items={items} />
    </Card>
  )
}

export default ResultsPanel
