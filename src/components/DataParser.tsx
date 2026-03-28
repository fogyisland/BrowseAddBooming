import { useState, useRef } from 'react'
import { useLanguage } from '../i18n'

interface DataParserProps {
  onBack: () => void
}

export default function DataParser({ onBack }: DataParserProps) {
  const { t } = useLanguage()
  const [data, setData] = useState<any>(null)
  const [fileName, setFileName] = useState('')
  const [fileType, setFileType] = useState<'json' | 'xml' | null>(null)
  const [error, setError] = useState('')
  const [parsedRows, setParsedRows] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 解析 JSON
  const parseJson = (content: string): any => {
    try {
      const parsed = JSON.parse(content)
      return parsed
    } catch (e) {
      throw new Error(t.jsonParseError || 'JSON 解析失败')
    }
  }

  // 解析 XML
  const parseXml = (content: string): any => {
    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(content, 'text/xml')

      const parseError = xmlDoc.querySelector('parsererror')
      if (parseError) {
        throw new Error(t.xmlParseError || 'XML 解析失败')
      }

      return xmlDoc
    } catch (e) {
      throw new Error(t.xmlParseError || 'XML 解析失败')
    }
  }

  // XML 转 JSON
  const xmlToJson = (xml: Document): any => {
    const result: any = {}

    const parseNode = (node: any) => {
      if (node.nodeType === 3) {
        const text = node.textContent?.trim()
        if (text) return text
        return null
      }

      if (node.nodeType === 1) {
        const obj: any = {}

        if (node.attributes) {
          for (let i = 0; i < node.attributes.length; i++) {
            const attr = node.attributes[i]
            obj[`@${attr.name}`] = attr.value
          }
        }

        const children = Array.from(node.childNodes)
        let textContent = ''

        children.forEach((child: any) => {
          if (child.nodeType === 3) {
            textContent += child.textContent || ''
          } else if (child.nodeType === 1) {
            const childName = child.nodeName
            const childValue = parseNode(child)

            if (childValue) {
              if (obj[childName]) {
                if (!Array.isArray(obj[childName])) {
                  obj[childName] = [obj[childName]]
                }
                obj[childName].push(childValue)
              } else {
                obj[childName] = childValue
              }
            }
          }
        })

        const text = textContent.trim()
        if (text && Object.keys(obj).length === 0) {
          return text
        }
        if (text) {
          obj['#text'] = text
        }

        return obj
      }

      return null
    }

    if (xml.documentElement) {
      result[xml.documentElement.nodeName] = parseNode(xml.documentElement)
    }

    return result
  }

  // 展平数据为数组
  const flattenToRows = (data: any, prefix = ''): any[] => {
    if (Array.isArray(data)) {
      const rows: any[] = []
      data.forEach((item, index) => {
        const flattened = flattenToRows(item, prefix ? `${prefix}[${index}]` : `[${index}]`)
        if (Array.isArray(flattened)) {
          rows.push(...flattened)
        } else {
          rows.push(flattened)
        }
      })
      return rows
    } else if (typeof data === 'object' && data !== null) {
      const rows: any[] = [{}]
      Object.entries(data).forEach(([key, value]) => {
        const newPrefix = prefix ? `${prefix}.${key}` : key

        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            const flattened = flattenToRows(item, `${newPrefix}[${index}]`)
            if (Array.isArray(flattened)) {
              flattened.forEach((f, i) => {
                if (rows[i]) {
                  Object.assign(rows[i], f)
                }
              })
            }
          })
        } else if (typeof value === 'object' && value !== null) {
          const childRows = flattenToRows(value, newPrefix)
          childRows.forEach((row, i) => {
            if (rows[i]) {
              Object.assign(rows[i], row)
            }
          })
        } else {
          rows.forEach(row => {
            row[newPrefix] = value
          })
        }
      })
      return rows
    } else {
      return [{ [prefix]: data }]
    }
  }

  // 提取表头
  const extractHeaders = (rows: any[]): string[] => {
    const headerSet = new Set<string>()
    rows.forEach(row => {
      Object.keys(row).forEach(key => headerSet.add(key))
    })
    return Array.from(headerSet).sort()
  }

  // 处理文件上传
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')
    setFileName(file.name)

    try {
      const content = await file.text()

      if (file.name.endsWith('.json')) {
        setFileType('json')
        const parsed = parseJson(content)
        setData(parsed)

        const rows = flattenToRows(parsed)
        setParsedRows(rows)
        setHeaders(extractHeaders(rows))
      } else if (file.name.endsWith('.xml')) {
        setFileType('xml')
        const parsed = parseXml(content)
        const jsonData = xmlToJson(parsed)
        setData(jsonData)

        const rows = flattenToRows(jsonData)
        setParsedRows(rows)
        setHeaders(extractHeaders(rows))
      } else {
        setError(t.unsupportedFormat || '不支持的文件格式')
      }
    } catch (e) {
      setError((e as Error).message)
    }
  }

  // 下载为 CSV
  const downloadCsv = () => {
    if (parsedRows.length === 0) return

    const csvContent = [
      headers.join(','),
      ...parsedRows.map(row =>
        headers.map(h => {
          const value = row[h] ?? ''
          const str = String(value).replace(/"/g, '""')
          return `"${str}"`
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${fileName.replace(/\.(json|xml)$/, '')}_parsed.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // 下载为 XLSX (使用 SheetJS)
  const downloadXlsx = async () => {
    if (parsedRows.length === 0) return

    const XLSX = await import('xlsx')

    const worksheet = XLSX.utils.json_to_sheet(parsedRows, {
      header: headers
    })

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')

    XLSX.writeFile(workbook, `${fileName.replace(/\.(json|xml)$/, '')}_parsed.xlsx`)
  }

  // 下载为 JSON
  const downloadJson = () => {
    if (!data) return

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${fileName.replace(/\.(json|xml)$/, '')}_parsed.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // 复制到剪贴板
  const copyToClipboard = () => {
    if (!data) return
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 text-xl">←</button>
        <h2 className="text-lg font-semibold flex-1">{t.dataParser}</h2>
      </div>

      {/* 文件上传 */}
      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.xml"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full p-6 border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
        >
          <div className="text-blue-500 text-2xl mb-2">📁</div>
          <div className="text-blue-700 font-medium">{t.uploadFile || '点击上传 JSON 或 XML 文件'}</div>
          <div className="text-gray-500 text-sm mt-1">{t.dragDropHint || '支持拖拽文件到此处'}</div>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* 文件信息 */}
      {fileName && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{fileType === 'json' ? '📋' : '📄'}</span>
              <span className="font-medium">{fileName}</span>
              <span className="text-xs text-gray-500 uppercase bg-gray-200 px-2 py-0.5 rounded">
                {fileType}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {parsedRows.length} {t.rows || '行'}, {headers.length} {t.columns || '列'}
            </div>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      {data && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={copyToClipboard}
            className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded"
          >
            📋 {t.copy || '复制'}
          </button>
          <button
            onClick={downloadJson}
            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded"
          >
            📥 JSON
          </button>
          <button
            onClick={downloadCsv}
            className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm rounded"
          >
            📥 CSV
          </button>
          <button
            onClick={downloadXlsx}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded"
          >
            📥 XLSX
          </button>
        </div>
      )}

      {/* 数据预览 */}
      {parsedRows.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-3 py-2 border-b border-gray-200">
            <span className="font-medium text-gray-700">{t.dataPreview || '数据预览'}</span>
          </div>
          <div className="overflow-auto max-h-[400px]">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-600 border-b w-12">#</th>
                  {headers.slice(0, 10).map(header => (
                    <th key={header} className="px-3 py-2 text-left font-medium text-gray-600 border-b">
                      {header.length > 20 ? header.slice(0, 20) + '...' : header}
                    </th>
                  ))}
                  {headers.length > 10 && (
                    <th className="px-3 py-2 text-left font-medium text-gray-400 border-b">
                      +{headers.length - 10} {t.moreColumns || '列'}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {parsedRows.slice(0, 100).map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-3 py-1.5 text-gray-400 border-b">{idx + 1}</td>
                    {headers.slice(0, 10).map(header => (
                      <td key={header} className="px-3 py-1.5 text-gray-800 border-b">
                        {String(row[header] ?? '').length > 30
                          ? String(row[header]).slice(0, 30) + '...'
                          : row[header] ?? ''}
                      </td>
                    ))}
                    {headers.length > 10 && (
                      <td className="px-3 py-1.5 text-gray-400 border-b">...</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedRows.length > 100 && (
              <div className="p-2 text-center text-gray-500 text-sm bg-gray-50">
                {t.showingFirst100 || `显示前 100 条，共 ${parsedRows.length} 条`}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 说明 */}
      {!data && !error && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">{t.features || '功能说明'}</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• {t.featureJsonXml || '支持解析 JSON 和 XML 格式文件'}</li>
            <li>• {t.featureFlatten || '自动提取数据并展平为表格'}</li>
            <li>• {t.featureDownload || '支持下载为 CSV、XLSX、JSON 格式'}</li>
            <li>• {t.featureCopy || '支持复制解析后的数据到剪贴板'}</li>
          </ul>
        </div>
      )}
    </div>
  )
}
