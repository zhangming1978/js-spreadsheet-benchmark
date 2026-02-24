import { FC, useEffect, useRef, useState, useMemo } from 'react'
import { Card, Select, Empty, Space } from 'antd'
import { BarChartOutlined } from '@ant-design/icons'
import * as echarts from 'echarts'
import { useTestStore } from '@/stores/useTestStore'
import type { TestResult, TestScenario } from '@/types'
import './PerformanceChart.css'

const { Option } = Select

type ChartType = 'bar' | 'line' | 'radar'

/**
 * 性能数据可视化图表组件
 * 使用 ECharts 展示测试结果对比
 */
const PerformanceChart: FC = () => {
  const { results } = useTestStore()
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstanceRef = useRef<echarts.ECharts | null>(null)
  const [chartType, setChartType] = useState<ChartType>('bar')
  const [selectedScenario, setSelectedScenario] = useState<TestScenario | 'all'>('all')

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

  // 初始化图表
  useEffect(() => {
    if (!chartRef.current) {
      return
    }

    // 创建图表实例
    chartInstanceRef.current = echarts.init(chartRef.current)

    // 响应式调整
    const handleResize = () => {
      chartInstanceRef.current?.resize()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chartInstanceRef.current?.dispose()
      chartInstanceRef.current = null
    }
  }, [])

  // 更新图表数据
  useEffect(() => {
    if (!chartInstanceRef.current || filteredResults.length === 0) {
      return
    }

    // 确保图表容器可见后调整大小
    chartInstanceRef.current.resize()

    const option = generateChartOption(filteredResults)
    chartInstanceRef.current.setOption(option, true)
  }, [filteredResults, chartType])

  // 生成图表配置
  const generateChartOption = (data: TestResult[]): echarts.EChartsOption => {
    if (chartType === 'bar' || chartType === 'line') {
      return generateBarLineOption(data)
    } else {
      return generateRadarOption(data)
    }
  }

  // 生成柱状图/折线图配置
  const generateBarLineOption = (data: TestResult[]): echarts.EChartsOption => {
    // 按产品聚合数据，计算平均值
    const productMap = new Map<string, { executionTime: number[], fps: number[], memory: number[] }>()

    data.forEach(r => {
      if (!productMap.has(r.productName)) {
        productMap.set(r.productName, { executionTime: [], fps: [], memory: [] })
      }
      const product = productMap.get(r.productName)!
      product.executionTime.push(r.metrics.executionTime)
      product.fps.push(r.metrics.fps || 0)
      product.memory.push(r.metrics.memoryUsage)
    })

    // 计算每个产品的平均值
    const aggregatedData = Array.from(productMap.entries()).map(([name, metrics]) => ({
      name,
      executionTime: Math.round(metrics.executionTime.reduce((a, b) => a + b, 0) / metrics.executionTime.length),
      fps: Math.round(metrics.fps.reduce((a, b) => a + b, 0) / metrics.fps.length),
      memory: Math.round(metrics.memory.reduce((a, b) => a + b, 0) / metrics.memory.length)
    }))

    // 为每个指标创建排序后的数据
    const executionTimeData = aggregatedData
      .map(r => ({ name: r.name, value: r.executionTime }))
      .sort((a, b) => a.value - b.value)

    const fpsData = aggregatedData
      .map(r => ({ name: r.name, value: r.fps }))
      .sort((a, b) => a.value - b.value)

    const memoryData = aggregatedData
      .map(r => ({ name: r.name, value: r.memory }))
      .sort((a, b) => a.value - b.value)

    return {
      title: [
        {
          text: '执行时间 (ms)',
          left: 'center',
          top: '2%',
          textStyle: { fontSize: 13, fontWeight: 600 }
        },
        {
          text: 'FPS',
          left: 'center',
          top: '35%',
          textStyle: { fontSize: 13, fontWeight: 600 }
        },
        {
          text: '内存占用 (MB)',
          left: 'center',
          top: '68%',
          textStyle: { fontSize: 13, fontWeight: 600 }
        }
      ],
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const param = Array.isArray(params) ? params[0] : params
          const unit = param.seriesName === '执行时间' ? 'ms' : param.seriesName === 'FPS' ? 'fps' : 'MB'
          return `<div style="font-weight: 600;">${param.name}</div>
                  <div>${param.marker} ${param.seriesName}: <strong>${param.value} ${unit}</strong></div>`
        }
      },
      grid: [
        { left: '20%', right: '10%', top: '8%', height: '22%', containLabel: false },
        { left: '20%', right: '10%', top: '40%', height: '22%', containLabel: false },
        { left: '20%', right: '10%', top: '73%', height: '22%', containLabel: false }
      ],
      xAxis: [
        {
          type: 'value',
          gridIndex: 0,
          axisLabel: { fontSize: 11, formatter: '{value} ms' },
          splitLine: { show: true, lineStyle: { type: 'dashed', opacity: 0.3 } }
        },
        {
          type: 'value',
          gridIndex: 1,
          axisLabel: { fontSize: 11, formatter: '{value} fps' },
          splitLine: { show: true, lineStyle: { type: 'dashed', opacity: 0.3 } }
        },
        {
          type: 'value',
          gridIndex: 2,
          axisLabel: { fontSize: 11, formatter: '{value} MB' },
          splitLine: { show: true, lineStyle: { type: 'dashed', opacity: 0.3 } }
        }
      ],
      yAxis: [
        {
          type: 'category',
          gridIndex: 0,
          data: executionTimeData.map(d => d.name),
          axisLabel: { fontSize: 11 },
          axisTick: { show: false }
        },
        {
          type: 'category',
          gridIndex: 1,
          data: fpsData.map(d => d.name),
          axisLabel: { fontSize: 11 },
          axisTick: { show: false }
        },
        {
          type: 'category',
          gridIndex: 2,
          data: memoryData.map(d => d.name),
          axisLabel: { fontSize: 11 },
          axisTick: { show: false }
        }
      ],
      series: [
        {
          name: '执行时间',
          type: 'bar',
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: executionTimeData.map(d => d.value),
          label: {
            show: true,
            position: 'right',
            formatter: '{c} ms',
            fontSize: 11,
            color: '#666'
          },
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
          },
          barMaxWidth: 50
        },
        {
          name: 'FPS',
          type: 'bar',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: fpsData.map(d => d.value),
          label: {
            show: true,
            position: 'right',
            formatter: '{c} fps',
            fontSize: 11,
            color: '#666'
          },
          itemStyle: { color: '#52c41a' },
          barMaxWidth: 50
        },
        {
          name: '内存占用',
          type: 'bar',
          xAxisIndex: 2,
          yAxisIndex: 2,
          data: memoryData.map(d => d.value),
          label: {
            show: true,
            position: 'right',
            formatter: '{c} MB',
            fontSize: 11,
            color: '#666'
          },
          itemStyle: { color: '#fa8c16' },
          barMaxWidth: 50
        }
      ]
    }
  }

  // 生成雷达图配置
  const generateRadarOption = (data: TestResult[]): echarts.EChartsOption => {
    const productNames = [...new Set(data.map(r => r.productName))]

    const maxExecTime = Math.max(...data.map(r => r.metrics.executionTime), 1)
    const maxMemory = Math.max(...data.map(r => r.metrics.memoryUsage), 1)
    const maxFps = 60

    return {
      title: {
        text: '综合性能雷达图',
        left: 'center',
        textStyle: {
          fontSize: 14,
          fontWeight: 600
        }
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        data: productNames,
        bottom: 10,
        textStyle: {
          fontSize: 12
        }
      },
      radar: {
        indicator: [
          { name: '执行速度', max: maxExecTime * 1.2 },
          { name: '内存占用', max: maxMemory * 1.2 },
          { name: '帧率', max: maxFps }
        ],
        radius: '60%',
        splitNumber: 4,
        axisName: {
          fontSize: 12
        }
      },
      series: [
        {
          type: 'radar',
          data: productNames.map((name, index) => {
            const result = data.find(r => r.productName === name)
            const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de']
            return {
              value: result
                ? [
                    Math.round(result.metrics.executionTime),
                    Math.round(result.metrics.memoryUsage),
                    Math.round(result.metrics.fps || 0)
                  ]
                : [0, 0, 0],
              name,
              itemStyle: {
                color: colors[index % colors.length]
              },
              areaStyle: {
                opacity: 0.3
              }
            }
          })
        }
      ]
    }
  }

  return (
    <Card
      className="performance-chart"
      title={
        <div className="chart-header">
          <span>
            <BarChartOutlined style={{ marginRight: 8 }} />
            性能数据可视化
          </span>
          <Space>
            {scenarios.length > 1 && (
              <Select
                value={selectedScenario}
                onChange={setSelectedScenario}
                size="small"
                style={{ width: 120 }}
              >
                <Option value="all">全部场景</Option>
                {scenarios.map(s => (
                  <Option key={s} value={s}>{getScenarioName(s)}</Option>
                ))}
              </Select>
            )}
            <Select
              value={chartType}
              onChange={setChartType}
              size="small"
              style={{ width: 100 }}
            >
              <Option value="bar">柱状图</Option>
              <Option value="line">折线图</Option>
              <Option value="radar">雷达图</Option>
            </Select>
          </Space>
        </div>
      }
      size="small"
    >
      {filteredResults.length === 0 && (
        <Empty
          description="暂无测试数据"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: '40px 0' }}
        />
      )}
      <div
        ref={chartRef}
        className="chart-container"
        style={{ display: filteredResults.length === 0 ? 'none' : 'block' }}
      />
    </Card>
  )
}

export default PerformanceChart
