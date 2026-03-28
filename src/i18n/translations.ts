export type Language = 'zh-CN' | 'zh-TW' | 'en' | 'fr' | 'es'

export interface Translations {
  // 通用
  confirm: string
  cancel: string
  save: string
  delete: string
  close: string
  loading: string
  error: string
  success: string

  // 主界面
  aiAssistant: string
  sidebarMode: string
  analyzePage: string
  analyzePageDesc: string
  optimizeText: string
  optimizeTextDesc: string
  generateText: string
  generateTextDesc: string
  networkAnalysis: string
  networkAnalysisDesc: string
  resourceAnalysis: string
  resourceAnalysisDesc: string
  settings: string

  // 快捷键
  shortcuts: string

  // 设置页面
  modelSettings: string
  addModel: string
  modelName: string
  modelEndpoint: string
  apiKey: string
  authType: string
  defaultModel: string
  testConnection: string
  connectionSuccess: string
  connectionFailed: string

  // 文本优化
  textOptimizer: string
  selectModel: string
  inputMethod: string
  manual: string
  selectedContent: string
  noSelection: string
  inputText: string
  originalText: string
  optimizeType: string
  improve: string
  simplify: string
  expand: string
  formal: string
  casual: string
  optimizing: string
  optimizedResult: string
  copyResult: string
  replaceOriginal: string
  textOptimizerTitle: string
  optimizeTarget: string
  content: string
  title: string
  optimizationMethod: string
  optimize: string
  funny: string
  humor: string
  blog: string
  media: string
  customOptimization: string
  addCustomOptimization: string
  optimizationName: string
  promptTemplate: string
  insertIntoPage: string
  optimizedText: string
  textOptimizerInstructions: string
  copiedToClipboard: string
  characterSelected: string
  pleaseSelectText: string

  // 文本生成
  textGenerator: string
  selectType: string
  article: string
  summary: string
  email: string
  social: string
  custom: string
  generate: string
  generating: string
  textGeneratorTitle: string
  generateType: string
  inputRequirements: string
  generateTextButton: string
  generateResult: string
  insertPage: string
  articleType: string
  summaryType: string
  emailType: string
  socialType: string
  customType: string
  generateTextInstructions: string

  // 网络分析
  networkMonitor: string
  startRecording: string
  stopRecording: string
  clearData: string
  aiAnalyze: string
  analyzing: string
  totalRequests: string
  successRequests: string
  failedRequests: string
  totalSize: string
  filterUrl: string
  showFailed: string
  networkAnalyzerTitle: string
  mediaSize: string
  recording: string
  clear: string
  aiModel: string
  filterUrlPlaceholder: string
  failedOnly: string
  hideResult: string
  networkInstructions: string
  noNetworkRequests: string
  recordingStopped: string

  // 资源分析
  resourceAnalyzer: string
  cssResources: string
  jsResources: string
  slowConnections: string
  slowThreshold: string
  totalResources: string
  cssSize: string
  jsSize: string
  rescan: string
  resourceAnalyzerTitle: string
  css: string
  js: string
  slow: string
  rescanPage: string
  exportTxt: string
  resourceInstructions: string
  noSlowRequests: string
  noCssResources: string
  noJsResources: string

  // 语言
  language: string
  chinese: string
  chineseTraditional: string
  english: string
  french: string
  spanish: string

  // 新功能
  adminSniffer: string
  adminSnifferDesc: string
  securityAnalyzer: string
  securityAnalyzerDesc: string
  urlDecoder: string
  urlDecoderDesc: string
  emailHeaderParser: string
  emailHeaderParserDesc: string
  domainLookup: string
  domainLookupDesc: string
  whoisLookup: string
  whoisLookupDesc: string
  dataParser: string
  dataParserDesc: string
  uploadFile: string
  dragDropHint: string
  rows: string
  columns: string
  dataPreview: string
  moreColumns: string
  showingFirst100: string
  features: string
  featureJsonXml: string
  featureFlatten: string
  featureDownload: string
  featureCopy: string
  jsonParseError: string
  xmlParseError: string
  unsupportedFormat: string
  copy: string

  // 内容提取
  contentExtractor: string
  contentExtractorDesc: string
  contentExtractorTitle: string
  enterSelectionMode: string
  startSelectElement: string
  selecting: string
  selectingElement: string
  supportedExtract: string
  elementIdClass: string
  parentElementInfo: string
  autoGenerateSelector: string
  detectDynamicContent: string
  selectedElement: string
  tag: string
  elementId: string
  elementClass: string
  parentTag: string
  parentId: string
  parentClass: string
  recommendedSelector: string
  dynamicContentWarning: string
  parentElements: string
  reSelect: string
  extracting: string
  extractContent: string
  aiIntelligentExtract: string
  aiExtract: string
  aiAnalyzingElement: string
  extractResult: string
  recommendedCode: string
  contentExtractorInstructions: string

  // 视频嗅探
  videoSniffer: string
  videoSnifferDesc: string
  videoSnifferTitle: string
  sniffing: string
  reSniff: string
  videoCount: string
  videoTips: string
  youtubeTips: string
  bilibiliTips: string
  videoEncrypted: string
  recommendYtDlp: string
  ytDlpInstall: string
  paidAgeRestricted: string
  alternativeSolution: string
  dashStream: string
  flvFormat: string
  videoTag: string
  scriptTag: string
  networkRequest: string
  videoInstructions: string

  // 链接分析
  linkAnalyzer: string
  linkAnalyzerDesc: string
  linkAnalyzerTitle: string
  externalLinks: string
  domains: string
  distributionChart: string
  networkChart: string
  aiIntelligentAnalysis: string
  externalLinkList: string
  moreExternalLinks: string
  linkAnalyzerInstructions: string
  externalLinkAnalysis: string
  externalLinkTotal: string
  domainCount: string
  refreshAnalysis: string

  // 页面信息
  pageInfo: string
  pageInfoDesc: string
  pageInfoTitle: string
  basicInfo: string
  screen: string
  device: string
  screenResolution: string
  viewportSize: string
  onlineStatus: string
  online: string
  offline: string
  networkType: string
  platform: string
  cpuCores: string
  deviceMemory: string
  doNotTrack: string
  userAgent: string
  referrer: string
  cookies: string
  pageInfoInstructions: string

  // 页面分析
  pageAnalysisTitle: string
  startAnalysis: string
  analysisResult: string
  pageAnalysisInstructions: string

  // 域名查询
  domainLookupTitle: string
  inputDomain: string
  query: string
  querying: string
  dnsProvider: string
  dnsAuto: string
  dnsAliyun: string
  dnsDnspod: string
  dnsGoogle: string
  recordType: string
  recordAll: string
  recordA: string
  recordAAAA: string
  recordCNAME: string
  recordMX: string
  recordTXT: string
  recordNS: string
  recordSOA: string
  recordPTR: string
  reverseLookup: string
  records: string
  registrar: string
  registrationDate: string
  expirationDate: string
  updatedDate: string
  nameServers: string
  dnsServers: string
  domainStatus: string
  registrantInfo: string
  contactInfo: string
  adminContact: string
  techContact: string
  billingContact: string
  organization: string
  country: string
  state: string
  city: string
  reverseDnsResult: string
  noReverseDns: string
  invalidIp: string
  noDnsRecords: string
  queryFailed: string
  usageInstructions: string
  supportedRecords: string
  autoGetCurrentPage: string
  manualInputSupported: string

  // Whois查询
  whoisQueryTitle: string
  refreshCurrentPage: string
  rawData: string
  showRawData: string
  hideRawData: string
  domainRegistration: string
  websiteRanking: string
  baiduWeight: string
  alexaRank: string
  domestic: string
  international: string
  daysUntilExpiry: string
  expired: string
  expiresToday: string
  registrarInfo: string
  registrationInfo: string
  expirationInfo: string
  updateInfo: string
  whoisInstructions: string
  whoisDescription: string
  autoFetchCurrentPage: string

  // 邮件头解析
  emailHeaderTitle: string
  pasteEmailHeaders: string
  parse: string
  paste: string
  debugMode: string
  debugModeOn: string
  startDebugAnalysis: string
  emailHeaderTip: string
  securityAnalysis: string
  lowRisk: string
  mediumRisk: string
  highRisk: string
  noSecurityIssues: string
  errorIssues: string
  warnings: string
  information: string
  timingAnalysis: string
  sentTime: string
  serverDelay: string
  emailRoute: string
  hops: string
  discoveredIps: string
  statistics: string
  totalHeaders: string
  receivedCount: string
  hasReplyTo: string
  hasReturnPath: string
  contentTypeLabel: string
  exportData: string
  copyDebugData: string
  senderInfo: string
  recipientInfo: string
  emailInfo: string
  authResults: string
  routeInfo: string
  contentInfo: string
  antiSpam: string
  otherInfo: string
  emailHeaderInstructions: string

  // URL解码
  urlDecoderTitle: string
  reAnalyze: string
  analyzingPageUrls: string
  inputDecodeString: string
  decode: string
  validDecoded: string
  partialDecoded: string
  total: string
  original: string
  decodedResult: string
  urlDecoderInstructions: string

  // 安全分析
  securityAnalyzerTitle: string
  analyzingSecurity: string
  riskLevel: string
  aiAnalysis: string
  aiAnalyzing: string
  aiAnalysisResult: string
  viewRecommendation: string
  detail: string
  recommendation: string
  securityInstructions: string

  // 通用按钮和标签
  refresh: string
  analyze: string
  exportJson: string
  export: string
  hide: string
  show: string
  viewDetails: string
  copyToClipboard: string
  copied: string
  noData: string

  // 输入提示
  inputPlaceholder: string
  searchPlaceholder: string
  selectOption: string

  // 状态消息
  successMessage: string
  errorMessage: string
  warningMessage: string
  infoMessage: string
  confirmAction: string

  // 通用
  back: string
  forward: string
  closeSidebar: string
  openSidebar: string
  about: string
  help: string
  version: string
  sponsor: string
  sponsorTitle: string
  sponsorSubtitle: string
  trc20: string
  paypal: string
  wechat: string
  trc20Address: string
  paypalEmail: string
  wechatId: string
  copyAddress: string
  addressCopied: string
  modelConfig: string
  pluginIcon: string
  changeIcon: string
  iconSuggestion: string
}

export const translations: Record<Language, Translations> = {
  'zh-CN': {
    // 通用
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    close: '关闭',
    loading: '加载中...',
    error: '错误',
    success: '成功',

    // 主界面
    aiAssistant: '小铭助手',
    sidebarMode: '侧边栏模式',
    analyzePage: '分析当前页面',
    analyzePageDesc: '提取页面内容进行AI分析',
    optimizeText: '自媒体内容助手',
    optimizeTextDesc: 'AI辅助创作自媒体内容',
    generateText: '自媒体内容生成',
    generateTextDesc: 'AI辅助生成自媒体内容',
    networkAnalysis: '网络流量分析',
    networkAnalysisDesc: '监控当前页面网络请求',
    resourceAnalysis: '页面资源分析',
    resourceAnalysisDesc: 'CSS/JS引用和慢速连接检测',
    settings: '设置',

    // 快捷键
    shortcuts: '快捷键',

    // 设置页面
    modelSettings: '模型设置',
    addModel: '添加模型',
    modelName: '模型名称',
    modelEndpoint: 'API端点',
    apiKey: 'API Key',
    authType: '认证方式',
    defaultModel: '默认模型',
    testConnection: '测试连接',
    connectionSuccess: '连接成功',
    connectionFailed: '连接失败',

    // 文本优化
    textOptimizer: '文本优化',
    selectModel: '选择模型',
    inputMethod: '输入方式',
    manual: '手动输入',
    selectedContent: '选中内容',
    noSelection: '无',
    inputText: '输入要优化的文本',
    originalText: '原文',
    optimizeType: '优化方式',
    improve: '优化',
    simplify: '简化',
    expand: '扩展',
    formal: '正式',
    casual: '口语',
    optimizing: '优化中...',
    optimizedResult: '优化后',
    copyResult: '复制',
    replaceOriginal: '替换原文',
    textOptimizerTitle: '文本优化',
    optimizeTarget: '优化目标',
    content: '内容',
    title: '标题',
    optimizationMethod: '优化方式',
    optimize: '优化',
    funny: '搞笑',
    humor: '幽默',
    blog: '博客',
    media: '自媒体',
    customOptimization: '自定义优化',
    addCustomOptimization: '添加自定义优化方式',
    optimizationName: '名称',
    promptTemplate: '提示词',
    insertIntoPage: '插入页面',
    optimizedText: '优化后',
    textOptimizerInstructions: 'AI辅助创作自媒体内容',
    copiedToClipboard: '已复制到剪贴板',
    characterSelected: '字符',
    pleaseSelectText: '请先在页面中选中文字',

    // 文本生成
    textGenerator: '文本生成',
    selectType: '选择类型',
    article: '文章',
    summary: '摘要',
    email: '邮件',
    social: '社交媒体',
    custom: '自定义',
    generate: '生成',
    generating: '生成中...',
    textGeneratorTitle: '生成文本内容',
    generateType: '生成类型',
    inputRequirements: '输入生成要求',
    generateTextButton: '生成文本',
    generateResult: '生成结果',
    insertPage: '插入页面',
    articleType: '文章',
    summaryType: '摘要',
    emailType: '邮件',
    socialType: '社交文案',
    customType: '自定义',
    generateTextInstructions: 'AI辅助生成自媒体内容',

    // 网络分析
    networkMonitor: '网络流量分析',
    startRecording: '开始记录',
    stopRecording: '停止记录',
    clearData: '清空',
    aiAnalyze: 'AI分析',
    analyzing: '分析中...',
    totalRequests: '总请求',
    successRequests: '成功',
    failedRequests: '失败',
    totalSize: '总大小',
    filterUrl: '筛选URL...',
    showFailed: '失败',
    networkAnalyzerTitle: '网络流量分析',
    mediaSize: '媒体',
    recording: '正在监控',
    clear: '清空',
    aiModel: 'AI分析模型',
    filterUrlPlaceholder: '筛选URL...',
    failedOnly: '失败',
    hideResult: '隐藏',
    networkInstructions: '暂无网络请求数据',
    noNetworkRequests: '暂无网络请求数据',
    recordingStopped: '监控已停止',

    // 资源分析
    resourceAnalyzer: '页面资源分析',
    cssResources: 'CSS',
    jsResources: 'JS',
    slowConnections: '慢速',
    slowThreshold: '慢速阈值',
    totalResources: '总资源',
    cssSize: 'CSS大小',
    jsSize: 'JS大小',
    rescan: '重新扫描',
    resourceAnalyzerTitle: '页面资源分析',
    css: 'CSS',
    js: 'JS',
    slow: '慢速',
    rescanPage: '重新扫描',
    exportTxt: '导出TXT',
    resourceInstructions: 'CSS/JS引用和慢速连接检测',
    noSlowRequests: '无慢速请求',
    noCssResources: '无CSS资源',
    noJsResources: '无JS资源',

    // 语言
    language: '语言',
    chinese: '中文',
    chineseTraditional: '繁体中文',
    english: '英语',
    french: '法语',
    spanish: '西班牙语',

    // 新功能
    adminSniffer: '嗅探管理地址',
    adminSnifferDesc: '分析后台登录/数据库地址',
    securityAnalyzer: '页面安全分析',
    securityAnalyzerDesc: '检测XSS/CSRF/敏感信息泄露',
    urlDecoder: '逆向还原网址',
    urlDecoderDesc: 'Base64/URL编码还原跳转链接',
    emailHeaderParser: '邮件头解析',
    emailHeaderParserDesc: '分析发件人/SPF/DKIM验证',
    domainLookup: '域名查询',
    domainLookupDesc: '查询DNS记录/Whois信息',
    whoisLookup: 'Whois查询',
    whoisLookupDesc: '查询域名注册详细信息',
    dataParser: '数据解析器',
    dataParserDesc: 'JSON/XML解析与转换',
    uploadFile: '点击上传 JSON 或 XML 文件',
    dragDropHint: '支持拖拽文件到此处',
    rows: '行',
    columns: '列',
    dataPreview: '数据预览',
    moreColumns: '列',
    showingFirst100: '显示前 100 条，共 {count} 条',
    features: '功能说明',
    featureJsonXml: '支持解析 JSON 和 XML 格式文件',
    featureFlatten: '自动提取数据并展平为表格',
    featureDownload: '支持下载为 CSV、XLSX、JSON 格式',
    featureCopy: '支持复制解析后的数据到剪贴板',
    jsonParseError: 'JSON 解析失败',
    xmlParseError: 'XML 解析失败',
    unsupportedFormat: '不支持的文件格式',
    copy: '复制',

    // 内容提取
    contentExtractor: '内容提取',
    contentExtractorDesc: '提取页面指定元素内容',
    contentExtractorTitle: '内容提取',
    enterSelectionMode: '进入选择模式',
    startSelectElement: '开始选择元素',
    selecting: '选择中...',
    selectingElement: '选择元素',
    supportedExtract: '支持提取',
    elementIdClass: '元素的ID和Class',
    parentElementInfo: '父级元素信息',
    autoGenerateSelector: '自动生成推荐的选择器',
    detectDynamicContent: '检测是否为动态内容',
    selectedElement: '选中元素',
    tag: '标签',
    elementId: 'ID',
    elementClass: 'Class',
    parentTag: '父级标签',
    parentId: '父级ID',
    parentClass: '父级Class',
    recommendedSelector: '推荐选择器',
    dynamicContentWarning: '内容为JavaScript动态生成，无法直接提取',
    parentElements: '父级元素',
    reSelect: '重新选择',
    extracting: '提取中...',
    extractContent: '提取内容',
    aiIntelligentExtract: 'AI智能提取',
    aiExtract: 'AI提取',
    aiAnalyzingElement: 'AI正在分析元素并生成最佳抓取方案',
    extractResult: '提取结果',
    recommendedCode: '推荐抓取代码',
    contentExtractorInstructions: '点击页面上的元素进行提取',

    // 视频嗅探
    videoSniffer: '视频地址嗅探',
    videoSnifferDesc: '获取页面视频真实地址',
    videoSnifferTitle: '视频地址嗅探',
    sniffing: '嗅探中...',
    reSniff: '重新嗅探',
    videoCount: '视频数',
    videoTips: '视频提示',
    youtubeTips: 'YouTube视频提示',
    bilibiliTips: 'B站视频提示',
    videoEncrypted: 'YouTube视频地址已加密',
    recommendYtDlp: '推荐使用yt-dlp下载',
    ytDlpInstall: '安装命令',
    paidAgeRestricted: '付费/年龄限制视频需要Cookie',
    alternativeSolution: '备用方案',
    dashStream: 'DASH流媒体',
    flvFormat: 'FLV格式',
    videoTag: 'video标签',
    scriptTag: 'script脚本',
    networkRequest: '网络请求',
    videoInstructions: '自动扫描页面中的视频资源',

    // 链接分析
    linkAnalyzer: '链接分析',
    linkAnalyzerDesc: '批量分析链接有效性',
    linkAnalyzerTitle: '外链分析',
    externalLinks: '外链总数',
    domains: '涉及域名',
    distributionChart: '分布图',
    networkChart: '网络图',
    aiIntelligentAnalysis: 'AI智能分析',
    externalLinkList: '外链列表',
    moreExternalLinks: '还有的外链',
    linkAnalyzerInstructions: '批量分析链接有效性',
    externalLinkAnalysis: '外部链接分析',
    externalLinkTotal: '外链总数',
    domainCount: '涉及域名数',
    refreshAnalysis: '刷新分析',

    // 页面信息
    pageInfo: '页面信息',
    pageInfoDesc: '查看当前页面详细信息',
    pageInfoTitle: '页面信息',
    basicInfo: '基础信息',
    screen: '屏幕',
    device: '设备',
    screenResolution: '屏幕分辨率',
    viewportSize: '视口大小',
    onlineStatus: '在线状态',
    online: '在线',
    offline: '离线',
    networkType: '网络类型',
    platform: '平台',
    cpuCores: 'CPU核心数',
    deviceMemory: '设备内存',
    doNotTrack: 'Do Not Track',
    userAgent: 'UserAgent',
    referrer: 'Referrer',
    cookies: 'Cookies',
    pageInfoInstructions: '获取页面详细信息',

    // 页面分析
    pageAnalysisTitle: '页面分析',
    startAnalysis: '开始分析',
    analysisResult: '分析结果',
    pageAnalysisInstructions: '点击"开始分析"按钮对当前页面进行AI分析',

    // 域名查询
    domainLookupTitle: '域名查询',
    inputDomain: '输入域名 (如 example.com)',
    query: '查询',
    querying: '查询中...',
    dnsProvider: 'DNS服务商',
    dnsAuto: '自动选择',
    dnsAliyun: '阿里云',
    dnsDnspod: '腾讯 DNSPod',
    dnsGoogle: 'Google',
    recordType: '查询类型',
    recordAll: '全部',
    recordA: 'A',
    recordAAAA: 'AAAA',
    recordCNAME: 'CNAME',
    recordMX: 'MX',
    recordTXT: 'TXT',
    recordNS: 'NS',
    recordSOA: 'SOA',
    recordPTR: 'PTR',
    reverseLookup: '反向查询',
    records: '条记录',
    registrar: '注册商',
    registrationDate: '注册日期',
    expirationDate: '过期日期',
    updatedDate: '更新日期',
    nameServers: 'DNS服务器',
    dnsServers: 'DNS服务器',
    domainStatus: '域名状态',
    registrantInfo: '注册人信息',
    contactInfo: '联系人信息',
    adminContact: '管理员',
    techContact: '技术联系人',
    billingContact: '账单联系人',
    organization: '组织',
    country: '国家',
    state: '省份',
    city: '城市',
    reverseDnsResult: '反向解析结果',
    noReverseDns: '未找到反向解析记录',
    invalidIp: '请输入有效的IP地址',
    noDnsRecords: '未找到DNS记录',
    queryFailed: '查询失败',
    usageInstructions: '使用说明',
    supportedRecords: '支持查询类型',
    autoGetCurrentPage: '自动获取当前页面域名',
    manualInputSupported: '支持手动输入任意域名',

    // Whois查询
    whoisQueryTitle: 'Whois查询',
    refreshCurrentPage: '刷新当前页面域名',
    rawData: '原始数据',
    showRawData: '显示原始数据',
    hideRawData: '隐藏原始数据',
    domainRegistration: '域名注册信息',
    websiteRanking: '网站排名',
    baiduWeight: '百度权重',
    alexaRank: 'Alexa',
    domestic: '国内',
    international: '国际',
    daysUntilExpiry: '距离到期',
    expired: '已过期',
    expiresToday: '今天到期',
    registrarInfo: '注册商信息',
    registrationInfo: '注册信息',
    expirationInfo: '到期信息',
    updateInfo: '更新信息',
    whoisInstructions: '使用说明',
    whoisDescription: '查询域名的Whois注册信息',
    autoFetchCurrentPage: '自动获取当前页面域名',

    // 邮件头解析
    emailHeaderTitle: '邮件头解析',
    pasteEmailHeaders: '粘贴邮件头信息',
    parse: '解析',
    paste: '粘贴',
    debugMode: 'Debug模式',
    debugModeOn: 'Debug模式 (开启)',
    startDebugAnalysis: '开始Debug分析',
    emailHeaderTip: '提示：在邮件详情中查看"显示原始邮件"或"显示邮件头"来获取邮件头信息',
    securityAnalysis: '安全分析',
    lowRisk: '低风险',
    mediumRisk: '中风险',
    highRisk: '高风险',
    noSecurityIssues: '未发现明显安全问题',
    errorIssues: '错误问题',
    warnings: '警告',
    information: '信息',
    timingAnalysis: '时间分析',
    sentTime: '发送时间',
    serverDelay: '服务器延迟',
    emailRoute: '邮件路由',
    hops: '跳',
    discoveredIps: '发现的IP地址',
    statistics: '统计信息',
    totalHeaders: '总头部数',
    receivedCount: 'Received跳数',
    hasReplyTo: '有Reply-To',
    hasReturnPath: '有Return-Path',
    contentTypeLabel: 'Content-Type',
    exportData: '导出',
    copyDebugData: '复制Debug数据',
    senderInfo: '发件人信息',
    recipientInfo: '收件人信息',
    emailInfo: '邮件信息',
    authResults: '认证结果',
    routeInfo: '路由信息',
    contentInfo: '内容信息',
    antiSpam: '反垃圾/安全',
    otherInfo: '其他信息',
    emailHeaderInstructions: '解析邮件头信息，分析发件人真实性',

    // URL解码
    urlDecoderTitle: '逆向还原网址',
    reAnalyze: '重新分析',
    analyzingPageUrls: '正在分析页面中的编码链接',
    inputDecodeString: '输入需要解码的URL或编码字符串',
    decode: '解码',
    validDecoded: '有效解码',
    partialDecoded: '部分解码',
    total: '总计',
    original: '原始',
    decodedResult: '解码后',
    urlDecoderInstructions: '自动扫描页面中的编码链接',

    // 安全分析
    securityAnalyzerTitle: '页面安全分析',
    analyzingSecurity: '正在分析页面安全',
    riskLevel: '风险等级',
    aiAnalysis: 'AI智能分析',
    aiAnalyzing: 'AI分析中...',
    aiAnalysisResult: 'AI分析结果',
    viewRecommendation: '查看详情',
    detail: '详情',
    recommendation: '建议',
    securityInstructions: '自动检测当前页面的安全风险',

    // 通用按钮和标签
    refresh: '刷新',
    analyze: '分析',
    exportJson: '导出JSON',
    export: '导出',
    hide: '隐藏',
    show: '显示',
    viewDetails: '查看详情',
    copyToClipboard: '复制到剪贴板',
    copied: '已复制',
    noData: '暂无数据',

    // 输入提示
    inputPlaceholder: '请输入...',
    searchPlaceholder: '搜索...',
    selectOption: '请选择',

    // 状态消息
    successMessage: '操作成功',
    errorMessage: '操作失败',
    warningMessage: '警告',
    infoMessage: '提示',
    confirmAction: '确认操作',

    // 通用
    back: '返回',
    forward: '前进',
    closeSidebar: '关闭侧边栏',
    openSidebar: '开启侧边栏',
    about: '关于',
    help: '帮助',
    version: '版本',
    sponsor: '赞助',
    sponsorTitle: '赞助开发者',
    sponsorSubtitle: '如果这个小工具对你有帮助，欢迎赞助支持开发者继续维护更新',
    trc20: 'TRC20/USDT',
    paypal: 'PayPal',
    wechat: '微信',
    trc20Address: 'TPyLfYoN2oXBHfJtdX6jwS2PXB8xkA5XHu',
    paypalEmail: '10853913@qq.com',
    wechatId: 'xpcustomer',
    copyAddress: '复制地址',
    addressCopied: '地址已复制',
    modelConfig: '模型配置',
    pluginIcon: '插件头像',
    changeIcon: '更换头像',
    iconSuggestion: '建议尺寸: 128x128，不超过200KB',
  },

  'zh-TW': {
    // 通用
    confirm: '確認',
    cancel: '取消',
    save: '儲存',
    delete: '刪除',
    close: '關閉',
    loading: '載入中...',
    error: '錯誤',
    success: '成功',

    // 主介面
    aiAssistant: '小铭助手',
    sidebarMode: '側邊欄模式',
    analyzePage: '分析當前頁面',
    analyzePageDesc: '提取頁面內容進行AI分析',
    optimizeText: '優化選中文本',
    optimizeTextDesc: '優化或重寫網頁中選中的文本',
    generateText: '生成文本內容',
    generateTextDesc: '根據要求生成新的文本',
    networkAnalysis: '網路流量分析',
    networkAnalysisDesc: '監控當前頁面網路請求',
    resourceAnalysis: '頁面資源分析',
    resourceAnalysisDesc: 'CSS/JS引用和慢速連線檢測',
    settings: '設定',

    // 快捷鍵
    shortcuts: '快捷鍵',

    // 設定頁面
    modelSettings: '模型設定',
    addModel: '新增模型',
    modelName: '模型名稱',
    modelEndpoint: 'API端點',
    apiKey: 'API Key',
    authType: '認證方式',
    defaultModel: '預設模型',
    testConnection: '測試連線',
    connectionSuccess: '連線成功',
    connectionFailed: '連線失敗',

    // 文本優化
    textOptimizer: '文本優化',
    selectModel: '選擇模型',
    inputMethod: '輸入方式',
    manual: '手動輸入',
    selectedContent: '選中內容',
    noSelection: '無',
    inputText: '輸入要優化的文本',
    originalText: '原文',
    optimizeType: '優化方式',
    improve: '優化',
    simplify: '簡化',
    expand: '擴展',
    formal: '正式',
    casual: '口語',
    optimizing: '優化中...',
    optimizedResult: '優化後',
    copyResult: '複製',
    replaceOriginal: '替換原文',
    textOptimizerTitle: '文字優化',
    optimizeTarget: '優化目標',
    content: '內容',
    title: '標題',
    optimizationMethod: '優化方式',
    optimize: '優化',
    funny: '搞笑',
    humor: '幽默',
    blog: '部落格',
    media: '自媒體',
    customOptimization: '自訂優化',
    addCustomOptimization: '新增自訂優化方式',
    optimizationName: '名稱',
    promptTemplate: '提示詞',
    insertIntoPage: '插入頁面',
    optimizedText: '優化後',
    textOptimizerInstructions: 'AI輔助創作自媒體內容',
    copiedToClipboard: '已複製到剪貼板',
    characterSelected: '字元',
    pleaseSelectText: '請先在頁面中選中文字',

    // 文本生成
    textGenerator: '文本生成',
    selectType: '選擇類型',
    article: '文章',
    summary: '摘要',
    email: '郵件',
    social: '社群媒體',
    custom: '自訂',
    generate: '生成',
    generating: '生成中...',
    textGeneratorTitle: '生成文字內容',
    generateType: '生成類型',
    inputRequirements: '輸入生成要求',
    generateTextButton: '生成文字',
    generateResult: '生成結果',
    insertPage: '插入頁面',
    articleType: '文章',
    summaryType: '摘要',
    emailType: '郵件',
    socialType: '社群文案',
    customType: '自訂',
    generateTextInstructions: 'AI輔助生成自媒體內容',

    // 網路分析
    networkMonitor: '網路流量分析',
    startRecording: '開始記錄',
    stopRecording: '停止記錄',
    clearData: '清除',
    aiAnalyze: 'AI分析',
    analyzing: '分析中...',
    totalRequests: '總請求',
    successRequests: '成功',
    failedRequests: '失敗',
    totalSize: '總大小',
    filterUrl: '篩選URL...',
    showFailed: '失敗',
    networkAnalyzerTitle: '網路流量分析',
    mediaSize: '媒體',
    recording: '正在監控',
    clear: '清除',
    aiModel: 'AI分析模型',
    filterUrlPlaceholder: '篩選URL...',
    failedOnly: '失敗',
    hideResult: '隱藏',
    networkInstructions: '暫無網路請求數據',
    noNetworkRequests: '暫無網路請求數據',
    recordingStopped: '監控已停止',

    // 資源分析
    resourceAnalyzer: '頁面資源分析',
    cssResources: 'CSS',
    jsResources: 'JS',
    slowConnections: '慢速',
    slowThreshold: '慢速閾值',
    totalResources: '總資源',
    cssSize: 'CSS大小',
    jsSize: 'JS大小',
    rescan: '重新掃描',
    resourceAnalyzerTitle: '頁面資源分析',
    css: 'CSS',
    js: 'JS',
    slow: '慢速',
    rescanPage: '重新掃描',
    exportTxt: '匯出TXT',
    resourceInstructions: 'CSS/JS引用和慢速連線檢測',
    noSlowRequests: '無慢速請求',
    noCssResources: '無CSS資源',
    noJsResources: '無JS資源',

    // 語言
    language: '語言',
    chinese: '中文',
    chineseTraditional: '繁體中文',
    english: '英語',
    french: '法語',
    spanish: '西班牙語',

    // 新功能
    adminSniffer: '嗅探管理位址',
    adminSnifferDesc: '分析後台登入/資料庫位址',
    securityAnalyzer: '頁面安全分析',
    securityAnalyzerDesc: '檢測XSS/CSRF/敏感資訊洩露',
    urlDecoder: '逆向還原網址',
    urlDecoderDesc: 'Base64/URL編碼還原跳轉鏈接',
    emailHeaderParser: '郵件頭解析',
    emailHeaderParserDesc: '分析發件人/SPF/DKIM驗證',
    domainLookup: '網域查詢',
    domainLookupDesc: '查詢DNS記錄/Whois資訊',
    whoisLookup: 'Whois查詢',
    whoisLookupDesc: '查詢網域註冊詳細資訊',
    dataParser: '數據解析器',
    dataParserDesc: 'JSON/XML解析與轉換',
    uploadFile: '點擊上傳 JSON 或 XML 文件',
    dragDropHint: '支援拖放文件到此處',
    rows: '列',
    columns: '欄',
    dataPreview: '數據預覽',
    moreColumns: '欄',
    showingFirst100: '顯示前 100 條，共 {count} 條',
    features: '功能說明',
    featureJsonXml: '支援解析 JSON 和 XML 格式文件',
    featureFlatten: '自動提取數據並展平為表格',
    featureDownload: '支援下載為 CSV、XLSX、JSON 格式',
    featureCopy: '支援複製解析後的數據到剪貼板',
    jsonParseError: 'JSON 解析失敗',
    xmlParseError: 'XML 解析失敗',
    unsupportedFormat: '不支援的文件格式',
    copy: '複製',

    // 內容提取
    contentExtractor: '內容提取',
    contentExtractorDesc: '提取頁面指定元素內容',
    contentExtractorTitle: '內容提取',
    enterSelectionMode: '進入選擇模式',
    startSelectElement: '開始選擇元素',
    selecting: '選擇中...',
    selectingElement: '選擇元素',
    supportedExtract: '支援提取',
    elementIdClass: '元素的ID和Class',
    parentElementInfo: '父級元素資訊',
    autoGenerateSelector: '自動產生推薦的選擇器',
    detectDynamicContent: '檢測是否為動態內容',
    selectedElement: '選中元素',
    tag: '標籤',
    elementId: 'ID',
    elementClass: 'Class',
    parentTag: '父級標籤',
    parentId: '父級ID',
    parentClass: '父級Class',
    recommendedSelector: '推薦選擇器',
    dynamicContentWarning: '內容為JavaScript動態產生，無法直接提取',
    parentElements: '父級元素',
    reSelect: '重新選擇',
    extracting: '提取中...',
    extractContent: '提取內容',
    aiIntelligentExtract: 'AI智慧提取',
    aiExtract: 'AI提取',
    aiAnalyzingElement: 'AI正在分析元素並產生最佳抓取方案',
    extractResult: '提取結果',
    recommendedCode: '推薦抓取代碼',
    contentExtractorInstructions: '點擊頁面上的元素進行提取',

    // 影片嗅探
    videoSniffer: '影片位址嗅探',
    videoSnifferDesc: '取得頁面影片真實位址',
    videoSnifferTitle: '影片位址嗅探',
    sniffing: '嗅探中...',
    reSniff: '重新嗅探',
    videoCount: '影片數',
    videoTips: '影片提示',
    youtubeTips: 'YouTube影片提示',
    bilibiliTips: 'B站影片提示',
    videoEncrypted: 'YouTube影片位址已加密',
    recommendYtDlp: '推薦使用yt-dlp下載',
    ytDlpInstall: '安裝命令',
    paidAgeRestricted: '付費/年齡限制影片需要Cookie',
    alternativeSolution: '備用方案',
    dashStream: 'DASH流媒體',
    flvFormat: 'FLV格式',
    videoTag: 'video標籤',
    scriptTag: 'script腳本',
    networkRequest: '網路請求',
    videoInstructions: '自動掃描頁面中的影片資源',

    // 連結分析
    linkAnalyzer: '連結分析',
    linkAnalyzerDesc: '批量分析連結有效性',
    linkAnalyzerTitle: '外鏈分析',
    externalLinks: '外鏈總數',
    domains: '涉及域名',
    distributionChart: '分布圖',
    networkChart: '網路圖',
    aiIntelligentAnalysis: 'AI智慧分析',
    externalLinkList: '外鏈列表',
    moreExternalLinks: '還有的外鏈',
    linkAnalyzerInstructions: '批量分析連結有效性',
    externalLinkAnalysis: '外部連結分析',
    externalLinkTotal: '外鏈總數',
    domainCount: '涉及域名數',
    refreshAnalysis: '重新整理分析',

    // 頁面資訊
    pageInfo: '頁面資訊',
    pageInfoDesc: '查看目前頁面詳細資訊',
    pageInfoTitle: '頁面資訊',
    basicInfo: '基本資訊',
    screen: '螢幕',
    device: '裝置',
    screenResolution: '螢幕解析度',
    viewportSize: '視口大小',
    onlineStatus: '上線狀態',
    online: '上線',
    offline: '離線',
    networkType: '網路類型',
    platform: '平台',
    cpuCores: 'CPU核心數',
    deviceMemory: '裝置記憶體',
    doNotTrack: 'Do Not Track',
    userAgent: 'UserAgent',
    referrer: 'Referrer',
    cookies: 'Cookies',
    pageInfoInstructions: '取得頁面詳細資訊',

    // 頁面分析
    pageAnalysisTitle: '頁面分析',
    startAnalysis: '開始分析',
    analysisResult: '分析結果',
    pageAnalysisInstructions: '點擊"開始分析"按鈕對目前頁面進行AI分析',

    // 域名查詢
    domainLookupTitle: '域名查詢',
    inputDomain: '輸入域名 (如 example.com)',
    query: '查詢',
    querying: '查詢中...',
    dnsProvider: 'DNS服務商',
    dnsAuto: '自動選擇',
    dnsAliyun: '阿里雲',
    dnsDnspod: '騰訊 DNSPod',
    dnsGoogle: 'Google',
    recordType: '查詢類型',
    recordAll: '全部',
    recordA: 'A',
    recordAAAA: 'AAAA',
    recordCNAME: 'CNAME',
    recordMX: 'MX',
    recordTXT: 'TXT',
    recordNS: 'NS',
    recordSOA: 'SOA',
    recordPTR: 'PTR',
    reverseLookup: '反向查詢',
    records: '條記錄',
    registrar: '註冊商',
    registrationDate: '註冊日期',
    expirationDate: '過期日期',
    updatedDate: '更新日期',
    nameServers: 'DNS服務器',
    dnsServers: 'DNS服務器',
    domainStatus: '域名狀態',
    registrantInfo: '註冊人資訊',
    contactInfo: '聯絡人資訊',
    adminContact: '管理員',
    techContact: '技術聯絡人',
    billingContact: '帳單聯絡人',
    organization: '組織',
    country: '國家',
    state: '省份',
    city: '城市',
    reverseDnsResult: '反向解析結果',
    noReverseDns: '未找到反向解析記錄',
    invalidIp: '請輸入有效的IP位址',
    noDnsRecords: '未找到DNS記錄',
    queryFailed: '查詢失敗',
    usageInstructions: '使用說明',
    supportedRecords: '支援查詢類型',
    autoGetCurrentPage: '自動取得目前頁面域名',
    manualInputSupported: '支援手動輸入任意域名',

    // Whois查詢
    whoisQueryTitle: 'Whois查詢',
    refreshCurrentPage: '重新整理目前頁面域名',
    rawData: '原始數據',
    showRawData: '顯示原始數據',
    hideRawData: '隱藏原始數據',
    domainRegistration: '域名註冊資訊',
    websiteRanking: '網站排名',
    baiduWeight: '百度權重',
    alexaRank: 'Alexa',
    domestic: '國內',
    international: '國際',
    daysUntilExpiry: '距離到期',
    expired: '已過期',
    expiresToday: '今天到期',
    registrarInfo: '註冊商資訊',
    registrationInfo: '註冊資訊',
    expirationInfo: '到期資訊',
    updateInfo: '更新資訊',
    whoisInstructions: '使用說明',
    whoisDescription: '查詢域名的Whois註冊資訊',
    autoFetchCurrentPage: '自動取得目前頁面域名',

    // 郵件頭解析
    emailHeaderTitle: '郵件頭解析',
    pasteEmailHeaders: '貼上郵件頭資訊',
    parse: '解析',
    paste: '貼上',
    debugMode: 'Debug模式',
    debugModeOn: 'Debug模式 (開啟)',
    startDebugAnalysis: '開始Debug分析',
    emailHeaderTip: '提示：在郵件詳情中查看"顯示原始郵件"或"顯示郵件頭"來取得郵件頭資訊',
    securityAnalysis: '安全分析',
    lowRisk: '低風險',
    mediumRisk: '中風險',
    highRisk: '高風險',
    noSecurityIssues: '未發現明顯安全問題',
    errorIssues: '錯誤問題',
    warnings: '警告',
    information: '資訊',
    timingAnalysis: '時間分析',
    sentTime: '發送時間',
    serverDelay: '伺服器延遲',
    emailRoute: '郵件路由',
    hops: '跳',
    discoveredIps: '發現的IP位址',
    statistics: '統計資訊',
    totalHeaders: '總頭部數',
    receivedCount: 'Received跳數',
    hasReplyTo: '有Reply-To',
    hasReturnPath: '有Return-Path',
    contentTypeLabel: 'Content-Type',
    exportData: '匯出',
    copyDebugData: '複製Debug數據',
    senderInfo: '發件人資訊',
    recipientInfo: '收件人資訊',
    emailInfo: '郵件資訊',
    authResults: '認證結果',
    routeInfo: '路由資訊',
    contentInfo: '內容資訊',
    antiSpam: '反垃圾/安全',
    otherInfo: '其他資訊',
    emailHeaderInstructions: '解析郵件頭資訊，分析發件人真實性',

    // URL解碼
    urlDecoderTitle: '逆向還原網址',
    reAnalyze: '重新分析',
    analyzingPageUrls: '正在分析頁面中的編碼連結',
    inputDecodeString: '輸入需要解碼的URL或編碼字串',
    decode: '解碼',
    validDecoded: '有效解碼',
    partialDecoded: '部分解碼',
    total: '總計',
    original: '原始',
    decodedResult: '解碼後',
    urlDecoderInstructions: '自動掃描頁面中的編碼連結',

    // 安全分析
    securityAnalyzerTitle: '頁面安全分析',
    analyzingSecurity: '正在分析頁面安全',
    riskLevel: '風險等級',
    aiAnalysis: 'AI智慧分析',
    aiAnalyzing: 'AI分析中...',
    aiAnalysisResult: 'AI分析結果',
    viewRecommendation: '查看詳情',
    detail: '詳情',
    recommendation: '建議',
    securityInstructions: '自動檢測目前頁面的安全風險',

    // 通用按鈕和標籤
    refresh: '重新整理',
    analyze: '分析',
    exportJson: '匯出JSON',
    export: '匯出',
    hide: '隱藏',
    show: '顯示',
    viewDetails: '查看詳情',
    copyToClipboard: '複製到剪貼板',
    copied: '已複製',
    noData: '暫無數據',

    // 輸入提示
    inputPlaceholder: '請輸入...',
    searchPlaceholder: '搜尋...',
    selectOption: '請選擇',

    // 狀態消息
    successMessage: '操作成功',
    errorMessage: '操作失敗',
    warningMessage: '警告',
    infoMessage: '提示',
    confirmAction: '確認操作',

    // 通用
    back: '返回',
    forward: '前進',
    closeSidebar: '關閉側邊欄',
    openSidebar: '開啟側邊欄',
    about: '關於',
    help: '幫助',
    version: '版本',
    sponsor: '贊助',
    sponsorTitle: '贊助開發者',
    sponsorSubtitle: '如果這個小工具對你有幫助，歡迎贊助支持開發者繼續維護更新',
    trc20: 'TRC20/USDT',
    paypal: 'PayPal',
    wechat: '微信',
    trc20Address: 'TPyLfYoN2oXBHfJtdX6jwS2PXB8xkA5XHu',
    paypalEmail: '10853913@qq.com',
    wechatId: 'xpcustomer',
    copyAddress: '複製位址',
    addressCopied: '位址已複製',
    modelConfig: '模型配置',
    pluginIcon: '插件頭像',
    changeIcon: '更換頭像',
    iconSuggestion: '建議尺寸: 128x128，不超過200KB',
  },

  'en': {
    // General
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    close: 'Close',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',

    // Main UI
    aiAssistant: '小铭助手',
    sidebarMode: 'Sidebar Mode',
    analyzePage: 'Analyze Page',
    analyzePageDesc: 'Extract page content for AI analysis',
    optimizeText: 'Optimize Text',
    optimizeTextDesc: 'AI-assisted content creation',
    generateText: 'Generate Text',
    generateTextDesc: 'AI-assisted content generation',
    networkAnalysis: 'Network Analysis',
    networkAnalysisDesc: 'Monitor page network requests',
    resourceAnalysis: 'Resource Analysis',
    resourceAnalysisDesc: 'CSS/JS references and slow connection detection',
    settings: 'Settings',

    // Shortcuts
    shortcuts: 'Shortcuts',

    // Settings Page
    modelSettings: 'Model Settings',
    addModel: 'Add Model',
    modelName: 'Model Name',
    modelEndpoint: 'API Endpoint',
    apiKey: 'API Key',
    authType: 'Auth Type',
    defaultModel: 'Default Model',
    testConnection: 'Test Connection',
    connectionSuccess: 'Connection Success',
    connectionFailed: 'Connection Failed',

    // Text Optimization
    textOptimizer: 'Text Optimizer',
    selectModel: 'Select Model',
    inputMethod: 'Input Method',
    manual: 'Manual Input',
    selectedContent: 'Selected Content',
    noSelection: 'None',
    inputText: 'Enter text to optimize',
    originalText: 'Original Text',
    optimizeType: 'Optimization Type',
    improve: 'Improve',
    simplify: 'Simplify',
    expand: 'Expand',
    formal: 'Formal',
    casual: 'Casual',
    optimizing: 'Optimizing...',
    optimizedResult: 'Optimized Result',
    copyResult: 'Copy',
    replaceOriginal: 'Replace Original',
    textOptimizerTitle: 'Text Optimizer',
    optimizeTarget: 'Optimize Target',
    content: 'Content',
    title: 'Title',
    optimizationMethod: 'Optimization Method',
    optimize: 'Optimize',
    funny: 'Funny',
    humor: 'Humor',
    blog: 'Blog',
    media: 'Social Media',
    customOptimization: 'Custom Optimization',
    addCustomOptimization: 'Add Custom Optimization',
    optimizationName: 'Name',
    promptTemplate: 'Prompt',
    insertIntoPage: 'Insert to Page',
    optimizedText: 'Optimized Text',
    textOptimizerInstructions: 'AI-assisted content creation',
    copiedToClipboard: 'Copied to clipboard',
    characterSelected: 'characters selected',
    pleaseSelectText: 'Please select text on the page first',

    // Text Generation
    textGenerator: 'Text Generator',
    selectType: 'Select Type',
    article: 'Article',
    summary: 'Summary',
    email: 'Email',
    social: 'Social Media',
    custom: 'Custom',
    generate: 'Generate',
    generating: 'Generating...',
    textGeneratorTitle: 'Generate Text Content',
    generateType: 'Generate Type',
    inputRequirements: 'Input requirements',
    generateTextButton: 'Generate Text',
    generateResult: 'Generated Result',
    insertPage: 'Insert to Page',
    articleType: 'Article',
    summaryType: 'Summary',
    emailType: 'Email',
    socialType: 'Social Media',
    customType: 'Custom',
    generateTextInstructions: 'AI-assisted content generation',

    // Network Analysis
    networkMonitor: 'Network Analysis',
    startRecording: 'Start Recording',
    stopRecording: 'Stop Recording',
    clearData: 'Clear',
    aiAnalyze: 'AI Analyze',
    analyzing: 'Analyzing...',
    totalRequests: 'Total Requests',
    successRequests: 'Success',
    failedRequests: 'Failed',
    totalSize: 'Total Size',
    filterUrl: 'Filter URL...',
    showFailed: 'Failed',
    networkAnalyzerTitle: 'Network Analysis',
    mediaSize: 'Media',
    recording: 'Recording',
    clear: 'Clear',
    aiModel: 'AI Model',
    filterUrlPlaceholder: 'Filter URL...',
    failedOnly: 'Failed',
    hideResult: 'Hide',
    networkInstructions: 'No network request data',
    noNetworkRequests: 'No network request data',
    recordingStopped: 'Recording stopped',

    // Resource Analysis
    resourceAnalyzer: 'Resource Analysis',
    cssResources: 'CSS',
    jsResources: 'JS',
    slowConnections: 'Slow',
    slowThreshold: 'Slow Threshold',
    totalResources: 'Total Resources',
    cssSize: 'CSS Size',
    jsSize: 'JS Size',
    rescan: 'Rescan',
    resourceAnalyzerTitle: 'Resource Analysis',
    css: 'CSS',
    js: 'JS',
    slow: 'Slow',
    rescanPage: 'Rescan',
    exportTxt: 'Export TXT',
    resourceInstructions: 'CSS/JS references and slow connection detection',
    noSlowRequests: 'No slow requests',
    noCssResources: 'No CSS resources',
    noJsResources: 'No JS resources',

    // Language
    language: 'Language',
    chinese: 'Chinese',
    chineseTraditional: 'Traditional Chinese',
    english: 'English',
    french: 'French',
    spanish: 'Spanish',

    // New Features
    adminSniffer: 'Admin Address Sniffer',
    adminSnifferDesc: 'Analyze backend login/database addresses',
    securityAnalyzer: 'Page Security Analysis',
    securityAnalyzerDesc: 'Detect XSS/CSRF/sensitive info leaks',
    urlDecoder: 'URL Decoder',
    urlDecoderDesc: 'Base64/URL encoded link restoration',
    emailHeaderParser: 'Email Header Parser',
    emailHeaderParserDesc: 'Analyze sender/SPF/DKIM verification',
    domainLookup: 'Domain Lookup',
    domainLookupDesc: 'Query DNS records/Whois info',
    whoisLookup: 'Whois Lookup',
    whoisLookupDesc: 'Query detailed domain registration info',
    dataParser: 'Data Parser',
    dataParserDesc: 'JSON/XML parsing and conversion',
    uploadFile: 'Click to upload JSON or XML file',
    dragDropHint: 'Drag and drop files here',
    rows: 'rows',
    columns: 'columns',
    dataPreview: 'Data Preview',
    moreColumns: 'more',
    showingFirst100: 'Showing first 100 of {count} rows',
    features: 'Features',
    featureJsonXml: 'Support parsing JSON and XML files',
    featureFlatten: 'Auto extract and flatten data to table',
    featureDownload: 'Download as CSV, XLSX, or JSON',
    featureCopy: 'Copy parsed data to clipboard',
    jsonParseError: 'JSON parse failed',
    xmlParseError: 'XML parse failed',
    unsupportedFormat: 'Unsupported file format',
    copy: 'Copy',

    // Content Extraction
    contentExtractor: 'Content Extractor',
    contentExtractorDesc: 'Extract page element content',
    contentExtractorTitle: 'Content Extractor',
    enterSelectionMode: 'Enter Selection Mode',
    startSelectElement: 'Start Selecting Element',
    selecting: 'Selecting...',
    selectingElement: 'Select Element',
    supportedExtract: 'Supported extraction',
    elementIdClass: 'Element ID and Class',
    parentElementInfo: 'Parent Element Info',
    autoGenerateSelector: 'Auto-generate recommended selector',
    detectDynamicContent: 'Detect dynamic content',
    selectedElement: 'Selected Element',
    tag: 'Tag',
    elementId: 'ID',
    elementClass: 'Class',
    parentTag: 'Parent Tag',
    parentId: 'Parent ID',
    parentClass: 'Parent Class',
    recommendedSelector: 'Recommended Selector',
    dynamicContentWarning: 'Content is dynamically generated, cannot extract directly',
    parentElements: 'Parent Elements',
    reSelect: 'Re-select',
    extracting: 'Extracting...',
    extractContent: 'Extract Content',
    aiIntelligentExtract: 'AI Intelligent Extract',
    aiExtract: 'AI Extract',
    aiAnalyzingElement: 'AI is analyzing elements and generating best extraction plan',
    extractResult: 'Extract Result',
    recommendedCode: 'Recommended Code',
    contentExtractorInstructions: 'Click on page elements to extract',

    // Video Sniffer
    videoSniffer: 'Video Address Sniffer',
    videoSnifferDesc: 'Get page video real addresses',
    videoSnifferTitle: 'Video Address Sniffer',
    sniffing: 'Sniffing...',
    reSniff: 'Re-sniff',
    videoCount: 'Videos',
    videoTips: 'Video Tips',
    youtubeTips: 'YouTube Video Tips',
    bilibiliTips: 'Bilibili Video Tips',
    videoEncrypted: 'YouTube video address is encrypted',
    recommendYtDlp: 'Recommended: use yt-dlp to download',
    ytDlpInstall: 'Install command',
    paidAgeRestricted: 'Paid/age-restricted videos require Cookie',
    alternativeSolution: 'Alternative solution',
    dashStream: 'DASH streaming',
    flvFormat: 'FLV format',
    videoTag: 'video tag',
    scriptTag: 'script tag',
    networkRequest: 'network request',
    videoInstructions: 'Auto-scan video resources in page',

    // Link Analyzer
    linkAnalyzer: 'Link Analyzer',
    linkAnalyzerDesc: 'Batch analyze link validity',
    linkAnalyzerTitle: 'External Link Analysis',
    externalLinks: 'External Links',
    domains: 'Domains',
    distributionChart: 'Distribution',
    networkChart: 'Network',
    aiIntelligentAnalysis: 'AI Intelligent Analysis',
    externalLinkList: 'External Link List',
    moreExternalLinks: 'more external links',
    linkAnalyzerInstructions: 'Batch analyze link validity',
    externalLinkAnalysis: 'External Link Analysis',
    externalLinkTotal: 'External Link Total',
    domainCount: 'Domain Count',
    refreshAnalysis: 'Refresh Analysis',

    // Page Info
    pageInfo: 'Page Info',
    pageInfoDesc: 'View current page details',
    pageInfoTitle: 'Page Info',
    basicInfo: 'Basic Info',
    screen: 'Screen',
    device: 'Device',
    screenResolution: 'Screen Resolution',
    viewportSize: 'Viewport Size',
    onlineStatus: 'Online Status',
    online: 'Online',
    offline: 'Offline',
    networkType: 'Network Type',
    platform: 'Platform',
    cpuCores: 'CPU Cores',
    deviceMemory: 'Device Memory',
    doNotTrack: 'Do Not Track',
    userAgent: 'UserAgent',
    referrer: 'Referrer',
    cookies: 'Cookies',
    pageInfoInstructions: 'Get current page details',

    // Page Analysis
    pageAnalysisTitle: 'Page Analysis',
    startAnalysis: 'Start Analysis',
    analysisResult: 'Analysis Result',
    pageAnalysisInstructions: 'Click "Start Analysis" to analyze current page with AI',

    // Domain Lookup
    domainLookupTitle: 'Domain Lookup',
    inputDomain: 'Enter domain (e.g. example.com)',
    query: 'Query',
    querying: 'Querying...',
    dnsProvider: 'DNS Provider',
    dnsAuto: 'Auto',
    dnsAliyun: 'Aliyun',
    dnsDnspod: 'Tencent DNSPod',
    dnsGoogle: 'Google',
    recordType: 'Record Type',
    recordAll: 'All',
    recordA: 'A',
    recordAAAA: 'AAAA',
    recordCNAME: 'CNAME',
    recordMX: 'MX',
    recordTXT: 'TXT',
    recordNS: 'NS',
    recordSOA: 'SOA',
    recordPTR: 'PTR',
    reverseLookup: 'Reverse Lookup',
    records: 'records',
    registrar: 'Registrar',
    registrationDate: 'Registration Date',
    expirationDate: 'Expiration Date',
    updatedDate: 'Updated Date',
    nameServers: 'Name Servers',
    dnsServers: 'DNS Servers',
    domainStatus: 'Domain Status',
    registrantInfo: 'Registrant Info',
    contactInfo: 'Contact Info',
    adminContact: 'Admin Contact',
    techContact: 'Tech Contact',
    billingContact: 'Billing Contact',
    organization: 'Organization',
    country: 'Country',
    state: 'State',
    city: 'City',
    reverseDnsResult: 'Reverse DNS Result',
    noReverseDns: 'No reverse DNS records found',
    invalidIp: 'Please enter a valid IP address',
    noDnsRecords: 'No DNS records found',
    queryFailed: 'Query failed',
    usageInstructions: 'Usage Instructions',
    supportedRecords: 'Supported record types',
    autoGetCurrentPage: 'Auto-get current page domain',
    manualInputSupported: 'Support manual input of any domain',

    // Whois Lookup
    whoisQueryTitle: 'Whois Lookup',
    refreshCurrentPage: 'Refresh current page domain',
    rawData: 'Raw Data',
    showRawData: 'Show Raw Data',
    hideRawData: 'Hide Raw Data',
    domainRegistration: 'Domain Registration',
    websiteRanking: 'Website Ranking',
    baiduWeight: 'Baidu Weight',
    alexaRank: 'Alexa',
    domestic: 'Domestic',
    international: 'International',
    daysUntilExpiry: 'Days Until Expiry',
    expired: 'Expired',
    expiresToday: 'Expires today',
    registrarInfo: 'Registrar Info',
    registrationInfo: 'Registration Info',
    expirationInfo: 'Expiration Info',
    updateInfo: 'Update Info',
    whoisInstructions: 'Usage Instructions',
    whoisDescription: 'Query domain registration info',
    autoFetchCurrentPage: 'Auto-fetch current page domain',

    // Email Header Parser
    emailHeaderTitle: 'Email Header Parser',
    pasteEmailHeaders: 'Paste email headers',
    parse: 'Parse',
    paste: 'Paste',
    debugMode: 'Debug Mode',
    debugModeOn: 'Debug Mode (On)',
    startDebugAnalysis: 'Start Debug Analysis',
    emailHeaderTip: 'Tip: Get email headers from email details view',
    securityAnalysis: 'Security Analysis',
    lowRisk: 'Low Risk',
    mediumRisk: 'Medium Risk',
    highRisk: 'High Risk',
    noSecurityIssues: 'No obvious security issues found',
    errorIssues: 'Error Issues',
    warnings: 'Warnings',
    information: 'Information',
    timingAnalysis: 'Timing Analysis',
    sentTime: 'Sent Time',
    serverDelay: 'Server Delay',
    emailRoute: 'Email Route',
    hops: 'hops',
    discoveredIps: 'Discovered IP Addresses',
    statistics: 'Statistics',
    totalHeaders: 'Total Headers',
    receivedCount: 'Received Count',
    hasReplyTo: 'Has Reply-To',
    hasReturnPath: 'Has Return-Path',
    contentTypeLabel: 'Content-Type',
    exportData: 'Export',
    copyDebugData: 'Copy Debug Data',
    senderInfo: 'Sender Info',
    recipientInfo: 'Recipient Info',
    emailInfo: 'Email Info',
    authResults: 'Authentication Results',
    routeInfo: 'Route Info',
    contentInfo: 'Content Info',
    antiSpam: 'Anti-Spam/Security',
    otherInfo: 'Other Info',
    emailHeaderInstructions: 'Parse email headers and verify sender authenticity',

    // URL Decoder
    urlDecoderTitle: 'URL Decoder',
    reAnalyze: 'Re-analyze',
    analyzingPageUrls: 'Analyzing encoded links in page...',
    inputDecodeString: 'Enter URL or encoded string to decode',
    decode: 'Decode',
    validDecoded: 'Valid Decoded',
    partialDecoded: 'Partially Decoded',
    total: 'Total',
    original: 'Original',
    decodedResult: 'Decoded Result',
    urlDecoderInstructions: 'Auto-scan encoded links in page',

    // Security Analyzer
    securityAnalyzerTitle: 'Page Security Analysis',
    analyzingSecurity: 'Analyzing page security...',
    riskLevel: 'Risk Level',
    aiAnalysis: 'AI Analysis',
    aiAnalyzing: 'AI Analyzing...',
    aiAnalysisResult: 'AI Analysis Result',
    viewRecommendation: 'View Details',
    detail: 'Details',
    recommendation: 'Recommendation',
    securityInstructions: 'Auto-detect page security risks',

    // Common buttons and labels
    refresh: 'Refresh',
    analyze: 'Analyze',
    exportJson: 'Export JSON',
    export: 'Export',
    hide: 'Hide',
    show: 'Show',
    viewDetails: 'View Details',
    copyToClipboard: 'Copy to Clipboard',
    copied: 'Copied',
    noData: 'No Data',

    // Input hints
    inputPlaceholder: 'Please enter...',
    searchPlaceholder: 'Search...',
    selectOption: 'Please select',

    // Status messages
    successMessage: 'Operation successful',
    errorMessage: 'Operation failed',
    warningMessage: 'Warning',
    infoMessage: 'Info',
    confirmAction: 'Confirm Action',

    // Common
    back: 'Back',
    forward: 'Forward',
    closeSidebar: 'Close Sidebar',
    openSidebar: 'Open Sidebar',
    about: 'About',
    help: 'Help',
    version: 'Version',
    sponsor: 'Sponsor',
    sponsorTitle: 'Sponsor Developer',
    sponsorSubtitle: 'If this tool has been helpful, please consider sponsoring to support continued development',
    trc20: 'TRC20/USDT',
    paypal: 'PayPal',
    wechat: 'WeChat',
    trc20Address: 'TPyLfYoN2oXBHfJtdX6jwS2PXB8xkA5XHu',
    paypalEmail: '10853913@qq.com',
    wechatId: 'xpcustomer',
    copyAddress: 'Copy Address',
    addressCopied: 'Address copied',
    modelConfig: 'Model Configuration',
    pluginIcon: 'Plugin Icon',
    changeIcon: 'Change Icon',
    iconSuggestion: 'Recommended size: 128x128, max 200KB',
  },

  'fr': {
    // Général
    confirm: 'Confirmer',
    cancel: 'Annuler',
    save: 'Enregistrer',
    delete: 'Supprimer',
    close: 'Fermer',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',

    // Interface principale
    aiAssistant: '小铭助手',
    sidebarMode: 'Mode panneau',
    analyzePage: 'Analyser la page',
    analyzePageDesc: 'Extraire le contenu pour analyse IA',
    optimizeText: 'Optimiser le texte',
    optimizeTextDesc: 'Optimiser ou réécrire le texte sélectionné',
    generateText: 'Générer du texte',
    generateTextDesc: 'Générer nouveau texte selon les besoins',
    networkAnalysis: 'Analyse réseau',
    networkAnalysisDesc: 'Surveiller les requêtes réseau',
    resourceAnalysis: 'Analyse des ressources',
    resourceAnalysisDesc: 'Références CSS/JS et détection lente',
    settings: 'Paramètres',

    // Raccourcis
    shortcuts: 'Raccourcis',

    // Page des paramètres
    modelSettings: 'Paramètres du modèle',
    addModel: 'Ajouter un modèle',
    modelName: 'Nom du modèle',
    modelEndpoint: 'Point de terminaison API',
    apiKey: 'Clé API',
    authType: "Type d'authentification",
    defaultModel: 'Modèle par défaut',
    testConnection: 'Tester la connexion',
    connectionSuccess: 'Connexion réussie',
    connectionFailed: 'Échec de la connexion',

    // Optimisation de texte
    textOptimizer: 'Optimiseur de texte',
    selectModel: 'Sélectionner le modèle',
    inputMethod: "Méthode d'entrée",
    manual: 'Entrée manuelle',
    selectedContent: 'Contenu sélectionné',
    noSelection: 'Aucun',
    inputText: 'Entrez le texte à optimiser',
    originalText: 'Texte original',
    optimizeType: "Type d'optimisation",
    improve: 'Améliorer',
    simplify: 'Simplifier',
    expand: 'Développer',
    formal: 'Formel',
    casual: 'Décontracté',
    optimizing: 'Optimisation...',
    optimizedResult: 'Résultat optimisé',
    copyResult: 'Copier',
    replaceOriginal: "Remplacer l'original",
    textOptimizerTitle: 'Optimiseur de texte',
    optimizeTarget: 'Cible optimisation',
    content: 'Contenu',
    title: 'Titre',
    optimizationMethod: "Méthode d'optimisation",
    optimize: 'Optimiser',
    funny: 'Drôle',
    humor: 'Humour',
    blog: 'Blog',
    media: 'Réseaux sociaux',
    customOptimization: 'Optimisation personnalisée',
    addCustomOptimization: 'Ajouter optimisation personnalisée',
    optimizationName: 'Nom',
    promptTemplate: 'Prompt',
    insertIntoPage: 'Insérer page',
    optimizedText: 'Texte optimisé',
    textOptimizerInstructions: 'Création de contenu assistée par IA',
    copiedToClipboard: 'Copié dans le presse-papiers',
    characterSelected: 'caractères sélectionnés',
    pleaseSelectText: "Veuillez d'abord sélectionner du texte sur la page",

    // Génération de texte
    textGenerator: 'Générateur de texte',
    selectType: 'Sélectionner le type',
    article: 'Article',
    summary: 'Résumé',
    email: 'E-mail',
    social: 'Réseaux sociaux',
    custom: 'Personnalisé',
    generate: 'Générer',
    generating: 'Génération...',
    textGeneratorTitle: 'Générer contenu texte',
    generateType: 'Type de génération',
    inputRequirements: 'Saisir exigences',
    generateTextButton: 'Générer texte',
    generateResult: 'Résultat généré',
    insertPage: 'Insérer page',
    articleType: 'Article',
    summaryType: 'Résumé',
    emailType: 'Email',
    socialType: 'Réseaux sociaux',
    customType: 'Personnalisé',
    generateTextInstructions: 'Génération de contenu assistée par IA',

    // Analyse réseau
    networkMonitor: 'Analyse réseau',
    startRecording: "Démarrer l'enregistrement",
    stopRecording: "Arrêter l'enregistrement",
    clearData: 'Effacer',
    aiAnalyze: 'Analyse IA',
    analyzing: 'Analyse...',
    totalRequests: 'Total des requêtes',
    successRequests: 'Succès',
    failedRequests: 'Échecs',
    totalSize: 'Taille totale',
    filterUrl: 'Filtrer URL...',
    showFailed: 'Échecs',
    networkAnalyzerTitle: 'Analyse réseau',
    mediaSize: 'Média',
    recording: 'Enregistrement',
    clear: 'Effacer',
    aiModel: "Modèle d'IA",
    filterUrlPlaceholder: 'Filtrer URL...',
    failedOnly: 'Échecs',
    hideResult: 'Masquer',
    networkInstructions: 'Aucune donnée de requête réseau',
    noNetworkRequests: 'Aucune donnée de requête réseau',
    recordingStopped: 'Enregistrement arrêté',

    // Analyse des ressources
    resourceAnalyzer: 'Analyse des ressources',
    cssResources: 'CSS',
    jsResources: 'JS',
    slowConnections: 'Lent',
    slowThreshold: 'Seuil lent',
    totalResources: 'Total des ressources',
    cssSize: 'Taille CSS',
    jsSize: 'Taille JS',
    rescan: 'Rescanner',
    resourceAnalyzerTitle: 'Analyse ressources',
    css: 'CSS',
    js: 'JS',
    slow: 'Lent',
    rescanPage: 'Rescanner',
    exportTxt: 'Exporter TXT',
    resourceInstructions: 'Références CSS/JS et détection connexions lentes',
    noSlowRequests: 'Aucune requête lente',
    noCssResources: 'Aucune ressource CSS',
    noJsResources: 'Aucune ressource JS',

    // Langue
    language: 'Langue',
    chinese: 'Chinois',
    chineseTraditional: 'Chinois traditionnel',
    english: 'Anglais',
    french: 'Français',
    spanish: 'Espagnol',

    // Nouvelles fonctionnalités
    adminSniffer: 'Détecteur admin',
    adminSnifferDesc: 'Analyser les adresses de connexion backend',
    securityAnalyzer: 'Analyse sécurité',
    securityAnalyzerDesc: 'Détecter XSS/CSRF/fuites infos sensibles',
    urlDecoder: 'Décodeur URL',
    urlDecoderDesc: 'Restaurer liens encodés Base64/URL',
    emailHeaderParser: 'Analyse headers email',
    emailHeaderParserDesc: 'Analyser expéditeur/SPF/DKIM',
    domainLookup: 'Recherche domaine',
    domainLookupDesc: 'Requêter DNS/Whois',
    whoisLookup: 'Recherche Whois',
    whoisLookupDesc: "Requêter les infos d'enregistrement du domaine",
    dataParser: 'Analyseur de données',
    dataParserDesc: 'Analyse et conversion JSON/XML',
    uploadFile: 'Cliquez pour télécharger un fichier JSON ou XML',
    dragDropHint: 'Glisser-déposer des fichiers ici',
    rows: 'lignes',
    columns: 'colonnes',
    dataPreview: "Aperçu des données",
    moreColumns: 'plus',
    showingFirst100: 'Affichage des 100 premières lignes sur {count}',
    features: 'Fonctionnalités',
    featureJsonXml: 'Support analyse fichiers JSON et XML',
    featureFlatten: 'Extraction et mise à plat auto des données',
    featureDownload: 'Télécharger en CSV, XLSX ou JSON',
    featureCopy: "Copier les données analysées",
    jsonParseError: 'Échec analyse JSON',
    xmlParseError: 'Échec analyse XML',
    unsupportedFormat: 'Format non pris en charge',
    copy: 'Copier',

    // Extraction contenu
    contentExtractor: 'Extracteur contenu',
    contentExtractorDesc: "Extraire le contenu des éléments",
    contentExtractorTitle: 'Extracteur contenu',
    enterSelectionMode: 'Entrer mode sélection',
    startSelectElement: 'Commencer sélection élément',
    selecting: 'Sélection...',
    selectingElement: 'Sélectionner élément',
    supportedExtract: 'Extraction supportée',
    elementIdClass: 'ID et Classe élément',
    parentElementInfo: 'Info élément parent',
    autoGenerateSelector: 'Générer auto sélecteur recommandé',
    detectDynamicContent: 'Détecter contenu dynamique',
    selectedElement: 'Élément sélectionné',
    tag: 'Balise',
    elementId: 'ID',
    elementClass: 'Classe',
    parentTag: 'Balise parente',
    parentId: 'ID parent',
    parentClass: 'Classe parente',
    recommendedSelector: 'Sélecteur recommandé',
    dynamicContentWarning: 'Contenu généré dynamiquement, extraction directe impossible',
    parentElements: 'Éléments parents',
    reSelect: 'Resélectionner',
    extracting: 'Extraction...',
    extractContent: "Extraire le contenu",
    aiIntelligentExtract: 'Extraction IA intelligente',
    aiExtract: 'Extraction IA',
    aiAnalyzingElement: "IA analyse les éléments et génère le meilleur plan d'extraction",
    extractResult: "Résultat d'extraction",
    recommendedCode: 'Code recommandé',
    contentExtractorInstructions: 'Cliquez sur les éléments de la page pour extraire',

    // Détecteur vidéo
    videoSniffer: 'Détecteur vidéo',
    videoSnifferDesc: "Obtenir les vraies adresses vidéo",
    videoSnifferTitle: 'Détecteur adresse vidéo',
    sniffing: 'Détection...',
    reSniff: 'Redétecter',
    videoCount: 'Vidéos',
    videoTips: 'Astuces vidéo',
    youtubeTips: 'Astuces vidéo YouTube',
    bilibiliTips: 'Astuces vidéo Bilibili',
    videoEncrypted: 'Adresse vidéo YouTube chiffrée',
    recommendYtDlp: 'Recommandé: utiliser yt-dlp pour télécharger',
    ytDlpInstall: "Commande d'installation",
    paidAgeRestricted: 'Vidéos payantes/limitées par âge requièrent Cookie',
    alternativeSolution: 'Solution alternative',
    dashStream: 'Streaming DASH',
    flvFormat: 'Format FLV',
    videoTag: 'balise video',
    scriptTag: 'balise script',
    networkRequest: 'requête réseau',
    videoInstructions: 'Détection auto des ressources vidéo dans la page',

    // Analyseur liens
    linkAnalyzer: 'Analyseur liens',
    linkAnalyzerDesc: 'Analyser validité des liens',
    linkAnalyzerTitle: 'Analyse liens externes',
    externalLinks: 'Liens externes',
    domains: 'Domaines',
    distributionChart: 'Distribution',
    networkChart: 'Réseau',
    aiIntelligentAnalysis: 'Analyse IA intelligente',
    externalLinkList: 'Liste liens externes',
    moreExternalLinks: 'autres liens externes',
    linkAnalyzerInstructions: 'Analyser validité des liens',
    externalLinkAnalysis: 'Analyse liens externes',
    externalLinkTotal: 'Total liens externes',
    domainCount: 'Nb domaines',
    refreshAnalysis: 'Actualiser analyse',

    // Info page
    pageInfo: 'Info page',
    pageInfoDesc: 'Voir les détails de la page',
    pageInfoTitle: 'Info page',
    basicInfo: 'Info basiques',
    screen: 'Écran',
    device: 'Appareil',
    screenResolution: 'Résolution écran',
    viewportSize: 'Taille viewport',
    onlineStatus: 'Statut en ligne',
    online: 'En ligne',
    offline: 'Hors ligne',
    networkType: 'Type réseau',
    platform: 'Plateforme',
    cpuCores: 'Cœurs CPU',
    deviceMemory: 'Mémoire appareil',
    doNotTrack: 'Ne pas suivre',
    userAgent: 'UserAgent',
    referrer: 'Referrer',
    cookies: 'Cookies',
    pageInfoInstructions: 'Voir les détails de la page actuelle',

    // Analyse page
    pageAnalysisTitle: 'Analyse page',
    startAnalysis: 'Démarrer analyse',
    analysisResult: "Résultat d'analyse",
    pageAnalysisInstructions: 'Cliquez sur "Démarrer analyse" pour analyser la page avec IA',

    // Recherche domaine
    domainLookupTitle: 'Recherche domaine',
    inputDomain: 'Entrer domaine (ex: example.com)',
    query: 'Rechercher',
    querying: 'Recherche...',
    dnsProvider: 'Fournisseur DNS',
    dnsAuto: 'Auto',
    dnsAliyun: 'Aliyun',
    dnsDnspod: 'Tencent DNSPod',
    dnsGoogle: 'Google',
    recordType: 'Type denregistrement',
    recordAll: 'Tous',
    recordA: 'A',
    recordAAAA: 'AAAA',
    recordCNAME: 'CNAME',
    recordMX: 'MX',
    recordTXT: 'TXT',
    recordNS: 'NS',
    recordSOA: 'SOA',
    recordPTR: 'PTR',
    reverseLookup: 'Recherche inverse',
    records: 'enregistrements',
    registrar: 'Registrar',
    registrationDate: 'Date inscription',
    expirationDate: "Date d'expiration",
    updatedDate: 'Date mise à jour',
    nameServers: 'Serveurs DNS',
    dnsServers: 'Serveurs DNS',
    domainStatus: 'Statut domaine',
    registrantInfo: 'Info registrant',
    contactInfo: 'Info contact',
    adminContact: 'Contact admin',
    techContact: 'Contact tech',
    billingContact: 'Contact facturation',
    organization: 'Organisation',
    country: 'Pays',
    state: 'Région',
    city: 'Ville',
    reverseDnsResult: 'Résultat DNS inverse',
    noReverseDns: 'Aucun enregistrement DNS inverse trouvé',
    invalidIp: "Veuillez entrer une adresse IP valide",
    noDnsRecords: 'Aucun enregistrement DNS trouvé',
    queryFailed: 'Échec requête',
    usageInstructions: "Instructions d'utilisation",
    supportedRecords: "Types d'enregistrements supportés",
    autoGetCurrentPage: 'Auto-obtenir domaine page actuelle',
    manualInputSupported: 'Support saisie manuelle de tout domaine',

    // Recherche Whois
    whoisQueryTitle: 'Recherche Whois',
    refreshCurrentPage: 'Actualiser domaine page',
    rawData: 'Données brutes',
    showRawData: 'Afficher données brutes',
    hideRawData: 'Masquer données brutes',
    domainRegistration: 'Inscription domaine',
    websiteRanking: 'Classement site',
    baiduWeight: 'Poids Baidu',
    alexaRank: 'Alexa',
    domestic: 'National',
    international: 'International',
    daysUntilExpiry: "Jours avant expiration",
    expired: 'Expiré',
    expiresToday: "Expire aujourd'hui",
    registrarInfo: 'Info registrar',
    registrationInfo: "Info d'inscription",
    expirationInfo: "Info d'expiration",
    updateInfo: 'Info mise à jour',
    whoisInstructions: "Instructions d'utilisation",
    whoisDescription: "Requêter les infos d'enregistrement du domaine",
    autoFetchCurrentPage: 'Auto-extraire domaine page',

    // Analyseur headers email
    emailHeaderTitle: 'Analyseur headers email',
    pasteEmailHeaders: "Coller les headers d'email",
    parse: 'Analyser',
    paste: 'Coller',
    debugMode: 'Mode Debug',
    debugModeOn: 'Mode Debug (On)',
    startDebugAnalysis: 'Démarrer analyse Debug',
    emailHeaderTip: "Astuce: Obtenez les headers depuis les détails de l'email",
    securityAnalysis: 'Analyse sécurité',
    lowRisk: 'Risque faible',
    mediumRisk: 'Risque moyen',
    highRisk: 'Risque élevé',
    noSecurityIssues: 'Aucun problème de sécurité evident trouvé',
    errorIssues: 'Erreurs',
    warnings: 'Avertissements',
    information: 'Informations',
    timingAnalysis: 'Analyse temporelle',
    sentTime: 'Heure envoi',
    serverDelay: 'Délai serveur',
    emailRoute: 'Route email',
    hops: 'sauts',
    discoveredIps: 'Adresses IP découvertes',
    statistics: 'Statistiques',
    totalHeaders: 'Total headers',
    receivedCount: 'Nb received',
    hasReplyTo: 'A Reply-To',
    hasReturnPath: 'A Return-Path',
    contentTypeLabel: 'Content-Type',
    exportData: 'Exporter',
    copyDebugData: "Copier données Debug",
    senderInfo: 'Info expéditeur',
    recipientInfo: 'Info destinataire',
    emailInfo: 'Info email',
    authResults: "Résultats d'authentification",
    routeInfo: 'Info route',
    contentInfo: 'Info contenu',
    antiSpam: 'Anti-spam/Sécurité',
    otherInfo: 'Autres infos',
    emailHeaderInstructions: 'Analyser headers email et vérifier authenticité expéditeur',

    // Décodeur URL
    urlDecoderTitle: 'Décodeur URL',
    reAnalyze: 'Réanalyser',
    analyzingPageUrls: 'Analyse des liens encodés...',
    inputDecodeString: 'Entrer URL ou chaîne encodée à décoder',
    decode: 'Décoder',
    validDecoded: 'Décodage valide',
    partialDecoded: 'Partiellement décodé',
    total: 'Total',
    original: 'Original',
    decodedResult: 'Résultat décodé',
    urlDecoderInstructions: 'Analyse auto des liens encodés dans la page',

    // Analyseur sécurité
    securityAnalyzerTitle: 'Analyse sécurité page',
    analyzingSecurity: 'Analyse sécurité page...',
    riskLevel: 'Niveau de risque',
    aiAnalysis: 'Analyse IA',
    aiAnalyzing: 'Analyse IA...',
    aiAnalysisResult: "Résultat d'analyse IA",
    viewRecommendation: 'Voir détails',
    detail: 'Détails',
    recommendation: 'Recommandation',
    securityInstructions: 'Détection auto des risques de sécurité page',

    // Boutons et étiquettes courants
    refresh: 'Actualiser',
    analyze: 'Analyser',
    exportJson: 'Exporter JSON',
    export: 'Exporter',
    hide: 'Masquer',
    show: 'Afficher',
    viewDetails: 'Voir détails',
    copyToClipboard: 'Copier',
    copied: 'Copié',
    noData: 'Aucune donnée',

    // Indications de saisie
    inputPlaceholder: "Saisir...",
    searchPlaceholder: 'Rechercher...',
    selectOption: 'Sélectionner',

    // Messages d'état
    successMessage: 'Opération réussie',
    errorMessage: 'Opération échouée',
    warningMessage: 'Avertissement',
    infoMessage: 'Info',
    confirmAction: 'Confirmer action',

    // Commun
    back: 'Retour',
    forward: 'Avancer',
    closeSidebar: 'Fermer panneau latéral',
    openSidebar: 'Ouvrir panneau latéral',
    about: 'À propos',
    help: 'Aide',
    version: 'Version',
    sponsor: 'Patrociner',
    sponsorTitle: 'Patrociner développeur',
    sponsorSubtitle: "Si cet outil vous a été utile, pensez à sponsoriser pour soutenir le développement continu",
    trc20: 'TRC20/USDT',
    paypal: 'PayPal',
    wechat: 'WeChat',
    trc20Address: 'TPyLfYoN2oXBHfJtdX6jwS2PXB8xkA5XHu',
    paypalEmail: '10853913@qq.com',
    wechatId: 'xpcustomer',
    copyAddress: "Copier l'adresse",
    addressCopied: 'Adresse copiée',
    modelConfig: 'Configuration modèle',
    pluginIcon: 'Icône plugin',
    changeIcon: "Changer l'icône",
    iconSuggestion: 'Taille suggérée: 128x128, max 200KB',
  },

  'es': {
    // General
    confirm: 'Confirmar',
    cancel: 'Cancelar',
    save: 'Guardar',
    delete: 'Eliminar',
    close: 'Cerrar',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',

    // Interfaz principal
    aiAssistant: '小铭助手',
    sidebarMode: 'Modo panel lateral',
    analyzePage: 'Analizar página',
    analyzePageDesc: 'Extraer contenido para análisis IA',
    optimizeText: 'Optimizar texto',
    optimizeTextDesc: 'Optimizar o reescribir texto seleccionado',
    generateText: 'Generar texto',
    generateTextDesc: 'Generar nuevo texto según requisitos',
    networkAnalysis: 'Análisis de red',
    networkAnalysisDesc: 'Monitorear solicitudes de red',
    resourceAnalysis: 'Análisis de recursos',
    resourceAnalysisDesc: 'Referencias CSS/JS y detección lenta',
    settings: 'Configuración',

    // Atajos
    shortcuts: 'Atajos',

    // Página de configuración
    modelSettings: 'Configuración del modelo',
    addModel: 'Agregar modelo',
    modelName: 'Nombre del modelo',
    modelEndpoint: 'Punto final API',
    apiKey: 'Clave API',
    authType: 'Tipo de autenticación',
    defaultModel: 'Modelo predeterminado',
    testConnection: 'Probar conexión',
    connectionSuccess: 'Conexión exitosa',
    connectionFailed: 'Conexión fallida',

    // Optimización de texto
    textOptimizer: 'Optimizador de texto',
    selectModel: 'Seleccionar modelo',
    inputMethod: 'Método de entrada',
    manual: 'Entrada manual',
    selectedContent: 'Contenido seleccionado',
    noSelection: 'Ninguno',
    inputText: 'Ingrese texto para optimizar',
    originalText: 'Texto original',
    optimizeType: 'Tipo de optimización',
    improve: 'Mejorar',
    simplify: 'Simplificar',
    expand: 'Expandir',
    formal: 'Formal',
    casual: 'Casual',
    optimizing: 'Optimizando...',
    optimizedResult: 'Resultado optimizado',
    copyResult: 'Copiar',
    replaceOriginal: 'Reemplazar original',
    textOptimizerTitle: 'Optimizador texto',
    optimizeTarget: 'Objetivo optimización',
    content: 'Contenido',
    title: 'Título',
    optimizationMethod: 'Método de optimización',
    optimize: 'Optimizar',
    funny: 'Divertido',
    humor: 'Humor',
    blog: 'Blog',
    media: 'Redes sociales',
    customOptimization: 'Optimización personalizada',
    addCustomOptimization: 'Agregar optimización personalizada',
    optimizationName: 'Nombre',
    promptTemplate: 'Prompt',
    insertIntoPage: 'Insertar página',
    optimizedText: 'Texto optimizado',
    textOptimizerInstructions: 'Creación de contenido asistida por IA',
    copiedToClipboard: 'Copiado al portapapeles',
    characterSelected: 'caracteres seleccionados',
    pleaseSelectText: 'Por favor seleccione primero texto en la página',

    // Generación de texto
    textGenerator: 'Generador de texto',
    selectType: 'Seleccionar tipo',
    article: 'Artículo',
    summary: 'Resumen',
    email: 'Correo',
    social: 'Redes sociales',
    custom: 'Personalizado',
    generate: 'Generar',
    generating: 'Generando...',
    textGeneratorTitle: 'Generar contenido de texto',
    generateType: 'Tipo de generación',
    inputRequirements: 'Ingrese requisitos',
    generateTextButton: 'Generar texto',
    generateResult: 'Resultado generado',
    insertPage: 'Insertar página',
    articleType: 'Artículo',
    summaryType: 'Resumen',
    emailType: 'Correo',
    socialType: 'Redes sociales',
    customType: 'Personalizado',
    generateTextInstructions: 'Generación de contenido asistida por IA',

    // Análisis de red
    networkMonitor: 'Análisis de red',
    startRecording: 'Iniciar grabación',
    stopRecording: 'Detener grabación',
    clearData: 'Limpiar',
    aiAnalyze: 'Análisis IA',
    analyzing: 'Analizando...',
    totalRequests: 'Total de solicitudes',
    successRequests: 'Éxitos',
    failedRequests: 'Fallidos',
    totalSize: 'Tamaño total',
    filterUrl: 'Filtrar URL...',
    showFailed: 'Fallidos',
    networkAnalyzerTitle: 'Análisis de red',
    mediaSize: 'Media',
    recording: 'Grabando',
    clear: 'Limpiar',
    aiModel: 'Modelo IA',
    filterUrlPlaceholder: 'Filtrar URL...',
    failedOnly: 'Fallidos',
    hideResult: 'Ocultar',
    networkInstructions: 'Sin datos de solicitud de red',
    noNetworkRequests: 'Sin datos de solicitud de red',
    recordingStopped: 'Grabación detenida',

    // Análisis de recursos
    resourceAnalyzer: 'Análisis de recursos',
    cssResources: 'CSS',
    jsResources: 'JS',
    slowConnections: 'Lento',
    slowThreshold: 'Umbral lento',
    totalResources: 'Total de recursos',
    cssSize: 'Tamaño CSS',
    jsSize: 'Tamaño JS',
    rescan: 'Reescanear',
    resourceAnalyzerTitle: 'Análisis de recursos',
    css: 'CSS',
    js: 'JS',
    slow: 'Lento',
    rescanPage: 'Reescanear',
    exportTxt: 'Exportar TXT',
    resourceInstructions: 'Referencias CSS/JS y detección de conexiones lentas',
    noSlowRequests: 'Sin solicitudes lentas',
    noCssResources: 'Sin recursos CSS',
    noJsResources: 'Sin recursos JS',

    // Idioma
    language: 'Idioma',
    chinese: 'Chino',
    chineseTraditional: 'Chino tradicional',
    english: 'Inglés',
    french: 'Francés',
    spanish: 'Español',

    // Nuevas funciones
    adminSniffer: 'Detector admin',
    adminSnifferDesc: 'Analizar direcciones de login backend',
    securityAnalyzer: 'Análisis seguridad',
    securityAnalyzerDesc: 'Detectar XSS/CSRF/fugas info sensible',
    urlDecoder: 'Decodificador URL',
    urlDecoderDesc: 'Restaurar enlaces codificados Base64/URL',
    emailHeaderParser: 'Analizador headers email',
    emailHeaderParserDesc: 'Analizar remitente/SPF/DKIM',
    domainLookup: 'Búsqueda dominio',
    domainLookupDesc: 'Consultar DNS/Whois',
    whoisLookup: 'Búsqueda Whois',
    whoisLookupDesc: 'Consultar info detallada de registro',
    dataParser: 'Analizador de datos',
    dataParserDesc: 'Análisis y conversión JSON/XML',
    uploadFile: 'Clic para subir archivo JSON o XML',
    dragDropHint: 'Arrastrar y soltar archivos aquí',
    rows: 'filas',
    columns: 'columnas',
    dataPreview: 'Vista previa de datos',
    moreColumns: 'más',
    showingFirst100: 'Mostrando primeras 100 de {count} filas',
    features: 'Características',
    featureJsonXml: 'Soporte análisis archivos JSON y XML',
    featureFlatten: 'Extracción automática y despliegue de datos',
    featureDownload: 'Descargar como CSV, XLSX o JSON',
    featureCopy: 'Copiar datos analizados al portapapeles',
    jsonParseError: 'Error al analizar JSON',
    xmlParseError: 'Error al analizar XML',
    unsupportedFormat: 'Formato no soportado',
    copy: 'Copiar',

    // Extracción contenido
    contentExtractor: 'Extractor contenido',
    contentExtractorDesc: 'Extraer contenido de elementos',
    contentExtractorTitle: 'Extractor contenido',
    enterSelectionMode: 'Entrar modo selección',
    startSelectElement: 'Comenzar selección elemento',
    selecting: 'Seleccionando...',
    selectingElement: 'Seleccionar elemento',
    supportedExtract: 'Extracción soportada',
    elementIdClass: 'ID y Clase del elemento',
    parentElementInfo: 'Info elemento padre',
    autoGenerateSelector: 'Auto-generar selector recomendado',
    detectDynamicContent: 'Detectar contenido dinámico',
    selectedElement: 'Elemento seleccionado',
    tag: 'Etiqueta',
    elementId: 'ID',
    elementClass: 'Clase',
    parentTag: 'Etiqueta padre',
    parentId: 'ID padre',
    parentClass: 'Clase padre',
    recommendedSelector: 'Selector recomendado',
    dynamicContentWarning: 'Contenido generado dinámicamente, no se puede extraer directamente',
    parentElements: 'Elementos padres',
    reSelect: 'Reseleccionar',
    extracting: 'Extrayendo...',
    extractContent: 'Extraer contenido',
    aiIntelligentExtract: 'Extracción IA inteligente',
    aiExtract: 'Extracción IA',
    aiAnalyzingElement: 'IA está analizando elementos y generando el mejor plan de extracción',
    extractResult: 'Resultado extracción',
    recommendedCode: 'Código recomendado',
    contentExtractorInstructions: 'Haga clic en elementos de la página para extraer',

    // Detector video
    videoSniffer: 'Detector video',
    videoSnifferDesc: 'Obtener direcciones reales de video',
    videoSnifferTitle: 'Detector dirección video',
    sniffing: 'Detección...',
    reSniff: 'Redetectar',
    videoCount: 'Videos',
    videoTips: 'Tips de video',
    youtubeTips: 'Tips video YouTube',
    bilibiliTips: 'Tips video Bilibili',
    videoEncrypted: 'Dirección video YouTube está encriptada',
    recommendYtDlp: 'Recomendado: usar yt-dlp para descargar',
    ytDlpInstall: 'Comando de instalación',
    paidAgeRestricted: 'Videos pagados/restringidos por edad requieren Cookie',
    alternativeSolution: 'Solución alternativa',
    dashStream: 'Streaming DASH',
    flvFormat: 'Formato FLV',
    videoTag: 'etiqueta video',
    scriptTag: 'etiqueta script',
    networkRequest: 'solicitud de red',
    videoInstructions: 'Auto-detectar recursos de video en página',

    // Analizador enlaces
    linkAnalyzer: 'Analizador enlaces',
    linkAnalyzerDesc: 'Analizar validez de enlaces',
    linkAnalyzerTitle: 'Análisis enlaces externos',
    externalLinks: 'Enlaces externos',
    domains: 'Dominios',
    distributionChart: 'Distribución',
    networkChart: 'Red',
    aiIntelligentAnalysis: 'Análisis IA inteligente',
    externalLinkList: 'Lista enlaces externos',
    moreExternalLinks: 'más enlaces externos',
    linkAnalyzerInstructions: 'Analizar validez de enlaces en lote',
    externalLinkAnalysis: 'Análisis enlaces externos',
    externalLinkTotal: 'Total enlaces externos',
    domainCount: 'Cant dominios',
    refreshAnalysis: 'Actualizar análisis',

    // Info página
    pageInfo: 'Info página',
    pageInfoDesc: 'Ver detalles de la página',
    pageInfoTitle: 'Info página',
    basicInfo: 'Info básica',
    screen: 'Pantalla',
    device: 'Dispositivo',
    screenResolution: 'Resolución pantalla',
    viewportSize: 'Tamaño viewport',
    onlineStatus: 'Estado en línea',
    online: 'En línea',
    offline: 'Fuera de línea',
    networkType: 'Tipo de red',
    platform: 'Plataforma',
    cpuCores: 'Núcleos CPU',
    deviceMemory: 'Memoria dispositivo',
    doNotTrack: 'No rastrear',
    userAgent: 'UserAgent',
    referrer: 'Referrer',
    cookies: 'Cookies',
    pageInfoInstructions: 'Ver detalles de la página actual',

    // Análisis página
    pageAnalysisTitle: 'Análisis página',
    startAnalysis: 'Iniciar análisis',
    analysisResult: 'Resultado análisis',
    pageAnalysisInstructions: 'Haga clic en "Iniciar análisis" para analizar la página actual con IA',

    // Búsqueda dominio
    domainLookupTitle: 'Búsqueda dominio',
    inputDomain: 'Ingrese dominio (ej: example.com)',
    query: 'Consultar',
    querying: 'Consultando...',
    dnsProvider: 'Proveedor DNS',
    dnsAuto: 'Auto',
    dnsAliyun: 'Aliyun',
    dnsDnspod: 'Tencent DNSPod',
    dnsGoogle: 'Google',
    recordType: 'Tipo de registro',
    recordAll: 'Todos',
    recordA: 'A',
    recordAAAA: 'AAAA',
    recordCNAME: 'CNAME',
    recordMX: 'MX',
    recordTXT: 'TXT',
    recordNS: 'NS',
    recordSOA: 'SOA',
    recordPTR: 'PTR',
    reverseLookup: 'Búsqueda inversa',
    records: 'registros',
    registrar: 'Registrador',
    registrationDate: 'Fecha registro',
    expirationDate: 'Fecha expiración',
    updatedDate: 'Fecha actualización',
    nameServers: 'Servidores DNS',
    dnsServers: 'Servidores DNS',
    domainStatus: 'Estado dominio',
    registrantInfo: 'Info registrant',
    contactInfo: 'Info contacto',
    adminContact: 'Contacto admin',
    techContact: 'Contacto tech',
    billingContact: 'Contacto facturación',
    organization: 'Organización',
    country: 'País',
    state: 'Estado',
    city: 'Ciudad',
    reverseDnsResult: 'Resultado DNS inverso',
    noReverseDns: 'No se encontraron registros DNS inversos',
    invalidIp: 'Por favor ingrese una dirección IP válida',
    noDnsRecords: 'No se encontraron registros DNS',
    queryFailed: 'Consulta fallida',
    usageInstructions: 'Instrucciones de uso',
    supportedRecords: 'Tipos de registros soportados',
    autoGetCurrentPage: 'Auto-obtener dominio página actual',
    manualInputSupported: 'Soporta ingreso manual de cualquier dominio',

    // Búsqueda Whois
    whoisQueryTitle: 'Búsqueda Whois',
    refreshCurrentPage: 'Actualizar dominio página actual',
    rawData: 'Datos brutos',
    showRawData: 'Mostrar datos brutos',
    hideRawData: 'Ocultar datos brutos',
    domainRegistration: 'Registro dominio',
    websiteRanking: 'Ranking sitio web',
    baiduWeight: 'Peso Baidu',
    alexaRank: 'Alexa',
    domestic: 'Nacional',
    international: 'Internacional',
    daysUntilExpiry: 'Días hasta expiración',
    expired: 'Expirado',
    expiresToday: 'Expira hoy',
    registrarInfo: 'Info registrador',
    registrationInfo: 'Info registro',
    expirationInfo: 'Info expiración',
    updateInfo: 'Info actualización',
    whoisInstructions: 'Instrucciones de uso',
    whoisDescription: 'Consultar info detallada de registro del dominio',
    autoFetchCurrentPage: 'Auto-extraer dominio página actual',

    // Analizador headers email
    emailHeaderTitle: 'Analizador headers email',
    pasteEmailHeaders: 'Pegar headers de email',
    parse: 'Analizar',
    paste: 'Pegar',
    debugMode: 'Modo Debug',
    debugModeOn: 'Modo Debug (On)',
    startDebugAnalysis: 'Iniciar análisis Debug',
    emailHeaderTip: 'Tip: Obtenga los headers desde la vista de detalles del email',
    securityAnalysis: 'Análisis seguridad',
    lowRisk: 'Riesgo bajo',
    mediumRisk: 'Riesgo medio',
    highRisk: 'Riesgo alto',
    noSecurityIssues: 'No se encontraron problemas de seguridad obvios',
    errorIssues: 'Errores',
    warnings: 'Advertencias',
    information: 'Información',
    timingAnalysis: 'Análisis de tiempo',
    sentTime: 'Hora envío',
    serverDelay: 'Demora servidor',
    emailRoute: 'Ruta email',
    hops: 'saltos',
    discoveredIps: 'Direcciones IP descubiertas',
    statistics: 'Estadísticas',
    totalHeaders: 'Total headers',
    receivedCount: 'Cant received',
    hasReplyTo: 'Tiene Reply-To',
    hasReturnPath: 'Tiene Return-Path',
    contentTypeLabel: 'Content-Type',
    exportData: 'Exportar',
    copyDebugData: 'Copiar datos Debug',
    senderInfo: 'Info remitente',
    recipientInfo: 'Info destinatario',
    emailInfo: 'Info email',
    authResults: 'Resultados de autenticación',
    routeInfo: 'Info ruta',
    contentInfo: 'Info contenido',
    antiSpam: 'Anti-spam/Seguridad',
    otherInfo: 'Otra info',
    emailHeaderInstructions: 'Analizar headers email y verificar autenticidad del remitente',

    // Decodificador URL
    urlDecoderTitle: 'Decodificador URL',
    reAnalyze: 'Reanalizar',
    analyzingPageUrls: 'Analizando enlaces codificados en página...',
    inputDecodeString: 'Ingrese URL o cadena codificada para decodificar',
    decode: 'Decodificar',
    validDecoded: 'Decodificado válido',
    partialDecoded: 'Parcialmente decodificado',
    total: 'Total',
    original: 'Original',
    decodedResult: 'Resultado decodificado',
    urlDecoderInstructions: 'Auto-analizar enlaces codificados en página',

    // Analizador seguridad
    securityAnalyzerTitle: 'Análisis seguridad página',
    analyzingSecurity: 'Analizando seguridad página...',
    riskLevel: 'Nivel de riesgo',
    aiAnalysis: 'Análisis IA',
    aiAnalyzing: 'Análisis IA...',
    aiAnalysisResult: 'Resultado análisis IA',
    viewRecommendation: 'Ver detalles',
    detail: 'Detalles',
    recommendation: 'Recomendación',
    securityInstructions: 'Auto-detectar riesgos de seguridad en página',

    // Botones y etiquetas comunes
    refresh: 'Actualizar',
    analyze: 'Analizar',
    exportJson: 'Exportar JSON',
    export: 'Exportar',
    hide: 'Ocultar',
    show: 'Mostrar',
    viewDetails: 'Ver detalles',
    copyToClipboard: 'Copiar al portapapeles',
    copied: 'Copiado',
    noData: 'Sin datos',

    // Indicaciones de entrada
    inputPlaceholder: 'Ingrese...',
    searchPlaceholder: 'Buscar...',
    selectOption: 'Seleccione',

    // Mensajes de estado
    successMessage: 'Operación exitosa',
    errorMessage: 'Operación fallida',
    warningMessage: 'Advertencia',
    infoMessage: 'Info',
    confirmAction: 'Confirmar acción',

    // Común
    back: 'Volver',
    forward: 'Adelante',
    closeSidebar: 'Cerrar panel lateral',
    openSidebar: 'Abrir panel lateral',
    about: 'Acerca de',
    help: 'Ayuda',
    version: 'Versión',
    sponsor: 'Patrocinar',
    sponsorTitle: 'Patrocinar desarrollador',
    sponsorSubtitle: 'Si esta herramienta ha sido útil, considere patrocinar para apoyar el desarrollo continuo',
    trc20: 'TRC20/USDT',
    paypal: 'PayPal',
    wechat: 'WeChat',
    trc20Address: 'TPyLfYoN2oXBHfJtdX6jwS2PXB8xkA5XHu',
    paypalEmail: '10853913@qq.com',
    wechatId: 'xpcustomer',
    copyAddress: 'Copiar dirección',
    addressCopied: 'Dirección copiada',
    modelConfig: 'Configuración del modelo',
    pluginIcon: 'Icono del plugin',
    changeIcon: 'Cambiar icono',
    iconSuggestion: 'Tamaño sugerido: 128x128, max 200KB',
  },
}
