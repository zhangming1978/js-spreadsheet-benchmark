import { FC } from 'react'
import { Layout } from 'antd'
import AppHeader from '@/components/layout/AppHeader'
import TestControlPanel from '@/components/test-control/TestControlPanel'
import ProductDisplayArea from '@/components/product-display/ProductDisplayArea'
import ResultsPanel from '@/components/results/ResultsPanel'
import './HomePage.css'

const { Content } = Layout

const HomePage: FC = () => {
  return (
    <Layout className="home-page">
      <AppHeader />
      <Content className="home-content">
        <div className="control-section">
          <TestControlPanel />
        </div>
        <div className="display-section">
          <ProductDisplayArea />
        </div>
        <div className="results-section">
          <ResultsPanel />
        </div>
      </Content>
    </Layout>
  )
}

export default HomePage
