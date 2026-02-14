import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import App from './App'
import './index.css'

// 开发环境下暴露 store 到 window 对象，方便调试
if (import.meta.env.DEV) {
  import('./stores/useTestStore').then(({ useTestStore }) => {
    ;(window as any).__TEST_STORE__ = useTestStore
    console.log('🔧 开发工具已启用：')
    console.log('  - 使用 window.__TEST_STORE__.getState() 查看当前状态')
    console.log('  - 使用 window.__TEST_STORE__.setState({...}) 修改状态')
  })
}

dayjs.locale('zh-cn')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <App />
    </ConfigProvider>
  </React.StrictMode>,
)
