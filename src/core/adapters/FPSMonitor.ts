/**
 * FPS 监控器
 * 用于实时监控帧率
 */
export class FPSMonitor {
  private fps: number = 60
  private frameCount: number = 0
  private lastTime: number = 0
  private rafId: number | null = null
  private isRunning: boolean = false

  /**
   * 启动 FPS 监控
   */
  start(): void {
    if (this.isRunning) return

    this.isRunning = true
    this.lastTime = performance.now()
    this.frameCount = 0
    this.loop()
  }

  /**
   * 停止 FPS 监控
   */
  stop(): void {
    this.isRunning = false
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  /**
   * 获取当前 FPS
   */
  getCurrentFPS(): number {
    return this.fps
  }

  /**
   * 监控循环
   */
  private loop = (): void => {
    if (!this.isRunning) return

    const currentTime = performance.now()
    this.frameCount++

    // 每秒更新一次 FPS
    if (currentTime >= this.lastTime + 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime))
      this.frameCount = 0
      this.lastTime = currentTime
    }

    this.rafId = requestAnimationFrame(this.loop)
  }
}
