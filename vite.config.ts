import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs'

function copyStaticFiles() {
  return {
    name: 'copy-static-files',
    closeBundle() {
      const distDir = resolve(__dirname, 'dist')
      const publicDir = resolve(__dirname, 'public')

      if (!existsSync(distDir)) {
        mkdirSync(distDir, { recursive: true })
      }

      // 复制静态文件
      copyFileSync(
        resolve(publicDir, 'manifest.json'),
        resolve(distDir, 'manifest.json')
      )

      copyFileSync(
        resolve(publicDir, 'background.js'),
        resolve(distDir, 'background.js')
      )

      // 读取构建后的 index.html 来获取正确的资源路径
      const indexHtml = readFileSync(resolve(distDir, 'index.html'), 'utf-8')

      // 从构建后的HTML中提取JS和CSS路径 (转为相对路径)
      const jsMatch = indexHtml.match(/src="([^"]+\.js)"/)
      const cssMatch = indexHtml.match(/href="([^"]+\.css)"/)

      // 移除前导斜杠，改为相对路径
      const jsPath = jsMatch ? jsMatch[1].replace(/^\//, '') : 'assets/index.js'
      const cssPath = cssMatch ? cssMatch[1].replace(/^\//, '') : 'assets/index.css'

      // 创建 sidepanel.html - Chrome扩展中不需要crossorigin
      const sidepanelHtml = `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI Assistant</title>
    <script type="module" src="${jsPath}"></script>
    <link rel="stylesheet" href="${cssPath}">
  </head>
  <body>
    <div id="root" data-mode="sidepanel"></div>
  </body>
</html>`

      writeFileSync(
        resolve(distDir, 'sidepanel.html'),
        sidepanelHtml
      )

      // 修复 index.html 中的路径
      let indexHtmlContent = readFileSync(resolve(distDir, 'index.html'), 'utf-8')
      indexHtmlContent = indexHtmlContent
        .replace(/src="\/assets\//g, 'src="assets/')
        .replace(/href="\/assets\//g, 'href="assets/')
        .replace(/crossorigin /g, '')
      writeFileSync(resolve(distDir, 'index.html'), indexHtmlContent)
    }
  }
}

export default defineConfig({
  plugins: [
    react(),
    copyStaticFiles()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
