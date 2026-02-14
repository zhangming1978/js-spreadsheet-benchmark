import { FC, useEffect, useRef, useState } from 'react'
import { Card, Select, Empty } from 'antd'
import { BarChartOutlined } from '@ant-design/icons'
import * as echarts from 'echarts'
import { useTestStore } from '@/stores/useTestStore'
import type { TestResult } from '@/types'
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

  // 初始化图表
  useEffect(() => {
    if (!chartRef.current) return

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
    if (!chartInstanceRef.current || results.length === 0) {
      return
    }

    const option = generateChartOption(results, chartType)
    chartInstanceRef.current.setOption(option, true)
  }, [results, chartType])

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
    // 按产品分组数据
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
            result += `
              <div style="display: flex; justify-content: space-between; align-items: center; margin: 4px 0;">
                <span>${param.marker} ${param.seriesName}:</span>
                <span style="font-weight: 600; margin-left: 16px;">${param.value} ms</span>
              </div>
            `
          })
          return result
        }
      },
      legend: {
        data: productNames,
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
      yAxis: {
        type: 'value',
        name: '执行时间 (ms)',
        nameTextStyle: {
          fontSize: 12
        },
        axisLabel: {
          fontSize: 11
        }
      },
      series: [
        {
          name: '执行时间',
          type,
          data: productNames.map(name => {
            const result = data.find(r => r.productName === name)
            return result ? Math.round(result.metrics.executionTime) : 0
          }),
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
        }
      ]
    }
  }

  // 生成雷达图配置
  const generateRadarOption = (data: TestResult[]): echarts.EChartsOption => {
    const productNames = [...new Set(data.map(r => r.productName))]

    // 计算最大值用于雷达图缩放
    const maxExecTime = Math.max(...data.map(r => r.metrics.executionTime), 1)
    const maxMemory = Math.max(...data.map(r => r.metrics.memoryUsage), 1)
    const maxFps = 60 // FPS 最大值固定为 60

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
        </div>
      }
      size="small"
    >
      {results.length === 0 ? (
        <Empty
          description="暂无测试数据"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: '40px 0' }}
        />
      ) : (
        <div ref={chartRef} className="chart-container" />
      )}
    </Card>
  )
}

export default PerformanceChart
