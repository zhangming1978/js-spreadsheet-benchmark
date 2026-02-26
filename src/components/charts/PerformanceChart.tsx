import { FC, useEffect, useRef, useState, useMemo } from 'react'
import { Card, Select, Empty } from 'antd'
import { BarChartOutlined } from '@ant-design/icons'
import * as echarts from 'echarts'
import { useTestStore } from '@/stores/useTestStore'
import type { TestResult, TestScenario } from '@/types'
import './PerformanceChart.css'

const { Option } = Select

const PerformanceChart: FC = () => {
  const { results } = useTestStore()
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstanceRef = useRef<echarts.ECharts | null>(null)
  const [selectedScenario, setSelectedScenario] = useState<TestScenario | 'all'>('all')

  const scenarios = useMemo(() => {
    return Array.from(new Set(results.map(r => r.scenario)))
  }, [results])

  const filteredResults = useMemo(() => {
    const successResults = results.filter(r => r.success)
    if (selectedScenario === 'all') return successResults
    return successResults.filter(r => r.scenario === selectedScenario)
  }, [results, selectedScenario])

  const getScenarioName = (scenario: string) => {
    const map: Record<string, string> = {
      'data-loading': '数据加载', 'scrolling': '滚动性能',
      'editing': '编辑性能', 'formula': '公式计算',
      'rendering': '渲染性能', 'memory': '内存占用'
    }
    return map[scenario] || scenario
  }

  useEffect(() => {
    if (!chartRef.current) return
    chartInstanceRef.current = echarts.init(chartRef.current)
    const handleResize = () => chartInstanceRef.current?.resize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      chartInstanceRef.current?.dispose()
      chartInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!chartInstanceRef.current || filteredResults.length === 0) return
    chartInstanceRef.current.resize()
    chartInstanceRef.current.setOption(generateBarOption(filteredResults), true)
  }, [filteredResults])

  const generateBarOption = (data: TestResult[]): echarts.EChartsOption => {
    const productMap = new Map<string, { executionTime: number[], fps: number[], memory: number[] }>()
    data.forEach(r => {
      if (!productMap.has(r.productName)) {
        productMap.set(r.productName, { executionTime: [], fps: [], memory: [] })
      }
      const p = productMap.get(r.productName)!
      p.executionTime.push(r.metrics.executionTime)
      p.fps.push(r.metrics.fps || 0)
      p.memory.push(r.metrics.memoryUsage)
    })

    const agg = Array.from(productMap.entries()).map(([name, m]) => ({
      name,
      executionTime: Math.round(m.executionTime.reduce((a, b) => a + b, 0) / m.executionTime.length),
      fps: Math.round(m.fps.reduce((a, b) => a + b, 0) / m.fps.length),
      memory: Math.round(m.memory.reduce((a, b) => a + b, 0) / m.memory.length)
    }))

    const execData = agg.map(r => ({ name: r.name, value: r.executionTime })).sort((a, b) => a.value - b.value)
    const fpsData = agg.map(r => ({ name: r.name, value: r.fps })).sort((a, b) => a.value - b.value)
    const memData = agg.map(r => ({ name: r.name, value: r.memory })).sort((a, b) => a.value - b.value)

    return {
      title: [
        { text: '执行时间 (ms)', left: 'center', top: '2%', textStyle: { fontSize: 13, fontWeight: 600 } },
        { text: 'FPS', left: 'center', top: '35%', textStyle: { fontSize: 13, fontWeight: 600 } },
        { text: '内存占用 (MB)', left: 'center', top: '68%', textStyle: { fontSize: 13, fontWeight: 600 } }
      ],
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const p = Array.isArray(params) ? params[0] : params
          const unit = p.seriesName === '执行时间' ? 'ms' : p.seriesName === 'FPS' ? 'fps' : 'MB'
          return `<div style="font-weight:600">${p.name}</div><div>${p.marker} ${p.seriesName}: <strong>${p.value} ${unit}</strong></div>`
        }
      },
      grid: [
        { left: '20%', right: '10%', top: '8%', height: '22%', containLabel: false },
        { left: '20%', right: '10%', top: '40%', height: '22%', containLabel: false },
        { left: '20%', right: '10%', top: '73%', height: '22%', containLabel: false }
      ],
      xAxis: [
        { type: 'value', gridIndex: 0, axisLabel: { fontSize: 11, formatter: '{value} ms' }, splitLine: { show: true, lineStyle: { type: 'dashed', opacity: 0.3 } } },
        { type: 'value', gridIndex: 1, axisLabel: { fontSize: 11, formatter: '{value} fps' }, splitLine: { show: true, lineStyle: { type: 'dashed', opacity: 0.3 } } },
        { type: 'value', gridIndex: 2, axisLabel: { fontSize: 11, formatter: '{value} MB' }, splitLine: { show: true, lineStyle: { type: 'dashed', opacity: 0.3 } } }
      ],
      yAxis: [
        { type: 'category', gridIndex: 0, data: execData.map(d => d.name), axisLabel: { fontSize: 11 }, axisTick: { show: false } },
        { type: 'category', gridIndex: 1, data: fpsData.map(d => d.name), axisLabel: { fontSize: 11 }, axisTick: { show: false } },
        { type: 'category', gridIndex: 2, data: memData.map(d => d.name), axisLabel: { fontSize: 11 }, axisTick: { show: false } }
      ],
      series: [
        {
          name: '执行时间', type: 'bar', xAxisIndex: 0, yAxisIndex: 0,
          data: execData.map(d => d.value),
          label: { show: true, position: 'right', formatter: '{c} ms', fontSize: 11, color: '#666' },
          itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#83bff6' }, { offset: 1, color: '#188df0' }]) },
          barMaxWidth: 50
        },
        {
          name: 'FPS', type: 'bar', xAxisIndex: 1, yAxisIndex: 1,
          data: fpsData.map(d => d.value),
          label: { show: true, position: 'right', formatter: '{c} fps', fontSize: 11, color: '#666' },
          itemStyle: { color: '#52c41a' },
          barMaxWidth: 50
        },
        {
          name: '内存占用', type: 'bar', xAxisIndex: 2, yAxisIndex: 2,
          data: memData.map(d => d.value),
          label: { show: true, position: 'right', formatter: '{c} MB', fontSize: 11, color: '#666' },
          itemStyle: { color: '#fa8c16' },
          barMaxWidth: 50
        }
      ]
    }
  }

  return (
    <Card
      className="performance-chart"
      title={
        <div className="chart-header">
          <span><BarChartOutlined style={{ marginRight: 8 }} />性能数据可视化</span>
          {scenarios.length > 1 && (
            <Select value={selectedScenario} onChange={setSelectedScenario} size="small" style={{ width: 120 }}>
              <Option value="all">全部场景</Option>
              {scenarios.map(s => <Option key={s} value={s}>{getScenarioName(s)}</Option>)}
            </Select>
          )}
        </div>
      }
      size="small"
    >
      {filteredResults.length === 0 && (
        <Empty description="暂无测试数据" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: '40px 0' }} />
      )}
      <div ref={chartRef} className="chart-container" style={{ display: filteredResults.length === 0 ? 'none' : 'block' }} />
    </Card>
  )
}

export default PerformanceChart
