import { useState, useEffect } from 'react'

// 检查是否为内部页面
const isInternalPage = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    // 内部页面协议
    const internalProtocols = ['about:', 'chrome:', 'chrome-extension:', 'moz-extension:', 'edge:', 'file:', 'devtools:']
    if (internalProtocols.some(p => urlObj.protocol === p)) {
      return true
    }
    // 空页面
    if (urlObj.href === 'about:blank' || url === '') {
      return true
    }
  } catch (e) {
    return true
  }
  return false
}

// 提取根域名
const getRootDomain = (domain: string): string => {
  const parts = domain.split('.')
  if (parts.length <= 2) {
    return domain
  }
  // 常见二级域名后缀
  const commonSecondLevelDomains = ['com.cn', 'com.tw', 'com.hk', 'co.jp', 'co.kr', 'com.au', 'co.nz', 'com.sg', 'com.mx', 'com.br', 'co.in', 'co.uk', 'org.cn', 'net.cn', 'gov.cn', 'edu.cn']
  const lastTwo = parts.slice(-2).join('.')
  if (commonSecondLevelDomains.includes(lastTwo)) {
    return parts.slice(-3).join('.')
  }
  return parts.slice(-2).join('.')
}

// 判断是否为国内域名
const isChinaDomain = (domain: string): boolean => {
  const chinaTLDs = ['.cn', '.com.cn', '.net.cn', '.org.cn', '.gov.cn', '.edu.cn', '.com.hk', '.com.tw', '.cn', '.中国']
  const chinaDomains = ['baidu.com', 'qq.com', 'taobao.com', 'jd.com', 'alipay.com', 'tmall.com', 'weibo.com', 'sina.com.cn', '163.com', 'sohu.com', 'ifeng.com', 'zhihu.com', 'bilibili.com', 'douban.com', 'csdn.net', 'gitee.com', 'aliyun.com', 'tencent.com', 'huawei.com', 'zoho.com.cn', 'deepseek.com', 'x.com', 'douyin.com', 'toutiao.com', 'mi.com', 'huawei.com', 'oppo.com', 'vivo.com', 'xiaomi.com']
  const lowerDomain = domain.toLowerCase()
  return chinaTLDs.some(tld => lowerDomain.endsWith(tld)) || chinaDomains.includes(lowerDomain)
}

// 常见网站排名数据（备用）
const FALLBACK_RANKS: Record<string, { rank: number, country: string }> = {
  // 国际网站
  'google.com': { rank: 1, country: 'US' },
  'facebook.com': { rank: 2, country: 'US' },
  'youtube.com': { rank: 3, country: 'US' },
  'twitter.com': { rank: 4, country: 'US' },
  'instagram.com': { rank: 5, country: 'US' },
  'linkedin.com': { rank: 6, country: 'US' },
  'wikipedia.org': { rank: 7, country: 'US' },
  'amazon.com': { rank: 8, country: 'US' },
  'reddit.com': { rank: 9, country: 'US' },
  'openai.com': { rank: 10, country: 'US' },
  'deepseek.com': { rank: 180, country: 'CN' },
  'microsoft.com': { rank: 12, country: 'US' },
  'apple.com': { rank: 13, country: 'US' },
  'netflix.com': { rank: 15, country: 'US' },
  'bing.com': { rank: 20, country: 'US' },
  'yahoo.com': { rank: 11, country: 'US' },
  'baidu.com': { rank: 6, country: 'CN' },
  'taobao.com': { rank: 8, country: 'CN' },
  'qq.com': { rank: 9, country: 'CN' },
  'alipay.com': { rank: 12, country: 'CN' },
  'jd.com': { rank: 16, country: 'CN' },
  'tmall.com': { rank: 14, country: 'CN' },
  'weibo.com': { rank: 25, country: 'CN' },
  'zhihu.com': { rank: 35, country: 'CN' },
  'bilibili.com': { rank: 42, country: 'CN' },
  'csdn.net': { rank: 28, country: 'CN' },
  'aliyun.com': { rank: 45, country: 'CN' },
  'toutiao.com': { rank: 52, country: 'CN' },
  'douyin.com': { rank: 55, country: 'CN' },
  'x.com': { rank: 4, country: 'US' }
}

// 获取网站排名 - 国内用站长之家/爱站网，国际用 OpenPageRank
const getWebsiteRank = async (domain: string): Promise<{ rank?: number, rankChange?: number, country?: string, baiduWeight?: number } | null> => {
  const domainLower = domain.toLowerCase()
  const isChina = isChinaDomain(domainLower)

  // 首先检查是否有备用数据
  if (FALLBACK_RANKS[domainLower]) {
    return FALLBACK_RANKS[domainLower]
  }

  // 国内网站 - 使用站长之家/爱站网
  if (isChina) {
    // 尝试站长之家
    try {
      const response = await fetch(`https://seo.chinaz.com/${encodeURIComponent(domain)}`)
      if (response.ok) {
        const html = await response.text()
        // 提取百度权重
        const baiduMatch = html.match(/<a[^>]*class="baidu"[^>]*>(\d+)/i) || html.match(/baidu[^>]*>(\d+)/i)
        // 提取Alexa排名
        const alexaMatch = html.match(/Alexa[^>]*>(\d+[\d,]*)/i)
        if (baiduMatch || alexaMatch) {
          return {
            rank: alexaMatch ? parseInt(alexaMatch[1].replace(/,/g, '')) : undefined,
            baiduWeight: baiduMatch ? parseInt(baiduMatch[1]) : undefined,
            country: 'CN'
          }
        }
      }
    } catch (e) {
      console.log('Chinaz SEO error:', e)
    }

    // 备用爱站网
    try {
      const response = await fetch(`https://www.aizhan.com/cha/${encodeURIComponent(domain)}/`)
      if (response.ok) {
        const html = await response.text()
        const baiduMatch = html.match(/br"[^>]*>(\d+)/i)
        if (baiduMatch) {
          return {
            baiduWeight: parseInt(baiduMatch[1]),
            country: 'CN'
          }
        }
      }
    } catch (e) {
      console.log('Aizhan error:', e)
    }

    return { country: 'CN' }
  }

  // 国际网站 - 使用 OpenPageRank
  try {
    const response = await fetch(`https://openpagerank.com/api/v1.0/getPageRank?domains[]=${encodeURIComponent(domain)}`, {
      headers: { 'API-Key': '0g0w0w84wo0c0g4kskoco0k4k0swssw4k8gs4kc' }
    })
    if (response.ok) {
      const data = await response.json()
      if (data.response?.[0]?.page_rank?.ranking) {
        return {
          rank: data.response[0].page_rank.ranking,
          country: data.response[0].page_rank.country_code || 'US'
        }
      }
    }
  } catch (e) {
    console.log('OpenPageRank error:', e)
  }

  return null
}

interface WhoisInfo {
  domain: string
  registrar?: string
  registrarUrl?: string
  registrationDate?: string
  expirationDate?: string
  updatedDate?: string
  nameServers?: string[]
  status?: string[]
  registrant?: {
    organization?: string
    country?: string
    state?: string
    city?: string
  }
  adminContact?: {
    name?: string
    email?: string
    phone?: string
  }
  techContact?: {
    name?: string
    email?: string
    phone?: string
  }
  billingContact?: {
    name?: string
    email?: string
    phone?: string
  }
}

interface WhoisLookupProps {
  onBack: () => void
}

export default function WhoisLookup({ onBack }: WhoisLookupProps) {
  const [whoisInfo, setWhoisInfo] = useState<WhoisInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [manualInput, setManualInput] = useState('')
  const [showRaw, setShowRaw] = useState(false)
  const [rawWhois, setRawWhois] = useState('')
  const [websiteRank, setWebsiteRank] = useState<{ rank?: number, rankChange?: number, country?: string, baiduWeight?: number } | null>(null)

  // 使用 Whois API 查询 - 使用 RDAP 和 WHO.IS（国际标准）
  const lookupWhois = async (domain: string): Promise<WhoisInfo | null> => {
    // 首先尝试 RDAP（国际标准，最可靠）
    try {
      const rdapResponse = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`)
      if (rdapResponse.ok) {
        const data = await rdapResponse.json()
        return parseRdapResponse(data)
      }
    } catch (e) {
      console.log('RDAP error:', e)
    }

    // 备用：使用 WHO.IS
    try {
      const response = await fetch(`https://who.is/whois/${encodeURIComponent(domain)}`)
      if (response.ok) {
        const html = await response.text()
        return parseWhoisHtml(html, domain)
      }
    } catch (e) {
      console.log('WHO.IS error:', e)
    }

    return null
  }

  // 解析 RDAP 响应
  const parseRdapResponse = (data: any): WhoisInfo => {
    const parseDate = (dateStr?: string): string | undefined => {
      if (!dateStr) return undefined
      try {
        return new Date(dateStr).toISOString().split('T')[0]
      } catch {
        return dateStr
      }
    }

    const getNameServer = (ns: any[]): string[] => {
      return ns?.map((n: any) => n.ldhName || n) || []
    }

    const getStatus = (status: any[]): string[] => {
      return status?.map((s: string) => s.replace('http://icann.org/epp#', '')) || []
    }

    const getContact = (entity: any): { organization?: string, country?: string, state?: string, city?: string } => {
      if (!entity) return {}
      const vcard = entity.vcardArray?.[1] || []
      const result: any = {}
      vcard.forEach((field: any) => {
        if (field[0] === 'org') result.organization = field[3]?.[0]
        if (field[0] === 'adr') {
          const parts = field[3] || []
          result.state = parts[1]
          result.city = parts[2]
        }
        if (field[0] === 'country') result.country = field[3]?.[0]
      })
      return result
    }

    return {
      domain: data.name || '',
      registrationDate: parseDate(data.events?.find((e: any) => e.eventAction === 'registration')?.eventDate),
      expirationDate: parseDate(data.events?.find((e: any) => e.eventAction === 'expiration')?.eventDate),
      updatedDate: parseDate(data.events?.find((e: any) => e.eventAction === 'last changed')?.eventDate),
      nameServers: getNameServer(data.nameservers),
      status: getStatus(data.status),
      registrant: getContact(data.entities?.find((e: any) => e.roles?.includes('registrant'))),
      registrar: data.secureDNS?.delegationSigned ? 'DNSSEC Enabled' : undefined
    }
  }

  // 解析 HTML Whois 页面
  const parseWhoisHtml = (html: string, domain: string): WhoisInfo => {
    const extractValue = (pattern: RegExp): string => {
      const match = html.match(pattern)
      return match ? match[1].trim() : ''
    }

    const extractArray = (pattern: RegExp): string[] => {
      const matches = html.match(new RegExp(pattern, 'g'))
      return matches ? matches.map(m => m.replace(pattern, '$1').trim()) : []
    }

    return {
      domain,
      registrar: extractValue(/Registrar:\s*<[^>]*>([^<]+)/i) || extractValue(/Registrar\s*:\s*([^<\n]+)/i),
      registrationDate: extractValue(/Creation Date:\s*([^<\n]+)/i) || extractValue(/Created\s*:\s*([^<\n]+)/i),
      expirationDate: extractValue(/Expiration Date:\s*([^<\n]+)/i) || extractValue(/Expires\s*:\s*([^<\n]+)/i),
      updatedDate: extractValue(/Updated Date:\s*([^<\n]+)/i),
      nameServers: extractArray(/Name Server:\s*([^<\s]+)/gi),
      status: extractArray(/Domain Status:\s*([^<\s]+)/gi),
      registrant: {
        organization: extractValue(/Registrant\s*Organization:\s*([^\n<]+)/i),
        country: extractValue(/Registrant\s*Country:\s*([^\n<]+)/i),
        state: extractValue(/Registrant\s*State.*?:\s*([^\n<]+)/i),
        city: extractValue(/Registrant\s*City:\s*([^\n<]+)/i)
      }
    }
  }

  // 获取原始Whois文本
  const getRawWhois = async (domain: string): Promise<string> => {
    try {
      const response = await fetch(`https://whoiz.herokuapp.com/lookup/full/${encodeURIComponent(domain)}`)
      if (response.ok) {
        return await response.text()
      }
    } catch (e) {
      console.error('Raw whois error:', e)
    }
    // 如果无法获取，返回格式化后的JSON
    if (whoisInfo) {
      return JSON.stringify(whoisInfo, null, 2)
    }
    return '无法获取Whois信息'
  }

  const performLookup = async (domain: string) => {
    setLoading(true)
    setError('')
    setWhoisInfo(null)
    setRawWhois('')
    setWebsiteRank(null)

    try {
      // 清理域名
      let cleanDomain = domain.trim().toLowerCase()
      if (cleanDomain.startsWith('http://')) cleanDomain = cleanDomain.substring(7)
      if (cleanDomain.startsWith('https://')) cleanDomain = cleanDomain.substring(8)
      if (cleanDomain.startsWith('www.')) cleanDomain = cleanDomain.substring(4)
      if (cleanDomain.includes('/')) cleanDomain = cleanDomain.split('/')[0]
      if (cleanDomain.includes(':')) cleanDomain = cleanDomain.split(':')[0]

      // 提取根域名进行查询
      const rootDomain = getRootDomain(cleanDomain)
      setManualInput(rootDomain)

      const [info, rank] = await Promise.all([
        lookupWhois(rootDomain),
        getWebsiteRank(rootDomain)
      ])

      if (info) {
        setWhoisInfo(info)
        setWebsiteRank(rank)
        if (info.registrationDate === undefined && !info.registrar) {
          setError('未找到Whois信息')
        }
      } else {
        setError('未找到Whois信息')
      }
    } catch (err) {
      setError('查询失败: ' + (err instanceof Error ? err.message : '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  const handleLookup = () => {
    if (!manualInput.trim()) return
    performLookup(manualInput)
  }

  // 刷新当前页面域名
  const handleRefreshCurrentPage = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tab?.url && !isInternalPage(tab.url)) {
        const urlObj = new URL(tab.url)
        const rootDomain = getRootDomain(urlObj.hostname)
        setManualInput(rootDomain)
        performLookup(rootDomain)
      } else if (tab?.url && isInternalPage(tab.url)) {
        setError('当前为内部页面，无法获取域名信息')
      }
    } catch (err) {
      console.error('Refresh error:', err)
    }
  }

  const handleShowRaw = async () => {
    if (!whoisInfo) return
    const raw = await getRawWhois(whoisInfo.domain)
    setRawWhois(raw)
    setShowRaw(!showRaw)
  }

  // 格式化日期
  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '-'
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return dateStr
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  // 计算域名到期天数
  const getDaysUntilExpiry = (): string => {
    if (!whoisInfo?.expirationDate) return '-'
    try {
      const expiry = new Date(whoisInfo.expirationDate)
      const now = new Date()
      const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      if (diff < 0) return '已过期'
      if (diff === 0) return '今天到期'
      return `${diff} 天后到期`
    } catch {
      return '-'
    }
  }

  useEffect(() => {
    // 自动获取当前页面域名并查询
    const autoLookup = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        if (tab?.url) {
          // 检查是否为内部页面
          if (isInternalPage(tab.url)) {
            setError('当前为内部页面，无法获取域名信息')
            return
          }
          const urlObj = new URL(tab.url)
          const rootDomain = getRootDomain(urlObj.hostname)
          setManualInput(rootDomain)
          performLookup(rootDomain)
        }
      } catch (err) {
        console.error('Auto lookup error:', err)
      }
    }
    autoLookup()
  }, [])

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 text-xl">←</button>
        <h2 className="text-lg font-semibold flex-1">Whois 查询</h2>
        <button
          onClick={handleRefreshCurrentPage}
          disabled={loading}
          className="px-3 py-1.5 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-sm rounded flex items-center gap-1"
          title="刷新当前页面域名"
        >
          {loading ? '...' : '🔄 刷新'}
        </button>
      </div>

      {/* 输入区域 */}
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLookup()}
            placeholder="输入域名 (如 example.com)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
          />
          <button
            onClick={handleLookup}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-sm rounded"
          >
            {loading ? '查询中...' : '查询'}
          </button>
          {manualInput && (
            <button
              onClick={handleLookup}
              disabled={loading}
              className="px-3 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-sm rounded"
              title="刷新最新数据"
            >
              {loading ? '...' : '🔄'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">{error}</p>
        </div>
      )}

      {/* Whois 信息展示 */}
      {whoisInfo && (
        <>
          {/* 域名基本信息 */}
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-xl text-gray-800">{whoisInfo.domain}</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                {getDaysUntilExpiry()}
              </span>
            </div>

            {/* 网站排名 */}
            {(websiteRank?.rank || websiteRank?.baiduWeight) && (
              <div className="mb-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-yellow-600">🏆</span>
                  {websiteRank.baiduWeight !== undefined && (
                    <>
                      <span className="text-sm text-gray-600">百度权重:</span>
                      <span className="font-bold text-lg text-orange-600">{websiteRank.baiduWeight}</span>
                    </>
                  )}
                  {websiteRank.rank && (
                    <>
                      <span className="text-sm text-gray-600 ml-2">Alexa:</span>
                      <span className="font-bold text-lg text-yellow-700">#{websiteRank.rank.toLocaleString()}</span>
                    </>
                  )}
                  {websiteRank.country && (
                    <span className={`px-2 py-0.5 text-xs rounded ${websiteRank.country === 'CN' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                      {websiteRank.country === 'CN' ? '国内' : websiteRank.country}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-2 bg-white rounded">
                <div className="text-gray-500 text-xs">注册商</div>
                <div className="font-medium">{whoisInfo.registrar || '-'}</div>
              </div>
              <div className="p-2 bg-white rounded">
                <div className="text-gray-500 text-xs">注册日期</div>
                <div className="font-medium">{formatDate(whoisInfo.registrationDate)}</div>
              </div>
              <div className="p-2 bg-white rounded">
                <div className="text-gray-500 text-xs">到期日期</div>
                <div className="font-medium">{formatDate(whoisInfo.expirationDate)}</div>
              </div>
              <div className="p-2 bg-white rounded">
                <div className="text-gray-500 text-xs">更新日期</div>
                <div className="font-medium">{formatDate(whoisInfo.updatedDate)}</div>
              </div>
            </div>
          </div>

          {/* DNS服务器 */}
          {whoisInfo.nameServers && whoisInfo.nameServers.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
              <h3 className="font-medium text-gray-700 mb-2">DNS 服务器</h3>
              <div className="flex flex-wrap gap-2">
                {whoisInfo.nameServers.map((ns, i) => (
                  <span key={i} className="px-3 py-1.5 bg-white border rounded text-sm font-mono">
                    {ns}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 域名状态 */}
          {whoisInfo.status && whoisInfo.status.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
              <h3 className="font-medium text-gray-700 mb-2">域名状态</h3>
              <div className="flex flex-wrap gap-2">
                {whoisInfo.status.map((status, i) => (
                  <span key={i} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                    {status}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 注册人信息 */}
          {(whoisInfo.registrant?.organization || whoisInfo.registrant?.country) && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
              <h3 className="font-medium text-gray-700 mb-2">注册人信息</h3>
              <div className="space-y-1 text-sm">
                {whoisInfo.registrant?.organization && (
                  <div><span className="text-gray-500">组织:</span> {whoisInfo.registrant.organization}</div>
                )}
                {whoisInfo.registrant?.country && (
                  <div><span className="text-gray-500">国家:</span> {whoisInfo.registrant.country}</div>
                )}
                {whoisInfo.registrant?.state && (
                  <div><span className="text-gray-500">省份:</span> {whoisInfo.registrant.state}</div>
                )}
                {whoisInfo.registrant?.city && (
                  <div><span className="text-gray-500">城市:</span> {whoisInfo.registrant.city}</div>
                )}
              </div>
            </div>
          )}

          {/* 联系人信息 */}
          {(whoisInfo.adminContact?.email || whoisInfo.techContact?.email) && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
              <h3 className="font-medium text-gray-700 mb-2">联系人信息</h3>
              {whoisInfo.adminContact?.email && (
                <div className="mb-2 pb-2 border-b">
                  <div className="text-xs text-gray-500">管理员</div>
                  <div className="text-sm">{whoisInfo.adminContact.name || '-'}</div>
                  <div className="text-sm text-blue-600">{whoisInfo.adminContact.email}</div>
                </div>
              )}
              {whoisInfo.techContact?.email && (
                <div className="mb-2 pb-2 border-b">
                  <div className="text-xs text-gray-500">技术联系人</div>
                  <div className="text-sm">{whoisInfo.techContact.name || '-'}</div>
                  <div className="text-sm text-blue-600">{whoisInfo.techContact.email}</div>
                </div>
              )}
              {whoisInfo.billingContact?.email && (
                <div>
                  <div className="text-xs text-gray-500">账单联系人</div>
                  <div className="text-sm">{whoisInfo.billingContact.name || '-'}</div>
                  <div className="text-sm text-blue-600">{whoisInfo.billingContact.email}</div>
                </div>
              )}
            </div>
          )}

          {/* 原始数据按钮 */}
          <button
            onClick={handleShowRaw}
            className="w-full p-2 border border-gray-300 hover:bg-gray-50 rounded text-sm text-gray-600"
          >
            {showRaw ? '隐藏原始数据' : '显示原始数据'}
          </button>

          {/* 原始数据 */}
          {showRaw && rawWhois && (
            <div className="mt-3 p-3 bg-gray-900 rounded-lg overflow-auto max-h-[300px]">
              <pre className="text-green-400 text-xs font-mono whitespace-pre-wrap">{rawWhois}</pre>
            </div>
          )}
        </>
      )}

      {/* 说明 */}
      {(!whoisInfo || error) && !loading && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">使用说明</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• 查询域名的 Whois 注册信息</li>
            <li>• 显示注册商、注册日期、到期日期</li>
            <li>• 显示 DNS 服务器和域名状态</li>
            <li>• 显示注册人和联系人信息（如果有）</li>
            <li>• 自动获取当前页面域名</li>
            <li>• 支持手动输入任意域名</li>
          </ul>
        </div>
      )}
    </div>
  )
}
