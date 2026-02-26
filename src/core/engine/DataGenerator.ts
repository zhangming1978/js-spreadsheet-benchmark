/**
 * 公式测试数据集
 * values: 纯值数组，公式格为 null
 * formulas: 公式数组，非公式格为空字符串
 */
export interface FormulaDataSet {
  values: any[][]
  formulas: string[][]
}

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
    console.log(`[DataGenerator] 生成表格数据: ${rows} 行 x ${cols} 列`)
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

    console.log(`[DataGenerator] 实际生成数据: ${data.length} 行 (包含表头)`)
    return data
  }

  /**
   * 生成公式数据
   * 使用纯四则运算构建多级依赖链，兼容所有电子表格库
   * @param rows - 行数
   * @returns FormulaDataSet: values（公式格为 null）和 formulas（非公式格为 ''）
   */
  static generateFormulaData(rows: number): FormulaDataSet {
    console.log(`[DataGenerator] 生成公式数据: ${rows} 行 x 10 列`)

    const headers = ['Val1', 'Val2', 'Add', 'Mul', 'Chain1', 'Sub', 'Div', 'Chain2', 'Rand1', 'Rand2']
    const headerValues = headers.map(() => null as any)
    const headerFormulas = headers.map(() => '')

    const values: any[][] = [headers.map(h => h)]  // 表头行：值就是表头字符串
    const formulas: string[][] = [headerFormulas]

    for (let r = 1; r <= rows; r++) {
      const sr = r + 1  // 电子表格行号（含表头偏移）
      const fC = `=A${sr}+B${sr}`
      const fD = `=A${sr}*B${sr}`
      const fE = `=C${sr}+D${sr}`
      const fF = `=C${sr}-A${sr}`
      const fG = `=D${sr}/2`
      const fH = `=E${sr}+F${sr}+G${sr}`
      const rand1 = Math.floor(Math.random() * 100)
      const rand2 = Math.floor(Math.random() * 100)

      values.push([r, r * 2, null, null, null, null, null, null, rand1, rand2])
      formulas.push(['', '', fC, fD, fE, fF, fG, fH, '', ''])
    }

    console.log(`[DataGenerator] 公式数据生成完成: ${values.length} 行`)
    return { values, formulas }
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
