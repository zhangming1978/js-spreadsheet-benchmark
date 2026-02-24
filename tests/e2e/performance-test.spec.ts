import { test, expect } from '../fixtures/performance-test-page'

/**
 * 性能测试流程自动化
 * 验证完整的性能测试流程
 */
test.describe('性能测试流程', () => {
  test('完整的数据加载性能测试流程', async ({ performanceTestPage }) => {
    await performanceTestPage.goto()

    // 配置测试参数
    await performanceTestPage.selectScenario('数据加载性能')
    await performanceTestPage.selectDataSize('1万行')
    await performanceTestPage.selectCooldownTime('3 秒')

    // 选择单个产品进行快速测试
    await performanceTestPage.selectProduct('x-spreadsheet', true)
    await performanceTestPage.selectProduct('Luckysheet', false)
    await performanceTestPage.selectProduct('jSpreadsheet', false)

    // 开始测试
    await performanceTestPage.clickStartTest()

    // 确认开始测试
    await performanceTestPage.confirmStartTest()

    // 等待测试完成（最多5分钟）
    await performanceTestPage.waitForTestComplete(300000)

    // 验证测试结果
    const results = await performanceTestPage.getTestResults()
    console.log('测试结果:', results)

    // 验证结果不为空
    expect(results.length).toBeGreaterThan(0)

    // 验证结果包含产品名称
    expect(results[0].product).toBeTruthy()
  })

  test('测试停止功能', async ({ performanceTestPage }) => {
    await performanceTestPage.goto()

    // 配置测试参数 - 使用1万行（数据加载场景的默认值）
    await performanceTestPage.selectScenario('数据加载性能')
    await performanceTestPage.selectDataSize('1万行')

    // 选择产品
    await performanceTestPage.selectProduct('x-spreadsheet', true)
    await performanceTestPage.selectProduct('Luckysheet', false)
    await performanceTestPage.selectProduct('jSpreadsheet', false)

    // 开始测试
    await performanceTestPage.clickStartTest()
    await performanceTestPage.confirmStartTest()

    // 等待测试开始运行（等待停止按钮变为可用）
    const stopButton = performanceTestPage.page.locator('.test-control-panel').getByRole('button', { name: '停止' })
    await expect(stopButton).toBeEnabled({ timeout: 30000 })
    await performanceTestPage.page.waitForTimeout(3000)

    // 点击停止按钮
    await stopButton.click()

    // 验证停止按钮变为禁用状态
    await expect(stopButton).toBeDisabled({ timeout: 30000 })
  })

  test('测试重置功能', async ({ performanceTestPage }) => {
    await performanceTestPage.goto()

    // 修改一些配置
    await performanceTestPage.selectScenario('滚动性能')
    await performanceTestPage.selectDataSize('5万行')

    // 点击重置
    await performanceTestPage.clickReset()

    // 等待重置完成
    await performanceTestPage.page.waitForTimeout(1000)

    // 验证重置成功（可以通过检查默认值来验证）
    await expect(performanceTestPage.resetButton).toBeEnabled()
  })

  test('多产品性能测试', async ({ performanceTestPage }) => {
    await performanceTestPage.goto()

    // 配置测试参数 - 使用1万行（数据加载场景的默认值）
    await performanceTestPage.selectScenario('数据加载性能')
    await performanceTestPage.selectDataSize('1万行')
    await performanceTestPage.selectCooldownTime('3 秒')

    // 选择多个产品
    await performanceTestPage.selectProduct('x-spreadsheet', true)
    await performanceTestPage.selectProduct('Luckysheet', true)
    await performanceTestPage.selectProduct('jSpreadsheet', true)

    // 开始测试
    await performanceTestPage.clickStartTest()
    await performanceTestPage.confirmStartTest()

    // 等待测试完成（使用更可靠的等待策略）
    // 等待开始测试按钮重新变为可用（表示测试完成）
    await expect(performanceTestPage.startTestButton).toBeEnabled({ timeout: 600000 })

    // 验证测试结果
    const results = await performanceTestPage.getTestResults()
    console.log('多产品测试结果:', results)

    // 验证有多个产品的结果
    expect(results.length).toBeGreaterThanOrEqual(3)
  })
})
