// content.js - 监听页面选中文本变化（支持 Markdown 格式）
// 需开启 all_frames: true

// 针对主流站点的标题选择器表
const TITLE_SELECTORS = {
  // CSDN
  'mp.csdn.net': ['#txtTitle', '.article-bar__title', '.title-input', 'input[placeholder*="标题"]'],
  'blog.csdn.net': ['#txtTitle', '.article-bar__title', '.title-input'],
  // GitHub
  'github.com': ['.author + .path-divider + strong a', '.js-issue-title'],
  'gist.github.com': ['.gist-header .gist-title'],
  // DeepSeek
  'deepseek.com': ['title', '.chat-title', 'h1'],
  // Gemini
  'gemini.google.com': ['title', 'h1', '.conversation-title'],
  // 通用
  'default': ['h1', '.title', '[contenteditable="true"][placeholder*="标题"]', 'input[placeholder*="标题"]']
}

function getPageTitle() {
  const host = window.location.host
  const selectors = TITLE_SELECTORS[host] || TITLE_SELECTORS['default']

  // 1. 尝试从映射表找
  for (const selector of selectors) {
    try {
      const el = document.querySelector(selector)
      if (el) {
        const val = el.value || el.innerText || el.textContent
        if (val && val.trim() && val.trim().length < 200) {
          return val.trim()
        }
      }
    } catch (e) {
      // 忽略无效选择器
    }
  }

  // 2. 尝试从 top 窗口找（处理 iframe 情况）
  try {
    if (window.top && window.top !== window) {
      for (const selector of TITLE_SELECTORS['default']) {
        const el = window.top.document.querySelector(selector)
        if (el) {
          const val = el.value || el.innerText || el.textContent
          if (val && val.trim() && val.trim().length < 200) {
            return val.trim()
          }
        }
      }
    }
  } catch (e) {
    // 跨域限制
  }

  // 3. 备选：document.title
  const docTitle = document.title
  if (docTitle) {
    // 过滤掉常见站点后缀
    return docTitle.split(' - ')[0].split(' | ')[0].split(' — ')[0].trim()
  }

  return ''
}

// 获取选中文本，保留格式
function getSelectionWithFormat() {
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null

  const range = sel.getRangeAt(0)
  const container = document.createElement('div')
  container.appendChild(range.cloneContents())

  // 处理 Markdown 常见的块级元素，强制保留换行
  const blocks = container.querySelectorAll('p, div, br, li, h1, h2, h3, h4, h5, h6, tr, td, th, pre, code, blockquote')
  blocks.forEach(block => {
    // 如果不是 br 标签，后面加换行
    if (block.tagName !== 'BR') {
      // 检查是否已经有文本节点结尾
      const hasNewline = block.lastChild && block.lastChild.textContent.endsWith('\n')
      if (!hasNewline) {
        block.appendChild(document.createTextNode('\n'))
      }
    }
  })

  // 获取纯文本，保留换行
  let text = container.innerText || container.textContent || ''

  // 清理多余空白但保留合理换行
  text = text.replace(/\n{3,}/g, '\n\n') // 最多2个连续换行
  text = text.trim()

  return text || null
}

// 监听选中文本变化
function setupSelectionListener() {
  // 防止重复监听
  if (window.__selectionListenerSetup) return
  window.__selectionListenerSetup = true

  let lastSelection = ''

  document.addEventListener('selectionchange', () => {
    try {
      const selection = window.getSelection()

      // 检查选区是否有效
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        return
      }

      // 使用带格式的获取方式
      const text = getSelectionWithFormat()

      // 如果文本没有变化，不处理
      if (!text || text === lastSelection) {
        return
      }

      lastSelection = text

      // 获取页面标题
      const title = getPageTitle()

      // 主动发给正在打开的 Popup（实时通信）
      chrome.runtime.sendMessage({
        type: 'NEW_SELECTION_DETECTED',
        data: {
          text: text,
          title: title,
          url: window.location.href,
          timestamp: Date.now()
        }
      }).catch(() => {
        // Popup 没打开时忽略
      })

      // 同时存 storage 备用
      chrome.storage.local.set({
        currentSelection: text,
        currentSelectionTitle: title,
        currentSelectionUrl: window.location.href,
        currentSelectionTimestamp: Date.now()
      })
    } catch (e) {
      // 忽略跨域错误
    }
  })
}

// 监听来自 Popup 的请求（使用 world: MAIN 时可以调用）
function setupMessageListener() {
  if (window.__messageListenerSetup) return
  window.__messageListenerSetup = true

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_SELECTION') {
      const text = getSelectionWithFormat()
      sendResponse({ text: text, url: window.location.href })
    }
    return true
  })
}

// 遍历所有 iframe 并设置监听
function setupAllFrames() {
  try {
    setupSelectionListener()
    setupMessageListener()

    // 递归设置所有 iframe
    const iframes = document.querySelectorAll('iframe')
    iframes.forEach(iframe => {
      try {
        if (iframe.contentDocument) {
          iframe.contentDocument.__selectionListenerSetup = false
          iframe.contentDocument.__messageListenerSetup = false
        }
      } catch (e) {
        // 跨域 iframe 忽略
      }
    })
  } catch (e) {}
}

// 立即执行
setupAllFrames()

// 页面加载完成后再次设置（处理动态加载的 iframe）
window.addEventListener('load', setupAllFrames)

// 定期检查新的 iframe
setInterval(setupAllFrames, 3000)
