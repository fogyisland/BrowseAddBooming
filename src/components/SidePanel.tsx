import { useState, useEffect } from 'react'
import { useLanguage } from '../i18n'
import Settings from './Settings'
import PageAnalysis from './PageAnalysis'
import TextOptimizer from './TextOptimizer'
import TextGenerator from './TextGenerator'
import NetworkAnalyzer from './NetworkAnalyzer'
import ResourceAnalyzer from './ResourceAnalyzer'
import LinkAnalyzer from './LinkAnalyzer'
import PageInfo from './PageInfo'
import ContentExtractor from './ContentExtractor'
import VideoSniffer from './VideoSniffer'
import AdminSniffer from './AdminSniffer'
import SecurityAnalyzer from './SecurityAnalyzer'
import UrlDecoder from './UrlDecoder'
import EmailHeaderParser from './EmailHeaderParser'
import DomainLookup from './DomainLookup'
import WhoisLookup from './WhoisLookup'
import DataParser from './DataParser'

type View = 'home' | 'settings' | 'analysis' | 'optimizer' | 'generator' | 'network' | 'resource' | 'link' | 'pageinfo' | 'extractor' | 'videosniffer' | 'adminsniffer' | 'securityanalyzer' | 'urldecoder' | 'emailheaderparser' | 'domainlookup' | 'whoislookup' | 'dataparser'

interface SidePanelProps {
  onAnalyzePage: () => void
  onOptimizeText: () => void
  onOpenSettings: () => void
  currentView: string
  onBack: (view: string) => void
  pageContent: string
  selectedText: string
  onReplace: (text: string) => void
  onInsertAtCursor?: (text: string) => void
  onClose: () => void
}

export default function SidePanel({
  onAnalyzePage,
  onOptimizeText,
  currentView,
  onBack,
  pageContent,
  selectedText,
  onReplace,
  onInsertAtCursor,
  onClose
}: SidePanelProps) {
  const { t } = useLanguage()
  const [view, setView] = useState<View>('home')

  useEffect(() => {
    if (currentView === 'analysis') {
      setView('analysis')
    } else if (currentView === 'optimizer') {
      setView('optimizer')
    } else if (currentView === 'settings') {
      setView('settings')
    } else if (currentView === 'network') {
      setView('network')
    } else if (currentView === 'generator') {
      setView('generator')
    } else if (currentView === 'resource') {
      setView('resource')
    } else if (currentView === 'videosniffer') {
      setView('videosniffer')
    }
  }, [currentView])

  const handleBack = () => {
    setView('home')
    onBack('home')
  }

  const handleAnalyzePage = async () => {
    await onAnalyzePage()
    setView('analysis')
  }

  const handleOptimizeText = async () => {
    await onOptimizeText()
    setView('optimizer')
  }

  const renderContent = () => {
    switch (view) {
      case 'settings':
        return <Settings onBack={handleBack} />
      case 'analysis':
        return <PageAnalysis content={pageContent} onBack={handleBack} />
      case 'network':
        return <NetworkAnalyzer onBack={handleBack} />
      case 'resource':
        return <ResourceAnalyzer onBack={handleBack} />
      case 'link':
        return <LinkAnalyzer onBack={handleBack} />
      case 'pageinfo':
        return <PageInfo onBack={handleBack} />
      case 'extractor':
        return <ContentExtractor onBack={handleBack} />
      case 'videosniffer':
        return <VideoSniffer onBack={handleBack} />
      case 'adminsniffer':
        return <AdminSniffer onBack={handleBack} />
      case 'securityanalyzer':
        return <SecurityAnalyzer onBack={handleBack} />
      case 'urldecoder':
        return <UrlDecoder onBack={handleBack} />
      case 'emailheaderparser':
        return <EmailHeaderParser onBack={handleBack} />
      case 'domainlookup':
        return <DomainLookup onBack={handleBack} />
      case 'whoislookup':
        return <WhoisLookup onBack={handleBack} />
      case 'dataparser':
        return <DataParser onBack={handleBack} />
      case 'optimizer':
        return (
          <TextOptimizer
            originalText={selectedText}
            onBack={handleBack}
            onReplace={onReplace}
            onInsertAtCursor={onInsertAtCursor}
          />
        )
      case 'generator':
        return <TextGenerator onBack={handleBack} onInsertAtCursor={onInsertAtCursor} />
      default:
        return (
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">🤖</span>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-800">{t.aiAssistant}</h1>
                  <p className="text-sm text-gray-500">{t.sidebarMode}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleAnalyzePage}
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
                onClick={handleOptimizeText}
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
                onClick={() => setView('generator')}
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
                onClick={() => setView('network')}
                className="w-full p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white">🌐</span>
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-800">{t.networkAnalysis}</div>
                  <div className="text-sm text-gray-500">{t.networkAnalysisDesc}</div>
                </div>
              </button>

              <button
                onClick={() => setView('resource')}
                className="w-full p-4 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                  <span className="text-white">📦</span>
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-800">{t.resourceAnalysis}</div>
                  <div className="text-sm text-gray-500">{t.resourceAnalysisDesc}</div>
                </div>
              </button>

              <button
                onClick={() => setView('link')}
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
                onClick={() => setView('pageinfo')}
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
                onClick={() => setView('extractor')}
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
                onClick={() => setView('videosniffer')}
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
                onClick={() => setView('adminsniffer')}
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
                onClick={() => setView('securityanalyzer')}
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
                onClick={() => setView('urldecoder')}
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
                onClick={() => setView('emailheaderparser')}
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
                onClick={() => setView('domainlookup')}
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
                onClick={() => setView('whoislookup')}
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
                onClick={() => setView('dataparser')}
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

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-3">{t.shortcuts}</div>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+Shift+A {t.analyzePage}</span>
                <span className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+Shift+J {t.optimizeText}</span>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={() => setView('settings')}
                className="w-full p-3 border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span>⚙️</span>
                <span className="text-gray-700">{t.settings}</span>
              </button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      {renderContent()}
    </div>
  )
}
