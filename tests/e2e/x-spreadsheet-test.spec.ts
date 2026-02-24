import { test, expect } from '../fixtures/performance-test-page'

/**
 * x-spreadsheet 专项测试
 * 验证 x-spreadsheet 能正确加载和显示数据
 */
test.describe('x-spreadsheet 数据加载测试', () => {
  test('验证 x-spreadsheet 加载10000行数据', async ({ performanceTestPage, page }) => {
    // 监听控制台消息以捕获数据加载日志
    const consoleMessages: string[] = []
    page.on('console', msg => {
      const text = msg.text()
      consoleMessages.push(text)
      if (text.includes('XSpreadsheetAdapter')) {
        console.log('捕获到日志:', text)
      }
    })

    await performanceTestPage.goto()

    // 配置测试参数
    await performanceTestPage.selectScenario('数据加载性能')
    await performanceTestPage.selectDataSize('1万行')
    await performanceTestPage.selectCooldownTime('3 秒')

    // 只选择 x-spreadsheet
    await performanceTestPage.selectProduct('x-spreadsheet', true)
    await performanceTestPage.selectProduct('Luckysheet', false)
    await performanceTestPage.selectProduct('jSpreadsheet', false)

    // 开始测试
    await performanceTestPage.clickStartTest()
    await performanceTestPage.confirmStartTest()

    // 等待测试完成
    await expect(performanceTestPage.startTestButton).toBeEnabled({ timeout: 300000 })

    // 验证测试结果
    const results = await performanceTestPage.getTestResults()
    console.log('x-spreadsheet 测试结果:', results)

    // 验证有结果
    expect(results.length).toBeGreaterThan(0)

    // 查找 x-spreadsheet 的结果
    const xSpreadsheetResult = results.find(r => r.product === 'x-spreadsheet')
    expect(xSpreadsheetResult).toBeTruthy()
    console.log('x-spreadsheet 详细结果:', xSpreadsheetResult)

    // 验证执行时间不为空
    expect(xSpreadsheetResult?.executionTime).toBeTruthy()

    // 从控制台日志中查找数据加载验证信息
    const loadDataLog = consoleMessages.find(msg =>
      msg.includes('[XSpreadsheetAdapter] 数据加载完成')
    )
    console.log('数据加载日志:', loadDataLog)

    // 验证日志存在
    expect(loadDataLog).toBeTruthy()

    // 解析日志中的行数信息
    if (loadDataLog) {
      const match = loadDataLog.match(/请求 (\d+) 行, 实际加载 (\d+) 行/)
      if (match) {
        const requestedRows = parseInt(match[1])
        const loadedRows = parseInt(match[2])
        console.log(`请求加载: ${requestedRows} 行`)
        console.log(`实际加载: ${loadedRows} 行`)

        // 验证实际加载的行数与请求的行数一致
        expect(loadedRows).toBe(requestedRows)
        // 10,000 行数据 + 1 行表头 = 10,001 行
        expect(loadedRows).toBe(10001)
      }
    }
  })

  test('验证 x-spreadsheet 加载1000行数据', async ({ performanceTestPage, page }) => {
    // 监听控制台消息以捕获数据加载日志
    const consoleMessages: string[] = []
    page.on('console', msg => {
      const text = msg.text()
      consoleMessages.push(text)
      if (text.includes('XSpreadsheetAdapter')) {
        console.log('捕获到日志:', text)
      }
    })

    await performanceTestPage.goto()

    // 配置测试参数 - 使用较小的数据集
    await performanceTestPage.selectScenario('数据加载性能')
    await performanceTestPage.selectDataSize('1千行')
    await performanceTestPage.selectCooldownTime('3 秒')

    // 只选择 x-spreadsheet
    await performanceTestPage.selectProduct('x-spreadsheet', true)
    await performanceTestPage.selectProduct('Luckysheet', false)
    await performanceTestPage.selectProduct('jSpreadsheet', false)

    // 开始测试
    await performanceTestPage.clickStartTest()
    await performanceTestPage.confirmStartTest()

    // 等待测试完成
    await expect(performanceTestPage.startTestButton).toBeEnabled({ timeout: 120000 })

    // 验证测试结果
    const results = await performanceTestPage.getTestResults()
    console.log('x-spreadsheet 1000行测试结果:', results)

    // 查找 x-spreadsheet 的结果
    const xSpreadsheetResult = results.find(r => r.product === 'x-spreadsheet')
    expect(xSpreadsheetResult).toBeTruthy()

    // 验证执行时间
    console.log('执行时间:', xSpreadsheetResult?.executionTime)
    expect(xSpreadsheetResult?.executionTime).toBeTruthy()

    // 从控制台日志中查找数据加载验证信息
    const loadDataLog = consoleMessages.find(msg =>
      msg.includes('[XSpreadsheetAdapter] 数据加载完成')
    )
    console.log('数据加载日志:', loadDataLog)

    // 验证日志存在
    expect(loadDataLog).toBeTruthy()

    // 解析日志中的行数信息
    if (loadDataLog) {
      const match = loadDataLog.match(/请求 (\d+) 行, 实际加载 (\d+) 行/)
      if (match) {
        const requestedRows = parseInt(match[1])
        const loadedRows = parseInt(match[2])
        console.log(`请求加载: ${requestedRows} 行`)
        console.log(`实际加载: ${loadedRows} 行`)

        // 验证实际加载的行数与请求的行数一致
        expect(loadedRows).toBe(requestedRows)
        // 1,000 行数据 + 1 行表头 = 1,001 行
        expect(loadedRows).toBe(1001)
      }
    }
  })
})
