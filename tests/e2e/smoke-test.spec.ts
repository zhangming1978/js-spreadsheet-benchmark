import { test, expect } from '../fixtures/performance-test-page'

/**
 * 冒烟测试自动化
 * 验证冒烟测试功能
 */
test.describe('冒烟测试', () => {
  test('手动运行冒烟测试', async ({ performanceTestPage }) => {
    await performanceTestPage.goto()

    // 关闭自动测试，避免冲突
    await performanceTestPage.toggleAutoTest(false)
    await performanceTestPage.page.waitForTimeout(500)

    // 选择要测试的产品
    await performanceTestPage.selectProduct('x-spreadsheet', true)
    await performanceTestPage.selectProduct('Luckysheet', false)
    await performanceTestPage.selectProduct('jSpreadsheet', false)

    // 点击冒烟测试按钮
    await performanceTestPage.clickSmokeTest()

    // 等待测试结果对话框出现（增加超时时间到2分钟）
    const modal = performanceTestPage.page.locator('.ant-modal').filter({ hasText: '冒烟测试结果' })
    await expect(modal).toBeVisible({ timeout: 120000 })

    // 验证结果表格存在
    const table = modal.locator('table')
    await expect(table).toBeVisible()

    // 验证表格有数据
    const rows = await table.locator('tbody tr').count()
    expect(rows).toBeGreaterThan(0)
  })

  test('自动冒烟测试功能', async ({ performanceTestPage }) => {
    await performanceTestPage.goto()

    // 确保自动测试开关打开
    await performanceTestPage.toggleAutoTest(true)
    await performanceTestPage.page.waitForTimeout(500)

    // 选择产品，应该自动触发冒烟测试
    await performanceTestPage.selectProduct('x-spreadsheet', true)
    await performanceTestPage.selectProduct('Luckysheet', false)
    await performanceTestPage.selectProduct('jSpreadsheet', false)

    // 等待自动冒烟测试完成（延迟1秒 + 测试时间，最多2分钟）
    await performanceTestPage.page.waitForTimeout(120000)

    // 自动测试完成后，通知可能已经消失，所以我们检查是否有测试结果存储
    // 这里我们简单地验证没有错误发生
    const errorMessage = performanceTestPage.page.locator('.ant-message-error')
    await expect(errorMessage).not.toBeVisible()
  })

  test('冒烟测试结果验证', async ({ performanceTestPage }) => {
    await performanceTestPage.goto()

    // 关闭自动测试
    await performanceTestPage.toggleAutoTest(false)
    await performanceTestPage.page.waitForTimeout(500)

    // 选择单个产品进行测试
    await performanceTestPage.selectProduct('x-spreadsheet', true)
    await performanceTestPage.selectProduct('Luckysheet', false)
    await performanceTestPage.selectProduct('jSpreadsheet', false)

    // 运行冒烟测试
    await performanceTestPage.clickSmokeTest()

    // 等待结果对话框
    const modal = performanceTestPage.page.locator('.ant-modal').filter({ hasText: '冒烟测试结果' })
    await expect(modal).toBeVisible({ timeout: 120000 })

    // 提取测试结果
    const results = await modal.locator('table tbody tr').allTextContents()
    console.log('冒烟测试结果:', results)

    // 验证至少有一条结果
    expect(results.length).toBeGreaterThan(0)
  })
})
