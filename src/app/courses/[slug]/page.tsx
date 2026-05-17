import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import { marked } from 'marked'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Special_Elite } from 'next/font/google'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ScrollHomeButton from '@/components/ScrollHomeButton'
import CourseBlackboard, { CourseDetail } from '@/components/CourseBlackboard'
import { findLessonBySlug } from '@/lib/lesson-slug'

const chalkFont = Special_Elite({ weight: '400', subsets: ['latin'], variable: '--font-chalk' })

export default function CourseBoardPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { v?: string; m?: string }
}) {
  const filePath = path.join(process.cwd(), 'data', 'courses', 'detail', `${params.slug}.json`)
  if (!fs.existsSync(filePath)) notFound()

  const course: CourseDetail = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

  // Resolve linked markdown notes
  let notesHtml: string | null = null
  if (course.links) {
    const mdPath = path.join(process.cwd(), 'data', course.links)
    if (fs.existsSync(mdPath)) {
      notesHtml = marked.parse(fs.readFileSync(mdPath, 'utf-8')) as string
    }
  }

  // Pre-open a specific lesson (?v=) or module overview (?m=)
  const initialLesson = searchParams.v
    ? findLessonBySlug(course.modules, searchParams.v)
    : null
  const initialModule = searchParams.m
    ? (course.modules.find(m => m.id === searchParams.m) ?? null)
    : null

  return (
    <div className={`min-h-screen bg-bg-primary bg-grid ${chalkFont.variable}`}>
      <Nav />

      <div className="overflow-x-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">

          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 font-sans text-sm text-text-muted hover:text-text-secondary transition-colors mb-8"
          >
            <ArrowLeft size={13} />
            All Courses
          </Link>

          <CourseBlackboard course={course} initialLesson={initialLesson} initialModule={initialModule} />

          {notesHtml && (
            <div className="mt-14">
              <div className="gold-line mb-10" />
              <div
                className="article-body max-w-3xl"
                dangerouslySetInnerHTML={{ __html: notesHtml }}
              />
            </div>
          )}

        </div>
      </div>

      <ScrollHomeButton />
      <Footer />
    </div>
  )
}
