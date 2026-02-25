# JS Spreadsheet Benchmark

> 电子表格库性能基准测试 · 开源 · 中立 · 可复现

一个基于 React + TypeScript + Vite 构建的开源性能基准测试工具，用于自动化测试和可视化对比主流 JavaScript 电子表格库的性能表现。

## 测试产品

| 产品 | 版本 | 类型 |
|------|------|------|
| [SpreadJS](https://developer.mescius.com/spreadjs) | v19.0.1 | 商业 |
| [Univer](https://univer.ai) | v0.15.5 | 开源 |
| [Handsontable](https://handsontable.com) | v16.2.0 | 商业/社区版 |
| [x-spreadsheet](https://github.com/myliang/x-spreadsheet) | v1.1.9 | 开源 |
| [Luckysheet](https://github.com/dream-num/Luckysheet) | v2.1.13 | 开源 |
| [jSpreadsheet CE](https://bossanova.uk/jspreadsheet) | v5.0.4 | 开源 |

## 测试场景

1. 数据加载性能（1k / 10k / 50k / 100k 行）
2. 滚动性能（FPS）
3. 编辑操作性能（单元格编辑、批量粘贴、自动填充）
4. 公式计算性能（SUM/AVERAGE、VLOOKUP/INDEX-MATCH）
5. 渲染性能（条件格式、图表）
6. 内存占用
7. Excel 文件导入性能

## 技术栈

- React 18 + TypeScript 5 + Vite 5
- Ant Design 5 · Apache ECharts 5 · Zustand 4
- Playwright（E2E 自动化测试）

## 快速开始

```bash
npm install
npm run dev
```


## 项目结构

```
src/
├── components/          # UI 组件
│   ├── layout/         # 布局
│   ├── test-control/   # 测试控制面板
│   ├── product-display/# 产品展示区
│   └── results/        # 结果图表
├── core/
│   ├── adapters/       # 各产品适配器（统一接口）
│   └── executors/      # 测试执行器
├── stores/             # 状态管理（Zustand）
└── types/              # 类型定义
```

## 测试命令

```bash
npm run smoke-test       # 快速冒烟测试（验证所有产品可用）
npm test                 # 完整 E2E 测试套件
npm run test:ui          # Playwright UI 模式
npm run test:report      # 查看测试报告
```

## 设计原则

- **中立**：所有产品使用相同测试数据和测试环境
- **透明**：测试代码完全开源，方法论公开
- **可复现**：任何人均可在本地运行并验证结果
- **可扩展**：通过适配器模式轻松添加新产品

## 贡献指南

欢迎提交 Issue 和 Pull Request：

- 新增产品适配器：参考 `src/core/adapters/` 中的现有实现
- 新增测试场景：在 `src/core/executors/` 中扩展
- 修复测试方法：请附上说明和参考资料

## 许可证

MIT
