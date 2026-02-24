import { test, expect } from '../fixtures/performance-test-page'

/**
 * 全产品数据加载测试
 * 验证所有6个产品都能正确加载指定数据规模
 */
test.describe('全产品数据加载测试', () => {
  test('测试所有6个产品加载10000行数据', async ({ performanceTestPage, page }) => {
    // 监听控制台消息以捕获数据加载日志
    const consoleMessages: string[] = []
    page.on('console', msg => {
      const text = msg.text()
      consoleMessages.push(text)
      if (text.includes('数据加载完成')) {
        console.log('捕获到日志:', text)
      }
    })

    await performanceTestPage.goto()

    // 配置测试参数
    await performanceTestPage.selectScenario('数据加载性能')
    await performanceTestPage.selectDataSize('1万行')
    await performanceTestPage.selectCooldownTime('3 秒')

    // 选择所有6个产品
    await performanceTestPage.selectProduct('SpreadJS', true)
    await performanceTestPage.selectProduct('Univer', true)
    await performanceTestPage.selectProduct('Handsontable', true)
    await performanceTestPage.selectProduct('x-spreadsheet', true)
    await performanceTestPage.selectProduct('Luckysheet', true)
    await performanceTestPage.selectProduct('jSpreadsheet', true)

    // 开始测试
    await performanceTestPage.clickStartTest()
    await performanceTestPage.confirmStartTest()

    // 等待测试完成（6个产品需要更长时间）
    await expect(performanceTestPage.startTestButton).toBeEnabled({ timeout: 900000 })

    // 验证测试结果
    const results = await performanceTestPage.getTestResults()
    console.log('全产品测试结果:', results)

    // 验证有6个产品的结果
    expect(results.length).toBeGreaterThanOrEqual(6)

    // 验证每个产品都有执行时间（不是0ms或空）
    const productResults = results.filter(r =>
      r.product === 'SpreadJS' ||
      r.product === 'Univer' ||
      r.product === 'Handsontable' ||
      r.product === 'x-spreadsheet' ||
      r.product === 'Luckysheet' ||
      r.product === 'jSpreadsheet'
    )

    console.log('产品结果:', productResults)

    // 验证每个产品都有结果
    expect(productResults.length).toBe(6)

    // 验证每个产品的执行时间不为空
    productResults.forEach(result => {
      expect(result.executionTime).toBeTruthy()
      console.log(`${result.product}: ${result.executionTime}`)
    })

    // 验证每个产品的数据加载日志
    const productNames = ['SpreadJS', 'Univer', 'Handsontable', 'x-spreadsheet', 'Luckysheet', 'jSpreadsheet']
    const adapterNames = ['SpreadJSAdapter', 'UniverAdapter', 'HandsontableAdapter', 'XSpreadsheetAdapter', 'LuckysheetAdapter', 'JSpreadsheetAdapter']

    productNames.forEach((productName, index) => {
      const adapterName = adapterNames[index]
      const loadDataLog = consoleMessages.find(msg =>
        msg.includes(`[${adapterName}] 数据加载完成`)
      )

      console.log(`${productName} 数据加载日志:`, loadDataLog)

      // 验证日志存在
      expect(loadDataLog).toBeTruthy()

      // 解析日志中的行数信息
      if (loadDataLog) {
        const match = loadDataLog.match(/请求 (\d+) 行, 实际加载 (\d+) 行/)
        if (match) {
          const requestedRows = parseInt(match[1])
          const loadedRows = parseInt(match[2])
          console.log(`${productName} - 请求加载: ${requestedRows} 行, 实际加载: ${loadedRows} 行`)

          // 验证实际加载的行数与请求的行数一致
          expect(loadedRows).toBe(requestedRows)

          // 验证加载了足够的数据（至少1000行）
          expect(loadedRows).toBeGreaterThanOrEqual(1000)
        }
      }
    })
  })
})
