/**
 * iframe 入口文件
 * 导入必要的样式和初始化测试执行器
 */

// 导入 SpreadJS 样式
import '@grapecity-software/spread-sheets/styles/gc.spread.sheets.excel2013white.css'

// 导入 Handsontable 样式
import 'handsontable/dist/handsontable.full.min.css'

// 导入 Univer 样式
import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs/sheets-ui/lib/index.css'

// 导入测试执行器
import './frame-test-executor'

console.log('[frame-entry] 样式已加载，执行器已初始化')
