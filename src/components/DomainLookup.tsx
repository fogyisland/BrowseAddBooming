import { useState, useEffect } from 'react'

interface DNSRecord {
  type: string
  name: string
  value: string
  ttl?: number
}

interface DomainInfo {
  domain: string
  records: DNSRecord[]
  registrar?: string
  registrationDate?: string
  expirationDate?: string
  nameServers?: string[]
}

interface DomainLookupProps {
  onBack: () => void
}

export default function DomainLookup({ onBack }: DomainLookupProps) {
  const [domainInfo, setDomainInfo] = useState<DomainInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [manualInput, setManualInput] = useState('')
  const [lookupType, setLookupType] = useState<'all' | 'a' | 'aaaa' | 'cname' | 'mx' | 'txt' | 'ns' | 'soa' | 'ptr' | 'dns'>('all')
  const [dnsProvider, setDnsProvider] = useState<'auto' | 'aliyun' | 'dnspod' | 'google'>('auto')
  const [reverseDomains, setReverseDomains] = useState<string[]>([])

  // DNS服务商列表
  const dnsProviders = [
    { value: 'auto', label: '自动选择', icon: '🔄' },
    { value: 'aliyun', label: '阿里云', icon: '☁️' },
    { value: 'dnspod', label: '腾讯 DNSPod', icon: '🐧' },
    { value: 'google', label: 'Google', icon: '🌐' }
  ]

  // 提取根域名（去掉子域名）
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

  // 去掉域名中的根域名部分（用于TXT/NS记录的简化显示）
  const stripRootDomain = (value: string, domain: string): string => {
    const rootDomain = getRootDomain(domain)
    // 去掉根域名（带点号和不带点号的）
    let result = value
      .replace(new RegExp(`\\.${rootDomain}\\.?$`, 'i'), '')
      .replace(new RegExp(`^${rootDomain}\\.?`, 'i'), '')
    return result
  }

  // DNS API 配置
  const getDnsApiUrl = (provider: string, domain: string, type: string) => {
    const baseUrls: Record<string, { url: string, useNumberType: boolean }> = {
      aliyun: {
        url: `https://dns.aliyun.com/dns-query?name=${encodeURIComponent(domain)}`,
        useNumberType: true
      },
      dnspod: {
        url: `https://doh.dnspod.cn/resolve?domain=${encodeURIComponent(domain)}`,
        useNumberType: false
      },
      google: {
        url: `https://dns.google.com/resolve?name=${encodeURIComponent(domain)}`,
        useNumberType: true
      }
    }

    const config = baseUrls[provider] || baseUrls.aliyun
    let url = config.url

    if (type !== 'all') {
      if (config.useNumberType) {
        const typeMap: Record<string, number> = {
          a: 1, aaaa: 28, cname: 5, mx: 15, txt: 16, ns: 2, soa: 6
        }
        url += `&type=${typeMap[type] || type}`
      } else {
        const typeMap: Record<string, string> = {
          a: 'A', aaaa: 'AAAA', cname: 'CNAME', mx: 'MX', txt: 'TXT', ns: 'NS', soa: 'SOA'
        }
        url += `&type=${typeMap[type] || type}`
      }
    }

    return url
  }

  // 解析DNS响应
  const parseDnsResponse = (data: any, domain: string): DNSRecord[] => {
    const records: DNSRecord[] = []
    const answerData = data.Answer || []

    console.log('DNS Response:', JSON.stringify(answerData))

    answerData.forEach((answer: any) => {
      let value = answer.data
      const recordType = answer.type

      console.log('Record type:', recordType, typeof recordType)

      if (recordType === 'A' || recordType === 1) {
        records.push({ type: 'A', name: domain, value, ttl: answer.TTL })
      } else if (recordType === 'AAAA' || recordType === 28) {
        records.push({ type: 'AAAA', name: domain, value, ttl: answer.TTL })
      } else if (recordType === 'CNAME' || recordType === 5) {
        records.push({ type: 'CNAME', name: domain, value: value.replace(/\.$/, ''), ttl: answer.TTL })
      } else if (recordType === 'MX' || recordType === 15 || recordType === '15') {
        const parts = value.split(' ')
        const priority = parts[0]
        const mailServer = parts[1]?.replace(/\.$/, '') || ''
        const simplifiedMailServer = stripRootDomain(mailServer, domain)
        records.push({ type: 'MX', name: domain, value: `${priority} ${simplifiedMailServer}`, ttl: answer.TTL })
      } else if (recordType === 'TXT' || recordType === 16 || recordType === '16') {
        const cleanValue = value.replace(/^"|"$/g, '')
        const simplifiedValue = stripRootDomain(cleanValue, domain)
        records.push({ type: 'TXT', name: domain, value: simplifiedValue, ttl: answer.TTL })
      } else if (recordType === 'NS' || recordType === 2) {
        const simplifiedValue = stripRootDomain(value.replace(/\.$/, ''), domain)
        records.push({ type: 'NS', name: domain, value: simplifiedValue, ttl: answer.TTL })
      } else if (recordType === 'SOA' || recordType === 6) {
        records.push({ type: 'SOA', name: domain, value, ttl: answer.TTL })
      }
    })

    return records
  }

  // 使用第三方DNS API查询
  const lookupDNS = async (domain: string, type: string = 'all'): Promise<DNSRecord[]> => {
    const records: DNSRecord[] = []

    // 根据选择使用对应的DNS服务商
    const providers = dnsProvider === 'auto'
      ? ['aliyun', 'dnspod', 'google']
      : [dnsProvider]

    for (const provider of providers) {
      try {
        const url = getDnsApiUrl(provider, domain, type)
        const response = await fetch(url)

        if (!response.ok) continue

        const data = await response.json()
        const parsedRecords = parseDnsResponse(data, domain)

        if (parsedRecords.length > 0) {
          return parsedRecords
        }
      } catch (err) {
        console.log(`DNS lookup failed for ${provider}:`, err)
        continue
      }
    }

    return records
  }

  // 反向DNS查询 - IP反查域名
  const reverseDnsLookup = async (ip: string): Promise<string[]> => {
    const domains: string[] = []

    // 验证IP格式
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/
    const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/

    if (!ipv4Pattern.test(ip) && !ipv6Pattern.test(ip)) {
      return domains
    }

    // 将IP转换为反向查询格式
    let reverseName: string
    if (ipv4Pattern.test(ip)) {
      // IPv4: 1.2.3.4 -> 4.3.2.1.in-addr.arpa
      reverseName = ip.split('.').reverse().join('.') + '.in-addr.arpa'
    } else {
      // IPv6: 简化处理
      const cleanIp = ip.replace(/:/g, '').split('').reverse().join('.')
      reverseName = cleanIp + '.ip6.arpa'
    }

    // 使用多个DNS API查询
    const apis = [
      `https://dns.google.com/resolve?name=${encodeURIComponent(reverseName)}&type=PTR`,
      `https://dns.aliyun.com/dns-query?name=${encodeURIComponent(reverseName)}&type=12`,
      `https://doh.dnspod.cn/resolve?domain=${encodeURIComponent(reverseName)}&type=PTR`
    ]

    for (const apiUrl of apis) {
      try {
        const response = await fetch(apiUrl)
        if (response.ok) {
          const data = await response.json()
          const answers = data.Answer || []
          if (answers.length > 0) {
            answers.forEach((answer: any) => {
              if (answer.type === 12 || answer.type === 'PTR') { // PTR记录类型编号是12
                const domain = answer.data.replace(/\.$/, '')
                if (!domains.includes(domain)) {
                  domains.push(domain)
                }
              }
            })
            if (domains.length > 0) break
          }
        }
      } catch (e) {
        console.log('Reverse DNS API error:', e)
        continue
      }
    }

    return domains
  }

  // 使用Whois API查询域名信息
  const lookupWhois = async (domain: string): Promise<{ registrar?: string, registrationDate?: string, expirationDate?: string, nameServers?: string[] }> => {
    try {
      const response = await fetch(`https://whois.freeaiapi.com/api/v1/whois?domain=${encodeURIComponent(domain)}`, {
        headers: { 'Accept': 'application/json' }
      })

      if (response.ok) {
        const data = await response.json()
        return {
          registrar: data.registrar,
          registrationDate: data.creation_date,
          expirationDate: data.expiration_date,
          nameServers: data.name_servers
        }
      }
    } catch (err) {
      console.error('Whois lookup error:', err)
    }
    return {}
  }

  const performLookup = async (domain: string) => {
    setLoading(true)
    setError('')
    setDomainInfo(null)
    setReverseDomains([])

    try {
      // 清理输入
      let cleanInput = domain.trim().toLowerCase()

      // 如果是 PTR 反向查询
      if (lookupType === 'ptr') {
        // 提取 IP 地址
        const ipv4Match = cleanInput.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/)

        let ip = ipv4Match ? ipv4Match[1] : null

        // 如果输入的不是IP，先查询A记录获取IP
        if (!ip && cleanInput && !cleanInput.includes('.')) {
          // 尝试直接作为域名查询A记录
          try {
            const dnsRecords = await lookupDNS(cleanInput, 'a')
            const aRecord = dnsRecords.find(r => r.type === 'A')
            if (aRecord) {
              ip = aRecord.value
            }
          } catch (e) {
            console.log('A record lookup error:', e)
          }
        }

        if (ip) {
          console.log('Doing reverse lookup for IP:', ip)
          const domains = await reverseDnsLookup(ip)
          console.log('Reverse domains:', domains)
          setReverseDomains(domains)
          setManualInput(ip)
          if (domains.length === 0) {
            setError('未找到反向解析记录')
          }
        } else {
          setError('请输入有效的IP地址')
        }
        setLoading(false)
        return
      }

      // 普通域名查询
      if (cleanInput.startsWith('http://')) cleanInput = cleanInput.substring(7)
      if (cleanInput.startsWith('https://')) cleanInput = cleanInput.substring(8)
      if (cleanInput.startsWith('www.')) cleanInput = cleanInput.substring(4)
      if (cleanInput.includes('/')) cleanInput = cleanInput.split('/')[0]
      if (cleanInput.includes(':')) cleanInput = cleanInput.split(':')[0]

      // MX、TXT、NS 记录需要使用根域名查询（只有明确选择这些类型时才用根域名）
      const rootDomain = getRootDomain(cleanInput)
      const isMxTxtNs = lookupType === 'mx' || lookupType === 'txt' || lookupType === 'ns'
      const queryDomain = isMxTxtNs ? rootDomain : cleanInput

      // 只有查询 MX/TXT/NS 时才更新为根域名
      if (isMxTxtNs) {
        setManualInput(queryDomain)
      }

      // 查询DNS记录
      const records = await lookupDNS(queryDomain, lookupType === 'all' ? 'all' : lookupType)

      // 查询Whois信息
      const whoisInfo = await lookupWhois(cleanInput)

      setDomainInfo({
        domain: queryDomain,
        records,
        ...whoisInfo
      })

      if (records.length === 0) {
        setError('未找到DNS记录')
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

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case 'A': return 'bg-blue-100 text-blue-800'
      case 'AAAA': return 'bg-blue-100 text-blue-800'
      case 'CNAME': return 'bg-purple-100 text-purple-800'
      case 'MX': return 'bg-green-100 text-green-800'
      case 'TXT': return 'bg-yellow-100 text-yellow-800'
      case 'NS': return 'bg-orange-100 text-orange-800'
      case 'SOA': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case 'A': return '🌐'
      case 'AAAA': return '🌐'
      case 'CNAME': return '🔗'
      case 'MX': return '📧'
      case 'TXT': return '📝'
      case 'NS': return '🖥️'
      case 'SOA': return '📋'
      default: return '📌'
    }
  }

  // 按类型分组记录
  const groupedRecords = domainInfo?.records.reduce((acc, record) => {
    if (!acc[record.type]) acc[record.type] = []
    acc[record.type].push(record)
    return acc
  }, {} as Record<string, DNSRecord[]>)

  useEffect(() => {
    // 自动获取当前页面域名并查询
    const autoLookup = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        if (tab?.url) {
          const url = new URL(tab.url)
          setManualInput(url.hostname)
          performLookup(url.hostname)
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
        <h2 className="text-lg font-semibold">域名查询</h2>
      </div>

      {/* 输入区域 */}
      <div className="mb-4">
        <div className="flex gap-2 mb-2">
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
        </div>

        {/* DNS服务商选择 */}
        <div className="flex items-center gap-2 mt-2 mb-2">
          <span className="text-xs text-gray-500">DNS:</span>
          <div className="flex gap-1">
            {dnsProviders.map(provider => (
              <button
                key={provider.value}
                onClick={() => {
                  setDnsProvider(provider.value as any)
                  if (manualInput) {
                    setTimeout(() => performLookup(manualInput), 0)
                  }
                }}
                className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${dnsProvider === provider.value ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <span>{provider.icon}</span>
                <span>{provider.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 查询类型选择 */}
        <div className="flex flex-wrap gap-1">
          {[
            { value: 'all', label: '全部' },
            { value: 'a', label: 'A' },
            { value: 'aaaa', label: 'AAAA' },
            { value: 'cname', label: 'CNAME' },
            { value: 'mx', label: 'MX' },
            { value: 'txt', label: 'TXT' },
            { value: 'ns', label: 'NS' },
            { value: 'ptr', label: '🔄 反查' }
          ].map(type => (
            <button
              key={type.value}
              onClick={() => {
                setLookupType(type.value as any)
                if (manualInput) {
                  setTimeout(() => performLookup(manualInput), 0)
                }
              }}
              className={`px-2 py-1 text-xs rounded ${lookupType === type.value ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">{error}</p>
        </div>
      )}

      {/* 域名基本信息 */}
      {domainInfo && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-lg">{domainInfo.domain}</span>
            <span className="text-sm text-gray-500">{domainInfo.records.length} 条记录</span>
          </div>

          {/* Whois信息 */}
          {(domainInfo.registrar || domainInfo.registrationDate) && (
            <div className="mt-2 pt-2 border-t text-sm">
              {domainInfo.registrar && (
                <div><span className="text-gray-500">注册商:</span> {domainInfo.registrar}</div>
              )}
              {domainInfo.registrationDate && (
                <div><span className="text-gray-500">注册日期:</span> {domainInfo.registrationDate}</div>
              )}
              {domainInfo.expirationDate && (
                <div><span className="text-gray-500">过期日期:</span> {domainInfo.expirationDate}</div>
              )}
              {domainInfo.nameServers && domainInfo.nameServers.length > 0 && (
                <div className="mt-1">
                  <span className="text-gray-500">DNS服务器:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {domainInfo.nameServers.map((ns, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white border rounded text-xs">{ns}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 反向解析结果 */}
      {reverseDomains.length > 0 && (
        <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-purple-600">🔄</span>
            <span className="font-medium text-purple-800">反向解析结果</span>
          </div>
          <div className="space-y-2">
            {reverseDomains.map((domain, idx) => (
              <div key={idx} className="p-2 bg-white rounded border border-purple-100 text-sm">
                {domain}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DNS记录列表 */}
      <div className="space-y-3 max-h-[350px] overflow-y-auto">
        {groupedRecords && Object.entries(groupedRecords).map(([type, records]) => (
          <div key={type} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className={`px-3 py-2 ${getRecordTypeColor(type)} font-medium text-sm flex items-center gap-2`}>
              <span>{getRecordTypeIcon(type)}</span>
              <span>{type}</span>
              <span className="text-xs opacity-75">({records.length})</span>
            </div>
            <div className="divide-y divide-gray-100">
              {records.map((record, idx) => (
                <div key={idx} className="p-2 hover:bg-gray-50">
                  <div className="text-sm font-mono text-gray-700 break-all">{record.value}</div>
                  {record.ttl && (
                    <div className="text-xs text-gray-400 mt-1">TTL: {record.ttl}s</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 说明 */}
      {(!domainInfo || domainInfo.records.length === 0) && !loading && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">使用说明</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• 查询域名的DNS记录信息</li>
            <li>• 支持查询类型：</li>
            <li>  - A记录: IPv4地址</li>
            <li>  - AAAA记录: IPv6地址</li>
            <li>  - CNAME: 域名别名</li>
            <li>  - MX: 邮件服务器</li>
            <li>  - TXT: 文本记录</li>
            <li>  - NS: 域名服务器</li>
            <li>• 自动获取当前页面域名</li>
            <li>• 支持手动输入任意域名</li>
          </ul>
        </div>
      )}
    </div>
  )
}
