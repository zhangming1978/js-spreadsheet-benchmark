/**
 * 工具函数集合
 */

/**
 * 延迟函数
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 格式化数字
 */
export const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toFixed(decimals)
}

/**
 * 格式化内存大小
 */
export const formatMemory = (bytes: number): string => {
  const mb = bytes / (1024 * 1024)
  return `${formatNumber(mb)} MB`
}

/**
 * 生成随机数据
 */
export const generateRandomData = (rows: number, cols: number): any[][] => {
  const data: any[][] = []
  for (let i = 0; i < rows; i++) {
    const row: any[] = []
    for (let j = 0; j < cols; j++) {
      row.push(Math.floor(Math.random() * 1000))
    }
    data.push(row)
  }
  return data
}
