import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright 配置文件
 * 用于 SpreadJS 性能测试网站的自动化测试
 */
export default defineConfig({
  // 测试目录
  testDir: './tests',

  // 测试匹配模式
  testMatch: '**/*.spec.ts',

  // 最大失败次数
  maxFailures: 0,

  // 全局超时时间（30分钟）
  globalTimeout: 30 * 60 * 1000,

  // 单个测试超时时间（5分钟）
  timeout: 5 * 60 * 1000,

  // 期望超时时间
  expect: {
    timeout: 10000
  },

  // 失败时重试次数
  retries: 0,

  // 并行执行的 worker 数量
  workers: 1,

  // 报告器配置
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],

  // 使用选项
  use: {
    // 基础 URL
    baseURL: 'http://localhost:3004',

    // 浏览器上下文选项
    viewport: { width: 1920, height: 1080 },

    // 截图设置
    screenshot: 'only-on-failure',

    // 视频设置
    video: 'retain-on-failure',

    // 追踪设置
    trace: 'retain-on-failure',

    // 操作超时
    actionTimeout: 30000,

    // 导航超时
    navigationTimeout: 60000
  },

  // 项目配置
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],

  // Web 服务器配置
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3004',
    reuseExistingServer: true,
    timeout: 120000
  }
})
