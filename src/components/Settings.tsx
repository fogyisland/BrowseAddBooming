import { useState, useEffect } from 'react'
import { useLanguage, Language } from '../i18n'

interface SettingsProps {
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

const DEFAULT_MODELS: ModelConfig[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    model: 'gpt-4o',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: '',
    authType: 'Bearer'
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    model: 'claude-sonnet-4-20250514',
    endpoint: 'https://api.anthropic.com/v1/messages',
    apiKey: '',
    authType: 'Bearer'
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    model: 'gemini-1.5-pro',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
    apiKey: '',
    authType: 'ApiKey'
  }
]

export default function Settings({ onBack }: SettingsProps) {
  const { t, language, setLanguage } = useLanguage()
  const [settings, setSettings] = useState<SettingsData>({
    models: DEFAULT_MODELS,
    defaultModelId: 'gpt-4o'
  })
  const [saved, setSaved] = useState(false)
  const [expandedModelId, setExpandedModelId] = useState<string | null>('gpt-4o')
  const [iconPreview, setIconPreview] = useState<string>('')

  const handleIconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    // 验证文件大小 (最大 200KB)
    if (file.size > 200 * 1024) {
      alert('图片大小不能超过200KB')
      return
    }

    try {
      // 读取图片为 base64
      const reader = new FileReader()
      reader.onload = async (event) => {
        const base64 = event.target?.result as string
        setIconPreview(base64)

        // 保存到存储
        await chrome.storage.local.set({ customIcon: base64 })
        alert('头像已更新，刷新扩展后生效')
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Failed to save icon:', error)
      alert('保存头像失败')
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const result = await chrome.storage.local.get(['modelSettings'])
      if (result.modelSettings) {
        setSettings(result.modelSettings)
        setExpandedModelId(result.modelSettings.defaultModelId || result.modelSettings.models[0]?.id || null)
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  const handleSave = async () => {
    try {
      await chrome.storage.local.set({ modelSettings: settings })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  const updateModel = (id: string, field: keyof ModelConfig, value: string) => {
    setSettings(prev => ({
      ...prev,
      models: prev.models.map(m => m.id === id ? { ...m, [field]: value } : m)
    }))
  }

  const addModel = () => {
    const newId = `custom-${Date.now()}`
    const newModel: ModelConfig = {
      id: newId,
      name: '新模型',
      model: 'gpt-4o',
      endpoint: '',
      apiKey: '',
      authType: 'Bearer'
    }
    setSettings(prev => ({
      ...prev,
      models: [...prev.models, newModel],
      defaultModelId: newId // 自动选中新添加的模型
    }))
    setExpandedModelId(newId)
  }

  const removeModel = (id: string) => {
    setSettings(prev => {
      const newModels = prev.models.filter(m => m.id !== id)
      if (newModels.length === 0) {
        return {
          models: DEFAULT_MODELS,
          defaultModelId: DEFAULT_MODELS[0].id
        }
      }
      const newDefault = prev.defaultModelId === id
        ? newModels[0].id
        : prev.defaultModelId
      return { ...prev, models: newModels, defaultModelId: newDefault }
    })
    if (expandedModelId === id) {
      setExpandedModelId(settings.models[0]?.id || null)
    }
  }

  const handleModelSelect = (id: string) => {
    setExpandedModelId(id)
    setSettings(prev => ({ ...prev, defaultModelId: id }))
  }

  const currentModel = settings.models.find(m => m.id === expandedModelId)

  return (
    <div className="p-4 max-h-[500px] overflow-y-auto">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          ←
        </button>
        <h1 className="text-lg font-semibold text-gray-800">{t.settings}</h1>
      </div>

      {/* 语言选择 */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">{t.language}</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
        >
          <option value="zh-CN">{t.chinese} (简体)</option>
          <option value="zh-TW">{t.chineseTraditional} (繁體)</option>
          <option value="en">{t.english}</option>
          <option value="fr">{t.french}</option>
          <option value="es">{t.spanish}</option>
        </select>
      </div>

      {/* 头像设置 */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">插件头像</label>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center overflow-hidden">
            {iconPreview ? (
              <img src={iconPreview} alt="Icon" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-lg">🤖</span>
            )}
          </div>
          <div className="flex-1">
            <label className="inline-flex items-center px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg cursor-pointer transition-colors">
              <span>更换头像</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleIconChange}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-1">建议尺寸: 128x128，不超过200KB</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* 已配置的模型下拉选择 */}
        <section>
          <h2 className="text-sm font-medium text-gray-700 mb-3">{t.modelSettings}</h2>
          <select
            value={expandedModelId || ''}
            onChange={(e) => handleModelSelect(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
          >
            {settings.models.map(model => (
              <option key={model.id} value={model.id}>
                {model.name} {model.id === settings.defaultModelId ? `(${t.defaultModel})` : ''}
              </option>
            ))}
          </select>
        </section>

        {/* 当前选中模型的配置 */}
        {currentModel && (
          <section>
            <h2 className="text-sm font-medium text-gray-700 mb-3">模型配置</h2>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">模型名称</label>
                  <input
                    type="text"
                    value={currentModel.name}
                    onChange={(e) => updateModel(currentModel.id, 'name', e.target.value)}
                    placeholder="模型名称"
                    className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">模型 (Model)</label>
                  <input
                    type="text"
                    value={currentModel.model}
                    onChange={(e) => updateModel(currentModel.id, 'model', e.target.value)}
                    placeholder="gpt-4o"
                    className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">API 端点</label>
                  <input
                    type="text"
                    value={currentModel.endpoint}
                    onChange={(e) => updateModel(currentModel.id, 'endpoint', e.target.value)}
                    placeholder="https://api.example.com/v1/chat/completions"
                    className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">API Key</label>
                    <input
                      type="password"
                      value={currentModel.apiKey}
                      onChange={(e) => updateModel(currentModel.id, 'apiKey', e.target.value)}
                      placeholder="sk-..."
                      className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">认证方式</label>
                    <select
                      value={currentModel.authType}
                      onChange={(e) => updateModel(currentModel.id, 'authType', e.target.value as ModelConfig['authType'])}
                      className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="Bearer">Bearer</option>
                      <option value="ApiKey">ApiKey</option>
                      <option value="Basic">Basic</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={currentModel.id === settings.defaultModelId}
                      onChange={() => setSettings(prev => ({ ...prev, defaultModelId: currentModel.id }))}
                      className="rounded"
                    />
                    <span className="text-xs text-gray-600">设为默认模型</span>
                  </label>
                  <button
                    onClick={() => removeModel(currentModel.id)}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    删除模型
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 添加模型按钮 */}
        <button
          onClick={addModel}
          className="w-full py-2 border border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-gray-400 hover:text-gray-600 transition-colors"
        >
          + 添加新模型
        </button>

        <button
          onClick={handleSave}
          className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          {saved ? '✓ 已保存' : '保存设置'}
        </button>
      </div>
    </div>
  )
}
