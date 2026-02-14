import { FC } from 'react'
import { Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ProductType } from '@/types'

interface DataType {
  key: string
  metric: string
  spreadjs: string | number
  univer: string | number
  handsontable: string | number
}

const ComparisonTable: FC = () => {
  const columns: ColumnsType<DataType> = [
    {
      title: '性能指标',
      dataIndex: 'metric',
      key: 'metric',
      width: 200,
      fixed: 'left'
    },
    {
      title: ProductType.SPREADJS,
      dataIndex: 'spreadjs',
      key: 'spreadjs',
      align: 'center'
    },
    {
      title: ProductType.UNIVER,
      dataIndex: 'univer',
      key: 'univer',
      align: 'center'
    },
    {
      title: ProductType.HANDSONTABLE,
      dataIndex: 'handsontable',
      key: 'handsontable',
      align: 'center'
    }
  ]

  const data: DataType[] = [
    {
      key: '1',
      metric: '执行时间 (ms)',
      spreadjs: '-',
      univer: '-',
      handsontable: '-'
    },
    {
      key: '2',
      metric: '内存占用 (MB)',
      spreadjs: '-',
      univer: '-',
      handsontable: '-'
    },
    {
      key: '3',
      metric: 'FPS',
      spreadjs: '-',
      univer: '-',
      handsontable: '-'
    }
  ]

  return (
    <Table
      columns={columns}
      dataSource={data}
      pagination={false}
      bordered
    />
  )
}

export default ComparisonTable
