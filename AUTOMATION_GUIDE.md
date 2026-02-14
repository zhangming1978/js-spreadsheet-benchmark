# 编辑操作性能测试自动化指南

## 概述

本文档详细说明如何实现编辑操作性能测试的**自动化执行**和**可视化展示**，确保测试过程无需人工干预，同时让用户能够直观地看到测试进行的过程。

---

## 1. 编辑操作测试项详解

### 1.1 单元格编辑响应时间

**测试目标**：测量单次单元格编辑从 API 调用到界面更新完成的时间

**自动化方案**：
```javascript
async function testCellEditResponse(adapter) {
  const iterations = 100;
  const times = [];

  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();

    // 调用 API 设置单元格值
    adapter.setValue(i, 0, `Test ${i}`);

    // 等待渲染完成（使用 requestAnimationFrame）
    await waitForNextFrame();

    const endTime = performance.now();
    times.push(endTime - startTime);
  }

  // 返回平均响应时间
  return times.reduce((a, b) => a + b) / times.length;
}

function waitForNextFrame() {
  return new Promise(resolve => requestAnimationFrame(resolve));
}
```

**可视化方案**：
- 在实时预览区显示正在编辑的单元格（高亮显示）
- 显示当前进度："正在测试单元格编辑 50/100"
- 显示实时响应时间："当前响应时间: 12ms"

---

### 1.2 批量数据粘贴

**测试目标**：测量一次性粘贴 1000 个单元格的性能

**自动化方案**：
```javascript
async function testBatchPaste(adapter) {
  // 准备测试数据（1000 个单元格 = 100 行 × 10 列）
  const data = [];
  for (let i = 0; i < 100; i++) {
    const row = [];
    for (let j = 0; j < 10; j++) {
      row.push(`Cell ${i},${j}`);
    }
    data.push(row);
  }

  const startTime = performance.now();

  // 模拟粘贴操作（使用批量设置 API）
  adapter.setRangeValues(0, 0, data);

  // 等待渲染完成
  await waitForRender();

  const endTime = performance.now();
  return endTime - startTime;
}

async function waitForRender() {
  // 等待多帧确保渲染完成
  await waitForNextFrame();
  await waitForNextFrame();
}
```

**可视化方案**：
- 在实时预览区高亮显示粘贴的区域（100 行 × 10 列）
- 显示粘贴动画效果（从左上到右下的填充动画）
- 显示进度："正在粘贴 1000 个单元格..."

---

### 1.3 批量数据填充（自动填充）

**测试目标**：测量自动填充 1000 个单元格的性能

**原需求问题**：原需求中的"拖拽填充"是用户交互动作，无法自动化

**改进方案**：改为"自动填充"，使用 API 模拟填充效果

**自动化方案**：
```javascript
async function testAutoFill(adapter) {
  // 设置初始序列（1, 2）
  adapter.setValue(0, 0, 1);
  adapter.setValue(1, 0, 2);

  const startTime = performance.now();

  // 执行自动填充（从 A1:A2 填充到 A1:A1000）
  // 这模拟了用户拖拽填充柄的效果
  await adapter.fillAuto({
    sourceRange: { row: 0, col: 0, rowCount: 2, colCount: 1 },
    targetRange: { row: 0, col: 0, rowCount: 1000, colCount: 1 }
  });

  await waitForRender();

  const endTime = performance.now();
  return endTime - startTime;
}
```

**可视化方案**：
- 在实时预览区显示填充动画
- 从源区域（A1:A2）开始，逐步向下扩展到 A1000
- 使用渐变色或动画效果展示填充过程
- 显示进度："正在自动填充 500/1000 单元格"

**API 适配说明**：

| 产品 | API 方法 | 说明 |
|------|---------|------|
| SpreadJS | `range.fillAuto(targetRange, fillType)` | 原生支持自动填充 |
| Univer | `univerAPI.executeCommand('sheet.command.auto-fill', params)` | 使用命令系统执行填充 |
| Handsontable | `hot.populateFromArray(row, col, data)` | 需要手动生成序列数据 |

---

### 1.4 批量单元格样式修改

**测试目标**：测量批量修改 1000 个单元格样式的性能

**自动化方案**：
```javascript
async function testBatchStyleChange(adapter) {
  // 准备样式对象
  const style = {
    backgroundColor: '#FFFF00',
    fontWeight: 'bold',
    fontSize: '14px'
  };

  const startTime = performance.now();

  // 批量设置样式（100 行 × 10 列）
  adapter.setRangeStyle(0, 0, 100, 10, style);

  await waitForRender();

  const endTime = performance.now();
  return endTime - startTime;
}
```

**可视化方案**：
- 在实时预览区显示样式变化动画
- 单元格逐渐变为黄色背景、粗体
- 显示进度："正在修改样式 600/1000 单元格"

---

### 1.5 撤销/重做操作

**测试目标**：测量连续 50 次撤销/重做操作的性能

**自动化方案**：
```javascript
async function testUndoRedo(adapter) {
  // 先执行 50 次编辑操作
  for (let i = 0; i < 50; i++) {
    adapter.setValue(i, 0, `Value ${i}`);
  }

  const undoTimes = [];
  const redoTimes = [];

  // 测试撤销
  for (let i = 0; i < 50; i++) {
    const startTime = performance.now();
    adapter.undo();
    await waitForNextFrame();
    const endTime = performance.now();
    undoTimes.push(endTime - startTime);
  }

  // 测试重做
  for (let i = 0; i < 50; i++) {
    const startTime = performance.now();
    adapter.redo();
    await waitForNextFrame();
    const endTime = performance.now();
    redoTimes.push(endTime - startTime);
  }

  return {
    undoAvg: undoTimes.reduce((a, b) => a + b) / undoTimes.length,
    redoAvg: redoTimes.reduce((a, b) => a + b) / redoTimes.length
  };
}
```

**可视化方案**：
- 显示撤销/重做的动画效果
- 单元格内容快速变化
- 显示进度："正在测试撤销 25/50"
- 显示实时响应时间

---

## 2. 统一适配器接口设计

为了确保三个产品能够使用相同的测试代码，需要设计统一的适配器接口：

```typescript
interface ISpreadsheetAdapter {
  // 基础操作
  setValue(row: number, col: number, value: any): void;
  getValue(row: number, col: number): any;

  // 批量操作
  setRangeValues(row: number, col: number, data: any[][]): void;
  getRangeValues(row: number, col: number, rowCount: number, colCount: number): any[][];

  // 自动填充
  fillAuto(options: {
    sourceRange: { row: number, col: number, rowCount: number, colCount: number },
    targetRange: { row: number, col: number, rowCount: number, colCount: number }
  }): Promise<void>;

  // 样式操作
  setRangeStyle(row: number, col: number, rowCount: number, colCount: number, style: any): void;

  // 撤销/重做
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;

  // 渲染控制
  suspendPaint(): void;  // 暂停渲染（提高批量操作性能）
  resumePaint(): void;   // 恢复渲染
}
```

---

## 3. 实时可视化实现方案

### 3.1 实时预览区域

```javascript
class TestPreviewPanel {
  constructor(containerElement) {
    this.container = containerElement;
    this.miniSpreadsheet = null; // 缩小版的表格实例
  }

  // 初始化预览区域
  init(product) {
    // 创建一个缩小版的表格实例（只显示部分区域）
    this.miniSpreadsheet = this.createMiniInstance(product);
  }

  // 高亮显示测试区域
  highlightRange(row, col, rowCount, colCount, color = '#FFD700') {
    const range = this.miniSpreadsheet.getRange(row, col, rowCount, colCount);
    range.setBorder({ color, style: 'thick' });
  }

  // 显示填充动画
  async animateFill(startRow, startCol, endRow, endCol) {
    for (let i = startRow; i <= endRow; i++) {
      this.highlightRange(i, startCol, 1, endCol - startCol + 1, '#90EE90');
      await sleep(10); // 10ms 延迟，创建动画效果
    }
  }

  // 显示当前操作
  showOperation(operationName, progress) {
    this.container.querySelector('.operation-name').textContent = operationName;
    this.container.querySelector('.operation-progress').textContent = progress;
  }
}
```

### 3.2 进度指示器

```javascript
class TestProgressIndicator {
  updateProductStatus(productName, status, time) {
    const statusElement = document.querySelector(`[data-product="${productName}"]`);

    switch(status) {
      case 'running':
        statusElement.innerHTML = `⟳ 进行中... (已用 ${time}ms)`;
        statusElement.className = 'status-running';
        break;
      case 'completed':
        statusElement.innerHTML = `✓ 完成 (${time}ms)`;
        statusElement.className = 'status-completed';
        break;
      case 'waiting':
        statusElement.innerHTML = `⏸ 等待中`;
        statusElement.className = 'status-waiting';
        break;
      case 'error':
        statusElement.innerHTML = `✗ 失败`;
        statusElement.className = 'status-error';
        break;
    }
  }

  updateOverallProgress(current, total) {
    const percentage = (current / total) * 100;
    const progressBar = document.querySelector('.progress-bar');
    progressBar.style.width = `${percentage}%`;
    progressBar.textContent = `${Math.round(percentage)}%`;
  }
}
```

### 3.3 测试日志

```javascript
class TestLogger {
  constructor(logContainer) {
    this.logContainer = logContainer;
    this.logs = [];
  }

  log(level, message) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      timestamp,
      level,
      message
    };

    this.logs.push(logEntry);

    // 添加到 DOM
    const logElement = document.createElement('div');
    logElement.className = `log-entry log-${level}`;
    logElement.innerHTML = `
      <span class="log-time">${timestamp}</span>
      <span class="log-level">[${level.toUpperCase()}]</span>
      <span class="log-message">${message}</span>
    `;

    this.logContainer.appendChild(logElement);

    // 自动滚动到底部
    this.logContainer.scrollTop = this.logContainer.scrollHeight;
  }

  info(message) { this.log('info', message); }
  warn(message) { this.log('warn', message); }
  error(message) { this.log('error', message); }

  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }
}
```

---

## 4. 完整测试流程示例

```javascript
class EditOperationTestSuite {
  constructor(products) {
    this.products = products; // ['SpreadJS', 'Univer', 'Handsontable']
    this.adapters = {};
    this.visualizer = new TestVisualizer();
    this.logger = new TestLogger(document.querySelector('.test-log'));
  }

  async runAllTests() {
    const testScenarios = [
      { name: '单元格编辑响应', fn: this.testCellEdit },
      { name: '批量数据粘贴', fn: this.testBatchPaste },
      { name: '批量数据填充', fn: this.testAutoFill },
      { name: '批量样式修改', fn: this.testBatchStyle },
      { name: '撤销/重做操作', fn: this.testUndoRedo }
    ];

    const results = {};

    for (const scenario of testScenarios) {
      this.logger.info(`开始测试：${scenario.name}`);
      results[scenario.name] = {};

      for (const product of this.products) {
        this.logger.info(`  测试产品：${product}`);
        this.visualizer.updateProductStatus(product, 'running', 0);

        try {
          const adapter = this.adapters[product];
          const result = await scenario.fn.call(this, adapter);

          results[scenario.name][product] = result;
          this.visualizer.updateProductStatus(product, 'completed', result);
          this.logger.info(`  ${product} 完成: ${result}ms`);
        } catch (error) {
          this.logger.error(`  ${product} 失败: ${error.message}`);
          this.visualizer.updateProductStatus(product, 'error', 0);
        }
      }
    }

    return results;
  }

  async testCellEdit(adapter) {
    // 实现细节见上文
  }

  async testBatchPaste(adapter) {
    // 实现细节见上文
  }

  async testAutoFill(adapter) {
    // 实现细节见上文
  }

  async testBatchStyle(adapter) {
    // 实现细节见上文
  }

  async testUndoRedo(adapter) {
    // 实现细节见上文
  }
}
```

---

## 5. 用户体验优化

### 5.1 测试速度控制

为了让用户能够看清测试过程，提供两种模式：

```javascript
class TestSpeedController {
  constructor() {
    this.mode = 'normal'; // 'fast' | 'normal' | 'slow'
  }

  async delay() {
    const delays = {
      fast: 0,      // 无延迟，最快速度
      normal: 50,   // 50ms 延迟，可以看清过程
      slow: 200     // 200ms 延迟，详细观察
    };

    await sleep(delays[this.mode]);
  }
}
```

### 5.2 可选的实时预览

由于实时预览会消耗额外性能，提供开关选项：

```html
<label>
  <input type="checkbox" id="enablePreview" checked>
  显示实时预览（可能影响测试性能）
</label>
```

### 5.3 测试结果对比动画

测试完成后，使用动画展示结果对比：

```javascript
function animateResults(results) {
  // 柱状图从 0 增长到实际值
  // 使用缓动函数创建平滑动画
  // 高亮显示最快的产品
}
```

---

## 6. 性能测试的准确性保证

### 6.1 预热机制

```javascript
async function warmup(adapter) {
  // 执行一些操作让 JIT 编译器优化代码
  for (let i = 0; i < 10; i++) {
    adapter.setValue(0, 0, i);
  }
  await sleep(100);
}
```

### 6.2 多次测试取平均值

```javascript
async function runMultipleTimes(testFn, times = 3) {
  const results = [];
  for (let i = 0; i < times; i++) {
    const result = await testFn();
    results.push(result);
    await sleep(100); // 每次测试之间的间隔
  }
  return results.reduce((a, b) => a + b) / results.length;
}
```

### 6.3 垃圾回收控制

```javascript
async function forceGC() {
  // 在测试前尝试触发垃圾回收
  if (window.gc) {
    window.gc(); // 需要 Chrome 启动参数 --expose-gc
  } else {
    // 创建大量临时对象触发 GC
    const temp = new Array(1000000).fill(0);
    await sleep(100);
  }
}
```

---

## 7. Excel 文件导入性能测试

### 7.1 测试目标

测量从用户选择 Excel 文件到完全加载并渲染完成的时间，包括：
- 文件读取时间
- 文件解析时间（Excel 格式解析）
- 数据渲染时间
- 总体导入时间

### 7.2 自动化方案

```javascript
async function testExcelImport(adapter, file) {
  const totalStartTime = performance.now();
  let parseStartTime, parseEndTime, renderStartTime;

  // 1. 读取文件
  const fileBuffer = await readFileAsArrayBuffer(file);
  const fileReadTime = performance.now() - totalStartTime;

  // 2. 解析 Excel 文件
  parseStartTime = performance.now();
  await adapter.importExcel(fileBuffer);
  parseEndTime = performance.now();
  const parseTime = parseEndTime - parseStartTime;

  // 3. 等待渲染完成
  renderStartTime = performance.now();
  await waitForRender();
  const renderTime = performance.now() - renderStartTime;

  // 4. 计算总时间
  const totalTime = performance.now() - totalStartTime;

  return {
    fileSize: file.size,
    fileName: file.name,
    fileReadTime,
    parseTime,
    renderTime,
    totalTime
  };
}

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
```

### 7.3 用户交互流程

```javascript
class ExcelImportTest {
  constructor() {
    this.fileInput = document.getElementById('excel-file-input');
    this.sampleFiles = {
      small: '/samples/small-1k-rows.xlsx',
      medium: '/samples/medium-10k-rows.xlsx',
      large: '/samples/large-50k-rows.xlsx'
    };
  }

  // 用户上传文件
  async handleUserUpload() {
    const file = this.fileInput.files[0];
    if (!file) {
      alert('请选择一个 Excel 文件');
      return;
    }

    if (!file.name.endsWith('.xlsx')) {
      alert('仅支持 .xlsx 格式的文件');
      return;
    }

    // 大文件警告（可选）
    if (file.size > 10 * 1024 * 1024) {
      const sizeInMB = (file.size / 1024 / 1024).toFixed(2);
      const confirmed = confirm(
        `您选择的文件较大（${sizeInMB} MB），导入可能需要较长时间，是否继续？`
      );
      if (!confirmed) return;
    }

    await this.runImportTest(file);
  }

  // 使用示例文件
  async handleSampleFile(size) {
    const url = this.sampleFiles[size];
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], `sample-${size}.xlsx`, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    await this.runImportTest(file);
  }

  async runImportTest(file) {
    // 显示文件信息
    this.showFileInfo(file);

    // 对三个产品分别测试
    const results = {};
    for (const product of ['SpreadJS', 'Univer', 'Handsontable']) {
      this.visualizer.updateProductStatus(product, 'running', 0);

      try {
        const adapter = this.adapters[product];
        const result = await testExcelImport(adapter, file);

        results[product] = result;
        this.visualizer.updateProductStatus(product, 'completed', result.totalTime);
        this.logger.info(`${product} 导入完成: ${result.totalTime}ms`);

        // 显示详细时间分解
        this.showTimeBreakdown(product, result);
      } catch (error) {
        this.logger.error(`${product} 导入失败: ${error.message}`);
        this.visualizer.updateProductStatus(product, 'error', 0);
      }
    }

    // 显示对比结果
    this.showComparisonChart(results);
  }

  showFileInfo(file) {
    const sizeInMB = (file.size / 1024 / 1024).toFixed(2);
    this.logger.info(`文件名: ${file.name}`);
    this.logger.info(`文件大小: ${sizeInMB} MB`);
  }

  showTimeBreakdown(product, result) {
    const breakdown = `
      文件读取: ${result.fileReadTime.toFixed(2)}ms
      文件解析: ${result.parseTime.toFixed(2)}ms
      数据渲染: ${result.renderTime.toFixed(2)}ms
      总计: ${result.totalTime.toFixed(2)}ms
    `;
    this.logger.info(`${product} 时间分解:\n${breakdown}`);
  }
}
```

### 7.4 可视化展示

```javascript
class ExcelImportVisualizer {
  // 显示导入进度
  showImportProgress(product, stage, progress) {
    const stages = {
      reading: '正在读取文件...',
      parsing: '正在解析 Excel...',
      rendering: '正在渲染数据...'
    };

    const statusElement = document.querySelector(`[data-product="${product}"]`);
    statusElement.innerHTML = `
      ⟳ ${stages[stage]} (${progress}%)
    `;
  }

  // 显示时间分解图表
  showTimeBreakdownChart(results) {
    // 使用堆叠柱状图显示各阶段时间
    const chartData = {
      categories: Object.keys(results),
      series: [
        {
          name: '文件读取',
          data: Object.values(results).map(r => r.fileReadTime)
        },
        {
          name: '文件解析',
          data: Object.values(results).map(r => r.parseTime)
        },
        {
          name: '数据渲染',
          data: Object.values(results).map(r => r.renderTime)
        }
      ]
    };

    this.renderStackedBarChart(chartData);
  }
}
```

### 7.5 示例文件准备

需要准备三个不同大小的示例 Excel 文件：

```javascript
// 生成示例文件的脚本（使用 Node.js + ExcelJS）
const ExcelJS = require('exceljs');

async function generateSampleFiles() {
  const sizes = [
    { name: 'small', rows: 1000, cols: 10 },
    { name: 'medium', rows: 10000, cols: 20 },
    { name: 'large', rows: 50000, cols: 50 }
  ];

  for (const size of sizes) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // 添加表头
    const headers = [];
    for (let i = 0; i < size.cols; i++) {
      headers.push(`Column ${i + 1}`);
    }
    worksheet.addRow(headers);

    // 添加数据
    for (let row = 0; row < size.rows; row++) {
      const rowData = [];
      for (let col = 0; col < size.cols; col++) {
        rowData.push(`Cell ${row},${col}`);
      }
      worksheet.addRow(rowData);
    }

    // 保存文件
    await workbook.xlsx.writeFile(`./samples/${size.name}-${size.rows}-rows.xlsx`);
    console.log(`Generated ${size.name} file`);
  }
}

generateSampleFiles();
```

### 7.6 API 适配

不同产品的 Excel 导入 API：

```javascript
// SpreadJS
class SpreadJSAdapter {
  async importExcel(fileBuffer) {
    const excelIO = new GC.Spread.Excel.IO();
    return new Promise((resolve, reject) => {
      excelIO.open(fileBuffer, (json) => {
        this.workbook.fromJSON(json);
        resolve();
      }, (error) => {
        reject(error);
      });
    });
  }
}

// Univer
class UniverAdapter {
  async importExcel(fileBuffer) {
    // Univer 社区版使用 SheetJS 进行导入
    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    const sheetData = this.convertToUniverFormat(workbook);

    // 使用 Univer API 加载数据
    const univerAPI = this.univerInstance.getActiveWorkbook();
    await univerAPI.setValues(sheetData);
  }

  convertToUniverFormat(workbook) {
    // 将 SheetJS 格式转换为 Univer 格式
    // 实现转换逻辑
  }
}

// Handsontable
class HandsontableAdapter {
  async importExcel(fileBuffer) {
    // Handsontable 需要使用第三方库如 SheetJS
    const XLSX = require('xlsx');
    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

    this.hot.loadData(data);
    await waitForRender();
  }
}
```

### 7.7 注意事项

1. **文件大小提示**：对于超大文件（> 10MB），提供友好的提示信息，告知用户可能需要较长时间
2. **内存监控**：导入大文件时监控内存使用情况，避免浏览器崩溃
3. **错误处理**：处理文件格式错误、损坏文件等异常情况
4. **进度反馈**：对于大文件，提供导入进度反馈
5. **清理资源**：测试完成后清理工作簿，释放内存
6. **性能警告**：如果检测到内存不足或性能问题，及时提示用户

```javascript
// 大文件友好提示（不限制，仅提醒）
function showLargeFileWarning(file) {
  const sizeInMB = (file.size / 1024 / 1024).toFixed(2);
  if (file.size > 10 * 1024 * 1024) {
    return confirm(
      `您选择的文件较大（${sizeInMB} MB），导入可能需要较长时间，是否继续？`
    );
  }
  return true;
}

// 内存监控
async function monitorMemoryDuringImport(importFn) {
  const memoryBefore = performance.memory?.usedJSHeapSize || 0;

  await importFn();

  const memoryAfter = performance.memory?.usedJSHeapSize || 0;
  const memoryIncrease = (memoryAfter - memoryBefore) / 1024 / 1024;

  console.log(`内存增长: ${memoryIncrease.toFixed(2)} MB`);

  // 如果内存增长过大，发出警告
  if (memoryIncrease > 500) {
    console.warn('警告：内存占用较高，可能影响浏览器性能');
  }

  return memoryIncrease;
}
```

---

## 8. 总结

通过以上方案，性能测试可以实现：

✅ **完全自动化**：无需任何人工干预，点击按钮即可运行
✅ **直观可视化**：用户可以清楚地看到测试过程和进度
✅ **结果可靠**：通过预热、多次测试、GC 控制等手段确保准确性
✅ **用户友好**：提供速度控制、实时预览开关等选项
✅ **易于维护**：统一的适配器接口，易于扩展新的测试场景
✅ **支持自定义**：用户可上传自己的 Excel 文件进行测试

**关键改进点**：
1. 将"拖拽填充"改为"自动填充"，使用 API 实现
2. 添加实时预览区域，显示测试过程
3. 添加详细的进度指示和日志输出
4. 提供测试速度控制选项
5. 确保测试结果的准确性和可重现性
6. **新增 Excel 导入测试**，支持用户上传文件或使用示例文件
7. 提供时间分解（读取、解析、渲染），更详细的性能分析
