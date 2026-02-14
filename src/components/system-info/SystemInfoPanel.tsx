import { FC, useEffect, useState } from 'react'
import { Card, Descriptions, Tag } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import { getSystemInfo, type SystemInfo } from '@/utils/systemInfo'
import './SystemInfoPanel.css'

/**
 * 系统信息面板组件
 * 显示测试环境的详细信息
 */
const SystemInfoPanel: FC = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)

  useEffect(() => {
    setSystemInfo(getSystemInfo())
  }, [])

  if (!systemInfo) {
    return null
  }

  return (
    <Card
      className="system-info-panel"
      title={
        <span>
          <InfoCircleOutlined style={{ marginRight: 8 }} />
          测试环境信息
        </span>
      }
      size="small"
    >
      <Descriptions column={2} size="small" bordered>
        <Descriptions.Item label="浏览器">
          {systemInfo.browser.name} {systemInfo.browser.version}
        </Descriptions.Item>
        <Descriptions.Item label="操作系统">
          {systemInfo.os.name}
        </Descriptions.Item>
        <Descriptions.Item label="CPU 核心">
          {systemInfo.hardware.cpuCores} 核
        </Descriptions.Item>
        <Descriptions.Item label="内存限制">
          {systemInfo.hardware.memoryLimit > 0
            ? `${systemInfo.hardware.memoryLimit} MB`
            : '不可用'}
        </Descriptions.Item>
        <Descriptions.Item label="屏幕分辨率">
          {systemInfo.screen.width} × {systemInfo.screen.height}
        </Descriptions.Item>
        <Descriptions.Item label="设备像素比">
          {systemInfo.hardware.devicePixelRatio}x
        </Descriptions.Item>
        <Descriptions.Item label="颜色深度">
          {systemInfo.screen.colorDepth} bit
        </Descriptions.Item>
        <Descriptions.Item label="网络类型">
          {systemInfo.network.effectiveType ? (
            <Tag color="blue">{systemInfo.network.effectiveType}</Tag>
          ) : (
            '不可用'
          )}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  )
}

export default SystemInfoPanel
