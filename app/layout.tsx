import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RAG Demo - 检索增强生成演示',
  description: '一个使用 Next.js 构建的 RAG (Retrieval-Augmented Generation) 演示项目',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}

