import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import App from './App'
import './index.css'

// 开发环境下暴露 store 和适配器到 window 对象，方便调试
if (import.meta.env.DEV) {
  import('./stores/useTestStore').then(({ useTestStore }) => {
    ;(window as any).__TEST_STORE__ = useTestStore
  })

  import('./core/adapters').then(({ AdapterFactory }) => {
    ;(window as any).__ADAPTER_FACTORY__ = AdapterFactory
  })

  import('./types').then((types) => {
    ;(window as any).__TYPES__ = types
  })

  console.log('🔧 开发工具已启用：')
  console.log('  - 使用 window.__TEST_STORE__.getState() 查看当前状态')
  console.log('  - 使用 window.__TEST_STORE__.setState({...}) 修改状态')
  console.log('  - 使用 window.__ADAPTER_FACTORY__.create(window.__TYPES__.ProductType.SPREADJS) 创建适配器')
  console.log('  - 使用 window.__TYPES__.ProductType 查看产品类型枚举')
}

dayjs.locale('zh-cn')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <App />
    </ConfigProvider>
  </React.StrictMode>,
)
