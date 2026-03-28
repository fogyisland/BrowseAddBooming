import { useState, useEffect } from 'react'
import { useLanguage } from '../i18n'

interface TextOptimizerProps {
  originalText: string
  onBack: () => void
  onReplace: (text: string) => void
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

type OptimizeType = 'improve' | 'simplify' | 'expand' | 'formal' | 'casual' | 'funny' | 'humor' | 'blog' | 'media' | 'custom'

interface CustomPrompt {
  id: string
  name: string
  prompt: string
}

export default function TextOptimizer({ originalText, onBack, onReplace, onInsertAtCursor }: TextOptimizerProps) {
  const { t } = useLanguage()
  const [inputText, setInputText] = useState<string>(originalText || '')
  const [inputTitle, setInputTitle] = useState<string>('')
  const [optimizedText, setOptimizedText] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [models, setModels] = useState<ModelConfig[]>([])
  const [selectedModelId, setSelectedModelId] = useState<string>('')
  const [mode, setMode] = useState<'manual' | 'selected'>('manual')
  const [realtimeText, setRealtimeText] = useState<string>('')
  const [realtimeTitle, setRealtimeTitle] = useState<string>('')
  const [optimizeTarget, setOptimizeTarget] = useState<'content' | 'title'>('content')
  const [customPrompts, setCustomPrompts] = useState<CustomPrompt[]>([])
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [newCustomName, setNewCustomName] = useState('')
  const [newCustomPrompt, setNewCustomPrompt] = useState('')

  useEffect(() => {
    loadModels()
    // 尝试获取实时选中文本
    const getInitialText = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        if (!tab.id) return

        // 优先从实时选中文本读取（content.js 推送的）
        const realtime = await chrome.storage.local.get(['currentSelection', 'currentSelectionTitle', 'currentSelectionUrl', 'currentSelectionTimestamp'])

        const currentUrl = tab.url || ''
        const currentDomain = currentUrl.split('/').slice(0, 3).join('/')

        // 检查实时选中文本是否有效（同域名，30秒内）
        if (realtime.currentSelection) {
          const realtimeDomain = (realtime.currentSelectionUrl || '').split('/').slice(0, 3).join('/')
          const isRecent = realtime.currentSelectionTimestamp && (Date.now() - realtime.currentSelectionTimestamp < 30000)

          if (currentDomain === realtimeDomain || isRecent) {
            setInputText(realtime.currentSelection)
            setRealtimeText(realtime.currentSelection)
            // 设置标题
            if (realtime.currentSelectionTitle) {
              setInputTitle(realtime.currentSelectionTitle)
              setRealtimeTitle(realtime.currentSelectionTitle)
            }
            setMode('selected')
            return
          }
        }

        // 降级：从右键菜单缓存读取
        const cached = await chrome.storage.local.get(['cachedSelectedText', 'cachedTabUrl', 'cachedTimestamp'])
        const cachedUrl = cached.cachedTabUrl || ''
        const cachedDomain = cachedUrl.split('/').slice(0, 3).join('/')
        const isRecent = cached.cachedTimestamp && (Date.now() - cached.cachedTimestamp < 30000)

        if (cached.cachedSelectedText && (currentDomain === cachedDomain || isRecent)) {
          setInputText(cached.cachedSelectedText)
          setRealtimeText(cached.cachedSelectedText)
          setMode('selected')
          // 清除缓存
          await chrome.storage.local.remove(['cachedSelectedText', 'cachedTabUrl', 'cachedTimestamp'])
        }
      } catch (error) {
        console.error('Failed to get cached text:', error)
      }
    }
    getInitialText()

    // 监听来自 content.js 的实时消息
    const handleMessage = (message: { type: string; data: { text: string; title?: string; url: string; timestamp: number } }) => {
      if (message.type === 'NEW_SELECTION_DETECTED') {
        setRealtimeText(message.data.text)
        setRealtimeTitle(message.data.title || '')
        // 始终更新输入框
        setInputText(message.data.text)
        if (message.data.title) {
          setInputTitle(message.data.title)
        }
        // 切换到选中模式
        setMode('selected')
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [])

  // 当 originalText 更新时，同步到 inputText
  useEffect(() => {
    if (originalText) {
      setInputText(originalText)
    }
  }, [originalText])

  const loadModels = async () => {
    try {
      const result = await chrome.storage.local.get(['modelSettings'])
      const settings: SettingsData = result.modelSettings
      if (settings?.models) {
        setModels(settings.models)
        setSelectedModelId(settings.defaultModelId || settings.models[0]?.id)
      }

      // 加载自定义提示词
      const customResult = await chrome.storage.local.get(['customPrompts'])
      if (customResult.customPrompts) {
        setCustomPrompts(customResult.customPrompts)
      }
    } catch (error) {
      console.error('Failed to load models:', error)
    }
  }

  const handleSaveCustomPrompt = async () => {
    if (!newCustomName.trim() || !newCustomPrompt.trim()) {
      alert('请输入名称和提示词')
      return
    }
    const newPrompt: CustomPrompt = {
      id: `custom-${Date.now()}`,
      name: newCustomName,
      prompt: newCustomPrompt
    }
    const updatedPrompts = [...customPrompts, newPrompt]
    setCustomPrompts(updatedPrompts)
    await chrome.storage.local.set({ customPrompts: updatedPrompts })
    setNewCustomName('')
    setNewCustomPrompt('')
    setShowCustomModal(false)
  }

  const handleDeleteCustomPrompt = async (id: string) => {
    const updatedPrompts = customPrompts.filter(p => p.id !== id)
    setCustomPrompts(updatedPrompts)
    await chrome.storage.local.set({ customPrompts: updatedPrompts })
  }

  const optimizeTextWithCustomPrompt = async (customPrompt: string) => {
    if (!inputText.trim()) {
      setError('请输入要优化的文本')
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

      const targetLabel = optimizeTarget === 'title' ? '标题' : '内容'
      const promptText = customPrompt.replace(/{内容}/g, inputText).replace(/{target}/g, targetLabel)
      const fullPrompt = `${promptText}\n\n请直接输出优化后的文本，不要添加任何解释。`

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      if (selectedModel.authType === 'Bearer') {
        headers['Authorization'] = `Bearer ${selectedModel.apiKey}`
      } else if (selectedModel.authType === 'ApiKey') {
        headers['X-API-Key'] = selectedModel.apiKey
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
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: { maxOutputTokens: 2000 }
        }
      } else if (isAnthropic) {
        body = {
          model: selectedModel.model,
          max_tokens: 2000,
          messages: [{ role: 'user', content: fullPrompt }]
        }
      } else {
        body = {
          model: selectedModel.model,
          messages: [
            { role: 'system', content: '你是一个专业的文本编辑助手。请直接输出优化后的文本，不要添加任何解释。' },
            { role: 'user', content: fullPrompt }
          ],
          max_tokens: 2000
        }
      }

      const response = await fetch(selectedModel.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      })

      const data = await response.json()
      let result = ''

      if (isGoogle) {
        result = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      } else if (isAnthropic) {
        result = data.content?.[0]?.text || ''
      } else {
        result = data.choices?.[0]?.message?.content || ''
      }

      if (!result) {
        setError(data.error?.message || '优化失败，请重试')
        return
      }

      setOptimizedText(result)
    } catch (error) {
      setError(error instanceof Error ? error.message : '优化失败')
    } finally {
      setLoading(false)
    }
  }

  const optimizeText = async (type: OptimizeType) => {
    if (type === 'custom') {
      setShowCustomModal(true)
      return
    }

    if (!inputText.trim()) {
      setError('请输入要优化的文本')
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

      const targetLabel = optimizeTarget === 'title' ? '标题' : '内容'
      const prompts: Record<OptimizeType, string> = {
        improve: `请优化以下${targetLabel}，使其更加流畅、专业：\n\n${inputText}`,
        simplify: `请简化以下${targetLabel}，使其更加通俗易懂：\n\n${inputText}`,
        expand: `请扩展以下${targetLabel}，使其更加详细丰富：\n\n${inputText}`,
        formal: `请将以下${targetLabel}改写为正式语气：\n\n${inputText}`,
        casual: `请将以下${targetLabel}改写为轻松、口语化的风格：\n\n${inputText}`,
        funny: `请将以下${targetLabel}改写为搞笑的风格，增加趣味性：\n\n${inputText}`,
        humor: `请将以下${targetLabel}改写为幽默的风格：\n\n${inputText}`,
        blog: `请将以下${targetLabel}改写为博客风格，更适合网络阅读：\n\n${inputText}`,
        media: `请将以下${targetLabel}改写为自媒体风格，更适合短视频平台：\n\n${inputText}`,
        custom: inputText
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
          contents: [{ parts: [{ text: prompts[type] }] }],
          generationConfig: { maxOutputTokens: 2000 }
        }
        delete headers['Authorization']
        delete headers['x-api-key']
      } else if (isAnthropic) {
        body = {
          model: selectedModel.model,
          max_tokens: 2000,
          messages: [
            { role: 'user', content: `你是一个专业的文本编辑助手。请直接输出优化后的文本，不要添加任何解释。\n\n${prompts[type]}` }
          ]
        }
      } else {
        body = {
          model: selectedModel.model,
          messages: [
            { role: 'system', content: '你是一个专业的文本编辑助手。请直接输出优化后的文本，不要添加任何解释。' },
            { role: 'user', content: prompts[type] }
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
        setOptimizedText(data.candidates?.[0]?.content?.parts?.[0]?.text || '无结果')
      } else if (isAnthropic) {
        setOptimizedText(data.content?.[0]?.text || '无结果')
      } else {
        setOptimizedText(data.choices?.[0]?.message?.content || '无结果')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '优化失败'
      console.error('API Error:', errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleReplace = () => {
    if (!optimizedText) return

    if (mode === 'selected' && originalText) {
      // 在选中模式下，替换页面中的文本
      onReplace(optimizedText)
    } else {
      // 在手动输入模式下，复制到剪贴板
      navigator.clipboard.writeText(optimizedText)
    }
  }

  // 导出为 TXT
  const exportToTxt = () => {
    const content = `文本优化结果
${'='.repeat(30)}

原文:
${inputText}

优化后:
${optimizedText}

生成时间: ${new Date().toLocaleString()}`

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `text-optimized-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 导出为 Word
  const exportToWord = () => {
    const html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
<meta charset="utf-8">
<title>文本优化结果</title>
</head>
<body>
<h1>文本优化结果</h1>
<hr>
<h2>原文</h2>
<pre style="white-space: pre-wrap;">${inputText}</pre>
<hr>
<h2>优化后</h2>
<pre style="white-space: pre-wrap;">${optimizedText}</pre>
<p><em>生成时间: ${new Date().toLocaleString()}</em></p>
</body>
</html>`

    const blob = new Blob([html], { type: 'application/msword;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `text-optimized-${Date.now()}.doc`
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
<title>文本优化结果</title>
<style>
body { font-family: SimSun, serif; padding: 20px; }
h1 { text-align: center; }
h2 { margin-top: 20px; }
pre { white-space: pre-wrap; background: #f9f9f9; padding: 10px; }
</style>
</head>
<body>
<h1>文本优化结果</h1>
<hr>
<h2>原文</h2>
<pre>${inputText}</pre>
<hr>
<h2>优化后</h2>
<pre>${optimizedText}</pre>
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
        <h1 className="text-lg font-semibold text-gray-800">{t.textOptimizer}</h1>
      </div>

      <div className="mb-3">
        <label className="block text-xs text-gray-500 mb-1">{t.selectModel}</label>
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

      {/* 输入模式切换 */}
      <div className="mb-3">
        <label className="text-xs text-gray-500 mb-2 block">{t.inputMethod}</label>

        {/* 状态提示 - 改为检查 inputText 而不是 originalText */}
        {mode === 'selected' && inputText && (
          <div className="mb-2 text-xs text-green-600 bg-green-50 p-2 rounded">
            ✓ 已获取选中文本 ({inputText.length} 字符)
          </div>
        )}
        {mode === 'selected' && !inputText && (
          <div className="mb-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
            ⚠ {t.noSelection}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => setMode('manual')}
            className={`flex-1 py-1.5 rounded text-xs ${
              mode === 'manual' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t.manual}
          </button>
          <button
            onClick={() => {
              // 直接使用内存中的实时文本
              if (realtimeText) {
                setInputText(realtimeText)
              }
              setMode('selected')
            }}
            className={`flex-1 py-1.5 rounded text-xs ${
              mode === 'selected' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t.selectedContent} {inputText ? '' : `(${t.noSelection})`}
          </button>
        </div>
        {/* 重新获取按钮 - 始终显示 */}
        <button
          onClick={async () => {
              // 优先使用内存中的实时文本
              if (realtimeText) {
                setInputText(realtimeText)
                if (realtimeTitle) {
                  setInputTitle(realtimeTitle)
                }
                setMode('selected')
                return
              }

              // 尝试从 storage 读取
              try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
                if (tab.id) {
                  const storageData = await chrome.storage.local.get(['currentSelection', 'currentSelectionTitle', 'currentSelectionTimestamp'])
                  const isRecent = storageData.currentSelectionTimestamp && (Date.now() - storageData.currentSelectionTimestamp < 30000)
                  if (storageData.currentSelection && isRecent) {
                    setInputText(storageData.currentSelection)
                    if (storageData.currentSelectionTitle) {
                      setInputTitle(storageData.currentSelectionTitle)
                    }
                    setMode('selected')
                    return
                  }
                }
              } catch (e) {
                console.error('Storage read error:', e)
              }

              // 最后尝试：触发页面复制并读取剪贴板
              try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
                if (tab.id) {
                  // 先尝试用 executeScript 获取（使用 world: "MAIN"）
                  const results = await chrome.scripting.executeScript({
                    target: { tabId: tab.id, allFrames: true },
                    world: 'MAIN',
                    func: () => {
                      const selection = window.getSelection()
                      if (selection && !selection.isCollapsed) {
                        return selection.toString().trim()
                      }
                      return null
                    }
                  })
                  const validResult = results?.find(r => r.result)
                  if (validResult?.result) {
                    setInputText(validResult.result)
                    setMode('selected')
                    return
                  }
                }
              } catch (e) {
                console.error('ExecuteScript error:', e)
              }

              alert('请先在页面中选中文字')
            }}
            className="mt-2 text-xs text-purple-500 hover:text-purple-600"
          >
            {t.selectedContent}
          </button>
      </div>

      <div className="mb-3">
        <label className="text-xs text-gray-500 mb-1 block">
          {mode === 'manual' ? '输入要优化的文本' : '原文'}
        </label>
        {/* 标题输入框 */}
        <input
          type="text"
          value={inputTitle}
          onChange={(e) => setInputTitle(e.target.value)}
          placeholder="标题（可选）"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 mb-2"
        />
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="请输入要优化的文本..."
          className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 resize-none"
          rows={4}
          style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
        />
      </div>

      <div className="mb-4">
        <label className="text-xs text-gray-500 mb-2 block">优化目标</label>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setOptimizeTarget('content')}
            disabled={loading}
            className={`flex-1 py-1.5 rounded text-xs ${optimizeTarget === 'content' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            内容
          </button>
          <button
            onClick={() => setOptimizeTarget('title')}
            disabled={loading}
            className={`flex-1 py-1.5 rounded text-xs ${optimizeTarget === 'title' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            标题
          </button>
        </div>

        <label className="text-xs text-gray-500 mb-2 block">优化方式</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => optimizeText('improve')}
            disabled={loading}
            className="px-2 py-1.5 bg-blue-50 hover:bg-blue-100 disabled:bg-gray-100 text-blue-600 rounded text-xs"
          >
            优化
          </button>
          <button
            onClick={() => optimizeText('simplify')}
            disabled={loading}
            className="px-2 py-1.5 bg-blue-50 hover:bg-blue-100 disabled:bg-gray-100 text-blue-600 rounded text-xs"
          >
            简化
          </button>
          <button
            onClick={() => optimizeText('expand')}
            disabled={loading}
            className="px-2 py-1.5 bg-blue-50 hover:bg-blue-100 disabled:bg-gray-100 text-blue-600 rounded text-xs"
          >
            扩展
          </button>
          <button
            onClick={() => optimizeText('formal')}
            disabled={loading}
            className="px-2 py-1.5 bg-purple-50 hover:bg-purple-100 disabled:bg-gray-100 text-purple-600 rounded text-xs"
          >
            正式
          </button>
          <button
            onClick={() => optimizeText('casual')}
            disabled={loading}
            className="px-2 py-1.5 bg-purple-50 hover:bg-purple-100 disabled:bg-gray-100 text-purple-600 rounded text-xs"
          >
            口语
          </button>
          <button
            onClick={() => optimizeText('funny')}
            disabled={loading}
            className="px-2 py-1.5 bg-pink-50 hover:bg-pink-100 disabled:bg-gray-100 text-pink-600 rounded text-xs"
          >
            搞笑
          </button>
          <button
            onClick={() => optimizeText('humor')}
            disabled={loading}
            className="px-2 py-1.5 bg-pink-50 hover:bg-pink-100 disabled:bg-gray-100 text-pink-600 rounded text-xs"
          >
            幽默
          </button>
          <button
            onClick={() => optimizeText('blog')}
            disabled={loading}
            className="px-2 py-1.5 bg-green-50 hover:bg-green-100 disabled:bg-gray-100 text-green-600 rounded text-xs"
          >
            博客
          </button>
          <button
            onClick={() => optimizeText('media')}
            disabled={loading}
            className="px-2 py-1.5 bg-green-50 hover:bg-green-100 disabled:bg-gray-100 text-green-600 rounded text-xs"
          >
            自媒体
          </button>
        </div>

        {/* 自定义优化按钮 */}
        <div className="mt-3">
          <button
            onClick={() => setShowCustomModal(true)}
            className="w-full py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-xs"
          >
            + 自定义优化方式
          </button>
        </div>

        {/* 自定义优化方式列表 */}
        {customPrompts.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {customPrompts.map(prompt => (
              <div key={prompt.id} className="group flex items-center">
                <button
                  onClick={() => {
                    // 使用自定义提示词
                    optimizeTextWithCustomPrompt(prompt.prompt)
                  }}
                  disabled={loading}
                  className="px-2 py-1 bg-amber-50 hover:bg-amber-100 disabled:bg-gray-100 text-amber-600 rounded text-xs"
                >
                  {prompt.name}
                </button>
                <button
                  onClick={() => handleDeleteCustomPrompt(prompt.id)}
                  className="ml-1 text-gray-400 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {optimizedText && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs text-gray-500">优化后</label>
            <div className="flex gap-2">
              <button onClick={exportToTxt} className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">TXT</button>
              <button onClick={exportToWord} className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">Word</button>
              <button onClick={exportToPdf} className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">PDF</button>
            </div>
          </div>
          <textarea
            value={optimizedText}
            onChange={(e) => setOptimizedText(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none"
            rows={4}
            style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
          />
        </div>
      )}

      {loading && (
        <div className="text-center py-4 text-gray-500">
          优化中...
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => {
            navigator.clipboard.writeText(optimizedText)
          }}
          disabled={!optimizedText}
          className="flex-1 py-2 border border-gray-200 hover:bg-gray-50 disabled:bg-gray-100 text-gray-700 rounded-lg transition-colors"
        >
          复制
        </button>
        {onInsertAtCursor && (
          <button
            onClick={() => {
              if (optimizedText) {
                onInsertAtCursor(optimizedText)
              }
            }}
            disabled={!optimizedText}
            className="flex-1 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-lg transition-colors"
          >
            插入页面
          </button>
        )}
        <button
          onClick={handleReplace}
          disabled={!optimizedText}
          className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
        >
          {mode === 'selected' && originalText ? '替换原文' : '复制结果'}
        </button>
      </div>

      {/* 自定义优化方式弹窗 */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-80 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-3">添加自定义优化方式</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">名称</label>
                <input
                  type="text"
                  value={newCustomName}
                  onChange={(e) => setNewCustomName(e.target.value)}
                  placeholder="如：营销文案"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">提示词</label>
                <textarea
                  value={newCustomPrompt}
                  onChange={(e) => setNewCustomPrompt(e.target.value)}
                  placeholder="请将以下{内容}改写为...&#10;提示词中可用 {内容} 表示要优化的文本，{target} 表示优化目标（标题/内容）"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowCustomModal(false)
                    setNewCustomName('')
                    setNewCustomPrompt('')
                  }}
                  className="flex-1 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveCustomPrompt}
                  className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-sm"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
