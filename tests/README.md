# Playwright 自动化测试

本项目使用 Playwright 进行端到端（E2E）自动化测试。

## 测试结构

```
tests/
├── e2e/                    # E2E 测试用例
│   ├── basic-ui.spec.ts    # 基础 UI 测试
│   ├── smoke-test.spec.ts  # 冒烟测试
│   └── performance-test.spec.ts  # 性能测试流程
├── fixtures/               # 测试 fixtures
│   └── performance-test-page.ts  # 页面对象模型
└── utils/                  # 测试工具函数
```

## 安装

Playwright 已经安装在项目中。如果需要重新安装浏览器：

```bash
npx playwright install
```

## 运行测试

### 运行所有测试
```bash
npm test
```

### 运行特定测试文件
```bash
npx playwright test tests/e2e/basic-ui.spec.ts
```

### 以 UI 模式运行（推荐用于调试）
```bash
npm run test:ui
```

### 以有头模式运行（显示浏览器窗口）
```bash
npm run test:headed
```

### 调试模式
```bash
npm run test:debug
```

### 查看测试报告
```bash
npm run test:report
```

## 测试用例说明

### 1. 基础 UI 测试 (basic-ui.spec.ts)

测试页面基本元素和交互功能：
- 页面加载验证
- 测试场景选择
- 数据规模选择
- 产品选择
- 自动测试开关

### 2. 冒烟测试 (smoke-test.spec.ts)

测试冒烟测试功能：
- 手动运行冒烟测试
- 自动冒烟测试功能
- 冒烟测试结果验证

### 3. 性能测试流程 (performance-test.spec.ts)

测试完整的性能测试流程：
- 完整的数据加载性能测试
- 测试停止功能
- 测试重置功能
- 多产品性能测试

## 配置

测试配置在 `playwright.config.ts` 文件中：

- **baseURL**: http://localhost:3004
- **timeout**: 5分钟（单个测试）
- **workers**: 1（串行执行）
- **retries**: 0（不重试）
- **browsers**: Chromium

## 页面对象模型 (POM)

使用 `PerformanceTestPage` 类封装页面操作：

```typescript
import { test, expect } from '../fixtures/performance-test-page'

test('示例测试', async ({ performanceTestPage }) => {
  await performanceTestPage.goto()
  await performanceTestPage.selectScenario('数据加载性能')
  await performanceTestPage.clickStartTest()
})
```

## 常用方法

### 页面导航
- `goto()` - 导航到首页

### 选择器
- `selectScenario(scenario)` - 选择测试场景
- `selectDataSize(size)` - 选择数据规模
- `selectCooldownTime(time)` - 选择冷却时间
- `selectProduct(product, checked)` - 选择/取消产品

### 操作
- `clickStartTest()` - 点击开始测试
- `confirmStartTest()` - 确认开始测试
- `clickSmokeTest()` - 点击冒烟测试
- `clickReset()` - 点击重置
- `toggleAutoTest(enabled)` - 切换自动测试开关

### 等待
- `waitForTestComplete(timeout)` - 等待测试完成
- `waitForSmokeTestComplete(timeout)` - 等待冒烟测试完成

### 结果
- `getTestResults()` - 获取测试结果

## 注意事项

1. **开发服务器**: 测试会自动启动开发服务器（`npm run dev`），无需手动启动
2. **超时时间**: 性能测试可能需要较长时间，已设置合理的超时时间
3. **并行执行**: 当前配置为串行执行（workers: 1），避免资源竞争
4. **失败重试**: 当前不重试失败的测试，确保测试结果准确

## 调试技巧

1. **使用 UI 模式**: `npm run test:ui` 提供可视化界面
2. **使用调试模式**: `npm run test:debug` 逐步执行测试
3. **查看截图**: 失败的测试会自动截图，保存在 `test-results/` 目录
4. **查看视频**: 失败的测试会录制视频，保存在 `test-results/` 目录
5. **查看追踪**: 失败的测试会生成追踪文件，可在报告中查看

## 持续集成

可以在 CI/CD 流程中运行测试：

```yaml
# GitHub Actions 示例
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install --with-deps

- name: Run tests
  run: npm test

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## 扩展测试

要添加新的测试用例：

1. 在 `tests/e2e/` 目录创建新的 `.spec.ts` 文件
2. 导入 fixture: `import { test, expect } from '../fixtures/performance-test-page'`
3. 编写测试用例
4. 运行测试验证

示例：

```typescript
import { test, expect } from '../fixtures/performance-test-page'

test.describe('新功能测试', () => {
  test('测试用例名称', async ({ performanceTestPage }) => {
    await performanceTestPage.goto()
    // 测试步骤
  })
})
```
