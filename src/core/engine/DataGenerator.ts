/**
 * 测试数据生成器
 * 生成不同规模和类型的测试数据
 */
export class DataGenerator {
  /**
   * 生成表格数据
   * @param rows - 行数
   * @param cols - 列数
   * @returns 二维数组数据
   */
  static generateTableData(rows: number, cols: number = 10): any[][] {
    const data: any[][] = []

    // 生成表头
    const headers: any[] = []
    for (let c = 0; c < cols; c++) {
      headers.push(`列${c + 1}`)
    }
    data.push(headers)

    // 生成数据行
    for (let r = 1; r <= rows; r++) {
      const row: any[] = []
      for (let c = 0; c < cols; c++) {
        // 混合不同类型的数据
        if (c === 0) {
          row.push(`行${r}`)
        } else if (c % 3 === 0) {
          row.push(Math.random() * 1000)
        } else if (c % 3 === 1) {
          row.push(new Date(2024, 0, r % 28 + 1).toLocaleDateString())
        } else {
          row.push(`数据${r}-${c}`)
        }
      }
      data.push(row)
    }

    return data
  }

  /**
   * 生成公式数据
   * @param rows - 行数
   * @param cols - 列数
   * @returns 包含公式的二维数组数据
   */
  static generateFormulaData(rows: number, cols: number = 10): any[][] {
    const data: any[][] = []

    // 生成表头
    const headers: any[] = []
    for (let c = 0; c < cols; c++) {
      headers.push(`列${c + 1}`)
    }
    data.push(headers)

    // 生成数据行
    for (let r = 1; r <= rows; r++) {
      const row: any[] = []
      for (let c = 0; c < cols; c++) {
        if (c === 0) {
          row.push(r)
        } else if (c === 1) {
          row.push(r * 10)
        } else if (c === 2) {
          // 简单公式：A列 + B列
          row.push(`=A${r + 1}+B${r + 1}`)
        } else if (c === 3) {
          // 求和公式
          row.push(`=SUM(A${r + 1}:B${r + 1})`)
        } else {
          row.push(Math.random() * 100)
        }
      }
      data.push(row)
    }

    return data
  }

  /**
   * 生成随机数据
   * @param rows - 行数
   * @param cols - 列数
   * @returns 随机数据
   */
  static generateRandomData(rows: number, cols: number = 10): any[][] {
    const data: any[][] = []

    for (let r = 0; r < rows; r++) {
      const row: any[] = []
      for (let c = 0; c < cols; c++) {
        row.push(Math.random() * 1000)
      }
      data.push(row)
    }

    return data
  }
}
