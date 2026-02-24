# SpreadJS 性能对比测试平台

基于 React + TypeScript + Vite 构建的 SpreadJS 性能对比测试平台，用于自动化测试和可视化对比 6 个主流表格库的性能表现。

## 支持的产品

- ✅ **SpreadJS** - GrapeCity 企业级表格控件
- ✅ **Univer** - 开源企业级表格方案
- ✅ **Handsontable** - 流行的数据表格库
- ✅ **x-spreadsheet** - 轻量级 Web 表格
- ✅ **Luckysheet** - 在线表格编辑器
- ✅ **jSpreadsheet** - JavaScript 表格组件

## 技术栈

- **框架**: React 18.3+
- **语言**: TypeScript 5.0+
- **构建工具**: Vite 5.0+
- **UI 组件库**: Ant Design 5.0+
- **图表库**: Apache ECharts 5.5+
- **状态管理**: Zustand 4.0+
- **工具库**: lodash-es, dayjs, xlsx

## 项目结构

```
src/
├── main.tsx                 # 应用入口
├── App.tsx                  # 根组件
├── components/              # 展示层组件
│   ├── layout/             # 布局组件
│   ├── test-control/       # 测试控制组件
│   ├── product-display/    # 产品展示组件
│   └── results/            # 结果展示组件
├── pages/                   # 页面组件
├── stores/                  # 状态管理
├── services/               # 应用层服务
├── core/                   # 核心层
│   ├── adapters/          # 产品适配器
│   ├── executors/         # 测试执行器
│   └── types/             # 核心类型定义
├── types/                  # 类型定义
└── utils/                  # 工具函数
```

## 开始使用

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 快速验证 - 冒烟测试

快速验证所有产品的基本功能（无需 UI）：

```bash
# 运行冒烟测试（自动启动服务器）
npm run smoke-test

# 以有头模式运行（显示浏览器）
npm run smoke-test:headed
```

冒烟测试会：
- 自动测试所有 6 个产品
- 验证初始化和基本数据加载
- 生成测试报告
- 耗时约 2-3 分钟

详细说明请查看 [scripts/README.md](scripts/README.md)

## 功能特性

- ✅ 自动化性能测试
- ✅ 多产品并行对比（6 个产品）
- ✅ 实时性能监控
- ✅ 可视化结果展示
- ✅ 数据导出功能
- ✅ 冒烟测试 CLI 工具
- ✅ 完整的 E2E 自动化测试

## 测试场景

1. 数据加载性能
2. 滚动性能
3. 编辑性能
4. 公式计算性能
5. 渲染性能
6. 内存占用
7. Excel 导入性能

## 开发说明

项目已完成核心功能开发：
- ✅ 项目基础架构
- ✅ UI 界面布局
- ✅ 组件结构设计
- ✅ 状态管理框架
- ✅ 6 个产品适配器实现
- ✅ 测试引擎和执行器
- ✅ 自动化测试套件
- ✅ 冒烟测试 CLI 工具

## 测试命令

```bash
# 运行所有测试
npm test

# 运行冒烟测试（快速验证）
npm run smoke-test

# UI 模式运行测试
npm run test:ui

# 有头模式运行测试
npm run test:headed

# 调试模式
npm run test:debug

# 查看测试报告
npm run test:report
```

## 许可证

MIT
