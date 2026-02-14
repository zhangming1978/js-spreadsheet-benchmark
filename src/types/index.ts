/**
 * 产品类型枚举
 */
export enum ProductType {
  SPREADJS = 'SpreadJS',
  UNIVER = 'Univer',
  HANDSONTABLE = 'Handsontable'
}

/**
 * 测试场景类型
 */
export enum TestScenario {
  DATA_LOADING = 'data-loading',
  SCROLLING = 'scrolling',
  EDITING = 'editing',
  FORMULA = 'formula',
  RENDERING = 'rendering',
  MEMORY = 'memory',
  EXCEL_IMPORT = 'excel-import'
}

/**
 * 测试状态
 */
export enum TestStatus {
  IDLE = 'idle',
  PREPARING = 'preparing',
  TESTING = 'testing',
  COOLDOWN = 'cooldown',
  COMPLETED = 'completed',
  ERROR = 'error'
}

/**
 * 性能指标数据
 */
export interface PerformanceMetrics {
  productName: ProductType;
  scenario: TestScenario;
  executionTime: number;
  memoryUsage: number;
  fps?: number;
  timestamp: number;
}

/**
 * 测试配置
 */
export interface TestConfig {
  scenario: TestScenario;
  dataSize: number;
  iterations?: number;
  cooldownTime?: number;
}

/**
 * 测试结果
 */
export interface TestResult {
  productName: ProductType;
  scenario: TestScenario;
  metrics: PerformanceMetrics;
  success: boolean;
  error?: string;
}

/**
 * 产品配置
 */
export interface ProductConfig {
  name: ProductType;
  enabled: boolean;
  version?: string;
}
