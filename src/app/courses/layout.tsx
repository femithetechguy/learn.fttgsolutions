import type { Metadata } from 'next'
import content from '@/lib/content'

export const metadata: Metadata = {
  title: `${content.courses.title} — FTTG Learn`,
  description: content.courses.subtitle,
  openGraph: {
    title: `${content.courses.title} — FTTG Learn`,
    description: content.courses.subtitle,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${content.courses.title} — FTTG Learn`,
    description: content.courses.subtitle,
  },
}

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
