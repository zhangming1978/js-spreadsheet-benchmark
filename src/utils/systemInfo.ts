/**
 * 系统信息采集工具
 * 用于收集浏览器、操作系统、硬件等环境信息
 */

export interface SystemInfo {
  browser: {
    name: string
    version: string
    userAgent: string
  }
  os: {
    name: string
    platform: string
  }
  hardware: {
    cpuCores: number
    memoryLimit: number // MB
    devicePixelRatio: number
  }
  screen: {
    width: number
    height: number
    availWidth: number
    availHeight: number
    colorDepth: number
  }
  network: {
    effectiveType?: string
    downlink?: number
    rtt?: number
  }
}

/**
 * 获取浏览器信息
 */
const getBrowserInfo = (): SystemInfo['browser'] => {
  const ua = navigator.userAgent
  let name = 'Unknown'
  let version = 'Unknown'

  // 检测浏览器类型
  if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) {
    name = 'Chrome'
    const match = ua.match(/Chrome\/(\d+\.\d+)/)
    version = match ? match[1] : 'Unknown'
  } else if (ua.indexOf('Edg') > -1) {
    name = 'Edge'
    const match = ua.match(/Edg\/(\d+\.\d+)/)
    version = match ? match[1] : 'Unknown'
  } else if (ua.indexOf('Firefox') > -1) {
    name = 'Firefox'
    const match = ua.match(/Firefox\/(\d+\.\d+)/)
    version = match ? match[1] : 'Unknown'
  } else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
    name = 'Safari'
    const match = ua.match(/Version\/(\d+\.\d+)/)
    version = match ? match[1] : 'Unknown'
  }

  return {
    name,
    version,
    userAgent: ua
  }
}

/**
 * 获取操作系统信息
 */
const getOSInfo = (): SystemInfo['os'] => {
  const ua = navigator.userAgent
  const platform = navigator.platform
  let name = 'Unknown'

  if (ua.indexOf('Win') > -1) {
    name = 'Windows'
    if (ua.indexOf('Windows NT 10.0') > -1) name = 'Windows 10/11'
    else if (ua.indexOf('Windows NT 6.3') > -1) name = 'Windows 8.1'
    else if (ua.indexOf('Windows NT 6.2') > -1) name = 'Windows 8'
    else if (ua.indexOf('Windows NT 6.1') > -1) name = 'Windows 7'
  } else if (ua.indexOf('Mac') > -1) {
    name = 'macOS'
  } else if (ua.indexOf('Linux') > -1) {
    name = 'Linux'
  } else if (ua.indexOf('Android') > -1) {
    name = 'Android'
  } else if (ua.indexOf('iOS') > -1 || ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) {
    name = 'iOS'
  }

  return {
    name,
    platform
  }
}

/**
 * 获取硬件信息
 */
const getHardwareInfo = (): SystemInfo['hardware'] => {
  const cpuCores = navigator.hardwareConcurrency || 0
  let memoryLimit = 0

  // 获取内存限制（仅 Chrome 支持）
  if ((performance as any).memory) {
    memoryLimit = Math.round((performance as any).memory.jsHeapSizeLimit / (1024 * 1024))
  }

  return {
    cpuCores,
    memoryLimit,
    devicePixelRatio: window.devicePixelRatio || 1
  }
}

/**
 * 获取屏幕信息
 */
const getScreenInfo = (): SystemInfo['screen'] => {
  return {
    width: screen.width,
    height: screen.height,
    availWidth: screen.availWidth,
    availHeight: screen.availHeight,
    colorDepth: screen.colorDepth
  }
}

/**
 * 获取网络信息
 */
const getNetworkInfo = (): SystemInfo['network'] => {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

  if (connection) {
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt
    }
  }

  return {}
}

/**
 * 获取完整的系统信息
 */
export const getSystemInfo = (): SystemInfo => {
  return {
    browser: getBrowserInfo(),
    os: getOSInfo(),
    hardware: getHardwareInfo(),
    screen: getScreenInfo(),
    network: getNetworkInfo()
  }
}

/**
 * 格式化系统信息为可读字符串
 */
export const formatSystemInfo = (info: SystemInfo): string => {
  const lines = [
    `浏览器: ${info.browser.name} ${info.browser.version}`,
    `操作系统: ${info.os.name} (${info.os.platform})`,
    `CPU 核心: ${info.hardware.cpuCores}`,
    `内存限制: ${info.hardware.memoryLimit} MB`,
    `设备像素比: ${info.hardware.devicePixelRatio}`,
    `屏幕分辨率: ${info.screen.width}x${info.screen.height}`,
    `可用分辨率: ${info.screen.availWidth}x${info.screen.availHeight}`,
    `颜色深度: ${info.screen.colorDepth} bit`
  ]

  if (info.network.effectiveType) {
    lines.push(`网络类型: ${info.network.effectiveType}`)
  }
  if (info.network.downlink) {
    lines.push(`下行速度: ${info.network.downlink} Mbps`)
  }
  if (info.network.rtt) {
    lines.push(`网络延迟: ${info.network.rtt} ms`)
  }

  return lines.join('\n')
}
