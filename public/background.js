// Background script for Chrome extension

// 网络请求监控状态（从存储中恢复）
let networkRequests = []
let networkStats = { total: 0, success: 0, failed: 0, totalSize: 0, mediaSize: 0 }
let isMonitoring = false
let requestId = 0
let monitorTabId = null

// 媒体文件扩展名
const MEDIA_EXTENSIONS = ['.mp4', '.webm', '.m3u8', '.ts', '.flv', '.avi', '.mov', '.wmv', '.mp3', '.wav', '.ogg', '.aac', '.flac', '.m4a']

// 检查URL是否为媒体文件
function isMediaUrl(url) {
  if (!url) return false
  const lowerUrl = url.toLowerCase()
  return MEDIA_EXTENSIONS.some(ext => lowerUrl.includes(ext))
}

// 初始化时从存储加载状态
async function initNetworkMonitor() {
  try {
    const result = await chrome.storage.local.get(['networkRequests', 'networkStats', 'isMonitoring', 'monitorTabId'])
    if (result.networkRequests) {
      networkRequests = result.networkRequests
    }
    if (result.networkStats) {
      networkStats = result.networkStats
    }
    isMonitoring = result.isMonitoring || false
    monitorTabId = result.monitorTabId || null

    // 如果之前在监控，重新注册监听器
    if (isMonitoring && monitorTabId) {
      registerListeners()
    }
  } catch (e) {
    console.error('Failed to init network monitor:', e)
  }
}

// 立即初始化
initNetworkMonitor()

// 注册监听器
function registerListeners() {
  // 使用 Manifest V3 兼容的方式
  chrome.webRequest.onCompleted.addListener(
    monitorRequest,
    { urls: ['<all_urls>'] }
  )
  chrome.webRequest.onErrorOccurred.addListener(
    monitorErrorRequest,
    { urls: ['<all_urls>'] }
  )
}

// 保存请求到本地存储
async function saveRequestsToStorage() {
  try {
    await chrome.storage.local.set({
      networkRequests: networkRequests.slice(-200),
      networkStats: networkStats,
      isMonitoring: isMonitoring,
      monitorTabId: monitorTabId
    })
  } catch (e) {
    console.error('Failed to save requests:', e)
  }
}

// 从存储加载请求
async function loadRequestsFromStorage() {
  try {
    const result = await chrome.storage.local.get(['networkRequests', 'networkStats'])
    return {
      networkRequests: result.networkRequests || [],
      networkStats: result.networkStats || { total: 0, success: 0, failed: 0, totalSize: 0 }
    }
  } catch (e) {
    console.error('Failed to load requests:', e)
    return { networkRequests: [], networkStats: { total: 0, success: 0, failed: 0, totalSize: 0 } }
  }
}

function getContentSize(headers) {
  if (!headers || !Array.isArray(headers)) return 0
  for (const header of headers) {
    if (header.name && header.name.toLowerCase() === 'content-length') {
      const value = parseInt(header.value, 10)
      if (!isNaN(value) && value > 0) {
        return value
      }
    }
  }
  return 0
}

// 获取当前活动标签页信息
async function getCurrentTabInfo() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    return tab
  } catch (e) {
    return null
  }
}

function monitorRequest(details) {
  if (!isMonitoring) return
  if (monitorTabId && details.tabId !== monitorTabId) return

  // 尝试获取响应大小
  let size = getContentSize(details.responseHeaders)

  // 如果没有 Content-Length，尝试估算（根据URL类型估算典型大小）
  if (size === 0) {
    const url = details.url.toLowerCase()
    // 根据常见资源类型估算大小
    if (url.endsWith('.js')) size = 50000        // JS 文件约 50KB
    else if (url.endsWith('.css')) size = 10000  // CSS 文件约 10KB
    else if (url.endsWith('.html')) size = 20000 // HTML 约 20KB
    else if (url.endsWith('.png')) size = 100000 // PNG 约 100KB
    else if (url.endsWith('.jpg') || url.endsWith('.jpeg')) size = 80000
    else if (url.endsWith('.gif')) size = 30000
    else if (url.endsWith('.svg')) size = 5000
    else if (url.endsWith('.woff2')) size = 30000
    else if (url.endsWith('.woff')) size = 20000
    else if (url.endsWith('.json')) size = 5000
    else if (url.endsWith('.xml')) size = 3000
    // 视频文件 - 视频通常很大
    else if (url.endsWith('.mp4') || url.includes('.mp4')) size = 50 * 1024 * 1024      // 约 50MB
    else if (url.endsWith('.webm') || url.includes('.webm')) size = 30 * 1024 * 1024   // 约 30MB
    else if (url.endsWith('.m3u8') || url.includes('.m3u8')) size = 500000            // m3u8 约 500KB
    else if (url.endsWith('.ts') || url.includes('.ts')) size = 5 * 1024 * 1024       // ts 片段约 5MB
    else if (url.endsWith('.mov') || url.includes('.mov')) size = 100 * 1024 * 1024    // 约 100MB
    else if (url.endsWith('.avi') || url.includes('.avi')) size = 150 * 1024 * 1024    // 约 150MB
    // 音频文件
    else if (url.endsWith('.mp3')) size = 10 * 1024 * 1024    // 约 10MB
    else if (url.endsWith('.wav')) size = 30 * 1024 * 1024    // 约 30MB
    else if (url.endsWith('.flac')) size = 30 * 1024 * 1024   // 约 30MB
    else size = 10000 // 其他默认 10KB
  }

  const request = {
    id: requestId++,
    url: details.url,
    method: details.method,
    status: details.statusCode || 0,
    type: details.type,
    time: Date.now(),
    size: size,
    tabId: details.tabId
  }

  networkRequests.push(request)
  networkStats.total++
  networkStats.totalSize += size

  // 单独统计媒体文件大小
  if (isMediaUrl(details.url)) {
    networkStats.mediaSize += size
  }

  if (details.statusCode >= 200 && details.statusCode < 400) {
    networkStats.success++
  } else if (details.statusCode >= 400 || details.statusCode === 0) {
    networkStats.failed++
  }

  if (networkRequests.length > 200) {
    networkRequests = networkRequests.slice(-200)
  }

  saveRequestsToStorage()

  chrome.runtime.sendMessage({
    action: 'networkRequests',
    data: [request]
  }).catch(() => {})

  chrome.runtime.sendMessage({
    action: 'networkStats',
    stats: { ...networkStats }
  }).catch(() => {})
}

function monitorErrorRequest(details) {
  if (monitorTabId && details.tabId !== monitorTabId) return
  if (!isMonitoring) return

  const request = {
    id: requestId++,
    url: details.url,
    method: details.method,
    status: 0,
    type: details.type,
    time: Date.now(),
    size: 0,
    tabId: details.tabId,
    error: details.error || 'Request failed'
  }

  networkRequests.push(request)
  networkStats.total++
  networkStats.failed++

  if (networkRequests.length > 200) {
    networkRequests = networkRequests.slice(-200)
  }

  saveRequestsToStorage()

  chrome.runtime.sendMessage({
    action: 'networkRequests',
    data: [request]
  }).catch(() => {})

  chrome.runtime.sendMessage({
    action: 'networkStats',
    stats: { ...networkStats }
  }).catch(() => {})
}

async function startNetworkMonitor(tabId) {
  if (isMonitoring) {
    stopNetworkMonitor()
  }

  isMonitoring = true
  monitorTabId = tabId
  networkRequests = []
  networkStats = { total: 0, success: 0, failed: 0, totalSize: 0, mediaSize: 0 }
  requestId = 0

  // 监听网络请求 - 使用 Manifest V3 兼容方式
  chrome.webRequest.onCompleted.addListener(
    monitorRequest,
    { urls: ['<all_urls>'] }
  )

  chrome.webRequest.onErrorOccurred.addListener(
    monitorErrorRequest,
    { urls: ['<all_urls>'] }
  )

  await saveRequestsToStorage()

  // 获取并保存当前标签页信息
  const tab = await getCurrentTabInfo()
  if (tab) {
    chrome.storage.local.set({
      monitorTabInfo: {
        id: tab.id,
        url: tab.url,
        title: tab.title
      }
    })
  }
}

function stopNetworkMonitor() {
  isMonitoring = false
  monitorTabId = null

  try {
    chrome.webRequest.onCompleted.removeListener(monitorRequest)
    chrome.webRequest.onErrorOccurred.removeListener(monitorErrorRequest)
  } catch (e) {}

  // 清除监控的标签页信息
  chrome.storage.local.remove(['monitorTabInfo'])

  saveRequestsToStorage()
}

function clearNetworkRequests() {
  networkRequests = []
  networkStats = { total: 0, success: 0, failed: 0, totalSize: 0, mediaSize: 0 }
  chrome.storage.local.set({
    networkRequests: [],
    networkStats: networkStats
  })
}

async function getNetworkData() {
  return await loadRequestsFromStorage()
}

// 检查URL状态（404和重定向检测）
async function checkUrlsStatus(urls) {
  const results = {}

  // 404页面常见关键词
  const notFoundPatterns = [
    // 中文
    '页面找不到', '页面不存在', '404', '找不到页面', '访问出错',
    '您访问的页面不存在', '抱歉，页面找不到', '页面已删除', '页面已下线',
    // 英文
    'not found', '404 not found', 'page not found', 'does not exist',
    'this page does not exist', 'the page you requested', 'content not found',
    'error 404', 'page missing', 'resource not found'
  ]

  // 限制并发数量
  const batchSize = 3
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize)
    await Promise.all(
      batch.map(async (url) => {
        try {
          // 使用 fetch 检查 URL 状态
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 5000)

          const response = await fetch(url, {
            method: 'GET',
            signal: controller.signal,
            redirect: 'manual' // 不自动跟随重定向
          })

          clearTimeout(timeoutId)

          // 检查状态码
          const status = response.status

          // 3xx 重定向 - 检查是否重定向到主页或其他不相关页面
          if (status >= 300 && status < 400) {
            const location = response.headers.get('location')
            if (location) {
              try {
                const redirectUrl = new URL(location, url)
                const originalUrl = new URL(url)

                // 如果重定向到相同域名的主页或根路径，认为是无效的
                if (redirectUrl.origin === originalUrl.origin) {
                  // 重定向到根路径或主页
                  if (redirectUrl.pathname === '/' || redirectUrl.pathname === '' || redirectUrl.pathname === '/index.html') {
                    results[url] = { exists: false, status: status, redirectToHome: true }
                    return
                  }
                }
              } catch (e) {
                // URL解析失败，视为无效
              }
            }
            // 有重定向但无法判断目的地的也视为可能无效
            results[url] = { exists: false, status: status, redirected: true }
            return
          }

          // 获取响应内容检查是否为404页面
          if (response.ok) {
            try {
              const text = await response.text()
              const lowerText = text.toLowerCase()

              // 检查是否包含404关键词
              const is404Page = notFoundPatterns.some(pattern => lowerText.includes(pattern.toLowerCase()))

              if (is404Page) {
                results[url] = { exists: false, status: status, is404Page: true }
                return
              }
            } catch (e) {
              // 无法读取内容，按存在处理
            }
            results[url] = { exists: true, status: status }
          } else {
            results[url] = { exists: false, status: status }
          }
        } catch (error) {
          // 如果是网络错误或超时，认为URL不存在
          results[url] = { exists: false, status: 0 }
        }
      })
    )
  }

  return results
}

// 监听来自popup/sidepanel的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 处理选中文本变化
  if (message.type === 'SELECTION_CHANGED') {
    chrome.storage.local.set({
      currentSelection: message.data.text,
      currentSelectionUrl: message.data.url,
      currentSelectionTimestamp: message.data.timestamp
    })
    return
  }

  if (message.action === 'toggleSidePanel') {
    handleSidePanelToggle(message.enabled)
  } else if (message.action === 'startNetworkMonitor') {
    startNetworkMonitor(message.tabId)
  } else if (message.action === 'stopNetworkMonitor') {
    stopNetworkMonitor()
  } else if (message.action === 'clearNetworkRequests') {
    clearNetworkRequests()
  } else if (message.action === 'getNetworkData') {
    getNetworkData().then(data => sendResponse(data))
    return true
  } else if (message.action === 'checkUrlsStatus') {
    // 检查URL状态
    checkUrlsStatus(message.urls).then(results => sendResponse(results))
    return true
  }
})

async function handleSidePanelToggle(enable) {
  try {
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true })
    console.log('handleSidePanelToggle, tab:', currentTab, 'enable:', enable)
    if (!currentTab?.id) return

    if (enable) {
      await chrome.sidePanel.setOptions({
        tabId: currentTab.id,
        path: 'sidepanel.html',
        enabled: true
      })
      console.log('Side panel enabled - click extension icon to view')
    } else {
      await chrome.sidePanel.setOptions({
        tabId: currentTab.id,
        enabled: false
      })
    }
  } catch (error) {
    console.error('Side panel toggle error:', error)
  }
}

// 监听快捷键命令
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'analyze-page' || command === 'optimize-text') {
    chrome.action.openPopup()
  }
})

// 点击扩展图标时打开侧边栏（已禁用，改用按钮打开）
// chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })


// 创建右键菜单
function createContextMenus() {
  // 先清除可能存在的旧菜单
  chrome.contextMenus?.removeAll()

  chrome.contextMenus?.create({
    id: 'analyze-page',
    title: 'AI分析页面',
    contexts: ['page']
  })

  chrome.contextMenus?.create({
    id: 'optimize-selection',
    title: 'AI优化文本',
    contexts: ['selection']
  })

  chrome.contextMenus?.create({
    id: 'generate-text',
    title: 'AI生成文本',
    contexts: ['selection', 'page']
  })

  chrome.contextMenus?.create({
    id: 'open-settings',
    title: '打开设置',
    contexts: ['page', 'selection']
  })
}

// 安装时创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
  createContextMenus()
  // 确保侧边栏默认关闭
  chrome.sidePanel?.setOptions({
    enabled: false
  }).catch(console.error)
})

// 启动时也创建右键菜单
chrome.runtime.onStartup.addListener(() => {
  createContextMenus()
})

// 处理右键菜单点击
chrome.contextMenus?.onClicked.addListener(async (info, tab) => {
  // 存储选中的文本
  if (info.selectionText) {
    chrome.storage.local.set({
      cachedSelectedText: info.selectionText,
      cachedTabUrl: tab?.url,
      cachedTimestamp: Date.now()
    })
  } else {
    // 如果 selectionText 为空，尝试通过脚本获取
    if (tab?.id) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        func: () => {
          // 遍历所有帧尝试获取选中文本
          const getSelectionFromFrame = (win) => {
            try {
              const selection = win.getSelection()
              if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
                const text = selection.toString().trim()
                if (text) {
                  return text
                }
              }
            } catch (e) {}
            return null
          }

          let text = getSelectionFromFrame(window)
          if (text) return text

          // 尝试 iframe
          try {
            const iframes = document.querySelectorAll('iframe')
            for (const iframe of iframes) {
              try {
                if (iframe.contentWindow) {
                  text = getSelectionFromFrame(iframe.contentWindow)
                  if (text) return text
                }
              } catch (e) {}
            }
          } catch (e) {}

          // 尝试 contenteditable 元素
          try {
            const editables = document.querySelectorAll('[contenteditable="true"]')
            for (const el of editables) {
              const selection = window.getSelection()
              if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0)
                if (range.commonAncestorContainer &&
                    (range.commonAncestorContainer === el || el.contains(range.commonAncestorContainer))) {
                  const text = selection.toString().trim()
                  if (text) return text
                }
              }
            }
          } catch (e) {}

          return null
        }
      }).then(results => {
        const validResult = results?.find(r => r.result)
        if (validResult?.result) {
          chrome.storage.local.set({
            cachedSelectedText: validResult.result,
            cachedTabUrl: tab.url,
            cachedTimestamp: Date.now()
          })
        }
      }).catch(e => console.error('Failed to get selection:', e))
    }
  }

  try {
    if (info.menuItemId === 'analyze-page') {
      chrome.action.openPopup()
    } else if (info.menuItemId === 'optimize-selection') {
      chrome.action.openPopup()
    } else if (info.menuItemId === 'generate-text') {
      chrome.action.openPopup()
    } else if (info.menuItemId === 'open-settings') {
      chrome.action.openPopup()
    }
  } catch (e) {
    console.error('Menu action error:', e)
  }
})

// 启动时确保侧边栏关闭
chrome.runtime.onStartup.addListener(() => {
  chrome.sidePanel?.setOptions({
    enabled: false
  }).catch(console.error)
})

// 定期检查并关闭侧边栏（每5秒检查一次）
setInterval(() => {
  chrome.storage.local.get(['sidePanelEnabled']).then(result => {
    if (!result.sidePanelEnabled) {
      chrome.sidePanel?.setOptions({
        enabled: false
      }).catch(() => {})
    }
  }).catch(() => {})
}, 5000)
