import { useState } from 'react'
import { useLanguage } from '../i18n'

interface PopupProps {
  onAnalyzePage: () => void
  onOptimizeText: () => void
  onGenerateText: () => void
  onOpenSettings: () => void
  onAnalyzeLinks?: () => void
  onOpenPageInfo?: () => void
  onOpenExtractor?: () => void
  onOpenVideoSniffer?: () => void
  onOpenAdminSniffer?: () => void
  onOpenSecurityAnalyzer?: () => void
  onOpenUrlDecoder?: () => void
  onOpenEmailHeaderParser?: () => void
  onOpenDomainLookup?: () => void
  onOpenWhoisLookup?: () => void
  onOpenDataParser?: () => void
}

export default function Popup({ onAnalyzePage, onOptimizeText, onGenerateText, onOpenSettings, onAnalyzeLinks, onOpenPageInfo, onOpenExtractor, onOpenVideoSniffer, onOpenAdminSniffer, onOpenSecurityAnalyzer, onOpenUrlDecoder, onOpenEmailHeaderParser, onOpenDomainLookup, onOpenWhoisLookup, onOpenDataParser }: PopupProps) {
  const { t } = useLanguage()
  const [sidePanelEnabled, setSidePanelEnabled] = useState(false)

  const handleToggleSidePanel = async () => {
    const newValue = !sidePanelEnabled
    setSidePanelEnabled(newValue)
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tab?.id) {
        if (newValue) {
          // 启用并打开侧边栏
          await chrome.sidePanel.setOptions({
            tabId: tab.id,
            path: 'sidepanel.html',
            enabled: true
          })
          await chrome.sidePanel.open({ tabId: tab.id })
        } else {
          // 禁用侧边栏
          await chrome.sidePanel.setOptions({
            tabId: tab.id,
            enabled: false
          })
        }
      }
    } catch (e) {
      console.error('Side panel error:', e)
    }
  }

  return (
    <div className="p-4">
      {/* 顶部标题栏：图标 + 标题 + 侧边栏开关 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">🤖</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-800">{t.aiAssistant}</h1>
            <p className="text-sm text-gray-500">{t.analyzePageDesc}</p>
          </div>
        </div>
        {/* 侧边栏开关 Toggle */}
        <div className="flex items-center gap-4">
          {/* 快捷键提示 */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
            <span className="px-1.5 py-0.5 bg-gray-100 rounded">Ctrl+Shift+A</span>
            <span className="px-1.5 py-0.5 bg-gray-100 rounded">Ctrl+Shift+J</span>
          </div>
          <button
            onClick={onOpenSettings}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={t.settings}
          >
            <span className="text-gray-600">⚙️</span>
          </button>
          <button
            onClick={handleToggleSidePanel}
            className="flex items-center gap-2 group px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            title={sidePanelEnabled ? '关闭侧边栏' : '开启侧边栏'}
          >
            <span className="text-sm font-medium text-gray-600">{t.sidebarMode}</span>
            <div
              className={`relative w-10 h-5 rounded-full transition-colors ${
                sidePanelEnabled ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow ${
                  sidePanelEnabled ? 'translate-x-5' : ''
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={onAnalyzePage}
          className="w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white">📄</span>
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-800">{t.analyzePage}</div>
            <div className="text-sm text-gray-500">{t.analyzePageDesc}</div>
          </div>
        </button>

        <button
          onClick={onOptimizeText}
          className="w-full p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white">✏️</span>
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-800">{t.optimizeText}</div>
            <div className="text-sm text-gray-500">{t.optimizeTextDesc}</div>
          </div>
        </button>

        <button
          onClick={onGenerateText}
          className="w-full p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
            <span className="text-white">✨</span>
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-800">{t.generateText}</div>
            <div className="text-sm text-gray-500">{t.generateTextDesc}</div>
          </div>
        </button>

        <button
          onClick={() => {
            if (onAnalyzeLinks) {
              onAnalyzeLinks()
            } else {
              onOpenSettings()
            }
          }}
          className="w-full p-4 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white">🔗</span>
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-800">外链分析</div>
            <div className="text-sm text-gray-500">分析页面外部链接</div>
          </div>
        </button>

        <button
          onClick={() => {
            if (onOpenPageInfo) {
              onOpenPageInfo()
            } else {
              onOpenSettings()
            }
          }}
          className="w-full p-4 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
            <span className="text-white">📋</span>
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-800">页面信息</div>
            <div className="text-sm text-gray-500">获取页面详细信息</div>
          </div>
        </button>

        <button
          onClick={() => {
            if (onOpenExtractor) {
              onOpenExtractor()
            } else {
              onOpenSettings()
            }
          }}
          className="w-full p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white">🕸️</span>
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-800">{t.contentExtractor}</div>
            <div className="text-sm text-gray-500">{t.contentExtractorDesc}</div>
          </div>
        </button>

        <button
          onClick={() => {
            if (onOpenVideoSniffer) {
              onOpenVideoSniffer()
            } else {
              onOpenSettings()
            }
          }}
          className="w-full p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
            <span className="text-white">🎬</span>
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-800">{t.videoSniffer}</div>
            <div className="text-sm text-gray-500">{t.videoSnifferDesc}</div>
          </div>
        </button>

        <button
          onClick={() => {
            if (onOpenAdminSniffer) {
              onOpenAdminSniffer()
            } else {
              onOpenSettings()
            }
          }}
          className="w-full p-4 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
            <span className="text-white">🔍</span>
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-800">{t.adminSniffer}</div>
            <div className="text-sm text-gray-500">{t.adminSnifferDesc}</div>
          </div>
        </button>

        <button
          onClick={() => {
            if (onOpenSecurityAnalyzer) {
              onOpenSecurityAnalyzer()
            } else {
              onOpenSettings()
            }
          }}
          className="w-full p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
            <span className="text-white">🛡️</span>
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-800">{t.securityAnalyzer}</div>
            <div className="text-sm text-gray-500">{t.securityAnalyzerDesc}</div>
          </div>
        </button>

        <button
          onClick={() => {
            if (onOpenUrlDecoder) {
              onOpenUrlDecoder()
            } else {
              onOpenSettings()
            }
          }}
          className="w-full p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white">🔓</span>
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-800">{t.urlDecoder}</div>
            <div className="text-sm text-gray-500">{t.urlDecoderDesc}</div>
          </div>
        </button>

        <button
          onClick={() => {
            if (onOpenEmailHeaderParser) {
              onOpenEmailHeaderParser()
            } else {
              onOpenSettings()
            }
          }}
          className="w-full p-4 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
            <span className="text-white">📧</span>
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-800">{t.emailHeaderParser}</div>
            <div className="text-sm text-gray-500">{t.emailHeaderParserDesc}</div>
          </div>
        </button>

        <button
          onClick={() => {
            if (onOpenDomainLookup) {
              onOpenDomainLookup()
            } else {
              onOpenSettings()
            }
          }}
          className="w-full p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
            <span className="text-white">🔍</span>
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-800">{t.domainLookup}</div>
            <div className="text-sm text-gray-500">{t.domainLookupDesc}</div>
          </div>
        </button>

        <button
          onClick={() => {
            if (onOpenWhoisLookup) {
              onOpenWhoisLookup()
            } else {
              onOpenSettings()
            }
          }}
          className="w-full p-4 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
            <span className="text-white">📋</span>
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-800">{t.whoisLookup}</div>
            <div className="text-sm text-gray-500">{t.whoisLookupDesc}</div>
          </div>
        </button>

        <button
          onClick={() => {
            if (onOpenDataParser) {
              onOpenDataParser()
            } else {
              onOpenSettings()
            }
          }}
          className="w-full p-4 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
            <span className="text-white">📊</span>
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-800">{t.dataParser}</div>
            <div className="text-sm text-gray-500">{t.dataParserDesc}</div>
          </div>
        </button>
      </div>

    </div>
  )
}
