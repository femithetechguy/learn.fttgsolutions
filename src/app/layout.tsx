import type { Metadata } from 'next'
import './globals.css'
import content from '@/lib/content'

export const metadata: Metadata = {
  metadataBase: new URL('https://learn.fttgsolutions.com'),
  title: content.meta.title,
  description: content.meta.description,
  keywords: content.meta.keywords,
  openGraph: {
    title: content.meta.og.title,
    description: content.meta.og.description,
    siteName: content.meta.og.siteName,
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: content.meta.og.title,
    description: content.meta.og.description,
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
