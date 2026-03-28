import { useState, useEffect, useRef } from 'react'

interface LinkInfo {
  url: string
  text: string
  domain: string
}

interface ModelConfig {
  id: string
  name: string
  model: string
  endpoint: string
  apiKey: string
  authType: 'Bearer' | 'ApiKey' | 'Basic'
}

interface LinkAnalyzerProps {
  onBack: () => void
  pageUrl?: string
}

export default function LinkAnalyzer({ onBack, pageUrl }: LinkAnalyzerProps) {
  const [links, setLinks] = useState<LinkInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [domainCount, setDomainCount] = useState<Record<string, number>>({})
  const [showNetwork, setShowNetwork] = useState(false)
  const [aiAnalyzing, setAiAnalyzing] = useState(false)
  const [aiResult, setAiResult] = useState('')
  const [models, setModels] = useState<ModelConfig[]>([])
  const [selectedModelId, setSelectedModelId] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    analyzeLinks()
    loadModels()
  }, [pageUrl])

  useEffect(() => {
    analyzeLinks()
  }, [pageUrl])

  useEffect(() => {
    if (showNetwork && canvasRef.current) {
      drawNetworkGraph()
    }
  }, [showNetwork, domainCount])

  const analyzeLinks = async () => {
    setLoading(true)
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab.id) return

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        func: () => {
          const pageDomain = window.location.hostname
          const allLinks: { url: string; text: string; domain: string }[] = []

          const anchors = document.querySelectorAll('a[href]')
          anchors.forEach((anchor) => {
            const href = anchor.getAttribute('href')
            if (!href) return

            // 过滤 javascript: 和 about: 链接
            if (href.toLowerCase().startsWith('javascript:')) return
            if (href.toLowerCase().startsWith('about:')) return

            try {
              let fullUrl = href
              if (href.startsWith('/')) {
                fullUrl = window.location.origin + href
              }

              const url = new URL(fullUrl)
              const linkDomain = url.hostname

              if (linkDomain !== pageDomain && !linkDomain.endsWith('.' + pageDomain)) {
                allLinks.push({
                  url: fullUrl,
                  text: anchor.textContent?.trim() || linkDomain,
                  domain: linkDomain
                })
              }
            } catch (e) {
              // ignore
            }
          })

          return allLinks
        }
      })

      const validResult = results?.find(r => r.result)
      if (validResult?.result) {
        const linkList = validResult.result as LinkInfo[]
        setLinks(linkList)

        const domainStats: Record<string, number> = {}
        linkList.forEach(link => {
          domainStats[link.domain] = (domainStats[link.domain] || 0) + 1
        })
        setDomainCount(domainStats)
      }
    } catch (error) {
      console.error('Failed to analyze links:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const analyzeWithAI = async () => {
    if (!selectedModelId || links.length === 0) return

    setAiAnalyzing(true)
    setAiResult('')

    try {
      const model = models.find(m => m.id === selectedModelId)
      if (!model) {
        setAiResult('请先在设置中配置AI模型')
        setAiAnalyzing(false)
        return
      }

      const linkSummary = Object.entries(domainCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([domain, count]) => `${domain}: ${count}个链接`)
        .join('\n')

      const prompt = `请分析以下页面的外部链接信息：

外链总数: ${links.length}
涉及域名数: ${Object.keys(domainCount).length}

各域名外链数量:
${linkSummary}

请分析：
1. 这些外链的主要来源和目的
2. 是否存在可疑或恶意的链接
3. 对SEO的影响
4. 建议保留或移除哪些链接

请用简洁的中文回答。`

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
          max_tokens: 1000
        })
      })

      const data = await response.json()
      const result = data.choices?.[0]?.message?.content || data.error?.message || '分析失败'
      setAiResult(result)
    } catch (error) {
      setAiResult(`分析失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setAiAnalyzing(false)
    }
  }

  // 绘制网络图动画
  const drawNetworkGraph = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    const domains = Object.entries(domainCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']

    // 节点位置
    const nodes = domains.map(([domain], i) => {
      const angle = (i / domains.length) * Math.PI * 2
      const r = Math.min(width, height) * 0.35
      return {
        x: width / 2 + Math.cos(angle) * r,
        y: height / 2 + Math.sin(angle) * r,
        domain,
        color: colors[i % colors.length],
        targetX: width / 2 + Math.cos(angle) * r,
        targetY: height / 2 + Math.sin(angle) * r,
        vx: 0,
        vy: 0
      }
    })

    let animationId: number
    let time = 0

    const animate = () => {
      time++
      ctx.clearRect(0, 0, width, height)

      // 绘制连线（从中心到各节点）
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)'
      ctx.lineWidth = 1

      // 动态连线
      nodes.forEach((node, i) => {
        const pulse = Math.sin(time * 0.05 + i) * 0.2 + 0.8

        // 绘制从中心到节点的发光线
        const gradient = ctx.createLinearGradient(width / 2, height / 2, node.x, node.y)
        gradient.addColorStop(0, `rgba(100, 116, 139, ${0.1 * pulse})`)
        gradient.addColorStop(1, node.color.replace(')', `, ${0.4 * pulse})`).replace('rgb', 'rgba'))

        ctx.beginPath()
        ctx.moveTo(width / 2, height / 2)
        ctx.lineTo(node.x, node.y)
        ctx.strokeStyle = gradient
        ctx.stroke()
      })

      // 绘制节点
      nodes.forEach((node, i) => {
        const pulse = Math.sin(time * 0.08 + i * 0.5) * 3
        const radius = 12 + pulse

        // 节点光晕
        const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 2)
        glow.addColorStop(0, 'rgba(99, 102, 241, 0.3)')
        glow.addColorStop(1, 'transparent')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius * 2, 0, Math.PI * 2)
        ctx.fill()

        // 节点
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = node.color
        ctx.fill()

        // 节点边框
        ctx.strokeStyle = 'white'
        ctx.lineWidth = 2
        ctx.stroke()

        // 域名文字
        ctx.fillStyle = '#1f2937'
        ctx.font = '10px sans-serif'
        ctx.textAlign = 'center'
        const shortDomain = node.domain.length > 12 ? node.domain.substring(0, 12) + '...' : node.domain
        ctx.fillText(shortDomain, node.x, node.y + radius + 12)
      })

      // 中心圆点
      const centerPulse = Math.sin(time * 0.1) * 2 + 8
      ctx.beginPath()
      ctx.arc(width / 2, height / 2, centerPulse, 0, Math.PI * 2)
      ctx.fillStyle = '#6366F1'
      ctx.fill()

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
    }
  }

  // 简化版饼图
  const renderPieChart = () => {
    if (Object.keys(domainCount).length === 0) return null

    const domains = Object.entries(domainCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']
    const total = domains.reduce((sum, [, count]) => sum + count, 0)

    let currentAngle = -Math.PI / 2
    const size = 140
    const cx = size / 2
    const cy = size / 2
    const radius = size / 2 - 10

    const slices = domains.map(([domain, count], index) => {
      const angle = (count / total) * 2 * Math.PI
      const startAngle = currentAngle
      currentAngle += angle

      const x1 = cx + radius * Math.cos(startAngle)
      const y1 = cy + radius * Math.sin(startAngle)
      const x2 = cx + radius * Math.cos(startAngle + angle)
      const y2 = cy + radius * Math.sin(startAngle + angle)

      const largeArc = angle > Math.PI ? 1 : 0

      return {
        domain,
        count,
        path: `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
        color: colors[index % colors.length],
        percentage: ((count / total) * 100).toFixed(0)
      }
    })

    return (
      <div className="flex items-start gap-4">
        <svg width={size} height={size} className="flex-shrink-0">
          {slices.map((slice, i) => (
            <path
              key={i}
              d={slice.path}
              fill={slice.color}
              stroke="white"
              strokeWidth="1"
              className="transition-transform hover:scale-105"
            />
          ))}
        </svg>
        <div className="flex-1 space-y-1">
          {domains.map(([domain, count], index) => (
            <div key={domain} className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: colors[index % colors.length] }} />
              <span className="text-gray-600 truncate">{domain}</span>
              <span className="text-gray-400 ml-auto">{count}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 text-xl">←</button>
        <h2 className="text-lg font-semibold">外链分析</h2>
        <button
          onClick={() => {
            analyzeLinks()
          }}
          disabled={loading}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
          title="刷新分析"
        >
          🔄
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">分析中...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600">{links.length}</div>
              <div className="text-xs text-gray-600">外链总数</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600">{Object.keys(domainCount).length}</div>
              <div className="text-xs text-gray-600">涉及域名</div>
            </div>
          </div>

          {/* 切换视图 */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setShowNetwork(false)}
              className={`flex-1 py-1.5 rounded text-sm ${!showNetwork ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              分布图
            </button>
            <button
              onClick={() => setShowNetwork(true)}
              className={`flex-1 py-1.5 rounded text-sm ${showNetwork ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              网络图
            </button>
          </div>

          {/* AI分析按钮 */}
          {links.length > 0 && (
            <div className="mb-4">
              <button
                onClick={analyzeWithAI}
                disabled={aiAnalyzing || models.length === 0}
                className="w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              >
                {aiAnalyzing ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    AI分析中...
                  </>
                ) : (
                  <>
                    <span>🤖</span>
                    AI智能分析
                  </>
                )}
              </button>
              {models.length === 0 && (
                <p className="text-xs text-gray-500 mt-1 text-center">请先在设置中配置AI模型</p>
              )}
            </div>
          )}

          {/* AI分析结果 */}
          {aiResult && (
            <div className="mb-4 p-3 bg-purple-50 rounded-lg">
              <h4 className="text-sm font-medium text-purple-700 mb-2">AI分析结果</h4>
              <p className="text-xs text-gray-700 whitespace-pre-wrap">{aiResult}</p>
            </div>
          )}

          {/* 可视化 */}
          <div className="bg-gray-50 rounded-lg p-3">
            {showNetwork ? (
              <canvas
                ref={canvasRef}
                width={300}
                height={200}
                className="w-full"
              />
            ) : (
              renderPieChart()
            )}
          </div>

          {/* 外链列表 */}
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">外链列表</h3>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {links.slice(0, 30).map((link, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                  <div className="font-medium text-blue-600 truncate">{link.domain}</div>
                  <div className="text-gray-400 truncate">{link.url}</div>
                </div>
              ))}
              {links.length > 30 && (
                <div className="text-center text-gray-500 text-sm py-2">
                  还有 {links.length - 30} 个外链...
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
