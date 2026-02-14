import { FC } from 'react'
import { Card, Tabs } from 'antd'
import { BarChartOutlined, LineChartOutlined, TableOutlined } from '@ant-design/icons'
import PerformanceChart from '../charts/PerformanceChart'
import ComparisonTable from './ComparisonTable'
import './ResultsPanel.css'

const { TabPane } = Tabs

const ResultsPanel: FC = () => {
  return (
    <Card className="results-panel" title="测试结果">
      <Tabs defaultActiveKey="chart">
        <TabPane
          tab={
            <span>
              <BarChartOutlined />
              性能对比图表
            </span>
          }
          key="chart"
        >
          <PerformanceChart />
        </TabPane>
        <TabPane
          tab={
            <span>
              <LineChartOutlined />
              趋势分析
            </span>
          }
          key="trend"
        >
          <div className="chart-placeholder">趋势分析图表</div>
        </TabPane>
        <TabPane
          tab={
            <span>
              <TableOutlined />
              数据表格
            </span>
          }
          key="table"
        >
          <ComparisonTable />
        </TabPane>
      </Tabs>
    </Card>
  )
}

export default ResultsPanel
