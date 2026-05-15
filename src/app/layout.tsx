import type { Metadata } from 'next'
import './globals.css'
import content from '@/lib/content'

export const metadata: Metadata = {
  title: content.meta.title,
  description: content.meta.description,
  keywords: content.meta.keywords,
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    title: content.meta.og.title,
    description: content.meta.og.description,
    siteName: content.meta.og.siteName,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
