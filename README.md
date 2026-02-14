# SpreadJS 性能对比测试平台

基于 React + TypeScript + Vite 构建的 SpreadJS 性能对比测试平台，用于自动化测试和可视化对比 SpreadJS、Univer 和 Handsontable 的性能表现。

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

## 功能特性

- ✅ 自动化性能测试
- ✅ 多产品并行对比
- ✅ 实时性能监控
- ✅ 可视化结果展示
- ✅ 数据导出功能

## 测试场景

1. 数据加载性能
2. 滚动性能
3. 编辑性能
4. 公式计算性能
5. 渲染性能
6. 内存占用
7. Excel 导入性能

## 开发说明

当前版本为 UI 框架搭建阶段，已完成：
- ✅ 项目基础架构
- ✅ UI 界面布局
- ✅ 组件结构设计
- ✅ 状态管理框架
- ⏳ 业务逻辑实现（待开发）
- ⏳ 产品适配器实现（待开发）
- ⏳ 测试执行器实现（待开发）

## 许可证

MIT
