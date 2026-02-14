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

    // 生成表格行数据
    const data: DataType[] = [
      {
        key: 'executionTime',
        metric: '执行时间',
        unit: 'ms',
        spreadjs: resultsByProduct[ProductType.SPREADJS]?.metrics.executionTime,
        univer: resultsByProduct[ProductType.UNIVER]?.metrics.executionTime,
        handsontable: resultsByProduct[ProductType.HANDSONTABLE]?.metrics.executionTime,
        bestValue: Math.min(
          resultsByProduct[ProductType.SPREADJS]?.metrics.executionTime ?? Infinity,
          resultsByProduct[ProductType.UNIVER]?.metrics.executionTime ?? Infinity,
          resultsByProduct[ProductType.HANDSONTABLE]?.metrics.executionTime ?? Infinity
        )
      },
      {
        key: 'memoryUsage',
        metric: '内存占用',
        unit: 'MB',
        spreadjs: resultsByProduct[ProductType.SPREADJS]?.metrics.memoryUsage,
        univer: resultsByProduct[ProductType.UNIVER]?.metrics.memoryUsage,
        handsontable: resultsByProduct[ProductType.HANDSONTABLE]?.metrics.memoryUsage,
        bestValue: Math.min(
          resultsByProduct[ProductType.SPREADJS]?.metrics.memoryUsage ?? Infinity,
          resultsByProduct[ProductType.UNIVER]?.metrics.memoryUsage ?? Infinity,
          resultsByProduct[ProductType.HANDSONTABLE]?.metrics.memoryUsage ?? Infinity
        )
      },
      {
        key: 'fps',
        metric: '帧率',
        unit: 'fps',
        spreadjs: resultsByProduct[ProductType.SPREADJS]?.metrics.fps,
        univer: resultsByProduct[ProductType.UNIVER]?.metrics.fps,
        handsontable: resultsByProduct[ProductType.HANDSONTABLE]?.metrics.fps,
        bestValue: Math.max(
          resultsByProduct[ProductType.SPREADJS]?.metrics.fps ?? -Infinity,
          resultsByProduct[ProductType.UNIVER]?.metrics.fps ?? -Infinity,
          resultsByProduct[ProductType.HANDSONTABLE]?.metrics.fps ?? -Infinity
        )
      }
    ]

    return data
  }, [results])

  // 渲染单元格内容，高亮最优值
  const renderCell = (value: number | undefined, record: DataType, isBest: boolean) => {
    if (value === undefined) {
      return <span style={{ color: '#999' }}>-</span>
    }

    const formattedValue = record.key === 'fps'
      ? Math.round(value)
      : Math.round(value * 100) / 100

    if (isBest) {
      return (
        <span style={{ fontWeight: 600, color: '#52c41a' }}>
          {formattedValue} {record.unit}
          <Tag color="success" style={{ marginLeft: 8, fontSize: 11 }}>最优</Tag>
        </span>
      )
    }

    return (
      <span>
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
      render: (text: string) => <strong>{text}</strong>
    },
    {
      title: ProductType.SPREADJS,
      dataIndex: 'spreadjs',
      key: 'spreadjs',
      align: 'center',
      render: (value: number | undefined, record: DataType) => {
        const isBest = value !== undefined && (
          (record.key === 'fps' && value === record.bestValue) ||
          (record.key !== 'fps' && value === record.bestValue)
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
          (record.key === 'fps' && value === record.bestValue) ||
          (record.key !== 'fps' && value === record.bestValue)
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
          (record.key === 'fps' && value === record.bestValue) ||
          (record.key !== 'fps' && value === record.bestValue)
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
