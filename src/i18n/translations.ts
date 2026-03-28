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

  // 内容提取
  contentExtractor: string
  contentExtractorDesc: string

  // 视频嗅探
  videoSniffer: string
  videoSnifferDesc: string

  // 链接分析
  linkAnalyzer: string
  linkAnalyzerDesc: string

  // 页面信息
  pageInfo: string
  pageInfoDesc: string
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

    // 内容提取
    contentExtractor: '内容提取',
    contentExtractorDesc: '提取页面指定元素内容',

    // 视频嗅探
    videoSniffer: '视频地址嗅探',
    videoSnifferDesc: '获取页面视频真实地址',

    // 链接分析
    linkAnalyzer: '链接分析',
    linkAnalyzerDesc: '批量分析链接有效性',

    // 页面信息
    pageInfo: '页面信息',
    pageInfoDesc: '查看当前页面详细信息',
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

    // 內容提取
    contentExtractor: '內容提取',
    contentExtractorDesc: '提取頁面指定元素內容',

    // 影片嗅探
    videoSniffer: '影片位址嗅探',
    videoSnifferDesc: '取得頁面影片真實位址',

    // 連結分析
    linkAnalyzer: '連結分析',
    linkAnalyzerDesc: '批量分析連結有效性',

    // 頁面資訊
    pageInfo: '頁面資訊',
    pageInfoDesc: '查看目前頁面詳細資訊',
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
    optimizeTextDesc: 'Optimize or rewrite selected text',
    generateText: 'Generate Text',
    generateTextDesc: 'Generate new text based on requirements',
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

    // Content Extraction
    contentExtractor: 'Content Extractor',
    contentExtractorDesc: 'Extract page element content',

    // Video Sniffer
    videoSniffer: 'Video Address Sniffer',
    videoSnifferDesc: 'Get page video real addresses',

    // Link Analyzer
    linkAnalyzer: 'Link Analyzer',
    linkAnalyzerDesc: 'Batch analyze link validity',

    // Page Info
    pageInfo: 'Page Info',
    pageInfoDesc: 'View current page details',
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

    // Extraction contenu
    contentExtractor: 'Extracteur contenu',
    contentExtractorDesc: "Extraire le contenu des éléments",

    // Détecteur vidéo
    videoSniffer: 'Détecteur vidéo',
    videoSnifferDesc: "Obtenir les vraies adresses vidéo",

    // Analyse liens
    linkAnalyzer: 'Analyseur liens',
    linkAnalyzerDesc: 'Analyser validité des liens',

    // Info page
    pageInfo: 'Info page',
    pageInfoDesc: 'Voir les détails de la page',
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

    // Extracción contenido
    contentExtractor: 'Extractor contenido',
    contentExtractorDesc: 'Extraer contenido de elementos',

    // Detector video
    videoSniffer: 'Detector video',
    videoSnifferDesc: 'Obtener direcciones reales de video',

    // Analizador enlaces
    linkAnalyzer: 'Analizador enlaces',
    linkAnalyzerDesc: 'Analizar validez de enlaces',

    // Info página
    pageInfo: 'Info página',
    pageInfoDesc: 'Ver detalles de la página',
  },
}
