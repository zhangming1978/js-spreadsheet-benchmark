import { test, expect } from '../fixtures/performance-test-page'

/**
 * 基础 UI 测试
 * 验证页面基本元素和交互功能
 */
test.describe('基础 UI 测试', () => {
  test('页面加载正常', async ({ performanceTestPage }) => {
    await performanceTestPage.goto()

    // 验证页面标题
    await expect(performanceTestPage.page).toHaveTitle(/SpreadJS 性能对比测试平台/)

    // 验证测试控制面板存在
    await expect(performanceTestPage.startTestButton).toBeVisible()
    await expect(performanceTestPage.smokeTestButton).toBeVisible()
    await expect(performanceTestPage.resetButton).toBeVisible()
  })

  test('测试场景选择功能', async ({ performanceTestPage }) => {
    await performanceTestPage.goto()

    // 选择不同的测试场景
    await performanceTestPage.selectScenario('数据加载性能')
    await performanceTestPage.page.waitForTimeout(500)

    await performanceTestPage.selectScenario('滚动性能')
    await performanceTestPage.page.waitForTimeout(500)

    // 验证场景选择成功
    await expect(performanceTestPage.scenarioSelect).toBeVisible()
  })

  test('数据规模选择功能', async ({ performanceTestPage }) => {
    await performanceTestPage.goto()

    // 选择数据规模
    await performanceTestPage.selectDataSize('1万行')
    await performanceTestPage.page.waitForTimeout(500)

    // 验证数据规模选择成功
    await expect(performanceTestPage.dataSizeSelect).toBeVisible()
  })

  test('产品选择功能', async ({ performanceTestPage }) => {
    await performanceTestPage.goto()

    // 取消所有产品选择
    await performanceTestPage.selectProduct('x-spreadsheet', false)
    await performanceTestPage.selectProduct('Luckysheet', false)
    await performanceTestPage.selectProduct('jSpreadsheet', false)

    // 选择 SpreadJS
    await performanceTestPage.selectProduct('SpreadJS', true)

    // 验证至少有一个产品被选中
    const spreadjsCheckbox = performanceTestPage.getProductCheckbox('SpreadJS')
    await expect(spreadjsCheckbox).toBeChecked()
  })

  test('自动测试开关功能', async ({ performanceTestPage }) => {
    await performanceTestPage.goto()

    // 关闭自动测试
    await performanceTestPage.toggleAutoTest(false)
    await performanceTestPage.page.waitForTimeout(500)

    // 开启自动测试
    await performanceTestPage.toggleAutoTest(true)
    await performanceTestPage.page.waitForTimeout(500)

    // 验证开关存在
    await expect(performanceTestPage.autoTestSwitch).toBeVisible()
  })
})
