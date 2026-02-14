import { FC, useEffect, useState } from 'react'
import { Modal, Row, Col, Statistic, Progress, Card } from 'antd'
import { DashboardOutlined, ThunderboltOutlined, DatabaseOutlined } from '@ant-design/icons'
import { useTestStore } from '@/stores/useTestStore'
import './PerformanceMonitor.css'

/**
 * 实时性能指标监控组件（浮动对话框）
 * 只在测试运行时显示，显示当前测试的 FPS、内存使用等实时指标
 */
const PerformanceMonitor: FC = () => {
  const { isRunning, currentProduct } = useTestStore()
  const [fps, setFps] = useState<number>(0)
  const [memory, setMemory] = useState<number>(0)
  const [memoryLimit, setMemoryLimit] = useState<number>(0)

  useEffect(() => {
    if (!isRunning) {
      // 测试未运行时重置指标
      setFps(0)
      setMemory(0)
      return
    }

    // FPS 监控
    let frameCount = 0
    let lastTime = performance.now()
    let animationFrameId: number

    const measureFPS = () => {
      frameCount++
      const currentTime = performance.now()
      const elapsed = currentTime - lastTime

      // 每秒更新一次 FPS
      if (elapsed >= 1000) {
        const currentFps = Math.round((frameCount * 1000) / elapsed)
        setFps(currentFps)
        frameCount = 0
        lastTime = currentTime
      }

      animationFrameId = requestAnimationFrame(measureFPS)
    }

    animationFrameId = requestAnimationFrame(measureFPS)

    // 内存监控
    const memoryInterval = setInterval(() => {
      if ((performance as any).memory) {
        const memoryInfo = (performance as any).memory
        const usedMemory = memoryInfo.usedJSHeapSize / (1024 * 1024) // 转换为 MB
        const totalMemory = memoryInfo.jsHeapSizeLimit / (1024 * 1024) // 转换为 MB
        setMemory(Math.round(usedMemory))
        setMemoryLimit(Math.round(totalMemory))
      }
    }, 500) // 每 500ms 更新一次内存

    return () => {
      cancelAnimationFrame(animationFrameId)
      clearInterval(memoryInterval)
    }
  }, [isRunning])

  // 计算内存使用百分比
  const memoryPercent = memoryLimit > 0 ? Math.round((memory / memoryLimit) * 100) : 0

  // FPS 状态颜色
  const getFpsStatus = (fps: number): 'success' | 'normal' | 'exception' => {
    if (fps >= 50) return 'success'
    if (fps >= 30) return 'normal'
    return 'exception'
  }

  // 内存状态颜色
  const getMemoryStatus = (percent: number): 'success' | 'normal' | 'exception' => {
    if (percent < 60) return 'success'
    if (percent < 80) return 'normal'
    return 'exception'
  }

  return (
    <Modal
      title={
        <span>
          <DashboardOutlined style={{ marginRight: 8 }} />
          实时性能监控
          {currentProduct && <span style={{ marginLeft: 16, fontWeight: 'normal', fontSize: 14 }}>正在测试: <strong>{currentProduct}</strong></span>}
        </span>
      }
      open={isRunning}
      footer={null}
      closable={false}
      maskClosable={false}
      width={800}
      centered
      className="performance-monitor-modal"
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card className="metric-card" size="small">
            <Statistic
              title={
                <span>
                  <ThunderboltOutlined style={{ marginRight: 4 }} />
                  帧率 (FPS)
                </span>
              }
              value={fps}
              suffix="fps"
              valueStyle={{
                color: fps >= 50 ? '#3f8600' : fps >= 30 ? '#faad14' : '#cf1322',
                fontSize: '28px'
              }}
            />
            <Progress
              percent={Math.min(100, (fps / 60) * 100)}
              status={getFpsStatus(fps)}
              showInfo={false}
              strokeWidth={8}
            />
            <div className="metric-hint">
              {fps >= 50 && '流畅'}
              {fps >= 30 && fps < 50 && '一般'}
              {fps < 30 && '卡顿'}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12}>
          <Card className="metric-card" size="small">
            <Statistic
              title={
                <span>
                  <DatabaseOutlined style={{ marginRight: 4 }} />
                  内存使用
                </span>
              }
              value={memory}
              suffix={`MB / ${memoryLimit} MB`}
              valueStyle={{
                color: memoryPercent < 60 ? '#3f8600' : memoryPercent < 80 ? '#faad14' : '#cf1322',
                fontSize: '28px'
              }}
            />
            <Progress
              percent={memoryPercent}
              status={getMemoryStatus(memoryPercent)}
              showInfo={false}
              strokeWidth={8}
            />
            <div className="metric-hint">
              {memoryPercent < 60 && '正常'}
              {memoryPercent >= 60 && memoryPercent < 80 && '偏高'}
              {memoryPercent >= 80 && '过高'}
            </div>
          </Card>
        </Col>
      </Row>
    </Modal>
  )
}

export default PerformanceMonitor
