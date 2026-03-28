import { useState, useEffect } from 'react'

interface SecurityFinding {
  category: 'info' | 'warning' | 'danger'
  title: string
  description: string
  detail: string
  recommendation: string
}

interface SecurityAnalyzerProps {
  onBack: () => void
}

export default function SecurityAnalyzer({ onBack }: SecurityAnalyzerProps) {
  const [findings, setFindings] = useState<SecurityFinding[]>([])
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [aiAnalyzing, setAiAnalyzing] = useState(false)
  const [aiResult, setAiResult] = useState('')

  const analyzeSecurity = async () => {
    setLoading(true)
    setAnalyzing(true)
    setError('')
    setFindings([])
    setAiResult('')

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
          const findings: SecurityFinding[] = []

          // 1. 检查HTTPS
          if (window.location.protocol === 'http:') {
            findings.push({
              category: 'warning',
              title: '未使用HTTPS加密',
              description: '网站未使用SSL/TLS加密连接',
              detail: `当前使用 HTTP 协议，易受到中间人攻击和数据窃听`,
              recommendation: '建议部署SSL证书，启用HTTPS加密连接'
            })
          }

          // 2. 检查XSS防护
          const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
          if (!cspMeta) {
            findings.push({
              category: 'warning',
              title: '缺少Content-Security-Policy头',
              description: '页面未设置CSP安全策略',
              detail: 'CSP可以有效防御XSS攻击和数据注入',
              recommendation: '在HTTP响应头中添加Content-Security-Policy'
            })
          }

          // 3. 检查X-Frame-Options
          const hasXFrameOptions = false // 需要从响应头检查
          if (!hasXFrameOptions) {
            findings.push({
              category: 'warning',
              title: '缺少X-Frame-Options防护',
              description: '页面未设置防止点击劫持的响应头',
              detail: '攻击者可能将网站嵌入iframe中进行点击劫持攻击',
              recommendation: '在HTTP响应头中添加 X-Frame-Options: DENY 或 SAMEORIGIN'
            })
          }

          // 4. 检查X-Content-Type-Options
          const hasXContentTypeOptions = false
          if (!hasXContentTypeOptions) {
            findings.push({
              category: 'info',
              title: '缺少X-Content-Type-Options防护',
              description: '建议设置浏览器禁止 MIME 类型嗅探',
              detail: '可以防止浏览器将非脚本文件当作脚本执行',
              recommendation: '在HTTP响应头中添加 X-Content-Type-Options: nosniff'
            })
          }

          // 5. 检查敏感信息泄露
          const pageText = document.body?.innerText || ''
          const patterns = [
            { regex: /password|passwd|pwd/i, name: '密码相关关键词' },
            { regex: /secret|api[_-]?key|apikey/i, name: '密钥/API Key' },
            { regex: /token|auth[_-]?token/i, name: '认证令牌' },
            { regex: /private[_-]?key/i, name: '私钥' },
            { regex: /database|db[_-]?connection/i, name: '数据库连接信息' },
          ]

          patterns.forEach(({ regex, name }) => {
            if (regex.test(pageText)) {
              findings.push({
                category: 'danger',
                title: `可能存在${name}泄露`,
                description: `页面文本中检测到敏感关键词`,
                detail: `页面中包含 "${name}" 相关的敏感信息，请确认是否泄露`,
                recommendation: '检查页面内容，移除任何敏感信息'
              })
            }
          })

          // 6. 检查表单安全
          const forms = document.querySelectorAll('form')
          forms.forEach((form: Element) => {
            const htmlForm = form as HTMLFormElement
            // 检查是否有CSRF token
            const hasCsrfToken = htmlForm.innerHTML.includes('csrf') ||
                                htmlForm.innerHTML.includes('token') ||
                                htmlForm.innerHTML.includes('_token')

            // 检查是否使用HTTPS
            const action = htmlForm.getAttribute('action') || ''
            if (action.startsWith('http://')) {
              findings.push({
                category: 'danger',
                title: '表单提交使用不安全协议',
                description: `表单action使用HTTP明文传输`,
                detail: `表单数据将以明文方式发送，容易被截获`,
                recommendation: '将表单action改为HTTPS或使用相对路径'
              })
            }

            if (!hasCsrfToken) {
              findings.push({
                category: 'warning',
                title: '表单可能缺少CSRF防护',
                description: '未检测到CSRF token',
                detail: '表单提交可能受到CSRF跨站请求伪造攻击',
                recommendation: '在表单中添加CSRF token字段'
              })
            }
          })

          // 7. 检查Cookie安全
          const cookies = document.cookie
          if (cookies) {
            if (!cookies.includes('HttpOnly') && cookies.includes('session')) {
              findings.push({
                category: 'warning',
                title: 'Cookie可能缺少HttpOnly属性',
                description: 'Session Cookie未设置HttpOnly',
                detail: 'Cookie可能被JavaScript读取，存在XSS窃取风险',
                recommendation: '在Set-Cookie响应头中添加HttpOnly属性'
              })
            }
            if (!cookies.includes('Secure') && window.location.protocol === 'https:') {
              findings.push({
                category: 'info',
                title: 'Cookie建议设置Secure属性',
                description: 'Cookie未标记为仅HTTPS可用',
                detail: '在HTTPS连接下设置的Cookie也应标记为Secure',
                recommendation: '在Set-Cookie响应头中添加Secure属性'
              })
            }
          }

          // 8. 检查iframe安全
          const iframes = document.querySelectorAll('iframe')
          iframes.forEach((iframe: Element) => {
            const htmlIframe = iframe as HTMLIFrameElement
            if (!htmlIframe.sandbox?.value.includes('allow-scripts')) {
              findings.push({
                category: 'info',
                title: 'Iframe建议设置sandbox属性',
                description: 'Iframe未使用sandbox限制',
                detail: 'sandbox可以限制iframe内 容的行为',
                recommendation: '添加sandbox属性，如: allow-scripts allow-same-origin'
              })
            }
          })

          // 9. 检查JavaScript库版本
          const scripts = document.querySelectorAll('script[src]')
          const jsLibs = [
            { pattern: /jquery/i, name: 'jQuery' },
            { pattern: /bootstrap/i, name: 'Bootstrap' },
            { pattern: /vue/i, name: 'Vue.js' },
            { pattern: /react/i, name: 'React' },
            { pattern: /angular/i, name: 'Angular' },
            { pattern: /lodash/i, name: 'Lodash' },
            { pattern: /axios/i, name: 'Axios' },
          ]

          const detectedLibs: string[] = []
          scripts.forEach(script => {
            const src = (script as HTMLScriptElement).src
            jsLibs.forEach(lib => {
              if (lib.pattern.test(src) && !detectedLibs.includes(lib.name)) {
                detectedLibs.push(lib.name)
                // 检查是否使用CDN
                if (src.includes('cdn') || src.includes('unpkg') || src.includes('jsdelivr')) {
                  findings.push({
                    category: 'info',
                    title: `${lib.name}使用CDN加载`,
                    description: '第三方库通过CDN加载',
                    detail: `从CDN加载库可能存在供应链攻击风险`,
                    recommendation: '建议将库下载到本地并使用自有CDN'
                  })
                }
              }
            })
          })

          // 10. 检查常见漏洞模式
          const htmlContent = document.documentElement.outerHTML

          // 检查是否直接使用eval
          if (/eval\s*\(/.test(htmlContent)) {
            findings.push({
              category: 'danger',
              title: '使用eval()动态执行代码',
              description: '检测到eval()函数使用',
              detail: 'eval()是XSS攻击的主要目标，应避免使用',
              recommendation: '使用更安全的替代方案，如JSON.parse()'
            })
          }

          // 检查是否有内联脚本
          const inlineScripts = document.querySelectorAll('script:not([src])')
          if (inlineScripts.length > 0) {
            findings.push({
              category: 'info',
              title: '存在内联脚本',
              description: `${inlineScripts.length}个内联script标签`,
              detail: '内联脚本难以被CSP策略保护',
              recommendation: '建议将脚本提取到外部文件'
            })
          }

          // 检查开放重定向
          const links = document.querySelectorAll('a[href]')
          let redirectCount = 0
          links.forEach(link => {
            const href = (link as HTMLAnchorElement).href
            if (href && (href.includes('redirect=') || href.includes('url=') || href.includes('next='))) {
              redirectCount++
            }
          })
          if (redirectCount > 0) {
            findings.push({
              category: 'warning',
              title: '可能存在开放重定向',
              description: `检测到${redirectCount}个可能的重定向参数`,
              detail: '开放重定向可能被用于钓鱼攻击',
              recommendation: '验证重定向目标为可信域名'
            })
          }

          // 11. 检查JWT token
          if (/eyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/.test(htmlContent)) {
            findings.push({
              category: 'danger',
              title: '可能暴露JWT Token',
              description: '页面中检测到JWT格式的令牌',
              detail: 'JWT如果在前端暴露，可能被用于认证绕过',
              recommendation: '确保JWT只在后端和安全的客户端之间传输'
            })
          }

          // 12. 检查API密钥泄露
          const apiKeyPatterns = [
            /sk-[a-zA-Z0-9]{20,}/, // OpenAI
            /AIza[a-zA-Z0-9-_]{35}/, // Google
            /AKIA[0-9A-Z]{16}/, // AWS
            /xox[baprs]-[a-zA-Z0-9]{10,}/, // Slack
          ]

          apiKeyPatterns.forEach(pattern => {
            if (pattern.test(htmlContent)) {
              findings.push({
                category: 'danger',
                title: '可能存在API密钥泄露',
                description: '检测到可能是API密钥的内容',
                detail: '请确认是否为真实的API密钥，及时更换',
                recommendation: '将密钥移到服务端，通过API调用'
              })
            }
          })

          // 13. 检查CORS配置（提示）
          findings.push({
            category: 'info',
            title: '建议检查CORS配置',
            description: '跨域资源共享需要正确配置',
            detail: '不正确的CORS配置可能导致数据泄露',
            recommendation: '确保Access-Control-Allow-Origin只授权可信域名'
          })

          // 14. 检查敏感文件暴露
          const sensitivePaths = [
            '/.git/config',
            '/.env',
            '/wp-config.php',
            '/phpinfo.php',
            '/server-status',
            '/.DS_Store',
            '/web.config',
            '/.htaccess'
          ]

          findings.push({
            category: 'warning',
            title: '建议检查敏感文件',
            description: '服务器可能暴露敏感配置文件',
            detail: '以下路径应被加入访问控制: ' + sensitivePaths.join(', '),
            recommendation: '配置Web服务器禁止访问这些敏感路径'
          })

          // 15. 检查输入框XSS风险
          const inputs = document.querySelectorAll('input[type="text"], input[type="search"], textarea')
          let xssVulnerable = false
          inputs.forEach(input => {
            const htmlInput = input as HTMLInputElement
            if (!htmlInput.type || htmlInput.type === 'text') {
              // 简单检查是否有任何过滤
              const parent = htmlInput.closest('form')
              if (parent) {
                const formHtml = parent.innerHTML
                if (!formHtml.includes('sanitize') && !formHtml.includes('escape')) {
                  xssVulnerable = true
                }
              }
            }
          })

          if (xssVulnerable) {
            findings.push({
              category: 'warning',
              title: '可能存在XSS风险',
              description: '输入框可能未进行充分的输入过滤',
              detail: '用户输入应始终在后端进行验证和过滤',
              recommendation: '实施输入验证，使用HTML编码输出'
            })
          }

          return findings
        }
      })

      const foundFindings = results?.[0]?.result || []
      setFindings(foundFindings)
    } catch (err) {
      console.error('Security analysis error:', err)
      setError('安全分析失败: ' + (err instanceof Error ? err.message : '未知错误'))
    } finally {
      setLoading(false)
      setAnalyzing(false)
    }
  }

  const handleAiAnalysis = async () => {
    if (findings.length === 0) return

    setAiAnalyzing(true)
    try {
      // 从设置中获取API配置
      const settings = await chrome.storage.local.get(['apiKey', 'apiModel', 'apiProvider'])

      if (!settings.apiKey) {
        setAiResult('请先在设置中配置API Key')
        setAiAnalyzing(false)
        return
      }

      const findingsText = findings.map(f =>
        `- [${f.category.toUpperCase()}] ${f.title}: ${f.description}`
      ).join('\n')

      const prompt = `请分析以下网站安全检测结果，提供详细的风险评估和建议：

${findingsText}

请以以下格式回复：
1. 总体风险评估：（高/中/低）
2. 需要立即处理的问题：（列出最严重的3个）
3. 建议的修复优先级
4. 进一步安全加固建议`

      // 调用AI API
      let apiUrl = ''
      let body = {}

      if (settings.apiProvider === 'anthropic') {
        apiUrl = 'https://api.anthropic.com/v1/messages'
        body = {
          model: settings.apiModel || 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        }
      } else {
        // OpenAI 默认
        apiUrl = 'https://api.openai.com/v1/chat/completions'
        body = {
          model: settings.apiModel || 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1000
        }
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(settings.apiProvider === 'anthropic' ? {
            'x-api-key': settings.apiKey,
            'anthropic-version': '2023-06-01'
          } : {
            'Authorization': `Bearer ${settings.apiKey}`
          })
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        throw new Error('API请求失败')
      }

      const data = await response.json()

      if (settings.apiProvider === 'anthropic') {
        setAiResult(data.content?.[0]?.text || 'AI分析完成')
      } else {
        setAiResult(data.choices?.[0]?.message?.content || 'AI分析完成')
      }
    } catch (err) {
      console.error('AI analysis error:', err)
      setAiResult('AI分析失败: ' + (err instanceof Error ? err.message : '请检查API配置'))
    } finally {
      setAiAnalyzing(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'danger': return 'bg-red-100 border-red-300 text-red-800'
      case 'warning': return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      case 'info': return 'bg-blue-100 border-blue-300 text-blue-800'
      default: return 'bg-gray-100 border-gray-300 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'danger': return '🔴'
      case 'warning': return '🟡'
      case 'info': return '🔵'
      default: return '⚪'
    }
  }

  const getRiskLevel = () => {
    const dangerCount = findings.filter(f => f.category === 'danger').length
    const warningCount = findings.filter(f => f.category === 'warning').length

    if (dangerCount > 2) return { level: '高', color: 'text-red-600' }
    if (dangerCount > 0 || warningCount > 3) return { level: '中', color: 'text-yellow-600' }
    return { level: '低', color: 'text-green-600' }
  }

  useEffect(() => {
    analyzeSecurity()
  }, [])

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 text-xl">←</button>
        <h2 className="text-lg font-semibold">页面安全分析</h2>
        <button
          onClick={analyzeSecurity}
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

      {analyzing && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg text-center">
          <div className="animate-pulse text-blue-600">正在分析页面安全...</div>
        </div>
      )}

      {/* 安全等级概览 */}
      {findings.length > 0 && !analyzing && (
        <div className="mb-4 grid grid-cols-4 gap-2">
          <div className="p-2 bg-red-50 rounded text-center">
            <div className="text-lg font-semibold text-red-600">
              {findings.filter(f => f.category === 'danger').length}
            </div>
            <div className="text-xs text-gray-500">高危</div>
          </div>
          <div className="p-2 bg-yellow-50 rounded text-center">
            <div className="text-lg font-semibold text-yellow-600">
              {findings.filter(f => f.category === 'warning').length}
            </div>
            <div className="text-xs text-gray-500">中危</div>
          </div>
          <div className="p-2 bg-blue-50 rounded text-center">
            <div className="text-lg font-semibold text-blue-600">
              {findings.filter(f => f.category === 'info').length}
            </div>
            <div className="text-xs text-gray-500">低危</div>
          </div>
          <div className={`p-2 bg-gray-50 rounded text-center ${getRiskLevel().color}`}>
            <div className="text-lg font-semibold">{getRiskLevel().level}</div>
            <div className="text-xs text-gray-500">风险等级</div>
          </div>
        </div>
      )}

      {/* AI分析按钮 */}
      {findings.length > 0 && !analyzing && (
        <div className="mb-4">
          <button
            onClick={handleAiAnalysis}
            disabled={aiAnalyzing}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg flex items-center justify-center gap-2"
          >
            <span>🤖</span>
            {aiAnalyzing ? 'AI分析中...' : 'AI智能分析'}
          </button>
        </div>
      )}

      {/* AI分析结果 */}
      {aiResult && (
        <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold text-purple-800 mb-2">🤖 AI分析结果</h3>
          <div className="text-sm text-gray-700 whitespace-pre-wrap">{aiResult}</div>
        </div>
      )}

      {/* 安全问题列表 */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {findings.map((finding, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${getCategoryColor(finding.category)}`}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg">{getCategoryIcon(finding.category)}</span>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{finding.title}</h4>
                <p className="text-xs mt-1 opacity-80">{finding.description}</p>
                <details className="mt-2">
                  <summary className="text-xs cursor-pointer opacity-70 hover:opacity-100">
                    查看详情
                  </summary>
                  <div className="mt-2 p-2 bg-white/50 rounded text-xs">
                    <p><strong>详情：</strong>{finding.detail}</p>
                    <p className="mt-1"><strong>建议：</strong>{finding.recommendation}</p>
                  </div>
                </details>
              </div>
            </div>
          </div>
        ))}
      </div>

      {findings.length === 0 && !loading && !error && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">使用说明</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• 自动检测当前页面的安全风险</li>
            <li>• 检测常见漏洞：XSS、CSRF、敏感信息泄露等</li>
            <li>• 检查HTTP响应头安全配置</li>
            <li>• 分析表单和Cookie安全</li>
            <li>• 点击"AI智能分析"获取更详细的修复建议</li>
          </ul>
        </div>
      )}
    </div>
  )
}
