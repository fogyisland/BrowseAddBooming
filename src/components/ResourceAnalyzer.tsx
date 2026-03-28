import { useState, useEffect } from 'react'

interface ResourceInfo {
  url: string
  type: 'css' | 'js' | 'image' | 'font' | 'video' | 'audio' | 'other'
  size: number
  status: number
  loadTime?: number
}

interface ResourceAnalyzerProps {
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

export default function ResourceAnalyzer({ onBack }: ResourceAnalyzerProps) {
  const [resources, setResources] = useState<ResourceInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [models, setModels] = useState<ModelConfig[]>([])
  const [selectedModelId, setSelectedModelId] = useState<string>('')
  const [slowThreshold, setSlowThreshold] = useState(1000) // 毫秒
  const [activeTab, setActiveTab] = useState<'css' | 'js' | 'slow'>('css')

  useEffect(() => {
    loadModels()
    analyzePageResources()
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

  const analyzePageResources = async () => {
    setLoading(true)
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab.id) {
        setLoading(false)
        return
      }

      // 检查是否是 Chrome 内部页面
      if (tab.url?.startsWith('chrome://')) {
        alert('无法分析 Chrome 内部页面')
        setLoading(false)
        return
      }

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const resources: ResourceInfo[] = []

          // 获取所有资源
          const resourcesList = performance.getEntriesByType('resource') as PerformanceResourceTiming[]

          resourcesList.forEach((entry) => {
            const url = entry.name
            let type: ResourceInfo['type'] = 'other'

            if (url.endsWith('.css') || url.includes('.css')) {
              type = 'css'
            } else if (url.endsWith('.js') || url.includes('.js')) {
              type = 'js'
            } else if (url.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)/)) {
              type = 'image'
            } else if (url.match(/\.(woff2?|ttf|otf|eot)/)) {
              type = 'font'
            } else if (url.match(/\.(mp4|webm|mov|avi|mkv|flv)/)) {
              type = 'video'
            } else if (url.match(/\.(mp3|wav|ogg|flac|aac)/)) {
              type = 'audio'
            }

            const loadTime = entry.responseEnd - entry.startTime

            resources.push({
              url: url,
              type: type,
              size: entry.transferSize || entry.decodedBodySize || 0,
              status: 200, // 从 performance API 无法直接获取状态码
              loadTime: loadTime
            })
          })

          // 同时获取 DOM 中的 link 和 script 标签
          const links = document.querySelectorAll('link[rel="stylesheet"]')
          links.forEach((link) => {
            const htmlLink = link as HTMLLinkElement
            const href = htmlLink.href
            if (href && !resources.find(r => r.url === href)) {
              resources.push({
                url: href,
                type: 'css',
                size: 0,
                status: htmlLink.sheet ? 200 : 0
              })
            }
          })

          const scripts = document.querySelectorAll('script[src]')
          scripts.forEach((script) => {
            const htmlScript = script as HTMLScriptElement
            const src = htmlScript.src
            if (src && !resources.find(r => r.url === src)) {
              resources.push({
                url: src,
                type: 'js',
                size: 0,
                status: 200
              })
            }
          })

          return resources
        }
      })

      if (results[0]?.result) {
        setResources(results[0].result)
      }
    } catch (error) {
      console.error('Failed to analyze resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const analyzeWithAI = async () => {
    if (resources.length === 0) {
      setAnalysisResult('暂无资源数据')
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

      // 准备慢速请求数据
      const slowRequests = resources.filter(r => r.loadTime && r.loadTime > slowThreshold)

      // 准备 CSS 数据
      const cssResources = resources.filter(r => r.type === 'css')

      // 准备 JS 数据
      const jsResources = resources.filter(r => r.type === 'js')

      const analysisType = activeTab === 'slow' ? '慢速连接' : activeTab === 'css' ? 'CSS引用' : 'JS引用'

      const prompt = `请分析当前页面的资源加载情况（${analysisType}）：

1. 慢速请求分析（超过${slowThreshold}ms）：
${slowRequests.length > 0 ? slowRequests.map(r => `- ${r.url} 加载时间: ${r.loadTime?.toFixed(0)}ms 大小: ${formatSize(r.size)}`).join('\n') : '无慢速请求'}

2. CSS资源分析：
${cssResources.length > 0 ? cssResources.map(r => `- ${r.url} 大小: ${formatSize(r.size)} 状态: ${r.status}`).join('\n') : '无CSS资源'}

3. JavaScript资源分析：
${jsResources.length > 0 ? jsResources.map(r => `- ${r.url} 大小: ${formatSize(r.size)} 状态: ${r.status}`).join('\n') : '无JS资源'}

请提供：
- 性能问题诊断
- 优化建议（如合并文件、移除无用资源、延迟加载等）
- 是否存在可疑或冗余的资源

请用中文回答。`

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
            { role: 'system', content: '你是一个专业的网页性能分析助手。请用中文回答。' },
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

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API错误: ${response.status} - ${errorText.slice(0, 100)}`)
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

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const filteredResources = resources.filter(r => {
    if (activeTab === 'css') return r.type === 'css'
    if (activeTab === 'js') return r.type === 'js'
    if (activeTab === 'slow') return r.loadTime && r.loadTime > slowThreshold
    return true
  })

  const slowRequests = resources.filter(r => r.loadTime && r.loadTime > slowThreshold)

  // 导出为 TXT
  const exportToTxt = () => {
    const content = `页面资源分析报告
${'='.repeat(30)}

分析类型: ${activeTab === 'slow' ? '慢速连接' : activeTab === 'css' ? 'CSS引用' : 'JS引用'}
慢速阈值: ${slowThreshold}ms

统计信息:
- 总资源数: ${resources.length}
- CSS资源: ${resources.filter(r => r.type === 'css').length}
- JS资源: ${resources.filter(r => r.type === 'js').length}
- 慢速请求: ${slowRequests.length}

AI分析结果:
${analysisResult}

${'='.repeat(30)}
资源详情:
${filteredResources.map(r =>
  `${r.type.toUpperCase()} ${r.loadTime ? r.loadTime.toFixed(0) + 'ms ' : ''}${formatSize(r.size)} ${r.url}`
).join('\n')}

生成时间: ${new Date().toLocaleString()}`

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `resource-analysis-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
          ←
        </button>
        <h1 className="text-lg font-semibold text-gray-800">页面资源分析</h1>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('css')}
          className={`flex-1 py-1.5 rounded text-xs ${
            activeTab === 'css' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          CSS ({resources.filter(r => r.type === 'css').length})
        </button>
        <button
          onClick={() => setActiveTab('js')}
          className={`flex-1 py-1.5 rounded text-xs ${
            activeTab === 'js' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          JS ({resources.filter(r => r.type === 'js').length})
        </button>
        <button
          onClick={() => setActiveTab('slow')}
          className={`flex-1 py-1.5 rounded text-xs ${
            activeTab === 'slow' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          慢速 ({slowRequests.length})
        </button>
      </div>

      {/* 慢速阈值设置 */}
      {activeTab === 'slow' && (
        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1">
            慢速阈值: {slowThreshold}ms
          </label>
          <input
            type="range"
            min="500"
            max="5000"
            step="100"
            value={slowThreshold}
            onChange={(e) => setSlowThreshold(Number(e.target.value))}
            className="w-full"
          />
        </div>
      )}

      {/* 统计信息 */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="p-2 bg-gray-50 rounded text-center">
          <div className="text-lg font-semibold">{resources.length}</div>
          <div className="text-xs text-gray-500">总资源</div>
        </div>
        <div className="p-2 bg-blue-50 rounded text-center">
          <div className="text-lg font-semibold text-blue-600">
            {formatSize(resources.filter(r => r.type === 'css').reduce((sum, r) => sum + r.size, 0))}
          </div>
          <div className="text-xs text-gray-500">CSS大小</div>
        </div>
        <div className="p-2 bg-orange-50 rounded text-center">
          <div className="text-lg font-semibold text-orange-600">
            {formatSize(resources.filter(r => r.type === 'js').reduce((sum, r) => sum + r.size, 0))}
          </div>
          <div className="text-xs text-gray-500">JS大小</div>
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
          onClick={analyzePageResources}
          disabled={loading}
          className="flex-1 py-1.5 bg-blue-500 text-white rounded text-sm disabled:opacity-50"
        >
          {loading ? '分析中...' : '重新扫描'}
        </button>
        <button
          onClick={analyzeWithAI}
          disabled={analyzing || resources.length === 0}
          className="flex-1 py-1.5 bg-purple-500 text-white rounded text-sm disabled:opacity-50"
        >
          {analyzing ? '分析中...' : 'AI分析'}
        </button>
      </div>

      {/* AI分析结果 */}
      {showResult && (
        <div className="mb-4 p-3 bg-purple-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-purple-700">AI分析结果</span>
            <div className="flex gap-2">
              {analysisResult && !analyzing && (
                <button onClick={exportToTxt} className="text-xs px-2 py-1 bg-white border border-gray-200 rounded hover:bg-gray-50">
                  导出TXT
                </button>
              )}
              <button onClick={() => setShowResult(false)} className="text-xs text-gray-500 ml-2">
                隐藏
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
            {analyzing ? '分析中...' : analysisResult}
          </div>
        </div>
      )}

      {/* 资源列表 */}
      <div className="space-y-1 max-h-[250px] overflow-y-auto">
        {filteredResources.map((resource, index) => (
          <div
            key={index}
            className={`p-2 rounded text-xs ${
              resource.type === 'css' ? 'bg-blue-50' :
              resource.type === 'js' ? 'bg-orange-50' :
              resource.type === 'video' ? 'bg-purple-50' :
              resource.type === 'audio' ? 'bg-pink-50' :
              resource.loadTime && resource.loadTime > slowThreshold ? 'bg-red-50' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`font-medium ${
                resource.type === 'css' ? 'text-blue-600' :
                resource.type === 'js' ? 'text-orange-600' :
                resource.type === 'video' ? 'text-purple-600' :
                resource.type === 'audio' ? 'text-pink-600' : 'text-gray-600'
              }`}>
                {resource.type.toUpperCase()}
              </span>
              {resource.loadTime && (
                <span className={`font-medium ${
                  resource.loadTime > slowThreshold ? 'text-red-600' : 'text-green-600'
                }`}>
                  {resource.loadTime.toFixed(0)}ms
                </span>
              )}
              <span className="text-gray-500">{formatSize(resource.size)}</span>
            </div>
            <div className="truncate text-gray-600 mt-1" title={resource.url}>
              {resource.url}
            </div>
          </div>
        ))}
        {filteredResources.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-8">
            {activeTab === 'slow' ? '无慢速请求' : activeTab === 'css' ? '无CSS资源' : '无JS资源'}
          </div>
        )}
      </div>
    </div>
  )
}
