# 冒烟测试 CLI 工具

快速验证所有表格产品的基本功能，无需启动 UI 界面。

## 功能说明

冒烟测试会自动：
1. 启动开发服务器（如果未运行）
2. 依次测试所有 6 个产品
3. 验证每个产品的基本功能：
   - 初始化
   - 数据加载（100 行）
   - 基本渲染

## 使用方法

### 运行所有产品的冒烟测试

```bash
npm run smoke-test
```

### 以有头模式运行（显示浏览器窗口）

```bash
npm run smoke-test:headed
```

## 测试的产品

- ✅ SpreadJS
- ✅ Univer
- ✅ Handsontable
- ✅ x-spreadsheet
- ✅ Luckysheet
- ✅ jSpreadsheet

## 输出示例

```
Running 3 tests using 1 worker

  ✓ [chromium] › smoke-test.spec.ts:8:3 › 冒烟测试 › 手动运行冒烟测试 (6.3s)
  ✓ [chromium] › smoke-test.spec.ts:36:3 › 冒烟测试 › 自动冒烟测试功能 (2.2m)
  ✓ [chromium] › smoke-test.spec.ts:57:3 › 冒烟测试 › 冒烟测试结果验证 (6.2s)

  3 passed (2.4m)
```

## 测试结果

测试完成后会生成：
- 控制台输出：显示每个产品的测试结果
- HTML 报告：`playwright-report/index.html`
- JSON 结果：`test-results/results.json`

查看详细报告：
```bash
npm run test:report
```

## 故障排查

### 端口冲突
如果端口 3004 被占用，测试会失败。请先停止占用该端口的进程。

### 超时错误
如果测试超时，可能是：
1. 开发服务器启动慢
2. 产品初始化时间过长
3. 网络问题导致依赖加载慢

解决方法：
- 手动启动开发服务器：`npm run dev`
- 然后运行测试：`npm run smoke-test`

### 特定产品失败
查看详细错误信息：
```bash
npm run smoke-test:headed
```

这会显示浏览器窗口，可以看到具体哪个产品出错。

## 与完整测试的区别

| 特性 | 冒烟测试 | 完整测试 |
|------|---------|---------|
| 测试范围 | 基本功能验证 | 所有测试场景 |
| 数据规模 | 100 行 | 1000-10000 行 |
| 运行时间 | ~2-3 分钟 | ~5-10 分钟 |
| 用途 | 快速验证 | 完整性能测试 |

## 集成到 CI/CD

可以将冒烟测试集成到 CI/CD 流程中：

```yaml
# GitHub Actions 示例
- name: Run smoke tests
  run: npm run smoke-test

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: smoke-test-results
    path: playwright-report/
```

## 开发建议

在提交代码前运行冒烟测试，确保：
- 所有产品适配器正常工作
- 没有引入破坏性变更
- 基本功能完整

```bash
# 开发流程
git add .
npm run smoke-test  # 验证更改
git commit -m "feat: ..."
git push
```
