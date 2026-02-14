import { FC, useRef } from 'react'
import { Layout, Row, Col } from 'antd'
import AppHeader from '@/components/layout/AppHeader'
import TestControlPanel from '@/components/test-control/TestControlPanel'
import ProductDisplayArea from '@/components/product-display/ProductDisplayArea'
import ResultsPanel from '@/components/results/ResultsPanel'
import SystemInfoPanel from '@/components/system-info/SystemInfoPanel'
import { useTestStore } from '@/stores/useTestStore'
import { TestEngine } from '@/core/engine'
import './HomePage.css'

const { Content } = Layout

const HomePage: FC = () => {
  const { isRunning, results } = useTestStore()
  const testEngineRef = useRef<TestEngine | null>(null)

  // 只有在测试完成后才显示结果和系统信息
  const showResults = !isRunning && results.length > 0

  // 处理用户确认继续
  const handleContinue = () => {
    if (testEngineRef.current) {
      testEngineRef.current.setUserDecision('continue')
    }
  }

  // 处理用户确认重新测试
  const handleRetest = () => {
    if (testEngineRef.current) {
      testEngineRef.current.setUserDecision('retest')
    }
  }

  // 处理用户确认停止
  const handleConfirmStop = () => {
    if (testEngineRef.current) {
      testEngineRef.current.setUserDecision('stop')
    }
  }

  return (
    <Layout className="home-page">
      <AppHeader />
      <Content className="home-content">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={24} lg={showResults ? 16 : 24} xl={showResults ? 16 : 24}>
            <div className="left-section">
              <div className="control-section">
                <TestControlPanel testEngineRef={testEngineRef} />
              </div>
              <div className="display-section">
                <ProductDisplayArea
                  onContinue={handleContinue}
                  onRetest={handleRetest}
                  onStop={handleConfirmStop}
                />
              </div>
            </div>
          </Col>
          {showResults && (
            <Col xs={24} sm={24} md={24} lg={8} xl={8} className="right-column">
              <div className="right-section">
                <div className="results-section">
                  <ResultsPanel />
                </div>
                <div className="system-info-section">
                  <SystemInfoPanel />
                </div>
              </div>
            </Col>
          )}
        </Row>
      </Content>
    </Layout>
  )
}

export default HomePage
