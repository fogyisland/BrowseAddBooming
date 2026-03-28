import { useState, useEffect } from 'react'

interface PageInfo {
  url: string
  title: string
  domain: string
  protocol: string
  userAgent: string
  language: string
  platform: string
  cookies: string
  referrer: string
  screenWidth: number
  screenHeight: number
  viewportWidth: number
  viewportHeight: number
  online: boolean
  connectionType: string
  doNotTrack: string
  hardwareConcurrency: number
  deviceMemory: number
}

interface PageInfoProps {
  onBack: () => void
}

export default function PageInfo({ onBack }: PageInfoProps) {
  const [info, setInfo] = useState<PageInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'basic' | 'screen' | 'device'>('basic')

  useEffect(() => {
    analyzePageInfo()
  }, [])

  const analyzePageInfo = async () => {
    setLoading(true)
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab.id) return

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const nav = navigator
          const screen = window.screen
          const conn = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection

          return {
            url: window.location.href,
            title: document.title,
            domain: window.location.hostname,
            protocol: window.location.protocol,
            userAgent: nav.userAgent,
            language: nav.language,
            platform: nav.platform,
            cookies: document.cookie || '(无Cookie)',
            referrer: document.referrer || '(无Referrer)',
            screenWidth: screen.width,
            screenHeight: screen.height,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            online: nav.onLine,
            connectionType: conn?.effectiveType || 'unknown',
            doNotTrack: nav.doNotTrack || 'unspecified',
            hardwareConcurrency: nav.hardwareConcurrency || 0,
            deviceMemory: (nav as Navigator & { deviceMemory?: number }).deviceMemory || 0
          }
        }
      })

      const validResult = results?.find(r => r.result)
      if (validResult?.result) {
        setInfo(validResult.result)
      }
    } catch (error) {
      console.error('Failed to analyze page info:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const renderBasicInfo = () => {
    if (!info) return null
    return (
      <div className="space-y-3">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">URL</div>
          <div className="text-sm break-all">{info.url}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">页面标题</div>
          <div className="text-sm">{info.title}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">域名</div>
          <div className="text-sm">{info.domain}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">协议</div>
          <div className="text-sm">{info.protocol}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-1">
            <div className="text-xs text-gray-500">UserAgent</div>
            <button
              onClick={() => copyToClipboard(info.userAgent)}
              className="text-xs text-blue-500 hover:text-blue-700"
            >
              复制
            </button>
          </div>
          <div className="text-xs break-all text-gray-600">{info.userAgent}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">语言</div>
          <div className="text-sm">{info.language}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-1">
            <div className="text-xs text-gray-500">Referrer</div>
            <button
              onClick={() => copyToClipboard(info.referrer)}
              className="text-xs text-blue-500 hover:text-blue-700"
            >
              复制
            </button>
          </div>
          <div className="text-xs break-all text-gray-600">{info.referrer}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-1">
            <div className="text-xs text-gray-500">Cookies</div>
            <button
              onClick={() => copyToClipboard(info.cookies)}
              className="text-xs text-blue-500 hover:text-blue-700"
            >
              复制
            </button>
          </div>
          <div className="text-xs break-all text-gray-600 max-h-24 overflow-auto">{info.cookies}</div>
        </div>
      </div>
    )
  }

  const renderScreenInfo = () => {
    if (!info) return null
    return (
      <div className="space-y-3">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">屏幕分辨率</div>
          <div className="text-sm">{info.screenWidth} x {info.screenHeight}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">视口大小</div>
          <div className="text-sm">{info.viewportWidth} x {info.viewportHeight}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">在线状态</div>
          <div className="text-sm">
            {info.online ? (
              <span className="text-green-600">在线</span>
            ) : (
              <span className="text-red-600">离线</span>
            )}
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">网络类型</div>
          <div className="text-sm">{info.connectionType}</div>
        </div>
      </div>
    )
  }

  const renderDeviceInfo = () => {
    if (!info) return null
    return (
      <div className="space-y-3">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">平台</div>
          <div className="text-sm">{info.platform}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">CPU核心数</div>
          <div className="text-sm">{info.hardwareConcurrency} 核</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">设备内存</div>
          <div className="text-sm">{info.deviceMemory ? `${info.deviceMemory} GB` : '未知'}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Do Not Track</div>
          <div className="text-sm">{info.doNotTrack}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-700 text-xl">←</button>
          <h2 className="text-lg font-semibold">页面信息</h2>
        </div>
        <button
          onClick={analyzePageInfo}
          disabled={loading}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
          title="刷新"
        >
          🔄
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">加载中...</div>
      ) : (
        <>
          {/* 标签切换 */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('basic')}
              className={`flex-1 py-2 rounded text-sm ${activeTab === 'basic' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              基础信息
            </button>
            <button
              onClick={() => setActiveTab('screen')}
              className={`flex-1 py-2 rounded text-sm ${activeTab === 'screen' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              屏幕
            </button>
            <button
              onClick={() => setActiveTab('device')}
              className={`flex-1 py-2 rounded text-sm ${activeTab === 'device' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              设备
            </button>
          </div>

          {/* 内容 */}
          {activeTab === 'basic' && renderBasicInfo()}
          {activeTab === 'screen' && renderScreenInfo()}
          {activeTab === 'device' && renderDeviceInfo()}

          {/* 导出按钮 */}
          {info && (
            <button
              onClick={() => {
                const data = JSON.stringify(info, null, 2)
                const blob = new Blob([data], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `page-info-${Date.now()}.json`
                a.click()
                URL.revokeObjectURL(url)
              }}
              className="w-full mt-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
            >
              导出JSON
            </button>
          )}
        </>
      )}
    </div>
  )
}
