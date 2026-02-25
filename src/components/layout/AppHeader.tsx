import { FC } from 'react'
import { Layout, Typography } from 'antd'
import './AppHeader.css'

const { Header } = Layout
const { Title } = Typography

const AppHeader: FC = () => {
  return (
    <Header className="app-header">
      <div className="header-content">
        <Title level={3} className="header-title">
          JS Spreadsheet Benchmark
        </Title>
        <div className="header-subtitle">
          电子表格库性能基准测试 · 开源 · 中立 · 可复现
        </div>
      </div>
    </Header>
  )
}

export default AppHeader
