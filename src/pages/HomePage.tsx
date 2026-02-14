import { FC } from 'react'
import { Layout, Row, Col } from 'antd'
import AppHeader from '@/components/layout/AppHeader'
import TestControlPanel from '@/components/test-control/TestControlPanel'
import PerformanceMonitor from '@/components/performance-monitor/PerformanceMonitor'
import ProductDisplayArea from '@/components/product-display/ProductDisplayArea'
import ResultsPanel from '@/components/results/ResultsPanel'
import SystemInfoPanel from '@/components/system-info/SystemInfoPanel'
import './HomePage.css'

const { Content } = Layout

const HomePage: FC = () => {
  return (
    <Layout className="home-page">
      <AppHeader />
      <Content className="home-content">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={24} lg={16} xl={16}>
            <div className="left-section">
              <div className="control-section">
                <TestControlPanel />
              </div>
              <div className="display-section">
                <ProductDisplayArea />
              </div>
            </div>
          </Col>
          <Col xs={24} sm={24} md={24} lg={8} xl={8}>
            <div className="right-section">
              <div className="results-section">
                <ResultsPanel />
              </div>
              <div className="system-info-section">
                <SystemInfoPanel />
              </div>
            </div>
          </Col>
        </Row>
      </Content>
      {/* 浮动性能监控对话框 */}
      <PerformanceMonitor />
    </Layout>
  )
}

export default HomePage
