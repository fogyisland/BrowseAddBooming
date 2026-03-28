import { useState, useEffect } from 'react'

interface NetworkRequest {
  id: number
  url: string
  method: string
  status: number
  type: string
  time: number
  size: number
  tabId?: number
  error?: string
}

interface NetworkStats {
  total: number
  success: number
  failed: number
  totalSize: number
  mediaSize: number
}

interface MonitorTabInfo {
  id: number
  url: string
  title: string
}

interface NetworkAnalyzerProps {
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

export default function NetworkAnalyzer({ onBack }: NetworkAnalyzerProps) {
  const [requests, setRequests] = useState<NetworkRequest[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [filter, setFilter] = useState('')
  const [showFailedOnly, setShowFailedOnly] = useState(false)
  const [stats, setStats] = useState<NetworkStats>({ total: 0, success: 0, failed: 0, totalSize: 0, mediaSize: 0 })
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [models, setModels] = useState<ModelConfig[]>([])
  const [selectedModelId, setSelectedModelId] = useState<string>('')
  const [monitorTabInfo, setMonitorTabInfo] = useState<MonitorTabInfo | null>(null)

  useEffect(() => {
    loadSavedData()
    loadModels()

    const handleMessage = (message: { action: string; data?: NetworkRequest[]; stats?: NetworkStats }) => {
      if (message.action === 'networkRequests') {
        setRequests(prev => {
          const newRequests = message.data || []
          return [...prev, ...newRequests].slice(-100)
        })
      } else if (message.action === 'networkStats') {
        setStats(message.stats || { total: 0, success: 0, failed: 0, totalSize: 0, mediaSize: 0 })
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
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

  const loadSavedData = async () => {
    try {
      const data = await chrome.runtime.sendMessage({ action: 'getNetworkData' })
      if (data) {
        setRequests(data.networkRequests || [])
        setStats(data.networkStats || { total: 0, success: 0, failed: 0, totalSize: 0, mediaSize: 0 })
      }
      // 加载监控的标签页信息
      const tabInfo = await chrome.storage.local.get(['monitorTabInfo'])
      if (tabInfo.monitorTabInfo) {
        setMonitorTabInfo(tabInfo.monitorTabInfo)
      }
    } catch (error) {
      console.error('Failed to load saved data:', error)
    }
  }

  const startRecording = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      await chrome.runtime.sendMessage({
        action: 'startNetworkMonitor',
        tabId: tab?.id
      })
      setIsRecording(true)
    } catch (error) {
      console.error('Failed to start recording:', error)
    }
  }

  const stopRecording = async () => {
    try {
      await chrome.runtime.sendMessage({ action: 'stopNetworkMonitor' })
      setIsRecording(false)
    } catch (error) {
      console.error('Failed to stop recording:', error)
    }
  }

  const clearRequests = async () => {
    try {
      await chrome.runtime.sendMessage({ action: 'clearNetworkRequests' })
      setRequests([])
      setStats({ total: 0, success: 0, failed: 0, totalSize: 0, mediaSize: 0 })
      setAnalysisResult('')
      setShowResult(false)
    } catch (error) {
      console.error('Failed to clear requests:', error)
    }
  }

  const analyzeWithAI = async () => {
    if (requests.length === 0) {
      setAnalysisResult('暂无网络请求数据')
      setShowResult(true)
      return
    }

    setAnalyzing(true)
    setAnalysisResult('')
    setShowResult(true)

    try {
      const settingsResult = await chrome.storage.local.get(['modelSettings'])
      const settings: SettingsData = settingsResult.modelSettings

      if (!settings?.models?.length) {
        setAnalysisResult('请先在设置中配置模型')
        setAnalyzing(false)
        return
      }

      const selectedModel = settings.models.find(m => m.id === selectedModelId) || settings.models[0]

      if (!selectedModel.endpoint || !selectedModel.apiKey) {
        setAnalysisResult('请先在设置中配置 API 端点和 API Key')
        setAnalyzing(false)
        return
      }

      const requestData = requests.slice(-50).map(req => ({
        url: req.url,
        method: req.method,
        status: req.status,
        type: req.type,
        size: req.size,
        error: req.error || null
      }))

      const prompt = `请分析以下网络请求流量，识别可能的异常或问题：

1. 可疑的请求模式（如大量重复请求、异常的状态码）
2. 可能的性能问题（如大文件请求、慢请求）
3. 安全风险（如敏感信息泄露、异常域名）
4. 优化建议

请求数据：
${JSON.stringify(requestData, null, 2)}

请用中文回答，提供具体的分析和建议。`

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      if (selectedModel.authType === 'Bearer') {
        headers['Authorization'] = `Bearer ${selectedModel.apiKey}`
      } else if (selectedModel.authType === 'ApiKey') {
        headers['X-API-Key'] = selectedModel.apiKey
      }

      const isAnthropic = selectedModel.endpoint.includes('anthropic.com')
      const isGoogle = selectedModel.endpoint.includes('googleapis.com')

      let body: Record<string, unknown>

      if (isGoogle) {
        body = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 2000 }
        }
        delete headers['Authorization']
      } else if (isAnthropic) {
        headers['x-api-key'] = selectedModel.apiKey
        headers['anthropic-version'] = '2023-06-01'
        body = {
          model: selectedModel.model,
          max_tokens: 2000,
          messages: [{ role: 'user', content: prompt }]
        }
      } else {
        body = {
          model: selectedModel.model,
          messages: [
            { role: 'system', content: '你是一个专业的网络流量分析助手。请用中文回答。' },
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
        setAnalysisResult(data.candidates?.[0]?.content?.parts?.[0]?.text || '无结果')
      } else if (isAnthropic) {
        setAnalysisResult(data.content?.[0]?.text || '无结果')
      } else {
        setAnalysisResult(data.choices?.[0]?.message?.content || '无结果')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '分析失败'
      console.error('API Error:', errorMessage)
      setAnalysisResult(`分析失败: ${errorMessage}`)
    } finally {
      setAnalyzing(false)
    }
  }

  const filteredRequests = requests
    .filter(req => req.url.toLowerCase().includes(filter.toLowerCase()))
    .filter(req => showFailedOnly ? (req.status === 0 || req.status >= 400) : true)

  const getStatusColor = (status: number) => {
    if (status === 0) return 'text-red-600'
    if (status >= 200 && status < 300) return 'text-green-600'
    if (status >= 300 && status < 400) return 'text-blue-600'
    if (status >= 400 && status < 500) return 'text-orange-600'
    if (status >= 500) return 'text-red-600'
    return 'text-gray-600'
  }

  const getStatusText = (status: number) => {
    if (status === 0) return '失败'
    return status || 'pending'
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // 导出为 TXT
  const exportToTxt = () => {
    const content = `网络流量分析报告
${'='.repeat(30)}

统计信息:
- 总请求: ${stats.total}
- 成功: ${stats.success}
- 失败: ${stats.failed}
- 总大小: ${formatSize(stats.totalSize)}
- 媒体大小: ${formatSize(stats.mediaSize)}

AI分析结果:
${analysisResult}

${'='.repeat(30)}
请求详情:
${filteredRequests.map(req =>
  `${req.method} ${req.status} ${req.url} (${formatSize(req.size)})`
).join('\n')}

生成时间: ${new Date().toLocaleString()}`

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `network-analysis-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 导出为 Word (HTML格式，可被Word打开)
  const exportToWord = () => {
    const html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
<meta charset="utf-8">
<title>网络流量分析报告</title>
</head>
<body>
<h1>网络流量分析报告</h1>
<hr>
<h2>统计信息</h2>
<ul>
<li>总请求: ${stats.total}</li>
<li>成功: ${stats.success}</li>
<li>失败: ${stats.failed}</li>
<li>总大小: ${formatSize(stats.totalSize)}</li>
<li>媒体大小: ${formatSize(stats.mediaSize)}</li>
</ul>
<h2>AI分析结果</h2>
<pre style="white-space: pre-wrap;">${analysisResult}</pre>
<hr>
<h2>请求详情</h2>
<table border="1" cellpadding="5" cellspacing="0">
<tr><th>方法</th><th>状态</th><th>URL</th><th>大小</th></tr>
${filteredRequests.map(req =>
  `<tr><td>${req.method}</td><td>${req.status}</td><td>${req.url}</td><td>${formatSize(req.size)}</td></tr>`
).join('\n')}
</table>
<p><em>生成时间: ${new Date().toLocaleString()}</em></p>
</body>
</html>`

    const blob = new Blob([html], { type: 'application/msword;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `network-analysis-${Date.now()}.doc`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 导出为 PDF (使用浏览器打印功能)
  const exportToPdf = () => {
    const printContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>网络流量分析报告</title>
<style>
body { font-family: SimSun, serif; padding: 20px; }
h1 { text-align: center; }
h2 { margin-top: 20px; }
table { border-collapse: collapse; width: 100%; margin-top: 10px; }
th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
th { background-color: #f2f2f2; }
pre { white-space: pre-wrap; background: #f9f9f9; padding: 10px; }
</style>
</head>
<body>
<h1>网络流量分析报告</h1>
<hr>
<h2>统计信息</h2>
<ul>
<li>总请求: ${stats.total}</li>
<li>成功: ${stats.success}</li>
<li>失败: ${stats.failed}</li>
<li>总大小: ${formatSize(stats.totalSize)}</li>
<li>媒体大小: ${formatSize(stats.mediaSize)}</li>
</ul>
<h2>AI分析结果</h2>
<pre>${analysisResult}</pre>
<hr>
<h2>请求详情 (共 ${filteredRequests.length} 条)</h2>
<table>
<tr><th>方法</th><th>状态</th><th>URL</th><th>大小</th></tr>
${filteredRequests.map(req =>
  `<tr><td>${req.method}</td><td>${req.status}</td><td>${req.url.substring(0, 100)}...</td><td>${formatSize(req.size)}</td></tr>`
).join('\n')}
</table>
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
        <h1 className="text-lg font-semibold text-gray-800">网络流量分析</h1>
      </div>

      {/* 监控范围提示 */}
      {monitorTabInfo && isRecording && (
        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-xs text-yellow-700">
            <span className="font-medium">正在监控:</span> {monitorTabInfo.title || monitorTabInfo.url}
          </div>
        </div>
      )}

      {/* 统计信息 */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="p-2 bg-gray-50 rounded text-center">
          <div className={`text-lg font-semibold ${isRecording ? 'text-blue-600' : ''}`}>{stats.total}</div>
          <div className="text-xs text-gray-500">总请求</div>
        </div>
        <div className="p-2 bg-green-50 rounded text-center">
          <div className="text-lg font-semibold text-green-600">{stats.success}</div>
          <div className="text-xs text-gray-500">成功</div>
        </div>
        <div className="p-2 bg-red-50 rounded text-center">
          <div className="text-lg font-semibold text-red-600">{stats.failed}</div>
          <div className="text-xs text-gray-500">失败</div>
        </div>
        <div className="p-2 bg-blue-50 rounded text-center">
          <div className="text-lg font-semibold text-blue-600">{formatSize(stats.totalSize)}</div>
          <div className="text-xs text-gray-500">总大小</div>
        </div>
        <div className="p-2 bg-purple-50 rounded text-center">
          <div className="text-lg font-semibold text-purple-600">{formatSize(stats.mediaSize)}</div>
          <div className="text-xs text-gray-500">媒体(视频/音频)</div>
        </div>
      </div>

      {/* 模型选择 */}
      <div className="mb-3">
        <label className="block text-xs text-gray-500 mb-1">AI分析模型</label>
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

      {/* 控制按钮 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`flex-1 py-1.5 rounded text-sm ${
            isRecording ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
          }`}
        >
          {isRecording ? '停止记录' : '开始记录'}
        </button>
        <button
          onClick={clearRequests}
          className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded text-sm"
        >
          清空
        </button>
        <button
          onClick={analyzeWithAI}
          disabled={analyzing || requests.length === 0}
          className="px-4 py-1.5 bg-purple-500 text-white rounded text-sm disabled:opacity-50"
        >
          {analyzing ? '分析中...' : 'AI分析'}
        </button>
      </div>

      {/* 筛选 */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="筛选URL..."
          className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={() => setShowFailedOnly(!showFailedOnly)}
          className={`px-3 py-2 rounded text-sm ${
            showFailedOnly ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          失败
        </button>
      </div>

      {/* AI分析结果 */}
      {showResult && (
        <div className="mb-4 p-3 bg-purple-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-purple-700">AI分析结果</span>
            <div className="flex gap-2">
              {analysisResult && !analyzing && (
                <>
                  <button onClick={exportToTxt} className="text-xs px-2 py-1 bg-white border border-gray-200 rounded hover:bg-gray-50">TXT</button>
                  <button onClick={exportToWord} className="text-xs px-2 py-1 bg-white border border-gray-200 rounded hover:bg-gray-50">Word</button>
                  <button onClick={exportToPdf} className="text-xs px-2 py-1 bg-white border border-gray-200 rounded hover:bg-gray-50">PDF</button>
                </>
              )}
              <button
                onClick={() => setShowResult(false)}
                className="text-xs text-gray-500 ml-2"
              >
                隐藏
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
            {analyzing ? '分析中...' : analysisResult}
          </div>
        </div>
      )}

      {/* 请求列表 */}
      <div className="space-y-1 max-h-[200px] overflow-y-auto">
        {filteredRequests.map((req) => (
          <div key={req.id} className={`p-2 rounded text-xs ${req.status === 0 || req.status >= 400 ? 'bg-red-50' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <span className={`font-medium ${req.method === 'GET' ? 'text-blue-600' : 'text-orange-600'}`}>
                {req.method}
              </span>
              <span className={`font-medium ${getStatusColor(req.status)}`}>
                {getStatusText(req.status)}
              </span>
            </div>
            <div className="truncate text-gray-600 mt-1" title={req.url}>
              {req.url}
            </div>
            <div className="flex justify-between text-gray-400 mt-1">
              <span>{req.type || 'unknown'}</span>
              <span>{formatSize(req.size)}</span>
            </div>
            {req.error && (
              <div className="text-red-500 mt-1">{req.error}</div>
            )}
          </div>
        ))}
        {filteredRequests.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            {isRecording ? '暂无网络请求' : '已停止记录'}
          </div>
        )}
      </div>
    </div>
  )
}
