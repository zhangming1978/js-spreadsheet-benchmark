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
          SpreadJS 性能对比测试平台
        </Title>
        <div className="header-subtitle">
          自动化性能测试与可视化对比分析
        </div>
      </div>
    </Header>
  )
}

export default AppHeader
