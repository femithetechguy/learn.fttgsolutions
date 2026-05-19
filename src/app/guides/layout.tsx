import type { Metadata } from 'next'
import content from '@/lib/content'

export const metadata: Metadata = {
  title: `${content.articles.title} — FTTG Learn`,
  description: content.articles.subtitle,
  openGraph: {
    title: `${content.articles.title} — FTTG Learn`,
    description: content.articles.subtitle,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${content.articles.title} — FTTG Learn`,
    description: content.articles.subtitle,
  },
}

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
