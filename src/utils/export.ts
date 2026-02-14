import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import type { TestResult } from '@/types'

/**
 * 导出工具类
 * 提供 JSON、PNG、PDF 等格式的数据导出功能
 */

/**
 * 导出为 JSON 文件
 */
export const exportToJSON = (data: TestResult[], filename: string = 'performance-results.json') => {
  const jsonStr = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 导出 DOM 元素为 PNG 图片
 */
export const exportToPNG = async (element: HTMLElement, filename: string = 'performance-chart.png') => {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // 提高清晰度
      logging: false,
      useCORS: true
    })

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    }, 'image/png')
  } catch (error) {
    console.error('导出 PNG 失败:', error)
    throw error
  }
}

/**
 * 导出 DOM 元素为 PDF 文件
 */
export const exportToPDF = async (element: HTMLElement, filename: string = 'performance-report.pdf') => {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const imgWidth = 210 // A4 宽度 (mm)
    const pageHeight = 297 // A4 高度 (mm)
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    let position = 0

    // 添加第一页
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // 如果内容超过一页，添加更多页
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(filename)
  } catch (error) {
    console.error('导出 PDF 失败:', error)
    throw error
  }
}

/**
 * 生成带时间戳的文件名
 */
export const generateFilename = (prefix: string, extension: string): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  return `${prefix}_${timestamp}.${extension}`
}
