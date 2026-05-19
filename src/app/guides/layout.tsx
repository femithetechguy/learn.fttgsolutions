import type { Metadata } from 'next'
import content from '@/lib/content'

const title       = `${content.articles.title} — FTTG Learn`
const description = content.articles.subtitle
const imageUrl    = '/guides/opengraph-image'

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: 'website',
    images: [{ url: imageUrl, width: 1200, height: 630, alt: content.articles.title }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [imageUrl],
  },
}

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
