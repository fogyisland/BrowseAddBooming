# 小铭助手 (Xiao Ming Assistant)

一款功能强大的 Chrome 扩展助手，基于 AI 的页面分析和文本优化工具，支持多种实用功能。

[English](#english) | [中文](#中文)

---

## 功能特性

### 1. 📝 文本优化
- **AI 文本优化**: 选中页面文字后，一键优化表达
- 支持多种优化风格
- 快速生成高质量内容

### 2. 🔍 页面分析
- **页面安全分析**: 检测 XSS、CSRF、敏感信息泄露等安全风险
- **链接分析**: 分析页面所有链接的有效性
- **资源分析**: 查看页面加载的各类资源

### 3. 🌐 网络工具

#### 域名查询
- 支持查询 A、AAAA、CNAME、MX、TXT、NS、SOA 等 DNS 记录
- 多 DNS 服务商支持：阿里云、腾讯 DNSPod、Google
- **反向 DNS 查询**: IP 地址反查域名
- MX、TXT、NS 记录自动使用根域名查询
- DNS 服务商一键切换

#### Whois 查询
- 查询域名注册详细信息
- 注册商、注册日期、到期日期
- DNS 服务器、域名状态
- 注册人/联系人信息
- **网站排名**: 支持百度权重、Alexa 排名

#### 邮件头解析
- 自动解析邮件头信息
- SPF、DKIM、DMARC 验证
- **Debug 模式**: 邮件问题诊断、发送路径分析
- 发件人/收件人详情

#### URL 解码
- 支持 Base64、URL 编码、Hex、Unicode 解码
- 链接还原（url=、target= 等）
- 编码检测与自动识别

### 4. 🎬 内容提取

#### 视频嗅探
- 自动检测页面视频资源
- 支持多种视频格式
- 一键复制视频地址

#### 管理地址嗅探
- 自动扫描网站管理后台地址
- 404/重定向过滤
- **网络连接图**: 可视化展示页面结构
  - 列表视图
  - 树形视图
  - 节点视图
- **配置信息提取**: 检测代码中的 API Key、数据库连接字符串等敏感信息

#### 内容提取器
- 灵活提取页面元素
- 支持自定义选择器

### 5. 📊 数据解析器
- **JSON/XML 解析**: 支持上传文件或粘贴内容
- **格式转换**: 一键转换为 CSV、XLSX、JSON
- 数据预览与复制

### 6. 🌍 多语言支持
- 中文 (简体/繁体)
- English
- Français
- Español

---

## 安装使用

### 安装步骤

1. **下载/克隆项目**
   ```bash
   git clone https://github.com/fogyisland/BrowseAddBooming.git
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **构建项目**
   ```bash
   npm run build
   ```

4. **加载扩展到 Chrome**
   - 打开 Chrome，访问 `chrome://extensions/`
   - 开启右上角 **开发者模式**
   - 点击 **加载已解压的扩展程序**
   - 选择项目中的 `dist` 文件夹

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Shift+A` | 分析当前页面 |
| `Ctrl+Shift+J` | 优化选中文本 |

---

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **AI 集成**: 支持多种 AI API 配置
- **API**: RESTful API 集成

---

## 项目结构

```
browserADDIN/
├── src/
│   ├── components/          # React 组件
│   │   ├── AdminSniffer.tsx    # 管理地址嗅探
│   │   ├── ContentExtractor.tsx # 内容提取
│   │   ├── DataParser.tsx      # 数据解析器
│   │   ├── DomainLookup.tsx    # 域名查询
│   │   ├── EmailHeaderParser.tsx # 邮件头解析
│   │   ├── LinkAnalyzer.tsx    # 链接分析
│   │   ├── NetworkAnalyzer.tsx # 网络分析
│   │   ├── PageAnalysis.tsx    # 页面分析
│   │   ├── PageInfo.tsx        # 页面信息
│   │   ├── Popup.tsx           # 弹窗主界面
│   │   ├── ResourceAnalyzer.tsx # 资源分析
│   │   ├── SecurityAnalyzer.tsx # 安全分析
│   │   ├── Settings.tsx        # 设置
│   │   ├── SidePanel.tsx       # 侧边栏
│   │   ├── TextGenerator.tsx   # 文本生成
│   │   ├── TextOptimizer.tsx   # 文本优化
│   │   ├── UrlDecoder.tsx       # URL 解码
│   │   ├── VideoSniffer.tsx    # 视频嗅探
│   │   └── WhoisLookup.tsx     # Whois 查询
│   ├── i18n/
│   │   └── translations.ts     # 多语言翻译
│   ├── App.tsx             # 主应用
│   └── main.tsx            # 入口文件
├── public/
│   ├── background.js      # 后台脚本
│   └── content.js         # 内容脚本
├── dist/                  # 构建输出目录
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 开发指南

### 本地开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 类型检查
npm run typecheck

# 构建生产版本
npm run build
```

### 添加新功能

1. 在 `src/components/` 创建新组件
2. 在 `src/i18n/translations.ts` 添加多语言支持
3. 在 `Popup.tsx` 和 `SidePanel.tsx` 中注册新页面
4. 更新 `App.tsx` 中的路由配置

---

## 配置说明

### AI API 设置
首次使用需要在设置中配置 AI API：
- API 地址
- API Key
- 模型选择

支持的 AI 提供商:
- OpenAI (GPT 系列)
- Anthropic (Claude 系列)
- 自定义 API

---

## 更新日志

### v1.0.0
- 初始版本发布
- 文本优化与分析功能
- 页面安全分析
- DNS/Whois 查询
- 邮件头解析
- URL 解码
- 数据解析器
- 多语言支持 (5 种语言)

---

## 许可证

MIT License

---

## 联系方式

- GitHub: https://github.com/fogyisland/BrowseAddBooming

---

# English

## Xiao Ming Assistant

A powerful Chrome extension assistant with AI-based page analysis and text optimization tools.

### Features

1. **Text Optimization** - AI-powered text enhancement
2. **Page Analysis** - Security and resource analysis
3. **Domain Tools** - DNS lookup, Whois query, Reverse DNS
4. **Email Parser** - Header analysis with SPF/DKIM validation
5. **URL Decoder** - Base64, URL encode, Hex, Unicode decoding
6. **Video Sniffer** - Detect and extract video URLs
7. **Admin Scanner** - Find admin pages with network visualization
8. **Data Parser** - JSON/XML to CSV/XLSX conversion
9. **Multi-language** - Support for 5 languages

### Installation

1. Clone the repository
2. Run `npm install`
3. Run `npm run build`
4. Load the `dist` folder in Chrome extensions

### Keyboard Shortcuts

| Shortcut | Function |
|----------|----------|
| `Ctrl+Shift+A` | Analyze current page |
| `Ctrl+Shift+J` | Optimize selected text |

---

Made with ❤️ by [fogyisland](https://github.com/fogyisland)
