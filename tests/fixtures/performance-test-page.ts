import { test as base } from '@playwright/test'

/**
 * 测试页面对象
 * 封装常用的页面操作和选择器
 */
export class PerformanceTestPage {
  constructor(public page: any) {}

  // ==================== 选择器 ====================

  // 测试场景选择器
  get scenarioSelect() {
    return this.page.locator('.test-control-panel').getByRole('combobox').first()
  }

  // 数据规模选择器
  get dataSizeSelect() {
    return this.page.locator('.test-control-panel').getByRole('combobox').nth(1)
  }

  // 冷却时间选择器
  get cooldownTimeSelect() {
    return this.page.locator('.test-control-panel').getByRole('combobox').nth(2)
  }

  // 产品复选框
  getProductCheckbox(product: string) {
    return this.page.getByRole('checkbox', { name: product })
  }

  // 开始测试按钮
  get startTestButton() {
    return this.page.locator('.test-control-panel').getByRole('button', { name: '开始测试' })
  }

  // 停止按钮
  get stopButton() {
    return this.page.getByRole('button', { name: '停止' })
  }

  // 重置按钮
  get resetButton() {
    return this.page.getByRole('button', { name: '重置' })
  }

  // ==================== 操作方法 ====================

  /**
   * 导航到首页
   */
  async goto() {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' })
    // 等待测试控制面板加载
    await this.page.waitForSelector('.test-control-panel', { timeout: 30000 })
    await this.page.waitForTimeout(1000)
  }

  /**
   * 选择测试场景
   */
  async selectScenario(scenario: string) {
    // 点击 Select 容器而不是 input
    await this.page.locator('.test-control-panel .ant-select').first().click()
    await this.page.waitForTimeout(300)
    await this.page.getByText(scenario, { exact: false }).first().click()
    await this.page.waitForTimeout(300)
  }

  /**
   * 选择数据规模
   */
  async selectDataSize(size: string) {
    await this.page.locator('.test-control-panel .ant-select').nth(1).click()
    await this.page.waitForTimeout(300)
    await this.page.getByText(size, { exact: false }).first().click()
    await this.page.waitForTimeout(300)
  }

  /**
   * 选择冷却时间
   */
  async selectCooldownTime(time: string) {
    await this.page.locator('.test-control-panel .ant-select').nth(2).click()
    await this.page.waitForTimeout(300)
    await this.page.getByText(time, { exact: true }).first().click()
    await this.page.waitForTimeout(300)
  }

  /**
   * 选择产品
   */
  async selectProduct(product: string, checked: boolean = true) {
    const checkbox = this.getProductCheckbox(product)
    const isChecked = await checkbox.isChecked()

    // 如果状态不匹配，点击切换
    if (checked !== isChecked) {
      await checkbox.click({ force: true })
      await this.page.waitForTimeout(500)
    }
  }

  /**
   * 点击开始测试
   */
  async clickStartTest() {
    await this.startTestButton.click()
  }

  /**
   * 确认开始测试（处理警告对话框）
   */
  async confirmStartTest() {
    // 等待警告对话框出现
    await this.page.waitForSelector('.ant-modal', { timeout: 5000 })

    // 点击确定按钮
    await this.page.getByRole('button', { name: /我已了解/ }).click()
  }

  /**
   * 等待测试完成
   */
  async waitForTestComplete(timeout: number = 300000) {
    // 等待测试完成的标志（例如：停止按钮变为禁用状态）
    await this.page.waitForFunction(
      () => {
        const stopBtn = document.querySelector('button[disabled]') as HTMLButtonElement
        return stopBtn && stopBtn.textContent?.includes('停止')
      },
      { timeout }
    )
  }

  /**
   * 获取测试结果
   */
  async getTestResults() {
    // 等待结果面板出现
    await this.page.waitForSelector('.results-panel', { timeout: 10000 })

    // 提取结果数据
    const results = await this.page.evaluate(() => {
      const rows = document.querySelectorAll('.results-panel table tbody tr')
      return Array.from(rows).map(row => {
        const cells = row.querySelectorAll('td')
        return {
          product: cells[0]?.textContent?.trim(),
          executionTime: cells[1]?.textContent?.trim(),
          fps: cells[2]?.textContent?.trim(),
          memory: cells[3]?.textContent?.trim()
        }
      })
    })

    return results
  }

  /**
   * 点击重置
   */
  async clickReset() {
    await this.resetButton.click()
  }
}

/**
 * 扩展的测试 fixture
 */
export const test = base.extend<{ performanceTestPage: PerformanceTestPage }>({
  performanceTestPage: async ({ page }, use) => {
    const performanceTestPage = new PerformanceTestPage(page)
    await use(performanceTestPage)
  }
})

export { expect } from '@playwright/test'
