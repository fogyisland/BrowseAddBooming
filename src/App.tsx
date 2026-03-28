import { useState, useEffect } from 'react'
import { LanguageProvider } from './i18n'
import Popup from './components/Popup'
import Settings from './components/Settings'
import PageAnalysis from './components/PageAnalysis'
import TextOptimizer from './components/TextOptimizer'
import TextGenerator from './components/TextGenerator'
import SidePanel from './components/SidePanel'
import LinkAnalyzer from './components/LinkAnalyzer'
import PageInfo from './components/PageInfo'
import ContentExtractor from './components/ContentExtractor'
import VideoSniffer from './components/VideoSniffer'
import AdminSniffer from './components/AdminSniffer'
import SecurityAnalyzer from './components/SecurityAnalyzer'
import UrlDecoder from './components/UrlDecoder'
import EmailHeaderParser from './components/EmailHeaderParser'
import DomainLookup from './components/DomainLookup'
import WhoisLookup from './components/WhoisLookup'
import DataParser from './components/DataParser'

type PopupView = 'popup' | 'settings' | 'analysis' | 'optimizer' | 'generator' | 'link' | 'pageinfo' | 'extractor' | 'videosniffer' | 'adminsniffer' | 'securityanalyzer' | 'urldecoder' | 'emailheaderparser' | 'domainlookup' | 'whoislookup' | 'dataparser'

function AppContent() {
  const [currentView, setCurrentView] = useState<PopupView>('popup')
  const [selectedText, setSelectedText] = useState<string>('')
  const [pageContent, setPageContent] = useState<string>('')
  const [isSidePanel, setIsSidePanel] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const root = document.getElementById('root')
    const mode = root?.getAttribute('data-mode')
    setIsSidePanel(mode === 'sidepanel')

    const params = new URLSearchParams(window.location.search)
    if (params.get('mode') === 'sidepanel') {
      setIsSidePanel(true)
    }

    const view = params.get('view')
    if (view === 'settings') {
      setCurrentView('settings')
    }

    // 尝试获取当前页面的选中文本（优先从缓存读取，缓存来自右键菜单）
    const getInitialSelection = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        if (!tab.id) return

        // 首先尝试从存储的缓存中读取（右键菜单触发时保存的）
        const cached = await chrome.storage.local.get(['cachedSelectedText', 'cachedTabUrl'])

        // 如果缓存的URL和当前URL相同，使用缓存的选中文本
        if (cached.cachedSelectedText && cached.cachedTabUrl === tab.url) {
          setSelectedText(cached.cachedSelectedText)
          // 清除缓存
          await chrome.storage.local.remove(['cachedSelectedText', 'cachedTabUrl'])
          return
        }

        // 否则尝试通过脚本获取（添加 allFrames: true 支持 iframe）
        if (!tab.url?.startsWith('chrome://')) {
          const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id, allFrames: true },
            func: () => {
              // 精准获取选中文本的函数
              const selection = window.getSelection()

              // 核心过滤：如果选区是折叠的或没有内容，返回 null
              if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
                return null
              }

              const selectedText = selection.toString().trim()

              // 再次确认：如果选中的只是空格，也跳过
              if (!selectedText) return null

              // 获取 HTML 结构，帮助 AI 理解多行内容的层级
              const range = selection.getRangeAt(0)
              const container = document.createElement('div')
              container.appendChild(range.cloneContents())

              return {
                text: selectedText,
                html: container.innerHTML,
                url: window.location.href
              }
            }
          })

          // 关键步骤：过滤出真正有结果的那一个 Frame
          const validResult = results?.find((item) => item.result !== null)

          if (validResult && validResult.result) {
            const { text } = validResult.result
            setSelectedText(text)
          }
        }
      } catch (error) {
        console.log('Could not get initial selection:', error)
      }
    }

    getInitialSelection()
    setIsLoaded(true)
  }, [])

  const handleAnalyzePage = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab.id) return

      // 检查是否是 Chrome 内部页面
      if (tab.url?.startsWith('chrome://')) {
        alert('无法分析 Chrome 内部页面，请切换到普通网页')
        return
      }

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => document.body?.innerText || ''
      })

      if (results[0]?.result) {
        setPageContent(results[0].result.slice(0, 5000))
        setCurrentView('analysis')
      }
    } catch (error) {
      console.error('Failed to get page content:', error)
      alert('无法获取页面内容，请确保在普通网页上操作')
    }
  }

  const handleOptimizeText = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab.id) return

      // 检查是否是 Chrome 内部页面
      if (tab.url?.startsWith('chrome://')) {
        alert('无法在 Chrome 内部页面使用此功能，请切换到普通网页')
        // 仍然进入优化页面（手动输入模式）
        setSelectedText('')
        setCurrentView('optimizer')
        return
      }

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        func: () => {
          // 精准获取选中文本的函数
          const selection = window.getSelection()

          // 核心过滤：如果选区是折叠的或没有内容，返回 null
          if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
            return null
          }

          const selectedText = selection.toString().trim()

          // 再次确认：如果选中的只是空格，也跳过
          if (!selectedText) return null

          // 获取 HTML 结构，帮助 AI 理解多行内容的层级
          const range = selection.getRangeAt(0)
          const container = document.createElement('div')
          container.appendChild(range.cloneContents())

          return {
            text: selectedText,
            html: container.innerHTML,
            url: window.location.href
          }
        }
      })

      // 关键步骤：过滤出真正有结果的那一个 Frame
      const validResult = results?.find((item) => item.result !== null)

      // 即使没有选中文本也进入优化页面（手动输入模式）
      if (validResult && validResult.result) {
        setSelectedText(validResult.result.text)
      } else {
        setSelectedText('')
      }
      setCurrentView('optimizer')
    } catch (error) {
      console.error('Failed to get selected text:', error)
      // 即使出错也进入优化页面
      setSelectedText('')
      setCurrentView('optimizer')
    }
  }

  const handleGenerateText = () => {
    setCurrentView('generator')
  }

  const handleAnalyzeLinks = () => {
    setCurrentView('link')
  }

  const handleOpenPageInfo = () => {
    setCurrentView('pageinfo')
  }

  const handleOpenExtractor = () => {
    setCurrentView('extractor')
  }

  const handleOpenVideoSniffer = () => {
    setCurrentView('videosniffer')
  }

  const handleOpenAdminSniffer = () => {
    setCurrentView('adminsniffer')
  }

  const handleOpenSecurityAnalyzer = () => {
    setCurrentView('securityanalyzer')
  }

  const handleOpenUrlDecoder = () => {
    setCurrentView('urldecoder')
  }

  const handleOpenEmailHeaderParser = () => {
    setCurrentView('emailheaderparser')
  }

  const handleOpenDomainLookup = () => {
    setCurrentView('domainlookup')
  }

  const handleOpenWhoisLookup = () => {
    setCurrentView('whoislookup')
  }

  const handleOpenDataParser = () => {
    setCurrentView('dataparser')
  }

  // 在当前光标位置插入文本
  const handleInsertAtCursor = async (text: string) => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab.id) return

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (insertText: string) => {
          // 尝试获取焦点元素
          const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement | HTMLElement

          // 如果是 input 或 textarea
          if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
            const input = activeElement as HTMLInputElement | HTMLTextAreaElement
            const start = input.selectionStart || 0
            const end = input.selectionEnd || 0
            const before = input.value.substring(0, start)
            const after = input.value.substring(end)
            input.value = before + insertText + after
            // 设置光标位置到插入文本之后
            input.selectionStart = input.selectionEnd = start + insertText.length
            input.focus()
          } else {
            // 尝试在 selection 中插入
            const selection = window.getSelection()
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0)
              range.deleteContents()
              range.insertNode(document.createTextNode(insertText))
              // 移动光标到插入文本之后
              range.collapse(false)
            }
          }
        },
        args: [text]
      })
    } catch (error) {
      console.error('Failed to insert text:', error)
    }
  }

  const handleReplaceText = async (newText: string) => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab.id) return

      // 使用 allFrames 来处理 iframe 中的选区
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        func: (text: string) => {
          // 尝试在所有帧中查找有选区的帧
          const tryReplaceInWindow = (win: Window): boolean => {
            try {
              const selection = win.getSelection()
              if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
                const range = selection.getRangeAt(0)
                range.deleteContents()
                range.insertNode(document.createTextNode(text))
                return true
              }
            } catch (e) {
              // 忽略跨域错误
            }
            return false
          }

          // 先尝试当前窗口
          if (tryReplaceInWindow(window)) {
            return { success: true }
          }

          // 尝试所有 iframe
          try {
            const iframes = document.querySelectorAll('iframe')
            for (const iframe of iframes) {
              try {
                const iframeWin = iframe.contentWindow
                if (iframeWin && tryReplaceInWindow(iframeWin)) {
                  return { success: true }
                }
              } catch (e) {
                // 忽略跨域 iframe
              }
            }
          } catch (e) {
            // 忽略错误
          }

          // 尝试在可编辑元素中替换
          const activeElement = document.activeElement
          if (activeElement) {
            const tagName = activeElement.tagName
            if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
              const input = activeElement as HTMLInputElement | HTMLTextAreaElement
              const start = input.selectionStart || 0
              const end = input.selectionEnd || input.value.length
              const before = input.value.substring(0, start)
              const after = input.value.substring(end)
              input.value = before + text + after
              input.selectionStart = input.selectionEnd = start + text.length
              input.focus()
              return { success: true }
            }

            // 检查 contenteditable
            if (activeElement.getAttribute('contenteditable') === 'true') {
              const selection = window.getSelection()
              if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0)
                range.deleteContents()
                range.insertNode(document.createTextNode(text))
                return { success: true }
              }
            }

            // 检查 CKEditor 等富文本编辑器
            if (activeElement.classList.contains('cke_editable') ||
                activeElement.classList.contains('cke_source') ||
                activeElement.classList.contains('wysiwyg') ||
                activeElement.getAttribute('role') === 'textbox' ||
                activeElement.classList.toString().includes('editor')) {
              const selection = window.getSelection()
              if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0)
                range.deleteContents()
                range.insertNode(document.createTextNode(text))
                return { success: true }
              }
            }
          }

          return { success: false }
        },
        args: [newText]
      })

      // 检查是否在任何帧中成功替换
      const success = results?.some((item) => item.result?.success)
      if (!success) {
        console.log('No selection found to replace')
      }
    } catch (error) {
      console.error('Failed to replace text:', error)
    }
  }

  const handleCloseSidePanel = async () => {
    window.close()
  }

  const handleSidePanelBack = (view: string) => {
    if (view === 'home') {
      setCurrentView('popup')
    } else {
      setCurrentView(view as PopupView)
    }
  }

  if (!isLoaded) {
    return null
  }

  if (isSidePanel) {
    return (
      <div className="w-[400px] h-screen bg-white">
        <SidePanel
          onAnalyzePage={handleAnalyzePage}
          onOptimizeText={handleOptimizeText}
          onOpenSettings={() => setCurrentView('settings')}
          currentView={currentView}
          onBack={handleSidePanelBack}
          pageContent={pageContent}
          selectedText={selectedText}
          onReplace={handleReplaceText}
          onInsertAtCursor={handleInsertAtCursor}
          onClose={handleCloseSidePanel}
        />
      </div>
    )
  }

  return (
    <div className="w-[400px] min-h-[400px] bg-white">
      {currentView === 'popup' && (
        <Popup
          onAnalyzePage={handleAnalyzePage}
          onOptimizeText={handleOptimizeText}
          onGenerateText={handleGenerateText}
          onOpenSettings={() => setCurrentView('settings')}
          onAnalyzeLinks={handleAnalyzeLinks}
          onOpenPageInfo={handleOpenPageInfo}
          onOpenExtractor={handleOpenExtractor}
          onOpenVideoSniffer={handleOpenVideoSniffer}
          onOpenAdminSniffer={handleOpenAdminSniffer}
          onOpenSecurityAnalyzer={handleOpenSecurityAnalyzer}
          onOpenUrlDecoder={handleOpenUrlDecoder}
          onOpenEmailHeaderParser={handleOpenEmailHeaderParser}
          onOpenDomainLookup={handleOpenDomainLookup}
          onOpenWhoisLookup={handleOpenWhoisLookup}
          onOpenDataParser={handleOpenDataParser}
        />
      )}
      {currentView === 'link' && (
        <LinkAnalyzer onBack={() => setCurrentView('popup')} />
      )}
      {currentView === 'pageinfo' && (
        <PageInfo onBack={() => setCurrentView('popup')} />
      )}
      {currentView === 'extractor' && (
        <ContentExtractor onBack={() => setCurrentView('popup')} />
      )}
      {currentView === 'videosniffer' && (
        <VideoSniffer onBack={() => setCurrentView('popup')} />
      )}
      {currentView === 'adminsniffer' && (
        <AdminSniffer onBack={() => setCurrentView('popup')} />
      )}
      {currentView === 'securityanalyzer' && (
        <SecurityAnalyzer onBack={() => setCurrentView('popup')} />
      )}
      {currentView === 'urldecoder' && (
        <UrlDecoder onBack={() => setCurrentView('popup')} />
      )}
      {currentView === 'emailheaderparser' && (
        <EmailHeaderParser onBack={() => setCurrentView('popup')} />
      )}
      {currentView === 'domainlookup' && (
        <DomainLookup onBack={() => setCurrentView('popup')} />
      )}
      {currentView === 'whoislookup' && (
        <WhoisLookup onBack={() => setCurrentView('popup')} />
      )}
      {currentView === 'dataparser' && (
        <DataParser onBack={() => setCurrentView('popup')} />
      )}
      {currentView === 'settings' && (
        <Settings onBack={() => setCurrentView('popup')} />
      )}
      {currentView === 'analysis' && (
        <PageAnalysis
          content={pageContent}
          onBack={() => setCurrentView('popup')}
        />
      )}
      {currentView === 'optimizer' && (
        <TextOptimizer
          originalText={selectedText}
          onBack={() => setCurrentView('popup')}
          onReplace={handleReplaceText}
          onInsertAtCursor={handleInsertAtCursor}
        />
      )}
      {currentView === 'generator' && (
        <TextGenerator
          onBack={() => setCurrentView('popup')}
          onInsertAtCursor={handleInsertAtCursor}
        />
      )}
    </div>
  )
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  )
}

export default App
