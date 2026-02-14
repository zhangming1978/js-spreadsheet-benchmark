import { FC } from 'react'
import ReactECharts from 'echarts-for-react'
import { ProductType } from '@/types'

const PerformanceChart: FC = () => {
  // 示例数据
  const option = {
    title: {
      text: '性能对比',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: [ProductType.SPREADJS, ProductType.UNIVER, ProductType.HANDSONTABLE],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['执行时间 (ms)', '内存占用 (MB)', 'FPS']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: ProductType.SPREADJS,
        type: 'bar',
        data: [0, 0, 0],
        itemStyle: { color: '#1890ff' }
      },
      {
        name: ProductType.UNIVER,
        type: 'bar',
        data: [0, 0, 0],
        itemStyle: { color: '#52c41a' }
      },
      {
        name: ProductType.HANDSONTABLE,
        type: 'bar',
        data: [0, 0, 0],
        itemStyle: { color: '#fa8c16' }
      }
    ]
  }

  return (
    <ReactECharts
      option={option}
      style={{ height: '300px', width: '100%' }}
      notMerge={true}
      lazyUpdate={true}
      opts={{ renderer: 'canvas' }}
    />
  )
}

export default PerformanceChart
