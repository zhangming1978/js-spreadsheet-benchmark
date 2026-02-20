import { FC, useMemo } from 'react'
import { Table, Tag, Empty } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ProductType } from '@/types'
import { useTestStore } from '@/stores/useTestStore'

interface DataType {
  key: string
  metric: string
  unit: string
  spreadjs?: number
  univer?: number
  handsontable?: number
  bestValue?: number
}

/**
 * 性能对比数据表格组件
 * 展示各产品的性能指标对比
 */
const ComparisonTable: FC = () => {
  const { results } = useTestStore()

  // 根据测试结果生成表格数据
  const tableData = useMemo(() => {
    if (results.length === 0) {
      return []
    }

    // 按产品类型分组结果
    const resultsByProduct = results.reduce((acc, result) => {
      acc[result.productName] = result
      return acc
    }, {} as Record<ProductType, typeof results[0]>)

    // 获取最大运行次数
    const maxRuns = Math.max(
      ...results.map(r => r.runs?.length || 0)
    )

    const data: DataType[] = []

    // 为每一轮运行生成数据行
    for (let runIndex = 0; runIndex < maxRuns; runIndex++) {
      const runNumber = runIndex + 1

      // 执行时间
      data.push({
        key: `executionTime-run${runNumber}`,
        metric: `执行时间 (第${runNumber}轮)`,
        unit: 'ms',
        spreadjs: resultsByProduct[ProductType.SPREADJS]?.runs?.[runIndex]?.executionTime,
        univer: resultsByProduct[ProductType.UNIVER]?.runs?.[runIndex]?.executionTime,
        handsontable: resultsByProduct[ProductType.HANDSONTABLE]?.runs?.[runIndex]?.executionTime,
        bestValue: Math.min(
          resultsByProduct[ProductType.SPREADJS]?.runs?.[runIndex]?.executionTime ?? Infinity,
          resultsByProduct[ProductType.UNIVER]?.runs?.[runIndex]?.executionTime ?? Infinity,
          resultsByProduct[ProductType.HANDSONTABLE]?.runs?.[runIndex]?.executionTime ?? Infinity
        )
      })

      // 内存占用
      data.push({
        key: `memoryUsage-run${runNumber}`,
        metric: `内存占用 (第${runNumber}轮)`,
        unit: 'MB',
        spreadjs: resultsByProduct[ProductType.SPREADJS]?.runs?.[runIndex]?.memoryUsage,
        univer: resultsByProduct[ProductType.UNIVER]?.runs?.[runIndex]?.memoryUsage,
        handsontable: resultsByProduct[ProductType.HANDSONTABLE]?.runs?.[runIndex]?.memoryUsage,
        bestValue: Math.min(
          resultsByProduct[ProductType.SPREADJS]?.runs?.[runIndex]?.memoryUsage ?? Infinity,
          resultsByProduct[ProductType.UNIVER]?.runs?.[runIndex]?.memoryUsage ?? Infinity,
          resultsByProduct[ProductType.HANDSONTABLE]?.runs?.[runIndex]?.memoryUsage ?? Infinity
        )
      })

      // 帧率
      data.push({
        key: `fps-run${runNumber}`,
        metric: `帧率 (第${runNumber}轮)`,
        unit: 'fps',
        spreadjs: resultsByProduct[ProductType.SPREADJS]?.runs?.[runIndex]?.fps,
        univer: resultsByProduct[ProductType.UNIVER]?.runs?.[runIndex]?.fps,
        handsontable: resultsByProduct[ProductType.HANDSONTABLE]?.runs?.[runIndex]?.fps,
        bestValue: Math.max(
          resultsByProduct[ProductType.SPREADJS]?.runs?.[runIndex]?.fps ?? -Infinity,
          resultsByProduct[ProductType.UNIVER]?.runs?.[runIndex]?.fps ?? -Infinity,
          resultsByProduct[ProductType.HANDSONTABLE]?.runs?.[runIndex]?.fps ?? -Infinity
        )
      })
    }

    // 添加平均值行
    data.push({
      key: 'executionTime-avg',
      metric: '执行时间 (平均)',
      unit: 'ms',
      spreadjs: resultsByProduct[ProductType.SPREADJS]?.metrics.executionTime,
      univer: resultsByProduct[ProductType.UNIVER]?.metrics.executionTime,
      handsontable: resultsByProduct[ProductType.HANDSONTABLE]?.metrics.executionTime,
      bestValue: Math.min(
        resultsByProduct[ProductType.SPREADJS]?.metrics.executionTime ?? Infinity,
        resultsByProduct[ProductType.UNIVER]?.metrics.executionTime ?? Infinity,
        resultsByProduct[ProductType.HANDSONTABLE]?.metrics.executionTime ?? Infinity
      )
    })

    data.push({
      key: 'memoryUsage-avg',
      metric: '内存占用 (平均)',
      unit: 'MB',
      spreadjs: resultsByProduct[ProductType.SPREADJS]?.metrics.memoryUsage,
      univer: resultsByProduct[ProductType.UNIVER]?.metrics.memoryUsage,
      handsontable: resultsByProduct[ProductType.HANDSONTABLE]?.metrics.memoryUsage,
      bestValue: Math.min(
        resultsByProduct[ProductType.SPREADJS]?.metrics.memoryUsage ?? Infinity,
        resultsByProduct[ProductType.UNIVER]?.metrics.memoryUsage ?? Infinity,
        resultsByProduct[ProductType.HANDSONTABLE]?.metrics.memoryUsage ?? Infinity
      )
    })

    data.push({
      key: 'fps-avg',
      metric: '帧率 (平均)',
      unit: 'fps',
      spreadjs: resultsByProduct[ProductType.SPREADJS]?.metrics.fps,
      univer: resultsByProduct[ProductType.UNIVER]?.metrics.fps,
      handsontable: resultsByProduct[ProductType.HANDSONTABLE]?.metrics.fps,
      bestValue: Math.max(
        resultsByProduct[ProductType.SPREADJS]?.metrics.fps ?? -Infinity,
        resultsByProduct[ProductType.UNIVER]?.metrics.fps ?? -Infinity,
        resultsByProduct[ProductType.HANDSONTABLE]?.metrics.fps ?? -Infinity
      )
    })

    return data
  }, [results])

  // 渲染单元格内容，高亮最优值
  const renderCell = (value: number | undefined, record: DataType, isBest: boolean) => {
    if (value === undefined) {
      return <span style={{ color: '#999' }}>-</span>
    }

    const formattedValue = record.key.startsWith('fps')
      ? Math.round(value)
      : Math.round(value * 100) / 100

    // 判断是否为平均值行
    const isAvgRow = record.key.endsWith('-avg')

    if (isBest) {
      return (
        <span style={{ fontWeight: isAvgRow ? 700 : 600, color: '#52c41a' }}>
          {formattedValue} {record.unit}
          <Tag color="success" style={{ marginLeft: 8, fontSize: 11 }}>最优</Tag>
        </span>
      )
    }

    return (
      <span style={{ fontWeight: isAvgRow ? 600 : 'normal' }}>
        {formattedValue} {record.unit}
      </span>
    )
  }

  const columns: ColumnsType<DataType> = [
    {
      title: '性能指标',
      dataIndex: 'metric',
      key: 'metric',
      width: 150,
      fixed: 'left',
      render: (text: string, record: DataType) => {
        const isAvgRow = record.key.endsWith('-avg')
        return (
          <strong style={{
            fontWeight: isAvgRow ? 700 : 600,
            color: isAvgRow ? '#1890ff' : 'inherit'
          }}>
            {text}
          </strong>
        )
      }
    },
    {
      title: ProductType.SPREADJS,
      dataIndex: 'spreadjs',
      key: 'spreadjs',
      align: 'center',
      render: (value: number | undefined, record: DataType) => {
        const isBest = value !== undefined && (
          (record.key.startsWith('fps') && value === record.bestValue) ||
          (!record.key.startsWith('fps') && value === record.bestValue)
        )
        return renderCell(value, record, isBest)
      }
    },
    {
      title: ProductType.UNIVER,
      dataIndex: 'univer',
      key: 'univer',
      align: 'center',
      render: (value: number | undefined, record: DataType) => {
        const isBest = value !== undefined && (
          (record.key.startsWith('fps') && value === record.bestValue) ||
          (!record.key.startsWith('fps') && value === record.bestValue)
        )
        return renderCell(value, record, isBest)
      }
    },
    {
      title: ProductType.HANDSONTABLE,
      dataIndex: 'handsontable',
      key: 'handsontable',
      align: 'center',
      render: (value: number | undefined, record: DataType) => {
        const isBest = value !== undefined && (
          (record.key.startsWith('fps') && value === record.bestValue) ||
          (!record.key.startsWith('fps') && value === record.bestValue)
        )
        return renderCell(value, record, isBest)
      }
    }
  ]

  if (results.length === 0) {
    return (
      <Empty
        description="暂无测试数据"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        style={{ padding: '40px 0' }}
      />
    )
  }

  return (
    <Table
      columns={columns}
      dataSource={tableData}
      pagination={false}
      bordered
      size="middle"
    />
  )
}

export default ComparisonTable
