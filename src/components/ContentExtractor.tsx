import { useState, useEffect } from 'react'

interface Model {
  id: string
  name: string
  endpoint: string
  apiKey: string
  authType: string
  model: string
}

interface ElementInfo {
  tag: string
  id: string
  className: string
  textContent: string
  parentTag: string
  parentId: string
  parentClass: string
  isDynamic: boolean
  selector: string
}

interface ContentExtractorProps {
  onBack: () => void
}

export default function ContentExtractor({ onBack }: ContentExtractorProps) {
  const [selectedElement, setSelectedElement] = useState<ElementInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'select' | 'result'>('select')
  const [extractedContent, setExtractedContent] = useState<string>('')

  // AI 相关状态
  const [models, setModels] = useState<Model[]>([])
  const [selectedModelId, setSelectedModelId] = useState<string>('')
  const [aiResult, setAiResult] = useState<string>('')
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    // 监听元素选择消息
    const handleMessage = (message: { type: string; data?: ElementInfo }) => {
      if (message.type === 'element-selected') {
        setSelectedElement(message.data || null)
        setMode('result')
      }
    }
    chrome.runtime.onMessage.addListener(handleMessage)

    // 加载模型配置
    const loadModels = async () => {
      try {
        const result = await chrome.storage.local.get(['modelSettings'])
        const settings = result.modelSettings
        if (settings?.models) {
          setModels(settings.models)
          setSelectedModelId(settings.defaultModelId || settings.models[0]?.id)
        }
      } catch (error) {
        console.error('Failed to load models:', error)
      }
    }
    loadModels()

    return () => chrome.runtime.onMessage.removeListener(handleMessage)
  }, [])

  const startSelection = async () => {
    setLoading(true)
    setSelectedElement(null)
    setExtractedContent('')

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab.id) {
        console.error('No tab ID found')
        return
      }

      // 检查是否是 Chrome 内部页面
      if (tab.url?.startsWith('chrome://')) {
        alert('无法在 Chrome 内部页面使用此功能，请切换到普通网页')
        setLoading(false)
        return
      }

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          console.log('Starting element selection...')

          // 检查是否已经存在选择器，避免重复
          if (document.getElementById('xiao-ming-extractor-highlight')) {
            console.log('Selection already active')
            return
          }

          // 创建一个透明的高亮层，不阻挡鼠标事件
          const highlight = document.createElement('div')
          highlight.id = 'xiao-ming-extractor-highlight'
          highlight.style.cssText = `
            position: fixed;
            pointer-events: none;
            z-index: 999998;
            border: 2px solid #2563eb;
            background: rgba(37, 99, 235, 0.1);
            transition: all 0.1s ease;
            border-radius: 2px;
            display: none;
          `

          // 工具提示
          const tooltip = document.createElement('div')
          tooltip.id = 'xiao-ming-extractor-tooltip'
          tooltip.style.cssText = `
            position: fixed;
            pointer-events: none;
            padding: 6px 10px;
            background: #1e293b;
            color: white;
            border-radius: 4px;
            font-size: 12px;
            font-family: monospace;
            z-index: 999999;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: none;
          `

          document.body.appendChild(highlight)
          document.body.appendChild(tooltip)

          const getElementInfo = (el: Element) => {
            const tag = el.tagName.toLowerCase()
            const id = el.id || ''
            const className = el.className || ''
            const textContent = el.textContent?.trim().substring(0, 100) || ''

            const parent = el.parentElement
            const parentTag = parent?.tagName.toLowerCase() || ''
            const parentId = parent?.id || ''
            const parentClass = parent?.className || ''

            // 检测是否为动态内容
            const isDynamic = checkIfDynamic(el)

            // 生成更智能的选择器
            let selector = ''
            if (id) {
              selector = `#${id}`
            } else if (className) {
              // 使用更精确的class选择
              const classes = className.split(' ').filter(c => c && !c.match(/^js-/)).slice(0, 3).join('.')
              selector = classes ? `${tag}.${classes}` : tag
            } else {
              selector = tag
            }

            return {
              tag,
              id,
              className,
              textContent,
              parentTag,
              parentId,
              parentClass,
              isDynamic,
              selector
            }
          }

          function checkIfDynamic(el: Element) {
            // 检查常见的动态内容标识
            const dynamicAttrs = ['data-v-', 'data-react', 'ng-', 'v-', 'svelte-', '__vue', 'data-hydrate']
            for (const attr of dynamicAttrs) {
              if (el.outerHTML.includes(attr)) return true
            }

            // 检查是否有空的textContent但有复杂结构
            if (!el.textContent?.trim() && el.querySelectorAll('*').length > 5) {
              return true
            }

            // 检查常见的动态框架容器
            const frameworkSelectors = [
              '[data-hydrated]',
              '[data-ssr]',
              '.SSR',
              '#__NEXT_DATA__',
              '[data-astro]'
            ]
            for (const sel of frameworkSelectors) {
              if (document.querySelector(sel)) return true
            }

            return false
          }

          // 使用 mouseover 监听元素
          const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            if (!target) return

            // 忽略我们的UI元素
            if (target.id && target.id.includes('xiao-ming-extractor')) return

            // 显示高亮层
            highlight.style.display = 'block'
            tooltip.style.display = 'block'

            // 高亮当前元素
            const rect = target.getBoundingClientRect()
            highlight.style.width = rect.width + 'px'
            highlight.style.height = rect.height + 'px'
            highlight.style.top = rect.top + 'px'
            highlight.style.left = rect.left + 'px'

            // 显示工具提示
            const info = getElementInfo(target)
            tooltip.textContent = '<' + info.tag + (info.id ? ' id="' + info.id + '"' : '') + (info.className ? ' class="..."' : '') + '>'
            tooltip.style.left = (rect.right + 10) + 'px'
            tooltip.style.top = rect.top + 'px'

            // 如果右边空间不足，显示在左边
            if (rect.right + 200 > window.innerWidth) {
              tooltip.style.left = (rect.left - 200) + 'px'
            }
          }

          const handleClick = (e: MouseEvent) => {
            e.preventDefault()
            e.stopPropagation()

            const target = e.target as HTMLElement
            if (!target) return

            // 忽略我们的UI元素
            if (target.id && target.id.includes('xiao-ming-extractor')) return

            const info = getElementInfo(target)

            // 发送消息给popup
            chrome.runtime.sendMessage({
              type: 'element-selected',
              data: info
            })

            // 清理
            highlight.remove()
            tooltip.remove()
            document.removeEventListener('mouseover', handleMouseOver)
            document.removeEventListener('click', handleClick)
          }

          const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
              highlight.remove()
              tooltip.remove()
              document.removeEventListener('mouseover', handleMouseOver)
              document.removeEventListener('click', handleClick)
            }
          }

          // 直接在 document 上监听 mouseover
          document.addEventListener('mouseover', handleMouseOver)
          document.addEventListener('click', handleClick, true)
          document.addEventListener('keydown', handleKeyDown)
        }
      })
    } catch (error) {
      console.error('Selection error:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateScraperCode = (): string => {
    if (!selectedElement) return ''

    const { tag, id, className, parentId, parentClass, selector, isDynamic } = selectedElement

    // 生成多种选择器方案
    const selectors = []
    if (id) selectors.push(`document.querySelector('#${id}')`)
    if (className) {
      const classes = className.split(' ').filter(c => c).slice(0, 2).join('.')
      selectors.push(`document.querySelector('${tag}.${classes}')`)
    }
    selectors.push(`document.querySelector('${selector}')`)

    // Python方案
    const pythonCode = `# Python + BeautifulSoup 推荐方案
from bs4 import BeautifulSoup
import requests

# 方法1: 使用选择器
html = requests.get('URL').text
soup = BeautifulSoup(html, 'html.parser')

# 选择元素
element = soup.select_one('${selector}')
content = element.text.strip() if element else ''

# 方法2: 使用父元素定位
${parentId ? `parent = soup.select_one('#${parentId}')` : `parent = soup.select_one('.${parentClass.split(' ')[0]}')`}
content = parent.select_one('${tag}').text.strip() if parent else ''

print(content)
`

    // JavaScript方案
    const jsCode = `// JavaScript 推荐方案

// 方法1: 直接选择
const element = document.querySelector('${selector}')
const content = element?.textContent?.trim() || ''

// 方法2: 父元素定位
${parentId ? `const parent = document.querySelector('#${parentId}')` : `const parent = document.querySelector('.${parentClass.split(' ')[0]}')`}
const content = parent?.querySelector('${tag}')?.textContent?.trim() || ''

console.log(content)
`

    // Puppeteer方案(动态内容)
    const puppeteerCode = isDynamic ? `# Puppeteer (动态内容)
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('URL', { waitUntil: 'networkidle0' });

  // 等待内容加载
  await page.waitForSelector('${selector}');

  const content = await page.evaluate(() => {
    const element = document.querySelector('${selector}')
    return element?.textContent?.trim() || ''
  });

  console.log(content);
  await browser.close();
})();
` : ''

    return `# 选择器信息
标签: ${tag}
ID: ${id || '(无)'}
Class: ${className || '(无)'}
父级ID: ${parentId || '(无)'}
父级Class: ${parentClass || '(无)'}
推荐选择器: ${selector}
${isDynamic ? '⚠️ 内容为动态生成，建议使用Puppeteer/Selenium' : '✅ 内容为静态HTML'}

---

## Python 代码
\`\`\`python
${pythonCode}
\`\`\`

---

## JavaScript 代码
\`\`\`javascript
${jsCode}
\`\`\`
${puppeteerCode ? `
---

## Puppeteer 代码 (动态内容)
\`\`\`javascript
${puppeteerCode}
\`\`\`
` : ''}
`
  }

  const extractContent = async () => {
    if (!selectedElement) return

    setLoading(true)
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab.id) return

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (selector: string) => {
          const element = document.querySelector(selector)
          if (!element) return null

          return {
            html: element.innerHTML.substring(0, 5000),
            text: element.textContent?.trim() || ''
          }
        },
        args: [selectedElement.selector]
      })

      const validResult = results?.find(r => r.result)
      if (validResult?.result) {
        setExtractedContent(validResult.result.text || validResult.result.html)
      }
    } catch (error) {
      console.error('Extract error:', error)
    } finally {
      setLoading(false)
    }
  }

  // AI 智能提取
  const extractWithAI = async () => {
    if (!selectedElement || !selectedModelId) return

    setAiLoading(true)
    setAiResult('')

    try {
      const model = models.find(m => m.id === selectedModelId)
      if (!model) {
        setAiResult('请先在设置中配置AI模型')
        setAiLoading(false)
        return
      }

      // 获取当前页面的HTML作为参考
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      let pageHtml = ''
      if (tab.id && !tab.url?.startsWith('chrome://')) {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => document.body.innerHTML.substring(0, 8000)
        })
        pageHtml = results?.[0]?.result || ''
      }

      const prompt = `你是一个专业的网页数据抓取专家。请根据以下选中的元素信息，为我生成最佳的抓取方案。

## 选中的元素信息
- 标签: ${selectedElement.tag}
- ID: ${selectedElement.id || '(无)'}
- Class: ${selectedElement.className || '(无)'}
- 父级ID: ${selectedElement.parentId || '(无)'}
- 父级Class: ${selectedElement.parentClass || '(无)'}
- 推荐选择器: ${selectedElement.selector}
- 元素文本内容: ${selectedElement.textContent}
- 是否动态内容: ${selectedElement.isDynamic ? '是(JavaScript动态生成)' : '否(静态HTML)'}

${pageHtml ? `- 当前页面HTML片段: ${pageHtml.substring(0, 2000)}...` : ''}

请生成以下内容：
1. **最佳CSS选择器** - 最稳定、最精确的选择器
2. **XPath选择器** - 作为备选方案
3. **多平台代码示例** - Python(BeautifulSoup)、JavaScript、Puppeteer/Playwright
4. **抓取注意事项** - 如有动态内容需说明
5. **如需登录或Cookie的页面**，给出建议

请用中文回答，代码要有注释。`

      const response = await fetch(model.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(model.authType === 'Bearer' ? { 'Authorization': `Bearer ${model.apiKey}` } : {}),
          ...(model.authType === 'ApiKey' ? { 'X-API-Key': model.apiKey } : {})
        },
        body: JSON.stringify({
          model: model.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 2000
        })
      })

      const data = await response.json()
      const result = data.choices?.[0]?.message?.content || data.error?.message || 'AI提取失败'
      setAiResult(result)
    } catch (error) {
      setAiResult(`AI提取失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 text-xl">←</button>
        <h2 className="text-lg font-semibold">内容提取</h2>
      </div>

      {mode === 'select' ? (
        <div className="text-center py-8">
          <div className="mb-4 p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">
              点击下方按钮，进入选择模式，<br />
              然后点击页面上的元素进行提取
            </p>
            <button
              onClick={startSelection}
              disabled={loading}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg"
            >
              {loading ? '进入选择模式...' : '开始选择元素'}
            </button>
          </div>

          <div className="text-left text-xs text-gray-500 space-y-2">
            <p>支持提取：</p>
            <ul className="list-disc list-inside">
              <li>元素的ID和Class</li>
              <li>父级元素的ID和Class</li>
              <li>自动生成推荐的选择器</li>
              <li>检测是否为动态内容</li>
            </ul>
          </div>
        </div>
      ) : selectedElement ? (
        <div>
          {/* 元素信息 */}
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">选中元素</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">标签:</span>
                <span className="ml-2 font-mono">{selectedElement.tag}</span>
              </div>
              <div>
                <span className="text-gray-500">ID:</span>
                <span className="ml-2 font-mono">{selectedElement.id || '(无)'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Class:</span>
                <span className="ml-2 font-mono">{selectedElement.className || '(无)'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">推荐选择器:</span>
                <span className="ml-2 font-mono text-blue-600">{selectedElement.selector}</span>
              </div>
            </div>

            {selectedElement.isDynamic && (
              <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 rounded text-sm">
                ⚠️ 内容为JavaScript动态生成，无法直接提取
              </div>
            )}
          </div>

          {/* 父级信息 */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">父级元素</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">标签:</span>
                <span className="ml-2 font-mono">{selectedElement.parentTag}</span>
              </div>
              <div>
                <span className="text-gray-500">ID:</span>
                <span className="ml-2 font-mono">{selectedElement.parentId || '(无)'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Class:</span>
                <span className="ml-2 font-mono">{selectedElement.parentClass || '(无)'}</span>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => {
                setSelectedElement(null)
                setExtractedContent('')
                setAiResult('')
                startSelection()
              }}
              disabled={loading}
              className="flex-1 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
            >
              {loading ? '选择中...' : '重新选择'}
            </button>
            <button
              onClick={extractContent}
              disabled={loading || selectedElement.isDynamic}
              className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg text-sm"
            >
              {loading ? '提取中...' : '提取内容'}
            </button>
          </div>

          {/* AI 智能提取 */}
          <div className="mb-4 p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-purple-800">🤖 AI 智能提取</span>
            </div>
            {models.length > 0 ? (
              <>
                <div className="flex gap-2 mb-2">
                  <select
                    value={selectedModelId}
                    onChange={(e) => setSelectedModelId(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                  >
                    {models.map(model => (
                      <option key={model.id} value={model.id}>{model.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={extractWithAI}
                    disabled={aiLoading || !selectedElement}
                    className="px-3 py-1 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white text-sm rounded"
                  >
                    {aiLoading ? '分析中...' : 'AI提取'}
                  </button>
                </div>
                {aiLoading && <p className="text-xs text-purple-600">AI正在分析元素并生成最佳抓取方案...</p>}
                {aiResult && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-purple-700">AI 分析结果</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(aiResult)}
                        className="text-xs text-purple-600"
                      >
                        复制
                      </button>
                    </div>
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap max-h-64 overflow-auto bg-white p-2 rounded">
                      {aiResult}
                    </pre>
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-gray-500">
                请先在设置中配置AI模型
              </p>
            )}
          </div>

          {/* 提取结果 */}
          {extractedContent && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-green-800">提取结果</span>
                <button
                  onClick={() => navigator.clipboard.writeText(extractedContent)}
                  className="text-xs text-blue-500"
                >
                  复制
                </button>
              </div>
              <pre className="text-xs text-gray-700 whitespace-pre-wrap max-h-32 overflow-auto">
                {extractedContent}
              </pre>
            </div>
          )}

          {/* 推荐代码 */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">推荐抓取代码</h3>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-auto max-h-64">
              {generateScraperCode()}
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  )
}
