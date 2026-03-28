import { useState, useEffect } from 'react'

interface DecodedUrl {
  original: string
  decoded: string
  method: string
  valid: boolean
}

interface UrlDecoderProps {
  onBack: () => void
}

export default function UrlDecoder({ onBack }: UrlDecoderProps) {
  const [decodedUrls, setDecodedUrls] = useState<DecodedUrl[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [manualInput, setManualInput] = useState('')

  // 逆向解码函数
  const decodeUrl = (input: string): DecodedUrl => {
    const trimmed = input.trim()
    if (!trimmed) {
      return { original: input, decoded: '', method: '空输入', valid: false }
    }

    let decoded = trimmed
    let method = ''
    let valid = true

    try {
      // 1. URL解码
      try {
        const urlDecoded = decodeURIComponent(decoded)
        if (urlDecoded !== decoded) {
          decoded = urlDecoded
          method = 'URL解码'
        }
      } catch (e) { }

      // 2. 多次URL解码（处理双重编码）
      let count = 0
      let temp = decoded
      while (count < 3) {
        try {
          const next = decodeURIComponent(temp)
          if (next === temp) break
          temp = next
          count++
        } catch { break }
      }
      if (count > 0) {
        decoded = temp
        method = count > 1 ? `URL解码(${count}次)` : method || 'URL解码'
      }

      // 3. Base64解码
      const base64Pattern = /^[a-zA-Z0-9+/]+=*$/
      if (base64Pattern.test(decoded) && decoded.length >= 4) {
        try {
          // 尝试标准Base64
          const b64Decoded = atob(decoded)
          // 检查解码后是否是可见ASCII
          if (/^[\x20-\x7E\s]*$/.test(b64Decoded)) {
            decoded = b64Decoded
            method = method ? `${method} + Base64` : 'Base64解码'
          }
        } catch {
          // 尝试URL-safe Base64
          try {
            const urlSafe = decoded.replace(/-/g, '+').replace(/_/g, '/')
            const padded = urlSafe + '='.repeat((4 - urlSafe.length % 4) % 4)
            const b64Decoded = atob(padded)
            if (/^[\x20-\x7E\s]*$/.test(b64Decoded)) {
              decoded = b64Decoded
              method = method ? `${method} + URL-Safe Base64` : 'Base64解码'
            }
          } catch { }
        }
      }

      // 4. 处理hex编码
      const hexPattern = /^([0-9a-fA-F]{2})+$/
      if (hexPattern.test(decoded)) {
        try {
          const hexBytes = decoded.match(/.{1,2}/g) || []
          const hexDecoded = hexBytes.map(b => String.fromCharCode(parseInt(b, 16))).join('')
          if (/^[\x20-\x7E]*$/.test(hexDecoded)) {
            decoded = hexDecoded
            method = method ? `${method} + Hex` : 'Hex解码'
          }
        } catch { }
      }

      // 5. 处理Unicode编码 (\uXXXX)
      const unicodePattern = /\\u([0-9a-fA-F]{4})/g
      if (unicodePattern.test(decoded)) {
        try {
          decoded = decoded.replace(unicodePattern, (_, p1) => String.fromCharCode(parseInt(p1, 16)))
          method = method ? `${method} + Unicode` : 'Unicode解码'
        } catch { }
      }

      // 6. 简单的字符位移解码（逆向常见的位移加密）
      // 例如: char - 1 加密的可以尝试 char + 1 解密
      const shiftDecoded = decoded.split('').map(char => {
        const code = char.charCodeAt(0)
        if (code >= 33 && code <= 126) {
          // 可打印ASCII范围
          return String.fromCharCode(((code - 33 + 1) % 94) + 33)
        }
        return char
      }).join('')

      if (shiftDecoded !== decoded && /^https?:\/\//i.test(shiftDecoded)) {
        decoded = shiftDecoded
        method = method ? `${method} + 位移(+1)` : '位移解码(+1)'
      }

      // 7. 处理51CTO等常见跳转URL
      const jumpPatterns = [
        /[?&]url=([^&]+)/,
        /[?&]target=([^&]+)/,
        /[?&]to=([^&]+)/,
        /[?&]redirect=([^&]+)/,
        /[?&]link=([^&]+)/,
        /[?&]goto=([^&]+)/,
        /[?&]u=([^&]+)/,
        /[?&]r=([^&]+)/
      ]

      for (const pattern of jumpPatterns) {
        const match = decoded.match(pattern)
        if (match && match[1]) {
          const innerUrl = match[1]
          // 递归解码内部URL
          const innerDecoded = decodeUrl(innerUrl)
          if (innerDecoded.valid) {
            decoded = decoded.replace(match[0], '').replace(/[?&]$/, '') + ' → ' + innerDecoded.decoded
            method = method ? `${method} + 跳转链接` : '跳转链接解码'
            break
          }
        }
      }

      // 验证是否为有效URL
      valid = /^https?:\/\//i.test(decoded) || /^[a-zA-Z]:[/\\]/i.test(decoded)

    } catch (e) {
      method = '解码失败'
      valid = false
    }

    return { original: trimmed, decoded, method, valid }
  }

  const scanUrls = async () => {
    setLoading(true)
    setError('')
    setDecodedUrls([])

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab.id) {
        setError('无法获取当前标签页')
        setLoading(false)
        return
      }

      if (tab.url?.startsWith('chrome://')) {
        setError('无法分析 Chrome 内部页面')
        setLoading(false)
        return
      }

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const urls: string[] = []

          // 1. 查找所有链接
          const links = document.querySelectorAll('a[href]')
          links.forEach(link => {
            const href = (link as HTMLAnchorElement).href
            if (href) urls.push(href)
          })

          // 2. 查找带有跳转参数的链接
          const jumpLinks = document.querySelectorAll('a[href*="url="], a[href*="target="], a[href*="to="], a[href*="redirect="], a[href*="link="], a[href*="u="]')
          jumpLinks.forEach(link => {
            const href = (link as HTMLAnchorElement).href
            if (href && !urls.includes(href)) {
              urls.push(href)
            }
          })

          // 3. 查找可能包含编码URL的属性
          const allElements = document.querySelectorAll('[href], [src], [data-url], [data-src], [data-link], [data-target]')
          allElements.forEach(el => {
            const htmlEl = el as HTMLElement
            const attrs = ['href', 'src', 'data-url', 'data-src', 'data-link', 'data-target']
            attrs.forEach(attr => {
              const val = htmlEl.getAttribute(attr)
              if (val && (val.includes('=') || val.includes('base64') || val.includes('%'))) {
                if (!urls.includes(val)) {
                  urls.push(val)
                }
              }
            })
          })

          // 4. 查找JavaScript中的URL
          const scripts = document.querySelectorAll('script')
          scripts.forEach(script => {
            const text = script.textContent || ''
            // 查找各种编码格式的URL
            const patterns = [
              /["']((?:https?[^"']+|[\w+/=]{10,}))["']/g,
              /(?:url|href|src|target|to|redirect|link)[=:]\s*["']([^"']+)["']/gi,
              /window\.open\s*\(\s*["']([^"']+)["']/gi,
              /location\.href\s*=\s*["']([^"']+)["']/gi
            ]

            patterns.forEach(pattern => {
              let match
              while ((match = pattern.exec(text)) !== null) {
                const url = match[1] || match[2]
                if (url && url.length > 10 && !urls.includes(url)) {
                  urls.push(url)
                }
              }
            })
          })

          return [...new Set(urls)]
        }
      })

      const foundUrls = results?.[0]?.result || []

      // 解码所有找到的URL
      const decoded = foundUrls.map(url => decodeUrl(url))
        .filter(d => d.decoded && d.decoded !== d.original)

      setDecodedUrls(decoded)
    } catch (err) {
      console.error('URL decode error:', err)
      setError('分析失败: ' + (err instanceof Error ? err.message : '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  const handleManualDecode = () => {
    if (!manualInput.trim()) return
    const result = decodeUrl(manualInput)
    if (result.decoded && result.decoded !== result.original) {
      setDecodedUrls(prev => {
        // 避免重复
        if (prev.some(p => p.original === result.original)) return prev
        return [result, ...prev]
      })
    }
    setManualInput('')
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
  }

  useEffect(() => {
    scanUrls()
  }, [])

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 text-xl">←</button>
        <h2 className="text-lg font-semibold">逆向还原网址</h2>
        <button
          onClick={scanUrls}
          disabled={loading}
          className="ml-auto px-3 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-sm rounded"
        >
          {loading ? '分析中...' : '重新分析'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">{error}</p>
        </div>
      )}

      {loading && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg text-center">
          <div className="animate-pulse text-blue-600">正在分析页面中的编码链接...</div>
        </div>
      )}

      {/* 手动输入解码 */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleManualDecode()}
            placeholder="输入需要解码的URL或编码字符串..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
          />
          <button
            onClick={handleManualDecode}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded"
          >
            解码
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          支持: URL编码、Base64、Hex、Unicode、跳转链接(ur=, target=)等
        </div>
      </div>

      {/* 解码结果统计 */}
      {decodedUrls.length > 0 && (
        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="p-2 bg-green-50 rounded text-center">
            <div className="text-lg font-semibold text-green-600">
              {decodedUrls.filter(d => d.valid).length}
            </div>
            <div className="text-xs text-gray-500">有效解码</div>
          </div>
          <div className="p-2 bg-yellow-50 rounded text-center">
            <div className="text-lg font-semibold text-yellow-600">
              {decodedUrls.filter(d => !d.valid && d.decoded).length}
            </div>
            <div className="text-xs text-gray-500">部分解码</div>
          </div>
          <div className="p-2 bg-blue-50 rounded text-center">
            <div className="text-lg font-semibold text-blue-600">
              {decodedUrls.length}
            </div>
            <div className="text-xs text-gray-500">总计</div>
          </div>
        </div>
      )}

      {/* 解码结果列表 */}
      <div className="space-y-3 max-h-[350px] overflow-y-auto">
        {decodedUrls.map((item, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${item.valid ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">{item.method}</span>
              {item.valid && (
                <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded">有效</span>
              )}
            </div>

            <div className="text-xs text-gray-500 mb-1">原始:</div>
            <div className="text-xs font-mono text-gray-700 break-all bg-white p-2 rounded mb-2">
              {item.original}
            </div>

            <div className="text-xs text-gray-500 mb-1">解码后:</div>
            <div className="flex items-center gap-2">
              <div className={`flex-1 text-sm font-mono break-all p-2 rounded ${item.valid ? 'bg-white text-green-700' : 'bg-white text-yellow-700'}`}>
                {item.decoded}
              </div>
              <button
                onClick={() => copyUrl(item.decoded)}
                className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded whitespace-nowrap"
              >
                复制
              </button>
            </div>
          </div>
        ))}
      </div>

      {decodedUrls.length === 0 && !loading && !error && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">使用说明</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• 自动扫描页面中的编码链接</li>
            <li>• 支持常见编码格式解码：</li>
            <li>  - URL编码 (%3A, %2F 等)</li>
            <li>  - Base64编码</li>
            <li>  - Hex编码</li>
            <li>  - Unicode编码</li>
            <li>  - 跳转链接 (url=, target= 等)</li>
            <li>  - 字符位移加密</li>
            <li>• 支持手动输入解码</li>
            <li>• 点击复制解码后的URL</li>
          </ul>
        </div>
      )}
    </div>
  )
}
