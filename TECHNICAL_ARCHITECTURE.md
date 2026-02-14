# SpreadJS 性能对比 Demo - 技术架构设计

## 1. 架构概述

### 1.1 设计目标

- **模块化**:清晰的模块划分,便于维护和扩展
- **可扩展性**:易于添加新的测试场景和产品
- **高性能**:确保测试框架本身不影响测试结果
- **可靠性**:完善的错误处理和状态管理
- **可测试性**:便于单元测试和集成测试

### 1.2 技术栈选型

```javascript
{
  // 核心框架
  "framework": "React 18.3+",
  "language": "TypeScript 5.0+",
  "buildTool": "Vite 5.0+",

  // UI 组件库
  "uiLibrary": "Ant Design 5.0+",
  "styling": "CSS Modules + CSS Variables",

  // 图表库
  "charts": "Apache ECharts 5.5+",

  // 状态管理
  "stateManagement": "Zustand 4.0+",

  // 测试产品
  "products": {
    "spreadjs": "@mescius/spread-sheets@17.2+",
    "univer": "@univerjs/core@0.2+",
    "handsontable": "handsontable@14.5+"
  },

  // 工具库
  "utilities": {
    "excelImport": "xlsx@0.18+",
    "dateTime": "dayjs@1.11+",
    "lodash": "lodash-es@4.17+"
  }
}
```

**选型理由**:

- **React 18**: 并发特性,更好的性能
- **TypeScript**: 类型安全,减少运行时错误
- **Vite**: 快速的开发服务器和构建工具
- **Ant Design**: 企业级 UI,组件丰富
- **ECharts**: 强大的图表能力,性能优秀
- **Zustand**: 轻量级状态管理,API 简洁

---

## 2. 系统架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        Presentation Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Control Panel│  │ Test Progress│  │ Results View │      │
│  │  Component   │  │  Component   │  │  Component   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Test Manager │  │ State Manager│  │ Data Manager │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                        Core Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Test Executor │  │Product Adapter│ │Metrics Collector│   │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Infrastructure Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ SpreadJS SDK │  │  Univer SDK  │  │Handsontable  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 模块职责

#### 2.2.1 Presentation Layer (表现层)

**职责**: UI 组件,用户交互

**主要组件**:
- `ControlPanel`: 测试控制面板
- `TestProgress`: 测试进度显示
- `ResultsView`: 结果展示
- `ChartView`: 图表可视化
- `ProductDisplay`: 产品并排展示

#### 2.2.2 Application Layer (应用层)

**职责**: 业务逻辑,流程控制

**主要模块**:
- `TestManager`: 测试流程管理
- `StateManager`: 全局状态管理
- `DataManager`: 测试数据管理
- `ReportGenerator`: 报告生成

#### 2.2.3 Core Layer (核心层)

**职责**: 核心功能实现

**主要模块**:
- `TestExecutor`: 测试执行引擎
- `ProductAdapter`: 产品适配器
- `MetricsCollector`: 性能指标收集
- `IsolationManager`: 产品隔离管理

#### 2.2.4 Infrastructure Layer (基础设施层)

**职责**: 第三方 SDK 集成

**主要模块**:
- SpreadJS SDK
- Univer SDK
- Handsontable SDK

---

## 3. 核心模块设计

### 3.1 Test Manager (测试管理器)

**职责**: 统筹整个测试流程

```typescript
interface TestConfig {
  products: ProductType[];
  scenarios: TestScenario[];
  iterations: number; // 每个测试重复次数
  warmupRuns: number; // 预热次数
}

interface TestResult {
  productName: string;
  scenarioName: string;
  metrics: PerformanceMetrics;
  testData: any;
  timestamp: number;
  environment: EnvironmentInfo;
}

class TestManager {
  private executor: TestExecutor;
  private dataManager: TestDataManager;
  private isolationManager: ProductIsolationManager;
  private stateManager: StateManager;

  constructor() {
    this.executor = new TestExecutor();
    this.dataManager = new TestDataManager();
    this.isolationManager = new ProductIsolationManager();
    this.stateManager = useTestStore.getState();
  }

  /**
   * 执行完整的测试流程
   */
  async runTests(config: TestConfig): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // 更新状态: 测试开始
    this.stateManager.setTestStatus('running');

    try {
      // 遍历所有产品
      for (const product of config.products) {
        // 遍历所有测试场景
        for (const scenario of config.scenarios) {
          // 更新当前测试信息
          this.stateManager.setCurrentTest({
            product,
            scenario: scenario.name
          });

          // 执行单个产品的单个场景测试
          const result = await this.runSingleTest(
            product,
            scenario,
            config.iterations,
            config.warmupRuns
          );

          results.push(result);

          // 更新进度
          this.stateManager.updateProgress();
        }
      }

      // 测试完成
      this.stateManager.setTestStatus('completed');
      return results;

    } catch (error) {
      // 测试失败
      this.stateManager.setTestStatus('failed');
      this.stateManager.setError(error);
      throw error;
    }
  }

  /**
   * 执行单个产品的单个场景测试
   */
  private async runSingleTest(
    product: ProductType,
    scenario: TestScenario,
    iterations: number,
    warmupRuns: number
  ): Promise<TestResult> {
    // 1. 重置测试环境
    await this.isolationManager.resetEnvironment();

    // 2. 初始化产品实例
    const adapter = await this.executor.initProduct(product);

    // 3. 生成测试数据
    const testData = this.dataManager.generateTestData(scenario);

    // 4. 保存测试数据(用于后续展示)
    this.dataManager.saveTestData(product, scenario.name, testData);

    // 5. 预热
    for (let i = 0; i < warmupRuns; i++) {
      await this.executor.executeScenario(adapter, scenario, testData);
    }

    // 6. 正式测试(多次迭代)
    const metrics: PerformanceMetrics[] = [];
    for (let i = 0; i < iterations; i++) {
      const metric = await this.executor.executeScenario(
        adapter,
        scenario,
        testData
      );
      metrics.push(metric);

      // 更新实时指标
      this.stateManager.updateMetrics(product, metric);
    }

    // 7. 计算平均指标
    const avgMetrics = this.calculateAverageMetrics(metrics);

    // 8. 完全销毁实例
    await this.isolationManager.destroyProductCompletely(
      product,
      adapter.instance
    );

    // 9. 冷却期
    await this.isolationManager.cooldownPeriod();

    // 10. 返回结果
    return {
      productName: product,
      scenarioName: scenario.name,
      metrics: avgMetrics,
      testData: this.dataManager.getTestData(product, scenario.name),
      timestamp: Date.now(),
      environment: this.getEnvironmentInfo()
    };
  }

  /**
   * 计算平均指标
   */
  private calculateAverageMetrics(
    metrics: PerformanceMetrics[]
  ): PerformanceMetrics {
    const sum = metrics.reduce((acc, m) => ({
      duration: acc.duration + m.duration,
      fps: acc.fps + m.fps,
      memory: acc.memory + m.memory
    }), { duration: 0, fps: 0, memory: 0 });

    return {
      duration: sum.duration / metrics.length,
      fps: sum.fps / metrics.length,
      memory: sum.memory / metrics.length,
      min: Math.min(...metrics.map(m => m.duration)),
      max: Math.max(...metrics.map(m => m.duration)),
      stdDev: this.calculateStdDev(metrics.map(m => m.duration))
    };
  }

  /**
   * 计算标准差
   */
  private calculateStdDev(values: number[]): number {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map(value => Math.pow(value - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(avgSquareDiff);
  }

  /**
   * 获取测试环境信息
   */
  private getEnvironmentInfo(): EnvironmentInfo {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      memory: (performance as any).memory?.jsHeapSizeLimit || 0,
      cores: navigator.hardwareConcurrency || 0,
      timestamp: new Date().toISOString()
    };
  }
}
```

### 3.2 Product Adapter (产品适配器)

**职责**: 统一不同产品的 API 接口

```typescript
/**
 * 产品适配器接口
 * 所有产品适配器必须实现此接口
 */
interface IProductAdapter {
  // 产品信息
  readonly productName: string;
  readonly version: string;

  // 生命周期
  init(container: HTMLElement): Promise<void>;
  destroy(): Promise<void>;

  // 数据操作
  loadData(data: any): Promise<void>;
  getData(): any;
  clearData(): void;

  // 编辑操作
  setCellValue(row: number, col: number, value: any): void;
  getCellValue(row: number, col: number): any;
  setRangeValues(startRow: number, startCol: number, values: any[][]): void;
  autoFill(startRow: number, startCol: number, endRow: number, endCol: number): void;

  // 公式操作
  setFormula(row: number, col: number, formula: string): void;
  recalculate(): void;

  // 滚动操作
  scrollTo(row: number, col: number): void;
  getScrollPosition(): { row: number; col: number };

  // 性能监控
  getMemoryUsage(): number;
  getFPS(): number;

  // 实例引用
  instance: any;
}

/**
 * 适配器工厂
 */
class AdapterFactory {
  static create(productType: ProductType): IProductAdapter {
    switch (productType) {
      case 'SpreadJS':
        return new SpreadJSAdapter();
      case 'Univer':
        return new UniverAdapter();
      case 'Handsontable':
        return new HandsontableAdapter();
      default:
        throw new Error(`Unknown product type: ${productType}`);
    }
  }
}
```

**适配器实现示例** (SpreadJS):

```typescript
class SpreadJSAdapter implements IProductAdapter {
  readonly productName = 'SpreadJS';
  readonly version = '17.2';

  instance: GC.Spread.Sheets.Workbook | null = null;
  private sheet: GC.Spread.Sheets.Worksheet | null = null;
  private fpsMonitor: FPSMonitor | null = null;

  async init(container: HTMLElement): Promise<void> {
    this.instance = new GC.Spread.Sheets.Workbook(container, {
      sheetCount: 1,
      calcOnDemand: false
    });

    this.sheet = this.instance.getActiveSheet();
    this.fpsMonitor = new FPSMonitor(container);

    await this.waitForReady();
  }

  async loadData(data: any[][]): Promise<void> {
    if (!this.sheet) throw new Error('Sheet not initialized');
    this.sheet.setArray(0, 0, data);
  }

  setCellValue(row: number, col: number, value: any): void {
    if (!this.sheet) throw new Error('Sheet not initialized');
    this.sheet.setValue(row, col, value);
  }

  autoFill(startRow: number, startCol: number, endRow: number, endCol: number): void {
    if (!this.sheet) throw new Error('Sheet not initialized');

    const range = new GC.Spread.Sheets.Range(startRow, startCol, 1, 1);
    const fillRange = new GC.Spread.Sheets.Range(
      startRow, startCol,
      endRow - startRow + 1,
      endCol - startCol + 1
    );

    this.sheet.fillAuto(range, fillRange, {
      fillType: GC.Spread.Sheets.Fill.FillType.auto
    });
  }

  // ... 其他方法实现
}
```

### 3.3 Test Executor (测试执行器)

**职责**: 执行具体的测试场景

```typescript
interface TestScenario {
  name: string;
  type: 'data-loading' | 'scrolling' | 'editing' | 'formula' | 'rendering' | 'memory' | 'excel-import';
  config: any;
}

interface PerformanceMetrics {
  duration: number;  // 执行时间 (ms)
  fps?: number;      // 帧率
  memory?: number;   // 内存占用 (bytes)
  min?: number;      // 最小值
  max?: number;      // 最大值
  stdDev?: number;   // 标准差
}

class TestExecutor {
  /**
   * 初始化产品实例
   */
  async initProduct(productType: ProductType): Promise<IProductAdapter> {
    // 创建隔离容器
    const container = document.createElement('div');
    container.id = `${productType}-test-container`;
    container.style.display = 'none'; // 测试时隐藏
    container.style.width = '1000px';
    container.style.height = '600px';
    document.body.appendChild(container);

    // 创建适配器
    const adapter = AdapterFactory.create(productType);

    // 初始化
    await adapter.init(container);

    return adapter;
  }

  /**
   * 执行测试场景
   */
  async executeScenario(
    adapter: IProductAdapter,
    scenario: TestScenario,
    testData: any
  ): Promise<PerformanceMetrics> {
    switch (scenario.type) {
      case 'data-loading':
        return await this.testDataLoading(adapter, testData);

      case 'scrolling':
        return await this.testScrolling(adapter, testData);

      case 'editing':
        return await this.testEditing(adapter, scenario.config);

      case 'formula':
        return await this.testFormula(adapter, scenario.config);

      case 'rendering':
        return await this.testRendering(adapter, testData);

      case 'memory':
        return await this.testMemory(adapter, testData);

      case 'excel-import':
        return await this.testExcelImport(adapter, scenario.config.file);

      default:
        throw new Error(`Unknown scenario type: ${scenario.type}`);
    }
  }

  /**
   * 测试数据加载性能
   */
  private async testDataLoading(
    adapter: IProductAdapter,
    data: any[][]
  ): Promise<PerformanceMetrics> {
    const startTime = performance.now();
    const startMemory = adapter.getMemoryUsage();

    // 加载数据
    await adapter.loadData(data);

    const endTime = performance.now();
    const endMemory = adapter.getMemoryUsage();

    return {
      duration: endTime - startTime,
      memory: endMemory - startMemory
    };
  }

  /**
   * 测试滚动性能
   */
  private async testScrolling(
    adapter: IProductAdapter,
    data: any[][]
  ): Promise<PerformanceMetrics> {
    // 先加载数据
    await adapter.loadData(data);

    // 显示容器(滚动需要可见)
    const container = document.getElementById(`${adapter.productName}-test-container`);
    if (container) {
      container.style.display = 'block';
    }

    // 等待渲染完成
    await this.sleep(100);

    // 开始滚动测试
    const fps: number[] = [];
    const scrollSteps = 100;
    const rowsPerStep = Math.floor(data.length / scrollSteps);

    for (let i = 0; i < scrollSteps; i++) {
      const targetRow = i * rowsPerStep;

      // 记录滚动前的 FPS
      const fpsBeforeScroll = adapter.getFPS();

      // 执行滚动
      adapter.scrollTo(targetRow, 0);

      // 等待一帧
      await this.waitForFrame();

      // 记录滚动后的 FPS
      const fpsAfterScroll = adapter.getFPS();

      fps.push(fpsAfterScroll);
    }

    // 隐藏容器
    if (container) {
      container.style.display = 'none';
    }

    // 计算平均 FPS
    const avgFPS = fps.reduce((a, b) => a + b, 0) / fps.length;

    return {
      duration: 0, // 滚动测试不计时间
      fps: avgFPS
    };
  }

  /**
   * 测试编辑操作性能
   */
  private async testEditing(
    adapter: IProductAdapter,
    config: any
  ): Promise<PerformanceMetrics> {
    const { operation, count } = config;

    const startTime = performance.now();

    switch (operation) {
      case 'single-cell':
        // 单元格编辑
        for (let i = 0; i < count; i++) {
          adapter.setCellValue(i, 0, `Value ${i}`);
        }
        break;

      case 'batch-paste':
        // 批量粘贴
        const pasteData = Array(count).fill(null).map((_, i) =>
          Array(10).fill(null).map((_, j) => `Cell ${i},${j}`)
        );
        adapter.setRangeValues(0, 0, pasteData);
        break;

      case 'auto-fill':
        // 自动填充
        adapter.setCellValue(0, 0, 1);
        adapter.autoFill(0, 0, count - 1, 0);
        break;
    }

    const endTime = performance.now();

    return {
      duration: endTime - startTime
    };
  }

  /**
   * 测试公式计算性能
   */
  private async testFormula(
    adapter: IProductAdapter,
    config: any
  ): Promise<PerformanceMetrics> {
    const { formulaType, count } = config;

    // 准备数据
    const data = Array(count).fill(null).map((_, i) => [i + 1, i + 2]);
    await adapter.loadData(data);

    const startTime = performance.now();

    // 设置公式
    for (let i = 0; i < count; i++) {
      let formula = '';
      switch (formulaType) {
        case 'simple':
          formula = `=A${i + 1}+B${i + 1}`;
          break;
        case 'complex':
          formula = `=SUM(A${i + 1}:B${i + 1})*2+AVERAGE(A1:A${i + 1})`;
          break;
        case 'volatile':
          formula = `=RAND()*A${i + 1}`;
          break;
      }
      adapter.setFormula(i, 2, formula);
    }

    // 触发重算
    adapter.recalculate();

    const endTime = performance.now();

    return {
      duration: endTime - startTime
    };
  }

  /**
   * 测试渲染性能
   */
  private async testRendering(
    adapter: IProductAdapter,
    data: any[][]
  ): Promise<PerformanceMetrics> {
    // 显示容器
    const container = document.getElementById(`${adapter.productName}-test-container`);
    if (container) {
      container.style.display = 'block';
    }

    const startTime = performance.now();

    // 加载数据并等待渲染
    await adapter.loadData(data);

    // 等待渲染完成
    await this.waitForFrame();
    await this.waitForFrame();

    const endTime = performance.now();

    // 隐藏容器
    if (container) {
      container.style.display = 'none';
    }

    return {
      duration: endTime - startTime
    };
  }

  /**
   * 测试内存占用
   */
  private async testMemory(
    adapter: IProductAdapter,
    data: any[][]
  ): Promise<PerformanceMetrics> {
    const startMemory = adapter.getMemoryUsage();

    // 加载数据
    await adapter.loadData(data);

    // 等待内存稳定
    await this.sleep(500);

    const endMemory = adapter.getMemoryUsage();

    return {
      duration: 0,
      memory: endMemory - startMemory
    };
  }

  /**
   * 测试 Excel 导入性能
   */
  private async testExcelImport(
    adapter: IProductAdapter,
    file: File
  ): Promise<PerformanceMetrics> {
    const startTime = performance.now();

    // 读取 Excel 文件
    const data = await this.readExcelFile(file);

    // 加载到产品中
    await adapter.loadData(data);

    const endTime = performance.now();

    return {
      duration: endTime - startTime
    };
  }

  /**
   * 读取 Excel 文件
   */
  private async readExcelFile(file: File): Promise<any[][]> {
    const XLSX = await import('xlsx');

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          resolve(jsonData as any[][]);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = reject;
      reader.readAsBinaryString(file);
    });
  }

  /**
   * 等待一帧
   */
  private waitForFrame(): Promise<void> {
    return new Promise(resolve => {
      requestAnimationFrame(() => resolve());
    });
  }

  /**
   * 延迟
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 3.4 Metrics Collector (指标收集器)

**职责**: 收集和计算性能指标

```typescript
/**
 * FPS 监控器
 */
class FPSMonitor {
  private fps: number = 0;
  private frameCount: number = 0;
  private lastTime: number = 0;
  private rafId: number | null = null;

  constructor(private container: HTMLElement) {
    this.start();
  }

  start(): void {
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.loop();
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  getCurrentFPS(): number {
    return this.fps;
  }

  private loop = (): void => {
    const currentTime = performance.now();
    this.frameCount++;

    // 每秒更新一次 FPS
    if (currentTime >= this.lastTime + 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.frameCount = 0;
      this.lastTime = currentTime;
    }

    this.rafId = requestAnimationFrame(this.loop);
  };
}

/**
 * 性能指标收集器
 */
class MetricsCollector {
  /**
   * 收集浏览器性能指标
   */
  static collectBrowserMetrics(): BrowserMetrics {
    const memory = (performance as any).memory;

    return {
      // 内存信息
      usedJSHeapSize: memory?.usedJSHeapSize || 0,
      totalJSHeapSize: memory?.totalJSHeapSize || 0,
      jsHeapSizeLimit: memory?.jsHeapSizeLimit || 0,

      // 导航时间
      navigationTiming: performance.timing ? {
        domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart
      } : null,

      // 资源时间
      resourceTiming: performance.getEntriesByType('resource').map(entry => ({
        name: entry.name,
        duration: entry.duration,
        size: (entry as any).transferSize || 0
      }))
    };
  }

  /**
   * 计算统计指标
   */
  static calculateStatistics(values: number[]): Statistics {
    if (values.length === 0) {
      return { mean: 0, median: 0, min: 0, max: 0, stdDev: 0 };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const min = sorted[0];
    const max = sorted[sorted.length - 1];

    // 计算标准差
    const squareDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(avgSquareDiff);

    return { mean, median, min, max, stdDev };
  }

  /**
   * 格式化性能指标
   */
  static formatMetrics(metrics: PerformanceMetrics): FormattedMetrics {
    return {
      duration: `${metrics.duration.toFixed(2)} ms`,
      fps: metrics.fps ? `${metrics.fps.toFixed(1)} FPS` : 'N/A',
      memory: metrics.memory ? `${(metrics.memory / 1024 / 1024).toFixed(2)} MB` : 'N/A',
      min: metrics.min ? `${metrics.min.toFixed(2)} ms` : 'N/A',
      max: metrics.max ? `${metrics.max.toFixed(2)} ms` : 'N/A',
      stdDev: metrics.stdDev ? `${metrics.stdDev.toFixed(2)} ms` : 'N/A'
    };
  }
}
```



### 3.5 State Management (状态管理)

**职责**: 管理全局应用状态

```typescript
import { create } from 'zustand';

interface TestState {
  status: 'idle' | 'running' | 'completed' | 'failed';
  currentTest: { product: ProductType | null; scenario: string | null; };
  progress: { current: number; total: number; percentage: number; };
  results: Map<string, TestResult>;
  liveMetrics: Map<string, PerformanceMetrics>;
  error: Error | null;

  // Actions
  setTestStatus: (status: TestState['status']) => void;
  setCurrentTest: (test: TestState['currentTest']) => void;
  updateProgress: () => void;
  addResult: (key: string, result: TestResult) => void;
  updateMetrics: (product: string, metrics: PerformanceMetrics) => void;
  setError: (error: Error | null) => void;
  reset: () => void;
}

export const useTestStore = create<TestState>((set, get) => ({
  status: 'idle',
  currentTest: { product: null, scenario: null },
  progress: { current: 0, total: 0, percentage: 0 },
  results: new Map(),
  liveMetrics: new Map(),
  error: null,

  setTestStatus: (status) => set({ status }),
  setCurrentTest: (currentTest) => set({ currentTest }),
  updateProgress: () => set((state) => {
    const current = state.progress.current + 1;
    const percentage = (current / state.progress.total) * 100;
    return { progress: { ...state.progress, current, percentage } };
  }),
  addResult: (key, result) => set((state) => {
    const newResults = new Map(state.results);
    newResults.set(key, result);
    return { results: newResults };
  }),
  updateMetrics: (product, metrics) => set((state) => {
    const newMetrics = new Map(state.liveMetrics);
    newMetrics.set(product, metrics);
    return { liveMetrics: newMetrics };
  }),
  setError: (error) => set({ error }),
  reset: () => set({
    status: 'idle',
    currentTest: { product: null, scenario: null },
    progress: { current: 0, total: 0, percentage: 0 },
    results: new Map(),
    liveMetrics: new Map(),
    error: null
  })
}));
```

---

## 4. 数据流设计

### 4.1 测试执行流程

```
用户操作 → [ControlPanel] → [TestManager] → [TestExecutor] → [ProductAdapter] → 
[TestDataManager] → [TestExecutor] → [MetricsCollector] → [TestManager] → 
[StateManager] → [ResultsView]
```

### 4.2 数据保存与恢复流程

```
测试阶段:
[TestExecutor] → [TestDataManager] 保存数据 → [IsolationManager] 销毁实例

展示阶段:
[ResultsView] → [TestDataManager] 获取数据 → [ProductAdapter] 重新初始化 → 
[ProductAdapter] 加载数据 → [UI] 并排展示
```

---

## 5. 错误处理策略

```typescript
enum ErrorType {
  INITIALIZATION_ERROR = 'INITIALIZATION_ERROR',
  TEST_EXECUTION_ERROR = 'TEST_EXECUTION_ERROR',
  DATA_LOADING_ERROR = 'DATA_LOADING_ERROR',
  MEMORY_ERROR = 'MEMORY_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR'
}

class ErrorHandler {
  static handleTestError(error: Error, context: any): void {
    console.error('[TestError]', error);
    this.logError(error, context);
    useTestStore.getState().setError(error);
    this.showErrorMessage(error);
  }

  private static logError(error: Error, context: any): void {
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: { name: error.name, message: error.message, stack: error.stack },
      context,
      userAgent: navigator.userAgent
    };
    console.error('Error Log:', errorLog);
  }
}
```

---

## 6. 性能优化策略

### 6.1 React 组件优化

```typescript
import { memo, useMemo, useCallback } from 'react';

export const ProductCard = memo(({ product, metrics }: ProductCardProps) => {
  const formattedMetrics = useMemo(() => {
    return MetricsCollector.formatMetrics(metrics);
  }, [metrics]);

  const handleClick = useCallback(() => {
    console.log(`Clicked ${product}`);
  }, [product]);

  return (
    <div className="product-card" onClick={handleClick}>
      <h3>{product}</h3>
      <div>{formattedMetrics.duration}</div>
    </div>
  );
});
```

### 6.2 内存管理

```typescript
class MemoryManager {
  static cleanup(): void {
    performance.clearMarks();
    performance.clearMeasures();
    if (window.gc && process.env.NODE_ENV === 'development') {
      window.gc();
    }
  }

  static monitorMemory(): void {
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
      const percentage = (usedMB / limitMB) * 100;
      
      if (percentage > 80) {
        console.warn('⚠️ High memory usage detected!');
      }
    }
  }
}
```

---

## 7. 类型定义

```typescript
type ProductType = 'SpreadJS' | 'Univer' | 'Handsontable';
type ScenarioType = 'data-loading' | 'scrolling' | 'editing' | 'formula' | 'rendering' | 'memory' | 'excel-import';

interface PerformanceMetrics {
  duration: number;
  fps?: number;
  memory?: number;
  min?: number;
  max?: number;
  stdDev?: number;
}

interface TestResult {
  productName: string;
  scenarioName: string;
  metrics: PerformanceMetrics;
  testData: any;
  timestamp: number;
  environment: EnvironmentInfo;
}

interface EnvironmentInfo {
  userAgent: string;
  platform: string;
  memory: number;
  cores: number;
  timestamp: string;
}
```

---

## 8. 项目结构

```
spreadjs-performance-demo/
├── src/
│   ├── core/                      # 核心层
│   │   ├── adapters/              # 产品适配器
│   │   │   ├── IProductAdapter.ts
│   │   │   ├── SpreadJSAdapter.ts
│   │   │   ├── UniverAdapter.ts
│   │   │   ├── HandsontableAdapter.ts
│   │   │   └── AdapterFactory.ts
│   │   ├── executor/              # 测试执行器
│   │   │   └── TestExecutor.ts
│   │   ├── metrics/               # 指标收集
│   │   │   ├── MetricsCollector.ts
│   │   │   └── FPSMonitor.ts
│   │   └── isolation/             # 产品隔离
│   │       └── ProductIsolationManager.ts
│   ├── application/               # 应用层
│   │   ├── TestManager.ts
│   │   ├── TestDataManager.ts
│   │   └── ErrorHandler.ts
│   ├── store/                     # 状态管理
│   │   └── testStore.ts
│   ├── components/                # UI 组件
│   │   ├── ControlPanel/
│   │   ├── TestProgress/
│   │   ├── ResultsView/
│   │   └── ChartView/
│   ├── types/                     # 类型定义
│   │   └── index.ts
│   ├── utils/                     # 工具函数
│   │   └── MemoryManager.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 9. 部署方案

### 9.1 构建配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2015',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'spreadjs': ['@mescius/spread-sheets'],
          'univer': ['@univerjs/core'],
          'handsontable': ['handsontable'],
          'charts': ['echarts']
        }
      }
    }
  }
});
```

### 9.2 部署流程

```bash
# 1. 安装依赖
npm install

# 2. 构建生产版本
npm run build

# 3. 部署到服务器
# 将 dist 目录部署到静态文件服务器
```

---

## 10. 总结

本技术架构设计确保了:

1. **模块化**: 清晰的分层架构,职责明确
2. **可扩展性**: 易于添加新产品和测试场景
3. **高性能**: 优化的测试框架,不影响测试结果
4. **可靠性**: 完善的错误处理和状态管理
5. **可维护性**: 规范的代码结构和文档

**下一步**:
- 实现核心模块
- 开发 UI 组件
- 编写单元测试
- 性能调优
