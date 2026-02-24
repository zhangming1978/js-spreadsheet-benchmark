#!/usr/bin/env tsx
/**
 * 冒烟测试 CLI 工具
 * 快速验证所有产品的基本功能
 *
 * 使用方法:
 *   npm run smoke-test              # 运行所有产品的冒烟测试
 *   npm run smoke-test:headed       # 以有头模式运行（显示浏览器）
 */

import { test, expect } from '@playwright/test'
import { ProductType } from '../src/types'

const PRODUCTS = [
  ProductType.SPREADJS,
  ProductType.UNIVER,
  ProductType.HANDSONTABLE,
  ProductType.X_SPREADSHEET,
  ProductType.LUCKYSHEET,
  ProductType.JSPREADSHEET
]

console.log('='.repeat(60))
console.log('SpreadJS 性能测试平台 - 冒烟测试')
console.log('='.repeat(60))
console.log(`测试产品数量: ${PRODUCTS.length}`)
console.log(`产品列表: ${PRODUCTS.join(', ')}`)
console.log('='.repeat(60))
console.log('')

// 这个脚本实际上是通过 Playwright 运行的
// 真正的测试逻辑在 tests/e2e/smoke-test.spec.ts 中
console.log('提示: 此脚本通过 Playwright 执行冒烟测试')
console.log('运行命令: npm run smoke-test')
console.log('')
