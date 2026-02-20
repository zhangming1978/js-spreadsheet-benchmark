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

    const option = generateChartOption(filteredResults, chartType)
    chartInstanceRef.current.setOption(option, true)
  }, [filteredResults, chartType])

  // 生成图表配置
  const generateChartOption = (data: TestResult[], type: ChartType): echarts.EChartsOption => {
    if (type === 'bar' || type === 'line') {
      return generateBarLineOption(data, type)
    } else {
      return generateRadarOption(data)
    }
  }

  // 生成柱状图/折线图配置
  const generateBarLineOption = (data: TestResult[], type: 'bar' | 'line'): echarts.EChartsOption => {
    const productNames = [...new Set(data.map(r => r.productName))]

    return {
      title: {
        text: '性能对比',
        left: 'center',
        textStyle: {
          fontSize: 14,
          fontWeight: 600
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          let result = `<div style="font-weight: 600; margin-bottom: 8px;">${params[0].axisValue}</div>`
          params.forEach((param: any) => {
            const unit = param.seriesName === '执行时间' ? 'ms' : param.seriesName === 'FPS' ? 'fps' : 'MB'
            result += `
              <div style="display: flex; justify-content: space-between; align-items: center; margin: 4px 0;">
                <span>${param.marker} ${param.seriesName}:</span>
                <span style="font-weight: 600; margin-left: 16px;">${param.value} ${unit}</span>
              </div>
            `
          })
          return result
        }
      },
      legend: {
        data: ['执行时间', 'FPS', '内存占用'],
        bottom: 10,
        textStyle: {
          fontSize: 12
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: productNames,
        axisLabel: {
          fontSize: 12
        }
      },
      yAxis: [
        {
          type: 'value',
          name: '执行时间 (ms)',
          position: 'left',
          nameTextStyle: {
            fontSize: 12
          },
          axisLabel: {
            fontSize: 11,
            formatter: '{value} ms'
          }
        },
        {
          type: 'value',
          name: 'FPS / 内存 (MB)',
          position: 'right',
          nameTextStyle: {
            fontSize: 12
          },
          axisLabel: {
            fontSize: 11
          }
        }
      ],
      series: [
        {
          name: '执行时间',
          type,
          yAxisIndex: 0,
          data: productNames.map(name => {
            const result = data.find(r => r.productName === name)
            return result ? Math.round(result.metrics.executionTime) : 0
          }),
          label: {
            show: true,
            position: 'top',
            formatter: '{c} ms',
            fontSize: 11,
            color: '#666'
          },
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#2378f7' },
                { offset: 0.7, color: '#2378f7' },
                { offset: 1, color: '#83bff6' }
              ])
            }
          }
        },
        {
          name: 'FPS',
          type,
          yAxisIndex: 1,
          data: productNames.map(name => {
            const result = data.find(r => r.productName === name)
            return result ? Math.round(result.metrics.fps || 0) : 0
          }),
          label: {
            show: true,
            position: 'top',
            formatter: '{c} fps',
            fontSize: 11,
            color: '#666'
          },
          itemStyle: {
            color: '#52c41a'
          }
        },
        {
          name: '内存占用',
          type,
          yAxisIndex: 1,
          data: productNames.map(name => {
            const result = data.find(r => r.productName === name)
            return result ? Math.round(result.metrics.memoryUsage) : 0
          }),
          label: {
            show: true,
            position: 'top',
            formatter: '{c} MB',
            fontSize: 11,
            color: '#666'
          },
          itemStyle: {
            color: '#fa8c16'
          }
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
