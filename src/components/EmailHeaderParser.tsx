import { useState, useEffect } from 'react'

interface EmailHeader {
  name: string
  value: string
}

interface ParsedInfo {
  category: string
  items: { label: string; value: string }[]
}

interface EmailHeaderParserProps {
  onBack: () => void
}

export default function EmailHeaderParser({ onBack }: EmailHeaderParserProps) {
  const [parsedInfo, setParsedInfo] = useState<ParsedInfo[]>([])
  const [error, setError] = useState('')
  const [rawHeaders, setRawHeaders] = useState('')
  const [manualInput, setManualInput] = useState('')
  const [debugMode, setDebugMode] = useState(false)
  const [debugResult, setDebugResult] = useState<any>(null)

  // Debug分析功能
  const runDebugAnalysis = () => {
    if (!rawHeaders) return

    const debug: any = {
      issues: [],
      warnings: [],
      info: [],
      timing: {},
      headers: {},
      validation: {}
    }

    // 解析headers为map
    const lines = rawHeaders.split(/\r?\n/)
    const headerMap: Record<string, string> = {}
    let currentHeader = ''
    lines.forEach(line => {
      if (/^\s+/.test(line) && currentHeader) {
        headerMap[currentHeader] += ' ' + line.trim()
      } else if (line.includes(':')) {
        const colonIndex = line.indexOf(':')
        const name = line.substring(0, colonIndex).trim()
        const value = line.substring(colonIndex + 1).trim()
        if (name) {
          headerMap[name] = value
          currentHeader = name
        }
      }
    })

    // 1. 检查必需的头部
    const requiredHeaders = ['From', 'To', 'Subject', 'Date', 'Message-ID']
    const recommendedHeaders = ['Reply-To', 'Return-Path', 'Content-Type', 'MIME-Version', 'X-Mailer']

    requiredHeaders.forEach(h => {
      if (!headerMap[h]) {
        debug.issues.push({ type: 'error', msg: `缺少必需头部: ${h}` })
      }
    })

    recommendedHeaders.forEach(h => {
      if (!headerMap[h]) {
        debug.warnings.push({ type: 'warning', msg: `建议添加头部: ${h}` })
      }
    })

    // 2. 头部格式验证
    if (headerMap['From'] && !headerMap['From'].includes('@')) {
      debug.issues.push({ type: 'error', msg: 'From头部格式无效' })
    }

    if (headerMap['Message-ID'] && !headerMap['Message-ID'].includes('@')) {
      debug.warnings.push({ type: 'warning', msg: 'Message-ID格式可能无效' })
    }

    // 3. 时间分析
    const dateHeader = headerMap['Date']
    if (dateHeader) {
      try {
        const emailDate = new Date(dateHeader)
        const now = new Date()
        const diff = now.getTime() - emailDate.getTime()
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))

        if (days > 30) {
          debug.warnings.push({ type: 'warning', msg: `邮件发送时间较旧: ${days}天前` })
        } else if (days < 0) {
          debug.warnings.push({ type: 'warning', msg: '邮件时间在未来，可能是时区问题' })
        }

        // 计算接收时间差
        const receivedHeaders = Object.entries(headerMap).filter(([k]) => k.toLowerCase().startsWith('received'))
        if (receivedHeaders.length > 0) {
          const lastReceived = receivedHeaders[receivedHeaders.length - 1][1]
          // 提取时间戳
          const timeMatch = lastReceived.match(/;\s*(.+)$/)
          if (timeMatch) {
            try {
              const receivedDate = new Date(timeMatch[1].trim())
              const delay = receivedDate.getTime() - emailDate.getTime()
              const minutes = Math.floor(delay / (1000 * 60))
              if (minutes > 60) {
                debug.warnings.push({ type: 'warning', msg: `邮件延迟较高: ${minutes}分钟` })
              }
              debug.timing.delayMinutes = minutes
            } catch (e) { }
          }
        }
        debug.timing.sentTime = emailDate.toISOString()
      } catch (e) {
        debug.warnings.push({ type: 'warning', msg: '无法解析Date头部' })
      }
    }

    // 4. 路由分析（Received头部）
    const receivedHeaders = Object.entries(headerMap).filter(([k]) => k.toLowerCase() === 'received')
    debug.hops = receivedHeaders.map(([, v], idx) => {
      // 提取from和by
      const fromMatch = v.match(/from\s+([^\s]+)/i)
      const byMatch = v.match(/by\s+([^\s]+)/i)
      const timeMatch = v.match(/;\s*(.+)$/)
      return {
        num: receivedHeaders.length - idx,
        from: fromMatch ? fromMatch[1] : 'unknown',
        by: byMatch ? byMatch[1] : 'unknown',
        time: timeMatch ? timeMatch[1].trim() : 'unknown'
      }
    })

    // 5. 认证分析
    const authResults = headerMap['Authentication-Results'] || ''
    if (authResults.includes('spf=fail')) {
      debug.issues.push({ type: 'error', msg: 'SPF验证失败' })
    }
    if (authResults.includes('dkim=fail')) {
      debug.issues.push({ type: 'error', msg: 'DKIM验证失败' })
    }
    if (authResults.includes('dmarc=fail')) {
      debug.issues.push({ type: 'error', msg: 'DMARC验证失败' })
    }
    if (!authResults) {
      debug.warnings.push({ type: 'warning', msg: '无Authentication-Results头部' })
    }

    // 6. 编码检查
    const contentType = headerMap['Content-Type'] || ''
    if (!contentType.includes('charset')) {
      debug.warnings.push({ type: 'warning', msg: 'Content-Type缺少charset' })
    }

    const encoding = headerMap['Content-Transfer-Encoding'] || ''
    if (!encoding) {
      debug.info.push({ type: 'info', msg: '未指定Content-Transfer-Encoding' })
    }

    // 7. IP分析（提取IP地址）
    const ipPattern = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g
    const ips = rawHeaders.match(ipPattern) || []
    debug.ips = [...new Set(ips)]

    // 8. 统计信息
    debug.stats = {
      totalHeaders: Object.keys(headerMap).length,
      receivedCount: receivedHeaders.length,
      hasReplyTo: !!headerMap['Reply-To'],
      hasReturnPath: !!headerMap['Return-Path'],
      contentType: contentType.split(';')[0] || 'unknown'
    }

    setDebugResult(debug)
  }

  useEffect(() => {
    if (debugMode && rawHeaders) {
      runDebugAnalysis()
    }
  }, [debugMode, rawHeaders])

  const parseHeaders = (input: string): ParsedInfo[] => {
    const results: ParsedInfo[] = []

    // 解析每行
    const lines = input.split(/\r?\n/)
    const headerList: EmailHeader[] = []
    let currentHeader = ''

    lines.forEach(line => {
      // 继续上一行（缩进开头）
      if (/^\s+/.test(line) && currentHeader) {
        currentHeader += ' ' + line.trim()
      } else if (line.includes(':')) {
        if (currentHeader) {
          const colonIndex = currentHeader.indexOf(':')
          const name = currentHeader.substring(0, colonIndex).trim()
          const value = currentHeader.substring(colonIndex + 1).trim()
          if (name && value) {
            headerList.push({ name, value })
          }
        }
        currentHeader = line
      }
    })

    // 处理最后一个header
    if (currentHeader) {
      const colonIndex = currentHeader.indexOf(':')
      if (colonIndex > 0) {
        const name = currentHeader.substring(0, colonIndex).trim()
        const value = currentHeader.substring(colonIndex + 1).trim()
        if (name && value) {
          headerList.push({ name, value })
        }
      }
    }


    // 1. 发件人信息
    const from = headerList.find(h => h.name.toLowerCase() === 'from')
    const replyTo = headerList.find(h => h.name.toLowerCase() === 'reply-to')
    const returnPath = headerList.find(h => h.name.toLowerCase() === 'return-path')
    const sender = headerList.find(h => h.name.toLowerCase() === 'sender')

    if (from || replyTo || returnPath || sender) {
      const items: { label: string; value: string }[] = []
      if (from) items.push({ label: 'From', value: from.value })
      if (sender) items.push({ label: 'Sender', value: sender.value })
      if (replyTo) items.push({ label: 'Reply-To', value: replyTo.value })
      if (returnPath) items.push({ label: 'Return-Path', value: returnPath.value })
      results.push({ category: '发件人信息', items })
    }

    // 2. 收件人信息
    const to = headerList.find(h => h.name.toLowerCase() === 'to')
    const cc = headerList.find(h => h.name.toLowerCase() === 'cc')
    const bcc = headerList.find(h => h.name.toLowerCase() === 'bcc')

    if (to || cc || bcc) {
      const items: { label: string; value: string }[] = []
      if (to) items.push({ label: 'To', value: to.value })
      if (cc) items.push({ label: 'Cc', value: cc.value })
      if (bcc) items.push({ label: 'Bcc', value: bcc.value })
      results.push({ category: '收件人信息', items })
    }

    // 3. 邮件主题和时间
    const subject = headerList.find(h => h.name.toLowerCase() === 'subject')
    const date = headerList.find(h => h.name.toLowerCase() === 'date')
    const messageId = headerList.find(h => h.name.toLowerCase() === 'message-id')

    if (subject || date || messageId) {
      const items: { label: string; value: string }[] = []
      if (subject) items.push({ label: 'Subject', value: subject.value })
      if (date) items.push({ label: 'Date', value: date.value })
      if (messageId) items.push({ label: 'Message-ID', value: messageId.value })
      results.push({ category: '邮件信息', items })
    }

    // 4. 认证结果 (SPF/DKIM/DMARC)
    const authenticationResults = headerList.find(h => h.name.toLowerCase() === 'authentication-results')
    const receivedSpf = headerList.find(h => h.name.toLowerCase().includes('spf'))
    const dkimSignature = headerList.find(h => h.name.toLowerCase() === 'dkim-signature')

    if (authenticationResults || receivedSpf || dkimSignature) {
      const items: { label: string; value: string }[] = []
      if (authenticationResults) items.push({ label: 'Auth-Results', value: authenticationResults.value })
      if (receivedSpf) items.push({ label: 'SPF', value: receivedSpf.value })
      if (dkimSignature) items.push({ label: 'DKIM', value: '已签名' })
      results.push({ category: '认证结果', items })
    }

    // 5. 路由信息 (Received headers)
    const receivedHeaders = headerList.filter(h => h.name.toLowerCase() === 'received')
    if (receivedHeaders.length > 0) {
      const items = receivedHeaders.map((h, i) => ({
        label: `Received #${receivedHeaders.length - i}`,
        value: h.value.substring(0, 150) + (h.value.length > 150 ? '...' : '')
      }))
      results.push({ category: '路由信息', items })
    }

    // 6. 内容类型
    const contentType = headerList.find(h => h.name.toLowerCase() === 'content-type')
    const contentTransferEncoding = headerList.find(h => h.name.toLowerCase() === 'content-transfer-encoding')

    if (contentType || contentTransferEncoding) {
      const items: { label: string; value: string }[] = []
      if (contentType) items.push({ label: 'Content-Type', value: contentType.value })
      if (contentTransferEncoding) items.push({ label: 'Encoding', value: contentTransferEncoding.value })
      results.push({ category: '内容信息', items })
    }

    // 7. 反垃圾/安全
    const xSpamStatus = headerList.find(h => h.name.toLowerCase().includes('x-spam'))
    const xGoogleDKIM = headerList.find(h => h.name.toLowerCase().includes('x-google'))

    if (xSpamStatus || xGoogleDKIM) {
      const items: { label: string; value: string }[] = []
      if (xSpamStatus) items.push({ label: 'X-Spam', value: xSpamStatus.value })
      if (xGoogleDKIM) items.push({ label: 'Google', value: xGoogleDKIM.value })
      results.push({ category: '反垃圾/安全', items })
    }

    // 8. 其他重要头
    const organization = headerList.find(h => h.name.toLowerCase() === 'organization')
    const userAgent = headerList.find(h => h.name.toLowerCase() === 'user-agent' || h.name.toLowerCase() === 'x-mailer')
    const xOriginatingIp = headerList.find(h => h.name.toLowerCase() === 'x-originating-ip' || h.name.toLowerCase().includes('received-from'))

    if (organization || userAgent || xOriginatingIp) {
      const items: { label: string; value: string }[] = []
      if (organization) items.push({ label: 'Organization', value: organization.value })
      if (userAgent) items.push({ label: 'Mailer', value: userAgent.value })
      if (xOriginatingIp) items.push({ label: 'Originating IP', value: xOriginatingIp.value })
      results.push({ category: '其他信息', items })
    }

    return results
  }

  const extractEmail = (text: string): string | null => {
    const match = text.match(/<([^>]+)>/)
    return match ? match[1] : (text.includes('@') ? text.trim() : null)
  }

  const analyzeSecurity = (): { level: string; color: string; issues: string[] } => {
    const issues: string[] = []
    const authResults = parsedInfo.find(p => p.category === '认证结果')

    // 检查SPF
    const spfItem = authResults?.items.find(i => i.label === 'SPF')
    if (spfItem) {
      if (spfItem.value.toLowerCase().includes('fail') || spfItem.value.toLowerCase().includes('softfail')) {
        issues.push('SPF验证失败，发件服务器可能存在问题')
      }
    }

    // 检查DKIM
    const dkimItem = authResults?.items.find(i => i.label === 'DKIM')
    if (!dkimItem) {
      issues.push('未发现DKIM签名')
    }

    // 检查From和Return-Path
    const fromInfo = parsedInfo.find(p => p.category === '发件人信息')
    const fromItem = fromInfo?.items.find(i => i.label === 'From')
    const returnPathItem = fromInfo?.items.find(i => i.label === 'Return-Path')

    if (fromItem && returnPathItem) {
      const fromEmail = extractEmail(fromItem.value)
      const returnEmail = extractEmail(returnPathItem.value)
      if (fromEmail && returnEmail && fromEmail !== returnEmail) {
        issues.push(`发件人邮箱(${fromEmail})与回信地址(${returnEmail})不一致`)
      }
    }

    // 检查垃圾邮件状态
    const spamInfo = parsedInfo.find(p => p.category === '反垃圾/安全')
    const spamItem = spamInfo?.items.find(i => i.label === 'X-Spam')
    if (spamItem) {
      if (spamItem.value.toLowerCase().includes('spam') || spamItem.value.toLowerCase().includes('hit')) {
        issues.push('邮件被标记为垃圾邮件')
      }
    }

    if (issues.length === 0) {
      return { level: '低风险', color: 'text-green-600', issues: ['未发现明显安全问题'] }
    } else if (issues.length <= 2) {
      return { level: '中风险', color: 'text-yellow-600', issues }
    } else {
      return { level: '高风险', color: 'text-red-600', issues }
    }
  }

  const handleManualParse = () => {
    if (!manualInput.trim()) return
    setRawHeaders(manualInput)
    const parsed = parseHeaders(manualInput)
    setParsedInfo(parsed)
    setManualInput('')
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setRawHeaders(text)
      const parsed = parseHeaders(text)
      setParsedInfo(parsed)
    } catch (err) {
      setError('读取剪贴板失败，请手动粘贴')
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '发件人信息': return 'bg-blue-50 border-blue-200'
      case '收件人信息': return 'bg-green-50 border-green-200'
      case '认证结果': return 'bg-purple-50 border-purple-200'
      case '路由信息': return 'bg-yellow-50 border-yellow-200'
      case '反垃圾/安全': return 'bg-red-50 border-red-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const security = parsedInfo.length > 0 ? analyzeSecurity() : null

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 text-xl">←</button>
        <h2 className="text-lg font-semibold">邮件头解析</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">{error}</p>
        </div>
      )}

      {/* 输入区域 */}
      <div className="mb-4">
        <div className="flex gap-2 mb-2">
          <textarea
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) handleManualParse()
            }}
            placeholder="粘贴邮件头信息到这里...&#10;(支持 Ctrl+Enter 快速解析)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm h-24 resize-none"
          />
          <div className="flex flex-col gap-2">
            <button
              onClick={handleManualParse}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded"
            >
              解析
            </button>
            <button
              onClick={handlePaste}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded"
            >
              粘贴
            </button>
          </div>
        </div>
        {debugMode && (
          <button
            onClick={runDebugAnalysis}
            className="w-full mb-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm"
          >
            🔧 开始Debug分析
          </button>
        )}
        <div className="text-xs text-gray-500">
          提示：在邮件详情中查看"显示原始邮件"或"显示邮件头"来获取邮件头信息
        </div>
      </div>

      {/* 安全分析结果 */}
      {security && !debugMode && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">安全分析</span>
            <span className={`font-bold ${security.color}`}>{security.level}</span>
          </div>
          {security.issues.map((issue, i) => (
            <div key={i} className="text-sm text-gray-600 flex items-center gap-2">
              <span className={issue.includes('低风险') ? 'text-green-500' : 'text-yellow-500'}>•</span>
              {issue}
            </div>
          ))}
        </div>
      )}

      {/* Debug模式切换 */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setDebugMode(!debugMode)}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${debugMode ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          {debugMode ? '🔧 Debug模式 (开启)' : '🔧 Debug模式'}
        </button>
      </div>

      {/* Debug分析结果 */}
      {debugMode && debugResult && (
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {/* 错误 */}
          {debugResult.issues.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-700 mb-2">❌ 错误问题</h3>
              {debugResult.issues.map((item: any, i: number) => (
                <div key={i} className="text-sm text-red-600">• {item.msg}</div>
              ))}
            </div>
          )}

          {/* 警告 */}
          {debugResult.warnings.length > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-700 mb-2">⚠️ 警告</h3>
              {debugResult.warnings.map((item: any, i: number) => (
                <div key={i} className="text-sm text-yellow-600">• {item.msg}</div>
              ))}
            </div>
          )}

          {/* 信息 */}
          {debugResult.info.length > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-700 mb-2">ℹ️ 信息</h3>
              {debugResult.info.map((item: any, i: number) => (
                <div key={i} className="text-sm text-blue-600">• {item.msg}</div>
              ))}
            </div>
          )}

          {/* 时间分析 */}
          {debugResult.timing && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">⏱️ 时间分析</h3>
              {debugResult.timing.sentTime && (
                <div className="text-sm text-gray-600">发送时间: {new Date(debugResult.timing.sentTime).toLocaleString()}</div>
              )}
              {debugResult.timing.delayMinutes && (
                <div className="text-sm text-gray-600">服务器延迟: {debugResult.timing.delayMinutes} 分钟</div>
              )}
            </div>
          )}

          {/* 路由跳数 */}
          {debugResult.hops && debugResult.hops.length > 0 && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">🔀 邮件路由 (共{debugResult.hops.length}跳)</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {debugResult.hops.map((hop: any, i: number) => (
                  <div key={i} className="text-xs text-gray-600 flex justify-between">
                    <span>#{hop.num} {hop.from} → {hop.by}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 提取的IP */}
          {debugResult.ips && debugResult.ips.length > 0 && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <h3 className="font-semibold text-purple-700 mb-2">🌐 发现的IP地址</h3>
              <div className="flex flex-wrap gap-2">
                {debugResult.ips.map((ip: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-white border rounded text-xs font-mono">{ip}</span>
                ))}
              </div>
            </div>
          )}

          {/* 统计信息 */}
          {debugResult.stats && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-700 mb-2">📊 统计信息</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>总头部数: {debugResult.stats.totalHeaders}</div>
                <div>Received跳数: {debugResult.stats.receivedCount}</div>
                <div>有Reply-To: {debugResult.stats.hasReplyTo ? '✓' : '✗'}</div>
                <div>有Return-Path: {debugResult.stats.hasReturnPath ? '✓' : '✗'}</div>
                <div>Content-Type: {debugResult.stats.contentType}</div>
              </div>
            </div>
          )}

          {/* 导出功能 */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">💾 导出</h3>
            <button
              onClick={() => {
                const exportData = JSON.stringify(debugResult, null, 2)
                navigator.clipboard.writeText(exportData)
                alert('Debug信息已复制到剪贴板')
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded text-sm"
            >
              复制Debug数据
            </button>
          </div>
        </div>
      )}

      {debugMode && !debugResult && rawHeaders && (
        <div className="p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-500">点击下方按钮开始Debug分析</p>
        </div>
      )}

      {/* 解析结果 */}
      <div className="space-y-3 max-h-[350px] overflow-y-auto">
        {parsedInfo.map((category, idx) => (
          <div key={idx} className={`p-3 rounded-lg border ${getCategoryColor(category.category)}`}>
            <h3 className="font-semibold text-sm mb-2">{category.category}</h3>
            <div className="space-y-2">
              {category.items.map((item, i) => (
                <div key={i} className="text-xs">
                  <span className="text-gray-500">{item.label}: </span>
                  <span className="text-gray-800 break-all">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 原始头信息 */}
      {rawHeaders && (
        <details className="mt-4">
          <summary className="text-sm text-gray-500 cursor-pointer">查看原始邮件头</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto whitespace-pre-wrap break-all">
            {rawHeaders}
          </pre>
        </details>
      )}

      {parsedInfo.length === 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">使用说明</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• 解析邮件头信息，分析发件人真实性</li>
            <li>• 检查SPF/DKIM/DMARC认证结果</li>
            <li>• 查看邮件路由路径</li>
            <li>• 识别伪造邮件和钓鱼邮件</li>
            <li>• 自动进行安全风险评估</li>
            <li>• 支持手动粘贴或从剪贴板导入</li>
          </ul>
        </div>
      )}
    </div>
  )
}
