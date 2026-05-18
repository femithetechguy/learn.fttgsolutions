import type { Metadata } from 'next'
import content from '@/lib/content'

export const metadata: Metadata = {
  title: `${content.resources.title} — FTTG Learn`,
  description: content.resources.subtitle,
  openGraph: {
    title: `${content.resources.title} — FTTG Learn`,
    description: content.resources.subtitle,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${content.resources.title} — FTTG Learn`,
    description: content.resources.subtitle,
  },
}

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
