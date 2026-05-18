import type { Metadata } from 'next'
import content from '@/lib/content'

export const metadata: Metadata = {
  title: `${content.courses.title} — FTTG Learn`,
  description: content.courses.subtitle,
  keywords: ['online courses', 'Power BI course', 'Python course', 'Next.js course', 'DAX course', 'NestJS', 'full-stack development', 'data engineering', 'FTTG Learn'],
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
