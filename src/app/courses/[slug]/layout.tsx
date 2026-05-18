import fs from 'fs'
import path from 'path'
import type { CourseDetail } from '@/components/CourseBlackboard'

export default function CourseSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { slug: string }
}) {
  const filePath = path.join(process.cwd(), 'data', 'courses', 'detail', `${params.slug}.json`)
  const course: CourseDetail | null = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    : null

  const jsonLd = course ? {
    '@context':   'https://schema.org',
    '@type':      'Course',
    name:         course.title,
    description:  course.subtitle,
    url:          `https://learn.fttgsolutions.com/courses/${params.slug}`,
    provider: {
      '@type': 'Organization',
      name:    'FTTG Solutions',
      url:     'https://learn.fttgsolutions.com',
    },
    educationalLevel: course.level,
    inLanguage:       'en',
    isAccessibleForFree: course.free,
  } : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  )
}
