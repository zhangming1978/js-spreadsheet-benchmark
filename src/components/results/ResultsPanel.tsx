import { FC, useRef, useState } from 'react'
import { Card, Tabs, Button, Dropdown, message } from 'antd'
import { BarChartOutlined, LineChartOutlined, TableOutlined, DownloadOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useTestStore } from '@/stores/useTestStore'
import { exportToJSON, exportToPNG, exportToPDF, generateFilename } from '@/utils/export'
import PerformanceChart from '../charts/PerformanceChart'
import ComparisonTable from './ComparisonTable'
import './ResultsPanel.css'

const ResultsPanel: FC = () => {
  const { results } = useTestStore()
  const panelRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)

  // 导出菜单项
  const exportMenuItems: MenuProps['items'] = [
    {
      key: 'json',
      label: '导出为 JSON',
      onClick: () => handleExport('json')
    },
    {
      key: 'png',
      label: '导出为 PNG 图片',
      onClick: () => handleExport('png')
    },
    {
      key: 'pdf',
      label: '导出为 PDF 文档',
      onClick: () => handleExport('pdf')
    }
  ]

  // 处理导出
  const handleExport = async (type: 'json' | 'png' | 'pdf') => {
    if (results.length === 0) {
      message.warning('暂无测试数据可导出')
      return
    }

    setExporting(true)
    try {
      switch (type) {
        case 'json':
          exportToJSON(results, generateFilename('performance-results', 'json'))
          message.success('JSON 数据导出成功')
          break
        case 'png':
          if (panelRef.current) {
            await exportToPNG(panelRef.current, generateFilename('performance-chart', 'png'))
            message.success('PNG 图片导出成功')
          }
          break
        case 'pdf':
          if (panelRef.current) {
            await exportToPDF(panelRef.current, generateFilename('performance-report', 'pdf'))
            message.success('PDF 文档导出成功')
          }
          break
      }
    } catch (error) {
      console.error('导出失败:', error)
      message.error('导出失败，请重试')
    } finally {
      setExporting(false)
    }
  }

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
    <Card
      className="results-panel"
      title="测试结果"
      extra={
        <Dropdown menu={{ items: exportMenuItems }} placement="bottomRight" disabled={results.length === 0}>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            size="small"
            loading={exporting}
            disabled={results.length === 0}
          >
            导出数据
          </Button>
        </Dropdown>
      }
    >
      <div ref={panelRef}>
        <Tabs defaultActiveKey="chart" items={items} />
      </div>
    </Card>
  )
}

export default ResultsPanel
