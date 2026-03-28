import { useState, useEffect } from 'react'

interface PageAnalysisProps {
  content: string
  onBack: () => void
}

interface ModelConfig {
  id: string
  name: string
  model: string
  endpoint: string
  apiKey: string
  authType: 'Bearer' | 'ApiKey' | 'Basic'
}

interface SettingsData {
  models: ModelConfig[]
  defaultModelId: string
}

export default function PageAnalysis({ content, onBack }: PageAnalysisProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [models, setModels] = useState<ModelConfig[]>([])
  const [selectedModelId, setSelectedModelId] = useState<string>('')

  useEffect(() => {
    loadModels()
  }, [])

  const loadModels = async () => {
    try {
      const result = await chrome.storage.local.get(['modelSettings'])
      const settings: SettingsData = result.modelSettings
      if (settings?.models) {
        setModels(settings.models)
        setSelectedModelId(settings.defaultModelId || settings.models[0]?.id)
      }
    } catch (error) {
      console.error('Failed to load models:', error)
    }
  }

  const analyzePage = async () => {
    setLoading(true)
    setError('')
    setResult('')

    try {
      const settings = await chrome.storage.local.get(['modelSettings'])
      const allModels: SettingsData = settings.modelSettings

      if (!allModels?.models?.length) {
        setError('请先在设置中配置模型')
        return
      }

      const selectedModel = allModels.models.find(m => m.id === selectedModelId) || allModels.models[0]

      if (!selectedModel.endpoint || !selectedModel.apiKey) {
        setError('请先在设置中配置 API 端点和 API Key')
        return
      }

      const prompt = `请分析以下网页内容，提供摘要和关键信息：\n\n${content.slice(0, 4000)}`

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      if (selectedModel.authType === 'Bearer') {
        headers['Authorization'] = `Bearer ${selectedModel.apiKey}`
      } else if (selectedModel.authType === 'ApiKey') {
        headers['X-API-Key'] = selectedModel.apiKey
      } else if (selectedModel.authType === 'Basic') {
        headers['Authorization'] = `Basic ${btoa(selectedModel.apiKey)}`
      }

      const isAnthropic = selectedModel.endpoint.includes('anthropic.com')
      if (isAnthropic) {
        headers['x-api-key'] = selectedModel.apiKey
        headers['anthropic-version'] = '2023-06-01'
      }

      const isGoogle = selectedModel.endpoint.includes('googleapis.com')
      let body: Record<string, unknown>

      if (isGoogle) {
        body = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 2000 }
        }
        delete headers['Authorization']
        delete headers['x-api-key']
      } else if (isAnthropic) {
        body = {
          model: selectedModel.model,
          max_tokens: 2000,
          messages: [{ role: 'user', content: prompt }]
        }
      } else {
        body = {
          model: selectedModel.model,
          messages: [
            { role: 'system', content: '你是一个专业的网页内容分析助手。请用中文回答。' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 2000
        }
      }

      const response = await fetch(selectedModel.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      })

      // 检查响应状态
      if (!response.ok) {
        const errorText = await response.text()
        try {
          const errorJson = JSON.parse(errorText)
          throw new Error(errorJson.error?.message || `API错误: ${response.status}`)
        } catch {
          throw new Error(`API请求失败: ${response.status} - ${errorText.slice(0, 100)}`)
        }
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        throw new Error(`API返回了非JSON格式: ${text.slice(0, 100)}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error.message || data.error)
      }

      if (isGoogle) {
        setResult(data.candidates?.[0]?.content?.parts?.[0]?.text || '无结果')
      } else if (isAnthropic) {
        setResult(data.content?.[0]?.text || '无结果')
      } else {
        setResult(data.choices?.[0]?.message?.content || '无结果')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '分析失败'
      console.error('API Error:', errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // 导出为 TXT
  const exportToTxt = () => {
    const content = `页面分析报告
${'='.repeat(30)}

分析结果:
${result}

生成时间: ${new Date().toLocaleString()}`

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `page-analysis-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 导出为 Word
  const exportToWord = () => {
    const html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
<meta charset="utf-8">
<title>页面分析报告</title>
</head>
<body>
<h1>页面分析报告</h1>
<hr>
<h2>分析结果</h2>
<pre style="white-space: pre-wrap;">${result}</pre>
<p><em>生成时间: ${new Date().toLocaleString()}</em></p>
</body>
</html>`

    const blob = new Blob([html], { type: 'application/msword;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `page-analysis-${Date.now()}.doc`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 导出为 PDF
  const exportToPdf = () => {
    const printContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>页面分析报告</title>
<style>
body { font-family: SimSun, serif; padding: 20px; }
h1 { text-align: center; }
pre { white-space: pre-wrap; background: #f9f9f9; padding: 10px; }
</style>
</head>
<body>
<h1>页面分析报告</h1>
<hr>
<h2>分析结果</h2>
<pre>${result}</pre>
<p style="text-align: right; color: #666;">生成时间: ${new Date().toLocaleString()}</p>
<script>window.onload = function() { window.print(); }</script>
</body>
</html>`

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
          ←
        </button>
        <h1 className="text-lg font-semibold text-gray-800">页面分析</h1>
      </div>

      {/* 模型选择 */}
      <div className="mb-4">
        <label className="block text-xs text-gray-500 mb-1">选择模型</label>
        <select
          value={selectedModelId}
          onChange={(e) => setSelectedModelId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
        >
          {models.map(model => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <button
          onClick={analyzePage}
          disabled={loading}
          className="w-full py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
        >
          {loading ? '分析中...' : '开始分析'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {result && (
        <div className="mb-4">
          <div className="flex justify-end gap-2 mb-2">
            <button onClick={exportToTxt} className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">TXT</button>
            <button onClick={exportToWord} className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">Word</button>
            <button onClick={exportToPdf} className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">PDF</button>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-700 whitespace-pre-wrap">{result}</div>
          </div>
        </div>
      )}

      {!loading && !result && !error && (
        <div className="text-sm text-gray-500">
          点击"开始分析"按钮对当前页面进行AI分析
        </div>
      )}
    </div>
  )
}
