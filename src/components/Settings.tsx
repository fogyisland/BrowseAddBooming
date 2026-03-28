import { useState, useEffect } from 'react'
import { useLanguage, Language } from '../i18n'
import { ArrowLeft, Heart, Check, Plus, Trash2, Settings2, Globe, Upload, Copy } from 'lucide-react'

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
  const [showSponsor, setShowSponsor] = useState(false)

  const handleIconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    if (file.size > 200 * 102) {
      alert('图片大小不能超过200KB')
      return
    }

    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const base64 = event.target?.result as string
        setIconPreview(base64)
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
      name: t.addModel,
      model: 'gpt-4o',
      endpoint: '',
      apiKey: '',
      authType: 'Bearer'
    }
    setSettings(prev => ({
      ...prev,
      models: [...prev.models, newModel],
      defaultModelId: newId
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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    alert(`${label} ${t.addressCopied}`)
  }

  return (
    <div className="p-4 max-h-[600px] overflow-y-auto">
      {/* 头部 */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <Settings2 className="w-6 h-6 text-gray-600" />
        <h1 className="text-lg font-semibold text-gray-800">{t.settings}</h1>
        <button
          onClick={() => setShowSponsor(!showSponsor)}
          className="ml-auto flex items-center gap-1 text-xs px-2 py-1 bg-red-50 text-red-500 rounded hover:bg-red-100"
        >
          <Heart className="w-4 h-4 fill-current" />
          <span>{t.sponsor}</span>
        </button>
      </div>

      {/* 赞助信息 */}
      {showSponsor && (
        <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
          <h3 className="font-medium text-red-700 mb-2">{t.sponsorTitle}</h3>
          <p className="text-xs text-gray-600 mb-3">{t.sponsorSubtitle}</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                <span className="font-bold">₮</span> {t.trc20}
              </span>
              <code className="text-xs flex-1 bg-white px-2 py-1 rounded border truncate font-mono">
                TPyLfYoN2oXBHfJtdX6jwS2PXB8xkA5XHu
              </code>
              <button
                onClick={() => copyToClipboard('TPyLfYoN2oXBHfJtdX6jwS2PXB8xkA5XHu', 'TRC20')}
                className="flex items-center gap-1 text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                $ {t.paypal}
              </span>
              <code className="text-xs flex-1 bg-white px-2 py-1 rounded border truncate font-mono">
                10853913@qq.com
              </code>
              <button
                onClick={() => copyToClipboard('10853913@qq.com', 'PayPal')}
                className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                <Globe className="w-3 h-3" /> {t.wechat}
              </span>
              <code className="text-xs flex-1 bg-white px-2 py-1 rounded border truncate font-mono">
                xpcustomer
              </code>
              <button
                onClick={() => copyToClipboard('xpcustomer', 'WeChat')}
                className="flex items-center gap-1 text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 语言选择 */}
      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
        <label className="block text-xs font-medium text-gray-700 mb-2">{t.language}</label>
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
      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-orange-400 rounded-full flex items-center justify-center overflow-hidden">
            {iconPreview ? (
              <img src={iconPreview} alt="Icon" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[30px] leading-none">👶</span>
            )}
          </div>
          <div className="flex-1">
            <label className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg cursor-pointer transition-colors">
              <Upload className="w-3 h-3" />
              <span>{t.changeIcon}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleIconChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* 模型选择 */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-gray-700">{t.modelSettings}</h2>
          <button
            onClick={addModel}
            className="flex items-center gap-1 text-xs px-2 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100"
          >
            <Plus className="w-3 h-3" />
            <span>{t.addModel}</span>
          </button>
        </div>
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
      </div>

      {/* 模型配置 */}
      {currentModel && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t.modelName}</label>
              <input
                type="text"
                value={currentModel.name}
                onChange={(e) => updateModel(currentModel.id, 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Model</label>
              <input
                type="text"
                value={currentModel.model}
                onChange={(e) => updateModel(currentModel.id, 'model', e.target.value)}
                placeholder="gpt-4o"
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">{t.modelEndpoint}</label>
              <input
                type="text"
                value={currentModel.endpoint}
                onChange={(e) => updateModel(currentModel.id, 'endpoint', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t.apiKey}</label>
                <input
                  type="password"
                  value={currentModel.apiKey}
                  onChange={(e) => updateModel(currentModel.id, 'apiKey', e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t.authType}</label>
                <select
                  value={currentModel.authType}
                  onChange={(e) => updateModel(currentModel.id, 'authType', e.target.value as ModelConfig['authType'])}
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="Bearer">Bearer</option>
                  <option value="ApiKey">ApiKey</option>
                  <option value="Basic">Basic</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={currentModel.id === settings.defaultModelId}
                  onChange={() => setSettings(prev => ({ ...prev, defaultModelId: currentModel.id }))}
                  className="rounded"
                />
                <span className="text-xs text-gray-600">{t.defaultModel}</span>
              </label>
              {currentModel.id.startsWith('custom-') && (
                <button
                  onClick={() => removeModel(currentModel.id)}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{t.delete}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 保存按钮 */}
      <button
        onClick={handleSave}
        className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors mb-2 flex items-center justify-center gap-2"
      >
        {saved && <Check className="w-4 h-4" />}
        <span>{saved ? t.success : t.save}</span>
      </button>

      {/* 版本信息 */}
      <div className="text-center text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-1">
        小铭助手 v1.0.1 · Made with <Heart className="w-4 h-4 text-red-400 fill-current" /> by fogyisland
      </div>
    </div>
  )
}
