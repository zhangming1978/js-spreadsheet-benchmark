import { FC, useRef, useEffect } from 'react'
import { Layout, Row, Col } from 'antd'
import AppHeader from '@/components/layout/AppHeader'
import TestControlPanel from '@/components/test-control/TestControlPanel'
import ProductDisplayArea from '@/components/product-display/ProductDisplayArea'
import ResultsPanel from '@/components/results/ResultsPanel'
import PerformanceChart from '@/components/charts/PerformanceChart'
import { useTestStore } from '@/stores/useTestStore'
import { TestEngine } from '@/core/engine'
import './HomePage.css'

const { Content } = Layout

const HomePage: FC = () => {
  const { isRunning, results } = useTestStore()
  const testEngineRef = useRef<TestEngine | null>(null)
  const resultsSectionRef = useRef<HTMLDivElement>(null)

  // 只有在测试完成后才显示结果
  const showResults = !isRunning && results.length > 0

  // 测试完成后自动滚动到结果区域
  useEffect(() => {
    if (showResults && resultsSectionRef.current) {
      // 延迟一小段时间，确保 DOM 已渲染
      setTimeout(() => {
        resultsSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }, 300)
    }
  }, [showResults])

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
        <div className="main-layout">
          {/* 控制面板区域 */}
          <div className="control-section">
            <TestControlPanel testEngineRef={testEngineRef} />
          </div>

          {/* 产品显示区域 - 测试时显示，完成后隐藏 */}
          <div className="display-section" style={{ display: showResults ? 'none' : 'block' }}>
            <ProductDisplayArea
              onContinue={handleContinue}
              onRetest={handleRetest}
              onStop={handleConfirmStop}
            />
          </div>

          {/* 测试结果区域 - 只在测试完成后显示 */}
          {showResults && (
            <div className="results-section" ref={resultsSectionRef}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={24} md={24} lg={16} xl={16}>
                  <ResultsPanel />
                </Col>
                <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                  <PerformanceChart />
                </Col>
              </Row>
            </div>
          )}
        </div>
      </Content>
    </Layout>
  )
}

export default HomePage
