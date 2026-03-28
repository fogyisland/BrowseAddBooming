import { useState, useEffect } from 'react'

interface AdminFinding {
  type: 'url' | 'api' | 'config' | 'framework' | 'endpoint'
  value: string
  source: string
}

interface AdminSnifferProps {
  onBack: () => void
}

export default function AdminSniffer({ onBack }: AdminSnifferProps) {
  const [findings, setFindings] = useState<AdminFinding[]>([])
  const [loading, setLoading] = useState(false)
  const [sniffing, setSniffing] = useState(false)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'tree' | 'diagram'>('list')

  const sniffAdminAddresses = async () => {
    setLoading(true)
    setSniffing(true)
    setError('')
    setFindings([])

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
          const findings: AdminFinding[] = []
          const baseUrl = window.location.origin
          const path = window.location.pathname

          // 1. 常见管理后台路径
          const adminPaths = [
            '/admin', '/admin/', '/administrator', '/login', '/login/',
            '/wp-admin', '/wp-login', '/dashboard', '/management', '/console',
            '/backend', '/backoffice', '/cpanel', '/phpmyadmin', '/admin.php',
            '/admin/login', '/administrator/login', '/auth/login', '/user/login',
            '/portal', '/adminpanel', '/manage', '/control', '/controlpanel',
            '/system', '/system/admin', '/master', '/supervisor',
            '/api/admin', '/api/v1/admin', '/api/auth', '/api/login',
            '/graphql', '/graphiql', '/altair', '/voyager',
            '/swagger', '/swagger-ui', '/api-docs', '/docs', '/redoc',
            '/h2-console', '/actuator', '/actuator/health', '/env',
            '/phpinfo', '/info', '.env', '/server-status',
            '/.git', '/.svn', '/.DS_Store', '/webpack',
            '/debug', '/trace', '/actuator/env', '/actuator/info',
            '/manager/html', '/tomcat', '/jenkins', '/jmx-console'
          ]

          adminPaths.forEach(path => {
            findings.push({
              type: 'url',
              value: baseUrl + path,
              source: '常见管理路径'
            })
          })

          // 2. 查找页面中的 API 端点
          const scripts = document.querySelectorAll('script')
          const apiPatterns = [
            // 常见API路径
            /["']([^"']*\/api\/[^"']+)["']/gi,
            /["']([^"']*\/api\/v\d+[^"']+)["']/gi,
            /["']([^"']*\/apis\/[^"']+)["']/gi,
            // 各种命名模式
            /endpoint\s*[:=]\s*["']([^"']+)["']/gi,
            /baseURL\s*[:=]\s*["']([^"']+)["']/gi,
            /baseUri\s*[:=]\s*["']([^"']+)["']/gi,
            /apiUrl\s*[:=]\s*["']([^"']+)["']/gi,
            /apiEndpoint\s*[:=]\s*["']([^"']+)["']/gi,
            /apiUri\s*[:=]\s*["']([^"']+)["']/gi,
            /api\s*[:=]\s*["']([^"']+)["']/gi,
            /apiBase\s*[:=]\s*["']([^"']+)["']/gi,
            // URL变量
            /url\s*[:=]\s*["']([^"']+)["']/gi,
            /URL\s*[:=]\s*["']([^"']+)["']/gi,
            /path\s*[:=]\s*["']([^"']+)["']/gi,
            // fetch
            /fetch\s*\(\s*["']([^"']+)["']/gi,
            /fetch\s*\(\s*`([^`]+)`/gi,
            // axios
            /axios\.[get|post|put|delete|patch|head|options]\s*\(\s*["']([^"']+)["']/gi,
            /axios\.(get|post|put|delete|patch|head|options)\s*\(\s*`([^`]+)`/gi,
            /axios\.create\s*\(\s*\{[^}]*baseURL:\s*["']([^"']+)["']/gi,
            // XMLHttpRequest
            /XMLHttpRequest.*["']([^"']+\.php[^"']*)["']/gi,
            /XMLHttpRequest.*["']([^"']+\.do[^"']*)["']/gi,
            /XMLHttpRequest.*["']([^"']+\.action[^"']*)["']/gi,
            /XMLHttpRequest.*open\s*\([^,]+,\s*["']([^"']+)["']/gi,
            // $.ajax
            /\$\.ajax\s*\(\s*\{[^}]*url:\s*["']([^"']+)["']/gi,
            // $.get $.post
            /\$\.(get|post|getJSON|postJSON)\s*\(\s*["']([^"']+)["']/gi,
            // 原生XHR
            /xhr\.open\s*\([^,]+,\s*["']([^"']+)["']/gi,
            /xhr\.send\s*\(\s*["']([^"']+)["']/gi,
            // service worker
            /register\s*\(\s*["']([^"']*\.js[^"']*)["']/gi,
            // import
            /import\s+.*\s+from\s+["']([^"']+)["']/gi,
            /import\s*\(\s*["']([^"']+)["']\)/gi,
            // Router路由
            /router\.(get|post|put|delete|patch)\s*\(\s*["']([^"']+)["']/gi,
            /@.*\.(get|post|put|delete|patch)\s*\(\s*["']([^"']+)["']/gi,
            // 常见后端路径
            /["']([^"']*\/admin\/[^"']+)["']/gi,
            /["']([^"']*\/user[s]?\/(?!login|register)[^"']+)["']/gi,
            /["']([^"']*\/data\/[^"']+)["']/gi,
            /["']([^"']*\/auth\/[^"']+)["']/gi,
            /["']([^"']*\/account\/[^"']+)["']/gi,
            /["']([^"']*\/upload\/[^"']+)["']/gi,
            /["']([^"']*\/file[s]?\/[^"']+)["']/gi
          ]

          const foundApis = new Set<string>()

          // 提取API的函数
          const extractApis = (text: string, fileName: string) => {
            apiPatterns.forEach(pattern => {
              let match
              // 重置正则状态
              const re = new RegExp(pattern.source, 'gi')
              while ((match = re.exec(text)) !== null) {
                let url = match[1] || match[2]
                if (!url) continue

                // 清理URL（去掉模板字符串变量）
                url = url.replace(/\$\{[^}]+\}/g, '').replace(/\{\{[^}]+\}\}/g, '')

                if (url && url.length > 3 && !foundApis.has(url)) {
                  // 跳过明显不是API的路径
                  if (url.includes('.css') || url.includes('.jpg') || url.includes('.png') ||
                      url.includes('.svg') || url.includes('.woff') || url.includes('.ico')) continue

                  foundApis.add(url)

                  if (url.startsWith('http')) {
                    findings.push({ type: 'api', value: url, source: `脚本中的API (${fileName})` })
                  } else if (url.startsWith('/')) {
                    findings.push({ type: 'api', value: baseUrl + url, source: `脚本中的API (${fileName})` })
                  } else {
                    findings.push({ type: 'api', value: baseUrl + '/' + url, source: `脚本中的API (${fileName})` })
                  }
                }
              }
            })
          }

          // 遍历所有脚本
          scripts.forEach((script: Element) => {
            const htmlScript = script as HTMLScriptElement
            const src = htmlScript.src
            const fileName = src ? (src.split('/').pop() || src) : 'inline'
            const text = script.textContent || ''
            extractApis(text, fileName)
          })

          // 3. 查找link标签中引用的JS文件
          const links = document.querySelectorAll('link[rel="stylesheet"][href*=".js"], link[rel="preload"][as="script"][href]')
          links.forEach((link: Element) => {
            const htmlLink = link as HTMLLinkElement
            const href = htmlLink.href
            if (href) {
              const fileName = href.split('/').pop() || href
              findings.push({
                type: 'endpoint',
                value: href,
                source: `引用的JS文件 (${fileName})`
              })
            }
          })

          // 4. 查找表单 action
          const forms = document.querySelectorAll('form[action]')
          forms.forEach((form: Element) => {
            const htmlForm = form as HTMLFormElement
            const action = htmlForm.getAttribute('action')
            if (action && !action.startsWith('javascript') && !action.startsWith('#')) {
              const fullUrl = action.startsWith('http') ? action : baseUrl + action
              findings.push({
                type: 'endpoint',
                value: fullUrl,
                source: `表单 action (${htmlForm.method || 'POST'})`
              })
            }
          })

          // 5. 查找配置信息
          const configPatterns = [
            { pattern: /connectionString\s*[:=]\s*["']([^"']+)["']/gi, name: 'connectionString' },
            { pattern: /database\s*[:=]\s*["']([^"']+)["']/gi, name: 'database' },
            { pattern: /db\s*[:=]\s*["']([^"']+)["']/gi, name: 'db' },
            { pattern: /mongo[DU]ri\s*[:=]\s*["']([^"']+)["']/gi, name: 'mongoDB/Atlas URI' },
            { pattern: /redis\s*[:=]\s*["']([^"']+)["']/gi, name: 'redis' },
            { pattern: /mysql\s*[:=]\s*["']([^"']+)["']/gi, name: 'mysql' },
            { pattern: /postgres\s*[:=]\s*["']([^"']+)["']/gi, name: 'postgresql' },
            { pattern: /jwtSecret\s*[:=]\s*["']([^"']+)["']/gi, name: 'jwtSecret' },
            { pattern: /secretKey\s*[:=]\s*["']([^"']+)["']/gi, name: 'secretKey' },
            { pattern: /apiKey\s*[:=]\s*["']([^"']+)["']/gi, name: 'apiKey' },
            { pattern: /token\s*[:=]\s*["']([^"']+)["']/gi, name: 'token' },
            { pattern: /Authorization\s*[:=]\s*["']([^"']+)["']/gi, name: 'Authorization' },
            { pattern: /Bearer\s+([a-zA-Z0-9\-_\.]+)/gi, name: 'Bearer Token' },
            { pattern: /Basic\s+([a-zA-Z0-9=]+)/gi, name: 'Basic Auth' },
            { pattern: /aws[KS]ecret\s*[:=]\s*["']([^"']+)["']/gi, name: 'AWS Secret' },
            { pattern: /aws[KA]ccess\s*[:=]\s*["']([^"']+)["']/gi, name: 'AWS Access Key' },
            { pattern: /private[KK]ey\s*[:=]\s*["']([^"']+)["']/gi, name: 'Private Key' },
            { pattern: /password\s*[:=]\s*["']([^"']+)["']/gi, name: 'password' },
            { pattern: /secret\s*[:=]\s*["']([^"']+)["']/gi, name: 'secret' }
          ]

          const configFound = new Set<string>()
          scripts.forEach((script: Element) => {
            const htmlScript = script as HTMLScriptElement
            const src = htmlScript.src
            const fileName = src ? (src.split('/').pop() || src) : 'inline script'
            const text = script.textContent || ''
            configPatterns.forEach(({ pattern, name }) => {
              let match
              while ((match = pattern.exec(text)) !== null) {
                const value = match[1] || match[2]
                if (value && value.length > 3 && !configFound.has(value)) {
                  configFound.add(value)
                  findings.push({
                    type: 'config',
                    value: `${name}: ${value.length > 40 ? value.substring(0, 40) + '...' : value}`,
                    source: `脚本中的配置 (${fileName})`
                  })
                }
              }
            })
          })

          // 6. 查找框架特征
          const frameworkIndicators = [
            { pattern: /react/i, name: 'React' },
            { pattern: /vue/i, name: 'Vue.js' },
            { pattern: /angular/i, name: 'Angular' },
            { pattern: /next/i, name: 'Next.js' },
            { pattern: /nuxt/i, name: 'Nuxt.js' },
            { pattern: /django/i, name: 'Django' },
            { pattern: /flask/i, name: 'Flask' },
            { pattern: /spring/i, name: 'Spring' },
            { pattern: /express/i, name: 'Express.js' },
            { pattern: /laravel/i, name: 'Laravel' },
            { pattern: /symfony/i, name: 'Symfony' },
            { pattern: /codeigniter/i, name: 'CodeIgniter' },
            { pattern: /thinkphp/i, name: 'ThinkPHP' },
            { pattern: /node/i, name: 'Node.js' },
            { pattern: /asp\.net/i, name: 'ASP.NET' },
            { pattern: /springboot/i, name: 'Spring Boot' },
            { pattern: /fastapi/i, name: 'FastAPI' },
            { pattern: /gin/i, name: 'Gin (Go)' },
            { pattern: /echo/i, name: 'Echo (Go)' },
            { pattern: /rails/i, name: 'Ruby on Rails' },
            { pattern: /symfony/i, name: 'Symfony' },
            { pattern: /yii/i, name: 'Yii' },
            { pattern: /svelte/i, name: 'Svelte' }
          ]

          const foundFrameworks = new Set<string>()

          // 检查 HTML 中的框架引用
          const scriptAndMeta = document.querySelectorAll('script, meta')
          scriptAndMeta.forEach(el => {
            const content = el.outerHTML
            frameworkIndicators.forEach(fw => {
              if (fw.pattern.test(content) && !foundFrameworks.has(fw.name)) {
                foundFrameworks.add(fw.name)
                findings.push({
                  type: 'framework',
                  value: fw.name,
                  source: '页面中的框架特征'
                })
              }
            })
          })

          // 检查 meta 标签
          const metaGenerator = document.querySelector('meta[name="generator"]')
          if (metaGenerator) {
            const content = metaGenerator.getAttribute('content')
            if (content) {
              findings.push({
                type: 'framework',
                value: content,
                source: 'Meta Generator'
              })
            }
          }

          // 7. 查找可能的数据接口
          const dataEndpoints = [
            '/data', '/json', '/jsonp', '/graphql', '/query',
            '/users', '/user', '/auth', '/login', '/logout',
            '/token', '/session', '/cookie',
            '/admin', '/manage', '/panel', '/config', '/setting',
            '/database', '/db', '/backup', '/export', '/import',
            '/upload', '/download', '/file', '/media',
            '/order', '/product', '/payment', '/pay',
            '/message', '/notification', '/notification'
          ]

          dataEndpoints.forEach(endpoint => {
            findings.push({
              type: 'endpoint',
              value: baseUrl + endpoint,
              source: '可能的数据接口'
            })
          })

          // 8. 当前页面URL分析
          if (path && path !== '/') {
            findings.push({
              type: 'url',
              value: baseUrl + path,
              source: '当前页面路径'
            })

            // 尝试构造可能的 admin URL
            const pathParts = path.split('/').filter(p => p)
            if (pathParts.length > 0) {
              // 去掉最后一个部分，尝试上级路径
              const parentPath = path.substring(0, path.lastIndexOf('/')) || '/'
              findings.push({
                type: 'url',
                value: baseUrl + parentPath + '/admin',
                source: '上级目录+admin'
              })
            }
          }

          // 9. WebSocket 连接
          const wsPatterns = [
            /new\s+WebSocket\s*\(\s*["']([^"']+)["']/gi,
            /ws\s*[:=]\s*["']([^"']+)["']/gi,
            /wss\s*[:=]\s*["']([^"']+)["']/gi
          ]

          scripts.forEach((script: Element) => {
            const htmlScript = script as HTMLScriptElement
            const src = htmlScript.src
            const fileName = src ? (src.split('/').pop() || src) : 'inline'
            const text = script.textContent || ''
            wsPatterns.forEach(pattern => {
              let match
              while ((match = pattern.exec(text)) !== null) {
                if (match[1]) {
                  findings.push({
                    type: 'endpoint',
                    value: match[1],
                    source: `WebSocket连接 (${fileName})`
                  })
                }
              }
            })
          })

          return findings
        }
      })

      const foundFindings = results?.[0]?.result || []

      // 去重
      const uniqueFindings = foundFindings.filter((finding: AdminFinding, index: number, self: AdminFinding[]) => {
        return index === self.findIndex(f => f.value === finding.value)
      })

      // 对URL类型的发现进行404检测（仅对同域名的URL进行检测）
      const baseUrl = new URL(tab.url || '').origin
      const urlFindings = uniqueFindings.filter((f: AdminFinding) => {
        if (f.type !== 'url' && f.type !== 'endpoint') return false
        try {
          const url = new URL(f.value)
          return url.origin === baseUrl // 只检测同域名的URL
        } catch {
          return false
        }
      })
      const otherFindings = uniqueFindings.filter((f: AdminFinding) => {
        try {
          const url = new URL(f.value)
          return url.origin !== baseUrl
        } catch {
          return true
        }
      })

      if (urlFindings.length > 0) {
        try {
          // 发送到后台脚本检查URL状态
          const urlList = urlFindings.map((f: AdminFinding) => f.value)
          const statusResults = await chrome.runtime.sendMessage({
            action: 'checkUrlsStatus',
            urls: urlList
          })

          // 过滤掉404的URL、重定向到主页的URL、以及返回404页面的URL
          const validUrlFindings = urlFindings.filter((f: AdminFinding) => {
            const result = statusResults[f.value]
            if (!result) return true
            // 过滤不存在的和重定向的
            if (!result.exists) return false
            if (result.redirectToHome || result.redirected) return false
            // 过滤返回404页面的URL
            if (result.is404Page) return false
            return true
          })

          setFindings([...validUrlFindings, ...otherFindings])
        } catch (err) {
          console.error('URL check error:', err)
          // 如果检查失败，显示所有结果
          setFindings(uniqueFindings)
        }
      } else {
        setFindings(uniqueFindings)
      }

      if (foundFindings.length === 0) {
        setError('未发现可疑的后台地址')
      }
    } catch (err) {
      console.error('Sniff error:', err)
      setError('嗅探失败: ' + (err instanceof Error ? err.message : '未知错误'))
    } finally {
      setLoading(false)
      setSniffing(false)
    }
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'url': return '🔗'
      case 'api': return '🔌'
      case 'config': return '⚙️'
      case 'framework': return '🛠️'
      case 'endpoint': return '📡'
      default: return '📁'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'url': return 'bg-blue-100 text-blue-800'
      case 'api': return 'bg-green-100 text-green-800'
      case 'config': return 'bg-red-100 text-red-800'
      case 'framework': return 'bg-yellow-100 text-yellow-800'
      case 'endpoint': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // 按类型分组
  const groupedFindings = findings.reduce((acc, finding) => {
    if (!acc[finding.type]) {
      acc[finding.type] = []
    }
    acc[finding.type].push(finding)
    return acc
  }, {} as Record<string, AdminFinding[]>)

  useEffect(() => {
    sniffAdminAddresses()
  }, [])

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 text-xl">←</button>
        <h2 className="text-lg font-semibold">嗅探管理地址</h2>
        <button
          onClick={sniffAdminAddresses}
          disabled={loading}
          className="ml-auto px-3 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-sm rounded"
        >
          {loading ? '嗅探中...' : '重新嗅探'}
        </button>
      </div>

      {/* 页签切换 */}
      {findings.length > 0 && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setViewMode('list')}
            disabled={loading}
            className={`flex-1 px-3 py-2 text-sm rounded-lg ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            列表视图
          </button>
          <button
            onClick={() => setViewMode('tree')}
            disabled={loading}
            className={`flex-1 px-3 py-2 text-sm rounded-lg ${viewMode === 'tree' ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            树形图
          </button>
          <button
            onClick={() => setViewMode('diagram')}
            disabled={loading}
            className={`flex-1 px-3 py-2 text-sm rounded-lg ${viewMode === 'diagram' ? 'bg-purple-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            网络图
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">{error}</p>
        </div>
      )}

      {sniffing && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg text-center">
          <div className="animate-pulse text-blue-600">正在分析页面...</div>
        </div>
      )}

      {loading && findings.length > 0 && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
          <div className="animate-pulse text-green-600 text-sm">正在检测URL有效性...</div>
        </div>
      )}

      {/* 统计信息 */}
      {findings.length > 0 && (
        <div className="mb-4 grid grid-cols-5 gap-2">
          <div className="p-2 bg-blue-50 rounded text-center">
            <div className="text-lg font-semibold text-blue-600">{groupedFindings['url']?.length || 0}</div>
            <div className="text-xs text-gray-500">URL</div>
          </div>
          <div className="p-2 bg-green-50 rounded text-center">
            <div className="text-lg font-semibold text-green-600">{groupedFindings['api']?.length || 0}</div>
            <div className="text-xs text-gray-500">API</div>
          </div>
          <div className="p-2 bg-purple-50 rounded text-center">
            <div className="text-lg font-semibold text-purple-600">{groupedFindings['endpoint']?.length || 0}</div>
            <div className="text-xs text-gray-500">端点</div>
          </div>
          <div className="p-2 bg-yellow-50 rounded text-center">
            <div className="text-lg font-semibold text-yellow-600">{groupedFindings['framework']?.length || 0}</div>
            <div className="text-xs text-gray-500">框架</div>
          </div>
          <div className="p-2 bg-red-50 rounded text-center">
            <div className="text-lg font-semibold text-red-600">{groupedFindings['config']?.length || 0}</div>
            <div className="text-xs text-gray-500">配置</div>
          </div>
        </div>
      )}

      {/* 树形图视图 */}
      {viewMode === 'tree' && findings.length > 0 && (
        <div className="mb-4 border border-green-200 rounded-lg overflow-hidden">
          <div className="p-3 bg-white overflow-auto max-h-[500px]">
            <TreeDiagram findings={findings} />
          </div>
        </div>
      )}

      {/* 网络图视图 */}
      {viewMode === 'diagram' && findings.length > 0 && (
        <div className="mb-4 border border-purple-200 rounded-lg overflow-hidden">
          <div className="p-3 bg-white overflow-auto max-h-[500px]">
            <NodeNetworkDiagram findings={findings} />
          </div>
        </div>
      )}

      {/* 分组显示结果 */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {Object.entries(groupedFindings).map(([type, items]) => (
          <div key={type} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className={`px-3 py-2 ${getTypeColor(type)} font-medium text-sm flex items-center gap-2`}>
              <span>{getTypeIcon(type)}</span>
              <span>{type.toUpperCase()}</span>
              <span className="text-xs opacity-75">({items.length})</span>
            </div>
            <div className="divide-y divide-gray-100">
              {items.map((item, index) => (
                <div key={index} className="p-2 hover:bg-gray-50">
                  <div className="text-sm font-mono text-gray-700 break-all">{item.value}</div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">{item.source}</span>
                    <button
                      onClick={() => copyUrl(item.value)}
                      className="text-xs text-blue-500 hover:text-blue-700"
                    >
                      复制
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {findings.length === 0 && !loading && !error && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">使用说明</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• 自动扫描页面中的管理后台地址</li>
            <li>• 检测常见的管理路径如 /admin, /login 等</li>
            <li>• 提取页面脚本中的 API 接口</li>
            <li>• 识别前端框架和后端技术</li>
            <li>• 查找可能的数据库连接配置</li>
            <li>• 注意: 检测结果仅供参考，需要人工验证</li>
          </ul>
        </div>
      )}
    </div>
  )
}

// 树形图组件
function TreeDiagram({ findings }: { findings: AdminFinding[] }) {
  // 提取域名
  const getDomain = (url: string) => {
    try {
      return new URL(url).origin
    } catch {
      return ''
    }
  }

  const getPath = (url: string) => {
    try {
      return new URL(url).pathname
    } catch {
      return url
    }
  }

  const domain = getDomain(findings[0]?.value || '')

  // 按类型分组
  const grouped = findings.reduce((acc, f) => {
    if (!acc[f.type]) acc[f.type] = []
    acc[f.type].push(f)
    return acc
  }, {} as Record<string, AdminFinding[]>)

  // 类型配置
  const typeConfig: Record<string, { color: string; icon: string; label: string }> = {
    url: { color: '#3B82F6', icon: '🔗', label: '管理后台' },
    api: { color: '#22C55E', icon: '🔌', label: 'API接口' },
    endpoint: { color: '#A855F7', icon: '📡', label: '端点' },
    config: { color: '#EF4444', icon: '⚙️', label: '配置' },
    framework: { color: '#EAB308', icon: '🛠️', label: '框架' }
  }

  // 简化显示 - 按路径前缀分组
  const pathGroups: Record<string, AdminFinding[]> = {}

  findings.forEach(f => {
    const path = getPath(f.value)
    // 提取第一级路径
    const firstPart = path.split('/').filter(p => p)[0] || '/'
    const key = `/${firstPart}`
    if (!pathGroups[key]) pathGroups[key] = []
    pathGroups[key].push(f)
  })

  return (
    <div className="font-mono text-xs">
      {/* 图例 */}
      <div className="flex flex-wrap gap-3 mb-4 pb-2 border-b">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-gray-800" />
          <span className="font-bold">根节点</span>
        </div>
        {Object.entries(typeConfig).map(([type, config]) => (
          grouped[type] && (
            <div key={type} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: config.color }} />
              <span>{config.label}({grouped[type].length})</span>
            </div>
          )
        ))}
      </div>

      {/* 树形结构 */}
      <div className="space-y-2">
        {/* 根节点 */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-800 flex items-center justify-center">
            <span className="text-white text-xs">🌐</span>
          </div>
          <span className="font-bold text-gray-800">{domain}</span>
        </div>

        {/* 一级路径分支 */}
        {Object.entries(pathGroups).sort((a, b) => b[1].length - a[1].length).map(([groupPath, items]) => (
          <div key={groupPath} className="ml-4">
            {/* 分支线 */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-px bg-gray-300" />
              <div className="w-px h-4 bg-gray-300" />
              <div className="px-2 py-1 bg-gray-100 rounded text-gray-600">
                {groupPath}
              </div>
              <span className="text-gray-400 text-xs">({items.length})</span>
            </div>

            {/* 该分支下的节点 */}
            <div className="ml-10 space-y-1 mt-1">
              {items.slice(0, 10).map((item, idx) => {
                const config = typeConfig[item.type] || { color: '#9CA3AF', icon: '📁', label: item.type }
                return (
                  <div key={idx} className="group flex items-center gap-2 hover:bg-gray-50 rounded p-1 cursor-pointer">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }} />
                      <span>{config.icon}</span>
                    </div>
                    <span
                      className="truncate max-w-[200px]"
                      title={item.value}
                    >
                      {getPath(item.value).replace(groupPath, '').split('/').filter(p => p)[0] || '/'}
                    </span>
                    <span className="text-gray-400 text-[10px] truncate max-w-[150px]">
                      {getPath(item.value)}
                    </span>

                    {/* 悬停显示完整URL */}
                    <div className="hidden group-hover:block absolute bg-gray-800 text-white px-2 py-1 rounded text-xs z-10 -mt-8">
                      {item.value}
                    </div>
                  </div>
                )
              })}
              {items.length > 10 && (
                <div className="text-gray-400 text-xs ml-4">
                  ... 还有 {items.length - 10} 个
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 统计 */}
      <div className="mt-4 pt-2 border-t text-gray-500 text-center">
        共 {findings.length} 个节点
      </div>
    </div>
  )
}

// 网络节点图组件 - 带连线
function NodeNetworkDiagram({ findings }: { findings: AdminFinding[] }) {
  // 提取域名
  const getDomain = (url: string) => {
    try {
      return new URL(url).origin
    } catch {
      return ''
    }
  }

  const domain = getDomain(findings[0]?.value || '')

  // 按类型分组
  const grouped = findings.reduce((acc, f) => {
    if (!acc[f.type]) acc[f.type] = []
    acc[f.type].push(f)
    return acc
  }, {} as Record<string, AdminFinding[]>)

  // 类型配置
  const typeConfig: Record<string, { color: string; icon: string; label: string }> = {
    url: { color: '#3B82F6', icon: '🔗', label: '管理后台' },
    api: { color: '#22C55E', icon: '🔌', label: 'API接口' },
    endpoint: { color: '#A855F7', icon: '📡', label: '端点' },
    config: { color: '#EF4444', icon: '⚙️', label: '配置' },
    framework: { color: '#EAB308', icon: '🛠️', label: '框架' }
  }

  // 获取路径
  const getPath = (url: string) => {
    try {
      return new URL(url).pathname
    } catch {
      return url
    }
  }

  // 中心点坐标
  const centerX = 200
  const centerY = 220
  const centerRadius = 40
  const nodeRadius = 20

  // 计算所有节点位置
  const nodes: { x: number; y: number; item: AdminFinding; type: string; config: typeof typeConfig[string] }[] = []

  Object.entries(grouped).forEach(([type, items], typeIndex) => {
    const config = typeConfig[type]
    if (!config) return

    const totalTypes = Object.keys(grouped).length
    const angleStep = (Math.PI * 2) / totalTypes
    const baseAngle = typeIndex * angleStep - Math.PI / 2

    items.slice(0, 12).forEach((item, i) => {
      const row = Math.floor(i / 4)
      const col = i % 4
      const offsetAngle = (col - 1.5) * 0.25
      const distance = 80 + row * 50
      const angle = baseAngle + offsetAngle

      nodes.push({
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        item,
        type,
        config
      })
    })
  })

  // 生成SVG连线
  const connections = nodes.map(node => {
    // 计算从中心到节点的连线
    const angle = Math.atan2(node.y - centerY, node.x - centerX)
    const startX = centerX + Math.cos(angle) * (centerRadius + 5)
    const startY = centerY + Math.sin(angle) * (centerRadius + 5)
    const endX = node.x - Math.cos(angle) * (nodeRadius + 5)
    const endY = node.y - Math.sin(angle) * (nodeRadius + 5)

    return { x1: startX, y1: startY, x2: endX, y2: endY, color: node.config.color }
  })

  return (
    <div className="relative w-full" style={{ minHeight: '480px' }}>
      {/* 图例 */}
      <div className="absolute top-0 left-0 flex flex-wrap gap-2 p-2 bg-white/90 rounded-lg shadow-sm z-10">
        <div className="flex items-center gap-1 px-2 py-1 bg-gray-800 rounded text-white text-xs">
          <span>🌐</span> {domain}
        </div>
        {Object.entries(typeConfig).map(([type, config]) => (
          grouped[type] && (
            <div key={type} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }} />
              <span className="text-xs">{config.label}({grouped[type].length})</span>
            </div>
          )
        ))}
      </div>

      <svg
        className="absolute top-0 left-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      >
        {/* 主中心连线 - 从中心到各个类型区域 */}
        {Object.keys(grouped).map((_, typeIndex) => {
          const totalTypes = Object.keys(grouped).length
          const angleStep = (Math.PI * 2) / totalTypes
          const angle = typeIndex * angleStep - Math.PI / 2
          const endX = centerX + Math.cos(angle) * 70
          const endY = centerY + Math.sin(angle) * 70
          const color = Object.values(grouped)[typeIndex]
            ? typeConfig[Object.keys(grouped)[typeIndex]]?.color || '#9CA3AF'
            : '#9CA3AF'

          return (
            <line
              key={typeIndex}
              x1={centerX}
              y1={centerY}
              x2={endX}
              y2={endY}
              stroke={color}
              strokeWidth="2"
              strokeOpacity="0.5"
              strokeDasharray="4 2"
            />
          )
        })}

        {/* 所有连接线 */}
        {connections.map((conn, i) => (
          <line
            key={i}
            x1={conn.x1}
            y1={conn.y1}
            x2={conn.x2}
            y2={conn.y2}
            stroke={conn.color}
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />
        ))}
      </svg>

      {/* 中心节点 */}
      <div
        className="absolute flex flex-col items-center justify-center rounded-full shadow-lg border-4"
        style={{
          left: `${centerX - centerRadius}px`,
          top: `${centerY - centerRadius}px`,
          width: `${centerRadius * 2}px`,
          height: `${centerRadius * 2}px`,
          backgroundColor: '#1F2937',
          borderColor: '#4B5563'
        }}
      >
        <span className="text-2xl">🌐</span>
      </div>
      <div
        className="absolute px-2 py-0.5 bg-gray-800 text-white text-[10px] rounded-full whitespace-nowrap"
        style={{
          left: `${centerX - 40}px`,
          top: `${centerY + centerRadius + 8}px`,
          width: '80px',
          textAlign: 'center'
        }}
      >
        {domain.replace('https://', '').replace('http://', '')}
      </div>

      {/* 节点 */}
      {nodes.map((node, i) => (
        <div
          key={i}
          className="absolute flex flex-col items-center group"
          style={{
            left: `${node.x - nodeRadius}px`,
            top: `${node.y - nodeRadius}px`,
            width: `${nodeRadius * 2}px`,
            height: `${nodeRadius * 2}px`
          }}
        >
          <div
            className="w-full h-full rounded-full flex items-center justify-center text-sm shadow-md border-2 cursor-pointer hover:scale-110 transition-transform"
            style={{
              backgroundColor: node.config.color,
              borderColor: node.config.color
            }}
            title={node.item.value}
          >
            <span className="text-white">{node.config.icon}</span>
          </div>

          {/* 标签 */}
          <div
            className="absolute top-full mt-1 px-1 py-0.5 bg-white/90 rounded text-[9px] text-gray-600 max-w-[70px] truncate shadow-sm whitespace-nowrap"
          >
            {getPath(node.item.value).split('/').filter(p => p).pop() || '/'}
          </div>

          {/* 悬停显示完整URL */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
            {node.item.value}
          </div>
        </div>
      ))}

      {/* 更多节点提示 */}
      {Object.entries(grouped).map(([type, items], typeIndex) => {
        if (items.length <= 12) return null
        const totalTypes = Object.keys(grouped).length
        const angleStep = (Math.PI * 2) / totalTypes
        const angle = typeIndex * angleStep - Math.PI / 2
        const x = centerX + Math.cos(angle) * 200
        const y = centerY + Math.sin(angle) * 200

        return (
          <div
            key={type}
            className="absolute text-xs text-gray-500"
            style={{
              left: `${x - 20}px`,
              top: `${y - 10}px`,
              width: '40px',
              textAlign: 'center'
            }}
          >
            +{items.length - 12}
          </div>
        )
      })}

      {/* 统计 */}
      <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-gray-500 py-2 bg-white/80">
        共 {findings.length} 个连接节点
      </div>
    </div>
  )
}
