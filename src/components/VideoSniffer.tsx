import { useState, useEffect } from 'react'

interface VideoInfo {
  url: string
  type: string
  source: string
  quality?: string
}

interface VideoSnifferProps {
  onBack: () => void
}

export default function VideoSniffer({ onBack }: VideoSnifferProps) {
  const [videos, setVideos] = useState<VideoInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [sniffing, setSniffing] = useState(false)
  const [error, setError] = useState('')
  const [isYouTube, setIsYouTube] = useState(false)
  const [isBilibili, setIsBilibili] = useState(false)

  // 嗅探视频地址
  const sniffVideos = async () => {
    setLoading(true)
    setSniffing(true)
    setError('')
    setVideos([])

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab.id) {
        setError('无法获取当前标签页')
        setLoading(false)
        return
      }

      // 首先获取已监控的网络请求（媒体文件）
      let networkMediaUrls: VideoInfo[] = []
      try {
        const networkData = await chrome.runtime.sendMessage({ action: 'getNetworkData' })
        if (networkData?.networkRequests) {
          // 筛选媒体请求
          const mediaExtensions = ['.mp4', '.webm', '.m3u8', '.ts', '.flv', '.mp3', '.wav', '.ogg', '.aac', '.m4a', '.mkv']
          networkData.networkRequests.forEach((req: any) => {
            if (req.url) {
              const urlLower = req.url.toLowerCase()
              const isMedia = mediaExtensions.some(ext => urlLower.includes(ext)) ||
                            req.type === 'media' ||
                            req.type === 'video' ||
                            req.type === 'audio'
              if (isMedia) {
                networkMediaUrls.push({
                  url: req.url,
                  type: 'network_media',
                  source: `网络请求 (${req.status || 'unknown'})`,
                  quality: req.size ? `${Math.round(req.size / 1024)}KB` : undefined
                })
              }
            }
          })
        }
      } catch (e) {
        console.log('No network data available')
      }

      // 如果找到网络请求中的媒体，先显示这些
      if (networkMediaUrls.length > 0) {
        setVideos(networkMediaUrls)
        setLoading(false)
        setSniffing(false)
        return
      }

      // 如果没有网络请求数据，继续页面嗅探

      if (tab.url?.startsWith('chrome://')) {
        setError('无法分析 Chrome 内部页面')
        setLoading(false)
        return
      }

      // 在页面中执行脚本嗅探视频
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const videoUrls: VideoInfo[] = []

          // 1. 查找 video 标签
          const videoElements = document.querySelectorAll('video')
          videoElements.forEach((video: Element) => {
            const htmlVideo = video as HTMLVideoElement
            const src = htmlVideo.src || htmlVideo.currentSrc
            if (src) {
              videoUrls.push({
                url: src,
                type: 'video',
                source: 'video标签'
              })
            }

            // 查找 source 子元素
            const sources = video.querySelectorAll('source')
            sources.forEach((source: Element) => {
              const htmlSource = source as HTMLSourceElement
              const src = htmlSource.src || htmlSource.getAttribute('src')
              if (src && !videoUrls.some(v => v.url === src)) {
                videoUrls.push({
                  url: src,
                  type: htmlSource.type || 'video',
                  source: 'video > source'
                })
              }
            })
          })

          // 2. 查找嵌入的 iframe 中的视频
          const iframes = document.querySelectorAll('iframe[src*="video"], iframe[src*="player"], iframe[src*="bilibili"]')
          iframes.forEach((iframe: Element) => {
            const htmlIframe = iframe as HTMLIFrameElement
            const src = htmlIframe.src
            if (src && !videoUrls.some(v => v.url === src)) {
              videoUrls.push({
                url: src,
                type: 'iframe',
                source: 'iframe嵌入'
              })
            }
          })

          // 3. 查找 m3u8 播放列表
          const m3u8Links = document.querySelectorAll('a[href*=".m3u8"], a[href*="m3u8?"]')
          m3u8Links.forEach(link => {
            const href = (link as HTMLAnchorElement).href
            if (href && !videoUrls.some(v => v.url === href)) {
              videoUrls.push({
                url: href,
                type: 'm3u8',
                source: 'm3u8链接'
              })
            }
          })

          // 4. 查找包含视频 URL 的 script 标签
          const scripts = document.querySelectorAll('script')
          const videoPatterns = [
            /["']([^"']*\.m3u8[^"']*)["']/gi,
            /["']([^"']*\.mp4[^"']*)["']/gi,
            /["']([^"']*video[^"']*\.ts[^"']*)["']/gi,
            /url\s*:\s*["']([^"']+\.(m3u8|mp4|webm)[^"']*)["']/gi,
            /src\s*:\s*["']([^"']+\.(m3u8|mp4|webm)[^"']*)["']/gi,
            /file\s*:\s*["']([^"']+\.(m3u8|mp4|webm)[^"']*)["']/gi,
            /videoUrl\s*[:=]\s*["']([^"']+)["']/gi,
            /playUrl\s*[:=]\s*["']([^"']+)["']/gi
          ]

          scripts.forEach(script => {
            const text = script.textContent || ''
            videoPatterns.forEach(pattern => {
              let match
              while ((match = pattern.exec(text)) !== null) {
                const url = match[1]
                if (url && !videoUrls.some(v => v.url === url)) {
                  let type = 'm3u8'
                  if (url.includes('.mp4')) type = 'mp4'
                  else if (url.includes('.webm')) type = 'webm'
                  else if (url.includes('.ts')) type = 'ts'

                  videoUrls.push({
                    url,
                    type,
                    source: 'script脚本'
                  })
                }
              }
            })
          })

          // 5. 查找 JSON 配置中的视频 URL
          const jsonScripts = document.querySelectorAll('script:contains("player")')
          jsonScripts.forEach(script => {
            const text = script.textContent || ''
            try {
              // 尝试提取 JSON
              const jsonMatch = text.match(/\{[^{}]*(?:player|video|playUrl|videoUrl)[^{}]*\}/gi)
              if (jsonMatch) {
                jsonMatch.forEach(jsonStr => {
                  const urlMatch = jsonStr.match(/["']([^"']+\.(m3u8|mp4|webm)[^"']*)["']/i)
                  if (urlMatch && !videoUrls.some(v => v.url === urlMatch[1])) {
                    videoUrls.push({
                      url: urlMatch[1],
                      type: 'json',
                      source: 'JSON配置'
                    })
                  }
                })
              }
            } catch (e) {
              // 忽略解析错误
            }
          })

          // 6. 查找 data 属性中的视频
          const dataVideoElements = document.querySelectorAll('[data-video], [data-src], [data-url], [data-video-src]')
          dataVideoElements.forEach(el => {
            const url = el.getAttribute('data-video') ||
                       el.getAttribute('data-src') ||
                       el.getAttribute('data-url') ||
                       el.getAttribute('data-video-src')
            if (url && !videoUrls.some(v => v.url === url)) {
              videoUrls.push({
                url,
                type: 'data属性',
                source: 'data属性'
              })
            }
          })

          // 7. Bilibili (B站) 特殊处理
          const isBilibili = window.location.hostname.includes('bilibili.com') ||
                            window.location.hostname.includes('b23.tv')
          if (isBilibili) {
            // 查找 B站 playInfo
            const btScripts = document.querySelectorAll('script')
            btScripts.forEach(script => {
              const text = script.textContent || ''

              // 查找 window.__playinfo__ (DASH 格式)
              const playInfoMatch = text.match(/window\.__playinfo__\s*=\s*(\{.+?})\s*;/s)
              if (playInfoMatch) {
                try {
                  const playInfo = JSON.parse(playInfoMatch[1])
                  const dash = playInfo.data?.dash

                  if (dash) {
                    // 获取视频
                    if (dash.video) {
                      dash.video.forEach((item: any) => {
                        if (item.baseUrl && !videoUrls.some(v => v.url === item.baseUrl)) {
                          videoUrls.push({
                            url: item.baseUrl,
                            type: 'bilibili_dash_video',
                            source: 'B站 DASH 视频',
                            quality: item.id ? 'ID:' + item.id : ''
                          })
                        }
                      })
                    }

                    // 获取音频
                    if (dash.audio) {
                      dash.audio.forEach((item: any) => {
                        if (item.baseUrl && !videoUrls.some(v => v.url === item.baseUrl)) {
                          videoUrls.push({
                            url: item.baseUrl,
                            type: 'bilibili_dash_audio',
                            source: 'B站 DASH 音频'
                          })
                        }
                      })
                    }
                  }

                  // 旧版 FLV 格式
                  if (playInfo.data?.durl) {
                    playInfo.data.durl.forEach((item: any) => {
                      if (item.url && !videoUrls.some(v => v.url === item.url)) {
                        videoUrls.push({
                          url: item.url,
                          type: 'bilibili_flv',
                          source: 'B站 FLV',
                          quality: item.order ? '分段' + item.order : ''
                        })
                      }
                    })
                  }
                } catch (e) {
                  console.log('Parse B站 playInfo error:', e)
                }
              }

              // 查找 window.__playbackData__ (备用)
              const playbackDataMatch = text.match(/window\.__playbackData__\s*=\s*(\{.+?})\s*;/s)
              if (playbackDataMatch) {
                try {
                  const playbackData = JSON.parse(playbackDataMatch[1])
                  // 尝试获取视频信息
                  if (playbackData.videoData?.dash) {
                    const dash = playbackData.videoData.dash
                    if (dash.video) {
                      dash.video.forEach((item: any) => {
                        if (item.baseUrl && !videoUrls.some(v => v.url === item.baseUrl)) {
                          videoUrls.push({
                            url: item.baseUrl,
                            type: 'bilibili_dash_video',
                            source: 'B站 playbackData'
                          })
                        }
                      })
                    }
                  }
                } catch (e) {
                  console.log('Parse B站 playbackData error:', e)
                }
              }

              // 查找 m3u8 链接
              const m3u8Match = text.match(/(https?:\/\/[^\s"']+\.m3u8[^\s"']*)/g)
              if (m3u8Match) {
                m3u8Match.forEach((url: string) => {
                  if (!videoUrls.some(v => v.url === url)) {
                    videoUrls.push({
                      url,
                      type: 'bilibili_m3u8',
                      source: 'B站 m3u8'
                    })
                  }
                })
              }
            })

            // 查找 video 标签
            const bilibiliVideo = document.querySelector('video')
            if (bilibiliVideo) {
              const bVideo = bilibiliVideo as HTMLVideoElement
              if (bVideo.src && !videoUrls.some(v => v.url === bVideo.src)) {
                videoUrls.push({
                  url: bVideo.src,
                  type: 'bilibili_video_tag',
                  source: 'B站 video标签'
                })
              }
            }

            // 添加下载提示
            const bvidMatch = window.location.href.match(/BV[\w]+/)
            if (bvidMatch) {
              videoUrls.push({
                url: `yt-dlp "https://www.bilibili.com/video/${bvidMatch[0]}"`,
                type: 'bilibili_cmd',
                source: '推荐使用 yt-dlp 下载'
              })
              videoUrls.push({
                url: `you-get "https://www.bilibili.com/video/${bvidMatch[0]}"`,
                type: 'bilibili_cmd',
                source: '或使用 you-get'
              })
            }
          }

          // 8. YouTube 特殊处理
          const isYouTube = window.location.hostname.includes('youtube.com') ||
                           window.location.hostname.includes('youtu.be')
          if (isYouTube) {
            // 1. 直接从 video 标签获取 (如果有的话)
            const ytVideo = document.querySelector('video.html5-main-video') ||
                           document.querySelector('video')
            if (ytVideo) {
              const htmlVideo = ytVideo as HTMLVideoElement
              if (htmlVideo.src && htmlVideo.src.startsWith('http')) {
                videoUrls.push({
                  url: htmlVideo.src,
                  type: 'youtube_video',
                  source: 'video 标签 (当前播放)'
                })
              }
            }

            // 2. 尝试从 player response 获取
            const ytScripts = document.querySelectorAll('script')
            ytScripts.forEach(script => {
              const text = script.textContent || ''
              // 查找 ytInitialPlayerResponse
              const playerResponseMatch = text.match(/ytInitialPlayerResponse\s*=\s*(\{.+?});/s)
              if (playerResponseMatch) {
                try {
                  const playerResponse = JSON.parse(playerResponseMatch[1])
                  const streamingData = playerResponse.streamingData

                  if (streamingData) {
                    // 获取formats
                    if (streamingData.formats) {
                      streamingData.formats.forEach((format: any) => {
                        if (format.url && !videoUrls.some(v => v.url === format.url)) {
                          videoUrls.push({
                            url: format.url,
                            type: 'youtube',
                            source: 'YouTube direct'
                          })
                        }
                      })
                    }

                    // 获取adaptiveFormats (多质量)
                    if (streamingData.adaptiveFormats) {
                      streamingData.adaptiveFormats.forEach((format: any) => {
                        if (format.url && !videoUrls.some(v => v.url === format.url)) {
                          videoUrls.push({
                            url: format.url,
                            type: 'youtube_adaptive',
                            source: 'YouTube adaptive',
                            quality: format.qualityLabel || format.height + 'p'
                          })
                        }
                        // 查找 signatureCipher (加密的签名)
                        if (format.signatureCipher && !videoUrls.some(v => v.url === format.signatureCipher)) {
                          // 尝试解析 signatureCipher
                          const params = new URLSearchParams(format.signatureCipher)
                          const s = params.get('s')
                          const sp = params.get('sp')
                          if (s) {
                            videoUrls.push({
                              url: `youtube://signatureCipher?s=${s.substring(0, 20)}...&sp=${sp}`,
                              type: 'youtube_encrypted',
                              source: 'YouTube加密签名(需 yt-dlp)',
                              quality: format.qualityLabel || format.height + 'p'
                            })
                          }
                        }
                      })
                    }
                  }
                } catch (e) {
                  console.log('Parse player response error:', e)
                }
              }

              // 查找 ytInitialData
              const initialDataMatch = text.match(/ytInitialData\s*=\s*(\{.+?});/s)
              if (initialDataMatch) {
                try {
                  // 尝试获取视频ID
                  const videoIdMatch = window.location.href.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
                  if (videoIdMatch) {
                    videoUrls.push({
                      url: `https://www.youtube.com/watch?v=${videoIdMatch[1]}`,
                      type: 'youtube',
                      source: 'YouTube Video URL'
                    })
                    // 获取视频标题
                    const titleMatch = text.match(/"title"\s*:\s*"([^"]+)"/)
                    if (titleMatch) {
                      videoUrls.push({
                        url: `视频标题: ${titleMatch[1]}`,
                        type: 'youtube_info',
                        source: '视频信息'
                      })
                    }
                  }
                } catch (e) {
                  console.log('Parse initial data error:', e)
                }
              }
            })

            // 查找 video 标签的 src (YouTube iframe 模式) - 已在上方检查
          }

          return videoUrls
        }
      })

      let foundVideos = results?.[0]?.result || []

      // 如果是 YouTube 但没有找到视频，添加下载命令
      const isYT = tab.url?.includes('youtube.com') || tab.url?.includes('youtu.be')
      if (isYT) {
        const videoIdMatch = tab.url?.match(/(?:v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/)
        if (videoIdMatch && foundVideos.length === 0) {
          // 没有找到视频链接，添加下载命令
          foundVideos = [
            {
              url: `yt-dlp "https://www.youtube.com/watch?v=${videoIdMatch[1]}"`,
              type: 'youtube_cmd',
              source: '推荐 yt-dlp 下载'
            },
            {
              url: `yt-dlp -f "best" "https://www.youtube.com/watch?v=${videoIdMatch[1]}"`,
              type: 'youtube_cmd',
              source: '下载最佳质量'
            },
            {
              url: `视频ID: ${videoIdMatch[1]}`,
              type: 'youtube_info',
              source: '视频ID'
            },
            {
              url: '提示: YouTube 视频数据通过 JavaScript 动态加载，浏览器无法直接获取',
              type: 'youtube_info',
              source: '提示'
            }
          ]
        }
      }

      // 如果是 B站 但没有找到视频，添加下载命令
      const isBT = tab.url?.includes('bilibili.com') || tab.url?.includes('b23.tv')
      if (isBT) {
        const bvidMatch = tab.url?.match(/BV[\w]+/)
        if (bvidMatch && foundVideos.length === 0) {
          foundVideos = [
            {
              url: `yt-dlp "https://www.bilibili.com/video/${bvidMatch[0]}"`,
              type: 'bilibili_cmd',
              source: '推荐 yt-dlp 下载'
            },
            {
              url: `you-get "https://www.bilibili.com/video/${bvidMatch[0]}"`,
              type: 'bilibili_cmd',
              source: '或使用 you-get'
            },
            {
              url: `视频ID: ${bvidMatch[0]}`,
              type: 'bilibili_info',
              source: '视频ID'
            }
          ]
        }
      }

      setVideos(foundVideos)
      setIsYouTube(!!isYT)

      // isBT 已在上面定义
      setIsBilibili(!!(tab.url?.includes('bilibili.com') || tab.url?.includes('b23.tv')))

      if (foundVideos.length === 0) {
        if (isYT) {
          setError('YouTube 视频地址已加密，建议使用 yt-dlp 下载')
        } else if (isBT) {
          setError('B站视频需要登录才能获取高清资源，建议使用 yt-dlp 下载')
        } else {
          setError('未找到视频地址，可能该页面没有视频或视频通过特殊方式加载')
        }
      }
    } catch (err) {
      console.error('Sniff error:', err)
      setError('嗅探失败: ' + (err instanceof Error ? err.message : '未知错误'))
    } finally {
      setLoading(false)
      setSniffing(false)
    }
  }

  // 复制 URL
  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
  }

  // 打开 URL
  const openUrl = (url: string) => {
    window.open(url, '_blank')
  }

  // 获取类型图标
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'm3u8': return '📺'
      case 'mp4': return '🎬'
      case 'webm': return '🎥'
      case 'ts': return '📹'
      case 'video': return '🎞️'
      case 'iframe': return '🖼️'
      case 'network_media': return '🌐'
      // B站
      case 'bilibili_dash_video': return '🟣'
      case 'bilibili_dash_audio': return '🟣'
      case 'bilibili_flv': return '🟣'
      case 'bilibili_m3u8': return '🟣'
      case 'bilibili_video_tag': return '🟣'
      case 'bilibili_cmd': return '💻'
      // YouTube
      case 'youtube':
      case 'youtube_adaptive':
      case 'youtube_video': return '🔴'
      case 'youtube_encrypted': return '🔐'
      case 'youtube_cmd': return '💻'
      case 'youtube_info': return 'ℹ️'
      default: return '📁'
    }
  }

  // 获取类型颜色
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'm3u8': return 'bg-red-100 text-red-800'
      case 'network_media': return 'bg-cyan-100 text-cyan-800'
      // B站
      case 'bilibili_dash_video':
      case 'bilibili_dash_audio':
      case 'bilibili_flv':
      case 'bilibili_m3u8':
      case 'bilibili_video_tag':
      case 'bilibili_cmd': return 'bg-purple-100 text-purple-800'
      case 'youtube':
      case 'youtube_adaptive':
      case 'youtube_video':
      case 'youtube_cmd': return 'bg-red-100 text-red-800'
      case 'youtube_info': return 'bg-blue-100 text-blue-800'
      case 'youtube_encrypted': return 'bg-yellow-100 text-yellow-800'
      case 'mp4': return 'bg-blue-100 text-blue-800'
      case 'webm': return 'bg-green-100 text-green-800'
      case 'ts': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  useEffect(() => {
    // 页面加载时自动嗅探
    sniffVideos()
  }, [])

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 text-xl">←</button>
        <h2 className="text-lg font-semibold">视频地址嗅探</h2>
        <button
          onClick={sniffVideos}
          disabled={loading}
          className="ml-auto px-3 py-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white text-sm rounded"
        >
          {loading ? '嗅探中...' : '重新嗅探'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">{error}</p>
        </div>
      )}

      {/* YouTube 特别提示 */}
      {isYouTube && videos.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🔴</span>
            <span className="font-medium text-red-800">YouTube 视频提示</span>
          </div>
          <ul className="text-xs text-red-700 space-y-1">
            <li>• YouTube 视频使用加密签名保护，无法直接获取原始地址</li>
            <li>• 推荐使用 <strong>yt-dlp</strong> 下载（最强大）</li>
            <li>• 安装: <code className="bg-red-100 px-1 rounded">pip install yt-dlp</code></li>
            <li>• Windows: 下载 yt-dlp.exe 放到 PATH 环境变量目录</li>
            <li>• 付费/年龄限制视频需要Cookie: <code className="bg-red-100 px-1 rounded">--cookies-from-browser chrome</code></li>
            <li className="mt-2 font-medium">备用方案:</li>
            <li>• <a href="https://y2mate.com" target="_blank" rel="noopener noreferrer" className="underline">y2mate.com</a> - 在线解析下载</li>
            <li>• <a href="https://github.com/yt-dlp/yt-dlp" target="_blank" rel="noopener noreferrer" className="underline">yt-dlp GitHub</a> - 获取最新版本</li>
          </ul>
        </div>
      )}

      {/* Bilibili (B站) 特别提示 */}
      {isBilibili && videos.length > 0 && (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🟣</span>
            <span className="font-medium text-purple-800">B站 视频提示</span>
          </div>
          <ul className="text-xs text-purple-700 space-y-1">
            <li>• B站使用 DASH 流媒体技术，视频分段存储</li>
            <li>• 视频地址可能有防盗链限制，直接访问可能失败</li>
            <li>• 推荐使用 <strong>yt-dlp</strong> 下载（支持B站）</li>
            <li>• 安装 yt-dlp: <code className="bg-purple-100 px-1 rounded">pip install yt-dlp</code></li>
            <li>• 下载命令: <code className="bg-purple-100 px-1 rounded">yt-dlp "B站视频URL"</code></li>
            <li>• 也可使用 <strong>you-get</strong>: <code className="bg-purple-100 px-1 rounded">you-get "URL"</code></li>
          </ul>
        </div>
      )}

      {sniffing && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg text-center">
          <div className="animate-pulse text-blue-600">正在嗅探视频地址...</div>
        </div>
      )}

      {/* 统计信息 */}
      {videos.length > 0 && (
        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="p-2 bg-gray-50 rounded text-center">
            <div className="text-lg font-semibold text-gray-800">{videos.length}</div>
            <div className="text-xs text-gray-500">视频数</div>
          </div>
          <div className="p-2 bg-gray-50 rounded text-center">
            <div className="text-lg font-semibold text-gray-800">
              {videos.filter(v => v.type === 'm3u8').length}
            </div>
            <div className="text-xs text-gray-500">m3u8</div>
          </div>
          <div className="p-2 bg-gray-50 rounded text-center">
            <div className="text-lg font-semibold text-gray-800">
              {videos.filter(v => v.type === 'mp4').length}
            </div>
            <div className="text-xs text-gray-500">mp4</div>
          </div>
        </div>
      )}

      {/* 视频列表 */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {videos.map((video, index) => (
          <div key={index} className="p-3 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{getTypeIcon(video.type)}</span>
              <span className={`px-2 py-0.5 rounded text-xs ${getTypeColor(video.type)}`}>
                {video.type.toUpperCase()}
              </span>
              <span className="text-xs text-gray-500">{video.source}</span>
            </div>
            <div className="text-sm font-mono text-gray-700 break-all mb-2">{video.url}</div>
            <div className="flex gap-2">
              <button
                onClick={() => copyUrl(video.url)}
                className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
              >
                复制
              </button>
              <button
                onClick={() => openUrl(video.url)}
                className="px-2 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded"
              >
                打开
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 使用说明 */}
      {videos.length === 0 && !loading && !error && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">使用说明</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• 自动扫描页面中的 video 标签和嵌入的视频</li>
            <li>• 查找 m3u8 播放列表地址</li>
            <li>• 解析页面脚本中的视频 URL</li>
            <li>• 适用于 B站、抖音等主流视频平台</li>
            <li>• m3u8 地址可使用 yt-dlp 或 N_m3u8DL 下载</li>
          </ul>
        </div>
      )}
    </div>
  )
}
