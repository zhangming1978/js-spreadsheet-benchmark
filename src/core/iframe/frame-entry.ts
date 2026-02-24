/**
 * iframe 入口文件
 * 导入必要的样式和初始化测试执行器
 */

// 导入 jQuery（Luckysheet 依赖）- 必须先设置到 window
import $ from 'jquery'
window.$ = $
window.jQuery = $

// 导入 jQuery mousewheel 插件（Luckysheet 需要）
// 在模块环境中，jquery-mousewheel 导出的是工厂函数，需要手动调用
import mousewheelFactory from 'jquery-mousewheel'

// 调用工厂函数来注册插件到 jQuery
if (typeof mousewheelFactory === 'function') {
  console.log('[frame-entry] Registering mousewheel plugin with jQuery')
  mousewheelFactory($)
  mousewheelFactory(window.$)
  mousewheelFactory(window.jQuery)
} else {
  console.warn('[frame-entry] mousewheelFactory is not a function:', typeof mousewheelFactory)
}

// 验证 mousewheel 插件已注册
if ($.fn && 'mousewheel' in $.fn) {
  console.log('[frame-entry] jQuery mousewheel plugin registered successfully on imported $')
} else {
  console.error('[frame-entry] jQuery mousewheel plugin failed to register on imported $')
}

if (window.$ && window.$.fn && 'mousewheel' in window.$.fn) {
  console.log('[frame-entry] jQuery mousewheel plugin available on window.$')
} else {
  console.error('[frame-entry] jQuery mousewheel plugin NOT available on window.$')
}

if (window.jQuery && window.jQuery.fn && 'mousewheel' in window.jQuery.fn) {
  console.log('[frame-entry] jQuery mousewheel plugin available on window.jQuery')
} else {
  console.error('[frame-entry] jQuery mousewheel plugin NOT available on window.jQuery')
}

// 导入 SpreadJS 样式
import '@grapecity-software/spread-sheets/styles/gc.spread.sheets.excel2013white.css'

// 导入 Handsontable 样式
import 'handsontable/dist/handsontable.full.min.css'

// 导入 Univer 样式
import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs/sheets-ui/lib/index.css'

// 导入 x-spreadsheet 样式和库
import 'x-data-spreadsheet/dist/xspreadsheet.css'
import Spreadsheet from 'x-data-spreadsheet'

// 导入 Luckysheet 样式（库需要动态导入）
import 'luckysheet/dist/plugins/css/pluginsCss.css'
import 'luckysheet/dist/plugins/plugins.css'
import 'luckysheet/dist/css/luckysheet.css'

// 导入 jSpreadsheet 样式和库
import 'jspreadsheet-ce/dist/jspreadsheet.css'
import jspreadsheet from 'jspreadsheet-ce'

// 将库暴露到 window 对象供适配器使用
declare global {
  interface Window {
    $: typeof $
    jQuery: typeof $
    x: { spreadsheet: typeof Spreadsheet }
    luckysheet: any
    jspreadsheet: typeof jspreadsheet
  }
}

window.x = { spreadsheet: Spreadsheet }
window.jspreadsheet = jspreadsheet

// 动态导入 Luckysheet（需要 jQuery 先在 window 上）
import('luckysheet').then((module) => {
  window.luckysheet = module.default || module
  console.log('[frame-entry] Luckysheet 已加载')
}).catch((err) => {
  console.error('[frame-entry] Luckysheet 加载失败:', err)
})

// 导入测试执行器
import './frame-test-executor'

console.log('[frame-entry] 样式已加载，执行器已初始化')

