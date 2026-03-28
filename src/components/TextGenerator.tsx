import { useState, useEffect } from 'react'

interface TextGeneratorProps {
  onBack: () => void
  onInsertAtCursor?: (text: string) => void
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

type GenerateType = 'article' | 'summary' | 'email' | 'social' | 'custom'

export default function TextGenerator({ onBack, onInsertAtCursor }: TextGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [generatedText, setGeneratedText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [models, setModels] = useState<ModelConfig[]>([])
  const [selectedModelId, setSelectedModelId] = useState<string>('')
  const [generateType, setGenerateType] = useState<GenerateType>('custom')

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

  const generateText = async () => {
    if (!prompt.trim()) {
      setError('请输入生成要求')
      return
    }

    setLoading(true)
    setError('')

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

      const prompts: Record<GenerateType, string> = {
        article: `请根据以下要求生成一篇完整的文章：\n\n${prompt}`,
        summary: `请根据以下内容生成摘要：\n\n${prompt}`,
        email: `请根据以下要求生成一封专业的电子邮件：\n\n${prompt}`,
        social: `请根据以下要求生成社交媒体文案：\n\n${prompt}`,
        custom: `请根据以下要求生成文本：\n\n${prompt}`
      }

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
          contents: [{ parts: [{ text: prompts[generateType] }] }],
          generationConfig: { maxOutputTokens: 2000 }
        }
        delete headers['Authorization']
        delete headers['x-api-key']
      } else if (isAnthropic) {
        body = {
          model: selectedModel.model,
          max_tokens: 2000,
          messages: [
            { role: 'user', content: `你是一个专业的文本生成助手。请直接输出生成的文本，不要添加任何解释。\n\n${prompts[generateType]}` }
          ]
        }
      } else {
        body = {
          model: selectedModel.model,
          messages: [
            { role: 'system', content: '你是一个专业的文本生成助手。请直接输出生成的文本，不要添加任何解释。' },
            { role: 'user', content: prompts[generateType] }
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
        setGeneratedText(data.candidates?.[0]?.content?.parts?.[0]?.text || '无结果')
      } else if (isAnthropic) {
        setGeneratedText(data.content?.[0]?.text || '无结果')
      } else {
        setGeneratedText(data.choices?.[0]?.message?.content || '无结果')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '生成失败'
      console.error('API Error:', errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // 导出为 TXT
  const exportToTxt = () => {
    const content = `文本生成结果
${'='.repeat(30)}

生成要求:
${prompt}

生成结果:
${generatedText}

生成时间: ${new Date().toLocaleString()}`

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `text-generated-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 导出为 Word
  const exportToWord = () => {
    const html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
<meta charset="utf-8">
<title>文本生成结果</title>
</head>
<body>
<h1>文本生成结果</h1>
<hr>
<h2>生成要求</h2>
<pre style="white-space: pre-wrap;">${prompt}</pre>
<hr>
<h2>生成结果</h2>
<pre style="white-space: pre-wrap;">${generatedText}</pre>
<p><em>生成时间: ${new Date().toLocaleString()}</em></p>
</body>
</html>`

    const blob = new Blob([html], { type: 'application/msword;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `text-generated-${Date.now()}.doc`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 复制到剪贴板
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedText)
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
          ←
        </button>
        <h1 className="text-lg font-semibold text-gray-800">生成文本内容</h1>
      </div>

      <div className="mb-3">
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

      <div className="mb-3">
        <label className="block text-xs text-gray-500 mb-1">生成类型</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setGenerateType('article')}
            className={`px-2 py-1.5 rounded text-xs ${
              generateType === 'article' ? 'bg-green-500 text-white' : 'bg-green-50 text-green-600 hover:bg-green-100'
            }`}
          >
            文章
          </button>
          <button
            onClick={() => setGenerateType('summary')}
            className={`px-2 py-1.5 rounded text-xs ${
              generateType === 'summary' ? 'bg-green-500 text-white' : 'bg-green-50 text-green-600 hover:bg-green-100'
            }`}
          >
            摘要
          </button>
          <button
            onClick={() => setGenerateType('email')}
            className={`px-2 py-1.5 rounded text-xs ${
              generateType === 'email' ? 'bg-green-500 text-white' : 'bg-green-50 text-green-600 hover:bg-green-100'
            }`}
          >
            邮件
          </button>
          <button
            onClick={() => setGenerateType('social')}
            className={`px-2 py-1.5 rounded text-xs ${
              generateType === 'social' ? 'bg-green-500 text-white' : 'bg-green-50 text-green-600 hover:bg-green-100'
            }`}
          >
            社交文案
          </button>
          <button
            onClick={() => setGenerateType('custom')}
            className={`px-2 py-1.5 rounded text-xs ${
              generateType === 'custom' ? 'bg-green-500 text-white' : 'bg-green-50 text-green-600 hover:bg-green-100'
            }`}
          >
            自定义
          </button>
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-xs text-gray-500 mb-1">输入生成要求</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            generateType === 'article' ? '请输入文章主题和要求，例如：写一篇关于AI技术发展的文章，500字左右' :
            generateType === 'summary' ? '请输入需要生成摘要的内容' :
            generateType === 'email' ? '请输入邮件主题和收件人等信息' :
            generateType === 'social' ? '请输入社交媒体文案的要求' :
            '请输入你的要求'
          }
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none"
          rows={4}
        />
      </div>

      <button
        onClick={generateText}
        disabled={loading}
        className="w-full py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-lg transition-colors mb-4"
      >
        {loading ? '生成中...' : '生成文本'}
      </button>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {generatedText && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs text-gray-500">生成结果</label>
            <div className="flex gap-2">
              {onInsertAtCursor && (
                <button onClick={() => onInsertAtCursor(generatedText)} className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600">插入页面</button>
              )}
              <button onClick={copyToClipboard} className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">复制</button>
              <button onClick={exportToTxt} className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">TXT</button>
              <button onClick={exportToWord} className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">Word</button>
            </div>
          </div>
          <textarea
            value={generatedText}
            onChange={(e) => setGeneratedText(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500 resize-none"
            rows={8}
          />
        </div>
      )}

      {loading && (
        <div className="text-center py-4 text-gray-500">
          AI 正在生成文本...
        </div>
      )}
    </div>
  )
}
